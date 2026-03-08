import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { initializeDatabase } from '@/lib/schema';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await initializeDatabase();
        const db = getDb();

        // Fetch distinct years from questions
        // We ensure year_asked is not null and is_pyq = 1 if applicable
        const query = `
            SELECT DISTINCT year_asked 
            FROM questions 
            WHERE year_asked IS NOT NULL 
              AND year_asked != ''
              AND is_pyq = 1
            ORDER BY year_asked DESC
        `;

        const results = await db.all(query);

        // Extract just the year strings into a flat array
        const years = results.map(row => row.year_asked);

        return NextResponse.json({ years });
    } catch (error) {
        console.error('Failed to fetch available PYQ years:', error);
        return NextResponse.json({ error: 'Failed to fetch years' }, { status: 500 });
    }
}
