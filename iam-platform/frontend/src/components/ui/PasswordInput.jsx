import React, { useState, forwardRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const PasswordInput = forwardRef(function PasswordInput(
  {
    label,
    error,
    helperText,
    id,
    className = '',
    inputClassName = '',
    required = false,
    ...props
  },
  ref
) {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : 'password-input');

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
          type={showPassword ? 'text' : 'password'}
          required={required}
          className={`w-full pl-3.5 pr-10 py-2 text-sm text-espresso-800 bg-white border rounded-control transition-colors duration-150 placeholder:text-espresso-400 focus:outline-none focus:ring-2 focus:ring-sage-500/40 focus:border-sage-500 disabled:bg-cream-100 disabled:text-espresso-400 disabled:cursor-not-allowed ${
            error
              ? 'border-status-error focus:ring-status-error/30 focus:border-status-error'
              : 'border-cream-400 hover:border-cream-500'
          } ${inputClassName}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-espresso-400 hover:text-espresso-800 focus:outline-none transition-colors"
          tabIndex={-1}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
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
