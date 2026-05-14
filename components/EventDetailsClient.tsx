'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  MapPin,
  Clock,
  BookOpen,
  Users,
  CheckCircle,
  BarChart3,
  QrCode,
  Sparkles
} from 'lucide-react';

interface BookInfo {
  title: string;
  author: string;
  description?: string;
  coverUrl?: string;
}

interface EventDetailsClientProps {
  event: {
    title: string;
    description: string;
    venue: string;
    startAt: string;
    endAt?: string;
    heroImageUrl?: string;
    theme: string;
    authorName: string;
    book: BookInfo;
  };
  analytics: {
    totalInvites: number;
    acceptedCount: number;
    declinedCount: number;
    attendanceCount: number;
  };
  slug?: string;
}

const themeCopy: Record<string, { label: string; quote: string }> = {
  luxury: {
    label: 'Luxury literary launch',
    quote: 'An evening shaped for story, presence, and the first public breath of a book.'
  },
  poetry: {
    label: 'Poetry salon',
    quote: 'A room for language, listening, and the kind of silence that makes words brighter.'
  },
  minimal: {
    label: 'Modern launch',
    quote: 'Clean, focused, and intimate: the book at the center, the guests close enough to feel it.'
  }
};

export default function EventDetailsClient({ event, analytics, slug }: EventDetailsClientProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const eventDate = useMemo(() => new Date(event.startAt), [event.startAt]);
  const endDate = event.endAt ? new Date(event.endAt) : null;
  const theme = themeCopy[event.theme] ?? themeCopy.luxury;

  useEffect(() => {
    const updateCountdown = () => {
      const distance = eventDate.getTime() - Date.now();

      if (distance <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);
  }, [eventDate]);

  return (
    <div className="min-h-screen bg-[#09070b] text-pearl">
      <section className="relative min-h-[82vh] overflow-hidden">
        {event.heroImageUrl ? (
          <img
            src={event.heroImageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-45"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(197,165,123,0.20),transparent_34%),linear-gradient(135deg,#120d17_0%,#050407_55%,#17120d_100%)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[#09070b]/35 via-[#09070b]/70 to-[#09070b]" />

        <div className="relative mx-auto flex min-h-[82vh] max-w-6xl flex-col justify-end px-6 pb-16 pt-24 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-gold backdrop-blur">
              <Sparkles className="h-4 w-4" />
              {theme.label}
            </div>
            <h1 className="text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
              {event.title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-200">{event.description}</p>
            <p className="mt-6 max-w-2xl border-l border-gold/60 pl-5 font-serif text-xl leading-8 text-pearl/90">
              {theme.quote}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="px-6 py-14 lg:px-8">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-2xl font-semibold text-white">Event Starts In</h2>
              <div className="mt-5 grid grid-cols-4 gap-3">
                {[
                  { label: 'Days', value: timeLeft.days },
                  { label: 'Hours', value: timeLeft.hours },
                  { label: 'Min', value: timeLeft.minutes },
                  { label: 'Sec', value: timeLeft.seconds }
                ].map((item) => (
                  <div key={item.label} className="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
                    <div className="text-3xl font-semibold text-gold">{item.value}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <Calendar className="mb-4 h-5 w-5 text-gold" />
                <p className="text-sm text-slate-400">Date</p>
                <p className="mt-2 text-white">
                  {eventDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <Clock className="mb-4 h-5 w-5 text-gold" />
                <p className="text-sm text-slate-400">Time</p>
                <p className="mt-2 text-white">
                  {eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  {endDate && ` - ${endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <MapPin className="mb-4 h-5 w-5 text-gold" />
                <p className="text-sm text-slate-400">Venue</p>
                <p className="mt-2 text-white">{event.venue}</p>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center gap-3 text-slate-300">
                <BookOpen className="h-5 w-5 text-gold" />
                <span className="font-medium">Featured Book</span>
              </div>
              <div className="mt-6 flex flex-col gap-6 sm:flex-row">
                {event.book.coverUrl ? (
                  <img
                    src={event.book.coverUrl}
                    alt={`${event.book.title} cover`}
                    className="h-56 w-36 rounded-lg object-cover shadow-2xl shadow-black/40"
                  />
                ) : (
                  <div className="flex h-56 w-36 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-slate-900 text-center text-sm text-slate-500">
                    Book cover
                  </div>
                )}
                <div>
                  <h3 className="text-3xl font-semibold text-white">{event.book.title}</h3>
                  <p className="mt-2 text-slate-300">by {event.book.author}</p>
                  <p className="mt-5 max-w-2xl leading-7 text-slate-400">{event.book.description}</p>
                  <p className="mt-5 text-sm text-gold">Hosted by {event.authorName}</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="space-y-6"
          >
            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white">Launch Signals</h3>
                  <p className="text-sm text-slate-400">Live audience and attendance data.</p>
                </div>
                <Users className="h-6 w-6 text-gold" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Invites', value: analytics.totalInvites },
                  { label: 'Accepted', value: analytics.acceptedCount },
                  { label: 'Declined', value: analytics.declinedCount },
                  { label: 'Checked In', value: analytics.attendanceCount }
                ].map((item) => (
                  <div key={item.label} className="rounded-lg bg-slate-950/50 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                    <p className="mt-3 text-3xl font-semibold text-white">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Organizer Tools</h3>
                  <p className="text-sm text-slate-400">Manage invitations and arrival flow.</p>
                </div>
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
              <div className="space-y-3">
                {slug && (
                  <>
                    <Link href={`/events/${slug}/dashboard`} className="block">
                      <Button variant="secondary" size="lg" className="w-full gap-2">
                        <BarChart3 size={18} />
                        View Dashboard
                      </Button>
                    </Link>
                    <Link href={`/events/${slug}/checkin`} className="block">
                      <Button variant="secondary" size="lg" className="w-full gap-2">
                        <QrCode size={18} />
                        Guest Check-In
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.aside>
        </div>
      </section>
    </div>
  );
}
