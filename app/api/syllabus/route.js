import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { initializeDatabase } from '@/lib/schema';

export async function GET(request) {
    try {
        await initializeDatabase();
        const db = getDb();

        const [subjects, chapters, topics] = await Promise.all([
            db.all('SELECT * FROM subjects ORDER BY id'),
            db.all('SELECT * FROM chapters ORDER BY subject_id, order_index'),
            db.all('SELECT * FROM topics ORDER BY chapter_id, id')
        ]);

        const result = subjects.map(s => ({
            ...s,
            chapters: chapters
                .filter(c => c.subject_id === s.id)
                .map(c => ({
                    ...c,
                    topics: topics.filter(t => t.chapter_id === c.id)
                }))
        }));

        return NextResponse.json({ subjects: result });
    } catch (error) {
        console.error('Syllabus error:', error);
        return NextResponse.json({ error: 'Failed to fetch syllabus' }, { status: 500 });
    }
}
