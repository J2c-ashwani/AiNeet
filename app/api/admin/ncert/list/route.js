import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request) {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const supabase = getSupabase();

        // Note: original SQLite query used 'ncert_content' but upload uses 'ncert_books'
        const { data: books } = await supabase
            .from('ncert_books')
            .select('id, subject_id, chapter_id, title, created_at')
            .order('id', { ascending: false });

        return NextResponse.json({ books: books || [] });
    } catch (error) {
        // Table might not exist yet
        return NextResponse.json({ books: [] });
    }
}
