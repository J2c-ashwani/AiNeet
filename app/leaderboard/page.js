import LeaderboardClient from './LeaderboardClient';
import { Suspense } from 'react';
import { LeaderboardSkeleton } from '@/components/skeletons';

export const dynamic = 'force-dynamic';

export default function LeaderboardPage() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: '100vh', padding: 0 }}>
                <LeaderboardSkeleton rows={10} />
            </div>
        }>
            <LeaderboardClient />
        </Suspense>
    );
}
