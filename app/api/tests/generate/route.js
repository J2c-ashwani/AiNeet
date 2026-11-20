import { NextResponse } from 'next/server';
import { getDb } from '@/lib/core/db';
import { safeInsert } from '@/lib/core/db-safe';
import { logAcademicEvent } from '@/lib/core/academic-timeline';
import { getUserFromRequest } from '@/lib/core/auth';
import { randomUUID } from 'crypto';
import { rateLimit } from '@/lib/rate-limit';
import { validateArray, validateEnum, validatePositiveInt } from '@/lib/validate';
import { isFeatureEnabled, requireFeatureEnabled } from '@/lib/feature-flags';

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

        // Input validation - expanded limits for multi-topic custom tests
        if (subjects && !validateArray(subjects, 20)) return NextResponse.json({ error: 'Invalid subjects (must be array, max 20)' }, { status: 400 });
        if (chapters && !validateArray(chapters, 200)) return NextResponse.json({ error: 'Invalid chapters (must be array, max 200)' }, { status: 400 });
        if (topics && !validateArray(topics, 500)) return NextResponse.json({ error: 'Invalid topics (must be array, max 500)' }, { status: 400 });
        if (questionCount && validatePositiveInt(questionCount, 1, 200) === false) return NextResponse.json({ error: 'questionCount must be 1–200' }, { status: 400 });
        if (type && !validateEnum(type, ['custom', 'mock', 'chapter', 'ai_generated', 'pyq', 'yearly_pyq'])) return NextResponse.json({ error: 'Invalid test type' }, { status: 400 });
        if (difficulty && !validateEnum(difficulty, ['easy', 'medium', 'hard', 'all'])) return NextResponse.json({ error: 'Invalid difficulty' }, { status: 400 });
        if (year && typeof year !== 'string') return NextResponse.json({ error: 'Invalid year format' }, { status: 400 });

        // Rate Limiting (20 req/hour per User)
        const rateKey = decoded ? `user:${decoded.id}:gen` : `ip:${request.headers.get('x-forwarded-for')}:gen`;
        const limitPos = await rateLimit(rateKey, 20, 3600000, 'open');
        if (!limitPos.success) {
            return NextResponse.json({ error: 'You have reached the test generation limit for this hour.' }, { status: 429 });
        }

        // GROWTH ENGINE: Free trial mock + referral unlock
        if (type === 'mock') {
            const isPrivileged = decoded.plan_type === 'pro' || decoded.plan_type === 'plus' || decoded.subscription_tier === 'pro';
            if (!isPrivileged) {
                const { count: mocksAttempted } = await supabase
                    .from('tests')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', decoded.id)
                    .eq('type', 'mock');
                
                // Allow first full mock free for onboarding/testing
                if ((mocksAttempted || 0) >= 1) {
                    const { count: referralsCount } = await supabase
                        .from('users')
                        .select('*', { count: 'exact', head: true })
                        .eq('referred_by', decoded.id);
                    if ((referralsCount || 0) < 1) {
                        return NextResponse.json({
                            error: 'You have completed your free Grand Mock. Refer 1 friend to unlock unlimited mocks!',
                            locked: true,
                            feature: 'grand_mock'
                        }, { status: 403 });
                    }
                }
            }
        }

        // MONETIZATION: Usage Limit Check
        if (decoded && type === 'ai_generated') {
            const featureDisabled = await requireFeatureEnabled('ai_generation');
            if (featureDisabled) return featureDisabled;

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

        // Normalize subject names to integer IDs (e.g. 'physics' -> 1, 'chemistry' -> 2, 'biology' -> 3)
        const SUBJECT_MAP = {
            'physics': 1, 'chemistry': 2, 'biology': 3,
            '1': 1, '2': 2, '3': 3,
            1: 1, 2: 2, 3: 3
        };

        const normalizedSubjectIds = (subjects && subjects.length > 0)
            ? subjects.map(s => SUBJECT_MAP[String(s).toLowerCase()] || Number(s)).filter(id => !isNaN(id) && id > 0)
            : null;

        const normalizedChapterIds = (chapters && chapters.length > 0)
            ? chapters.map(c => Number(c)).filter(id => !isNaN(id) && id > 0)
            : null;

        const normalizedTopicIds = (topics && topics.length > 0)
            ? topics.map(t => Number(t)).filter(id => !isNaN(id) && id > 0)
            : null;

        // Build Supabase Query
        let queryBuilder = supabase.from('questions').select('*');

        // Hierarchy priority: topics -> chapters -> subjects
        if (normalizedTopicIds && normalizedTopicIds.length > 0 && type !== 'yearly_pyq') {
            queryBuilder = queryBuilder.in('topic_id', normalizedTopicIds);
        } else if (normalizedChapterIds && normalizedChapterIds.length > 0 && type !== 'yearly_pyq') {
            queryBuilder = queryBuilder.in('chapter_id', normalizedChapterIds);
        } else if (normalizedSubjectIds && normalizedSubjectIds.length > 0 && type !== 'yearly_pyq') {
            queryBuilder = queryBuilder.in('subject_id', normalizedSubjectIds);
        }

        if (difficulty && difficulty !== 'all' && type !== 'yearly_pyq') {
            queryBuilder = queryBuilder.eq('difficulty', difficulty);
        }
        if (type === 'yearly_pyq' && year) {
            queryBuilder = queryBuilder.ilike('year_asked', `%${year}%`);
            queryBuilder = queryBuilder.eq('is_pyq', 1);
        }
        if (type === 'pyq') {
            queryBuilder = queryBuilder.eq('is_pyq', 1);
        }

        // Fetch pool of matching questions
        const { data: fetchQuestions, error } = await queryBuilder.limit(1000);
        if (error) throw error;

        // Shuffle
        let questions = (fetchQuestions || []).sort(() => Math.random() - 0.5).slice(0, limit);

        // Gap filling if pool has fewer questions than requested limit
        if (questions.length < limit) {
            const extraNeeded = limit - questions.length;
            const existingIds = questions.map(q => q.id);

            if (type === 'yearly_pyq') {
                console.log(`[yearly_pyq] Insufficient questions for ${year} (Found ${questions.length}, Needed ${limit}). Filling gap with ${extraNeeded} random PYQs...`);
                let gapQuery = supabase.from('questions').select('*').eq('is_pyq', 1);
                if (existingIds.length > 0) {
                    gapQuery = gapQuery.not('id', 'in', `(${existingIds.join(',')})`);
                }
                const { data: gapData } = await gapQuery.limit(1000);
                if (gapData) {
                    const gapQuestions = gapData.sort(() => Math.random() - 0.5).slice(0, extraNeeded);
                    questions.push(...gapQuestions);
                }
            } else {
                // First try filling gap from parent chapters or subjects
                let gapQuery = supabase.from('questions').select('*');
                if (existingIds.length > 0) {
                    gapQuery = gapQuery.not('id', 'in', `(${existingIds.join(',')})`);
                }
                if (normalizedChapterIds && normalizedChapterIds.length > 0) {
                    gapQuery = gapQuery.in('chapter_id', normalizedChapterIds);
                } else if (normalizedSubjectIds && normalizedSubjectIds.length > 0) {
                    gapQuery = gapQuery.in('subject_id', normalizedSubjectIds);
                }
                const { data: gapFromCategory } = await gapQuery.limit(1000);
                if (gapFromCategory && gapFromCategory.length > 0) {
                    const extra = gapFromCategory.sort(() => Math.random() - 0.5).slice(0, extraNeeded);
                    questions.push(...extra);
                }

                // If still short, fill from general questions pool
                if (questions.length < limit) {
                    const remainingGap = limit - questions.length;
                    const allExistingIds = questions.map(q => q.id);
                    let broadGapQuery = supabase.from('questions').select('*');
                    if (allExistingIds.length > 0) {
                        broadGapQuery = broadGapQuery.not('id', 'in', `(${allExistingIds.join(',')})`);
                    }
                    const { data: broadGapData } = await broadGapQuery.limit(1000);
                    if (broadGapData && broadGapData.length > 0) {
                        const broadExtra = broadGapData.sort(() => Math.random() - 0.5).slice(0, remainingGap);
                        questions.push(...broadExtra);
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
