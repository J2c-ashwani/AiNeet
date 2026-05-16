export default function RevisionLoading() {
    return (
        <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
            <div style={{ height: 60, marginBottom: 24, animation: 'shimmer 1.5s infinite' }}></div>
            <div style={{ width: 300, height: 28, marginBottom: 8, animation: 'shimmer 1.5s infinite' }}></div>
            <div style={{ width: 400, height: 14, marginBottom: 24, animation: 'shimmer 1.5s infinite' }}></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
                {[1, 2, 3].map(i => (
                    <div key={i} style={{ height: 100, animation: 'shimmer 1.5s infinite', animationDelay: `${i * 0.1}s` }}></div>
                ))}
            </div>
            {[1, 2, 3, 4].map(i => (
                <div key={i} style={{ height: 90, marginBottom: 12, animation: 'shimmer 1.5s infinite', animationDelay: `${i * 0.08}s` }}></div>
            ))}
            <style>{`@keyframes shimmer { 0% { opacity: 0.3; } 50% { opacity: 0.6; } 100% { opacity: 0.3; } }`}</style>
        </div>
    );
}
