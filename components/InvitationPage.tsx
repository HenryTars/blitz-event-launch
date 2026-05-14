'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, MapPin, Clock, BookOpen, CheckCircle, XCircle, Clock as ClockIcon, type LucideIcon } from 'lucide-react';

interface InvitationPageProps {
  token: string;
  guestName: string;
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

export default function InvitationPage({ token, guestName, status, initialPreorderQuantity, event }: InvitationPageProps) {
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

  return (
    <div className="min-h-screen bg-[#09070b] text-pearl">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gold/10 via-transparent to-slate-600/10" />
        <div className="relative px-6 py-24 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <div className="inline-block p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl font-semibold text-white mb-2"
                >
                  Dear {guestName}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-slate-300"
                >
                  You are personally invited to
                </motion.p>
              </div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-5xl font-semibold tracking-tight text-white sm:text-6xl"
            >
              {event.title}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300"
            >
              {event.description}
            </motion.p>
          </div>
        </div>
      </div>

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
