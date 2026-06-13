import NCERTClient from './NCERTClient';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

export default function NCERTReaderPage() {
    return (
        <div className="page" style={{ height: '100vh', display: 'flex', flexDirection: 'column', padding: 0 }}>
            <Suspense fallback={
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div className="spinner mx-auto w-8 h-8"></div>
                </div>
            }>
                <NCERTClient />
            </Suspense>
        </div>
    );
}
