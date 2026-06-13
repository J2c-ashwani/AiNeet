'use client';
import { useEffect } from 'react';

export default function GlobalError({ error, reset }) {
    useEffect(() => {
        // Dynamically import Sentry to avoid build-time static generation errors
        import('@sentry/nextjs').then((Sentry) => {
            Sentry.captureException(error);
        }).catch((err) => {
            console.error('Failed to log to Sentry:', err);
        });
    }, [error]);

    return (
        <html lang="en">
            <body style={{ margin: 0, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: 'system-ui, sans-serif', background: '#080c18', color: '#f8fafc' }}>
                <div style={{ maxWidth: 500, width: '100%', padding: 32, border: '1px solid #334155', textAlign: 'center', borderRadius: '12px', background: '#0e1526' }}>
                    <div style={{ marginBottom: 16 }}>
                        <svg style={{ width: '48px', height: '48px', color: '#ef4444', margin: '0 auto' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 style={{ fontWeight: 700, marginBottom: 12, fontSize: '1.5rem' }}>
                        Application Error
                    </h2>
                    
                    <div style={{ padding: 12, marginBottom: 20, textAlign: 'left', wordBreak: 'break-word', maxHeight: 150, overflow: 'auto', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '6px', fontSize: '0.875rem' }}>
                        <strong>Error:</strong> Something unexpected happened on our end.
                    </div>
                    
                    <p style={{ marginBottom: 20, color: '#94a3b8', fontSize: '0.95rem' }}>
                        Don't worry, your progress is safe. Please refresh the page to continue.
                    </p>
                    
                    <button
                        onClick={() => reset()}
                        style={{
                            width: '100%',
                            background: 'linear-gradient(to right, #2563eb, #4f46e5)',
                            border: 'none',
                            color: '#ffffff',
                            fontWeight: 500,
                            padding: '12px 16px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            fontSize: '1rem',
                            transition: 'opacity 0.2s'
                        }}
                    >
                        <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh Application
                    </button>
                </div>
            </body>
        </html>
    );
}

// Note: global-error.js must be static and not contain force-dynamic



