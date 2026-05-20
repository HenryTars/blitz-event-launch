'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCheck, ExternalLink, X } from 'lucide-react';
import { authFetch } from '@/lib/auth-fetch';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string | null;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

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

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await authFetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch {
      // silently fail
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const markAsRead = async (id: string) => {
    await authFetch(`/api/notifications/${id}`, { method: 'PATCH' });
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    await authFetch('/api/notifications/read-all', { method: 'PATCH' });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'approval': return 'text-emerald-400';
      case 'rejection': return 'text-red-400';
      case 'rsvp': return 'text-blue-400';
      case 'info': return 'text-gold';
      default: return 'text-slate-400';
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center rounded-full border border-white/10 bg-white/5 p-2 text-slate-400 transition hover:border-white/20 hover:text-pearl"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[14px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 sm:w-96 max-h-[70vh] overflow-hidden rounded-2xl border border-white/10 bg-[#0d0b10] shadow-2xl shadow-black/60 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <h3 className="text-sm font-semibold text-white">Notifications</h3>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-gold hover:text-gold-300 transition">
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            <div className="overflow-y-auto max-h-[calc(70vh-52px)]">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-slate-500">
                  <Bell className="mb-2 h-6 w-6" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`group relative border-b border-white/5 px-4 py-3 transition ${
                      notif.isRead ? 'opacity-60' : 'bg-white/[0.02]'
                    } hover:bg-white/[0.04]`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${notif.isRead ? 'bg-transparent' : getTypeIcon(notif.type)}`} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-white truncate">{notif.title}</p>
                          <span className="shrink-0 text-[10px] text-slate-500">
                            {timeAgo(notif.createdAt)}
                          </span>
                        </div>
                        {notif.message && (
                          <p className="mt-0.5 text-xs text-slate-400 line-clamp-2">{notif.message}</p>
                        )}
                        <div className="mt-1.5 flex items-center gap-2">
                          {notif.link && (
                            <Link
                              href={notif.link}
                              className="flex items-center gap-1 text-[11px] text-gold hover:text-gold-300 transition"
                              onClick={() => { markAsRead(notif.id); setIsOpen(false); }}
                            >
                              <ExternalLink className="h-3 w-3" />
                              View
                            </Link>
                          )}
                          {!notif.isRead && (
                            <button
                              onClick={() => markAsRead(notif.id)}
                              className="text-[11px] text-slate-500 hover:text-white transition"
                            >
                              Mark read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <Link
                href="/notifications"
                onClick={() => setIsOpen(false)}
                className="block border-t border-white/10 px-4 py-2.5 text-center text-xs text-gold hover:text-gold-300 transition"
              >
                View all notifications
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
