import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  Sliders,
  LogOut,
  Shield,
  Activity,
  Layers,
  Sparkles,
  X,
} from 'lucide-react';
import { useAuth } from '../../auth/useAuth';

export function Sidebar({ isOpen, onClose }) {
  const { user, isAdmin, logout } = useAuth();

  const userNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Sessions', path: '/sessions', icon: Layers },
    { name: 'Settings', path: '/settings', icon: Sliders },
  ];

  const adminNavItems = [
    { name: 'User Management', path: '/users', icon: Users },
    { name: 'Admin Overview', path: '/admin', icon: Shield },
    { name: 'Security & Audit', path: '/admin/audit', icon: Activity },
    { name: 'Login Risk', path: '/admin/login-risk', icon: ShieldAlert, badge: 'Preview' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-espresso-900/40 backdrop-blur-[2px] lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#EFE7DB] border-r border-[#E5DDD1] flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Logo & Name */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-[#E5DDD1]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-control bg-sage-500 text-white flex items-center justify-center shadow-subtle">
                <Shield className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-base font-bold text-espresso-800 leading-tight">
                  IAM Platform
                </span>
                <span className="text-[10px] uppercase tracking-widest text-espresso-500 font-semibold">
                  Enterprise Access
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-control text-espresso-500 hover:text-espresso-800 hover:bg-cream-200 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="px-3 py-5 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)]">
            <div>
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-espresso-500 mb-2">
                Workspace
              </p>
              <nav className="space-y-1">
                {userNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => onClose && onClose()}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3.5 py-2 text-sm font-medium rounded-control transition-all duration-150 ${
                          isActive
                            ? 'bg-sage-500 text-white shadow-subtle'
                            : 'text-espresso-800 hover:bg-[#E5DDD1]/60 hover:text-espresso-900'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <div className="flex items-center gap-3">
                          <Icon
                            className={`w-4 h-4 shrink-0 ${
                              isActive ? 'text-white' : 'text-espresso-500'
                            }`}
                          />
                          <span>{item.name}</span>
                        </div>
                      )}
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            {/* Admin Section (Conditional on backend role verification) */}
            {isAdmin && (
              <div>
                <div className="px-3 flex items-center justify-between mb-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-espresso-500">
                    Administration
                  </p>
                  <span className="px-1.5 py-0.2 bg-sage-200 text-sage-700 text-[9px] font-semibold rounded uppercase">
                    Admin
                  </span>
                </div>
                <nav className="space-y-1">
                  {adminNavItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => onClose && onClose()}
                        className={({ isActive }) =>
                          `flex items-center justify-between px-3.5 py-2 text-sm font-medium rounded-control transition-all duration-150 ${
                            isActive
                              ? 'bg-sage-500 text-white shadow-subtle'
                              : 'text-espresso-800 hover:bg-[#E5DDD1]/60 hover:text-espresso-900'
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <div className="flex items-center gap-3">
                              <Icon
                                className={`w-4 h-4 shrink-0 ${
                                  isActive ? 'text-white' : 'text-espresso-500'
                                }`}
                              />
                              <span>{item.name}</span>
                            </div>
                            {item.badge && (
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                                  isActive
                                    ? 'bg-white/20 text-white'
                                    : 'bg-cream-200 text-espresso-500'
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}
                      </NavLink>
                    );
                  })}
                </nav>
              </div>
            )}
          </div>
        </div>

        {/* User Footer with Quick Logout */}
        <div className="p-3.5 border-t border-[#E5DDD1] bg-[#EAE1D3]/50">
          <div className="flex items-center justify-between p-2 rounded-control">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-sage-500/15 border border-sage-500/30 text-sage-700 font-bold text-xs flex items-center justify-center shrink-0">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-espresso-800 truncate">
                  {user?.name || 'Account'}
                </p>
                <p className="text-[11px] text-espresso-500 truncate">
                  {user?.email || ''}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => logout(true)}
              className="p-1.5 rounded-control text-espresso-400 hover:text-status-error hover:bg-white/70 transition-colors"
              title="Sign Out"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
