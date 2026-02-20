export default function LeaderboardLoading() {
    return (
        <div style={{ padding: '24px', maxWidth: '700px', margin: '0 auto' }}>
            <div style={{ height: '60px', background: 'var(--bg-elevated)', borderRadius: '12px', marginBottom: '24px', animation: 'shimmer 1.5s infinite' }}></div>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div style={{ width: '250px', height: '32px', background: 'var(--bg-elevated)', borderRadius: '8px', margin: '0 auto 8px', animation: 'shimmer 1.5s infinite' }}></div>
                <div style={{ width: '180px', height: '14px', background: 'var(--bg-elevated)', borderRadius: '6px', margin: '0 auto', animation: 'shimmer 1.5s infinite' }}></div>
            </div>
            {/* Podium */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '32px' }}>
                {[1, 2, 3].map(i => (
                    <div key={i} style={{ width: '120px', height: `${140 - i * 20}px`, background: 'var(--bg-elevated)', borderRadius: '14px', animation: 'shimmer 1.5s infinite', animationDelay: `${i * 0.1}s` }}></div>
                ))}
            </div>
            {/* Rows */}
            {[1, 2, 3, 4, 5, 6, 7].map(i => (
                <div key={i} style={{ height: '56px', background: 'var(--bg-elevated)', borderRadius: '12px', marginBottom: '8px', animation: 'shimmer 1.5s infinite', animationDelay: `${i * 0.06}s` }}></div>
            ))}
            <style>{`@keyframes shimmer { 0% { opacity: 0.3; } 50% { opacity: 0.6; } 100% { opacity: 0.3; } }`}</style>
        </div>
    );
}
