
import { NextResponse } from 'next/server';
import { generateWeeklyReports } from '@/lib/reporting_engine';
import { initializeDatabase } from '@/lib/schema';

// This endpoint should be secured with a CRON_SECRET in production
export async function GET(request) {
    try {
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;
        if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await initializeDatabase();
        const result = await generateWeeklyReports();

        return NextResponse.json({ success: true, ...result });

    } catch (error) {
        console.error('Cron Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
