'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
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
  Sparkles,
  ChevronRight,
  Mail,
  Phone,
  User,
  Send,
  Check,
  ArrowRight
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
    authorEmail: string;
    book: BookInfo;
  };
  analytics?: {
    totalInvites: number;
    acceptedCount: number;
    declinedCount: number;
    attendanceCount: number;
  };
  isOrganizer?: boolean;
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

export default function EventDetailsClient({
  event,
  analytics,
  isOrganizer = false,
  slug
}: EventDetailsClientProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const eventDate = useMemo(() => new Date(event.startAt), [event.startAt]);
  const endDate = event.endAt ? new Date(event.endAt) : null;
  const theme = themeCopy[event.theme] ?? themeCopy.luxury;

  // Invitation request state
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState<{ token: string; link: string } | null>(null);

  // RSVP state (for invited guests who arrive via token link)
  const [rsvpStatus, setRsvpStatus] = useState<string | null>(null);
  const [rsvpLoading, setRsvpLoading] = useState(false);

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

  const handleRequestInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    try {
      const res = await fetch('/api/invitations/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventSlug: slug,
          guestName: formData.name,
          email: formData.email,
          phone: formData.phone
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to request invitation');
      }

      setFormSuccess({ token: data.token, link: data.inviteLink });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09070b] text-pearl">
      {/* ─── Cinematic Hero ─── */}
      <section className="relative min-h-[85vh] overflow-hidden">
        {event.heroImageUrl ? (
          <img
            src={event.heroImageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-40"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(197,165,123,0.20),transparent_34%),linear-gradient(135deg,#120d17_0%,#050407_55%,#17120d_100%)]" />
        )}
        {/* Floating orbs */}
        <div className="absolute left-1/3 top-1/4 h-72 w-72 rounded-full bg-gold/5 blur-[140px] animate-float" />
        <div className="absolute right-1/4 bottom-1/4 h-56 w-56 rounded-full bg-purple-500/5 blur-[120px] animate-float-slow" />

        <div className="absolute inset-0 bg-gradient-to-b from-[#09070b]/20 via-[#09070b]/60 to-[#09070b]" />

        <div className="relative mx-auto flex min-h-[85vh] max-w-6xl flex-col justify-end px-6 pb-20 pt-24 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-gold backdrop-blur-sm"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {theme.label}
            </motion.div>

            <h1 className="text-display-lg font-serif text-white text-shadow-subtle">
              {event.title}
            </h1>

            <p className="text-fluid-hero-sub mt-6 max-w-3xl text-slate-200 leading-relaxed">
              {event.description}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-2 text-sm text-slate-300">
                <Calendar className="h-4 w-4 text-gold" />
                {eventDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-2 text-sm text-slate-300">
                <MapPin className="h-4 w-4 text-gold" />
                {event.venue || 'Venue TBA'}
              </div>
            </div>

            <p className="mt-8 max-w-2xl border-l border-gold/60 pl-5 font-serif text-quote-md text-pearl/80 leading-relaxed">
              {theme.quote}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── Content Grid ─── */}
      <section className="px-6 pb-section">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            {/* ─── Left Column ─── */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-10"
            >
              {/* Countdown */}
              <div>
                <h2 className="font-serif text-2xl font-semibold text-white">Event Starts In</h2>
                <div className="mt-5 grid grid-cols-4 gap-3">
                  {[
                    { label: 'Days', value: timeLeft.days },
                    { label: 'Hours', value: timeLeft.hours },
                    { label: 'Min', value: timeLeft.minutes },
                    { label: 'Sec', value: timeLeft.seconds }
                  ].map((item) => (
                    <div key={item.label} className="glass-gold rounded-xl p-4 text-center">
                      <div className="text-3xl font-semibold text-gold lg:text-4xl">
                        {String(item.value).padStart(2, '0')}
                      </div>
                      <div className="mt-1 text-[10px] uppercase tracking-[0.22em] text-slate-500">
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Date / Time / Venue */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="glass rounded-xl p-5">
                  <Calendar className="mb-3 h-5 w-5 text-gold" />
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Date</p>
                  <p className="mt-2 text-sm text-white">
                    {eventDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="glass rounded-xl p-5">
                  <Clock className="mb-3 h-5 w-5 text-gold" />
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Time</p>
                  <p className="mt-2 text-sm text-white">
                    {eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    {endDate &&
                      ` — ${endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`}
                  </p>
                </div>
                <div className="glass rounded-xl p-5">
                  <MapPin className="mb-3 h-5 w-5 text-gold" />
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Venue</p>
                  <p className="mt-2 text-sm text-white">{event.venue || 'TBA'}</p>
                </div>
              </div>

              {/* Featured Book */}
              <div className="glass rounded-xl overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center gap-2 text-gold mb-4">
                    <BookOpen className="h-5 w-5" />
                    <span className="text-xs font-semibold uppercase tracking-[0.2em]">Featured Book</span>
                  </div>
                  <div className="flex flex-col gap-6 sm:flex-row">
                    {event.book.coverUrl ? (
                      <div className="relative shrink-0 overflow-hidden rounded-lg">
                        <img
                          src={event.book.coverUrl}
                          alt={`${event.book.title} cover`}
                          className="h-56 w-38 object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-56 w-38 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-slate-900 text-sm text-slate-500">
                        Book cover
                      </div>
                    )}
                    <div>
                      <h3 className="font-serif text-2xl font-semibold text-white">
                        {event.book.title}
                      </h3>
                      <p className="mt-1 text-gold-400">by {event.book.author}</p>
                      {event.book.description && (
                        <p className="mt-4 max-w-xl leading-relaxed text-slate-400">
                          {event.book.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Hosted by */}
              <div className="glass rounded-xl p-6">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Hosted by</p>
                <p className="mt-2 font-serif text-xl text-white">{event.authorName}</p>
              </div>
            </motion.div>

            {/* ─── Right Column ─── */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-6"
            >
              {/* ── Request Invitation ── */}
              <div className="glass rounded-xl overflow-hidden">
                <div className="p-6">
                  <h3 className="font-serif text-xl font-semibold text-white">
                    Request an Invitation
                  </h3>
                  <p className="mt-2 text-sm text-slate-400">
                    Reserve your place at this exclusive literary event.
                  </p>

                  <AnimatePresence mode="wait">
                    {formSuccess ? (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-6 space-y-4"
                      >
                        <div className="flex items-center gap-3 rounded-lg bg-green-500/10 border border-green-500/20 p-4">
                          <Check className="h-5 w-5 text-green-400 shrink-0" />
                          <p className="text-sm text-green-200">
                            Your invitation is ready! Check your personalized page.
                          </p>
                        </div>
                        <Link
                          href={`/invite/${formSuccess.token}`}
                          className="group flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ink transition hover:bg-gold-500"
                        >
                          View My Invitation
                          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                        </Link>
                      </motion.div>
                    ) : !showRequestForm ? (
                      <motion.div key="cta" className="mt-6">
                        <Button
                          onClick={() => setShowRequestForm(true)}
                          size="lg"
                          className="w-full gap-2"
                        >
                          <Mail className="h-4 w-4" />
                          Request Invitation
                        </Button>
                      </motion.div>
                    ) : (
                      <motion.form
                        key="form"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onSubmit={handleRequestInvite}
                        className="mt-6 space-y-4"
                      >
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1.5">
                            Full Name
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                            <input
                              type="text"
                              required
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 focus:border-gold/40 focus:outline-none focus:ring-1 focus:ring-gold/30"
                              placeholder="Your full name"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1.5">
                            Email
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                            <input
                              type="email"
                              required
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 focus:border-gold/40 focus:outline-none focus:ring-1 focus:ring-gold/30"
                              placeholder="your@email.com"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1.5">
                            Phone <span className="text-slate-600">(optional)</span>
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                            <input
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 focus:border-gold/40 focus:outline-none focus:ring-1 focus:ring-gold/30"
                              placeholder="+1 (555) 000-0000"
                            />
                          </div>
                        </div>

                        {formError && (
                          <p className="text-sm text-red-400">{formError}</p>
                        )}

                        <div className="flex gap-3">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => setShowRequestForm(false)}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            size="sm"
                            disabled={formLoading}
                            className="flex-1 gap-2"
                          >
                            {formLoading ? (
                              'Sending...'
                            ) : (
                              <>
                                <Send className="h-3.5 w-3.5" />
                                Send Request
                              </>
                            )}
                          </Button>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* ── Organizer Only: Analytics ── */}
              {isOrganizer && analytics && (
                <div className="glass rounded-xl p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-lg font-semibold text-white">Launch Signals</h3>
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
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                          {item.label}
                        </p>
                        <p className="mt-3 text-3xl font-semibold text-white">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Organizer Only: Tools ── */}
              {isOrganizer && slug && (
                <div className="glass rounded-xl p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-lg font-semibold text-white">Organizer Tools</h3>
                      <p className="text-sm text-slate-400">Manage invitations and arrival flow.</p>
                    </div>
                    <CheckCircle className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="space-y-3">
                    <Link href={`/events/${slug}/dashboard`}>
                      <Button variant="secondary" size="lg" className="w-full gap-2">
                        <BarChart3 size={18} />
                        View Dashboard
                      </Button>
                    </Link>
                    <Link href={`/events/${slug}/checkin`}>
                      <Button variant="secondary" size="lg" className="w-full gap-2">
                        <QrCode size={18} />
                        Guest Check-In
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
