import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/utils/supabase/server';

export async function POST(request) {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { platform, topicDetected, originalDoubtText, selectedVariantText } = await request.json();

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
            return NextResponse.json({ error: 'Failed to record tracking' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
        
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
