import React, { useState, useEffect, useMemo } from 'react';
import { usersApi } from '../api/usersApi';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { DataTable } from '../components/tables/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ErrorState } from '../components/ui/ErrorState';
import { formatDateTime } from '../utils/formatDate';
import { Search, RefreshCw, Users, Shield, Lock, CheckCircle2 } from 'lucide-react';

export function UsersPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await usersApi.getAllUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Unable to retrieve user directory from backend.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase().trim();
    return users.filter(
      (u) =>
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q))
    );
  }, [users, searchQuery]);

  const columns = [
    {
      header: 'User Identity',
      key: 'name',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-cream-200 text-espresso-700 font-semibold text-xs flex items-center justify-center shrink-0 border border-cream-400">
            {item.name ? item.name.slice(0, 2).toUpperCase() : 'U'}
          </div>
          <div>
            <span className="font-semibold text-espresso-800 block text-sm">
              {item.name || 'Unnamed User'}
            </span>
            <span className="text-xs text-espresso-500 font-mono">
              ID: #{item.id}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Email Address',
      key: 'email',
      render: (item) => (
        <span className="text-xs font-medium text-espresso-700">
          {item.email}
        </span>
      ),
    },
    {
      header: 'Account Status',
      key: 'status',
      render: (item) => {
        if (item.locked) {
          return <StatusBadge status="locked" label="Locked" />;
        }
        if (!item.enabled) {
          return <StatusBadge status="disabled" label="Disabled" />;
        }
        return <StatusBadge status="active" label="Active" />;
      },
    },
    {
      header: 'Email Verification',
      key: 'emailVerified',
      render: (item) => (
        <StatusBadge
          status={item.emailVerified ? 'verified' : 'pending'}
          label={item.emailVerified ? 'Verified' : 'Pending Verification'}
        />
      ),
    },
    {
      header: 'Assigned Roles',
      key: 'roles',
      render: (item) => {
        const roles = Array.isArray(item.roles) ? item.roles : [];
        if (roles.length === 0) {
          return <span className="text-xs text-espresso-400">No roles</span>;
        }
        return (
          <div className="flex flex-wrap gap-1">
            {roles.map((r) => {
              const roleName = typeof r === 'string' ? r : r.name;
              const isAdmin = roleName === 'ROLE_ADMIN';
              return (
                <span
                  key={roleName}
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    isAdmin
                      ? 'bg-sage-100 text-sage-700 border-sage-300'
                      : 'bg-cream-100 text-espresso-600 border-cream-400'
                  }`}
                >
                  {roleName.replace('ROLE_', '')}
                </span>
              );
            })}
          </div>
        );
      },
    },
    {
      header: 'Registered',
      key: 'createdAt',
      render: (item) => (
        <span className="text-xs text-espresso-500">
          {formatDateTime(item.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        subtitle="Directory of registered accounts, permission assignments, and verification statuses."
        badge={
          <span className="text-xs px-2.5 py-1 rounded-full bg-cream-200 text-espresso-700 font-semibold border border-cream-400">
            {filteredUsers.length} {filteredUsers.length === 1 ? 'User' : 'Users'}
          </span>
        }
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={fetchUsers}
            isLoading={isLoading}
          >
            Refresh Directory
          </Button>
        }
      />

      {/* Security Context Banner */}
      <div className="p-4 rounded-card bg-cream-50 border border-cream-400 text-xs text-espresso-600 flex items-start gap-3">
        <Shield className="w-4 h-4 text-sage-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          The user directory displays authoritative account details provided by the IAM user service.
          Administrative mutations (role alterations, manual account unlocks) are governed by server-side RBAC.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <Card className="p-4" noPadding>
        <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-espresso-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email address..."
              className="w-full pl-10 pr-4 py-2 text-xs text-espresso-800 bg-white border border-cream-400 rounded-control placeholder:text-espresso-400 focus:outline-none focus:ring-2 focus:ring-sage-500/40 focus:border-sage-500"
            />
          </div>
          <span className="text-xs text-espresso-500 shrink-0">
            Showing {filteredUsers.length} of {users.length} total users
          </span>
        </div>
      </Card>

      {error ? (
        <ErrorState
          title="Unable to load user directory"
          message={error}
          onRetry={fetchUsers}
        />
      ) : (
        <DataTable
          columns={columns}
          data={filteredUsers}
          isLoading={isLoading}
          emptyTitle="No users found"
          emptyDescription={
            searchQuery
              ? `No user records matching "${searchQuery}".`
              : 'There are currently no registered users in the directory.'
          }
        />
      )}
    </div>
  );
}
