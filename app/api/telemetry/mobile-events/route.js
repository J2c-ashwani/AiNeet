import { NextResponse } from 'next/server';
import { getDb } from '@/lib/core/db';

export async function POST(request) {
    try {
        let body;
        try { body = await request.json(); } catch {
            return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
        }

        const { events } = body;
        if (!Array.isArray(events) || events.length === 0) {
            return NextResponse.json({ ok: true, inserted: 0 });
        }

        const supabase = await getDb();

        // Sanitize and batch insert
        const rows = events.slice(0, 200).map(e => ({
            user_id:        e.user_id        || null,
            event_type:     String(e.event_type || 'unknown').substring(0, 100),
            device_info:    e.device_info    || null,
            android_version:e.android_version|| null,
            webview_version:e.webview_version|| null,
            route:          e.route          ? String(e.route).substring(0, 200) : null,
            failure_reason: e.failure_reason ? String(e.failure_reason).substring(0, 500) : null,
        }));

        const { error } = await supabase.from('mobile_runtime_events').insert(rows);
        if (error) throw error;

        return NextResponse.json({ ok: true, inserted: rows.length });
    } catch (e) {
        console.error('[Mobile Telemetry] Ingest error:', e);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
