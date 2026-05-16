export default function MistakesLoading() {
    return (
        <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
            <div style={{ height: 60, marginBottom: 24, animation: 'shimmer 1.5s infinite' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <div style={{ width: 250, height: 28, marginBottom: 8, animation: 'shimmer 1.5s infinite' }}></div>
                    <div style={{ width: 350, height: 14, animation: 'shimmer 1.5s infinite' }}></div>
                </div>
                <div style={{ width: 140, height: 44, animation: 'shimmer 1.5s infinite' }}></div>
            </div>

            {[1, 2, 3, 4].map(i => (
                <div key={i} style={{ height: 110, marginBottom: 16, animation: 'shimmer 1.5s infinite', animationDelay: `${i * 0.1}s` }}></div>
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
