
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/core/db';
import { getUserFromRequest } from '@/lib/core/auth';
import { safeUpdate } from '@/lib/core/db-safe';
import { validateEmail, sanitizeString, sanitizePhone } from '@/lib/validate';
import { checkFeatureAccess } from '@/lib/plan_gate';

export async function GET(request) {
    try {
        const supabase = await getDb();
        const decoded = await getUserFromRequest(request);
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data: user } = await supabase
            .from('users')
            .select('parent_email, parent_phone, parent_consent_given_at, subscription_tier')
            .eq('id', decoded.id)
            .single();
        return NextResponse.json({
            parent_email: user?.parent_email || '',
            parent_phone: user?.parent_phone || '',
            parent_consent_given_at: user?.parent_consent_given_at || null,
            tier: user?.subscription_tier || 'free'
        });

    } catch (error) {
        console.error('Parent Settings GET Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const supabase = await getDb();
        const decoded = await getUserFromRequest(request);
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Plan gate: Parent Connect requires Premium
        // TEMPORARILY DISABLED: Allow all users to save parent settings during testing
        // const blocked = await checkFeatureAccess(decoded.id, 'parent_connect_enabled', 'premium');
        // if (blocked) return blocked;

        let _body;

        try { _body = await request.json(); } catch (parseErr) {

            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });

        }

        const body = _body;

        // Sanitize and validate
        const parent_email = body.parent_email ? sanitizeString(body.parent_email, 320) : '';
        const parent_phone = body.parent_phone ? sanitizePhone(body.parent_phone) : '';
        const consent_given = !!body.consent_given;

        if (!consent_given && (parent_email || parent_phone)) {
            return NextResponse.json({ error: 'Consent is required to save parent details.' }, { status: 400 });
        }

        if (parent_email && !validateEmail(parent_email)) {
            return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
        }

        const updates = { 
            parent_email, 
            parent_phone,
            parent_consent_given_at: consent_given ? new Date().toISOString() : null,
            parent_consent_version: consent_given ? 'v1_early_access_beta' : null
        };

        await safeUpdate('users', { id: decoded.id }, updates, {
            route: '/api/user/parent-settings',
            userId: decoded.id,
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Parent Settings POST Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
