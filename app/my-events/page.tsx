'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CalendarDays, Mail, CheckCircle2, XCircle, Clock3, QrCode } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

interface EventSummary {
  id: string;
  slug: string;
  title: string;
  venue?: string;
  startAt: string;
  theme: string;
  book: { title: string; author: string } | null;
  analytics: {
    totalInvites: number;
    acceptedCount: number;
    declinedCount: number;
    laterCount: number;
    preorderCount: number;
    attendanceCount: number;
  };
}

export default function MyEventsPage() {
  const [email, setEmail] = useState('');
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data } = await supabase.auth.getUser();
        if (!data.user?.email) {
          setError('Please sign in to view your events.');
          setLoading(false);
          return;
        }
        setEmail(data.user.email);

        const response = await fetch('/api/events/mine');
        const payload = await response.json();
        if (!response.ok) {
          setError(payload.error || 'Failed to load events.');
          setLoading(false);
          return;
        }
        setEvents(payload.events ?? []);
        setLoading(false);
      } catch (err) {
        console.error('Error loading events:', err);
        setError('Unable to connect to database. Please try again later.');
        setLoading(false);
      }
    };

    init();
  }, []);

  const totals = events.reduce(
    (acc, event) => {
      acc.totalEvents += 1;
      acc.totalInvites += event.analytics.totalInvites;
      acc.accepted += event.analytics.acceptedCount;
      acc.declined += event.analytics.declinedCount;
      acc.later += event.analytics.laterCount;
      acc.checkedIn += event.analytics.attendanceCount;
      return acc;
    },
    { totalEvents: 0, totalInvites: 0, accepted: 0, declined: 0, later: 0, checkedIn: 0 }
  );

  return (
    <main className="min-h-screen bg-[#09070b] px-6 py-12 text-pearl">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-2xl border border-white/10 bg-white/5 p-8">
          <h1 className="text-4xl font-semibold text-white">My Events</h1>
          <p className="mt-3 text-slate-300">Signed in as {email || '...'}</p>
          {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
        </section>

        {!loading && !error && (
          <section className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {[
              { label: 'Events', value: totals.totalEvents, icon: CalendarDays },
              { label: 'Invites', value: totals.totalInvites, icon: Mail },
              { label: 'Accepted', value: totals.accepted, icon: CheckCircle2 },
              { label: 'Declined', value: totals.declined, icon: XCircle },
              { label: 'Later', value: totals.later, icon: Clock3 },
              { label: 'Checked In', value: totals.checkedIn, icon: QrCode }
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <item.icon className="h-5 w-5 text-gold" />
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
              </div>
            ))}
          </section>
        )}

        <section className="space-y-4">
          {loading && <p className="text-slate-300">Loading your events...</p>}
          {!loading && !error && events.length === 0 && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-slate-300">
              <p>No events yet.</p>
              <Link href="/create-event">
                <Button className="mt-4">Create Your First Event</Button>
              </Link>
            </div>
          )}
          {!loading &&
            events.map((event, idx) => (
              <motion.article
                key={event.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="rounded-xl border border-white/10 bg-white/5 p-6"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-gold">{event.theme}</p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">{event.title}</h2>
                    <p className="mt-2 text-slate-400">{new Date(event.startAt).toLocaleString()} / {event.venue || 'Venue TBA'}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/events/${event.slug}`}><Button variant="secondary">View Event</Button></Link>
                    <Link href={`/events/${event.slug}/dashboard`}><Button variant="secondary">Dashboard</Button></Link>
                    <Link href={`/events/${event.slug}/checkin`}><Button variant="secondary">Check-In</Button></Link>
                  </div>
                </div>
              </motion.article>
            ))}
        </section>
      </div>
    </main>
  );
}
