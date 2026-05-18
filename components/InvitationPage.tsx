'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import QRCodeComponent from '@/components/QRCode';
import ShareEvent from '@/components/ShareEvent';
import { Calendar, MapPin, Clock, BookOpen, CheckCircle, XCircle, Clock as ClockIcon, Sparkles, Share2, type LucideIcon } from 'lucide-react';

interface InvitationPageProps {
  token: string;
  shortCode?: string;
  guestName: string;
  isApproved: boolean;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'LATER';
  initialPreorderQuantity: number;
  event: {
    title: string;
    description: string;
    venue: string;
    startAt: string;
    book: {
      title: string;
      author: string;
      description?: string;
      coverUrl?: string;
    };
  };
}

export default function InvitationPage({ token, shortCode, guestName, isApproved, status, initialPreorderQuantity, event }: InvitationPageProps) {
  const [rsvpStatus, setRsvpStatus] = useState<'PENDING' | 'ACCEPTED' | 'DECLINED' | 'LATER'>(status);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [preorderQuantity, setPreorderQuantity] = useState(Math.max(1, initialPreorderQuantity || 1));
  const [savedPreorderQuantity, setSavedPreorderQuantity] = useState(initialPreorderQuantity);
  const [isSavingPreorder, setIsSavingPreorder] = useState(false);
  const [preorderMessage, setPreorderMessage] = useState('');
  const [preorderError, setPreorderError] = useState('');

  useEffect(() => {
    const eventDate = new Date(event.startAt);
    const timer = setInterval(() => {
      const now = Date.now();
      const distance = eventDate.getTime() - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [event.startAt]);

  const handleRSVP = async (selectedStatus: 'ACCEPTED' | 'DECLINED' | 'LATER') => {
    if (rsvpStatus !== 'PENDING') return;

    setIsSubmitting(true);
    setSubmitError('');

    const response = await fetch(`/api/invitations/${token}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: selectedStatus })
    });

    const result = await response.json();
    setIsSubmitting(false);

    if (!response.ok) {
      setSubmitError(result.error || 'Unable to submit RSVP right now.');
      return;
    }

    setRsvpStatus(selectedStatus);
  };

  const RSVPButton = ({ status, icon: Icon, label, color }: {
    status: 'ACCEPTED' | 'DECLINED' | 'LATER';
    icon: LucideIcon;
    label: string;
    color: string;
  }) => (
    <Button
      onClick={() => handleRSVP(status)}
      variant={rsvpStatus === status ? 'primary' : 'secondary'}
      className={`flex-1 ${rsvpStatus === status ? color : ''}`}
      disabled={rsvpStatus !== 'PENDING' || isSubmitting}
    >
      <Icon className="w-4 h-4 mr-2" />
      {label}
    </Button>
  );

  const eventDate = new Date(event.startAt);
  const preorderLocked = rsvpStatus === 'DECLINED';

  const handlePreorder = async () => {
    setIsSavingPreorder(true);
    setPreorderMessage('');
    setPreorderError('');

    try {
      const response = await fetch(`/api/invitations/${token}/preorder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity: preorderQuantity })
      });
      const result = await response.json();

      if (!response.ok) {
        setPreorderError(result.error || 'Unable to save preorder.');
        return;
      }

      setSavedPreorderQuantity(result.quantity);
      setPreorderMessage(result.message || 'Preorder saved.');
    } finally {
      setIsSavingPreorder(false);
    }
  };

  if (!isApproved) {
    return (
      <div className="min-h-screen bg-[#09070b] text-pearl flex items-center justify-center">
        <div className="text-center max-w-lg px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber/20 bg-amber/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-amber">
              <Clock className="h-3.5 w-3.5" />
              Awaiting Approval
            </div>
            <h1 className="font-serif text-display-md text-white text-shadow-subtle mb-4">
              Dear {guestName}
            </h1>
            <p className="text-slate-300 mb-6">
              Your invitation request for <span className="text-white font-semibold">{event.title}</span> has been submitted.
            </p>
            <div className="divider-gold-thick mx-auto mb-6 max-w-xs" />
            <div className="glass rounded-2xl p-6">
              <Clock className="h-8 w-8 text-gold mx-auto mb-3" />
              <p className="text-slate-400 text-sm">
                Your request is pending review by the event organizer. You will receive a notification once it&apos;s approved. Feel free to check back later using this link.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09070b] text-pearl">
      {/* ─── Cinematic Hero ─── */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(197,165,123,0.12),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_20%,rgba(123,119,255,0.04),transparent)]" />
        <div className="absolute left-1/4 top-1/3 h-64 w-64 rounded-full bg-gold/5 blur-[120px] animate-float" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#09070b]/20 to-[#09070b]" />

        <div className="relative mx-auto max-w-4xl px-6 py-24 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6 flex items-center justify-center gap-3"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-gold">
                <Sparkles className="h-3.5 w-3.5" />
                You&apos;re Invited
              </span>
              <ShareEvent
                url={`${typeof window !== 'undefined' ? window.location.origin : ''}/invite/${token}`}
                title={`Invitation: ${event.title}`}
                description={`You're invited to ${event.title}`}
                variant="icon"
              />
            </motion.div>

            <h1 className="font-serif text-display-md text-white text-shadow-subtle mb-4">
              Dear {guestName}
            </h1>
            <p className="text-fluid-hero-sub text-slate-300 mb-8">
              You are personally invited to
            </p>

            <div className="divider-gold-thick mx-auto mb-8 max-w-xs" />

            <h2 className="font-serif text-display-lg text-white text-balance text-shadow-glow">
              {event.title}
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-fluid-hero-sub text-slate-200 leading-relaxed">
              {event.description}
            </p>
          </motion.div>
        </div>
      </section>

      <div className="px-6 py-12">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-12"
          >
            <h3 className="text-2xl font-semibold mb-8">Reserve Your Presence</h3>

            {rsvpStatus === 'PENDING' ? (
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <RSVPButton
                  status="ACCEPTED"
                  icon={CheckCircle}
                  label="I'll Attend"
                  color="bg-green-600 hover:bg-green-700"
                />
                <RSVPButton
                  status="DECLINED"
                  icon={XCircle}
                  label="Can't Make It"
                  color="bg-red-600 hover:bg-red-700"
                />
                <RSVPButton
                  status="LATER"
                  icon={ClockIcon}
                  label="Decide Later"
                  color="bg-blue-600 hover:bg-blue-700"
                />
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-block p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10"
              >
                <div className="flex items-center gap-3">
                  {rsvpStatus === 'ACCEPTED' && <CheckCircle className="w-6 h-6 text-green-400" />}
                  {rsvpStatus === 'DECLINED' && <XCircle className="w-6 h-6 text-red-400" />}
                  {rsvpStatus === 'LATER' && <ClockIcon className="w-6 h-6 text-blue-400" />}
                  <span className="text-lg font-medium">
                    {rsvpStatus === 'ACCEPTED' && 'See you there!'}
                    {rsvpStatus === 'DECLINED' && 'Thank you for letting us know'}
                    {rsvpStatus === 'LATER' && 'We\'ll follow up soon'}
                  </span>
                </div>
              </motion.div>
            )}
            {submitError && <p className="mt-4 text-sm text-red-300">{submitError}</p>}
          </motion.div>

          {/* QR Code — unique to this invitee */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12 flex flex-col items-center"
          >
            <div className="glass rounded-2xl p-6 max-w-xs w-full">
              <div className="flex items-center gap-2 mb-4 text-gold">
                <Share2 className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em]">Your Personal QR</span>
              </div>
              <QRCodeComponent shortCode={shortCode || token} size={200} />
              <p className="mt-4 text-xs text-center text-slate-500 leading-relaxed">
                Present this QR at the event entrance for quick check-in.
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-6"
            >
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardContent className="p-6">
                  <h4 className="text-lg font-semibold mb-4 text-white">Event Details</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gold" />
                      <span className="text-slate-300">
                        {eventDate.toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-gold" />
                      <span className="text-slate-300">
                        {eventDate.toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-gold mt-0.5" />
                      <span className="text-slate-300">{event.venue}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardContent className="p-6">
                  <h4 className="text-lg font-semibold mb-4 text-white">Countdown</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: 'Days', value: timeLeft.days },
                      { label: 'Hours', value: timeLeft.hours },
                      { label: 'Min', value: timeLeft.minutes },
                      { label: 'Sec', value: timeLeft.seconds }
                    ].map((item) => (
                      <div key={item.label} className="text-center">
                        <div className="text-2xl font-bold text-gold">{item.value}</div>
                        <div className="text-xs text-slate-400">{item.label}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardContent className="p-6">
                  <h4 className="text-lg font-semibold mb-4 text-white">Book Preorder</h4>
                  <p className="text-sm text-slate-400">
                    Reserve your copy before launch day. You can update this quantity later using the same invite link.
                  </p>

                  <div className="mt-5 flex items-center gap-3">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={preorderLocked || preorderQuantity <= 1 || isSavingPreorder}
                      onClick={() => setPreorderQuantity((qty) => Math.max(1, qty - 1))}
                    >
                      -
                    </Button>
                    <div className="w-20 rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-center text-white">
                      {preorderQuantity}
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={preorderLocked || preorderQuantity >= 50 || isSavingPreorder}
                      onClick={() => setPreorderQuantity((qty) => Math.min(50, qty + 1))}
                    >
                      +
                    </Button>
                    <Button
                      type="button"
                      disabled={preorderLocked || isSavingPreorder}
                      onClick={handlePreorder}
                    >
                      {isSavingPreorder ? 'Saving...' : savedPreorderQuantity ? 'Update Preorder' : 'Place Preorder'}
                    </Button>
                  </div>

                  {savedPreorderQuantity > 0 && (
                    <p className="mt-3 text-sm text-slate-400">Saved quantity: {savedPreorderQuantity}</p>
                  )}
                  {preorderMessage && <p className="mt-3 text-sm text-emerald-300">{preorderMessage}</p>}
                  {preorderError && <p className="mt-3 text-sm text-red-300">{preorderError}</p>}
                  {preorderLocked && (
                    <p className="mt-3 text-sm text-amber-300">
                      Preorder is unavailable when an invitation is declined.
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-start gap-6">
                    {event.book.coverUrl ? (
                      <img
                        src={event.book.coverUrl}
                        alt={`${event.book.title} cover`}
                        className="h-32 w-24 rounded-xl object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-24 h-32 bg-slate-800 rounded-3xl flex-shrink-0" />
                    )}
                    <div>
                      <div className="flex items-center gap-2 mb-3 text-slate-400">
                        <BookOpen className="w-4 h-4 text-gold" />
                        Featured Book
                      </div>
                      <h3 className="text-2xl font-semibold text-white">{event.book.title}</h3>
                      <p className="text-slate-300 mt-2">by {event.book.author}</p>
                      <p className="text-slate-400 mt-4">{event.book.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
