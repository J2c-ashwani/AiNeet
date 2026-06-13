import MistakesClient from './MistakesClient';
import { Suspense } from 'react';
import { MistakeCardsSkeleton } from '@/components/skeletons';

export const dynamic = 'force-dynamic';

export default function MistakesPage() {
    return (
        <Suspense fallback={<MistakeCardsSkeleton count={4} />}>
            <MistakesClient />
        </Suspense>
    );
}
