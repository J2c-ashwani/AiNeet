'use client';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({ error, reset }) {
    useEffect(() => {
        // Enforce silent server-side awareness of total DOM failures
        Sentry.captureException(error);
    }, [error]);

    return (
        <html>
            <body style={{ margin: 0, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: 'system-ui, sans-serif' }}>
                <div style={{ maxWidth: 500, width: '100%', padding: 32, border: '1px solid #334155', textAlign: 'center' }}>
                    <div style={{ marginBottom: 16 }}><Icon name="AlertCircle" /></div>
                    <h2 style={{ fontWeight: 700, marginBottom: 12, }}>
                        Application Error
                    </h2>
                    
                    {/* Show actual error for diagnosis */}
                    <div style={{ padding: 12, marginBottom: 20, textAlign: 'left', wordBreak: 'break-word', maxHeight: 150, overflow: 'auto' }}>
                        <strong >Error:</strong> {error?.message || 'Unknown error'}
                        {error?.digest && <div><strong >Digest:</strong> {error.digest}</div>}
                    </div>
                    
                    <p style={{ marginBottom: 20 }}>
                        Please screenshot this and share with the dev team, then tap refresh.
                    </p>
                    
                    <Button
                        onClick={() => reset()}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium py-3 px-4 rounded-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh Application
                    </Button>
                </div>
            </body>
        </html>
    );
}
