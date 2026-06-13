import OfflineClient from './OfflineClient';
import { Suspense } from 'react';

export const metadata = {
    title: 'Offline — AI NEET Coach',
    description: 'You are currently offline. Please check your internet connection.',
};

export const dynamic = 'force-dynamic';

export default function Page() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid transparent', borderTopColor: 'var(--chemistry)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <style>{`
                    @keyframes spin { to { transform: rotate(360deg); } }
                `}</style>
            </div>
        }>
            <OfflineClient />
        </Suspense>
    );
}
