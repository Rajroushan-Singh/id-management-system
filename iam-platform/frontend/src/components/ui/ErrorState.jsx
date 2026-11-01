import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export function ErrorState({
  title = 'Failed to load data',
  message = 'An unexpected error occurred while communicating with the backend server.',
  onRetry,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-10 px-4 text-center rounded-card bg-status-error-bg/60 border border-status-error-border ${className}`}
    >
      <div className="w-11 h-11 rounded-full bg-status-error-bg flex items-center justify-center text-status-error border border-status-error-border mb-3">
        <AlertCircle className="w-6 h-6 stroke-[1.75]" />
      </div>
      <h4 className="font-display text-base font-semibold text-espresso-800 mb-1">
        {title}
      </h4>
      <p className="text-xs text-espresso-600 max-w-md mb-4 leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          icon={RefreshCw}
          onClick={onRetry}
          className="border-cream-400 bg-white"
        >
          Try Again
        </Button>
      )}
    </div>
  );
}
