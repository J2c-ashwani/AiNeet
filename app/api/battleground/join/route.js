import { NextResponse } from 'next/server';
import { getDb } from '@/lib/core/db';
import { getUserFromRequest } from '@/lib/core/auth';
import { safeInsert, safeUpdate } from '@/lib/core/db-safe';
import { randomUUID } from 'crypto';
import { validateInviteCode } from '@/lib/validate';
import { verifyAppCheck } from '@/lib/security/verify-app-check';
import { requireFeatureEnabled } from '@/lib/feature-flags';

export async function POST(request) {
    try {
        const supabase = await getDb();
        const decoded = await getUserFromRequest(request);
        if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        const appCheckResponse = await verifyAppCheck(request);
        if (appCheckResponse) return appCheckResponse;
        const featureDisabled = await requireFeatureEnabled('battleground');
        if (featureDisabled) return featureDisabled;

        let _body;

        try { _body = await request.json(); } catch (parseErr) {

            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });

        }

        const { inviteCode } = _body;
        if (!inviteCode || !validateInviteCode(inviteCode)) {
            return NextResponse.json({ error: 'Valid invite code required (4-8 alphanumeric characters)' }, { status: 400 });
        }

        // Freemium check: free users can join 1 battleground
        const { data: user } = await supabase.from('users').select('subscription_tier, battleground_joins_used').eq('id', decoded.id).single();
        const isFree = !user?.subscription_tier || user.subscription_tier === 'free';

        if (isFree && (user?.battleground_joins_used || 0) >= 1) {
            return NextResponse.json({
                error: 'Free users can only join 1 Battleground. Upgrade to Premium for unlimited battles!',
                locked: true,
                feature: 'battleground_join'
            }, { status: 403 });
        }

        const { data: battle } = await supabase.from('battlegrounds').select('*').eq('invite_code', inviteCode.trim().toUpperCase()).single();
        if (!battle) return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 });
        if (battle.status === 'ended') return NextResponse.json({ error: 'This battleground has already ended' }, { status: 400 });

        // Check participant count
        const { count: participantCount } = await supabase.from('battleground_participants').select('*', { count: 'exact', head: true }).eq('battleground_id', battle.id);
        if (participantCount >= battle.max_participants) {
            return NextResponse.json({ error: 'Battleground is full (max 200 participants)' }, { status: 400 });
        }

        // Check if already joined
        const { data: existing } = await supabase.from('battleground_participants').select('id').eq('battleground_id', battle.id).eq('user_id', decoded.id).single();
        if (existing) {
            return NextResponse.json({ success: true, battleId: battle.id, message: 'Already joined' });
        }

        await safeInsert('battleground_participants', {
            id: randomUUID(),
            battleground_id: battle.id,
            user_id: decoded.id
        }, {
            route: '/api/battleground/join',
            userId: decoded.id,
        });

        const newJoins = (user?.battleground_joins_used || 0) + 1;
        await safeUpdate('users', { id: decoded.id }, { battleground_joins_used: newJoins }, {
            route: '/api/battleground/join',
            userId: decoded.id,
        });

        return NextResponse.json({ success: true, battleId: battle.id });

    } catch (error) {
        console.error('Battleground join error:', error);
        return NextResponse.json({ error: 'Failed to join battleground. Please try again in a moment.' }, { status: 500 });
    }
}
