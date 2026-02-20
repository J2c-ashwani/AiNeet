export default function TestLoading() {
    return (
        <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ height: '60px', background: 'var(--bg-elevated)', borderRadius: '12px', marginBottom: '24px', animation: 'shimmer 1.5s infinite' }}></div>
            <div style={{ height: '24px', width: '250px', background: 'var(--bg-elevated)', borderRadius: '8px', marginBottom: '24px', animation: 'shimmer 1.5s infinite' }}></div>

            {/* Test type cards shimmer */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} style={{ width: '180px', height: '80px', background: 'var(--bg-elevated)', borderRadius: '12px', animation: 'shimmer 1.5s infinite', animationDelay: `${i * 0.08}s` }}></div>
                ))}
            </div>

            {/* Options shimmer */}
            <div style={{ height: '200px', background: 'var(--bg-elevated)', borderRadius: '16px', marginBottom: '16px', animation: 'shimmer 1.5s infinite' }}></div>
            <div style={{ height: '56px', background: 'var(--bg-elevated)', borderRadius: '12px', animation: 'shimmer 1.5s infinite' }}></div>

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
