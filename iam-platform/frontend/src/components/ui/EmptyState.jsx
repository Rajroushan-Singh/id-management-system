import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

export function EmptyState({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There is currently no data available to display.',
  actionText,
  onAction,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-4 text-center rounded-card bg-cream-50/50 border border-dashed border-cream-400 ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-cream-200/80 flex items-center justify-center text-espresso-400 mb-3.5">
        <Icon className="w-6 h-6 stroke-[1.5]" />
      </div>
      <h4 className="font-display text-base font-semibold text-espresso-800 mb-1">
        {title}
      </h4>
      <p className="text-xs text-espresso-500 max-w-sm mb-5 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
}
