import React from 'react';

/**
 * Canonical Skeleton Primitive
 * Standardized loading state indicator to prevent layout shift.
 */
export function Skeleton({
    className = '',
    style = {},
    ...props
}) {
    // We use a CSS animation combined with the glassmorphism background
    // to create a premium pulsing effect.
    const baseStyle = {
        background: 'var(--bg-glass)',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        borderRadius: 'var(--radius-sm)',
        ...style
    };

    return (
        <div 
            className={className} 
            style={baseStyle}
            aria-hidden="true"
            {...props}
        />
    );
}
