
import { NextResponse } from 'next/server';
import { generateWeeklyReports } from '@/lib/reporting_engine';
import { initializeDatabase } from '@/lib/schema';

// This endpoint should be secured with a CRON_SECRET in production
export async function GET(request) {
    try {
        const authHeader = request.headers.get('authorization');
        // Simple secret check (Add CRON_SECRET to .env in prod)
        if (authHeader !== `Bearer ${process.env.CRON_SECRET || 'dev_secret'}`) {
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
