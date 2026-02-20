import Link from 'next/link';

export default function NotFound() {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0e1a', color: '#f1f5f9', padding: '40px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '6rem', fontWeight: 900, background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>404</div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '16px', marginBottom: '12px' }}>Page Not Found</h1>
            <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '450px', lineHeight: 1.6, marginBottom: '32px' }}>
                This page doesn't exist, or it has been moved. Let's get you back on track with your NEET preparation.
            </p>
            <div style={{ display: 'flex', gap: '16px' }}>
                <Link href="/dashboard" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', padding: '14px 28px', borderRadius: '12px', fontSize: '1rem', fontWeight: 700, textDecoration: 'none' }}>
                    🏠 Go to Dashboard
                </Link>
                <Link href="/" style={{ background: 'rgba(255,255,255,0.05)', color: '#f8fafc', padding: '14px 28px', borderRadius: '12px', fontSize: '1rem', fontWeight: 600, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)' }}>
                    🏠 Homepage
                </Link>
            </div>
        </div>
    );
}
