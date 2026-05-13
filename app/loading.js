export default function Loading() {
    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#080c18', // Hardcoded background for instant cold-start render
            zIndex: 'var(--z-critical)',
            fontFamily: "'Inter', sans-serif"
        }}>
            <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100px',
                height: '100px'
            }}>
                {/* Outer spinning glow ring */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '50%',
                    border: '3px solid transparent',
                    borderTopColor: '#6366f1',
                    borderRightColor: '#a855f7',
                    animation: 'splashSpin 1s linear infinite'
                }}></div>
                
                {/* Inner Logo */}
                <div style={{
                    fontSize: '2rem',
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #818cf8, #c084fc)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    animation: 'splashPulse 2s ease-in-out infinite'
                }}>
                    AI
                </div>
            </div>
            
            <h2 style={{
                marginTop: '24px',
                fontSize: '1.2rem',
                fontWeight: 700,
                color: '#f8fafc',
                letterSpacing: '2px',
                textTransform: 'uppercase'
            }}>
                NEET Coach
            </h2>
            <p style={{
                marginTop: '8px',
                fontSize: '0.85rem',
                color: '#64748b',
                animation: 'splashPulse 2s ease-in-out infinite'
            }}>
                Warming up AI engine...
            </p>

            <style dangerouslySetInnerHTML={{__html: `
                @keyframes splashSpin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes splashPulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.7; transform: scale(0.95); }
                }
            `}} />
        </div>
    );
}
