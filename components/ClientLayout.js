'use client';

import { useState, useEffect } from 'react';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/context/AuthContext';

export default function ClientLayout({ children }) {
    const [hydrated, setHydrated] = useState(false);

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

        // Short delay to allow auth context to initialise before revealing UI
        const timer = setTimeout(() => setHydrated(true), 400);
        return () => clearTimeout(timer);
    }, []);

    return (
        <AuthProvider>
            {/* Splash overlay — hides white/footer flash during hydration */}
            {!hydrated && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 9999,
                    background: 'var(--bg-primary, #0a0a0f)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '16px',
                    transition: 'opacity 0.3s ease',
                }}>
                    <div style={{ fontSize: '3rem' }}>🧠</div>
                    <div style={{
                        fontWeight: 700,
                        fontSize: '1.25rem',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: '-0.5px',
                    }}>
                        AI NEET Coach
                    </div>
                    <div style={{
                        width: '40px',
                        height: '3px',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        borderRadius: '2px',
                        animation: 'pulse 1s ease-in-out infinite',
                    }} />
                </div>
            )}
            <Navbar />
            <main style={{ flex: 1 }}>
                {children}
            </main>
            <Footer />
        </AuthProvider>
    );
}
