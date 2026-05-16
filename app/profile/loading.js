export default function ProfileLoading() {
    return (
        <div style={{ padding: 24, maxWidth: 700, margin: '0 auto' }}>
            <div style={{ height: 60, marginBottom: 24, animation: 'shimmer 1.5s infinite' }}></div>

            {/* Avatar shimmer */}
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <div style={{ width: 100, height: 100, margin: '0 auto 16px', animation: 'shimmer 1.5s infinite' }}></div>
                <div style={{ width: 180, height: 24, margin: '0 auto 8px', animation: 'shimmer 1.5s infinite' }}></div>
                <div style={{ width: 220, height: 14, margin: '0 auto', animation: 'shimmer 1.5s infinite' }}></div>
            </div>

            {/* Stats shimmer */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
                {[1, 2, 3].map(i => (
                    <div key={i} style={{ height: 90, animation: 'shimmer 1.5s infinite', animationDelay: `${i * 0.1}s` }}></div>
                ))}
            </div>

            {/* Settings shimmer */}
            <div style={{ height: 200, animation: 'shimmer 1.5s infinite' }}></div>

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
