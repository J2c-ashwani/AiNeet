export default function RevisionLoading() {
    return (
        <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ height: '60px', background: 'var(--bg-elevated)', borderRadius: '12px', marginBottom: '24px', animation: 'shimmer 1.5s infinite' }}></div>
            <div style={{ width: '300px', height: '28px', background: 'var(--bg-elevated)', borderRadius: '8px', marginBottom: '8px', animation: 'shimmer 1.5s infinite' }}></div>
            <div style={{ width: '400px', height: '14px', background: 'var(--bg-elevated)', borderRadius: '6px', marginBottom: '24px', animation: 'shimmer 1.5s infinite' }}></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                {[1, 2, 3].map(i => (
                    <div key={i} style={{ height: '100px', background: 'var(--bg-elevated)', borderRadius: '14px', animation: 'shimmer 1.5s infinite', animationDelay: `${i * 0.1}s` }}></div>
                ))}
            </div>
            {[1, 2, 3, 4].map(i => (
                <div key={i} style={{ height: '90px', background: 'var(--bg-elevated)', borderRadius: '14px', marginBottom: '12px', animation: 'shimmer 1.5s infinite', animationDelay: `${i * 0.08}s` }}></div>
            ))}
            <style>{`@keyframes shimmer { 0% { opacity: 0.3; } 50% { opacity: 0.6; } 100% { opacity: 0.3; } }`}</style>
        </div>
    );
}
