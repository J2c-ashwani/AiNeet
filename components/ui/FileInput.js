import React, { forwardRef } from 'react';

export const FileInput = forwardRef(({ className = '', ...props }, ref) => (
    <input
        ref={ref}
        type="file"
        className={className}
        {...props}
    />
));

FileInput.displayName = 'FileInput';
