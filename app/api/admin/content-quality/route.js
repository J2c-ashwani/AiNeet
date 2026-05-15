import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    try {
        // Quality overview metrics
        const [metrics, reviewQueue, rejections, reports] = await Promise.all([
            // Overall quality metrics
            query(`
                SELECT
                    COUNT(*) FILTER (WHERE quality_score >= 70) as high_quality_count,
                    COUNT(*) FILTER (WHERE quality_score < 70 AND quality_score > 0) as low_quality_count,
                    COUNT(*) FILTER (WHERE quality_score = 0) as unscored_count,
                    ROUND(AVG(quality_score) FILTER (WHERE quality_score > 0), 1) as avg_quality,
                    ROUND(AVG(confidence_score) FILTER (WHERE confidence_score > 0), 2) as avg_confidence,
                    COUNT(*) FILTER (WHERE explanation_locked = TRUE) as locked_count,
                    COUNT(*) FILTER (WHERE explanation_version IS NOT NULL AND explanation_locked = FALSE) as pending_review_count,
                    COUNT(*) as total_count
                FROM questions
            `),
            // Review queue: confidence 0.80-0.92 and not locked
            query(`
                SELECT q.id, q.text, q.option_a, q.option_b, q.option_c, q.option_d,
                       q.correct_option, q.explanation, q.confidence_score, q.quality_score,
                       q.prompt_version, q.explanation_version, q.is_pyq, q.is_ai_generated,
                       s.name as subject, t.name as topic, c.name as chapter
                FROM questions q
                JOIN subjects s ON q.subject_id = s.id
                LEFT JOIN topics t ON q.topic_id = t.id
                LEFT JOIN chapters c ON q.chapter_id = c.id
                WHERE q.explanation_version IS NOT NULL
                  AND q.explanation_locked = FALSE
                ORDER BY q.quality_score DESC, q.confidence_score DESC
                LIMIT $1 OFFSET $2
            `, [limit, offset]),
            // Recent rejections
            query(`
                SELECT r.rejection_gate, r.rejection_reason, r.prompt_version, r.created_at,
                       t.name as topic
                FROM question_rejections r
                LEFT JOIN topics t ON r.topic_id = t.id
                ORDER BY r.created_at DESC LIMIT 10
            `),
            // Student reports
            query(`
                SELECT COUNT(*) as total,
                       COUNT(*) FILTER (WHERE status = 'pending') as pending,
                       COUNT(*) FILTER (WHERE category = 'wrong answer') as wrong_answer,
                       COUNT(*) FILTER (WHERE category = 'unclear explanation') as unclear
                FROM question_reports
            `)
        ]);

        const m = metrics.rows[0];
        const r = reports.rows[0];

        return NextResponse.json({
            metrics: {
                totalQuestions: parseInt(m.total_count),
                avgQuality: parseFloat(m.avg_quality) || 0,
                avgConfidence: parseFloat(m.avg_confidence) || 0,
                highQualityCount: parseInt(m.high_quality_count),
                lowQualityCount: parseInt(m.low_quality_count),
                unscoredCount: parseInt(m.unscored_count),
                lockedCount: parseInt(m.locked_count),
                pendingReviewCount: parseInt(m.pending_review_count),
            },
            reviewQueue: reviewQueue.rows,
            recentRejections: rejections.rows,
            studentReports: {
                total: parseInt(r?.total || 0),
                pending: parseInt(r?.pending || 0),
                wrongAnswer: parseInt(r?.wrong_answer || 0),
                unclearExplanation: parseInt(r?.unclear || 0),
            },
            pagination: { page, limit }
        });
    } catch (err) {
        console.error('[content-quality API] Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const body = await req.json();
        const { action, questionId, reviewedBy } = body;

        if (!questionId) {
            return NextResponse.json({ error: 'questionId required' }, { status: 400 });
        }

        if (action === 'approve') {
            // Lock the explanation — MD Mandate: teacher-approved = immutable
            await query(`
                UPDATE questions 
                SET explanation_locked = TRUE, last_reviewed_at = NOW(), reviewed_by = $1
                WHERE id = $2
            `, [reviewedBy || 'admin', questionId]);
            return NextResponse.json({ success: true, message: 'Question approved and locked.' });

        } else if (action === 'reject') {
            // Delete from questions (go back to pipeline)
            await query('DELETE FROM questions WHERE id = $1', [questionId]);
            return NextResponse.json({ success: true, message: 'Question rejected and removed.' });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
