import { ImageResponse } from '@vercel/og';
import { getDb } from '@/lib/db';
import { initializeDatabase } from '@/lib/schema';
import { calculateNEETScore } from '@/lib/scoring';

export const runtime = 'nodejs'; // Use nodejs because SQLite requires native modules

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const testId = searchParams.get('testId');

        if (!testId) {
            return new Response('Missing testId', { status: 400 });
        }

        initializeDatabase();
        const db = getDb();

        const test = await db.get('SELECT t.*, u.name, u.streak FROM tests t JOIN users u ON t.user_id = u.id WHERE t.id = ?', [testId]);
        if (!test) {
            return new Response('Test not found', { status: 404 });
        }

        const score = test.score || 0;
        const totalMarks = (test.correct_count + test.incorrect_count + test.unanswered_count) * 4;

        // Simple AIR prediction mock based on score (for viral bragging rights)
        let rank = "Top 50%";
        if (score > 650) rank = "Top 0.5% AIR";
        else if (score > 550) rank = "Top 2% AIR";
        else if (score > 400) rank = "Top 10% AIR";

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#0a0e1a',
                        backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)',
                        fontFamily: 'sans-serif',
                        padding: '40px',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '40px' }}>
                        <div style={{ fontSize: '48px' }}>🧠</div>
                        <div style={{ fontSize: '40px', fontWeight: 'bold', color: '#f1f5f9' }}>AI NEET Coach</div>
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            backgroundColor: 'rgba(17, 24, 39, 0.8)',
                            padding: '50px 80px',
                            borderRadius: '30px',
                            border: '2px solid rgba(99, 102, 241, 0.3)',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                        }}
                    >
                        <div style={{ fontSize: '24px', color: '#94a3b8', marginBottom: '10px' }}>
                            {test.name}'s Score
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '20px' }}>
                            <div style={{ fontSize: '100px', fontWeight: '900', color: '#10b981', lineHeight: '1' }}>
                                {score}
                            </div>
                            <div style={{ fontSize: '40px', color: '#64748b', fontWeight: 'bold', marginLeft: '8px' }}>
                                /{totalMarks}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '30px', marginTop: '30px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ fontSize: '20px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '2px' }}>Predicted</div>
                                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#6366f1', marginTop: '8px' }}>{rank}</div>
                            </div>
                            <div style={{ width: '2px', backgroundColor: 'rgba(255,255,255,0.1)' }}></div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ fontSize: '20px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '2px' }}>Streak</div>
                                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b', marginTop: '8px' }}>🔥 {test.streak} Days</div>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '50px', fontSize: '24px', color: '#94a3b8', fontWeight: 'bold' }}>
                        Can you beat this score? → aineetcoach.com
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            }
        );
    } catch (e) {
        console.error(e);
        return new Response('Failed to generate image', { status: 500 });
    }
}
