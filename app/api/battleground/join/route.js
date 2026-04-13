import { NextResponse } from 'next/server';
import { getDb } from '@/lib/core/db';
import { getUserFromRequest } from '@/lib/core/auth';
import { v4 as uuidv4 } from 'uuid';
import { validateInviteCode } from '@/lib/validate';

export async function POST(request) {
    try {
        const supabase = await getDb();
        const decoded = await getUserFromRequest(request);
        if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        const { inviteCode } = await request.json();
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

        await supabase.from('battleground_participants').insert({
            id: uuidv4(),
            battleground_id: battle.id,
            user_id: decoded.id
        });

        const newJoins = (user?.battleground_joins_used || 0) + 1;
        await supabase.from('users').update({ battleground_joins_used: newJoins }).eq('id', decoded.id);

        return NextResponse.json({ success: true, battleId: battle.id });

    } catch (error) {
        console.error('Battleground join error:', error);
        return NextResponse.json({ error: 'Failed to join battleground' }, { status: 500 });
    }
}
