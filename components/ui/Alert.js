import React from 'react';

export const Alert = ({ type = 'error', children, className = '', ...props }) => {
    const isError = type === 'error';
    return (
        <div 
            role={isError ? 'alert' : 'status'}
            className={`alert-banner alert-${type} ${className}`}
            style={{
                padding: '16px',
                background: isError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                border: `1px solid ${isError ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`,
                borderRadius: 'var(--radius-md)',
                color: isError ? 'var(--danger)' : 'var(--success)',
                fontSize: '0.9rem',
                marginBottom: '24px',
                fontWeight: 500,
                textAlign: 'center'
            }}
            {...props}
        >
            {children}
        </div>
    );
};
