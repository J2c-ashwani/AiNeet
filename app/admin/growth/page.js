import GrowthClient from './GrowthClient';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui';

export const dynamic = 'force-dynamic';

export default function GrowthCopilotPage() {
    return (
        <Suspense fallback={
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px', minHeight: '100vh', }}>
                <Skeleton style={{ width: '100%', height: 600 }} />
            </div>
        }>
            <GrowthClient />
        </Suspense>
    );
}
