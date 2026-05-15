'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Search, Calendar, Eye, EyeOff, Star, Trash2, RefreshCw } from 'lucide-react';

interface AdminEvent {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  featured: boolean;
  createdAt: string;
  author: { id: string; name: string | null; email: string } | null;
  analytics: { totalInvites: number; attendanceCount: number } | null;
  _count: { invitations: number };
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const limit = 50;

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (status) params.set('status', status);
    params.set('page', page.toString());
    params.set('limit', limit.toString());

    const res = await fetch(`/api/admin/events?${params}`);
    const data = await res.json();
    if (res.ok) {
      setEvents(data.events);
      setTotal(data.total);
    }
    setLoading(false);
  }, [query, status, page]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const handleAction = async (eventId: string, action: string) => {
    setActionLoading(eventId);
    setMessage('');
    try {
      const res = await fetch('/api/admin/events', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, action }),
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
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-white">Events</h1>
          <p className="mt-1 text-sm text-slate-400">{total} total events</p>
        </div>
        <button onClick={fetchEvents} className="rounded-lg border border-white/10 p-2 text-slate-400 transition hover:bg-white/5 hover:text-white">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {message && <div className="mb-4 rounded-lg border border-gold/20 bg-gold/5 px-4 py-2 text-sm text-gold">{message}</div>}

      <div className="mb-6 flex flex-wrap gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder="Search events..." className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-10 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-gold/40 focus:outline-none" />
        </div>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 focus:border-gold/40 focus:outline-none">
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Event</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Organizer</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Invites</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Attendance</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-500">Loading...</td></tr>
            ) : events.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-500">No events found</td></tr>
            ) : events.map((event) => (
              <motion.tr key={event.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-white/[0.02] transition hover:bg-white/[0.02]">
                <td className="px-4 py-3">
                  <Link href={`/events/${event.slug}`} className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 shrink-0 text-slate-500" />
                    <div>
                      <p className="text-white">{event.title}</p>
                      <p className="text-xs text-slate-500">/{event.slug}</p>
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-400">{event.author?.name || event.author?.email || '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {event.published ? (
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">Published</span>
                    ) : (
                      <span className="rounded-full bg-slate-500/10 px-2 py-0.5 text-[10px] font-medium text-slate-400">Draft</span>
                    )}
                    {event.featured && <Star className="h-3 w-3 text-gold" />}
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-400">{event._count.invitations}</td>
                <td className="px-4 py-3 text-slate-400">{event.analytics?.attendanceCount || 0}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => handleAction(event.id, event.published ? 'unpublish' : 'publish')} disabled={actionLoading === event.id}
                      className="rounded px-2 py-1 text-xs text-slate-400 transition hover:bg-white/5" title={event.published ? 'Unpublish' : 'Publish'}>
                      {event.published ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                    <button onClick={() => handleAction(event.id, event.featured ? 'unfeature' : 'feature')} disabled={actionLoading === event.id}
                      className={`rounded px-2 py-1 text-xs transition hover:bg-white/5 ${event.featured ? 'text-gold' : 'text-slate-400'}`} title={event.featured ? 'Unfeature' : 'Feature'}>
                      <Star className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => { if (confirm('Delete this event? It will be hidden from public.')) handleAction(event.id, 'delete'); }} disabled={actionLoading === event.id}
                      className="rounded px-2 py-1 text-xs text-red-400 transition hover:bg-red-500/10" title="Delete">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
