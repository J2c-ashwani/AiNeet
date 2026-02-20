import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { validateInviteCode } from '@/lib/validate';

export async function POST(request) {
    try {
        const db = getDb();
        const decoded = getUserFromRequest(request);
        if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        const { inviteCode } = await request.json();
        if (!inviteCode || !validateInviteCode(inviteCode)) {
            return NextResponse.json({ error: 'Valid invite code required (4-8 alphanumeric characters)' }, { status: 400 });
        }

        // Freemium check: free users can join 1 battleground
        const user = await db.get('SELECT subscription_tier, battleground_joins_used FROM users WHERE id = ?', [decoded.id]);
        const isFree = !user?.subscription_tier || user.subscription_tier === 'free';

        if (isFree && (user?.battleground_joins_used || 0) >= 1) {
            return NextResponse.json({
                error: 'Free users can only join 1 Battleground. Upgrade to Premium for unlimited battles!',
                locked: true,
                feature: 'battleground_join'
            }, { status: 403 });
        }

        const battle = await db.get('SELECT * FROM battlegrounds WHERE invite_code = ?', [inviteCode.trim().toUpperCase()]);
        if (!battle) return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 });
        if (battle.status === 'ended') return NextResponse.json({ error: 'This battleground has already ended' }, { status: 400 });

        // Check participant count
        const participantCount = await db.get('SELECT COUNT(*) as c FROM battleground_participants WHERE battleground_id = ?', [battle.id]);
        if (participantCount.c >= battle.max_participants) {
            return NextResponse.json({ error: 'Battleground is full (max 200 participants)' }, { status: 400 });
        }

        // Check if already joined
        const existing = await db.get('SELECT id FROM battleground_participants WHERE battleground_id = ? AND user_id = ?', [battle.id, decoded.id]);
        if (existing) {
            return NextResponse.json({ success: true, battleId: battle.id, message: 'Already joined' });
        }

        await db.run(
            `INSERT INTO battleground_participants (id, battleground_id, user_id) VALUES (?, ?, ?)`,
            [uuidv4(), battle.id, decoded.id]
        );

        await db.run('UPDATE users SET battleground_joins_used = battleground_joins_used + 1 WHERE id = ?', [decoded.id]);

        return NextResponse.json({ success: true, battleId: battle.id });

    } catch (error) {
        console.error('Battleground join error:', error);
        return NextResponse.json({ error: 'Failed to join battleground' }, { status: 500 });
    }
}
