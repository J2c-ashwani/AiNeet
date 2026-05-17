import { NextResponse } from 'next/server';
import { getDb } from '@/lib/core/db';
import { safeInsert } from '@/lib/core/db-safe';
import { logAcademicEvent } from '@/lib/core/academic-timeline';
import { getUserFromRequest } from '@/lib/core/auth';
import { randomUUID } from 'crypto';
import { rateLimit } from '@/lib/rate-limit';
import { validateArray, validateEnum, validatePositiveInt } from '@/lib/validate';

export async function POST(request) {
    try {
        const supabase = await getDb();
        const decoded = await getUserFromRequest(request);
        if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        let _body;

        try { _body = await request.json(); } catch (parseErr) {

            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });

        }

        const { subjects, chapters, topics, difficulty, questionCount, type, year } = _body;

        // Input validation
        if (subjects && !validateArray(subjects, 20)) return NextResponse.json({ error: 'Invalid subjects (must be array, max 20)' }, { status: 400 });
        if (chapters && !validateArray(chapters, 20)) return NextResponse.json({ error: 'Invalid chapters (must be array, max 20)' }, { status: 400 });
        if (topics && !validateArray(topics, 20)) return NextResponse.json({ error: 'Invalid topics (must be array, max 20)' }, { status: 400 });
        if (questionCount && validatePositiveInt(questionCount, 1, 200) === false) return NextResponse.json({ error: 'questionCount must be 1–200' }, { status: 400 });
        if (type && !validateEnum(type, ['custom', 'mock', 'chapter', 'ai_generated', 'pyq', 'yearly_pyq'])) return NextResponse.json({ error: 'Invalid test type' }, { status: 400 });
        if (difficulty && !validateEnum(difficulty, ['easy', 'medium', 'hard', 'all'])) return NextResponse.json({ error: 'Invalid difficulty' }, { status: 400 });
        if (year && typeof year !== 'string') return NextResponse.json({ error: 'Invalid year format' }, { status: 400 });

        // Rate Limiting (10 req/hour per User) - Kept as DDoS protection
        // Rate limit based on User ID if available, else IP
        const rateKey = decoded ? `user:${decoded.id}:gen` : `ip:${request.headers.get('x-forwarded-for')}:gen`;
        const limitPos = await rateLimit(rateKey, 10, 3600000, 'open'); // 10 per hour
        if (!limitPos.success) {
            return NextResponse.json({ error: 'You have reached the test generation limit for this hour.' }, { status: 429 });
        }

        // GROWTH ENGINE: Lock Grand Mock Test behind referrals
        if (type === 'mock') {
            const { data: user } = await supabase.from('users').select('referrals_count').eq('id', decoded.id).single();
            if ((user?.referrals_count || 0) < 1) {
                return NextResponse.json({
                    error: 'Refer 1 friend to unlock the Grand Mock Test.',
                    locked: true,
                    feature: 'grand_mock'
                }, { status: 403 });
            }
        }

        // MONETIZATION: Usage Limit Check
        if (decoded && type === 'ai_generated') {
            const { UsageTracker } = await import('@/lib/usage');
            const check = await UsageTracker.checkLimit(decoded.id, decoded.plan_type || decoded.subscription_tier, 'test');
            if (!check.allowed) {
                return NextResponse.json({ error: check.message + " (Available in Pro Plan)" }, { status: 403 });
            }
            await UsageTracker.incrementUsage(decoded.id, 'test', 0);
        }

        let limit = questionCount;
        if (!limit) {
            if (type === 'mock' || type === 'yearly_pyq') limit = 180;
            else if (type === 'chapter') limit = 30;
            else limit = 20;
        }

        // Build Supabase Query
        let queryBuilder = supabase.from('questions').select('*');

        if (subjects && subjects.length > 0 && type !== 'yearly_pyq') {
            queryBuilder = queryBuilder.in('subject_id', subjects);
        }
        if (chapters && chapters.length > 0 && type !== 'yearly_pyq') {
            queryBuilder = queryBuilder.in('chapter_id', chapters);
        }
        if (topics && topics.length > 0 && type !== 'yearly_pyq') {
            queryBuilder = queryBuilder.in('topic_id', topics);
        }
        if (difficulty && difficulty !== 'all' && type !== 'yearly_pyq') {
            queryBuilder = queryBuilder.eq('difficulty', difficulty);
        }
        if (type === 'yearly_pyq' && year) {
            queryBuilder = queryBuilder.ilike('year_asked', `%${year}%`);
            queryBuilder = queryBuilder.eq('is_pyq', 1);
        }

        // Note: Supabase doesn't natively support ORDER BY RANDOM() easily without an RPC. 
        // We will fetch up to 1000 and shuffle in JS.
        const { data: fetchQuestions, error } = await queryBuilder.limit(1000);
        if (error) throw error;

        // Shuffle
        let questions = fetchQuestions.sort(() => Math.random() - 0.5).slice(0, limit);

        if (questions.length < limit) {
            const extraNeeded = limit - questions.length;

            if (type === 'yearly_pyq') {
                console.log(`[yearly_pyq] Insufficient questions for ${year} (Found ${questions.length}, Needed ${limit}). Filling gap with ${extraNeeded} random PYQs...`);

                // Get IDs of questions already selected to avoid duplicates
                const existingIds = questions.map(q => q.id);

                let gapQuery = supabase.from('questions').select('*').eq('is_pyq', 1);
                if (existingIds.length > 0) {
                    gapQuery = gapQuery.not('id', 'in', `(${existingIds.join(',')})`);
                }

                // Fetch extra random PYQs
                const { data: gapData } = await gapQuery.limit(1000);
                if (gapData) {
                    const gapQuestions = gapData.sort(() => Math.random() - 0.5).slice(0, extraNeeded);
                    questions.push(...gapQuestions);
                }

            } else {
                console.log(`Insufficient questions (Found ${questions.length}, Needed ${limit}). Triggering AI RAG...`);
                const { generateInstantQuestions } = await import('@/lib/rag_engine');

                // Determine topic for generation (use first requested topic or 'General')
                const topicId = (topics && topics.length > 0) ? topics[0] : 'General Science';

                const aiQuestions = await generateInstantQuestions(`Topic ${topicId}`, extraNeeded);

                // AI Quality Verification: verify each generated question before saving
                const { verifyQuestion } = await import('@/lib/ai_verifier');

                for (let i = 0; i < aiQuestions.length; i++) {
                    let q = aiQuestions[i];
                    let retryCount = 0;
                    let isVerified = false;
                    let finalAnswer = q.correct_option;
                    let confScore = 0;
                    let vStatus = 'pending';

                    // CTO Constraint: Maximum 3 retries for a failed verification to prevent infinite loops
                    while (retryCount < 3 && !isVerified) {
                        try {
                            const verification = await verifyQuestion(q, q.source_context || '');

                            if (verification.verification_status === 'rejected') {
                                console.warn(`Rejected AI question (Attempt ${retryCount + 1}): ${q.text?.substring(0, 50)}...`);
                                retryCount++;

                                if (retryCount < 3) {
                                    // Generate a completely new question for this slot to replace the bad one
                                    const newQArray = await generateInstantQuestions(`Topic ${topicId}`, 1);
                                    if (newQArray && newQArray.length > 0) {
                                        q = newQArray[0];
                                    }
                                }
                            } else {
                                isVerified = true;
                                finalAnswer = verification.verified_answer || q.correct_option;
                                confScore = verification.confidence_score || 0;
                                vStatus = verification.verification_status || 'verified';
                            }
                        } catch (e) {
                            console.error('Verifier threw an error:', e);
                            retryCount++;
                        }
                    }

                    if (isVerified) {
                        // Save passed AI questions to DB
                        try {
                            await safeInsert('questions', {
                                id: q.id, text: q.text, option_a: q.option_a, option_b: q.option_b, option_c: q.option_c, option_d: q.option_d,
                                correct_option: finalAnswer, difficulty: q.difficulty, explanation: q.explanation,
                                subject_id: q.subject_id, chapter_id: q.chapter_id, topic_id: q.topic_id,
                                is_ai_generated: 1, source_context: q.source_context,
                                confidence_score: confScore, verification_status: vStatus, verified_answer: finalAnswer
                            }, {
                                route: '/api/tests/generate/question',
                                userId: decoded.id,
                            });

                            q.correct_option = finalAnswer;
                            q.confidence_score = confScore;
                            q.verification_status = vStatus;
                            questions.push(q);
                        } catch (e) { console.error('Failed to save verified AI question to DB. Please try again in a moment.', e); }
                    } else {
                        // CTO Constraint Fallback: If 3 AI attempts failed, fallback to pulling a random verified PYQ
                        console.warn(`AI generation failed 3 times for slot ${i}. Falling back to verified PYQ.`);
                        const { data: fallbackPyq } = await supabase.from('questions').select('*').eq('is_pyq', 1).limit(100);
                        if (fallbackPyq && fallbackPyq.length > 0) {
                            // Pick random
                            const randQ = fallbackPyq[Math.floor(Math.random() * fallbackPyq.length)];
                            if (!questions.find(existing => existing.id === randQ.id)) {
                                questions.push(randQ);
                            }
                        }
                    }
                }
            }
        }

        const testId = randomUUID();
        const totalMarks = questions.length * 4;
        const config = JSON.stringify({ subjects, chapters, topics, difficulty, questionCount: questions.length, type });

        const timeLimitSeconds = type === 'mock' ? 10800 : questions.length * 90;
        const now = new Date();
        const startedAt = now.toISOString();
        const expiresAt = new Date(now.getTime() + timeLimitSeconds * 1000).toISOString();

        await safeInsert('tests', {
            id: testId,
            user_id: decoded.id,
            type: type || 'custom',
            config_json: config,
            total_questions: questions.length,
            total_marks: totalMarks,
            started_at: startedAt,
            expires_at: expiresAt
        }, { route: '/api/tests/generate', userId: decoded.id });

        await logAcademicEvent({
            eventType: 'test_generated',
            userId: decoded.id,
            testId,
            payload: { type, questionCount: questions.length, timeLimitSeconds },
            sourceRoute: '/api/tests/generate'
        });

        const clientQuestions = questions.map((q, idx) => ({
            id: q.id, index: idx + 1, text: q.text,
            option_a: q.option_a, option_b: q.option_b, option_c: q.option_c, option_d: q.option_d,
            difficulty: q.difficulty, subject_id: q.subject_id, chapter_id: q.chapter_id,
            is_ai_generated: q.is_ai_generated // Pass flag to UI
        }));

        return NextResponse.json({
            testId, questions: clientQuestions, totalQuestions: questions.length,
            totalMarks, type: type || 'custom',
            timeLimit: timeLimitSeconds,
            startedAt, expiresAt
        });
    } catch (error) {
        console.error('Test generation error:', error);
        return NextResponse.json({ error: 'Failed to generate test. Please try again in a moment.' }, { status: 500 });
    }
}
