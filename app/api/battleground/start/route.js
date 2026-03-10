import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request) {
    try {
        const supabase = getSupabase();
        const decoded = getUserFromRequest(request);
        if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        const { battleId } = await request.json();

        const { data: battle } = await supabase.from('battlegrounds').select('*').eq('id', battleId).eq('creator_id', decoded.id).single();
        if (!battle) return NextResponse.json({ error: 'Battleground not found or you are not the creator' }, { status: 404 });
        if (battle.status !== 'waiting') return NextResponse.json({ error: 'Battleground already started' }, { status: 400 });

        await supabase.from('battlegrounds').update({ status: 'active', started_at: new Date().toISOString() }).eq('id', battleId);

        return NextResponse.json({ success: true, message: 'Battleground started!' });

    } catch (error) {
        console.error('Battleground start error:', error);
        return NextResponse.json({ error: 'Failed to start battleground' }, { status: 500 });
    }
}
