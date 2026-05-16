export default function StudyPlanLoading() {
    return (
        <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
            <div style={{ height: 60, marginBottom: 24, animation: 'shimmer 1.5s infinite' }}></div>
            <div style={{ width: 280, height: 28, marginBottom: 8, animation: 'shimmer 1.5s infinite' }}></div>
            <div style={{ width: 350, height: 14, marginBottom: 32, animation: 'shimmer 1.5s infinite' }}></div>
            {/* Timeline shimmer */}
            {[1, 2, 3, 4, 5].map(i => (
                <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                    <div style={{ width: 40, height: 40, flexShrink: 0, animation: 'shimmer 1.5s infinite', animationDelay: `${i * 0.1}s` }}></div>
                    <div style={{ flex: 1, height: 80, animation: 'shimmer 1.5s infinite', animationDelay: `${i * 0.1}s` }}></div>
                </div>
            ))}
            <style>{`@keyframes shimmer { 0% { opacity: 0.3; } 50% { opacity: 0.6; } 100% { opacity: 0.3; } }`}</style>
        </div>
    );
}
