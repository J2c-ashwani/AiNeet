import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/core/auth';
import { logAcademicEvent } from '@/lib/core/academic-timeline';
import { allOrThrow } from '@/lib/async';

export async function POST(request) {
    try {
        const decoded = await getUserFromRequest(request);
        if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        let body;
        try { body = await request.json(); } catch {
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }

        const { events } = body;
        if (!Array.isArray(events)) {
            return NextResponse.json({ error: 'Expected array of events' }, { status: 400 });
        }

        // Limit to 50 events per batch to prevent abuse
        const batch = events.slice(0, 50);

        await allOrThrow(batch.map(async (event) => {
            if (!event.eventType) return;
            
            await logAcademicEvent({
                eventType: event.eventType,
                userId: decoded.id,
                testId: event.testId,
                questionId: event.questionId,
                payload: event.payload,
                sourceRoute: '/api/tests/log-event',
                deviceType: event.deviceType || 'web',
                networkState: event.networkState || 'unknown'
            }).catch(e => {
                // Ignore non-critical logging errors for batch events
                console.warn('[LogEvent Batch Warning]', e.message);
            });
        }));

        return NextResponse.json({ success: true, loggedCount: batch.length });
    } catch (error) {
        console.error('Log Event API Error:', error);
        return NextResponse.json({ error: 'Failed to log events' }, { status: 500 });
    }
}
