import { NextResponse } from 'next/server';
import { generateWeeklyReports } from '@/lib/reporting_engine';

// This endpoint should be secured with a CRON_SECRET in production
export async function GET(request) {
    try {
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        // Allow local testing without secret for development
        if (process.env.NODE_ENV === 'production') {
            if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
        }
        const result = await generateWeeklyReports();

        return NextResponse.json({ success: true, environment: process.env.NODE_ENV, ...result });

    } catch (error) {
        console.error('Cron Error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
