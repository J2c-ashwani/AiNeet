import RegisterClient from './RegisterClient';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui';

export const dynamic = 'force-dynamic';

export default function RegisterPage() {
    return (
        <Suspense fallback={
            <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 280px)', padding: '16px 16px' }}>
                <Skeleton style={{ maxWidth: 440, width: '100%', height: 500 }} />
            </div>
        }>
            <RegisterClient />
        </Suspense>
    );
}
