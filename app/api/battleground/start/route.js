import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request) {
    try {
        const db = getDb();
        const decoded = getUserFromRequest(request);
        if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        const { battleId } = await request.json();

        const battle = await db.get('SELECT * FROM battlegrounds WHERE id = ? AND creator_id = ?', [battleId, decoded.id]);
        if (!battle) return NextResponse.json({ error: 'Battleground not found or you are not the creator' }, { status: 404 });
        if (battle.status !== 'waiting') return NextResponse.json({ error: 'Battleground already started' }, { status: 400 });

        await db.run("UPDATE battlegrounds SET status = 'active', started_at = datetime('now') WHERE id = ?", [battleId]);

        return NextResponse.json({ success: true, message: 'Battleground started!' });

    } catch (error) {
        console.error('Battleground start error:', error);
        return NextResponse.json({ error: 'Failed to start battleground' }, { status: 500 });
    }
}
