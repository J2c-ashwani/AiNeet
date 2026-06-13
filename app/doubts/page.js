import DoubtClient from './DoubtClient';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

export default function DoubtSolverPage() {
    return (
        <Suspense fallback={
            <div className="page" style={{ maxWidth: 800, margin: '0 auto', minHeight: 'calc(100dvh - 60px)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div className="spinner" style={{ width: 40, height: 40 }}></div>
            </div>
        }>
            <DoubtClient />
        </Suspense>
    );
}
