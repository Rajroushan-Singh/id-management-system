import React from 'react';

export function StatusBadge({ status, label, className = '' }) {
  // Normalize status string
  const normalized = String(status || '').toLowerCase();

  let variantStyles = 'bg-cream-200 text-espresso-600 border-cream-400';
  let dotColor = 'bg-espresso-400';

  if (
    normalized === 'success' ||
    normalized === 'active' ||
    normalized === 'verified' ||
    normalized === 'true' ||
    normalized === 'login_success' ||
    normalized === 'email_verified' ||
    normalized === 'password_reset_success'
  ) {
    variantStyles = 'bg-status-success-bg text-status-success border-status-success-border';
    dotColor = 'bg-status-success';
  } else if (
    normalized === 'warning' ||
    normalized === 'locked' ||
    normalized === 'pending' ||
    normalized === 'account_locked' ||
    normalized === 'medium' ||
    normalized === 'login_blocked'
  ) {
    variantStyles = 'bg-status-warning-bg text-status-warning border-status-warning-border';
    dotColor = 'bg-status-warning';
  } else if (
    normalized === 'error' ||
    normalized === 'failed' ||
    normalized === 'disabled' ||
    normalized === 'false' ||
    normalized === 'login_failed' ||
    normalized === 'high' ||
    normalized === 'revoked'
  ) {
    variantStyles = 'bg-status-error-bg text-status-error border-status-error-border';
    dotColor = 'bg-status-error';
  } else if (
    normalized === 'info' ||
    normalized === 'user_registered' ||
    normalized === 'password_reset_requested' ||
    normalized === 'low'
  ) {
    variantStyles = 'bg-status-info-bg text-status-info border-status-info-border';
    dotColor = 'bg-status-info';
  }

  const displayText = label || (normalized.charAt(0).toUpperCase() + normalized.slice(1));

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantStyles} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
      <span>{displayText}</span>
    </span>
  );
}
