import { NextResponse } from 'next/server';
import { generateWeeklyReports } from '@/lib/reporting_engine';
import { requireRequestSecret } from '@/lib/server-secrets';

export async function GET(request) {
    try {
        const authError = requireRequestSecret(request, {
            envName: 'CRON_SECRET',
            bearer: true,
            headers: ['x-cron-secret'],
            query: ['secret'],
        });
        if (authError) return authError;

        const result = await generateWeeklyReports();

        return NextResponse.json({ success: true, environment: process.env.NODE_ENV, ...result });

    } catch (error) {
        console.error('Cron Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
