'use client';

export default function GlobalError({ error, reset }) {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0e1a', color: '#f1f5f9', padding: '40px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '5rem', marginBottom: '24px' }}>💥</div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '12px' }}>Something went wrong</h1>
            <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '500px', lineHeight: 1.6, marginBottom: '32px' }}>
                We hit an unexpected error. Our team has been notified. Please try again or go back to the dashboard.
            </p>
            <div style={{ display: 'flex', gap: '16px' }}>
                <button onClick={reset} className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', padding: '14px 28px', borderRadius: '12px', fontSize: '1rem', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                    🔄 Try Again
                </button>
                <a href="/dashboard" style={{ background: 'rgba(255,255,255,0.05)', color: '#f8fafc', padding: '14px 28px', borderRadius: '12px', fontSize: '1rem', fontWeight: 600, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)' }}>
                    🏠 Dashboard
                </a>
            </div>
            <p style={{ color: '#475569', fontSize: '0.8rem', marginTop: '40px' }}>Error ID: {Date.now().toString(36)} • AI NEET Coach</p>
        </div>
    );
}
