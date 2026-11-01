import React, { useState, useRef, useEffect } from 'react';
import { Menu, ChevronDown, User as UserIcon, Shield, Sliders, LogOut } from 'lucide-react';
import { useAuth } from '../../auth/useAuth';
import { Link, useLocation } from 'react-router-dom';

export function Topbar({ onToggleSidebar }) {
  const { user, isAdmin, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  // Route title mapping
  const routeTitles = {
    '/dashboard': 'Dashboard',
    '/users': 'User Management',
    '/sessions': 'Active Sessions',
    '/settings': 'Account Settings',
    '/admin': 'Admin Dashboard',
    '/admin/audit': 'Security & Audit Logs',
    '/admin/login-risk': 'Login Risk Assessment',
  };

  const currentTitle = routeTitles[location.pathname] || 'IAM Platform';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#F8F5EF]/90 backdrop-blur-md border-b border-[#E5DDD1] flex items-center justify-between px-4 sm:px-8">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-control text-espresso-600 hover:text-espresso-800 hover:bg-cream-200 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="font-display text-base sm:text-lg font-semibold text-espresso-800">
            {currentTitle}
          </span>
          {isAdmin && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-sage-700 bg-sage-100 border border-sage-200 px-2 py-0.5 rounded-full">
              <Shield className="w-3 h-3" /> Admin Mode
            </span>
          )}
        </div>
      </div>

      {/* Right: User Profile Menu */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-control hover:bg-cream-200/60 transition-colors border border-transparent hover:border-cream-400"
          aria-expanded={dropdownOpen}
          aria-haspopup="true"
        >
          <div className="w-8 h-8 rounded-full bg-sage-500 text-white font-semibold text-xs flex items-center justify-center shadow-subtle">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-semibold text-espresso-800 leading-tight">
              {user?.name || 'Account'}
            </span>
            <span className="text-[10px] text-espresso-500 leading-tight">
              {isAdmin ? 'Administrator' : 'User'}
            </span>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-espresso-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-card border border-cream-400 shadow-dropdown py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-4 py-2 border-b border-cream-400/60">
              <p className="text-xs font-semibold text-espresso-800 truncate">
                {user?.name}
              </p>
              <p className="text-[11px] text-espresso-500 truncate">
                {user?.email}
              </p>
            </div>

            <div className="py-1">
              <Link
                to="/dashboard"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs text-espresso-700 hover:bg-cream-100 transition-colors"
              >
                <UserIcon className="w-3.5 h-3.5 text-espresso-500" />
                Dashboard Overview
              </Link>
              <Link
                to="/settings"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs text-espresso-700 hover:bg-cream-100 transition-colors"
              >
                <Sliders className="w-3.5 h-3.5 text-espresso-500" />
                Security Settings
              </Link>
            </div>

            <div className="border-t border-cream-400/60 pt-1">
              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(false);
                  logout(true);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-status-error hover:bg-status-error-bg transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
