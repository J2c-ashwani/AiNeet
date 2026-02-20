import { getDb } from '@/lib/db';
import { initializeDatabase } from '@/lib/schema';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
    const { id } = params;
    initializeDatabase();
    const db = getDb();

    const challenge = await db.get(`
        SELECT c.*, u.name as creator_name 
        FROM challenges c 
        JOIN users u ON c.creator_id = u.id 
        WHERE c.id = ?
    `, [id]);

    if (!challenge) return { title: 'Challenge Not Found' };

    const title = `${challenge.creator_name} challenged you to a NEET duel! ⚔️`;
    const description = `Can you beat ${challenge.creator_name}'s score in this fast-paced 10-question AI Mock Test? Accept the challenge now.`;

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

    initializeDatabase();
    const db = getDb();

    const challenge = await db.get(`
        SELECT c.*, u.name as creator_name, u.xp as creator_xp, u.level as creator_level
        FROM challenges c 
        JOIN users u ON c.creator_id = u.id 
        WHERE c.id = ?
    `, [id]);

    if (!challenge) {
        notFound();
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#0a0e1a', color: '#f1f5f9', padding: '40px 20px', backgroundImage: 'radial-gradient(circle at 50% -20%, rgba(99, 102, 241, 0.15), transparent 50%)' }}>
            <div style={{ marginBottom: '60px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', fontWeight: 800 }}>
                <span>🧠</span> <span style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI NEET Coach</span>
            </div>

            <div style={{ maxWidth: '600px', width: '100%', textAlign: 'center', background: 'rgba(17, 24, 39, 0.8)', padding: '50px 40px', borderRadius: '32px', border: '1px solid rgba(99, 102, 241, 0.3)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #ef4444, #f59e0b, #10b981, #3b82f6)' }}></div>

                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>⚔️</div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '16px', lineHeight: 1.1 }}>
                    You've been challenged!
                </h1>

                <div style={{ margin: '30px 0', padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '20px', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #ef4444, #f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>
                        {challenge.creator_name[0].toUpperCase()}
                    </div>
                    <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{challenge.creator_name}</div>
                        <div style={{ color: '#f59e0b', fontSize: '0.9rem', fontWeight: 600 }}>Level {challenge.creator_level} • {challenge.creator_xp} XP</div>
                    </div>
                </div>

                <p style={{ color: '#94a3b8', fontSize: '1.2rem', marginBottom: '40px', lineHeight: 1.6 }}>
                    {challenge.creator_name} has generated a high-difficulty 10-question AI Mock Test. Think you can beat their score?
                </p>

                <Link href={`/register?challenge=${id}`} className="btn btn-primary btn-lg" style={{ width: '100%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a78bfa)', color: 'white', padding: '18px 32px', borderRadius: '16px', fontSize: '1.2rem', fontWeight: 800, textDecoration: 'none', display: 'inline-block', boxShadow: '0 8px 30px rgba(99, 102, 241, 0.5)' }}>
                    🔥 Accept Challenge
                </Link>

                <div style={{ marginTop: '20px', color: '#64748b', fontSize: '0.9rem' }}>
                    Free sign up required to track your score.
                </div>
            </div>

            {/* Download App CTA */}
            <div style={{ marginTop: '60px', textAlign: 'center' }}>
                <div style={{ color: '#94a3b8', marginBottom: '16px', fontWeight: 600 }}>Or play the native experience</div>
                <a href="#android" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 24px', borderRadius: '12px', color: '#f8fafc', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '10px', fontWeight: 600 }}>
                    📱 Get the Android App
                </a>
            </div>
        </div>
    );
}
