'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Search, Shield, UserX, UserCheck, ArrowUp, ArrowDown, MoreHorizontal, RefreshCw, Users } from 'lucide-react';

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isSuspended: boolean;
  createdAt: string;
  _count: { events: number; invitations: number };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const limit = 50;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (roleFilter) params.set('role', roleFilter);
    if (statusFilter) params.set('status', statusFilter);
    params.set('page', page.toString());
    params.set('limit', limit.toString());

    const res = await fetch(`/api/admin/users?${params}`);
    const data = await res.json();
    if (res.ok) {
      setUsers(data.users);
      setTotal(data.total);
    }
    setLoading(false);
  }, [query, roleFilter, statusFilter, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleAction = async (userId: string, action: string, extra?: Record<string, string>) => {
    setActionLoading(userId);
    setMessage('');
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action, ...extra }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        fetchUsers();
      } else {
        setMessage(data.error || 'Action failed');
      }
    } catch {
      setMessage('Network error');
    }
    setActionLoading(null);
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-white">Users</h1>
          <p className="mt-1 text-sm text-slate-400">{total} total users</p>
        </div>
        <button onClick={fetchUsers} className="rounded-lg border border-white/10 p-2 text-slate-400 transition hover:bg-white/5 hover:text-white">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {message && (
        <div className="mb-4 rounded-lg border border-gold/20 bg-gold/5 px-4 py-2 text-sm text-gold">{message}</div>
      )}

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder="Search users..."
            className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-10 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-gold/40 focus:outline-none"
          />
        </div>
        <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 focus:border-gold/40 focus:outline-none">
          <option value="">All Roles</option>
          <option value="USER">User</option>
          <option value="ORGANIZER">Organizer</option>
          <option value="SUPER_ADMIN">Admin</option>
        </select>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 focus:border-gold/40 focus:outline-none">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">User</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Role</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Events</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Joined</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-500">Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-500">No users found</td></tr>
            ) : users.map((user) => (
              <motion.tr key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-white/[0.02] transition hover:bg-white/[0.02]">
                <td className="px-4 py-3">
                  <Link href={`/admin/users/${user.id}`} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/10 text-xs font-medium text-gold">
                      {(user.name || user.email)[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white">{user.name || 'Unnamed'}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    user.role === 'SUPER_ADMIN' ? 'bg-gold/10 text-gold' :
                    user.role === 'ORGANIZER' ? 'bg-emerald-500/10 text-emerald-400' :
                    'bg-slate-500/10 text-slate-400'
                  }`}>{user.role}</span>
                </td>
                <td className="px-4 py-3">
                  {user.isSuspended ? (
                    <span className="flex items-center gap-1.5 text-xs text-red-400"><UserX className="h-3 w-3" /> Suspended</span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs text-emerald-400"><UserCheck className="h-3 w-3" /> Active</span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-400">{user._count.events}</td>
                <td className="px-4 py-3 text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {user.role !== 'SUPER_ADMIN' && (
                      <>
                        {user.isSuspended ? (
                          <button onClick={() => handleAction(user.id, 'activate')} disabled={actionLoading === user.id}
                            className="rounded px-2 py-1 text-xs text-emerald-400 transition hover:bg-emerald-500/10">
                            Activate
                          </button>
                        ) : (
                          <button onClick={() => handleAction(user.id, 'suspend')} disabled={actionLoading === user.id}
                            className="rounded px-2 py-1 text-xs text-red-400 transition hover:bg-red-500/10">
                            Suspend
                          </button>
                        )}
                        {user.role === 'USER' && (
                          <button onClick={() => handleAction(user.id, 'promote', { role: 'ORGANIZER' })} disabled={actionLoading === user.id}
                            className="rounded px-2 py-1 text-xs text-gold transition hover:bg-gold/10">
                            Promote
                          </button>
                        )}
                        {user.role === 'ORGANIZER' && (
                          <button onClick={() => handleAction(user.id, 'demote')} disabled={actionLoading === user.id}
                            className="rounded px-2 py-1 text-xs text-slate-400 transition hover:bg-white/5">
                            Demote
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > limit && (
        <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
          <span>Showing {Math.min((page - 1) * limit + 1, total)}–{Math.min(page * limit, total)} of {total}</span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="rounded-lg border border-white/10 px-3 py-1.5 transition hover:bg-white/5 disabled:opacity-30">Previous</button>
            <button disabled={page * limit >= total} onClick={() => setPage(p => p + 1)} className="rounded-lg border border-white/10 px-3 py-1.5 transition hover:bg-white/5 disabled:opacity-30">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
