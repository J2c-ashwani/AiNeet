export default function ProfileLoading() {
    return (
        <div style={{ padding: '24px', maxWidth: '700px', margin: '0 auto' }}>
            <div style={{ height: '60px', background: 'var(--bg-elevated)', borderRadius: '12px', marginBottom: '24px', animation: 'shimmer 1.5s infinite' }}></div>

            {/* Avatar shimmer */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div style={{ width: '100px', height: '100px', background: 'var(--bg-elevated)', borderRadius: '50%', margin: '0 auto 16px', animation: 'shimmer 1.5s infinite' }}></div>
                <div style={{ width: '180px', height: '24px', background: 'var(--bg-elevated)', borderRadius: '8px', margin: '0 auto 8px', animation: 'shimmer 1.5s infinite' }}></div>
                <div style={{ width: '220px', height: '14px', background: 'var(--bg-elevated)', borderRadius: '6px', margin: '0 auto', animation: 'shimmer 1.5s infinite' }}></div>
            </div>

            {/* Stats shimmer */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                {[1, 2, 3].map(i => (
                    <div key={i} style={{ height: '90px', background: 'var(--bg-elevated)', borderRadius: '14px', animation: 'shimmer 1.5s infinite', animationDelay: `${i * 0.1}s` }}></div>
                ))}
            </div>

            {/* Settings shimmer */}
            <div style={{ height: '200px', background: 'var(--bg-elevated)', borderRadius: '16px', animation: 'shimmer 1.5s infinite' }}></div>

            <style>{`
                @keyframes shimmer {
                    0% { opacity: 0.3; }
                    50% { opacity: 0.6; }
                    100% { opacity: 0.3; }
                }
            `}</style>
        </div>
    );
}
