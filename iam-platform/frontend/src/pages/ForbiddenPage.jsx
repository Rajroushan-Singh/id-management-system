import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ShieldX, ArrowLeft, Home } from 'lucide-react';

export function ForbiddenPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center shadow-card border-cream-400">
        <div className="w-14 h-14 rounded-full bg-status-error-bg text-status-error border border-status-error-border mx-auto flex items-center justify-center mb-4">
          <ShieldX className="w-7 h-7" />
        </div>

        <span className="text-xs font-mono font-bold uppercase tracking-wider text-status-error">
          HTTP 403 • Access Forbidden
        </span>

        <h2 className="font-display text-2xl font-bold text-espresso-800 mt-2">
          Administrative Access Required
        </h2>

        <p className="text-xs text-espresso-600 mt-2 leading-relaxed">
          Your account does not possess the <code className="font-mono bg-cream-200 px-1 py-0.5 rounded text-espresso-800 font-semibold">ROLE_ADMIN</code> authority required to view this resource.
        </p>

        <div className="mt-5 p-3.5 rounded-card bg-cream-50 border border-cream-400 text-left text-[11px] text-espresso-600 space-y-1">
          <p className="font-semibold text-espresso-800">Authorization Policy</p>
          <p>
            Role permissions are determined authoritatively by the Spring Security backend.
            To gain administrative access, an administrator must assign the role in the database.
          </p>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/dashboard" className="w-full sm:w-auto">
            <Button variant="primary" size="md" icon={Home} className="w-full">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
