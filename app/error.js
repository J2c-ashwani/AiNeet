'use client';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function ErrorBoundary({ error, reset }) {
    useEffect(() => {
        // Log the error to Sentry automatically
        Sentry.captureException(error);
    }, [error]);

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center' }}>
            <div style={{ marginBottom: 24 }}><Icon name="Star" size={16} /></div>
            <h1 style={{ fontWeight: 900, marginBottom: 12 }}>Something went wrong</h1>
            <p style={{ maxWidth: 500, lineHeight: 1.6, marginBottom: 32 }}>
                We hit an unexpected error. Our team has been notified. Please try again or go back to the dashboard.
            </p>
            <div style={{ display: 'flex', gap: 16 }}>
                <Button onClick={reset} className="btn btn-primary" style={{ padding: '14px 28px', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                    <Icon name="RefreshCw" /> Try Again
                </Button>
                <a href="/dashboard" style={{ padding: '14px 28px', fontWeight: 600, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)' }}>
                    🏠 Dashboard
                </a>
            </div>
            <p style={{ marginTop: 40 }}>Error ID: {Date.now().toString(36)} • AI NEET Coach</p>
        </div>
    );
}
