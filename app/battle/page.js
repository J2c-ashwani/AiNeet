import BattleClient from './BattleClient';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

export default function BattlePage() {
    return (
        <Suspense fallback={
            <div className="loading-overlay" style={{ minHeight: '100vh' }}>
                <div className="spinner" style={{ width: 40, height: 40 }}></div>
            </div>
        }>
            <BattleClient />
        </Suspense>
    );
}
