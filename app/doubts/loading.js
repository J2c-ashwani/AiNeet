export default function DoubtsLoading() {
    return (
        <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ height: '60px', background: 'var(--bg-elevated)', borderRadius: '12px', marginBottom: '24px', animation: 'shimmer 1.5s infinite' }}></div>
            <div style={{ display: 'flex', gap: '24px' }}>
                {/* Sidebar */}
                <div style={{ width: '280px', flexShrink: 0 }}>
                    <div style={{ height: '44px', background: 'var(--bg-elevated)', borderRadius: '12px', marginBottom: '12px', animation: 'shimmer 1.5s infinite' }}></div>
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} style={{ height: '60px', background: 'var(--bg-elevated)', borderRadius: '10px', marginBottom: '8px', animation: 'shimmer 1.5s infinite', animationDelay: `${i * 0.1}s` }}></div>
                    ))}
                </div>
                {/* Chat area */}
                <div style={{ flex: 1 }}>
                    <div style={{ height: '400px', background: 'var(--bg-elevated)', borderRadius: '16px', marginBottom: '16px', animation: 'shimmer 1.5s infinite' }}></div>
                    <div style={{ height: '52px', background: 'var(--bg-elevated)', borderRadius: '12px', animation: 'shimmer 1.5s infinite' }}></div>
                </div>
            </div>
            <style>{`@keyframes shimmer { 0% { opacity: 0.3; } 50% { opacity: 0.6; } 100% { opacity: 0.3; } }`}</style>
        </div>
    );
}
