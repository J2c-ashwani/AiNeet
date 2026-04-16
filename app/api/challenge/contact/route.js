import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { ghost_id, contact } = await request.json();
        if (!ghost_id || !contact) return NextResponse.json({ error: 'Missing payload' }, { status: 400 });

        // MD Directive: We are replacing hard DB logic with Edge KV for soft-identities.
        // In a true environment, this stores directly to Upstash Redis -> ghost_contact:${ghost_id} = contact
        const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
        const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
        
        if (upstashUrl && upstashToken) {
            await fetch(`${upstashUrl}/set/ghost_contact:${ghost_id}/${encodeURIComponent(contact)}`, {
                headers: { Authorization: `Bearer ${upstashToken}` }
            });
        } else {
            console.warn('[KV STORE] Fake contact cache for local dev:', ghost_id, contact);
        }

        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
