import { Icon } from '@/components/ui/Icon';
import { getSupabase } from '@/lib/supabase';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
    const { id } = params;
    const supabase = getSupabase();

    // Query battles table, inner join users on user_id
    const { data: battle } = await supabase
        .from('battles')
        .select(`
            *,
            users (name, xp, level)
        `)
        .eq('id', id)
        .single();

    const challenge = battle ? {
        ...battle,
        creator_name: battle.users?.name,
        creator_xp: battle.users?.xp,
        creator_level: battle.users?.level
    } : null;

    if (!challenge) return { title: 'Challenge Not Found' };

    const title = `🔥 ${challenge.creator_name} (Level ${challenge.creator_level}) challenged you to a NEET duel! ⚔️`;
    const description = `${challenge.creator_name} (Level ${challenge.creator_level} • ${challenge.creator_xp} XP) just generated a high-difficulty 10-question AI Mock Test. Do you have what it takes to beat them?`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url: `https://aineetcoach.com/challenge/${id}`,
            images: [
                {
                    url: '/og-image.png',
                    width: 1200,
                    height: 630,
                    alt: 'AI NEET Coach Challenge',
                },
            ],
            type: 'website',
        },
    };
}

export default async function ChallengePage({ params }) {
    const { id } = params;
    const supabase = getSupabase();

    const { data: battle } = await supabase
        .from('battles')
        .select(`
            *,
            users (name, xp, level)
        `)
        .eq('id', id)
        .single();

    const challenge = battle ? {
        ...battle,
        creator_name: battle.users?.name,
        creator_xp: battle.users?.xp,
        creator_level: battle.users?.level
    } : null;

    if (!challenge) {
        notFound();
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', backgroundImage: 'radial-gradient(circle at 50% -20%, rgba(99, 102, 241, 0.15), transparent 50%)' }}>
            <div style={{ marginBottom: 60, display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800 }}>
                <span><Icon name="Brain" /></span> <span style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI NEET Coach</span>
            </div>

            <div style={{ maxWidth: 600, width: '100%', textAlign: 'center', padding: '50px 40px', border: '1px solid rgba(99, 102, 241, 0.3)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, }}></div>

                <div style={{ marginBottom: 20 }}><Icon name="Star" size={16} /></div>
                <h1 style={{ fontWeight: 900, marginBottom: 16, lineHeight: 1.1 }}>
                    You've been challenged!
                </h1>

                <div style={{ margin: '30px 0', padding: 20, display: 'flex', alignItems: 'center', gap: 20, justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        {challenge.creator_name[0].toUpperCase()}
                    </div>
                    <div style={{ textAlign: 'left' }}>
                        <div style={{ fontWeight: 700 }}>{challenge.creator_name}</div>
                        <div style={{ fontWeight: 600 }}>Level {challenge.creator_level} • {challenge.creator_xp} XP</div>
                    </div>
                </div>

                <p style={{ marginBottom: 30, lineHeight: 1.6, color: 'var(--text-muted)' }}>
                    {challenge.creator_name} has challenged you to an intense 10-question NEET 2027 AI Battle. Accept the duel, climb the leaderboard, and claim victory!
                </p>

                {/* Primary CTA: Android App Download for best duel experience */}
                <a
                    href="/downloads/neet-coach.apk"
                    download="AI-NEET-Coach-v2.0.apk"
                    className="btn btn-primary btn-lg"
                    style={{
                        width: '100%',
                        padding: '18px 24px',
                        fontWeight: 800,
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 10,
                        fontSize: '1.05rem',
                        boxShadow: '0 8px 30px rgba(99, 102, 241, 0.5)',
                        marginBottom: 14,
                        borderRadius: 12
                    }}
                >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    <span>Download Android App & Battle (0 Lag)</span>
                </a>

                {/* Native App Perks Banner */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 16,
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: 'rgba(99, 102, 241, 0.1)',
                    border: '1px solid rgba(99, 102, 241, 0.25)',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    marginBottom: 24,
                    flexWrap: 'wrap'
                }}>
                    <span>⚡ 0 Latency</span>
                    <span>•</span>
                    <span>📳 Haptic Buzzer</span>
                    <span>•</span>
                    <span>⚔️ Live Battleground</span>
                </div>

                {/* Secondary CTA: Web Fallback */}
                <a
                    href={`/register?challenge=${id}`}
                    style={{
                        display: 'inline-block',
                        color: 'var(--text-secondary)',
                        fontSize: '0.9rem',
                        textDecoration: 'underline',
                        textUnderlineOffset: 4,
                        fontWeight: 600,
                        transition: 'color 0.2s'
                    }}
                >
                    Or accept in web browser →
                </a>

                <div style={{ marginTop: 12, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Free instant access • No credit card required
                </div>
            </div>

            {/* Download App CTA footer */}
            <div style={{ marginTop: 50, textAlign: 'center', maxWidth: 450 }}>
                <div style={{ marginBottom: 12, fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                    Preparing for NEET 2027?
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 14 }}>
                    Install the native Android app for physical OMR camera scanning, offline chapter tests, and 24/7 AI Doubt Tutor.
                </p>
                <a
                    href="/download"
                    style={{
                        border: '1px solid rgba(255,255,255,0.15)',
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: 10,
                        padding: '10px 20px',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        color: 'var(--text-primary)'
                    }}
                >
                    <span>📱 Learn more about Android App</span>
                </a>
            </div>
        </div>
    );
}
