'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import QRCodeComponent from '@/components/QRCode';
import { Download, QrCode, Users, CheckCircle2, XCircle, Clock, Mail as MailIcon, BookOpen } from 'lucide-react';

interface Guest {
  id: string;
  guestName: string;
  guestEmail?: string;
  token: string;
  status: 'ACCEPTED' | 'DECLINED' | 'LATER' | 'PENDING';
  createdAt: string;
}

interface EventData {
  id: string;
  title: string;
  slug: string;
  venue?: string;
  startAt: string;
  analytics?: {
    totalInvites: number;
    acceptedCount: number;
    declinedCount: number;
    preorderCount: number;
    attendanceCount: number;
  };
}

export default function EventDashboard() {
  const params = useParams();
  const slug = params.slug as string;
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [busyGuestId, setBusyGuestId] = useState('');

  const fetchEventData = async () => {
    try {
      const response = await fetch(`/api/events/${slug}`);
      if (!response.ok) throw new Error('Failed to fetch event');
      const data = await response.json();
      setEventData(data);

      const guestsResponse = await fetch(`/api/events/${slug}/guests`);
      if (guestsResponse.ok) {
        const guestsData = await guestsResponse.json();
        setGuests(guestsData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load event data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) fetchEventData();
  }, [slug]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'DECLINED':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'LATER':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return <CheckCircle2 size={16} />;
      case 'DECLINED':
        return <XCircle size={16} />;
      case 'LATER':
        return <Clock size={16} />;
      default:
        return <Users size={16} />;
    }
  };

  const exportGuestList = () => {
    if (!guests.length) return;

    const headers = ['Name', 'Email', 'Status', 'Invited'];
    const rows = guests.map((guest) => [
      guest.guestName,
      guest.guestEmail ?? '',
      guest.status,
      new Date(guest.createdAt).toLocaleDateString()
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${eventData?.slug ?? 'event'}-guest-list.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyInviteLink = async (token: string) => {
    await navigator.clipboard.writeText(`${window.location.origin}/invite/${token}`);
  };

  const regenerateInvite = async (guest: Guest) => {
    try {
      setBusyGuestId(guest.id);
      const response = await fetch(`/api/events/${slug}/guests/${guest.id}/regenerate`, {
        method: 'POST'
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to regenerate invitation');
      setGuests((current) => current.map((g) => (g.id === guest.id ? { ...g, token: result.token, status: 'PENDING' } : g)));
      await fetchEventData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to regenerate invitation');
    } finally {
      setBusyGuestId('');
    }
  };

  const removeGuest = async (guest: Guest) => {
    try {
      setBusyGuestId(guest.id);
      const response = await fetch(`/api/events/${slug}/guests/${guest.id}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to remove guest');
      setGuests((current) => current.filter((g) => g.id !== guest.id));
      await fetchEventData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove guest');
    } finally {
      setBusyGuestId('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09070b] text-pearl flex items-center justify-center">
        <motion.div animate={{ opacity: [0.5, 1] }} transition={{ duration: 1, repeat: Infinity }} className="text-2xl">
          Loading event dashboard...
        </motion.div>
      </div>
    );
  }

  if (error || !eventData) {
    return (
      <div className="min-h-screen bg-[#09070b] text-pearl flex items-center justify-center">
        <div className="text-red-400">{error || 'Event not found'}</div>
      </div>
    );
  }

  const stats = eventData.analytics ?? {
    totalInvites: guests.length,
    acceptedCount: guests.filter((guest) => guest.status === 'ACCEPTED').length,
    declinedCount: guests.filter((guest) => guest.status === 'DECLINED').length,
    preorderCount: 0,
    attendanceCount: 0
  };
  const laterCount = guests.filter((guest) => guest.status === 'LATER').length;
  const totalRsvps = stats.acceptedCount + stats.declinedCount + laterCount;

  return (
    <div className="min-h-screen bg-[#09070b] text-pearl py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-4xl font-semibold mb-2">{eventData.title}</h1>
          <p className="text-slate-400">{new Date(eventData.startAt).toLocaleDateString()} / {eventData.venue}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          {[
            { label: 'Invitations', value: stats.totalInvites, icon: MailIcon },
            { label: 'RSVPs', value: totalRsvps, icon: Clock },
            { label: 'Accepted', value: stats.acceptedCount, icon: CheckCircle2 },
            { label: 'Preorders', value: stats.preorderCount, icon: BookOpen },
            { label: 'Checked In', value: stats.attendanceCount, icon: QrCode }
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition"
            >
              <stat.icon className="h-7 w-7 text-gold mb-3" />
              <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
              <p className="text-3xl font-semibold">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex gap-4 mb-12">
          <Button onClick={() => setShowQR(!showQR)} variant="secondary" className="gap-2">
            <QrCode size={18} />
            {showQR ? 'Hide QR Code' : 'Show QR Code'}
          </Button>
          <Button variant="secondary" className="gap-2" onClick={exportGuestList} disabled={!guests.length}>
            <Download size={18} />
            Export Guest List
          </Button>
        </motion.div>

        {showQR && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-12">
            <h2 className="text-2xl font-semibold mb-6">Check-In QR Code</h2>
            <p className="text-slate-400 mb-8 max-w-2xl">
              Display this QR code at your event entrance. Guests can scan it with their phone camera to check in.
            </p>
            <QRCodeComponent eventSlug={slug} size={300} />
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <Users size={24} />
            Guest List ({guests.length})
          </h2>

          {guests.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No guests yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Name</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Email</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Invited</th>
                    <th className="text-right py-3 px-4 text-slate-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {guests.map((guest) => (
                    <tr key={guest.id} className="border-b border-white/5 hover:bg-white/5 transition">
                      <td className="py-3 px-4 font-medium">{guest.guestName}</td>
                      <td className="py-3 px-4 text-slate-400">{guest.guestEmail || '-'}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(guest.status)}`}>
                          {getStatusIcon(guest.status)}
                          {guest.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-sm">{new Date(guest.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="secondary" size="sm" onClick={() => copyInviteLink(guest.token)} disabled={busyGuestId === guest.id}>
                            Copy Link
                          </Button>
                          <Button variant="secondary" size="sm" onClick={() => regenerateInvite(guest)} disabled={busyGuestId === guest.id}>
                            Regenerate
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => removeGuest(guest)}
                            disabled={busyGuestId === guest.id}
                            className="border-red-500/40 text-red-200 hover:bg-red-500/20"
                          >
                            Remove
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
