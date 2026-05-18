'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ChevronLeft, Sparkles, LogOut, Shield, Menu, X, CalendarPlus, List, Bell, Loader2 } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import NotificationBell from '@/components/NotificationBell';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthUser {
  email: string;
  role: string;
}

function getBackLink(pathname: string): { href: string; label: string } | null {
  if (pathname === '/') return null;
  const segments = pathname.split('/').filter(Boolean);

  if (pathname.startsWith('/admin')) return { href: '/', label: 'Home' };
  if (pathname.startsWith('/events/') && segments.length >= 3) {
    const slug = segments[1];
    if (segments[2] === 'edit') return { href: `/events/${slug}/dashboard`, label: 'Dashboard' };
    if (segments[2] === 'dashboard') return { href: `/events/${slug}`, label: 'Event' };
    if (segments[2] === 'checkin') return { href: `/events/${slug}/dashboard`, label: 'Dashboard' };
    return { href: '/', label: 'Home' };
  }
  if (pathname.startsWith('/my-events')) return { href: '/', label: 'Home' };
  if (pathname.startsWith('/create-event')) return { href: '/', label: 'Home' };
  if (pathname.startsWith('/auth')) return { href: '/', label: 'Home' };
  if (pathname.startsWith('/invite/')) return null;
  if (pathname.startsWith('/notifications')) return { href: '/', label: 'Home' };
  return { href: '/', label: 'Home' };
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === '/';
  const isInvitePage = pathname.startsWith('/invite/');
  const isAdminPage = pathname.startsWith('/admin');
  const back = getBackLink(pathname);

  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Try lightweight endpoint first
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setAuthUser({ email: data.user.email, role: data.user.role });
          }
        }
      } catch {
        // fallback: use Supabase directly
        const supabase = createSupabaseBrowserClient();
        if (supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user?.email) {
            setAuthUser({ email: user.email.toLowerCase(), role: 'USER' });
          }
        }
      } finally {
        setAuthChecking(false);
      }
    };
    checkAuth();
  }, [pathname]);

  useEffect(() => { setMobileMenuOpen(false); }, [pathname]);

  const handleSignOut = async () => {
    setSigningOut(true);
    const supabase = createSupabaseBrowserClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setAuthUser(null);
    setSigningOut(false);
    setMobileMenuOpen(false);
    router.push('/');
    router.refresh();
  };

  if (isAdminPage) return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="absolute inset-0 bg-gradient-to-b from-[#09070b] via-[#09070b]/95 to-transparent pointer-events-none" />
      <nav className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          {back && (
            <Link
              href={back.href}
              className="flex items-center gap-1 text-sm text-slate-400 transition hover:text-pearl shrink-0"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">{back.label}</span>
            </Link>
          )}
          <Link href="/" className="group flex items-center gap-2 shrink-0">
            <Sparkles className="h-5 w-5 text-gold transition group-hover:scale-110 group-hover:text-gold-300" />
            <span className="font-serif text-lg sm:text-xl font-semibold tracking-wide text-pearl transition group-hover:text-gold whitespace-nowrap">
              BLITZ Dar
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {authChecking ? (
            <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
          ) : authUser ? (
            <>
              <div className="hidden md:flex items-center gap-2">
                <NotificationBell />
                {authUser.role === 'SUPER_ADMIN' && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1.5 rounded-full border border-gold/20 bg-gold/5 px-3 py-1.5 text-xs font-medium text-gold transition hover:bg-gold/10"
                  >
                    <Shield className="h-3.5 w-3.5" />
                    <span className="hidden lg:inline">Admin</span>
                  </Link>
                )}
                <Link
                  href="/my-events"
                  className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-white/20 hover:text-pearl"
                >
                  <List className="h-3.5 w-3.5" />
                  <span className="hidden lg:inline">My Events</span>
                </Link>
                <Link
                  href="/create-event"
                  className="flex items-center gap-1.5 rounded-full bg-gold px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-gold-500"
                >
                  <CalendarPlus className="h-3.5 w-3.5" />
                  <span className="hidden lg:inline">Create</span>
                </Link>
                <span className="hidden xl:inline text-xs text-slate-500 truncate max-w-[120px]">
                  {authUser.email}
                </span>
                <span className="hidden lg:inline rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-slate-500">
                  {authUser.role}
                </span>
                <button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-200"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden lg:inline">{signingOut ? '...' : 'Sign Out'}</span>
                </button>
              </div>
              <div className="flex md:hidden items-center gap-1">
                <NotificationBell />
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="flex items-center justify-center rounded-full border border-white/10 bg-white/5 p-2 text-slate-400 transition hover:border-white/20 hover:text-pearl"
                  aria-label="Toggle menu"
                >
                  {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </button>
              </div>
            </>
          ) : (
            <>
              {!isHome && !isInvitePage && (
                <div className="flex items-center gap-2">
                  <Link
                    href="/my-events"
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-white/20 hover:bg-white/10 hover:text-pearl"
                  >
                    My Events
                  </Link>
                  <Link
                    href="/create-event"
                    className="rounded-full bg-gold px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-gold-500"
                  >
                    Create Event
                  </Link>
                </div>
              )}
              {isHome && (
                <Link
                  href="/auth"
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-300 transition hover:border-white/20 hover:bg-white/10 hover:text-pearl"
                >
                  Sign In
                </Link>
              )}
            </>
          )}
        </div>
      </nav>

      <AnimatePresence>
        {mobileMenuOpen && authUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm md:hidden z-40"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-16 right-0 bottom-0 w-72 bg-[#0d0b10] border-l border-white/10 md:hidden z-50 overflow-y-auto"
            >
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10 text-gold text-sm font-semibold">
                    {authUser.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{authUser.email}</p>
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-slate-500">{authUser.role}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  {authUser.role === 'SUPER_ADMIN' && (
                    <Link href="/admin" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-gold hover:bg-gold/5 transition">
                      <Shield className="h-5 w-5" />
                      Admin Dashboard
                    </Link>
                  )}
                  <Link href="/my-events" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-300 hover:bg-white/5 transition">
                    <List className="h-5 w-5" />
                    My Events
                  </Link>
                  <Link href="/create-event" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-300 hover:bg-white/5 transition">
                    <CalendarPlus className="h-5 w-5" />
                    Create Event
                  </Link>
                  <Link href="/notifications" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-300 hover:bg-white/5 transition">
                    <Bell className="h-5 w-5" />
                    Notifications
                  </Link>
                </div>

                <div className="border-t border-white/10 pt-4">
                  <button
                    onClick={handleSignOut}
                    disabled={signingOut}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-red-300 hover:bg-red-500/10 transition"
                  >
                    <LogOut className="h-5 w-5" />
                    {signingOut ? 'Signing out...' : 'Sign Out'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
