import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

export function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  onClick,
  className = '',
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-control focus:outline-none focus-visible:ring-2 focus-visible:ring-sage-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.99]';

  const variants = {
    primary:
      'bg-sage-500 hover:bg-sage-600 text-white shadow-subtle hover:shadow border border-sage-600/30',
    secondary:
      'bg-cream-200 hover:bg-cream-300 text-espresso-800 border border-cream-400/60 shadow-subtle',
    outline:
      'bg-white hover:bg-cream-50 text-espresso-800 border border-cream-400 shadow-subtle',
    destructive:
      'bg-status-error hover:bg-[#9E4B40] text-white shadow-subtle border border-transparent',
    ghost:
      'bg-transparent hover:bg-cream-200/60 text-espresso-800 border border-transparent',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <LoadingSpinner size="sm" className={variant === 'primary' || variant === 'destructive' ? 'border-t-white' : ''} />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
          <span>{children}</span>
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
        </>
      )}
    </button>
  );
}
