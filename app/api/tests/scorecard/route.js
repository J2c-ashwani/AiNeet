import { Icon } from '@/components/ui/Icon';
import { ImageResponse } from '@vercel/og';
import { getDb } from '@/lib/core/db';
import { calculateNEETScore } from '@/lib/scoring';
import { sanitizeString } from '@/lib/validate';

export const runtime = 'edge';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const testId = sanitizeString(searchParams.get('testId') || '', 128);

        if (!testId) {
            return new Response('Missing or invalid testId', { status: 400 });
        }

        const supabase = await getDb();

        const { data: test } = await supabase
            .from('tests')
            .select(`
                *,
                users (name, streak)
            `)
            .eq('id', testId)
            .single();

        if (!test) {
            return new Response('Test not found', { status: 404 });
        }

        // flatten the relationship
        test.name = test.users?.name;
        test.streak = test.users?.streak;

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
                        backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)',
                        fontFamily: 'sans-serif',
                        padding: 40,
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 40 }}>
                        <div ><Icon name="Brain" /></div>
                        <div style={{ fontWeight: 'bold', }}>AI NEET Coach</div>
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            padding: '50px 80px',
                            border: '2px solid rgba(99, 102, 241, 0.3)',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                        }}
                    >
                        <div style={{ marginBottom: 10 }}>
                            {test.name}'s Score
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: 20 }}>
                            <div style={{ fontWeight: '900', lineHeight: '1' }}>
                                {score}
                            </div>
                            <div style={{ fontWeight: 'bold', marginLeft: 8 }}>
                                /{totalMarks}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 30, marginTop: 30 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ textTransform: 'uppercase', letterSpacing: 2 }}>Predicted</div>
                                <div style={{ fontWeight: 'bold', marginTop: 8 }}>{rank}</div>
                            </div>
                            <div style={{ width: 2, }}></div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ textTransform: 'uppercase', letterSpacing: 2 }}>Streak</div>
                                <div style={{ fontWeight: 'bold', marginTop: 8 }}><Icon name="Flame" /> {test.streak} Days</div>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: 50, fontWeight: 'bold' }}>
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
        return new Response('Failed to generate image. Please try again in a moment.', { status: 500 });
    }
}
