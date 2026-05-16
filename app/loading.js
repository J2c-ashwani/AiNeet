export default function Loading() {
    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            // Hardcoded background for instant cold-start render
            fontFamily: "'Inter', sans-serif"
        }}>
            <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 100,
                height: 100
            }}>
                {/* Outer spinning glow ring */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    border: '3px solid transparent',
                    borderTopColor: 'var(--text-primary)',
                    borderRightColor: 'var(--text-primary)',
                    animation: 'splashSpin 1s linear infinite'
                }}></div>
                
                {/* Inner Logo */}
                <div style={{
                    fontWeight: 800,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    animation: 'splashPulse 2s ease-in-out infinite'
                }}>
                    AI
                </div>
            </div>
            
            <h2 style={{
                marginTop: 24,
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: 'uppercase'
            }}>
                NEET Coach
            </h2>
            <p style={{
                marginTop: 8,
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
