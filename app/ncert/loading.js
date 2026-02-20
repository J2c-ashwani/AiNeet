export default function NcertLoading() {
    return (
        <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ height: '60px', background: 'var(--bg-elevated)', borderRadius: '12px', marginBottom: '24px', animation: 'shimmer 1.5s infinite' }}></div>
            <div style={{ width: '250px', height: '28px', background: 'var(--bg-elevated)', borderRadius: '8px', marginBottom: '24px', animation: 'shimmer 1.5s infinite' }}></div>
            {/* Subject tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                {[1, 2, 3].map(i => (
                    <div key={i} style={{ width: '100px', height: '36px', background: 'var(--bg-elevated)', borderRadius: '999px', animation: 'shimmer 1.5s infinite', animationDelay: `${i * 0.1}s` }}></div>
                ))}
            </div>
            {/* Book cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} style={{ height: '180px', background: 'var(--bg-elevated)', borderRadius: '16px', animation: 'shimmer 1.5s infinite', animationDelay: `${i * 0.08}s` }}></div>
                ))}
            </div>
            <style>{`@keyframes shimmer { 0% { opacity: 0.3; } 50% { opacity: 0.6; } 100% { opacity: 0.3; } }`}</style>
        </div>
    );
}
