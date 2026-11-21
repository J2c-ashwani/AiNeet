import { NextResponse } from 'next/server';
import { getDb } from '@/lib/core/db';

/**
 * Challenge Details API
 * Retrieves authoritative synchronized questions for 1v1 WhatsApp Duels.
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Challenge ID is required' }, { status: 400 });
        }

        const supabase = await getDb();
        const { data: battle, error } = await supabase
            .from('battles')
            .select(`
                *,
                users (name, xp, level)
            `)
            .eq('id', id)
            .single();

        if (error || !battle) {
            return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
        }

        let parsedQuestions = [];
        try {
            parsedQuestions = typeof battle.questions === 'string'
                ? JSON.parse(battle.questions)
                : (battle.questions || []);
        } catch (e) {
            parsedQuestions = [];
        }

        return NextResponse.json({
            id: battle.id,
            challengeId: battle.id,
            creator_name: battle.users?.name || 'Aspirant',
            creator_xp: battle.users?.xp || 0,
            creator_level: battle.users?.level || 1,
            questions: parsedQuestions,
            timeLimitSeconds: 600, // 10 minutes for 10 Qs
        });
    } catch (err) {
        console.error('Challenge Details Error:', err);
        return NextResponse.json({ error: 'Failed to retrieve challenge details' }, { status: 500 });
    }
}
