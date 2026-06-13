import DownloadClient from './DownloadClient';
import { Suspense } from 'react';

export const metadata = {
    title: 'Download AI NEET Coach App — Free Android APK',
    description:
        'Download the AI NEET Coach Android app. Get personalized NEET mock tests, AI doubt solving, study plans, and rank prediction — right on your phone.',
    openGraph: {
        title: 'Download AI NEET Coach — Android App',
        description:
            'India\'s #1 AI-powered NEET preparation app. Download the APK and start cracking NEET 2026 today!',
        url: 'https://aineetcoach.com/download',
        type: 'website',
    },
};

export const dynamic = 'force-dynamic';

export default function DownloadPage() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid transparent', borderTopColor: 'var(--chemistry)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <style>{`
                    @keyframes spin { to { transform: rotate(360deg); } }
                `}</style>
            </div>
        }>
            <DownloadClient />
        </Suspense>
    );
}
