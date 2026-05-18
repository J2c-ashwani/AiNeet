import React, { forwardRef } from 'react';

export const Checkbox = forwardRef(({ className = '', ...props }, ref) => {
    const classes = ['checkbox', className].filter(Boolean).join(' ');

    return (
        <input
            ref={ref}
            type="checkbox"
            className={classes}
            {...props}
        />
    );
});

Checkbox.displayName = 'Checkbox';
