'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import EventCard from '@/components/EventCard';

export default function HomePage() {
  // Mock events data
  const featuredEvents = [
    {
      title: 'The Midnight Library Launch',
      description: 'A magical evening celebrating the launch of "The Midnight Library"',
      author: 'Matt Haig',
      date: 'June 15, 2026'
    },
    {
      title: 'Poetry in Motion',
      description: 'An intimate gathering of poets sharing their latest works',
      author: 'Various Poets',
      date: 'July 22, 2026'
    }
  ];

  return (
    <main className="min-h-screen bg-[#09070b] text-pearl overflow-hidden">
      <div className="relative isolate px-6 pb-24 pt-20 lg:px-8">
        <div className="absolute inset-x-0 -top-10 -z-10 transform-gpu overflow-hidden blur-3xl">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] bg-gradient-to-r from-[#caa37a]/20 via-[#7b77ff]/10 to-[#f8f5f2]/0 opacity-80" />
        </div>

        <div className="mx-auto max-w-5xl text-center py-8">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl"
          >
            Craft cinematic book launch experiences for authors, poets, and visionary hosts.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.12, ease: 'easeOut' }}
            className="mx-auto mt-8 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg"
          >
            A premium platform built for personalized literary invitations, RSVP magic, preorder flow,
            attendance tracking, and polished event analytics.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2, ease: 'easeOut' }}
            className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row sm:justify-center"
          >
            <Link
              href="/create-event"
              className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-sm font-semibold text-ink shadow-glow transition hover:-translate-y-0.5 hover:bg-slate-100"
            >
              Start a launch event
            </Link>
            <a
              href="#events"
              className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-8 py-4 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/10"
            >
              Explore events
            </a>
            <Link
              href="/my-events"
              className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-8 py-4 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/10"
            >
              My events workspace
            </Link>
            <Link
              href="/auth"
              className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-8 py-4 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/10"
            >
              Sign in
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Featured Events */}
      <section id="events" className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-semibold text-white mb-4">Featured Launch Events</h2>
            <p className="text-slate-300 max-w-2xl mx-auto">
              Discover upcoming book launches and poetry events crafted with cinematic attention to detail.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {featuredEvents.map((event, index) => (
              <EventCard key={index} event={event} />
            ))}
          </motion.div>
        </div>
      </section>
    </main>
  );
}
