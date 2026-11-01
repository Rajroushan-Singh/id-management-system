import React from 'react';
import { useAuth } from '../auth/useAuth';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Link } from 'react-router-dom';
import {
  Sliders,
  Shield,
  Key,
  Layers,
  Lock,
  ExternalLink,
  Info,
} from 'lucide-react';

export function SettingsPage() {
  const { user, isAdmin } = useAuth();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Account & Security Settings"
        subtitle="Review account details, authentication parameters, and active identity policies."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account Profile Card */}
        <Card title="User Identity Profile" subtitle="Information associated with your account">
          <div className="space-y-4 text-xs">
            <div className="pb-3 border-b border-cream-400/60">
              <span className="text-espresso-500 block text-[11px] font-medium">User Identifier</span>
              <span className="font-mono font-semibold text-espresso-800 text-sm">
                #{user?.id || '—'}
              </span>
            </div>

            <div className="pb-3 border-b border-cream-400/60">
              <span className="text-espresso-500 block text-[11px] font-medium">Full Legal / Display Name</span>
              <span className="font-medium text-espresso-800 text-sm">
                {user?.name || '—'}
              </span>
            </div>

            <div className="pb-3 border-b border-cream-400/60">
              <span className="text-espresso-500 block text-[11px] font-medium">Registered Email Address</span>
              <span className="font-medium text-espresso-800 text-sm">
                {user?.email || '—'}
              </span>
            </div>

            <div>
              <span className="text-espresso-500 block text-[11px] font-medium mb-1.5">Privilege Level</span>
              <div className="flex items-center gap-2">
                <StatusBadge status="active" label="Standard User (ROLE_USER)" />
                {isAdmin && (
                  <StatusBadge status="info" label="Platform Administrator (ROLE_ADMIN)" />
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Security Policies Card */}
        <Card title="Authentication & Session Policies" subtitle="Backend security specifications currently enforced">
          <div className="space-y-3.5 text-xs text-espresso-700">
            <div className="p-3 rounded-control bg-cream-50 border border-cream-400 flex items-start gap-3">
              <Key className="w-4 h-4 text-sage-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-espresso-800">Stateless JWT Access Tokens</p>
                <p className="text-espresso-500 text-[11px] mt-0.5">
                  Signed cryptographically using HMAC-SHA256 with auto-rotation via refresh tokens.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-control bg-cream-50 border border-cream-400 flex items-start gap-3">
              <Lock className="w-4 h-4 text-sage-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-espresso-800">Account Lockout Protection</p>
                <p className="text-espresso-500 text-[11px] mt-0.5">
                  Accounts are automatically locked after 5 consecutive failed password attempts.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-control bg-cream-50 border border-cream-400 flex items-start gap-3">
              <Layers className="w-4 h-4 text-sage-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-espresso-800">Opaque Refresh Tokens</p>
                <p className="text-espresso-500 text-[11px] mt-0.5">
                  Stored as SHA-256 hashes in database for maximum credential security.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Security Actions */}
      <Card title="Security Actions" subtitle="Available self-service credential and session actions">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-control bg-cream-50 border border-cream-400 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-semibold text-espresso-800">
                Manage Active Sessions
              </h4>
              <p className="text-xs text-espresso-500 mt-1">
                Inspect and selectively revoke access tokens issued to web clients.
              </p>
            </div>
            <div className="mt-4">
              <Link to="/sessions">
                <Button variant="secondary" size="sm" icon={ExternalLink} iconPosition="right">
                  Manage Sessions
                </Button>
              </Link>
            </div>
          </div>

          <div className="p-4 rounded-control bg-cream-50 border border-cream-400 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-semibold text-espresso-800">
                Reset Account Password
              </h4>
              <p className="text-xs text-espresso-500 mt-1">
                Request a secure one-time reset token to change your authentication password.
              </p>
            </div>
            <div className="mt-4">
              <Link to="/forgot-password">
                <Button variant="outline" size="sm" icon={ExternalLink} iconPosition="right">
                  Request Password Reset
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
