import React, { forwardRef } from 'react';

export const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    id,
    type = 'text',
    className = '',
    inputClassName = '',
    required = false,
    ...props
  },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold uppercase tracking-wider text-espresso-600 mb-1.5"
        >
          {label} {required && <span className="text-status-error">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          type={type}
          required={required}
          className={`w-full px-3.5 py-2 text-sm text-espresso-800 bg-white border rounded-control transition-colors duration-150 placeholder:text-espresso-400 focus:outline-none focus:ring-2 focus:ring-sage-500/40 focus:border-sage-500 disabled:bg-cream-100 disabled:text-espresso-400 disabled:cursor-not-allowed ${
            error
              ? 'border-status-error focus:ring-status-error/30 focus:border-status-error'
              : 'border-cream-400 hover:border-cream-500'
          } ${inputClassName}`}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-xs text-status-error font-medium" role="alert">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p className="mt-1 text-xs text-espresso-500">{helperText}</p>
      )}
    </div>
  );
});
