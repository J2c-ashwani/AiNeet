
import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';
import { validateEmail, sanitizeString, sanitizePhone } from '@/lib/validate';
import { checkFeatureAccess } from '@/lib/plan_gate';

export async function GET(request) {
    try {
        const supabase = getSupabase();
        const decoded = getUserFromRequest(request);
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data: user } = await supabase
            .from('users')
            .select('parent_email, parent_phone, subscription_tier')
            .eq('id', decoded.id)
            .single();
        return NextResponse.json({
            parent_email: user?.parent_email || '',
            parent_phone: user?.parent_phone || '',
            tier: user?.subscription_tier || 'free'
        });

    } catch (error) {
        console.error('Parent Settings GET Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const supabase = getSupabase();
        const decoded = getUserFromRequest(request);
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Plan gate: Parent Connect requires Premium
        // TEMPORARILY DISABLED: Allow all users to save parent settings during testing
        // const blocked = await checkFeatureAccess(decoded.id, 'parent_connect_enabled', 'premium');
        // if (blocked) return blocked;

        const body = await request.json();

        // Sanitize and validate
        const parent_email = body.parent_email ? sanitizeString(body.parent_email, 320) : '';
        const parent_phone = body.parent_phone ? sanitizePhone(body.parent_phone) : '';

        if (parent_email && !validateEmail(parent_email)) {
            return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
        }

        const { error: updateError } = await supabase
            .from('users')
            .update({ parent_email, parent_phone })
            .eq('id', decoded.id);

        if (updateError) throw updateError;

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Parent Settings POST Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
