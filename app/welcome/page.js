import WelcomeClient from './WelcomeClient';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

export default function WelcomePage() {
    return (
        <Suspense fallback={
            <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                <div className="spinner" style={{ width: 40, height: 40 }} />
            </div>
        }>
            <WelcomeClient />
        </Suspense>
    );
}
