export default function AnalyticsLoading() {
    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ height: '60px', background: 'var(--bg-elevated)', borderRadius: '12px', marginBottom: '24px', animation: 'shimmer 1.5s infinite' }}></div>
            <div style={{ height: '28px', width: '280px', background: 'var(--bg-elevated)', borderRadius: '8px', marginBottom: '24px', animation: 'shimmer 1.5s infinite' }}></div>

            {/* Charts shimmer */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                <div style={{ height: '250px', background: 'var(--bg-elevated)', borderRadius: '16px', animation: 'shimmer 1.5s infinite' }}></div>
                <div style={{ height: '250px', background: 'var(--bg-elevated)', borderRadius: '16px', animation: 'shimmer 1.5s infinite', animationDelay: '0.15s' }}></div>
            </div>

            {/* Stats shimmer */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                {[1, 2, 3, 4].map(i => (
                    <div key={i} style={{ height: '100px', background: 'var(--bg-elevated)', borderRadius: '14px', animation: 'shimmer 1.5s infinite', animationDelay: `${i * 0.1}s` }}></div>
                ))}
            </div>

            <div style={{ height: '300px', background: 'var(--bg-elevated)', borderRadius: '16px', animation: 'shimmer 1.5s infinite' }}></div>

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
