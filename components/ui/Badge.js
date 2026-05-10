import React from 'react';

/**
 * Canonical Badge Primitive
 * Standardized micro-labels for status, subjects, and difficulty.
 */
export function Badge({
    children,
    variant = 'neutral',
    icon,
    className = '',
    ...props
}) {
    const baseClass = 'difficulty-badge'; // We use difficulty-badge as a base because it has the correct padding/radius
    
    // Map the variant to global CSS tokens where possible, or use inline styles mapped to CSS variables
    const variantStyles = {
        success: { background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)' },
        warning: { background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)' },
        danger: { background: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)' },
        info: { background: 'rgba(59, 130, 246, 0.15)', color: 'var(--info)' },
        neutral: { background: 'rgba(148, 163, 184, 0.15)', color: 'var(--text-secondary)' },
        neet: { background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)' },
        // Subjects
        physics: { background: 'rgba(59, 130, 246, 0.15)', color: 'var(--physics)', border: '1px solid rgba(59, 130, 246, 0.3)' },
        chemistry: { background: 'rgba(16, 185, 129, 0.15)', color: 'var(--chemistry)', border: '1px solid rgba(16, 185, 129, 0.3)' },
        biology: { background: 'rgba(249, 115, 22, 0.15)', color: 'var(--biology)', border: '1px solid rgba(249, 115, 22, 0.3)' },
    };

    const style = variantStyles[variant] || variantStyles.neutral;

    return (
        <span 
            className={`${baseClass} ${className}`.trim()} 
            style={style}
            {...props}
        >
            {icon && <span style={{ marginRight: '4px', fontSize: '1.1em' }}>{icon}</span>}
            {children}
        </span>
    );
}
