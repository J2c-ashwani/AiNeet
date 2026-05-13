'use client';
import { useState, useEffect } from 'react';
import { TrustBadge } from './TrustBadge';

export function RecoveryBanner({ show }) {
    const [visible, setVisible] = useState(show);

    useEffect(() => {
        if (show) {
            setVisible(true);
            const t = setTimeout(() => setVisible(false), 5000);
            return () => clearTimeout(t);
        }
    }, [show]);

    if (!visible) return null;

    return (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in pointer-events-none">
            <TrustBadge type="recovery-success" className="shadow-lg backdrop-blur-md" />
        </div>
    );
}
