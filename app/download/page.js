export const metadata = {
    title: 'Download AI NEET Coach App — Free Android APK',
    description:
        'Download the AI NEET Coach Android app. Get personalized NEET mock tests, AI doubt solving, study plans, and rank prediction — right on your phone.',
    openGraph: {
        title: 'Download AI NEET Coach — Android App',
        description:
            'India\'s #1 AI-powered NEET preparation app. Download the APK and start cracking NEET 2026 today!',
        url: 'https://aineetcoach.com/download',
        type: 'website',
    },
};

export default function DownloadPage() {
    const features = [
        { icon: '🧠', title: 'AI Mock Tests', desc: 'Personalized tests that adapt to your weak areas' },
        { icon: '💬', title: 'Instant Doubt Solving', desc: 'Snap a photo, get AI explanations in seconds' },
        { icon: '📊', title: 'Rank Prediction', desc: 'Know exactly where you stand among lakhs of aspirants' },
        { icon: '📅', title: 'Smart Study Plans', desc: 'AI-crafted daily plans based on your goal date' },
        { icon: '📸', title: 'OMR Scanner', desc: 'Scan physical mock tests instantly into your phone' },
        { icon: '🔄', title: 'Spaced Repetition', desc: 'Never forget what you\'ve learned with smart revision' },
        { icon: '⚔️', title: 'Battle Mode', desc: 'Compete with friends in real-time quiz battles' },
    ];

    const steps = [
        { num: '1', text: 'Tap the Download button below' },
        { num: '2', text: 'Allow "Install from unknown sources" if prompted' },
        { num: '3', text: 'Open the APK and tap Install' },
        { num: '4', text: 'Launch AI NEET Coach & start preparing!' },
    ];

    return (
        <div style={styles.page}>
            {/* Animated background blobs */}
            <div style={styles.bgBlob1} />
            <div style={styles.bgBlob2} />
            <div style={styles.bgBlob3} />

            {/* Hero */}
            <section style={styles.hero}>
                <div style={styles.badge}>
                    <span style={styles.badgeDot} />
                    v1.2 — Dark Mode + OMR Upgrade
                </div>

                <h1 style={styles.h1}>
                    Download <span style={styles.gradient}>AI NEET Coach</span>
                </h1>

                <p style={styles.subtitle}>
                    India's #1 AI-powered NEET preparation app.
                    <br />
                    Personalized tests, instant doubt solving & rank prediction — all in your pocket.
                </p>

                {/* Download CTA */}
                <a
                    href="/downloads/neet-coach.apk"
                    download="AI-NEET-Coach-v2.0.apk"
                    style={styles.downloadBtn}
                    id="download-apk-btn"
                >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Download APK for Android
                </a>

                <div style={styles.meta}>
                    <span style={styles.metaItem}>📱 Android 7.0+</span>
                    <span style={styles.metaDivider}>•</span>
                    <span style={styles.metaItem}>📦 46 MB</span>
                    <span style={styles.metaDivider}>•</span>
                    <span style={styles.metaItem}>🔒 Safe & Secure</span>
                </div>
            </section>

            {/* Features */}
            <section style={styles.featuresSection}>
                <h2 style={styles.h2}>Everything you need to crack NEET</h2>
                <div style={styles.featuresGrid}>
                    {features.map((f, i) => (
                        <div key={i} style={styles.featureCard}>
                            <div style={styles.featureIcon}>{f.icon}</div>
                            <h3 style={styles.featureTitle}>{f.title}</h3>
                            <p style={styles.featureDesc}>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Install Steps */}
            <section style={styles.stepsSection}>
                <h2 style={styles.h2}>How to Install</h2>
                <div style={styles.stepsGrid}>
                    {steps.map((s) => (
                        <div key={s.num} style={styles.stepCard}>
                            <div style={styles.stepNum}>{s.num}</div>
                            <p style={styles.stepText}>{s.text}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Trust Banner */}
            <section style={styles.trustSection}>
                <div style={styles.trustCard}>
                    <h3 style={styles.trustTitle}>🛡️ Is this APK safe?</h3>
                    <p style={styles.trustText}>
                        Absolutely! This is the official AI NEET Coach app built by the same team that runs{' '}
                        <a href="https://aineetcoach.com" style={styles.link}>aineetcoach.com</a>.
                        The APK is code-signed and contains no ads, trackers, or malware.
                        We're working on getting it on the Google Play Store soon!
                    </p>
                </div>
            </section>

            {/* Bottom CTA */}
            <section style={styles.bottomCta}>
                <h2 style={styles.h2}>Ready to ace NEET 2026?</h2>
                <a
                    href="/downloads/neet-coach.apk"
                    download="AI-NEET-Coach-v2.0.apk"
                    style={styles.downloadBtn2}
                    id="download-apk-btn-bottom"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Download Now — It&apos;s Free
                </a>
                <p style={styles.footerNote}>
                    Or use the web version at{' '}
                    <a href="https://aineetcoach.com" style={styles.link}>aineetcoach.com</a>
                </p>
            </section>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

                * { box-sizing: border-box; margin: 0; padding: 0; }

                @keyframes float1 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                }
                @keyframes float2 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(-40px, 30px) scale(1.05); }
                    66% { transform: translate(25px, -40px) scale(0.95); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.6; }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                a[id^="download-apk-btn"] {
                    transition: transform 0.2s ease, box-shadow 0.2s ease !important;
                }
                a[id^="download-apk-btn"]:hover {
                    transform: translateY(-3px) !important;
                    box-shadow: 0 20px 60px rgba(16, 185, 129, 0.4) !important;
                }

                div[class*="feature-card"]:hover,
                div:has(> div[style*="featureIcon"]):hover {
                    transform: translateY(-4px) !important;
                    border-color: rgba(16, 185, 129, 0.3) !important;
                }

                @media (max-width: 768px) {
                    h1 { font-size: 2.2rem !important; }
                    section { padding: 2rem 1rem !important; }
                }
            `}</style>
        </div>
    );
}

const styles = {
    page: {
        minHeight: '100vh',
        background: '#0a0e1a',
        color: '#e2e8f0',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        overflow: 'hidden',
        position: 'relative',
    },

    // Background blobs
    bgBlob1: {
        position: 'fixed',
        top: '-20%',
        right: '-10%',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)',
        animation: 'float1 20s ease-in-out infinite',
        pointerEvents: 'none',
        zIndex: 0,
    },
    bgBlob2: {
        position: 'fixed',
        bottom: '-10%',
        left: '-15%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
        animation: 'float2 25s ease-in-out infinite',
        pointerEvents: 'none',
        zIndex: 0,
    },
    bgBlob3: {
        position: 'fixed',
        top: '50%',
        left: '50%',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)',
        animation: 'float1 30s ease-in-out infinite reverse',
        pointerEvents: 'none',
        zIndex: 0,
    },

    // Hero
    hero: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '5rem 1.5rem 3rem',
        position: 'relative',
        zIndex: 1,
        animation: 'slideUp 0.8s ease-out',
    },
    badge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 16px',
        borderRadius: '100px',
        background: 'rgba(16,185,129,0.1)',
        border: '1px solid rgba(16,185,129,0.2)',
        color: '#10b981',
        fontSize: '0.85rem',
        fontWeight: 600,
        marginBottom: '1.5rem',
    },
    badgeDot: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: '#10b981',
        animation: 'pulse 2s ease-in-out infinite',
    },
    h1: {
        fontSize: '3.2rem',
        fontWeight: 900,
        lineHeight: 1.1,
        marginBottom: '1.2rem',
        letterSpacing: '-0.02em',
        color: '#f8fafc',
    },
    gradient: {
        background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 50%, #a855f7 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
    },
    subtitle: {
        fontSize: '1.15rem',
        color: '#94a3b8',
        maxWidth: '520px',
        lineHeight: 1.6,
        marginBottom: '2rem',
    },

    // Download button
    downloadBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '12px',
        padding: '18px 40px',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        color: '#fff',
        fontSize: '1.15rem',
        fontWeight: 700,
        textDecoration: 'none',
        boxShadow: '0 8px 40px rgba(16,185,129,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
        cursor: 'pointer',
        marginBottom: '1.5rem',
    },
    downloadBtn2: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        padding: '16px 36px',
        borderRadius: '14px',
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        color: '#fff',
        fontSize: '1.05rem',
        fontWeight: 700,
        textDecoration: 'none',
        boxShadow: '0 8px 40px rgba(16,185,129,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
        cursor: 'pointer',
        marginBottom: '1rem',
    },

    // Meta info
    meta: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        color: '#64748b',
        fontSize: '0.9rem',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    metaItem: {},
    metaDivider: { color: '#334155' },

    // Features
    featuresSection: {
        padding: '3rem 1.5rem',
        position: 'relative',
        zIndex: 1,
        maxWidth: '900px',
        margin: '0 auto',
    },
    h2: {
        fontSize: '1.8rem',
        fontWeight: 800,
        textAlign: 'center',
        marginBottom: '2rem',
        color: '#f1f5f9',
        letterSpacing: '-0.01em',
    },
    featuresGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '16px',
    },
    featureCard: {
        padding: '24px',
        borderRadius: '16px',
        background: 'rgba(15,23,42,0.6)',
        border: '1px solid rgba(51,65,85,0.5)',
        
        transition: 'transform 0.2s ease, border-color 0.2s ease',
    },
    featureIcon: {
        fontSize: '2rem',
        marginBottom: '12px',
    },
    featureTitle: {
        fontSize: '1.05rem',
        fontWeight: 700,
        color: '#f1f5f9',
        marginBottom: '6px',
    },
    featureDesc: {
        fontSize: '0.9rem',
        color: '#94a3b8',
        lineHeight: 1.5,
    },

    // Steps
    stepsSection: {
        padding: '3rem 1.5rem',
        position: 'relative',
        zIndex: 1,
        maxWidth: '700px',
        margin: '0 auto',
    },
    stepsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '16px',
    },
    stepCard: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '24px 16px',
        borderRadius: '16px',
        background: 'rgba(15,23,42,0.4)',
        border: '1px solid rgba(51,65,85,0.4)',
    },
    stepNum: {
        width: '44px',
        height: '44px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #10b981, #059669)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.2rem',
        fontWeight: 800,
        marginBottom: '12px',
    },
    stepText: {
        fontSize: '0.9rem',
        color: '#cbd5e1',
        lineHeight: 1.4,
    },

    // Trust
    trustSection: {
        padding: '2rem 1.5rem',
        position: 'relative',
        zIndex: 1,
        maxWidth: '700px',
        margin: '0 auto',
    },
    trustCard: {
        padding: '28px',
        borderRadius: '16px',
        background: 'rgba(16,185,129,0.05)',
        border: '1px solid rgba(16,185,129,0.15)',
    },
    trustTitle: {
        fontSize: '1.1rem',
        fontWeight: 700,
        color: '#10b981',
        marginBottom: '10px',
    },
    trustText: {
        fontSize: '0.95rem',
        color: '#94a3b8',
        lineHeight: 1.6,
    },
    link: {
        color: '#10b981',
        textDecoration: 'underline',
    },

    // Bottom CTA
    bottomCta: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '3rem 1.5rem 4rem',
        position: 'relative',
        zIndex: 1,
    },
    footerNote: {
        fontSize: '0.9rem',
        color: '#64748b',
    },
};
