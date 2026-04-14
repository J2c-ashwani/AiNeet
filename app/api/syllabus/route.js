import { NextResponse } from 'next/server';
import { getDb } from '@/lib/core/db';

export async function GET(request) {
    try {
        const supabase = await getDb();

        // 1. Fetch subjects, chapters, topics
        const { data: subjectsData, error: subjectsErr } = await supabase.from('subjects').select('*').order('id');
        const { data: chaptersData, error: chaptersErr } = await supabase.from('chapters').select('*').order('subject_id').order('order_index');
        const { data: topicsData, error: topicsErr } = await supabase.from('topics').select('*').order('chapter_id').order('id');

        // 2. Fetch pyq counts (Note: Supabase doesn't natively do GROUP BY over RPC without creating a view, 
        // so we fetch questions and group in JS, or since this is syllabus, we just fetch all pyqs)
        const { data: pyqs } = await supabase.from('questions').select('chapter_id').eq('is_pyq', 1);

        if (subjectsErr || chaptersErr || topicsErr) throw new Error("Failed fetching syllabus data");

        const pyqMap = {};
        if (pyqs) {
            pyqs.forEach(q => {
                pyqMap[q.chapter_id] = (pyqMap[q.chapter_id] || 0) + 1;
            });
        }

        const result = subjectsData.map(s => ({
            ...s,
            chapters: chaptersData
                .filter(c => c.subject_id === s.id)
                .map(c => ({
                    ...c,
                    pyq_count: pyqMap[c.id] || 0,
                    topics: topicsData.filter(t => t.chapter_id === c.id)
                }))
        }));

        return NextResponse.json({ subjects: result });
    } catch (error) {
        console.error('Syllabus error:', error);
        return NextResponse.json({ error: 'Failed to fetch syllabus. Please try again in a moment.' }, { status: 500 });
    }
}
