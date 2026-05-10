import React, { forwardRef } from 'react';

/**
 * Canonical Input Primitive
 * Standardized form control ensuring unified typography and focus states.
 */
export const Input = forwardRef(({
    label,
    error,
    description,
    className = '',
    id,
    ...props
}, ref) => {
    // Generate a unique ID if none provided, useful for linking label to input
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <div className="input-group">
            {label && (
                <label htmlFor={inputId}>
                    {label}
                </label>
            )}
            <input
                ref={ref}
                id={inputId}
                className={`input ${error ? 'border-[var(--danger)] focus:shadow-[0_0_0_3px_rgba(239,68,68,0.2)]' : ''} ${className}`.trim()}
                aria-invalid={error ? 'true' : 'false'}
                {...props}
            />
            {error && (
                <p className="mt-1 text-sm font-medium" style={{ color: 'var(--danger)' }}>
                    {error}
                </p>
            )}
            {description && !error && (
                <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                    {description}
                </p>
            )}
        </div>
    );
});

Input.displayName = 'Input';
