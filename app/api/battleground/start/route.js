import { NextResponse } from 'next/server';
import { getDb } from '@/lib/core/db';
import { getUserFromRequest } from '@/lib/core/auth';
import { safeUpdate } from '@/lib/core/db-safe';
import { verifyAppCheck } from '@/lib/security/verify-app-check';

export async function POST(request) {
    try {
        const supabase = await getDb();
        const decoded = await getUserFromRequest(request);
        if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        const appCheckResponse = await verifyAppCheck(request);
        if (appCheckResponse) return appCheckResponse;

        let _body;

        try { _body = await request.json(); } catch (parseErr) {

            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });

        }

        const { battleId } = _body;

        const { data: battle } = await supabase.from('battlegrounds').select('*').eq('id', battleId).eq('creator_id', decoded.id).single();
        if (!battle) return NextResponse.json({ error: 'Battleground not found or you are not the creator' }, { status: 404 });
        if (battle.status !== 'waiting') return NextResponse.json({ error: 'Battleground already started' }, { status: 400 });

        await safeUpdate('battlegrounds', { id: battleId }, {
            status: 'active',
            started_at: new Date().toISOString(),
        }, {
            route: '/api/battleground/start',
            userId: decoded.id,
        });

        return NextResponse.json({ success: true, message: 'Battleground started!' });

    } catch (error) {
        console.error('Battleground start error:', error);
        return NextResponse.json({ error: 'Failed to start battleground. Please try again in a moment.' }, { status: 500 });
    }
}
