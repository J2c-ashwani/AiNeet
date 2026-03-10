import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request) {
    try {
        const supabase = getSupabase();
        const decoded = getUserFromRequest(request);
        if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        const { battleId, answers, timeSpent } = await request.json();

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

        await supabase.from('battleground_participants').update({
            score: score,
            correct_count: correct,
            incorrect_count: incorrect,
            time_spent_seconds: timeSpent || 0,
            submitted_at: new Date().toISOString()
        }).eq('battleground_id', battleId).eq('user_id', decoded.id);

        return NextResponse.json({ success: true, score, correct, incorrect, timeSpent });

    } catch (error) {
        console.error('Battleground submit error:', error);
        return NextResponse.json({ error: 'Failed to submit answers' }, { status: 500 });
    }
}
