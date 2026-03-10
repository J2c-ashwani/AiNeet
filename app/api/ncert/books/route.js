import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function GET() {
    try {
        const supabase = getSupabase();
        let { data: books } = await supabase.from('ncert_books').select('*').order('subject_id').order('chapter_id');
        const { data: subjects } = await supabase.from('subjects').select('id, name, color, icon');

        if (books && subjects) {
            books = books.map(b => {
                const s = subjects.find(sub => sub.id === b.subject_id);
                return { ...b, subject_name: s?.name, subject_color: s?.color, subject_icon: s?.icon };
            });
        }

        return NextResponse.json({ books: books || [] });
    } catch (error) {
        return NextResponse.json({ books: [] });
    }
}
