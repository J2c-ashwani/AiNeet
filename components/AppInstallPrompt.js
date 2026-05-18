'use client';
import { useState, useEffect } from 'react';
import { isInsideNativeApp, isMobileLikeBrowser } from '@/lib/platform';
import { Button } from '@/components/ui';
import { Icon } from '@/components/ui/Icon';

// You can change the 'mode' prop to determine aggressiveness
// 'soft' -> Sticky banner at bottom (User can still use web app)
// 'hard' -> Blocking modal overlay (User MUST use native app). Only triggered if showModal=true.
export default function AppInstallPrompt({ mode = 'soft', triggerLevel = 'always', showModal = false, onClose }) {
    const [isMobile, setIsMobile] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    const DOWNLOAD_URL = process.env.NEXT_PUBLIC_PLAY_STORE_URL || '/download';

    useEffect(() => {
        setIsMobile(isMobileLikeBrowser() && !isInsideNativeApp());

        // Check if previously dismissed (only respect dismiss for 'soft' mode)
        if (mode === 'soft') {
            const isDismissed = sessionStorage.getItem('appPromoDismissed');
            if (isDismissed) setDismissed(true);
        }
    }, [mode]);

    if (!isMobile) return null; // Don't show on desktop or inside native app

    if (mode === 'hard') {
        if (!showModal) return null; // Wait for trigger

        return (
            <div className="fixed inset-0 z-[9999] surface_black_90 flex flex-col items-center justify-center space_pa_6 text-center backdrop-blur-md">
                <div className="surface_gray_900 border line_gray_800 space_pa_8 radius_3xl max-w-sm w-full shadow-2xl relative overflow-hidden">
                    {onClose && (
                        <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close" className="absolute top-2 right-2 tone_gray_500 hover_tone_white z-20 text-xl font-bold w-11 h-11 flex items-center justify-center space_pa_2">
                            <Icon name="X" size={18} />
                        </Button>
                    )}

                    <div className="w-16 h-16 mx-auto surface_indigo_600 radius_2xl flex items-center justify-center space_mb_6">
                        <Icon name="Download" size={28} className="tone_white" />
                    </div>
                    <h2 className="text-2xl font-bold tone_white space_mb_2">App Required</h2>
                    <p className="tone_gray_400 space_mb_8 text-sm leading-relaxed">
                        Tests can only be taken on the Android app. <br />Install NEET Coach to continue.
                    </p>

                    <a
                        href={DOWNLOAD_URL}
                        className="btn btn-primary btn-lg w-full flex items-center justify-center gap-2"
                        style={{ padding: '16px', fontSize: '1.1rem' }}
                    >
                        <Icon name="Download" size={18} />
                        Install Android App
                    </a>
                </div>
            </div>
        );
    }

    // Soft banner
    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 surface_indigo_900_95 border-t line_indigo_500_30 space_pa_4 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] backdrop-blur-sm transform transition-transform">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 surface_white radius_xl flex items-center justify-center shadow-inner shrink-0">
                        <Icon name="Brain" size={24} className="tone_indigo_700" />
                    </div>
                    <div>
                        <div className="tone_white font-bold text-sm leading-tight">NEET Coach App</div>
                        <div className="tone_indigo_200 text-xs">Faster tests, OMR scans, and reminders</div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <a
                        href={DOWNLOAD_URL}
                        className="surface_white tone_indigo_900 space_px_4 space_py_2 radius_full font-bold text-sm shadow-md hover_surface_indigo_50"
                    >
                        Download
                    </a>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setDismissed(true);
                            sessionStorage.setItem('appPromoDismissed', 'true');
                        }}
                        className="tone_indigo_300 hover_tone_white space_pa_2 shrink-0"
                        aria-label="Dismiss banner"
                    >
                        <Icon name="X" size={18} />
                    </Button>
                </div>
            </div>
        </div>
    );
}
