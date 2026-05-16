export default function BattleLoading() {
    return (
        <div style={{ padding: 24, maxWidth: 700, margin: '0 auto' }}>
            <div style={{ height: 60, marginBottom: 24, animation: 'shimmer 1.5s infinite' }}></div>

            <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <div style={{ width: 80, height: 80, margin: '0 auto 16px', animation: 'shimmer 1.5s infinite' }}></div>
                <div style={{ width: 300, height: 32, margin: '0 auto 8px', animation: 'shimmer 1.5s infinite' }}></div>
                <div style={{ width: 450, height: 16, margin: '0 auto', animation: 'shimmer 1.5s infinite' }}></div>
            </div>

            <div style={{ height: 260, marginBottom: 24, animation: 'shimmer 1.5s infinite' }}></div>
            <div style={{ height: 150, animation: 'shimmer 1.5s infinite', animationDelay: '0.15s' }}></div>

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
