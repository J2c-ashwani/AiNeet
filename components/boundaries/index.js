'use client';
import React, { Suspense } from 'react';

// Error Boundary implementation
export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // Here we would pipe to our mobile_runtime_events telemetry
        console.error('[Frontend Observability] ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;
            return (
                <div style={{ padding: '20px', background: 'rgba(239, 68, 68, 0.12)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', margin: '16px 0' }}>
                    <h3 style={{ margin: '0 0 8px 0' }}>Something went wrong</h3>
                    <p style={{ margin: 0, fontSize: '14px' }}>We encountered an unexpected error. Please refresh the page.</p>
                </div>
            );
        }
        return this.props.children;
    }
}

// Loading Boundary
export function LoadingBoundary({ children }) {
    return (
        <div style={{ padding: '20px', display: 'flex', justifyContent: 'center' }}>
            <div className="spinner" style={{ width: '24px', height: '24px', borderTopColor: 'var(--accent)' }} />
        </div>
    );
}

// Async Boundary (combines Suspense and ErrorBoundary)
export function AsyncBoundary({ children, pendingFallback = <LoadingBoundary />, rejectedFallback }) {
    return (
        <ErrorBoundary fallback={rejectedFallback}>
            <Suspense fallback={pendingFallback}>
                {children}
            </Suspense>
        </ErrorBoundary>
    );
}
