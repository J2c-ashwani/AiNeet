import { getSupabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Server-Sent Events (SSE) endpoint for real-time Battleground updates.
 * 
 * Clients connect via EventSource and receive instant push notifications
 * when participants join, the battle starts, scores are submitted, or the battle ends.
 * 
 * This is a production-grade alternative to HTTP polling.
 */
export async function GET(request) {
    const decoded = getUserFromRequest(request);
    if (!decoded) {
        return new Response('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const battleId = searchParams.get('battleId');

    if (!battleId) {
        return new Response('Missing battleId', { status: 400 });
    }

    const encoder = new TextEncoder();
    let isActive = true;

    const stream = new ReadableStream({
        async start(controller) {
            const sendEvent = (event, data) => {
                if (!isActive) return;
                try {
                    controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
                } catch {
                    isActive = false;
                }
            };

            // Send initial state immediately
            const fetchAndSend = async () => {
                try {
                    const supabase = getSupabase();

                    const { data: battle } = await supabase.from('battlegrounds').select('*').eq('id', battleId).single();
                    if (!battle) {
                        sendEvent('error', { message: 'Battleground not found' });
                        isActive = false;
                        controller.close();
                        return null;
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
                        await supabase.from('battlegrounds').update({ status: 'ended', ended_at: new Date().toISOString() }).eq('id', battleId);
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
                            name: p.name, level: p.level, score: p.score,
                            correct: p.correct_count, incorrect: p.incorrect_count,
                            timeSpent: p.time_spent_seconds, submitted: !!p.submitted_at,
                            isMe: p.user_id === decoded.id
                        })),
                        mySubmission: participants.find(p => p.user_id === decoded.id)?.submitted_at ? true : false,
                        participantCount: participants.length
                    };

                    sendEvent('update', payload);
                    return battle.status;
                } catch (err) {
                    console.error('SSE fetch error:', err);
                    return null;
                }
            };

            // Initial fetch
            let status = await fetchAndSend();

            // Poll internally at 2s interval and push via SSE
            // This is server-side polling that pushes to client — client receives instant events
            const interval = setInterval(async () => {
                if (!isActive) {
                    clearInterval(interval);
                    return;
                }
                status = await fetchAndSend();
                if (status === 'ended') {
                    // Send final update then close after a short delay
                    setTimeout(() => {
                        isActive = false;
                        clearInterval(interval);
                        try { controller.close(); } catch { }
                    }, 5000);
                }
            }, 2000);

            // Cleanup on client disconnect
            request.signal?.addEventListener('abort', () => {
                isActive = false;
                clearInterval(interval);
                try { controller.close(); } catch { }
            });
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no', // Disable nginx buffering
        },
    });
}
