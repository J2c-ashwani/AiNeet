export default function DashboardLoading() {
    return (
        <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
            {/* Navbar placeholder */}
            <div style={{ height: 60, marginBottom: 24, animation: 'shimmer 1.5s infinite' }}></div>

            {/* Welcome header shimmer */}
            <div style={{ marginBottom: 32 }}>
                <div style={{ width: 300, height: 28, marginBottom: 8, animation: 'shimmer 1.5s infinite' }}></div>
                <div style={{ width: 200, height: 16, animation: 'shimmer 1.5s infinite' }}></div>
            </div>

            {/* Stats grid shimmer */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
                {[1, 2, 3, 4].map(i => (
                    <div key={i} style={{ height: 120, animation: 'shimmer 1.5s infinite', animationDelay: `${i * 0.1}s` }}></div>
                ))}
            </div>

            {/* Content grid shimmer */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div style={{ height: 300, animation: 'shimmer 1.5s infinite' }}></div>
                <div style={{ height: 300, animation: 'shimmer 1.5s infinite', animationDelay: '0.2s' }}></div>
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
