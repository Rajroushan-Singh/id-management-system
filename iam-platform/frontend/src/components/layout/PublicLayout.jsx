import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-[#F8F5EF] flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <header className="flex items-center justify-between max-w-5xl w-full mx-auto py-2">
        <Link to="/login" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-control bg-sage-500 text-white flex items-center justify-center shadow-subtle">
            <Shield className="w-4 h-4" />
          </div>
          <span className="font-display text-lg font-bold text-espresso-800 tracking-tight">
            IAM Platform
          </span>
        </Link>
        <span className="text-xs text-espresso-500 font-medium hidden sm:inline-block">
          Secure Identity & Access Management
        </span>
      </header>

      {/* Main Centered Content */}
      <main className="flex-1 flex items-center justify-center py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="max-w-5xl w-full mx-auto text-center py-4 text-xs text-espresso-500 border-t border-[#E5DDD1]/70">
        <p>&copy; {new Date().getFullYear()} IAM Platform. Enterprise Access & Identity Control.</p>
      </footer>
    </div>
  );
}
