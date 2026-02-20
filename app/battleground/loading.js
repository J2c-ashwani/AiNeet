export default function BattlegroundLoading() {
    return (
        <div style={{ padding: '24px', maxWidth: '700px', margin: '0 auto' }}>
            <div style={{ height: '60px', background: 'var(--bg-elevated)', borderRadius: '12px', marginBottom: '24px', animation: 'shimmer 1.5s infinite' }}></div>

            {/* Title shimmer */}
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <div style={{ width: '60px', height: '60px', background: 'var(--bg-elevated)', borderRadius: '50%', margin: '0 auto 16px', animation: 'shimmer 1.5s infinite' }}></div>
                <div style={{ width: '280px', height: '28px', background: 'var(--bg-elevated)', borderRadius: '8px', margin: '0 auto 8px', animation: 'shimmer 1.5s infinite' }}></div>
                <div style={{ width: '400px', height: '16px', background: 'var(--bg-elevated)', borderRadius: '6px', margin: '0 auto', animation: 'shimmer 1.5s infinite' }}></div>
            </div>

            {/* Create/Join cards shimmer */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div style={{ height: '280px', background: 'var(--bg-elevated)', borderRadius: '16px', animation: 'shimmer 1.5s infinite' }}></div>
                <div style={{ height: '280px', background: 'var(--bg-elevated)', borderRadius: '16px', animation: 'shimmer 1.5s infinite', animationDelay: '0.15s' }}></div>
            </div>

            <style>{`
                @keyframes shimmer {
                    0% { opacity: 0.3; }
                    50% { opacity: 0.6; }
                    100% { opacity: 0.3; }
                }
            `}</style>
        </div>
    );
}
