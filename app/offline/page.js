"use client";

import Link from 'next/link';

export default function OfflinePage() {
    return (
        <div className="min-h-screen bg-[#0a0e1a] flex flex-col items-center justify-center p-6 text-center">
            <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9.001 9.001 0 01-2.167-9.238m7.824 2.163a1.5 1.5 0 112.121 2.121m-6.364 6.364L3 3" />
                </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">You're Offline</h1>
            <p className="text-slate-400 mb-8 max-w-md">
                It looks like you've lost your internet connection. Some features of AI NEET Coach require an active connection to sync questions and save your progress.
            </p>
            <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-lg transition-colors cursor-pointer"
            >
                Try Again
            </button>
        </div>
    );
}
