export default function NcertLoading() {
    return (
        <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
            <div style={{ height: 60, marginBottom: 24, animation: 'shimmer 1.5s infinite' }}></div>
            <div style={{ width: 250, height: 28, marginBottom: 24, animation: 'shimmer 1.5s infinite' }}></div>
            {/* Subject tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                {[1, 2, 3].map(i => (
                    <div key={i} style={{ width: 100, height: 36, animation: 'shimmer 1.5s infinite', animationDelay: `${i * 0.1}s` }}></div>
                ))}
            </div>
            {/* Book cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} style={{ height: 180, animation: 'shimmer 1.5s infinite', animationDelay: `${i * 0.08}s` }}></div>
                ))}
            </div>
            <style>{`@keyframes shimmer { 0% { opacity: 0.3; } 50% { opacity: 0.6; } 100% { opacity: 0.3; } }`}</style>
        </div>
    );
}
