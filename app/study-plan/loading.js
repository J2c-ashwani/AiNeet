export default function StudyPlanLoading() {
    return (
        <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ height: '60px', background: 'var(--bg-elevated)', borderRadius: '12px', marginBottom: '24px', animation: 'shimmer 1.5s infinite' }}></div>
            <div style={{ width: '280px', height: '28px', background: 'var(--bg-elevated)', borderRadius: '8px', marginBottom: '8px', animation: 'shimmer 1.5s infinite' }}></div>
            <div style={{ width: '350px', height: '14px', background: 'var(--bg-elevated)', borderRadius: '6px', marginBottom: '32px', animation: 'shimmer 1.5s infinite' }}></div>
            {/* Timeline shimmer */}
            {[1, 2, 3, 4, 5].map(i => (
                <div key={i} style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                    <div style={{ width: '40px', height: '40px', background: 'var(--bg-elevated)', borderRadius: '50%', flexShrink: 0, animation: 'shimmer 1.5s infinite', animationDelay: `${i * 0.1}s` }}></div>
                    <div style={{ flex: 1, height: '80px', background: 'var(--bg-elevated)', borderRadius: '14px', animation: 'shimmer 1.5s infinite', animationDelay: `${i * 0.1}s` }}></div>
                </div>
            ))}
            <style>{`@keyframes shimmer { 0% { opacity: 0.3; } 50% { opacity: 0.6; } 100% { opacity: 0.3; } }`}</style>
        </div>
    );
}
