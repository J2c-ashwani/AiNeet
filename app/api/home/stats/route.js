import { NextResponse } from 'next/server';
import { getDb } from '@/lib/core/db';
import { getUserFromRequest } from '@/lib/core/auth';

/**
 * Lightweight Home Screen Stats API
 * 
 * MD Constraint: Do NOT use /api/performance for homepage.
 * This endpoint returns ONLY what the home screen needs.
 * Target: < 200ms response time.
 * 
 * Returns: total_tests, avg_accuracy, questions_solved, streak,
 *          weakest_topic, recent_tests (last 3)
 */
export async function GET(request) {
    try {
        const supabase = await getDb();
        const decoded = await getUserFromRequest(request);
        if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        // Run all 3 queries in parallel for maximum speed
        const [testsResult, weakResult, recentResult] = await Promise.all([
            // 1. Aggregate stats from tests table (single query)
            supabase
                .from('tests')
                .select('score, correct_count, total_questions')
                .eq('user_id', decoded.id)
                .not('completed_at', 'is', null),

            // 2. Weakest topic (single sorted query, limit 1)
            supabase
                .from('user_performance')
                .select(`
                    accuracy, total_attempted,
                    topics!inner(
                        name,
                        chapters!inner(
                            name,
                            subjects!inner(name)
                        )
                    )
                `)
                .eq('user_id', decoded.id)
                .gte('total_attempted', 2)
                .lt('accuracy', 50)
                .order('accuracy', { ascending: true })
                .limit(1),

            // 3. Last 3 completed tests
            supabase
                .from('tests')
                .select('id, type, score, total_marks, correct_count, total_questions, completed_at')
                .eq('user_id', decoded.id)
                .not('completed_at', 'is', null)
                .order('completed_at', { ascending: false })
                .limit(3)
        ]);

        const allTests = testsResult.data || [];
        const total_tests = allTests.length;

        let questions_solved = 0;
        let best_score = 0;
        let sum_acc = 0;

        allTests.forEach(t => {
            questions_solved += (t.total_questions || 0);
            if (t.score > best_score) best_score = t.score;
            sum_acc += t.total_questions > 0 ? (t.correct_count / t.total_questions) * 100 : 0;
        });

        const avg_accuracy = total_tests > 0 ? Math.round(sum_acc / total_tests) : 0;

        // Weakest topic
        const weakRow = weakResult.data?.[0];
        const weakest = weakRow ? {
            topic: weakRow.topics.name,
            chapter: weakRow.topics.chapters.name,
            subject: weakRow.topics.chapters.subjects.name,
            accuracy: Math.round(weakRow.accuracy)
        } : null;

        // Recent tests
        const recent_tests = (recentResult.data || []).map(t => ({
            id: t.id,
            type: t.type,
            score: t.score,
            total_marks: t.total_marks || 720,
            accuracy: t.total_questions > 0 ? Math.round((t.correct_count / t.total_questions) * 100) : 0,
            completed_at: t.completed_at
        }));

        return NextResponse.json({
            total_tests,
            avg_accuracy,
            questions_solved,
            best_score,
            weakest,
            recent_tests
        });
    } catch (error) {
        console.error('Home stats error:', error);
        return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 });
    }
}
