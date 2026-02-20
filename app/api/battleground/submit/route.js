import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request) {
    try {
        const db = getDb();
        const decoded = getUserFromRequest(request);
        if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        const { battleId, answers, timeSpent } = await request.json();

        const battle = await db.get('SELECT * FROM battlegrounds WHERE id = ?', [battleId]);
        if (!battle) return NextResponse.json({ error: 'Battleground not found' }, { status: 404 });

        const participant = await db.get(
            'SELECT * FROM battleground_participants WHERE battleground_id = ? AND user_id = ?',
            [battleId, decoded.id]
        );
        if (!participant) return NextResponse.json({ error: 'You have not joined this battleground' }, { status: 403 });
        if (participant.submitted_at) return NextResponse.json({ error: 'Already submitted' }, { status: 400 });

        // Score the answers
        const questions = JSON.parse(battle.questions_json);
        let correct = 0, incorrect = 0;

        for (const ans of answers) {
            const q = questions.find(q => q.id === ans.questionId);
            if (!q) continue;
            if (ans.selectedOption === q.correct_option) correct++;
            else if (ans.selectedOption) incorrect++;
        }

        const score = (correct * 4) - (incorrect * 1); // NEET marking scheme

        await db.run(
            "UPDATE battleground_participants SET score = ?, correct_count = ?, incorrect_count = ?, time_spent_seconds = ?, submitted_at = datetime('now') WHERE battleground_id = ? AND user_id = ?",
            [score, correct, incorrect, timeSpent || 0, battleId, decoded.id]
        );

        return NextResponse.json({ success: true, score, correct, incorrect, timeSpent });

    } catch (error) {
        console.error('Battleground submit error:', error);
        return NextResponse.json({ error: 'Failed to submit answers' }, { status: 500 });
    }
}
