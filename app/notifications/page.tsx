'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Bell, CheckCheck, ExternalLink, Trash2, ArrowLeft } from 'lucide-react';
import { authFetch } from '@/lib/auth-fetch';

function timeAgo(date: string) {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diff = now - then;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string | null;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await authFetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
      }
    } catch {
      // fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    await authFetch(`/api/notifications/${id}`, { method: 'PATCH' });
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllRead = async () => {
    await authFetch('/api/notifications/read-all', { method: 'PATCH' });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const deleteNotification = async (id: string) => {
    await authFetch(`/api/notifications/${id}`, { method: 'DELETE' });
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'approval': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'rejection': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'rsvp': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default: return 'bg-gold/10 text-gold border-gold/20';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09070b] text-pearl flex items-center justify-center">
        <motion.div animate={{ opacity: [0.5, 1] }} transition={{ duration: 1, repeat: Infinity }}>
          Loading...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09070b] text-pearl pt-24 pb-16">
      <div className="mx-auto max-w-3xl px-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-slate-400 hover:text-pearl transition">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-semibold">Notifications</h1>
          </div>
          {notifications.some((n) => !n.isRead) && (
            <button onClick={markAllRead} className="flex items-center gap-1.5 text-sm text-gold hover:text-gold-300 transition">
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center py-24 text-slate-500">
            <Bell className="mb-4 h-12 w-12" />
            <p className="text-lg">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl border p-5 transition ${
                  notif.isRead ? 'border-white/5 bg-white/[0.02] opacity-60' : 'border-white/10 bg-white/5'
                } hover:bg-white/[0.06]`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider border ${getTypeBadge(notif.type)}`}>
                        {notif.type}
                      </span>
                      <span className="text-xs text-slate-500">
                        {timeAgo(notif.createdAt)}
                      </span>
                    </div>
                    <h3 className="text-base font-medium text-white">{notif.title}</h3>
                    {notif.message && (
                      <p className="mt-1 text-sm text-slate-400">{notif.message}</p>
                    )}
                    <div className="mt-3 flex items-center gap-3">
                      {notif.link && (
                        <Link
                          href={notif.link}
                          className="flex items-center gap-1 text-xs text-gold hover:text-gold-300 transition"
                          onClick={() => markAsRead(notif.id)}
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          View details
                        </Link>
                      )}
                      {!notif.isRead && (
                        <button onClick={() => markAsRead(notif.id)} className="text-xs text-slate-500 hover:text-white transition">
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteNotification(notif.id)}
                    className="shrink-0 text-slate-500 hover:text-red-300 transition p-1"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
