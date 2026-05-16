export default function AnalyticsLoading() {
    return (
        <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ height: 60, marginBottom: 24, animation: 'shimmer 1.5s infinite' }}></div>
            <div style={{ height: 28, width: 280, marginBottom: 24, animation: 'shimmer 1.5s infinite' }}></div>

            {/* Charts shimmer */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
                <div style={{ height: 250, animation: 'shimmer 1.5s infinite' }}></div>
                <div style={{ height: 250, animation: 'shimmer 1.5s infinite', animationDelay: '0.15s' }}></div>
            </div>

            {/* Stats shimmer */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
                {[1, 2, 3, 4].map(i => (
                    <div key={i} style={{ height: 100, animation: 'shimmer 1.5s infinite', animationDelay: `${i * 0.1}s` }}></div>
                ))}
            </div>

            <div style={{ height: 300, animation: 'shimmer 1.5s infinite' }}></div>

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
