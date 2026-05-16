export default function DoubtsLoading() {
    return (
        <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
            <div style={{ height: 60, marginBottom: 24, animation: 'shimmer 1.5s infinite' }}></div>
            <div style={{ display: 'flex', gap: 24 }}>
                {/* Sidebar */}
                <div style={{ width: 280, flexShrink: 0 }}>
                    <div style={{ height: 44, marginBottom: 12, animation: 'shimmer 1.5s infinite' }}></div>
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} style={{ height: 60, marginBottom: 8, animation: 'shimmer 1.5s infinite', animationDelay: `${i * 0.1}s` }}></div>
                    ))}
                </div>
                {/* Chat area */}
                <div style={{ flex: 1 }}>
                    <div style={{ height: 400, marginBottom: 16, animation: 'shimmer 1.5s infinite' }}></div>
                    <div style={{ height: 52, animation: 'shimmer 1.5s infinite' }}></div>
                </div>
            </div>
            <style>{`@keyframes shimmer { 0% { opacity: 0.3; } 50% { opacity: 0.6; } 100% { opacity: 0.3; } }`}</style>
        </div>
    );
}
