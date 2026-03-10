import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';
import { sanitizeString } from '@/lib/validate';

export async function GET(request, { params }) {
    try {
        const decoded = getUserFromRequest(request);
        if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        const { bookId: rawBookId } = await params;
        const bookId = sanitizeString(rawBookId, 128);
        if (!bookId) return NextResponse.json({ error: 'Invalid book ID' }, { status: 400 });

        const supabase = getSupabase();

        const { data: bookRaw } = await supabase.from('ncert_books').select('*').eq('id', bookId).single();
        let book = null;

        if (bookRaw) {
            const { data: subject } = await supabase.from('subjects').select('name, icon').eq('id', bookRaw.subject_id).single();
            book = { ...bookRaw, subject_name: subject?.name, subject_icon: subject?.icon };
        }

        if (!book) {
            return NextResponse.json({ error: 'Book not found' }, { status: 404 });
        }

        return NextResponse.json({ book });
    } catch (error) {
        console.error('NCERT book fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch book' }, { status: 500 });
    }
}
