import { ApiError, RATE_LIMITS, withApiRoute } from '@/lib/api-handler';
import { getDb } from '@/lib/core/db';

export const GET = withApiRoute(async () => {
    const supabase = await getDb();
    const { data: books, error } = await supabase
        .from('ncert_books')
        .select('id, subject_id, chapter_id, title, created_at')
        .order('id', { ascending: false });

    if (error) {
        throw new ApiError('Failed to load NCERT books', 500, 'NCERT_LIST_FAILED');
    }

    return { books: books || [] };
}, {
    auth: 'admin',
    rateLimit: { ...RATE_LIMITS.STANDARD, failBehavior: 'closed', key: 'admin:ncert-list' },
});
