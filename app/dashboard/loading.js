export default function DashboardLoading() {
    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Navbar placeholder */}
            <div style={{ height: '60px', background: 'var(--bg-elevated)', borderRadius: '12px', marginBottom: '24px', animation: 'shimmer 1.5s infinite' }}></div>

            {/* Welcome header shimmer */}
            <div style={{ marginBottom: '32px' }}>
                <div style={{ width: '300px', height: '28px', background: 'var(--bg-elevated)', borderRadius: '8px', marginBottom: '8px', animation: 'shimmer 1.5s infinite' }}></div>
                <div style={{ width: '200px', height: '16px', background: 'var(--bg-elevated)', borderRadius: '6px', animation: 'shimmer 1.5s infinite' }}></div>
            </div>

            {/* Stats grid shimmer */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                {[1, 2, 3, 4].map(i => (
                    <div key={i} style={{ height: '120px', background: 'var(--bg-elevated)', borderRadius: '16px', animation: 'shimmer 1.5s infinite', animationDelay: `${i * 0.1}s` }}></div>
                ))}
            </div>

            {/* Content grid shimmer */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div style={{ height: '300px', background: 'var(--bg-elevated)', borderRadius: '16px', animation: 'shimmer 1.5s infinite' }}></div>
                <div style={{ height: '300px', background: 'var(--bg-elevated)', borderRadius: '16px', animation: 'shimmer 1.5s infinite', animationDelay: '0.2s' }}></div>
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
