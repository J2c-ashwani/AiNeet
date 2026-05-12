'use client';
import { useEffect, useState } from 'react';

/**
 * components/ui/ProgressRing.js
 * Wave 7: Premium Experience
 * Gamified progress indicator wrapped around user avatar.
 */
export function ProgressRing({ 
    progress = 0, 
    level = 1, 
    initials = 'U', 
    size = 64, 
    strokeWidth = 5 
}) {
    // Only animate on mount or XP change
    const [animatedProgress, setAnimatedProgress] = useState(0);

    useEffect(() => {
        // Slight delay to trigger CSS transition after mount
        const timer = setTimeout(() => {
            setAnimatedProgress(Math.min(Math.max(progress, 0), 100));
        }, 50);
        return () => clearTimeout(timer);
    }, [progress]);

    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (animatedProgress / 100) * circumference;

    return (
        <div style={{ 
            position: 'relative', 
            width: size, 
            height: size,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            {/* SVG Ring */}
            <svg 
                width={size} 
                height={size} 
                style={{ position: 'absolute', transform: 'rotate(-90deg)' }}
                aria-hidden="true"
            >
                {/* Gradient Definition */}
                <defs>
                    <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#9b6dff" />
                        <stop offset="100%" stopColor="#7c4dff" />
                    </linearGradient>
                </defs>

                {/* Background Track */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="var(--surface-hover)"
                    strokeWidth={strokeWidth}
                />

                {/* Active Progress */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="url(#ring-gradient)"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    style={{
                        transition: 'stroke-dashoffset 600ms cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                />
            </svg>

            {/* Avatar inside */}
            <div style={{
                width: size - (strokeWidth * 3),
                height: size - (strokeWidth * 3),
                borderRadius: '50%',
                background: 'var(--surface-hover)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: `${size * 0.35}px`,
                fontWeight: 800,
                color: 'var(--text-primary)',
                zIndex: 1
            }}>
                {initials}
            </div>

            {/* Floating Level Badge */}
            <div style={{
                position: 'absolute',
                bottom: -4,
                right: -4,
                background: 'var(--surface-card)',
                border: '2px solid var(--bg-primary)',
                borderRadius: '10px',
                padding: '2px 6px',
                fontSize: '10px',
                fontWeight: 800,
                color: 'var(--text-primary)',
                zIndex: 2,
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>
                Lv {level}
            </div>
        </div>
    );
}
