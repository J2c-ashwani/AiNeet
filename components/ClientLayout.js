'use client';

import { useEffect } from 'react';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import OfflineBanner from '@/components/OfflineBanner';
import { AuthProvider } from '@/context/AuthContext';
import QueryProvider from '@/providers/query-provider';
import { bootApp } from '@/lib/boot/orchestrator';
import { isInsideNativeApp } from '@/lib/platform';

function registerServiceWorker() {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;
    if (process.env.NODE_ENV !== 'production') return;

    navigator.serviceWorker.register('/sw.js').catch((error) => {
        console.error('[SERVICE_WORKER_REGISTER_FAILED]', error);
    });
}

export default function ClientLayout({ children }) {
    useEffect(() => {
        bootApp();
        registerServiceWorker();

        // Force scroll to top on mount (prevents WebView rendering from bottom)
        window.scrollTo(0, 0);

        // App-Shell Scoped Zoom Lock
        // Only disable zoom if we are inside the Android WebView
        if (isInsideNativeApp()) {
            let meta = document.querySelector('meta[name="viewport"]');
            if (!meta) {
                meta = document.createElement('meta');
                meta.name = 'viewport';
                document.head.appendChild(meta);
            }
            meta.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0';
        }
    }, []);

    return (
        // QueryProvider wraps everything to give React Query + SWR context to all client components
        <QueryProvider>
            <AuthProvider>
                <OfflineBanner />
                <Navbar />
                <main style={{ flex: 1 }}>
                    {children}
                </main>
                <Footer />
            </AuthProvider>
        </QueryProvider>
    );
}
