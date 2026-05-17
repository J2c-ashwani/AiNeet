import { query } from '@/lib/db';
import { ApiError, RATE_LIMITS, withApiRoute } from '@/lib/api-handler';
import { contentQualityQuerySchema, contentQualityReviewSchema } from '@/lib/contracts/api';
import { allOrThrow } from '@/lib/async';

export const GET = withApiRoute(async (_request, { query: params }) => {
    const page = params.page;
    const limit = params.limit;
    const offset = (page - 1) * limit;

    const [metrics, reviewQueue, rejections, reports] = await allOrThrow([
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
        query(`
            SELECT r.rejection_gate, r.rejection_reason, r.prompt_version, r.created_at,
                   t.name as topic
            FROM question_rejections r
            LEFT JOIN topics t ON r.topic_id = t.id
            ORDER BY r.created_at DESC LIMIT 10
        `),
        query(`
            SELECT COUNT(*) as total,
                   COUNT(*) FILTER (WHERE status = 'pending') as pending,
                   COUNT(*) FILTER (WHERE category = 'wrong answer') as wrong_answer,
                   COUNT(*) FILTER (WHERE category = 'unclear explanation') as unclear
            FROM question_reports
        `),
    ]);

    const m = metrics.rows[0];
    const r = reports.rows[0];

    return {
        metrics: {
            totalQuestions: parseInt(m.total_count, 10),
            avgQuality: parseFloat(m.avg_quality) || 0,
            avgConfidence: parseFloat(m.avg_confidence) || 0,
            highQualityCount: parseInt(m.high_quality_count, 10),
            lowQualityCount: parseInt(m.low_quality_count, 10),
            unscoredCount: parseInt(m.unscored_count, 10),
            lockedCount: parseInt(m.locked_count, 10),
            pendingReviewCount: parseInt(m.pending_review_count, 10),
        },
        reviewQueue: reviewQueue.rows,
        recentRejections: rejections.rows,
        studentReports: {
            total: parseInt(r?.total || 0, 10),
            pending: parseInt(r?.pending || 0, 10),
            wrongAnswer: parseInt(r?.wrong_answer || 0, 10),
            unclearExplanation: parseInt(r?.unclear || 0, 10),
        },
        pagination: { page, limit },
    };
}, {
    auth: 'admin',
    querySchema: contentQualityQuerySchema,
    rateLimit: { ...RATE_LIMITS.STANDARD, failBehavior: 'closed', key: 'admin-content-quality' },
});

export const POST = withApiRoute(async (_request, { body, user }) => {
    if (body.action === 'approve') {
        const result = await query(`
            UPDATE questions
            SET explanation_locked = TRUE, last_reviewed_at = NOW(), reviewed_by = $1
            WHERE id = $2
        `, [body.reviewedBy || user.id, body.questionId]);

        if (result.rowCount === 0) {
            throw new ApiError('Question not found', 404, 'QUESTION_NOT_FOUND');
        }

        return { success: true, message: 'Question approved and locked.' };
    }

    const result = await query('DELETE FROM questions WHERE id = $1', [body.questionId]);
    if (result.rowCount === 0) {
        throw new ApiError('Question not found', 404, 'QUESTION_NOT_FOUND');
    }

    return { success: true, message: 'Question rejected and removed.' };
}, {
    auth: 'admin',
    bodySchema: contentQualityReviewSchema,
    rateLimit: { ...RATE_LIMITS.STANDARD, failBehavior: 'closed', key: 'admin-content-quality-review' },
});
