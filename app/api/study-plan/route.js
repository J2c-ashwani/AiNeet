import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { initializeDatabase } from '@/lib/schema';
import { getUserFromRequest } from '@/lib/auth';
import { generateStudyPlan } from '@/lib/ai-engine';

export async function GET(request) {
    try {
        initializeDatabase();
        const db = getDb();
        const decoded = getUserFromRequest(request);
        if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        const performance = db.prepare(`
      SELECT up.*, t.name as topic_name, c.name as chapter_name
      FROM user_performance up
      JOIN topics t ON t.id = up.topic_id
      JOIN chapters c ON c.id = t.chapter_id
      WHERE up.user_id = ? ORDER BY up.accuracy ASC
    `).all(decoded.id);

        const plan = generateStudyPlan(performance);
        return NextResponse.json({ plan });
    } catch (error) {
        console.error('Study plan error:', error);
        return NextResponse.json({ error: 'Failed to generate study plan' }, { status: 500 });
    }
}
