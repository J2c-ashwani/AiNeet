import React from 'react';

/**
 * Canonical Card Primitive
 * Provides a standardized glassmorphism container.
 */
export function Card({
    children,
    className = '',
    flat = false,
    interactive = false,
    ...props
}) {
    // `.card` handles blur, border, background, and hover glow
    // `.card-flat` handles just the background and border without the hover glow
    const baseClass = flat ? 'card-flat' : 'card';
    
    // Add interactive styles if the card is meant to be clicked
    const interactiveStyle = interactive ? { cursor: 'pointer' } : {};

    const combinedClasses = [baseClass, className].filter(Boolean).join(' ');

    return (
        <div 
            className={combinedClasses} 
            style={interactiveStyle}
            {...props}
        >
            {children}
        </div>
    );
}
