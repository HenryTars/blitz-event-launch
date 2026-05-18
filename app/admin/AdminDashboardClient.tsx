'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Users,
  Calendar,
  Mail,
  QrCode,
  TrendingUp,
  UserPlus,
  Activity,
  Shield,
  ArrowRight,
  Clock
} from 'lucide-react';

interface Props {
  stats: {
    totalUsers: number;
    totalOrganizers: number;
    totalAdmins: number;
    totalEvents: number;
    totalInvitations: number;
    totalCheckIns: number;
    eventsByStatus: { published: number; pending: number; draft: number; rejected: number; archived: number; total: number };
    eventsByDay: { date: string; count: number }[];
  };
  recentUsers: { id: string; name: string | null; email: string; role: string; createdAt: string }[];
  recentEvents: { id: string; title: string; slug: string; author: { name: string | null; email: string } | null; createdAt: string }[];
  recentLogs: { id: string; action: string; entity: string; user: { name: string | null; email: string } | null; createdAt: string }[];
}

const numericStats: { key: keyof Props['stats']; label: string; icon: any; color: string }[] = [
  { key: 'totalUsers', label: 'Total Users', icon: Users, color: 'from-blue-500/20 to-blue-500/5 border-blue-500/20' },
  { key: 'totalOrganizers', label: 'Organizers', icon: UserPlus, color: 'from-gold/20 to-gold/5 border-gold/20' },
  { key: 'totalEvents', label: 'Total Events', icon: Calendar, color: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20' },
  { key: 'totalInvitations', label: 'Invitations', icon: Mail, color: 'from-violet-500/20 to-violet-500/5 border-violet-500/20' },
  { key: 'totalCheckIns', label: 'Check-Ins', icon: QrCode, color: 'from-amber-500/20 to-amber-500/5 border-amber-500/20' },
  { key: 'totalAdmins', label: 'Admins', icon: Shield, color: 'from-red-500/20 to-red-500/5 border-red-500/20' },
];

export default function AdminDashboardClient({ stats, recentUsers, recentEvents, recentLogs }: Props) {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-semibold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-400">Platform overview and analytics</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {numericStats.map((card, i) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`rounded-xl border bg-gradient-to-br p-5 ${card.color}`}
          >
            <card.icon className="h-5 w-5 text-white/60" />
            <p className="mt-3 text-2xl font-semibold text-white">
              {stats[card.key] as number}
            </p>
            <p className="mt-1 text-xs text-slate-500">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Event status bar */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Event status breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-white/10 bg-white/5 p-6"
        >
          <h2 className="text-sm font-medium text-white">Event Status</h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Published</span>
              <span className="font-medium text-emerald-400">{stats.eventsByStatus.published}</span>
            </div>
            <div className="h-2 rounded-full bg-white/5">
              <div className="h-2 rounded-full bg-emerald-500 transition-all" style={{ width: `${stats.eventsByStatus.total > 0 ? (stats.eventsByStatus.published / stats.eventsByStatus.total) * 100 : 0}%` }} />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Pending Approval</span>
              <span className="font-medium text-amber-400">{stats.eventsByStatus.pending}</span>
            </div>
            <div className="h-2 rounded-full bg-white/5">
              <div className="h-2 rounded-full bg-amber-500 transition-all" style={{ width: `${stats.eventsByStatus.total > 0 ? (stats.eventsByStatus.pending / stats.eventsByStatus.total) * 100 : 0}%` }} />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Draft</span>
              <span className="font-medium text-slate-400">{stats.eventsByStatus.draft}</span>
            </div>
            <div className="h-2 rounded-full bg-white/5">
              <div className="h-2 rounded-full bg-slate-500 transition-all" style={{ width: `${stats.eventsByStatus.total > 0 ? (stats.eventsByStatus.draft / stats.eventsByStatus.total) * 100 : 0}%` }} />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Rejected</span>
              <span className="font-medium text-red-400">{stats.eventsByStatus.rejected}</span>
            </div>
            <div className="h-2 rounded-full bg-white/5">
              <div className="h-2 rounded-full bg-red-500 transition-all" style={{ width: `${stats.eventsByStatus.total > 0 ? (stats.eventsByStatus.rejected / stats.eventsByStatus.total) * 100 : 0}%` }} />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Archived</span>
              <span className="font-medium text-slate-500">{stats.eventsByStatus.archived}</span>
            </div>
            <div className="h-2 rounded-full bg-white/5">
              <div className="h-2 rounded-full bg-slate-600 transition-all" style={{ width: `${stats.eventsByStatus.total > 0 ? (stats.eventsByStatus.archived / stats.eventsByStatus.total) * 100 : 0}%` }} />
            </div>
          </div>
        </motion.div>

        {/* Recent activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-xl border border-white/10 bg-white/5 p-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-white">Recent Activity</h2>
            <Activity className="h-4 w-4 text-slate-500" />
          </div>
          <div className="mt-4 space-y-2">
            {recentLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-center gap-3 rounded-lg bg-white/[0.02] px-3 py-2 text-xs">
                <Clock className="h-3 w-3 shrink-0 text-slate-500" />
                <span className="text-slate-400">{log.action}</span>
                <span className="ml-auto text-slate-600">{new Date(log.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
          <Link href="/admin/logs" className="mt-3 flex items-center gap-1.5 text-xs text-gold transition hover:text-gold/80">
            View all logs <ArrowRight className="h-3 w-3" />
          </Link>
        </motion.div>
      </div>

      {/* Recent users and events */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Recent Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border border-white/10 bg-white/5 p-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-white">Recent Users</h2>
            <Link href="/admin/users" className="text-xs text-gold hover:text-gold/80">View all</Link>
          </div>
          <div className="mt-4 space-y-1">
            {recentUsers.map((user) => (
              <Link
                key={user.id}
                href={`/admin/users/${user.id}`}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition hover:bg-white/[0.03]"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gold/10 text-[10px] font-medium text-gold">
                  {(user.name || user.email)[0].toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-white">{user.name || 'Unnamed'}</p>
                  <p className="truncate text-xs text-slate-500">{user.email}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  user.role === 'SUPER_ADMIN' ? 'bg-gold/10 text-gold' :
                  user.role === 'ORGANIZER' ? 'bg-emerald-500/10 text-emerald-400' :
                  'bg-slate-500/10 text-slate-400'
                }`}>
                  {user.role}
                </span>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Recent Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="rounded-xl border border-white/10 bg-white/5 p-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-white">Recent Events</h2>
            <Link href="/admin/events" className="text-xs text-gold hover:text-gold/80">View all</Link>
          </div>
          <div className="mt-4 space-y-1">
            {recentEvents.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.slug}`}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition hover:bg-white/[0.03]"
              >
                <Calendar className="h-4 w-4 shrink-0 text-slate-500" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-white">{event.title}</p>
                  <p className="truncate text-xs text-slate-500">{event.author?.name || event.author?.email || 'Unknown'}</p>
                </div>
                <span className="text-xs text-slate-600">{new Date(event.createdAt).toLocaleDateString()}</span>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
