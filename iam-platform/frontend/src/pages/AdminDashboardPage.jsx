import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auditApi } from '../api/auditApi';
import { usersApi } from '../api/usersApi';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Skeleton } from '../components/ui/Skeleton';
import { formatDateTime, truncateSessionId } from '../utils/formatDate';
import {
  ShieldAlert,
  Users,
  Activity,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Lock,
} from 'lucide-react';

export function AdminDashboardPage() {
  const [users, setUsers] = useState([]);
  const [auditEvents, setAuditEvents] = useState([]);
  const [adminStatus, setAdminStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [usersData, auditData, statusData] = await Promise.allSettled([
        usersApi.getAllUsers(),
        auditApi.getRecentEvents(),
        auditApi.getAdminDashboard(),
      ]);

      if (usersData.status === 'fulfilled') {
        setUsers(usersData.value);
      }
      if (auditData.status === 'fulfilled') {
        setAuditEvents(auditData.value);
      }
      if (statusData.status === 'fulfilled') {
        setAdminStatus(statusData.value);
      }
    } catch (err) {
      setError(err.message || 'Error communicating with administrative endpoints.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute actual metrics from live backend data
  const totalUsers = users.length;
  const lockedUsers = users.filter((u) => u.locked).length;
  const verifiedUsers = users.filter((u) => u.emailVerified).length;
  const totalAuditEvents = auditEvents.length;
  const failedAuditEvents = auditEvents.filter((e) => !e.successful).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        subtitle="Operational overview of system identities, active security policies, and live audit telemetry."
        badge={
          <span className="text-xs px-2.5 py-1 rounded-full bg-sage-100 text-sage-800 font-semibold border border-sage-300">
            Authoritative Role: ADMIN
          </span>
        }
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={fetchData}
            isLoading={isLoading}
          >
            Refresh Telemetry
          </Button>
        }
      />

      {/* Metrics Row (Derived exclusively from actual API responses) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-espresso-500">
              Total Users
            </span>
            <div className="w-8 h-8 rounded-full bg-cream-200 flex items-center justify-center text-espresso-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-display text-espresso-800">
            {isLoading ? <Skeleton className="w-12 h-8" /> : totalUsers}
          </div>
          <p className="text-xs text-espresso-500 mt-1">
            Registered accounts in system
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-espresso-500">
              Email Verified
            </span>
            <div className="w-8 h-8 rounded-full bg-status-success-bg border border-status-success-border flex items-center justify-center text-status-success">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-display text-espresso-800">
            {isLoading ? <Skeleton className="w-12 h-8" /> : verifiedUsers}
          </div>
          <p className="text-xs text-espresso-500 mt-1">
            Accounts with confirmed emails
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-espresso-500">
              Locked Accounts
            </span>
            <div className="w-8 h-8 rounded-full bg-status-warning-bg border border-status-warning-border flex items-center justify-center text-status-warning">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-display text-espresso-800">
            {isLoading ? <Skeleton className="w-12 h-8" /> : lockedUsers}
          </div>
          <p className="text-xs text-espresso-500 mt-1">
            Locked by 5-attempt policy
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-espresso-500">
              Logged Events
            </span>
            <div className="w-8 h-8 rounded-full bg-sage-50 border border-sage-200 flex items-center justify-center text-sage-600">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-display text-espresso-800">
            {isLoading ? <Skeleton className="w-12 h-8" /> : totalAuditEvents}
          </div>
          <p className="text-xs text-espresso-500 mt-1">
            {failedAuditEvents} failed security event(s)
          </p>
        </Card>
      </div>

      {/* Recent Audit Events Stream */}
      <Card
        title="Recent Security Audit Stream"
        subtitle="Latest events recorded in separate database transactions"
        actions={
          <Link to="/admin/audit">
            <Button variant="secondary" size="sm">
              View All Audit Events
            </Button>
          </Link>
        }
      >
        {isLoading ? (
          <div className="space-y-3 py-2">
            <Skeleton lines={4} />
          </div>
        ) : auditEvents.length === 0 ? (
          <div className="text-center py-8 text-xs text-espresso-500">
            No audit records captured yet.
          </div>
        ) : (
          <div className="divide-y divide-cream-400/60">
            {auditEvents.slice(0, 5).map((e) => (
              <div
                key={e.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-control flex items-center justify-center shrink-0 ${
                      e.successful
                        ? 'bg-status-success-bg text-status-success border border-status-success-border'
                        : 'bg-status-error-bg text-status-error border border-status-error-border'
                    }`}
                  >
                    {e.successful ? (
                      <CheckCircle className="w-3.5 h-3.5" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-espresso-800">
                        {e.eventType}
                      </span>
                      <StatusBadge
                        status={e.successful ? 'success' : 'error'}
                        label={e.successful ? 'Success' : 'Failed'}
                      />
                    </div>
                    <p className="text-[11px] text-espresso-500 mt-0.5">
                      Target: <span className="font-medium text-espresso-700">{e.email || 'System / Anonymous'}</span>
                      {e.ipAddress && ` • IP: ${e.ipAddress}`}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-espresso-500">
                  {formatDateTime(e.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Admin Action Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/admin/audit" className="block">
          <Card className="p-5 hover:border-sage-500 transition-all duration-150 group">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-control bg-cream-200 text-espresso-700 flex items-center justify-center group-hover:bg-sage-50 group-hover:text-sage-600 transition-colors shrink-0">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-espresso-800 group-hover:text-sage-700 transition-colors">
                  Audit Logs Explorer
                </h4>
                <p className="text-xs text-espresso-500 mt-1">
                  Filter by user email, inspect failure causes, timestamps, and IP addresses.
                </p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/admin/login-risk" className="block">
          <Card className="p-5 hover:border-sage-500 transition-all duration-150 group">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-control bg-cream-200 text-espresso-700 flex items-center justify-center group-hover:bg-sage-50 group-hover:text-sage-600 transition-colors shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-espresso-800 group-hover:text-sage-700 transition-colors">
                    Login Risk Assessment
                  </h4>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-cream-300 text-espresso-700">
                    Preview / Specs
                  </span>
                </div>
                <p className="text-xs text-espresso-500 mt-1">
                  Inspect the login-risk scoring specifications and backend integration requirements.
                </p>
              </div>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
