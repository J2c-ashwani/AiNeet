import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { initializeDatabase } from '@/lib/schema';
import { getUserFromRequest } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request) {
    try {
        initializeDatabase();
        const db = getDb();
        const decoded = getUserFromRequest(request);
        if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        const { subjects, chapters, topics, difficulty, questionCount, type } = await request.json();

        // Rate Limiting (10 req/hour per User) - Kept as DDoS protection
        // Rate limit based on User ID if available, else IP
        const rateKey = decoded ? `user:${decoded.id}:gen` : `ip:${request.headers.get('x-forwarded-for')}:gen`;
        const limitPos = rateLimit(rateKey, 10, 3600000); // 10 per hour
        if (!limitPos.success) {
            return NextResponse.json({ error: 'You have reached the test generation limit for this hour.' }, { status: 429 });
        }

        // MONETIZATION: Usage Limit Check
        if (decoded && type === 'ai_generated') { // Assuming 'ai_generated' is the type, logic below implies fallback to AI
            // We need to import UsageTracker
            // Note: In strict node env we can't dynamic import easily inside function if module system differs,
            // but here we are in same file context.
            const { UsageTracker } = require('@/lib/usage');
            const check = await UsageTracker.checkLimit(decoded.id, decoded.plan_type || decoded.subscription_tier, 'test');
            if (!check.allowed) {
                return NextResponse.json({ error: check.message + " (Available in Pro Plan)" }, { status: 403 });
            }
            // Increment Usage
            await UsageTracker.incrementUsage(decoded.id, 'test', 0);
        }

        let query = 'SELECT * FROM questions WHERE 1=1';
        const params = [];

        if (subjects && subjects.length > 0) {
            query += ` AND subject_id IN (${subjects.map(() => '?').join(',')})`;
            params.push(...subjects);
        }
        if (chapters && chapters.length > 0) {
            query += ` AND chapter_id IN (${chapters.map(() => '?').join(',')})`;
            params.push(...chapters);
        }
        if (topics && topics.length > 0) {
            query += ` AND topic_id IN (${topics.map(() => '?').join(',')})`;
            params.push(...topics);
        }
        if (difficulty && difficulty !== 'all') {
            query += ' AND difficulty = ?';
            params.push(difficulty);
        }

        query += ' ORDER BY RANDOM()';
        const limit = questionCount || (type === 'mock' ? 180 : type === 'chapter' ? 30 : 20);
        query += ' LIMIT ?';
        params.push(limit);

        const questions = await db.all(query, params);

        if (questions.length < limit) {
            console.log(`Insufficient questions (Found ${questions.length}, Needed ${limit}). Triggering AI RAG...`);
            const { generateInstantQuestions } = await import('@/lib/rag_engine');

            // Determine topic for generation (use first requested topic or 'General')
            const topicId = (topics && topics.length > 0) ? topics[0] : 'General Science';
            const extraNeeded = limit - questions.length;

            const aiQuestions = await generateInstantQuestions(`Topic ${topicId}`, extraNeeded);

            // AI Quality Verification: verify each generated question before saving
            const { verifyQuestion } = await import('@/lib/ai_verifier');

            // Save AI questions to DB for future use (with verification)
            const insertSql = `
                INSERT INTO questions (
                    id, text, option_a, option_b, option_c, option_d, 
                    correct_option, difficulty, explanation, 
                    subject_id, chapter_id, topic_id, 
                    is_ai_generated, source_context,
                    confidence_score, verification_status, verified_answer
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            for (const q of aiQuestions) {
                try {
                    // Verify question quality using AI verifier
                    const verification = await verifyQuestion(q, q.source_context || '');

                    // Skip rejected questions (confidence < 40)
                    if (verification.verification_status === 'rejected') {
                        console.warn(`Rejected AI question: ${q.text?.substring(0, 50)}... (confidence: ${verification.confidence_score})`);
                        continue;
                    }

                    // Use verified answer if verifier found a different correct answer
                    const finalAnswer = verification.verified_answer || q.correct_option;

                    await db.run(insertSql, [
                        q.id, q.text, q.option_a, q.option_b, q.option_c, q.option_d,
                        finalAnswer, q.difficulty, q.explanation,
                        q.subject_id, q.chapter_id, q.topic_id,
                        1, q.source_context,
                        verification.confidence_score || 0, verification.verification_status || 'pending', finalAnswer
                    ]);

                    // Update correct_option with verified answer for client response
                    q.correct_option = finalAnswer;
                    q.confidence_score = verification.confidence_score;
                    q.verification_status = verification.verification_status;

                    questions.push(q);
                } catch (e) { console.error('Failed to save/verify AI question', e); }
            }
        }

        const testId = uuidv4();
        const totalMarks = questions.length * 4;
        const config = JSON.stringify({ subjects, chapters, topics, difficulty, questionCount: questions.length, type });

        await db.run(`INSERT INTO tests (id, user_id, type, config_json, total_questions, total_marks, started_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
            [testId, decoded.id, type || 'custom', config, questions.length, totalMarks]);

        const clientQuestions = questions.map((q, idx) => ({
            id: q.id, index: idx + 1, text: q.text,
            option_a: q.option_a, option_b: q.option_b, option_c: q.option_c, option_d: q.option_d,
            difficulty: q.difficulty, subject_id: q.subject_id, chapter_id: q.chapter_id,
            is_ai_generated: q.is_ai_generated // Pass flag to UI
        }));

        return NextResponse.json({
            testId, questions: clientQuestions, totalQuestions: questions.length,
            totalMarks, type: type || 'custom',
            timeLimit: type === 'mock' ? 10800 : questions.length * 90
        });
    } catch (error) {
        console.error('Test generation error:', error);
        return NextResponse.json({ error: 'Failed to generate test' }, { status: 500 });
    }
}
