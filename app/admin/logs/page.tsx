'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Clock, RefreshCw, Filter } from 'lucide-react';

interface AuditLogEntry {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  description: string | null;
  createdAt: string;
  user: { name: string | null; email: string } | null;
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 100;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (actionFilter) params.set('action', actionFilter);
    if (entityFilter) params.set('entity', entityFilter);
    params.set('page', page.toString());
    params.set('limit', limit.toString());

    const res = await fetch(`/api/admin/logs?${params}`);
    const data = await res.json();
    if (res.ok) {
      setLogs(data.logs);
      setTotal(data.total);
    }
    setLoading(false);
  }, [actionFilter, entityFilter, page]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-white">Audit Log</h1>
          <p className="mt-1 text-sm text-slate-400">{total} total entries</p>
        </div>
        <button onClick={fetchLogs} className="rounded-lg border border-white/10 p-2 text-slate-400 transition hover:bg-white/5 hover:text-white">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <div className="relative flex-1 max-w-xs">
          <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
            placeholder="Filter by action..." className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-10 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-gold/40 focus:outline-none" />
        </div>
        <select value={entityFilter} onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 focus:border-gold/40 focus:outline-none">
          <option value="">All Entities</option>
          <option value="User">User</option>
          <option value="Event">Event</option>
          <option value="Invitation">Invitation</option>
          <option value="CheckIn">Check-In</option>
        </select>
      </div>

      <div className="space-y-1">
        {loading ? (
          <div className="py-12 text-center text-slate-500">Loading...</div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center text-slate-500">No logs found</div>
        ) : logs.map((log) => (
          <motion.div key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex items-center gap-3 rounded-lg px-4 py-2.5 transition hover:bg-white/[0.02]">
            <Clock className="h-3.5 w-3.5 shrink-0 text-slate-500" />
            <span className="min-w-[140px] text-xs font-medium text-white">{log.action}</span>
            <span className="text-xs text-slate-500">{log.entity}{log.entityId ? ` / ${log.entityId.substring(0, 8)}...` : ''}</span>
            {log.description && <span className="text-xs text-slate-400 flex-1 truncate">{log.description}</span>}
            <span className="text-xs text-slate-500 shrink-0">{log.user?.email || 'system'}</span>
            <span className="text-xs text-slate-600 shrink-0">{new Date(log.createdAt).toLocaleString()}</span>
          </motion.div>
        ))}
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
