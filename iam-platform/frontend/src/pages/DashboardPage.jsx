import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { auditApi } from '../api/auditApi';
import { sessionsApi } from '../api/sessionsApi';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Skeleton } from '../components/ui/Skeleton';
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Check,
  CircleAlert,
  Clock3,
  KeyRound,
  RefreshCw,
  Settings2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserRound,
} from 'lucide-react';

function describeEvent(eventType) {
  const normalized = String(eventType || '').toLowerCase().replace(/[\s-]+/g, '_');
  const knownEvents = {
    login_success: 'Sign-in successful',
    login_failed: 'Sign-in failed',
    login_failure: 'Sign-in failed',
    login_blocked: 'Sign-in blocked',
    user_registered: 'Account registered',
    email_verified: 'Email verified',
    password_reset_requested: 'Password reset requested',
    password_reset_success: 'Password reset completed',
    account_locked: 'Account locked',
  };

  if (knownEvents[normalized]) return knownEvents[normalized];
  return String(eventType || 'Security event')
    .replace(/[_-]+/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function sortNewestFirst(events) {
  return [...events].sort((a, b) => {
    const aTime = new Date(a.createdAt).getTime();
    const bTime = new Date(b.createdAt).getTime();
    if (Number.isNaN(aTime) || Number.isNaN(bTime)) return 0;
    return bTime - aTime;
  });
}

function formatCompactDateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function QuickAction({ to, icon, title, description, featured = false }) {
  return (
    <Link to={to} className="group block rounded-card focus-visible:ring-2 focus-visible:ring-sage-500 focus-visible:ring-offset-2">
      <div className={`flex h-full items-start gap-3.5 rounded-card border p-4 transition-all duration-150 group-hover:-translate-y-0.5 group-hover:shadow-card ${featured ? 'border-sage-200 bg-sage-50/70 group-hover:border-sage-500' : 'border-cream-400/80 bg-white group-hover:border-sage-200'}`}>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-control ${featured ? 'bg-sage-100 text-sage-700' : 'bg-cream-100 text-espresso-600'}`}>
          {React.createElement(icon, { className: 'h-5 w-5' })}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between gap-2 text-sm font-semibold text-espresso-800 group-hover:text-sage-700">
            {title}
            <ArrowUpRight className="h-4 w-4 shrink-0 text-espresso-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-sage-600" />
          </span>
          <span className="mt-1 block text-xs leading-relaxed text-espresso-500">{description}</span>
        </span>
      </div>
    </Link>
  );
}

export function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [auditEvents, setAuditEvents] = useState([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [isLoadingAudit, setIsLoadingAudit] = useState(true);
  const [sessionError, setSessionError] = useState(null);
  const [auditError, setAuditError] = useState(null);

  const fetchSessions = useCallback(async () => {
    setIsLoadingSessions(true);
    setSessionError(null);
    try {
      const data = await sessionsApi.getActiveSessions();
      setSessions(Array.isArray(data) ? data : []);
    } catch (err) {
      setSessionError(err.message || 'Unable to retrieve active sessions.');
    } finally {
      setIsLoadingSessions(false);
    }
  }, []);

  const fetchAuditEvents = useCallback(async () => {
    if (!isAdmin) return;
    setIsLoadingAudit(true);
    setAuditError(null);
    try {
      const data = await auditApi.getRecentEvents();
      setAuditEvents(Array.isArray(data) ? sortNewestFirst(data) : []);
    } catch (err) {
      setAuditError(err.message || 'Unable to retrieve recent security activity.');
    } finally {
      setIsLoadingAudit(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    if (isAdmin) fetchAuditEvents();
  }, [fetchAuditEvents, isAdmin]);

  const signInEvents = useMemo(
    () => auditEvents.filter((event) => /login|sign.?in/i.test(event.eventType || '')),
    [auditEvents]
  );
  const failedSignIns = useMemo(
    () => signInEvents.filter((event) => !event.successful),
    [signInEvents]
  );
  const isRefreshing = isLoadingSessions || (isAdmin && isLoadingAudit);

  const refreshDashboard = () => {
    fetchSessions();
    if (isAdmin) fetchAuditEvents();
  };

  return (
    <div className="space-y-6 pb-2">
      <PageHeader
        title="Security overview"
        subtitle={`Welcome${user?.name ? `, ${user.name}` : ''}. Review your account access and the sessions connected to it.`}
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={refreshDashboard}
            isLoading={isRefreshing}
          >
            Refresh overview
          </Button>
        }
      />

      <section className="relative overflow-hidden rounded-card border border-sage-700/20 bg-espresso-800 px-5 py-6 text-cream-50 shadow-card sm:px-7 sm:py-7" aria-label="Account security introduction">
        <div className="pointer-events-none absolute -right-8 -top-20 h-64 w-64 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -right-1 -top-12 h-48 w-48 rounded-full border border-white/10" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-card bg-sage-500/20 text-sage-200 ring-1 ring-white/10">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sage-200">Your account, at a glance</p>
              <h2 className="mt-1 font-display text-xl font-semibold tracking-tight text-white sm:text-2xl">Stay in control of account access</h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-cream-200/80">
                Check the active sessions associated with your account and end any access you no longer recognize.
              </p>
            </div>
          </div>
          <Link to="/sessions" className="inline-flex shrink-0 items-center gap-2 self-start rounded-control border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-200 sm:self-center">
            Review sessions <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3" aria-label="Security summary">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-espresso-500">Account</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-control bg-cream-100 text-espresso-600"><UserRound className="h-4 w-4" /></span>
          </div>
          <p className="mt-4 truncate text-base font-semibold text-espresso-800" title={user?.name || user?.email || 'Signed-in account'}>{user?.name || user?.email || 'Signed-in account'}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge status="active" label="Signed in" />
            {isAdmin && <span className="text-xs text-espresso-500">Administrator</span>}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-espresso-500">Active sessions</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-control bg-sage-50 text-sage-700"><KeyRound className="h-4 w-4" /></span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            {isLoadingSessions ? <Skeleton className="h-9 w-12" /> : sessionError ? <span className="text-2xl font-semibold text-espresso-400">—</span> : <span className="font-display text-3xl font-bold tracking-tight text-espresso-800">{sessions.length}</span>}
            {!isLoadingSessions && !sessionError && <span className="text-sm text-espresso-500">{sessions.length === 1 ? 'session' : 'sessions'}</span>}
          </div>
          <p className="mt-1 text-xs leading-relaxed text-espresso-500">{sessionError ? 'Session status could not be loaded.' : 'Access points that can currently reach your account.'}</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-espresso-500">Sign-in health</p>
            <span className={`flex h-9 w-9 items-center justify-center rounded-control ${failedSignIns.length ? 'bg-status-warning-bg text-status-warning' : 'bg-sage-50 text-sage-700'}`}>
              {failedSignIns.length ? <ShieldAlert className="h-4 w-4" /> : <Activity className="h-4 w-4" />}
            </span>
          </div>
          {!isAdmin ? (
            <>
              <p className="mt-4 text-base font-semibold text-espresso-800">Admin review only</p>
              <p className="mt-2 text-xs leading-relaxed text-espresso-500">Sign-in history is restricted to the administrator audit view.</p>
            </>
          ) : isLoadingAudit ? (
            <div className="mt-4 space-y-2"><Skeleton className="h-5 w-36" /><Skeleton className="h-3 w-44" /></div>
          ) : auditError ? (
            <>
              <p className="mt-4 text-base font-semibold text-espresso-800">Check unavailable</p>
              <p className="mt-2 text-xs leading-relaxed text-espresso-500">Recent sign-in health could not be loaded.</p>
            </>
          ) : signInEvents.length === 0 ? (
            <>
              <p className="mt-4 text-base font-semibold text-espresso-800">No recent sign-ins</p>
              <p className="mt-2 text-xs leading-relaxed text-espresso-500">No sign-in events were returned in the recent audit activity.</p>
            </>
          ) : (
            <>
              <p className="mt-4 text-base font-semibold text-espresso-800">{failedSignIns.length ? `${failedSignIns.length} unsuccessful ${failedSignIns.length === 1 ? 'attempt' : 'attempts'}` : 'No failed attempts'}</p>
              <p className="mt-2 text-xs leading-relaxed text-espresso-500">Based on {signInEvents.length} recent sign-in {signInEvents.length === 1 ? 'event' : 'events'}.</p>
            </>
          )}
        </Card>
      </section>

      <section className={`grid grid-cols-1 gap-5 ${isAdmin ? 'xl:grid-cols-[1.05fr_0.95fr]' : 'xl:grid-cols-[1fr_0.8fr]'}`}>
        <Card
          title="Active sessions"
          subtitle="Current sessions associated with your account"
          actions={
            <Link to="/sessions" className="inline-flex items-center gap-1.5 text-xs font-semibold text-sage-700 hover:text-sage-600">
              Manage sessions <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          }
          noPadding
        >
          {isLoadingSessions ? (
            <div className="space-y-4 p-6" aria-label="Loading active sessions"><Skeleton lines={3} /></div>
          ) : sessionError ? (
            <div className="m-5 rounded-control border border-status-error-border bg-status-error-bg p-4" role="alert">
              <p className="text-sm font-semibold text-status-error">Couldn’t load active sessions</p>
              <p className="mt-1 text-xs leading-relaxed text-status-error">{sessionError}</p>
              <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchSessions} className="mt-3">Try again</Button>
            </div>
          ) : sessions.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-cream-100 text-espresso-500"><KeyRound className="h-5 w-5" /></span>
              <p className="mt-3 text-sm font-semibold text-espresso-800">No active sessions found</p>
              <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-espresso-500">The sessions service returned no active sessions for this account. Refresh to check again.</p>
              <Button variant="secondary" size="sm" icon={RefreshCw} onClick={fetchSessions} className="mt-4">Check again</Button>
            </div>
          ) : (
            <div className="divide-y divide-cream-400/60 px-5">
              {sessions.slice(0, 4).map((session, index) => (
                <div key={session.sessionId || `${session.expiresAt || 'session'}-${index}`} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-sage-50 text-sage-700"><KeyRound className="h-4 w-4" /></span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-espresso-800">Account session</p>
                      <p className="mt-0.5 text-xs text-espresso-500">Session access is active</p>
                    </div>
                  </div>
                  <div className="ml-12 flex items-center gap-2 text-left text-xs text-espresso-500 sm:ml-0 sm:shrink-0 sm:text-right">
                    <Clock3 className="h-3.5 w-3.5 text-espresso-400" />
                    <span><span className="block text-[10px] uppercase tracking-wide text-espresso-400">Expires</span>{formatCompactDateTime(session.expiresAt)}</span>
                  </div>
                </div>
              ))}
              {sessions.length > 4 && (
                <Link to="/sessions" className="flex items-center justify-between py-3 text-xs font-semibold text-sage-700 hover:text-sage-600">
                  <span>View {sessions.length - 4} more {sessions.length - 4 === 1 ? 'session' : 'sessions'}</span><ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          )}
        </Card>

        {isAdmin ? (
          <Card
            title="Recent security activity"
            subtitle="Latest events returned by the administrator audit service"
            actions={<Link to="/admin/audit" className="inline-flex items-center gap-1.5 text-xs font-semibold text-sage-700 hover:text-sage-600">Open audit log <ArrowUpRight className="h-3.5 w-3.5" /></Link>}
            noPadding
          >
            {isLoadingAudit ? (
              <div className="space-y-4 p-6" aria-label="Loading security activity"><Skeleton lines={3} /></div>
            ) : auditError ? (
              <div className="m-5 rounded-control border border-status-error-border bg-status-error-bg p-4" role="alert">
                <p className="text-sm font-semibold text-status-error">Couldn’t load recent activity</p>
                <p className="mt-1 text-xs leading-relaxed text-status-error">{auditError}</p>
                <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchAuditEvents} className="mt-3">Try again</Button>
              </div>
            ) : auditEvents.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-cream-100 text-espresso-500"><Activity className="h-5 w-5" /></span>
                <p className="mt-3 text-sm font-semibold text-espresso-800">No recent activity</p>
                <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-espresso-500">The audit service returned no recent security events.</p>
              </div>
            ) : (
              <div className="divide-y divide-cream-400/60 px-5">
                {auditEvents.slice(0, 5).map((event, index) => (
                  <div key={event.id ?? `${event.eventType || 'event'}-${event.createdAt || index}`} className="flex items-start justify-between gap-3 py-3.5">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${event.successful ? 'bg-status-success-bg text-status-success' : 'bg-status-warning-bg text-status-warning'}`}>
                        {event.successful ? <Check className="h-4 w-4" /> : <CircleAlert className="h-4 w-4" />}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-espresso-800">{describeEvent(event.eventType)}</p>
                        <p className="mt-0.5 truncate text-xs text-espresso-500">{event.email || 'Account security event'}</p>
                      </div>
                    </div>
                    <time className="max-w-[42%] shrink-0 pt-1 text-right text-[11px] text-espresso-500" dateTime={event.createdAt || undefined}>{formatCompactDateTime(event.createdAt)}</time>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ) : (
          <Card title="Security shortcuts" subtitle="Useful next steps for your account" className="p-5">
            <div className="space-y-3">
              <QuickAction
                to="/settings"
                icon={Settings2}
                title="Account settings"
                description="Review your account settings and available security options."
              />
              <QuickAction
                to="/sessions"
                icon={Shield}
                title="Manage sessions"
                description="Review connected sessions and revoke access you no longer need."
                featured
              />
            </div>
          </Card>
        )}
      </section>

      {isAdmin && (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2" aria-label="Quick actions">
          <QuickAction
            to="/settings"
            icon={Settings2}
            title="Account settings"
            description="Review your account settings and available security options."
          />
          <QuickAction
            to="/admin/audit"
            icon={Activity}
            title="Explore the audit log"
            description="Review sign-in outcomes and other recorded security events."
            featured
          />
        </section>
      )}

      {isAdmin && auditError && (
        <p className="flex items-center gap-2 text-xs text-espresso-500"><CircleAlert className="h-3.5 w-3.5" /> Sign-in health is based on recent audit events and may be incomplete while the audit service is unavailable.</p>
      )}
    </div>
  );
}
