import React from 'react';

export const Textarea = React.forwardRef(({ className = '', ...props }, ref) => {
    return (
        <textarea
            ref={ref}
            className={`w-full px-4 py-3 rounded-md border border-[var(--border)] bg-[var(--bg-glass)] text-[var(--text-primary)] text-base outline-none focus:ring-2 focus:ring-[var(--accent-primary)] min-h-[100px] resize-y ${className}`}
            {...props}
        />
    );
});
Textarea.displayName = 'Textarea';
