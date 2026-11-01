import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FileQuestion, Home } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center shadow-card border-cream-400">
        <div className="w-14 h-14 rounded-full bg-cream-200 text-espresso-600 mx-auto flex items-center justify-center mb-4">
          <FileQuestion className="w-7 h-7" />
        </div>

        <span className="text-xs font-mono font-bold uppercase tracking-wider text-espresso-400">
          HTTP 404 • Not Found
        </span>

        <h2 className="font-display text-2xl font-bold text-espresso-800 mt-2">
          Page Not Found
        </h2>

        <p className="text-xs text-espresso-600 mt-2 leading-relaxed">
          The requested path does not exist in the IAM Platform navigation schema.
        </p>

        <div className="mt-6 flex justify-center">
          <Link to="/dashboard">
            <Button variant="primary" size="md" icon={Home}>
              Return to Safety
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
