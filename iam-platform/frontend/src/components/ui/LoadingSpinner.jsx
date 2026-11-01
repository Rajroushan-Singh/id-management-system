import React from 'react';

export function LoadingSpinner({ size = 'md', className = '' }) {
  const sizeMap = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
    xl: 'w-12 h-12 border-4',
  };

  return (
    <div
      className={`inline-block animate-spin rounded-full border-cream-400 border-t-sage-500 ${sizeMap[size] || sizeMap.md} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}
