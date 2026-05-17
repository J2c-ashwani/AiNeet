import { NextResponse } from 'next/server';
import { getDb } from '@/lib/core/db';
import { getUserFromRequest } from '@/lib/core/auth';
import { safeUpdate } from '@/lib/core/db-safe';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const decoded = await getUserFromRequest(request);
        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const battleId = searchParams.get('battleId');

        if (!battleId) {
            return NextResponse.json({ error: 'Missing battleId' }, { status: 400 });
        }

        const supabase = await getDb();

        const { data: battle } = await supabase.from('battlegrounds').select('*').eq('id', battleId).single();
        if (!battle) {
            return NextResponse.json({ error: 'Battleground not found' }, { status: 404 });
        }

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

        // Auto-end if all participants submitted
        if (battle.status === 'active' && participants.length > 0 && participants.every(p => p.submitted_at)) {
            await safeUpdate('battlegrounds', { id: battleId }, {
                status: 'ended',
                ended_at: new Date().toISOString(),
            }, {
                route: '/api/battleground/state',
                userId: decoded.id,
            });
            battle.status = 'ended';
        }

        const payload = {
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
                id: p.user_id,
                name: p.name, level: p.level, score: p.score,
                correct: p.correct_count, incorrect: p.incorrect_count,
                timeSpent: p.time_spent_seconds, submitted: !!p.submitted_at,
                isMe: p.user_id === decoded.id
            })),
            mySubmission: participants.find(p => p.user_id === decoded.id)?.submitted_at ? true : false,
            participantCount: participants.length
        };

        return NextResponse.json(payload);
    } catch (err) {
        console.error('State fetch error:', err);
        return NextResponse.json({ error: 'Battle operation failed. Please try again.' }, { status: 500 });
    }
}
