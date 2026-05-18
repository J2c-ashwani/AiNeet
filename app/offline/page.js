"use client";
import { Button } from '@/components/ui/Button';

import Link from 'next/link';

export default function OfflinePage() {
    return (
        <div className="min-h-screen bg-[#0a0e1a] flex flex-col items-center justify-center space_pa_6 text-center">
            <div className="w-24 h-24 surface_red_500_10 radius_full flex items-center justify-center space_mb_6">
                <svg className="w-12 h-12 tone_red_500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9.001 9.001 0 01-2.167-9.238m7.824 2.163a1.5 1.5 0 112.121 2.121m-6.364 6.364L3 3" />
                </svg>
            </div>
            <h1 className="text-3xl font-bold tone_white space_mb_4">You're Offline</h1>
            <p className="text-slate-400 space_mb_8 max-w-md">
                It looks like you've lost your internet connection. Some features of AI NEET Coach require an active connection to sync questions and save your progress.
            </p>
            <Button
                onClick={() => window.location.reload()}
                className="space_px_6 space_py_3 surface_indigo_500 hover_surface_indigo_600 tone_white font-medium radius_lg transition-colors cursor-pointer"
            >
                Try Again
            </Button>
        </div>
    );
}
