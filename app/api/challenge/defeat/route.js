import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { ghost_id, new_score, subject } = await request.json();
        if (!ghost_id || !new_score) return NextResponse.json({ error: 'Missing challenge payload' }, { status: 400 });

        const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
        const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
        
        if (upstashUrl && upstashToken) {
            // First check if they've already been defeated recently (MD's Cooldown Logic)
            const checkRes = await fetch(`${upstashUrl}/get/defeat:${ghost_id}`, {
                headers: { Authorization: `Bearer ${upstashToken}` }
            });
            const checkData = await checkRes.json();
            
            if (checkData.result) {
                // Prevent spamming. Someone beat them 5 times today. They only get notified once.
                return NextResponse.json({ success: true, message: 'Cooldown active. Defeat already logged.' });
            }

            // Write Defeat State with 48h (172800 seconds) Ephemeral TTL to prevent DB bloat
            const payload = JSON.stringify({ defeated: true, new_score, subject: subject || 'Biology' });
            await fetch(`${upstashUrl}/set/defeat:${ghost_id}/${encodeURIComponent(payload)}/EX/172800`, {
                headers: { Authorization: `Bearer ${upstashToken}` }
            });

            // Active Re-Engagement Push Protocol
            const contactRes = await fetch(`${upstashUrl}/get/ghost_contact:${ghost_id}`, {
                headers: { Authorization: `Bearer ${upstashToken}` }
            });
            const contactData = await contactRes.json();
            
            if (contactData.result) {
                const phone = decodeURIComponent(contactData.result);
                console.log(`[VIRAL PING ENGINE] -> Dispatching WhatsApp API SMS to ${phone}: "Someone beat your score (${new_score}%) in ${subject}. Take 1 min test to reclaim your rank."`);
                // In production, trigger Twilio or Meta Graph WhatsApp API here to force the user back into the funnel!
            }

            return NextResponse.json({ success: true, status: 'Defeat logged ephemerally' });
        }

        return NextResponse.json({ success: true, warning: 'Upstash unconfigured, mocked success' });
    } catch (e) {
        console.error('Challenge Defeat API Error:', e);
        return NextResponse.json({ error: 'Failed logging defeat' }, { status: 500 });
    }
}
