'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Search, Calendar, Star, Trash2, RefreshCw, CheckCircle, XCircle, Clock, Archive, Eye, Edit3 } from 'lucide-react';
import { authFetch } from '@/lib/auth-fetch';

interface AdminEvent {
  id: string;
  title: string;
  slug: string;
  status: string;
  featured: boolean;
  createdAt: string;
  approvedAt: string | null;
  rejectionReason: string | null;
  author: { id: string; name: string | null; email: string } | null;
  analytics: { totalInvites: number; attendanceCount: number } | null;
  _count: { invitations: number };
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  DRAFT: { label: 'Draft', color: 'bg-slate-500/10 text-slate-400', icon: Clock },
  PENDING_APPROVAL: { label: 'Pending', color: 'bg-amber-500/10 text-amber-400', icon: Clock },
  PUBLISHED: { label: 'Published', color: 'bg-emerald-500/10 text-emerald-400', icon: CheckCircle },
  REJECTED: { label: 'Rejected', color: 'bg-red-500/10 text-red-400', icon: XCircle },
  ARCHIVED: { label: 'Archived', color: 'bg-slate-500/10 text-slate-500', icon: Archive },
};

export default function AdminEventsPage() {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const limit = 50;

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (statusFilter) params.set('status', statusFilter);
    params.set('page', page.toString());
    params.set('limit', limit.toString());

    const res = await authFetch(`/api/admin/events?${params}`);
    const data = await res.json();
    if (res.ok) {
      setEvents(data.events);
      setTotal(data.total);
    }
    setLoading(false);
  }, [query, statusFilter, page]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const changeStatus = async (eventId: string, newStatus: string, reason?: string) => {
    setActionLoading(eventId);
    setMessage('');
    try {
      const res = await authFetch('/api/admin/events', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, status: newStatus, reason }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || 'Done');
        fetchEvents();
      } else {
        setMessage(data.error || 'Action failed');
      }
    } catch {
      setMessage('Network error');
    }
    setActionLoading(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-white">Events</h1>
          <p className="mt-1 text-sm text-slate-400">{total} total</p>
        </div>
        <button onClick={fetchEvents} className="rounded-lg border border-white/10 p-2 text-slate-400 transition hover:bg-white/5 hover:text-white">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <AnimatePresence>
        {message && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mb-4 rounded-lg border border-gold/20 bg-gold/5 px-4 py-2.5 text-sm text-gold">{message}</motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder="Search events..." className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-10 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-gold/40 focus:outline-none" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 focus:border-gold/40 focus:outline-none">
          <option value="">All Status</option>
          <option value="PENDING_APPROVAL">Pending Approval</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
          <option value="REJECTED">Rejected</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      {/* Pending approval banner */}
      {events.filter(e => e.status === 'PENDING_APPROVAL').length > 0 && (
        <div className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <p className="text-sm font-medium text-amber-400">
            {events.filter(e => e.status === 'PENDING_APPROVAL').length} event(s) pending approval
          </p>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-slate-500">Event</th>
              <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-medium text-slate-500">Organizer</th>
              <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-slate-500">Status</th>
              <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-slate-500">Invites</th>
              <th className="px-3 sm:px-4 py-3 text-right text-xs font-medium text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-slate-500">Loading...</td></tr>
            ) : events.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-slate-500">No events found</td></tr>
            ) : events.map((event) => {
              const cfg = statusConfig[event.status] || statusConfig.DRAFT;
              const StatusIcon = cfg.icon;
              return (
                <motion.tr key={event.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="border-b border-white/[0.02] transition hover:bg-white/[0.02]">
                  <td className="px-3 sm:px-4 py-3">
                    <Link href={`/events/${event.slug}`} className="flex items-center gap-3 min-w-0">
                      <Calendar className="h-4 w-4 shrink-0 text-slate-500 hidden sm:block" />
                      <div className="min-w-0">
                        <p className="text-white truncate">{event.title}</p>
                        <p className="text-xs text-slate-500 truncate">/{event.slug}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="hidden sm:table-cell px-4 py-3 text-slate-400 truncate max-w-[160px]">
                    {event.author?.name || event.author?.email || '—'}
                  </td>
                  <td className="px-3 sm:px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium ${cfg.color}`}>
                        <StatusIcon className="h-3 w-3" />
                        {cfg.label}
                      </span>
                      {event.featured && <Star className="h-3 w-3 text-gold shrink-0" />}
                    </div>
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 text-slate-400">{event._count.invitations}</td>
                  <td className="px-3 sm:px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1 flex-wrap">
                      {event.status === 'PENDING_APPROVAL' && (
                        <>
                          <button onClick={() => changeStatus(event.id, 'PUBLISHED')} disabled={actionLoading === event.id}
                            className="rounded px-2 py-1 text-xs text-emerald-400 transition hover:bg-emerald-500/10" title="Approve">
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button onClick={() => {
                            const r = prompt('Rejection reason (optional):');
                            changeStatus(event.id, 'REJECTED', r || undefined);
                          }} disabled={actionLoading === event.id}
                            className="rounded px-2 py-1 text-xs text-red-400 transition hover:bg-red-500/10" title="Reject">
                            <XCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      {event.status === 'PUBLISHED' && (
                        <button onClick={() => changeStatus(event.id, 'DRAFT')} disabled={actionLoading === event.id}
                          className="rounded px-2 py-1 text-xs text-slate-400 transition hover:bg-white/5" title="Unpublish">
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                      {event.status === 'REJECTED' && (
                        <button onClick={() => changeStatus(event.id, 'PENDING_APPROVAL')} disabled={actionLoading === event.id}
                          className="rounded px-2 py-1 text-xs text-amber-400 transition hover:bg-amber-500/10" title="Resubmit for review">
                          <Clock className="h-4 w-4" />
                        </button>
                      )}
                      <button onClick={() => {
                          const isFeatured = event.featured;
                          authFetch('/api/admin/events', {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ eventId: event.id, action: isFeatured ? 'unfeature' : 'feature' }),
                          }).then(() => fetchEvents());
                        }} disabled={actionLoading === event.id}
                        className={`rounded px-2 py-1 text-xs transition hover:bg-white/5 ${event.featured ? 'text-gold' : 'text-slate-400'}`} title={event.featured ? 'Unfeature' : 'Feature'}>
                        <Star className="h-4 w-4" />
                      </button>
                      <Link href={`/events/${event.slug}/edit`}
                        className="rounded px-2 py-1 text-xs text-sky-400 transition hover:bg-sky-500/10" title="Edit event details">
                        <Edit3 className="h-4 w-4" />
                      </Link>
                      <button onClick={() => { if (confirm('Archive this event?')) changeStatus(event.id, 'ARCHIVED'); }} disabled={actionLoading === event.id}
                        className="rounded px-2 py-1 text-xs text-red-400 transition hover:bg-red-500/10" title="Archive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {total > limit && (
        <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
          <span>Page {page} of {Math.ceil(total / limit)}</span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="rounded-lg border border-white/10 px-3 py-1.5 transition hover:bg-white/5 disabled:opacity-30">Previous</button>
            <button disabled={page * limit >= total} onClick={() => setPage(p => p + 1)} className="rounded-lg border border-white/10 px-3 py-1.5 transition hover:bg-white/5 disabled:opacity-30">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
