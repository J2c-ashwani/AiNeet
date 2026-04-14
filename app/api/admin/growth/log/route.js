import { NextResponse } from 'next/server';
import { getDb } from '@/lib/core/db';

export async function POST(request) {
    try {
        const supabase = await getDb();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let _body;

        try { _body = await request.json(); } catch (parseErr) {

            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });

        }

        const { platform, topicDetected, originalDoubtText, selectedVariantText } = _body;

        // 1. Silent Tracking into Postgres
        const { error: insertError } = await supabase.from('social_growth_logs').insert({
            admin_id: user.id,
            platform: platform || 'facebook',
            topic_detected: topicDetected || 'Unknown',
            original_doubt_text: originalDoubtText || '',
            selected_variant: selectedVariantText || ''
        });

        if (insertError) {
            console.error('Tracking Insert Error:', insertError);
            return NextResponse.json({ error: 'Failed to record tracking. Please try again in a moment.' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
        
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
