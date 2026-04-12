import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        if (!process.env.UPSTASH_REDIS_REST_URL) {
            // Failsafe exit if analytics cluster offline
            return NextResponse.json({ success: true, bypassed: true });
        }

        const payload = await request.json();
        const { event_name, user_id, device_session_id, metadata, timestamp } = payload;

        if (!event_name || !device_session_id) {
            return NextResponse.json({ error: 'Missing telemetry bindings' }, { status: 400 });
        }

        const safeSessionId = String(device_session_id).replace(/[^a-zA-Z0-9_-]/g, '');
        const unixTime = timestamp || Date.now();
        const telemetryNode = JSON.stringify({
            u: user_id || 'anonymous',
            e: event_name,
            m: metadata || {},
            t: unixTime
        });

        // Push event into continuous timeline set for this specific browser session.
        // Format: ZADD funnel:{session_id} {timestamp} {event_node}
        const redisPayload = JSON.stringify([
            'ZADD',
            `funnel:${safeSessionId}`,
            unixTime,
            telemetryNode
        ]);

        // Fire and forget via Upstash REST (non-blocking for fast client offload)
        fetch(`${process.env.UPSTASH_REDIS_REST_URL}/`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`, 
                'Content-Type': 'application/json' 
            },
            body: redisPayload
        }).catch(() => {});

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Funnel Telemetry parsing exception', error);
        return NextResponse.json({ error: 'Malformed payload' }, { status: 400 });
    }
}
