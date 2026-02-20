export default function BattleLoading() {
    return (
        <div style={{ padding: '24px', maxWidth: '700px', margin: '0 auto' }}>
            <div style={{ height: '60px', background: 'var(--bg-elevated)', borderRadius: '12px', marginBottom: '24px', animation: 'shimmer 1.5s infinite' }}></div>

            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <div style={{ width: '80px', height: '80px', background: 'var(--bg-elevated)', borderRadius: '50%', margin: '0 auto 16px', animation: 'shimmer 1.5s infinite' }}></div>
                <div style={{ width: '300px', height: '32px', background: 'var(--bg-elevated)', borderRadius: '8px', margin: '0 auto 8px', animation: 'shimmer 1.5s infinite' }}></div>
                <div style={{ width: '450px', height: '16px', background: 'var(--bg-elevated)', borderRadius: '6px', margin: '0 auto', animation: 'shimmer 1.5s infinite' }}></div>
            </div>

            <div style={{ height: '260px', background: 'var(--bg-elevated)', borderRadius: '16px', marginBottom: '24px', animation: 'shimmer 1.5s infinite' }}></div>
            <div style={{ height: '150px', background: 'var(--bg-elevated)', borderRadius: '16px', animation: 'shimmer 1.5s infinite', animationDelay: '0.15s' }}></div>

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
