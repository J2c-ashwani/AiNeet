import { NextResponse } from 'next/server';

export async function GET() {
    // Expose Kill Switch states securely without leaking env values directly
    const features = {
        ai: process.env.DISABLE_AI !== 'true',
        payments: process.env.DISABLE_PAYMENTS !== 'true',
        referrals: process.env.DISABLE_REFERRALS !== 'true'
    };

    // Edge Caching: 60s max-age protects against polling spikes while retaining quick operational shutdown capability
    return NextResponse.json(features, {
        status: 200,
        headers: {
            'Cache-Control': 's-maxage=60, stale-while-revalidate=120'
        }
    });
}
