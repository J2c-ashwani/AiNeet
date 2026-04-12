'use client';
import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({ error, reset }) {
    useEffect(() => {
        // Enforce silent server-side awareness of total DOM failures
        Sentry.captureException(error);
    }, [error]);

    return (
        <html>
            <body className="bg-gray-900 text-white min-h-screen flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-gray-800 rounded-xl p-8 shadow-2xl border border-gray-700 text-center">
                    <div className="mb-6 mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent mb-4">
                        Critical Application Error
                    </h2>
                    
                    <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                        The NEET Coach interface encountered an unexpected memory layout error. 
                        Our engineering team has been automatically pinged with the stack-trace. 
                        Please try reloading the portal.
                    </p>
                    
                    <button
                        onClick={() => reset()}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium py-3 px-4 rounded-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh Application
                    </button>
                </div>
            </body>
        </html>
    );
}
