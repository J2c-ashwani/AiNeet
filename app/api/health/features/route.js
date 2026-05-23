import { NextResponse } from 'next/server';
import { getStaticFeatureSnapshot } from '@/lib/feature-flags';

export async function GET() {
    // Expose kill switch states securely without leaking environment values directly.
    const snapshot = getStaticFeatureSnapshot();
    const features = Object.fromEntries(
        Object.entries(snapshot).map(([name, config]) => [name, config.enabled])
    );

    // Edge Caching: 60s max-age protects against polling spikes while retaining quick operational shutdown capability
    return NextResponse.json(features, {
        status: 200,
        headers: {
            'Cache-Control': 's-maxage=60, stale-while-revalidate=120'
        }
    });
}
