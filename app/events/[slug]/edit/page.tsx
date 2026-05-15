'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Save, Eye, EyeOff, ArrowLeft, Image, Sparkles, Loader2 } from 'lucide-react';

interface EventData {
  id: string;
  title: string;
  description: string;
  slug: string;
  venue: string | null;
  startAt: string;
  endAt: string | null;
  heroImageUrl: string | null;
  theme: string;
  published: boolean;
  books: Array<{
    id: string;
    title: string;
    author: string;
    subtitle: string | null;
    coverUrl: string | null;
    description: string | null;
  }>;
}

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    venue: '',
    startAt: '',
    endAt: '',
    heroImageUrl: '',
    theme: '',
  });

  const [book, setBook] = useState({
    title: '',
    author: '',
    subtitle: '',
    coverUrl: '',
    description: '',
  });

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`/api/events/${slug}`);
        const data = await res.json();
        if (res.ok && data.event) {
          setEvent(data.event);
          const e = data.event;
          setForm({
            title: e.title || '',
            description: e.description || '',
            venue: e.venue || '',
            startAt: e.startAt ? new Date(e.startAt).toISOString().slice(0, 16) : '',
            endAt: e.endAt ? new Date(e.endAt).toISOString().slice(0, 16) : '',
            heroImageUrl: e.heroImageUrl || '',
            theme: e.theme || 'luxury',
          });
          if (e.books && e.books[0]) {
            setBook({
              title: e.books[0].title || '',
              author: e.books[0].author || '',
              subtitle: e.books[0].subtitle || '',
              coverUrl: e.books[0].coverUrl || '',
              description: e.books[0].description || '',
            });
          }
        } else {
          setError('Event not found');
        }
      } catch {
        setError('Failed to load event');
      }
      setLoading(false);
    };
    fetchEvent();
  }, [slug]);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch(`/api/events/${slug}/edit`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          venue: form.venue,
          startAt: form.startAt ? new Date(form.startAt).toISOString() : undefined,
          endAt: form.endAt ? new Date(form.endAt).toISOString() : null,
          heroImageUrl: form.heroImageUrl || null,
          theme: form.theme,
          book: {
            title: book.title,
            author: book.author,
            subtitle: book.subtitle || undefined,
            coverUrl: book.coverUrl || undefined,
            description: book.description || undefined,
          },
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Event updated successfully');
      } else {
        setMessage(data.error || 'Save failed');
      }
    } catch {
      setMessage('Network error');
    }
    setSaving(false);
  };

  const handleTogglePublish = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/events', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event!.id,
          action: event!.published ? 'unpublish' : 'publish',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setEvent((prev) => prev ? { ...prev, published: !prev.published } : prev);
        setMessage(event!.published ? 'Event unpublished' : 'Event published');
      } else {
        setMessage(data.error || 'Action failed');
      }
    } catch {
      setMessage('Network error');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09070b]">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#09070b] text-pearl">
        <p className="text-slate-400">{error || 'Event not found'}</p>
        <Link href="/"><Button variant="secondary">Go Home</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09070b]">
      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/events/${slug}/dashboard`} className="text-slate-400 transition hover:text-pearl">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="font-serif text-3xl font-semibold text-white">Edit Event</h1>
              <p className="mt-1 text-sm text-slate-400">/{slug}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm" onClick={handleTogglePublish} disabled={saving} className="gap-2">
              {event.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {event.published ? 'Unpublish' : 'Publish'}
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {message && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-xl border border-gold/20 bg-gold/5 px-5 py-3 text-sm text-gold">
            {message}
          </motion.div>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Event Details */}
            <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="mb-4 text-sm font-medium text-white">Event Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs text-slate-400">Title</label>
                  <input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-gold/40 focus:outline-none transition" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-slate-400">Description</label>
                  <textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} rows={5}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-gold/40 focus:outline-none transition resize-y" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs text-slate-400">Venue</label>
                    <input value={form.venue} onChange={(e) => setForm(f => ({ ...f, venue: e.target.value }))}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-gold/40 focus:outline-none transition" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs text-slate-400">Theme</label>
                    <select value={form.theme} onChange={(e) => setForm(f => ({ ...f, theme: e.target.value }))}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-gold/40 focus:outline-none transition">
                      <option value="luxury">Luxury</option>
                      <option value="cinematic">Cinematic</option>
                      <option value="intimate">Intimate</option>
                      <option value="launch">Launch</option>
                      <option value="salon">Salon</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs text-slate-400">Start Date & Time</label>
                    <input type="datetime-local" value={form.startAt} onChange={(e) => setForm(f => ({ ...f, startAt: e.target.value }))}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-gold/40 focus:outline-none transition [color-scheme:dark]" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs text-slate-400">End Date & Time (optional)</label>
                    <input type="datetime-local" value={form.endAt} onChange={(e) => setForm(f => ({ ...f, endAt: e.target.value }))}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-gold/40 focus:outline-none transition [color-scheme:dark]" />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-slate-400">Hero Image URL</label>
                  <div className="relative">
                    <Image className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input value={form.heroImageUrl} onChange={(e) => setForm(f => ({ ...f, heroImageUrl: e.target.value }))} placeholder="https://..."
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-white placeholder:text-slate-500 focus:border-gold/40 focus:outline-none transition" />
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Book Details */}
            <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="mb-4 text-sm font-medium text-white">Book Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs text-slate-400">Title</label>
                  <input value={book.title} onChange={(e) => setBook(b => ({ ...b, title: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-gold/40 focus:outline-none transition" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-slate-400">Author</label>
                  <input value={book.author} onChange={(e) => setBook(b => ({ ...b, author: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-gold/40 focus:outline-none transition" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-slate-400">Subtitle</label>
                  <input value={book.subtitle} onChange={(e) => setBook(b => ({ ...b, subtitle: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-gold/40 focus:outline-none transition" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-slate-400">Cover URL</label>
                  <div className="relative">
                    <Image className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input value={book.coverUrl} onChange={(e) => setBook(b => ({ ...b, coverUrl: e.target.value }))} placeholder="https://..."
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-white placeholder:text-slate-500 focus:border-gold/40 focus:outline-none transition" />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-slate-400">Description</label>
                  <textarea value={book.description} onChange={(e) => setBook(b => ({ ...b, description: e.target.value }))} rows={3}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-gold/40 focus:outline-none transition resize-y" />
                </div>
              </div>
            </section>

            {/* Quick Actions */}
            <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="mb-4 text-sm font-medium text-white">Quick Actions</h2>
              <div className="space-y-2">
                <Link href={`/events/${slug}`} className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-400 transition hover:bg-white/5 hover:text-pearl">
                  <Eye className="h-3.5 w-3.5" />
                  View event page
                </Link>
                <Link href={`/events/${slug}/dashboard`} className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-400 transition hover:bg-white/5 hover:text-pearl">
                  <Sparkles className="h-3.5 w-3.5" />
                  Dashboard
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
