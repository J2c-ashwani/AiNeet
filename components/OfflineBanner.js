'use client';
import { useState, useEffect } from 'react';

/**
 * Offline Banner — shows a non-intrusive indicator when network is lost.
 * Auto-hides when connectivity is restored.
 * Also shows a brief "Back online" confirmation.
 */
export default function OfflineBanner() {
    const [isOffline, setIsOffline] = useState(false);
    const [wasOffline, setWasOffline] = useState(false);

    useEffect(() => {
        const goOffline = () => { setIsOffline(true); setWasOffline(true); };
        const goOnline = () => {
            setIsOffline(false);
            // Show "back online" for 3 seconds
            setTimeout(() => setWasOffline(false), 3000);
        };

        // Check initial state
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
            setIsOffline(true);
            setWasOffline(true);
        }

        window.addEventListener('online', goOnline);
        window.addEventListener('offline', goOffline);

        return () => {
            window.removeEventListener('online', goOnline);
            window.removeEventListener('offline', goOffline);
        };
    }, []);

    if (!isOffline && !wasOffline) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 'var(--z-critical)',
                padding: '10px 16px',
                textAlign: 'center',
                fontSize: '0.85rem',
                fontWeight: 600,
                transition: 'all 0.3s ease',
                background: isOffline
                    ? 'linear-gradient(90deg, #dc2626, #b91c1c)'
                    : 'linear-gradient(90deg, #16a34a, #15803d)',
                color: '#fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}
        >
            {isOffline ? (
                <>📡 You&apos;re offline — your progress is saved locally and will sync when you reconnect</>
            ) : (
                <>✅ Back online — syncing your data</>
            )}
        </div>
    );
}
