'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import InvitationGenerator from '@/components/InvitationGenerator';
import ImageUpload from '@/components/ImageUpload';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

type FormData = {
  title: string;
  description: string;
  venue: string;
  startAt: string;
  endAt: string;
  heroImageUrl: string;
  theme: 'luxury' | 'poetry' | 'minimal';
  organizerName: string;
  organizerEmail: string;
  bookTitle: string;
  bookAuthor: string;
  bookCoverUrl: string;
  bookDescription: string;
};

type FieldErrors = Partial<Record<keyof FormData, string[]>>;

const initialFormData: FormData = {
  title: '',
  description: '',
  venue: '',
  startAt: '',
  endAt: '',
  heroImageUrl: '',
  theme: 'luxury',
  organizerName: '',
  organizerEmail: '',
  bookTitle: '',
  bookAuthor: '',
  bookCoverUrl: '',
  bookDescription: ''
};

export default function CreateEventPage() {
  const [eventCreated, setEventCreated] = useState(false);
  const [eventId, setEventId] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [eventSlug, setEventSlug] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [authReady, setAuthReady] = useState(false);
  const [sessionEmail, setSessionEmail] = useState('');

  useEffect(() => {
    const hydrateAuth = async () => {
      const supabase = createSupabaseBrowserClient();
      if (!supabase) { setAuthReady(true); return; }
      const { data } = await supabase.auth.getUser();
      if (data.user?.email) {
        setSessionEmail(data.user.email);
        setFormData((current) => ({
          ...current,
          organizerEmail: data.user!.email!,
          organizerName: current.organizerName || data.user!.email!.split('@')[0]
        }));
      }
      setAuthReady(true);
    };

    hydrateAuth();
  }, []);

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
  };

  const fieldError = (key: keyof FormData) => fieldErrors[key]?.[0];

  const inputClass = (key: keyof FormData) =>
    `w-full px-4 py-3 bg-white/5 border rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent text-white placeholder:text-slate-500 ${
      fieldError(key) ? 'border-red-400/60' : 'border-white/20'
    }`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setFieldErrors({});

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!response.ok) {
        setFieldErrors(result.fieldErrors ?? {});
        throw new Error(result.error || 'Failed to create event');
      }

      setEventId(result.id);
      setEventTitle(result.title);
      setEventSlug(result.slug);
      setEventCreated(true);
    } catch (err) {
      console.error('Event creation error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (eventCreated) {
    return (
      <div className="min-h-screen bg-[#09070b] text-pearl py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-gold">
              Event created
            </p>
            <h1 className="text-4xl font-semibold mb-4">Your launch event is ready</h1>
            <p className="text-slate-300">Now generate personalized invitations for your guests.</p>
          </motion.div>

          <InvitationGenerator eventId={eventId} eventTitle={eventTitle} />

          <div className="mt-8 text-center text-slate-300">
            <p>Your live event page is ready:</p>
            <div className="mt-3 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href={`/events/${eventSlug}`}
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/10"
              >
                View event details
              </a>
              <a
                href="/my-events"
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/10"
              >
                Open my events workspace
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09070b] text-pearl py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-gold">
            Book launch studio
          </p>
          <h1 className="text-4xl font-semibold mb-4 sm:text-5xl">Create Your Launch Event</h1>
          <p className="mx-auto max-w-2xl text-slate-300">
            Shape the public event page, the host identity, and the featured book before sending invitations.
          </p>
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mx-auto mt-5 max-w-xl p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200"
            >
              {error}
            </motion.div>
          )}
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="space-y-8 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm sm:p-8"
        >
          {!authReady && <p className="text-slate-300">Checking your session...</p>}
          {authReady && !sessionEmail && (
            <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-200">
              Sign in at /auth to create and own events in Supabase-backed mode.
            </p>
          )}
          <section className="space-y-5">
            <div>
              <h2 className="text-xl font-semibold text-white">Event Story</h2>
              <p className="mt-1 text-sm text-slate-400">This becomes the public-facing launch experience.</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white">Event Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                className={inputClass('title')}
                placeholder="The Midnight Library Launch"
              />
              {fieldError('title') && <p className="mt-2 text-sm text-red-300">{fieldError('title')}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                rows={5}
                className={inputClass('description')}
                placeholder="Describe the reading, launch moment, author conversation, signing, and atmosphere."
              />
              {fieldError('description') && (
                <p className="mt-2 text-sm text-red-300">{fieldError('description')}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Venue</label>
                <input
                  type="text"
                  value={formData.venue}
                  onChange={(e) => updateField('venue', e.target.value)}
                  className={inputClass('venue')}
                  placeholder="The Literary Salon, Dar es Salaam"
                />
                {fieldError('venue') && <p className="mt-2 text-sm text-red-300">{fieldError('venue')}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Theme</label>
                <select
                  value={formData.theme}
                  onChange={(e) => updateField('theme', e.target.value as FormData['theme'])}
                  className={inputClass('theme')}
                >
                  <option value="luxury">Luxury Literary</option>
                  <option value="poetry">Poetry Salon</option>
                  <option value="minimal">Minimal Modern</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Start Date & Time</label>
                <input
                  type="datetime-local"
                  value={formData.startAt}
                  onChange={(e) => updateField('startAt', e.target.value)}
                  className={inputClass('startAt')}
                />
                {fieldError('startAt') && <p className="mt-2 text-sm text-red-300">{fieldError('startAt')}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white">End Date & Time</label>
                <input
                  type="datetime-local"
                  value={formData.endAt}
                  onChange={(e) => updateField('endAt', e.target.value)}
                  className={inputClass('endAt')}
                />
                {fieldError('endAt') && <p className="mt-2 text-sm text-red-300">{fieldError('endAt')}</p>}
              </div>
            </div>

            <ImageUpload
              currentUrl={formData.heroImageUrl}
              folder="hero"
              label="Hero Image"
              onChange={(url) => updateField('heroImageUrl', url)}
            />
          </section>

          <section className="space-y-5 border-t border-white/10 pt-8">
            <div>
              <h2 className="text-xl font-semibold text-white">Organizer</h2>
              <p className="mt-1 text-sm text-slate-400">Reusable host details for future multi-event support.</p>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Organizer Name</label>
                <input
                  type="text"
                  value={formData.organizerName}
                  onChange={(e) => updateField('organizerName', e.target.value)}
                  className={inputClass('organizerName')}
                  placeholder="Amina K."
                />
                {fieldError('organizerName') && (
                  <p className="mt-2 text-sm text-red-300">{fieldError('organizerName')}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Organizer Email</label>
                <input
                  type="email"
                  value={formData.organizerEmail}
                  onChange={(e) => updateField('organizerEmail', e.target.value)}
                  className={inputClass('organizerEmail')}
                  placeholder="host@example.com"
                  readOnly
                />
                {fieldError('organizerEmail') && (
                  <p className="mt-2 text-sm text-red-300">{fieldError('organizerEmail')}</p>
                )}
              </div>
            </div>
          </section>

          <section className="space-y-5 border-t border-white/10 pt-8">
            <div>
              <h2 className="text-xl font-semibold text-white">Featured Book</h2>
              <p className="mt-1 text-sm text-slate-400">The book details power the event and invitation pages.</p>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Book Title</label>
                <input
                  type="text"
                  value={formData.bookTitle}
                  onChange={(e) => updateField('bookTitle', e.target.value)}
                  className={inputClass('bookTitle')}
                />
                {fieldError('bookTitle') && <p className="mt-2 text-sm text-red-300">{fieldError('bookTitle')}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Author</label>
                <input
                  type="text"
                  value={formData.bookAuthor}
                  onChange={(e) => updateField('bookAuthor', e.target.value)}
                  className={inputClass('bookAuthor')}
                />
                {fieldError('bookAuthor') && (
                  <p className="mt-2 text-sm text-red-300">{fieldError('bookAuthor')}</p>
                )}
              </div>
            </div>
            <ImageUpload
              currentUrl={formData.bookCoverUrl}
              folder="covers"
              label="Book Cover"
              onChange={(url) => updateField('bookCoverUrl', url)}
            />
            <div>
              <label className="block text-sm font-medium mb-2 text-white">Book Description</label>
              <textarea
                value={formData.bookDescription}
                onChange={(e) => updateField('bookDescription', e.target.value)}
                rows={4}
                className={inputClass('bookDescription')}
              />
              {fieldError('bookDescription') && (
                <p className="mt-2 text-sm text-red-300">{fieldError('bookDescription')}</p>
              )}
            </div>
          </section>

          <div className="flex justify-end border-t border-white/10 pt-8">
            <Button type="submit" size="lg" disabled={isLoading || !sessionEmail}>
              {isLoading ? 'Creating Event...' : 'Create Event'}
            </Button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
