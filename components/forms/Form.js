'use client';

import { FormProvider, useFormContext } from 'react-hook-form';

/**
 * Canonical Form Wrapper
 * 
 * MD Mandate: Every form MUST use typed validation and canonical error rendering.
 * Wraps the standard HTML form with react-hook-form context.
 */
export function Form({ methods, onSubmit, children, className = '' }) {
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className={`space-y-4 ${className}`}>
        {children}
      </form>
    </FormProvider>
  );
}

/**
 * Standardized Form Field Wrapper
 * Automatically handles accessibility labels and canonical error rendering.
 */
export function FormField({ name, label, description, children }) {
  const { formState: { errors } } = useFormContext();
  const error = errors[name];

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-[var(--text-primary)]">
          {label}
        </label>
      )}
      
      {/* The actual input child goes here */}
      {children}

      {description && !error && (
        <p className="text-xs text-[var(--text-muted)] space_mt_1">{description}</p>
      )}

      {error && (
        <p 
          role="alert" 
          aria-live="polite" 
          className="text-xs font-medium tone_red_500 space_mt_1"
        >
          {error.message}
        </p>
      )}
    </div>
  );
}
