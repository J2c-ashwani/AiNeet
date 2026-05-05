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
            <body style={{ margin: 0, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0e1a', color: '#f1f5f9', padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
                <div style={{ maxWidth: '500px', width: '100%', background: '#1e293b', borderRadius: '16px', padding: '32px', border: '1px solid #334155', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px', color: '#f87171' }}>
                        Application Error
                    </h2>
                    
                    {/* Show actual error for diagnosis */}
                    <div style={{ background: '#0f172a', borderRadius: '8px', padding: '12px', marginBottom: '20px', textAlign: 'left', fontSize: '0.8rem', color: '#94a3b8', wordBreak: 'break-word', maxHeight: '150px', overflow: 'auto' }}>
                        <strong style={{ color: '#f87171' }}>Error:</strong> {error?.message || 'Unknown error'}
                        {error?.digest && <div><strong style={{ color: '#f87171' }}>Digest:</strong> {error.digest}</div>}
                    </div>
                    
                    <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '20px' }}>
                        Please screenshot this and share with the dev team, then tap refresh.
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
