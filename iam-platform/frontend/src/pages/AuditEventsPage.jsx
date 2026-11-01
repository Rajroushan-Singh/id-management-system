import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auditApi } from '../api/auditApi';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { DataTable } from '../components/tables/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ErrorState } from '../components/ui/ErrorState';
import { Modal } from '../components/ui/Modal';
import { formatDateTime } from '../utils/formatDate';
import {
  Activity,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Info,
  Shield,
  X,
} from 'lucide-react';

export function AuditEventsPage() {
  const { email: routeEmail } = useParams();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [emailQuery, setEmailQuery] = useState(routeEmail || '');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'SUCCESS' | 'FAILURE'
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Event detail modal
  const [selectedEvent, setSelectedEvent] = useState(null);

  const fetchEvents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let data;
      if (emailQuery.trim() && routeEmail) {
        data = await auditApi.getEventsForEmail(emailQuery.trim());
      } else {
        data = await auditApi.getRecentEvents();
      }
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Unable to retrieve audit logs from backend.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [routeEmail]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (emailQuery.trim()) {
      navigate(`/admin/audit/email/${encodeURIComponent(emailQuery.trim())}`);
    } else {
      navigate('/admin/audit');
    }
  };

  const handleClearEmailFilter = () => {
    setEmailQuery('');
    navigate('/admin/audit');
  };

  // Unique event types for dropdown filter
  const eventTypes = useMemo(() => {
    const set = new Set(events.map((e) => e.eventType).filter(Boolean));
    return Array.from(set);
  }, [events]);

  // Client-side filtering
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      // Status filter
      if (statusFilter === 'SUCCESS' && !e.successful) return false;
      if (statusFilter === 'FAILURE' && e.successful) return false;

      // Type filter
      if (typeFilter !== 'ALL' && e.eventType !== typeFilter) return false;

      // Text search inside results if not filtered by route
      if (!routeEmail && emailQuery.trim()) {
        const q = emailQuery.toLowerCase().trim();
        const matchesEmail = e.email && e.email.toLowerCase().includes(q);
        const matchesType = e.eventType && e.eventType.toLowerCase().includes(q);
        const matchesDetails = e.details && e.details.toLowerCase().includes(q);
        if (!matchesEmail && !matchesType && !matchesDetails) return false;
      }

      return true;
    });
  }, [events, statusFilter, typeFilter, emailQuery, routeEmail]);

  const columns = [
    {
      header: 'Timestamp',
      key: 'createdAt',
      render: (item) => (
        <span className="text-xs font-mono text-espresso-700 whitespace-nowrap">
          {formatDateTime(item.createdAt)}
        </span>
      ),
    },
    {
      header: 'Event Type',
      key: 'eventType',
      render: (item) => (
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-espresso-800">
            {item.eventType}
          </span>
        </div>
      ),
    },
    {
      header: 'Result',
      key: 'successful',
      render: (item) => (
        <StatusBadge
          status={item.successful ? 'success' : 'error'}
          label={item.successful ? 'SUCCESS' : 'FAILURE'}
        />
      ),
    },
    {
      header: 'Subject / Email',
      key: 'email',
      render: (item) => (
        item.email ? (
          <button
            type="button"
            onClick={() => {
              setEmailQuery(item.email);
              navigate(`/admin/audit/email/${encodeURIComponent(item.email)}`);
            }}
            className="text-xs font-medium text-sage-600 hover:text-sage-700 underline text-left break-all"
            title="Filter by this email"
          >
            {item.email}
          </button>
        ) : (
          <span className="text-xs text-espresso-400 italic">None (System / Unknown)</span>
        )
      ),
    },
    {
      header: 'IP Address',
      key: 'ipAddress',
      render: (item) => (
        <span className="text-xs font-mono text-espresso-600">
          {item.ipAddress || '—'}
        </span>
      ),
    },
    {
      header: 'Details',
      key: 'details',
      render: (item) => (
        item.details ? (
          <button
            type="button"
            onClick={() => setSelectedEvent(item)}
            className="text-xs text-espresso-600 hover:text-espresso-900 truncate max-w-xs block text-left underline decoration-dotted"
          >
            {item.details}
          </button>
        ) : (
          <span className="text-xs text-espresso-400">—</span>
        )
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={routeEmail ? `Audit Logs for ${routeEmail}` : 'Security & Audit Logs'}
        subtitle="Chronological trail of authentication transactions, lockout triggers, and verification events."
        badge={
          <span className="text-xs px-2.5 py-1 rounded-full bg-cream-200 text-espresso-700 font-semibold border border-cream-400">
            {filteredEvents.length} {filteredEvents.length === 1 ? 'Event' : 'Events'}
          </span>
        }
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={fetchEvents}
            isLoading={isLoading}
          >
            Refresh Logs
          </Button>
        }
      />

      {/* Filter Controls Bar */}
      <Card className="p-4" noPadding>
        <div className="p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Email Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-espresso-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={emailQuery}
                onChange={(e) => setEmailQuery(e.target.value)}
                placeholder="Filter by account email..."
                className="w-full pl-9 pr-8 py-2 text-xs text-espresso-800 bg-white border border-cream-400 rounded-control placeholder:text-espresso-400 focus:outline-none focus:ring-2 focus:ring-sage-500/40 focus:border-sage-500"
              />
              {emailQuery && (
                <button
                  type="button"
                  onClick={handleClearEmailFilter}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-espresso-400 hover:text-espresso-800"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <Button type="submit" variant="secondary" size="sm">
              Search
            </Button>
          </form>

          {/* Result & Type Dropdown Filters */}
          <div className="flex items-center gap-3 self-end md:self-center">
            <div className="flex items-center gap-1.5 text-xs text-espresso-600">
              <span className="font-semibold">Result:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2 py-1.5 text-xs bg-white border border-cream-400 rounded-control text-espresso-800 focus:outline-none focus:ring-1 focus:ring-sage-500"
              >
                <option value="ALL">All Outcomes</option>
                <option value="SUCCESS">Success Only</option>
                <option value="FAILURE">Failure Only</option>
              </select>
            </div>

            {eventTypes.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-espresso-600">
                <span className="font-semibold">Type:</span>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-2 py-1.5 text-xs bg-white border border-cream-400 rounded-control text-espresso-800 focus:outline-none focus:ring-1 focus:ring-sage-500 max-w-[150px]"
                >
                  <option value="ALL">All Event Types</option>
                  {eventTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Audit Log Table */}
      {error ? (
        <ErrorState
          title="Failed to retrieve audit events"
          message={error}
          onRetry={fetchEvents}
        />
      ) : (
        <DataTable
          columns={columns}
          data={filteredEvents}
          isLoading={isLoading}
          emptyTitle="No audit records"
          emptyDescription={
            routeEmail
              ? `No audit history recorded for ${routeEmail}.`
              : 'No audit records match the current filter criteria.'
          }
        />
      )}

      {/* Untrusted text display modal for audit detail */}
      <Modal
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title="Audit Event Details"
      >
        {selectedEvent && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-control bg-cream-50 border border-cream-400">
                <span className="text-espresso-500 block text-[10px] uppercase font-bold">Event ID</span>
                <span className="font-mono font-semibold text-espresso-800">#{selectedEvent.id}</span>
              </div>
              <div className="p-3 rounded-control bg-cream-50 border border-cream-400">
                <span className="text-espresso-500 block text-[10px] uppercase font-bold">Status</span>
                <StatusBadge
                  status={selectedEvent.successful ? 'success' : 'error'}
                  label={selectedEvent.successful ? 'Success' : 'Failure'}
                />
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="font-semibold text-espresso-700 block">Event Type</span>
                <span className="text-espresso-900 font-medium">{selectedEvent.eventType}</span>
              </div>
              <div>
                <span className="font-semibold text-espresso-700 block">Account Email</span>
                <span className="text-espresso-900 font-medium">{selectedEvent.email || 'None'}</span>
              </div>
              <div>
                <span className="font-semibold text-espresso-700 block">Source IP</span>
                <span className="font-mono text-espresso-900">{selectedEvent.ipAddress || 'Not captured'}</span>
              </div>
              <div>
                <span className="font-semibold text-espresso-700 block">Timestamp</span>
                <span className="text-espresso-900">{formatDateTime(selectedEvent.createdAt)}</span>
              </div>
            </div>

            <div className="pt-2">
              <span className="font-semibold text-xs text-espresso-700 block mb-1">
                Event Payload / Details (Plain Text)
              </span>
              <div className="p-3 rounded-control bg-cream-100 border border-cream-400 font-mono text-xs text-espresso-800 whitespace-pre-wrap break-all">
                {selectedEvent.details || 'No additional details recorded.'}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" size="sm" onClick={() => setSelectedEvent(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
