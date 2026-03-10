import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request) {
    try {
        const supabase = getSupabase();
        const decoded = getUserFromRequest(request);
        if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const battleId = searchParams.get('battleId');
        if (!battleId) return NextResponse.json({ error: 'battleId required' }, { status: 400 });

        const { data: battle } = await supabase.from('battlegrounds').select('*').eq('id', battleId).single();
        if (!battle) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        const { data: participantsRaw } = await supabase
            .from('battleground_participants')
            .select(`
                *,
                users (name, level)
            `)
            .eq('battleground_id', battleId)
            .order('score', { ascending: false })
            .order('time_spent_seconds', { ascending: true });

        const participants = (participantsRaw || []).map(p => ({
            ...p,
            name: p.users?.name,
            level: p.users?.level
        }));

        const { data: creator } = await supabase.from('users').select('name').eq('id', battle.creator_id).single();

        // Check if the current user has submitted
        const myParticipation = participants.find(p => p.user_id === decoded.id);

        // Auto-end if all participants have submitted
        if (battle.status === 'active' && participants.length > 0 && participants.every(p => p.submitted_at)) {
            await supabase.from('battlegrounds').update({ status: 'ended', ended_at: new Date().toISOString() }).eq('id', battleId);
            battle.status = 'ended';
        }

        return NextResponse.json({
            battle: {
                id: battle.id,
                inviteCode: battle.invite_code,
                status: battle.status,
                questionCount: battle.question_count,
                timeLimitSeconds: battle.time_limit_seconds,
                startedAt: battle.started_at,
                creatorId: battle.creator_id,
                creatorName: creator?.name || 'Unknown',
                questions: battle.status === 'active' ? JSON.parse(battle.questions_json).map(q => ({
                    id: q.id, text: q.text,
                    option_a: q.option_a, option_b: q.option_b, option_c: q.option_c, option_d: q.option_d,
                    difficulty: q.difficulty
                })) : undefined
            },
            participants: participants.map(p => ({
                name: p.name, level: p.level, score: p.score,
                correct: p.correct_count, incorrect: p.incorrect_count,
                timeSpent: p.time_spent_seconds, submitted: !!p.submitted_at,
                isMe: p.user_id === decoded.id
            })),
            mySubmission: myParticipation ? !!myParticipation.submitted_at : false,
            participantCount: participants.length
        });

    } catch (error) {
        console.error('Battleground status error:', error);
        return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 });
    }
}
