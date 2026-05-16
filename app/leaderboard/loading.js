export default function LeaderboardLoading() {
    return (
        <div style={{ padding: 24, maxWidth: 700, margin: '0 auto' }}>
            <div style={{ height: 60, marginBottom: 24, animation: 'shimmer 1.5s infinite' }}></div>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <div style={{ width: 250, height: 32, margin: '0 auto 8px', animation: 'shimmer 1.5s infinite' }}></div>
                <div style={{ width: 180, height: 14, margin: '0 auto', animation: 'shimmer 1.5s infinite' }}></div>
            </div>
            {/* Podium */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 32 }}>
                {[1, 2, 3].map(i => (
                    <div key={i} style={{ width: 120, height: `${140 - i * 20}px`, animation: 'shimmer 1.5s infinite', animationDelay: `${i * 0.1}s` }}></div>
                ))}
            </div>
            {/* Rows */}
            {[1, 2, 3, 4, 5, 6, 7].map(i => (
                <div key={i} style={{ height: 56, marginBottom: 8, animation: 'shimmer 1.5s infinite', animationDelay: `${i * 0.06}s` }}></div>
            ))}
            <style>{`@keyframes shimmer { 0% { opacity: 0.3; } 50% { opacity: 0.6; } 100% { opacity: 0.3; } }`}</style>
        </div>
    );
}
