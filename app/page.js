import HomeClient from './HomeClient';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui';

export const dynamic = 'force-dynamic';

export default function Home() {
    return (
        <Suspense fallback={
            <div className="page" style={{ padding: '24px 16px', maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <div>
                        <Skeleton style={{ width: 220, height: 32, marginBottom: 8 }} />
                        <Skeleton style={{ width: 180, height: 18 }} />
                    </div>
                    <Skeleton style={{ width: 120, height: 28 }} />
                </div>
                <Skeleton style={{ height: 120, marginBottom: 24 }} />
                <div className="grid grid-3" style={{ gap: 16, marginBottom: 24 }}>
                    <Skeleton style={{ height: 90 }} />
                    <Skeleton style={{ height: 90 }} />
                    <Skeleton style={{ height: 90 }} />
                </div>
            </div>
        }>
            <HomeClient />
        </Suspense>
    );
}
