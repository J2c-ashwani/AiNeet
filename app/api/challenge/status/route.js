import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const ghost_id = searchParams.get('ghost_id');
        if (!ghost_id) return NextResponse.json({ defeated: false }, { status: 400 });

        const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
        const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
        
        if (upstashUrl && upstashToken) {
            const checkRes = await fetch(`${upstashUrl}/get/defeat:${ghost_id}`, {
                headers: { Authorization: `Bearer ${upstashToken}` }
            });
            const checkData = await checkRes.json();
            
            if (checkData.result) {
                // Return payload
                const parsed = JSON.parse(decodeURIComponent(checkData.result));
                return NextResponse.json({ defeated: true, data: parsed });
            }
        }

        return NextResponse.json({ defeated: false });
    } catch (e) {
        return NextResponse.json({ defeated: false }, { status: 500 });
    }
}
