'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Calendar,
  ScrollText,
  Settings,
  Shield,
  ChevronLeft,
  Sparkles
} from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/events', label: 'Events', icon: Calendar },
  { href: '/admin/logs', label: 'Audit Log', icon: ScrollText },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-white/5 bg-[#0a0a0f]">
      <div className="flex h-full flex-col">
        {/* Brand */}
        <div className="flex items-center gap-3 border-b border-white/5 px-6 py-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/20">
            <Shield className="h-4 w-4 text-gold" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">BLITZ Dar</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-gold">Admin</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-6">
          {navItems.map((item) => {
            const isActive = item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gold/10 text-gold shadow-sm'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Back to site */}
        <div className="border-t border-white/5 p-4">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-500 transition hover:bg-white/5 hover:text-slate-300"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Back to site
          </Link>
        </div>
      </div>
    </aside>
  );
}
