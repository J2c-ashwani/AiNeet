'use client';

import { useEffect } from 'react';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/context/AuthContext';

export default function ClientLayout({ children }) {
    useEffect(() => {
        // Force scroll to top on mount (prevents WebView rendering from bottom)
        window.scrollTo(0, 0);

        // App-Shell Scoped Zoom Lock
        // Only disable zoom if we are inside the Android WebView
        if (window.showInterstitialAd) {
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
        <AuthProvider>

            <Navbar />
            <main style={{ flex: 1 }}>
                {children}
            </main>
            <Footer />
        </AuthProvider>
    );
}
