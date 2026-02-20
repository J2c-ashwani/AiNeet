export default function Loading() {
    return (
        <div className="loading-overlay" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
            <div className="spinner" style={{ width: 44, height: 44 }}></div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading...</p>
        </div>
    );
}
