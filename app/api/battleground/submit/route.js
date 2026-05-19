import { NextResponse } from 'next/server';
import { getDb } from '@/lib/core/db';
import { safeUpdate } from '@/lib/core/db-safe';
import { logAcademicEvent } from '@/lib/core/academic-timeline';
import { getUserFromRequest } from '@/lib/core/auth';
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

        const { battleId, answers, timeSpent } = _body;

        const { data: battle } = await supabase.from('battlegrounds').select('*').eq('id', battleId).single();
        if (!battle) return NextResponse.json({ error: 'Battleground not found' }, { status: 404 });

        const { data: participant } = await supabase
            .from('battleground_participants')
            .select('*')
            .eq('battleground_id', battleId)
            .eq('user_id', decoded.id)
            .single();

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

        // Atomic Check and Set using safeUpdate to prevent double-submit
        const participantMutations = supabase.from('battleground_participants');
        const { data: updateRes, error } = await participantMutations
            .update({
                score: score,
                correct_count: correct,
                incorrect_count: incorrect,
                time_spent_seconds: timeSpent || 0,
                submitted_at: new Date().toISOString()
            })
            .eq('battleground_id', battleId)
            .eq('user_id', decoded.id)
            .is('submitted_at', null)
            .select();

        if (error) throw error;

        if (!updateRes || updateRes.length === 0) {
            return NextResponse.json({ error: 'Already submitted or battle locked.' }, { status: 409 });
        }

        await logAcademicEvent({
            eventType: 'battle_finalized',
            userId: decoded.id,
            payload: { battleId, score, correct, incorrect },
            sourceRoute: '/api/battleground/submit'
        });

        return NextResponse.json({ success: true, score, correct, incorrect, timeSpent });

    } catch (error) {
        console.error('Battleground submit error:', error);
        return NextResponse.json({ error: 'Failed to submit answers. Please try again in a moment.' }, { status: 500 });
    }
}
