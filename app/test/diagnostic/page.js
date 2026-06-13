import DiagnosticClient from './DiagnosticClient';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

export default function DiagnosticTestEngine() {
    return (
        <Suspense fallback={
            <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)' }}>
                <div className="spinner" style={{ width: 50, height: 50, marginBottom: 24 }}></div>
                <h2 style={{ fontWeight: 600, marginBottom: 8 }}>Preparing your test...</h2>
                <p>Picking 15 questions across all subjects</p>
            </div>
        }>
            <DiagnosticClient />
        </Suspense>
    );
}
