import Link from 'next/link';

export default function NotFound() {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center' }}>
            <div style={{ fontWeight: 900, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>404</div>
            <h1 style={{ fontWeight: 800, marginTop: 16, marginBottom: 12 }}>Page Not Found</h1>
            <p style={{ maxWidth: 450, lineHeight: 1.6, marginBottom: 32 }}>
                This page doesn't exist, or it has been moved. Let's get you back on track with your NEET preparation.
            </p>
            <div style={{ display: 'flex', gap: 16 }}>
                <a href="/dashboard" style={{ padding: '14px 28px', fontWeight: 700, textDecoration: 'none' }}>
                    🏠 Go to Dashboard
                </a>
                <a href="/" style={{ padding: '14px 28px', fontWeight: 600, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)' }}>
                    🏠 Homepage
                </a>
            </div>
        </div>
    );
}
