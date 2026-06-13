import ConfigureClient from './ConfigureClient';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

export default function TestConfigPage() {
    return (
        <Suspense fallback={
            <div className="loading-overlay" style={{ minHeight: '100vh' }}>
                <div className="spinner" style={{ width: 40, height: 40 }}></div>
            </div>
        }>
            <ConfigureClient />
        </Suspense>
    );
}
