'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, BookOpen } from 'lucide-react';
import EventCard from '@/components/EventCard';

interface EventData {
  id: string;
  title: string;
  description: string;
  slug: string;
  venue?: string | null;
  startAt: string;
  endAt?: string | null;
  heroImageUrl?: string | null;
  theme: string;
  authorName?: string | null;
  book?: { title: string; author: string; coverUrl?: string | null } | null;
  attendanceCount?: number;
  totalInvites?: number;
}

function SkeletonCard() {
  return (
    <div className="card-premium overflow-hidden">
      <div className="aspect-[16/9] skeleton rounded-none" />
      <div className="space-y-3 p-5">
        <div className="h-5 w-3/4 skeleton" />
        <div className="h-4 w-full skeleton" />
        <div className="h-4 w-1/2 skeleton" />
      </div>
    </div>
  );
}

export default function HomePage() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/events');
        const data = await res.json();
        setEvents(data.events ?? []);
      } catch (err) {
        console.error('Failed to load events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <main className="min-h-screen bg-[#09070b] overflow-hidden">
      {/* ─── Cinematic Hero ─── */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        {/* Layered backgrounds */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(197,165,123,0.15),transparent)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_20%,rgba(123,119,255,0.06),transparent)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_30%_at_20%_80%,rgba(197,165,123,0.05),transparent)]" />
          <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#09070b] to-transparent" />
        </div>

        {/* Floating orbs */}
        <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-gold/5 blur-[120px] animate-float" />
        <div className="absolute right-1/4 bottom-1/3 h-48 w-48 rounded-full bg-purple-500/5 blur-[100px] animate-float-slow" />

        <div className="relative mx-auto max-w-6xl px-6 lg:px-8 py-32 sm:py-40">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-gold"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Premium Literary Events
            </motion.div>

            <h1 className="text-display-xl font-serif text-balance text-white text-shadow-subtle">
              Craft cinematic book launch experiences
            </h1>

            <p className="text-fluid-hero-sub mt-6 max-w-2xl text-slate-300 text-balance leading-relaxed">
              A premium platform for personalized literary invitations, RSVP magic,
              preorder flow, attendance tracking, and polished event analytics.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="mt-10 flex flex-col gap-4 sm:flex-row"
            >
              <Link
                href="/create-event"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-cta px-8 py-4 text-sm font-semibold text-ink shadow-lg shadow-gold/20 transition-all duration-300 hover:shadow-xl hover:shadow-gold/30 hover:-translate-y-0.5"
              >
                <BookOpen className="h-4 w-4" />
                Start a launch event
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="#events"
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-8 py-4 text-sm font-semibold text-pearl backdrop-blur-sm transition duration-300 hover:border-white/30 hover:bg-white/10"
              >
                Explore events
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── Events Section ─── */}
      <section id="events" className="px-6 pb-section">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-gold">
              Discover
            </p>
            <h2 className="text-display-md font-serif text-white">
              Upcoming Launch Events
            </h2>
            <div className="mx-auto mt-4 h-px w-20 bg-gold/40" />
            <p className="mx-auto mt-4 max-w-xl text-sm text-slate-400">
              Explore upcoming book launches and poetry gatherings crafted with cinematic attention to detail.
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : events.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 py-20 text-center"
            >
              <BookOpen className="mb-4 h-12 w-12 text-gold/40" />
              <h3 className="font-serif text-2xl font-semibold text-white">
                No upcoming events yet
              </h3>
              <p className="mt-3 max-w-md text-sm text-slate-400">
                Be the first to create a cinematic book launch or poetry salon experience.
              </p>
              <Link
                href="/create-event"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ink transition hover:bg-gold-500"
              >
                Create your first event
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event, i) => (
                <EventCard key={event.id} event={event} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-white/5 px-6 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <span className="font-serif text-sm text-slate-500">
            Hadithi — where stories come alive
          </span>
          <span className="text-xs text-slate-600">
            &copy; {new Date().getFullYear()} Hadithi
          </span>
        </div>
      </footer>
    </main>
  );
}
