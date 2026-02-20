import { getDb } from '@/lib/db';
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
                    const db = getDb();

                    const battle = await db.get('SELECT * FROM battlegrounds WHERE id = ?', [battleId]);
                    if (!battle) {
                        sendEvent('error', { message: 'Battleground not found' });
                        isActive = false;
                        controller.close();
                        return null;
                    }

                    const participants = await db.all(`
                        SELECT bp.*, u.name, u.level 
                        FROM battleground_participants bp 
                        JOIN users u ON bp.user_id = u.id 
                        WHERE bp.battleground_id = ? 
                        ORDER BY bp.score DESC, bp.time_spent_seconds ASC
                    `, [battleId]);

                    const creator = await db.get('SELECT name FROM users WHERE id = ?', [battle.creator_id]);

                    // Auto-end if all participants submitted
                    if (battle.status === 'active' && participants.length > 0 && participants.every(p => p.submitted_at)) {
                        await db.run("UPDATE battlegrounds SET status = 'ended', ended_at = datetime('now') WHERE id = ?", [battleId]);
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
