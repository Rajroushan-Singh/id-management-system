import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-md',
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso-900/40 backdrop-blur-[2px] transition-opacity"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`w-full ${maxWidth} bg-white rounded-card border border-cream-400 shadow-dropdown overflow-hidden transform transition-all duration-200`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-cream-400/80 bg-cream-50">
          <h3 className="font-display text-base font-semibold text-espresso-800">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-control text-espresso-400 hover:text-espresso-800 hover:bg-cream-200/50 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
