import { Suspense } from 'react';
import BattlegroundPageContent from './BattlegroundClient';

export const dynamic = 'force-dynamic';

export default function BattlegroundPage() {
    return (
        <Suspense fallback={
            <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)' }}>
                <div className="spinner" style={{ width: 40, height: 40 }} />
            </div>
        }>
            <BattlegroundPageContent />
        </Suspense>
    );
}
