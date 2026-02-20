import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request) {
    try {
        const db = getDb();
        const decoded = getUserFromRequest(request);
        if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const battleId = searchParams.get('battleId');
        if (!battleId) return NextResponse.json({ error: 'battleId required' }, { status: 400 });

        const battle = await db.get('SELECT * FROM battlegrounds WHERE id = ?', [battleId]);
        if (!battle) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        const participants = await db.all(`
            SELECT bp.*, u.name, u.level 
            FROM battleground_participants bp 
            JOIN users u ON bp.user_id = u.id 
            WHERE bp.battleground_id = ? 
            ORDER BY bp.score DESC, bp.time_spent_seconds ASC
        `, [battleId]);

        const creator = await db.get('SELECT name FROM users WHERE id = ?', [battle.creator_id]);

        // Check if the current user has submitted
        const myParticipation = participants.find(p => p.user_id === decoded.id);

        // Auto-end if all participants have submitted
        if (battle.status === 'active' && participants.length > 0 && participants.every(p => p.submitted_at)) {
            await db.run("UPDATE battlegrounds SET status = 'ended', ended_at = CURRENT_TIMESTAMP WHERE id = ?", [battleId]);
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
