export default function MistakesLoading() {
    return (
        <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ height: '60px', background: 'var(--bg-elevated)', borderRadius: '12px', marginBottom: '24px', animation: 'shimmer 1.5s infinite' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <div style={{ width: '250px', height: '28px', background: 'var(--bg-elevated)', borderRadius: '8px', marginBottom: '8px', animation: 'shimmer 1.5s infinite' }}></div>
                    <div style={{ width: '350px', height: '14px', background: 'var(--bg-elevated)', borderRadius: '6px', animation: 'shimmer 1.5s infinite' }}></div>
                </div>
                <div style={{ width: '140px', height: '44px', background: 'var(--bg-elevated)', borderRadius: '12px', animation: 'shimmer 1.5s infinite' }}></div>
            </div>

            {[1, 2, 3, 4].map(i => (
                <div key={i} style={{ height: '110px', background: 'var(--bg-elevated)', borderRadius: '16px', marginBottom: '16px', animation: 'shimmer 1.5s infinite', animationDelay: `${i * 0.1}s` }}></div>
            ))}

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
