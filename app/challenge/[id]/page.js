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
            users (name)
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

                <div style={{ marginBottom: 20 }}><Icon name="Star" size={16} />️</div>
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

                <p style={{ marginBottom: 40, lineHeight: 1.6 }}>
                    {challenge.creator_name} has generated a high-difficulty 10-question AI Mock Test. Think you can beat their score?
                </p>

                <a href={`/register?challenge=${id}`} className="btn btn-primary btn-lg" style={{ width: '100%', padding: '18px 32px', fontWeight: 800, textDecoration: 'none', display: 'inline-block', boxShadow: '0 8px 30px rgba(99, 102, 241, 0.5)' }}>
                    <Icon name="Flame" /> Accept Challenge
                </a>

                <div style={{ marginTop: 20, }}>
                    Free sign up required to track your score.
                </div>
            </div>

            {/* Download App CTA */}
            <div style={{ marginTop: 60, textAlign: 'center' }}>
                <div style={{ marginBottom: 16, fontWeight: 600 }}>Or play the native experience</div>
                <a href="/download" style={{ border: '1px solid rgba(255,255,255,0.1)', padding: '12px 24px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10, fontWeight: 600 }}>
                    📱 Download Android App
                </a>
            </div>
        </div>
    );
}
