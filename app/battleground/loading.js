export default function BattlegroundLoading() {
    return (
        <div style={{ padding: 24, maxWidth: 700, margin: '0 auto' }}>
            <div style={{ height: 60, marginBottom: 24, animation: 'shimmer 1.5s infinite' }}></div>

            {/* Title shimmer */}
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <div style={{ width: 60, height: 60, margin: '0 auto 16px', animation: 'shimmer 1.5s infinite' }}></div>
                <div style={{ width: 280, height: 28, margin: '0 auto 8px', animation: 'shimmer 1.5s infinite' }}></div>
                <div style={{ width: 400, height: 16, margin: '0 auto', animation: 'shimmer 1.5s infinite' }}></div>
            </div>

            {/* Create/Join cards shimmer */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div style={{ height: 280, animation: 'shimmer 1.5s infinite' }}></div>
                <div style={{ height: 280, animation: 'shimmer 1.5s infinite', animationDelay: '0.15s' }}></div>
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
