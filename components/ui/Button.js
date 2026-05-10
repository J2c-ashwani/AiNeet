import React from 'react';

/**
 * Canonical Button Primitive
 * Replaces raw HTML buttons. Adheres to Interaction Standards.
 */
export function Button({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    className = '',
    onClick,
    type = 'button',
    ...props
}) {
    // Map the variant prop to our global CSS classes
    const variantClassMap = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        ghost: 'btn-ghost',
        danger: 'btn-danger',
        success: 'btn-success',
    };

    const sizeClassMap = {
        sm: 'btn-sm',
        md: '', // base padding handled in .btn
        lg: 'btn-lg',
    };

    const baseClass = 'btn';
    const variantClass = variantClassMap[variant] || 'btn-primary';
    const sizeClass = sizeClassMap[size] || '';
    
    // Assemble final className string
    const combinedClasses = [baseClass, variantClass, sizeClass, className].filter(Boolean).join(' ');

    return (
        <button
            type={type}
            className={combinedClasses}
            disabled={disabled || loading}
            onClick={onClick}
            aria-disabled={disabled || loading}
            {...props}
        >
            {loading && (
                <span className="spinner" style={{ width: '16px', height: '16px', borderTopColor: 'currentColor' }} />
            )}
            {children}
        </button>
    );
}
