'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ChevronLeft, Sparkles, LogOut, User } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

function getBackLink(pathname: string): { href: string; label: string } | null {
  if (pathname === '/') return null;
  const segments = pathname.split('/').filter(Boolean);

  if (pathname.startsWith('/events/') && segments.length >= 3) {
    const slug = segments[1];
    if (segments[2] === 'dashboard') return { href: `/events/${slug}`, label: 'Event' };
    if (segments[2] === 'checkin') return { href: `/events/${slug}/dashboard`, label: 'Dashboard' };
    return { href: '/', label: 'Home' };
  }
  if (pathname.startsWith('/my-events')) return { href: '/', label: 'Home' };
  if (pathname.startsWith('/create-event')) return { href: '/', label: 'Home' };
  if (pathname.startsWith('/auth')) return { href: '/', label: 'Home' };
  if (pathname.startsWith('/invite/')) return null;
  return { href: '/', label: 'Home' };
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === '/';
  const isInvitePage = pathname.startsWith('/invite/');
  const back = getBackLink(pathname);

  const [authUser, setAuthUser] = useState<{ email: string } | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) {
        setAuthUser({ email: data.user.email });
      }
    });
  }, [pathname]);

  const handleSignOut = async () => {
    setSigningOut(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    setAuthUser(null);
    setSigningOut(false);
    router.push('/');
    router.refresh();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="absolute inset-0 bg-gradient-to-b from-[#09070b] via-[#09070b]/95 to-transparent pointer-events-none" />
      <nav className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        <div className="flex items-center gap-4">
          {back && (
            <Link
              href={back.href}
              className="flex items-center gap-1.5 text-sm text-slate-400 transition hover:text-pearl"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>{back.label}</span>
            </Link>
          )}
          <Link href="/" className="group flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-gold transition group-hover:scale-110 group-hover:text-gold-300" />
            <span className="font-serif text-xl font-semibold tracking-wide text-pearl transition group-hover:text-gold">
              Hadithi
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {!isHome && !isInvitePage && !authUser && (
            <>
              <Link
                href="/my-events"
                className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-300 transition hover:border-white/20 hover:bg-white/10 hover:text-pearl"
              >
                My Events
              </Link>
              <Link
                href="/create-event"
                className="rounded-full bg-gold px-4 py-1.5 text-xs font-semibold text-ink transition hover:bg-gold-500"
              >
                Create Event
              </Link>
            </>
          )}

          {authUser && (
            <div className="flex items-center gap-3">
              <span className="hidden text-xs text-slate-500 sm:block truncate max-w-[140px]">
                {authUser.email}
              </span>
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-slate-300 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-200"
              >
                <LogOut className="h-3.5 w-3.5" />
                {signingOut ? '...' : 'Sign Out'}
              </button>
            </div>
          )}

          {!authUser && isHome && (
            <Link
              href="/auth"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-300 transition hover:border-white/20 hover:bg-white/10 hover:text-pearl"
            >
              Sign In
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
