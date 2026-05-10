import React from 'react';
import { Card } from './Card';

/**
 * Canonical Empty State Primitive
 * Standardized illustration and copy for when a user has no data.
 */
export function EmptyState({
    title = 'No data found',
    description = 'There is nothing here yet.',
    icon = '📦',
    action,
    className = '',
}) {
    return (
        <Card className={`flex flex-col items-center justify-center text-center p-8 ${className}`}>
            <div style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.8 }}>
                {icon}
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                {title}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '300px', marginBottom: action ? '24px' : '0' }}>
                {description}
            </p>
            {action && (
                <div>
                    {action}
                </div>
            )}
        </Card>
    );
}
