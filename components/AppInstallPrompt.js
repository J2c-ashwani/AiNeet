'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

// You can change the 'mode' prop to determine aggressiveness
// 'soft' -> Sticky banner at bottom (User can still use web app)
// 'hard' -> Blocking modal overlay (User MUST use native app). Only triggered if showModal=true.
export default function AppInstallPrompt({ mode = 'soft', triggerLevel = 'always', showModal = false, onClose }) {
    const [isMobile, setIsMobile] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    const PLAY_STORE_URL = process.env.NEXT_PUBLIC_PLAY_STORE_URL || 'https://play.google.com/store/apps/details?id=com.aineetcoach.app';

    useEffect(() => {
        // Simple mobile detection on mount
        const userAgent = typeof window.navigator === 'undefined' ? '' : navigator.userAgent;
        const mobile = Boolean(userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i));
        setIsMobile(mobile);

        // Check if previously dismissed (only respect dismiss for 'soft' mode)
        if (mode === 'soft') {
            const isDismissed = sessionStorage.getItem('appPromoDismissed');
            if (isDismissed) setDismissed(true);
        }
    }, [mode]);

    // Expose the isMobile state through a global or context? No, simpler: just block the click on the parent component.
    // The AppInstallPrompt will just render the UI.

    if (!isMobile) return null; // Don't show on desktop

    if (mode === 'hard') {
        if (!showModal) return null; // Wait for trigger

        return (
            <div className="fixed inset-0 z-[9999] bg-black/90 flex flex-col items-center justify-center p-6 text-center backdrop-blur-md">
                <div className="bg-gray-900 border border-gray-800 p-8 rounded-3xl max-w-sm w-full shadow-2xl relative overflow-hidden">
                    {onClose && (
                        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white z-20 text-xl font-bold p-2 leading-none">
                            ✕
                        </button>
                    )}
                    <div className="absolute top-0 right-0 p-4 opacity-5 text-8xl pointer-events-none z-0">📱</div>

                    <div className="text-5xl mb-6">📱</div>
                    <h2 className="text-2xl font-bold text-white mb-2">App Required</h2>
                    <p className="text-gray-400 mb-8 text-sm leading-relaxed">
                        Tests can only be taken on the app. <br />Download the NEET Coach App to continue.
                    </p>

                    <a
                        href={PLAY_STORE_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary btn-lg w-full flex items-center justify-center gap-2"
                        style={{ padding: '16px', fontSize: '1.1rem' }}
                    >
                        <svg viewBox="0 0 512 512" width="24" height="24" fill="currentColor">
                            <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
                        </svg>
                        Download on Google Play
                    </a>
                </div>
            </div>
        );
    }

    // Soft banner
    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-indigo-900/95 border-t border-indigo-500/30 p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] backdrop-blur-sm transform transition-transform">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-inner shrink-0 leading-none pb-1">
                        🧠
                    </div>
                    <div>
                        <div className="text-white font-bold text-sm leading-tight">NEET Coach App</div>
                        <div className="text-indigo-200 text-xs">Faster tests & AI offline</div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <a
                        href={PLAY_STORE_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white text-indigo-900 px-4 py-2 rounded-full font-bold text-sm shadow-md hover:bg-indigo-50"
                    >
                        Install
                    </a>
                    <button
                        onClick={() => {
                            setDismissed(true);
                            sessionStorage.setItem('appPromoDismissed', 'true');
                        }}
                        className="text-indigo-300 hover:text-white p-2 shrink-0"
                        aria-label="Dismiss banner"
                    >
                        ✕
                    </button>
                </div>
            </div>
        </div>
    );
}
