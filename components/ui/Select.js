import React from 'react';

export const Select = React.forwardRef(({ className = '', ...props }, ref) => {
    return (
        <select
            ref={ref}
            className={`w-full px-4 py-3 rounded-md border border-[var(--border)] bg-[var(--bg-glass)] text-[var(--text-primary)] text-base outline-none focus:ring-2 focus:ring-[var(--accent-primary)] ${className}`}
            {...props}
        />
    );
});
Select.displayName = 'Select';
