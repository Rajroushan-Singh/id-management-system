import React from 'react';

export function Card({
  children,
  className = '',
  title,
  subtitle,
  actions,
  noPadding = false,
  ...props
}) {
  return (
    <div
      className={`bg-white rounded-card border border-cream-400/80 shadow-card transition-all duration-150 ${className}`}
      {...props}
    >
      {(title || subtitle || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4.5 border-b border-cream-400/60">
          <div>
            {title && (
              <h3 className="font-display text-base font-semibold text-espresso-800">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-espresso-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-6'}>{children}</div>
    </div>
  );
}
