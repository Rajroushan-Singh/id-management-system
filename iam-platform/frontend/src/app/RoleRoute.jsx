import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export function RoleRoute({ children, requiredRole = 'ADMIN' }) {
  const { isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-xs text-espresso-500 font-medium">Verifying authorization permissions...</p>
      </div>
    );
  }

  if (requiredRole === 'ADMIN' && !isAdmin) {
    return <Navigate to="/forbidden" replace />;
  }

  return children;
}
