import { Suspense } from 'react';
import RevisionPageContent from './RevisionClient';

export const dynamic = 'force-dynamic';

export default function RevisionPage() {
    return (
        <Suspense fallback={
            <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)' }}>
                <div className="spinner" style={{ width: 40, height: 40 }} />
            </div>
        }>
            <RevisionPageContent />
        </Suspense>
    );
}
