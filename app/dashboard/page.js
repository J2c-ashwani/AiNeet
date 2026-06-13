import DashboardClient from './DashboardClient';
import { Suspense } from 'react';
import { DashboardSkeleton } from '@/components/skeletons';

export const dynamic = 'force-dynamic';

export default function Dashboard() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: '100vh' }}>
                <DashboardSkeleton />
            </div>
        }>
            <DashboardClient />
        </Suspense>
    );
}
