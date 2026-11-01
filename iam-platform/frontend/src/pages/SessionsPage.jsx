import React, { useState, useEffect, useCallback } from 'react';
import { sessionsApi } from '../api/sessionsApi';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { DataTable } from '../components/tables/DataTable';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ToastContainer } from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';
import { formatDateTime, formatRelativeTime } from '../utils/formatDate';
import { RefreshCw, Trash2, Shield, AlertCircle, Plus } from 'lucide-react';

export function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddSessionHelp, setShowAddSessionHelp] = useState(false);

  // Revocation state
  const [sessionToRevoke, setSessionToRevoke] = useState(null);
  const [isRevoking, setIsRevoking] = useState(false);

  const { toasts, toast, dismissToast } = useToast();

  const fetchSessions = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    setError(null);
    try {
      const data = await sessionsApi.getActiveSessions();
      setSessions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Unable to retrieve active sessions from server.');
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') fetchSessions(true);
    };
    document.addEventListener('visibilitychange', refreshWhenVisible);
    const refreshInterval = window.setInterval(() => fetchSessions(true), 30_000);
    return () => {
      document.removeEventListener('visibilitychange', refreshWhenVisible);
      window.clearInterval(refreshInterval);
    };
  }, [fetchSessions]);

  const handleConfirmRevoke = async () => {
    if (!sessionToRevoke) return;
    setIsRevoking(true);
    try {
      await sessionsApi.revokeSession(sessionToRevoke.sessionId);
      toast.success('Session revoked', 'That sign-in can no longer refresh its access.');
      setSessions((prev) => prev.filter((s) => s.sessionId !== sessionToRevoke.sessionId));
      setSessionToRevoke(null);
    } catch (err) {
      toast.error('Revocation Failed', err.message || 'Could not revoke session. It may have already expired.');
    } finally {
      setIsRevoking(false);
    }
  };

  const columns = [
    {
      header: 'Sign-in',
      key: 'sessionId',
      render: (item) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-cream-200 text-espresso-600 flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-semibold text-espresso-800">Signed in</span>
            <p className="text-[10px] text-espresso-500 mt-0.5">
              {formatDateTime(item.createdAt)} · {formatRelativeTime(item.createdAt)}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: () => <StatusBadge status="active" label="Active" />,
    },
    {
      header: 'Expiration Time',
      key: 'expiresAt',
      render: (item) => (
        <div>
          <span className="text-xs font-medium text-espresso-800">
            {formatDateTime(item.expiresAt)}
          </span>
          <p className="text-[10px] text-espresso-500 mt-0.5">
            Expires in {formatRelativeTime(item.expiresAt)}
          </p>
        </div>
      ),
    },
    {
      header: 'Actions',
      key: 'actions',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (item) => (
        <Button
          variant="outline"
          size="sm"
          icon={Trash2}
          onClick={() => setSessionToRevoke(item)}
          className="hover:border-status-error hover:text-status-error hover:bg-status-error-bg"
          disabled={isRevoking}
        >
          Revoke
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <PageHeader
        title="Active Sessions"
        subtitle="Review where your account is signed in and remove sign-ins you no longer recognize."
        badge={
          <span className="text-xs px-2.5 py-1 rounded-full bg-cream-200 text-espresso-700 font-semibold border border-cream-400">
            {sessions.length} {sessions.length === 1 ? 'Session' : 'Sessions'}
          </span>
        }
        actions={(
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Plus}
              onClick={() => setShowAddSessionHelp((visible) => !visible)}
              aria-expanded={showAddSessionHelp}
            >
              Add a device
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={() => fetchSessions()}
              isLoading={isLoading}
            >
              Refresh list
            </Button>
          </div>
        )}
      />

      <div className="p-4 rounded-card bg-cream-50 border border-cream-400 text-xs text-espresso-600 flex items-start gap-3">
        <Shield className="w-4 h-4 text-sage-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-espresso-800">Sign-ins and token refresh are handled automatically</p>
          <p className="mt-1 leading-relaxed">
            Each successful sign-in creates a session. The app renews your access in the background—you never need to copy a token or use Postman.
          </p>
          {showAddSessionHelp && (
            <div className="mt-3 rounded-control border border-cream-400 bg-white/80 p-3">
              <p className="font-semibold text-espresso-800">To add another session</p>
              <ol className="mt-1 list-decimal space-y-1 pl-4 leading-relaxed">
                <li>Open this app on another device, or in a separate browser profile/private window.</li>
                <li>Sign in normally. That sign-in will create a separate session automatically.</li>
                <li>Return here and choose “Refresh list” to see it. Revoke any sign-in you no longer use.</li>
              </ol>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-card bg-status-error-bg border border-status-error-border text-xs text-status-error flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Sessions Data Table */}
      <DataTable
        columns={columns}
        data={sessions}
        isLoading={isLoading}
        emptyTitle="No active sessions"
        emptyDescription="There are currently no active refresh sessions for your account."
        keyExtractor={(item) => item.sessionId}
      />

      {/* Revocation Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!sessionToRevoke}
        onClose={() => setSessionToRevoke(null)}
        onConfirm={handleConfirmRevoke}
        title="Revoke Active Session"
        message={`Revoke the sign-in started ${
          sessionToRevoke ? formatDateTime(sessionToRevoke.createdAt) : ''
        }? Its next request will be rejected immediately, and an open app will clear its sign-in within about 15 seconds. That browser or device will need to sign in again.`}
        confirmText="Revoke Session"
        cancelText="Keep Session"
        variant="destructive"
        isLoading={isRevoking}
      />
    </div>
  );
}
