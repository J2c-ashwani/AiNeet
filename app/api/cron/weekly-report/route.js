import { NextResponse } from 'next/server';
import { generateWeeklyReports } from '@/lib/reporting_engine';

// This endpoint should be secured with a CRON_SECRET in production
export async function GET(request) {
    try {
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;
        const querySecret = new URL(request.url).searchParams.get('secret');

        // Accept secret via Bearer header OR query param (for cron-job.org)
        if (process.env.NODE_ENV === 'production') {
            const isAuthed = (authHeader === `Bearer ${cronSecret}`) || (querySecret === cronSecret);
            if (!cronSecret || !isAuthed) {
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
