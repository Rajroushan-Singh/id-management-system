import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export function Toast({ toast, onDismiss }) {
  if (!toast) return null;

  const { id, type = 'info', title, message } = toast;

  const config = {
    success: {
      icon: CheckCircle2,
      border: 'border-status-success-border',
      bg: 'bg-white',
      badgeBg: 'bg-status-success-bg text-status-success',
      iconColor: 'text-status-success',
    },
    error: {
      icon: AlertCircle,
      border: 'border-status-error-border',
      bg: 'bg-white',
      badgeBg: 'bg-status-error-bg text-status-error',
      iconColor: 'text-status-error',
    },
    warning: {
      icon: AlertTriangle,
      border: 'border-status-warning-border',
      bg: 'bg-white',
      badgeBg: 'bg-status-warning-bg text-status-warning',
      iconColor: 'text-status-warning',
    },
    info: {
      icon: Info,
      border: 'border-cream-400',
      bg: 'bg-white',
      badgeBg: 'bg-cream-200 text-espresso-600',
      iconColor: 'text-sage-500',
    },
  }[type] || config.info;

  const Icon = config.icon;

  return (
    <div
      className={`flex items-start gap-3 w-full max-w-sm p-4 rounded-card border ${config.border} ${config.bg} shadow-dropdown transition-all animate-in slide-in-from-top-2 duration-200`}
      role="alert"
    >
      <div className={`p-1.5 rounded-full shrink-0 ${config.badgeBg}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        {title && (
          <h4 className="text-xs font-semibold text-espresso-800">
            {title}
          </h4>
        )}
        {message && (
          <p className="text-xs text-espresso-600 mt-0.5 leading-relaxed">
            {message}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(id)}
        className="text-espresso-400 hover:text-espresso-800 transition-colors p-1"
        aria-label="Dismiss notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast toast={toast} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
}
