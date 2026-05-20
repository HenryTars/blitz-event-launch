'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import QRCodeComponent from '@/components/QRCode';
import DeleteEventModal from '@/components/DeleteEventModal';
import { Download, QrCode, Users, CheckCircle2, XCircle, Clock, Mail as MailIcon, BookOpen, Edit3, Trash2 } from 'lucide-react';
import { authFetch } from '@/lib/auth-fetch';

interface Guest {
  id: string;
  guestName: string;
  guestEmail?: string;
  token: string;
  status: 'ACCEPTED' | 'DECLINED' | 'LATER' | 'PENDING';
  isApproved: boolean;
  createdAt: string;
}

interface PendingRequest {
  id: string;
  guestName: string;
  email: string | null;
  phone: string | null;
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
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [error, setError] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [busyGuestId, setBusyGuestId] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchEventData = async () => {
    try {
      const response = await fetch(`/api/events/${slug}`);
      if (!response.ok) throw new Error('Failed to fetch event');
      const data = await response.json();
      setEventData(data);

      const guestsResponse = await authFetch(`/api/events/${slug}/guests`);
      if (guestsResponse.ok) {
        const guestsData = await guestsResponse.json();
        setGuests(guestsData);
      }

      const pendingResponse = await authFetch(`/api/invitations/pending?eventSlug=${slug}`);
      if (pendingResponse.ok) {
        const pendingData = await pendingResponse.json();
        setPendingRequests(pendingData.pending);
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

  const approveRequest = async (id: string) => {
    try {
      setBusyGuestId(id);
      const response = await authFetch(`/api/invitations/${id}/approve`, { method: 'POST' });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to approve');
      }
      setPendingRequests((current) => current.filter((r) => r.id !== id));
      await fetchEventData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve request');
    } finally {
      setBusyGuestId('');
    }
  };

  const rejectRequest = async (id: string) => {
    const reason = window.prompt('Reason for rejection (optional):');
    try {
      setBusyGuestId(id);
      const response = await authFetch(`/api/invitations/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason || undefined })
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to reject');
      }
      setPendingRequests((current) => current.filter((r) => r.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject request');
    } finally {
      setBusyGuestId('');
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
      const response = await authFetch(`/api/events/${slug}/guests/${guest.id}/regenerate`, {
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
      const response = await authFetch(`/api/events/${slug}/guests/${guest.id}`, {
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

  const approvedGuests = guests.filter((g) => g.isApproved);
  const stats = eventData.analytics ?? {
    totalInvites: approvedGuests.length,
    acceptedCount: approvedGuests.filter((guest) => guest.status === 'ACCEPTED').length,
    declinedCount: approvedGuests.filter((guest) => guest.status === 'DECLINED').length,
    preorderCount: 0,
    attendanceCount: 0
  };
  const laterCount = approvedGuests.filter((guest) => guest.status === 'LATER').length;
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

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex flex-wrap gap-4 mb-12">
          <Button onClick={() => setShowQR(!showQR)} variant="secondary" className="gap-2">
            <QrCode size={18} />
            {showQR ? 'Hide QR Code' : 'Show QR Code'}
          </Button>
          <Button variant="secondary" className="gap-2" onClick={exportGuestList} disabled={!guests.length}>
            <Download size={18} />
            Export Guest List
          </Button>
          <Link href={`/events/${slug}/edit`}>
            <Button variant="secondary" className="gap-2">
              <Edit3 size={18} />
              Edit Event
            </Button>
          </Link>
          <Button variant="secondary" onClick={() => setShowDeleteModal(true)} className="gap-2 border-red-500/30 text-red-200 hover:bg-red-500/10">
            <Trash2 size={18} />
            Delete
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

        {pendingRequests.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-amber-500/5 backdrop-blur-sm rounded-2xl p-8 border border-amber-500/20 mb-8">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2 text-amber-200">
              <Clock size={24} />
              Pending Approval ({pendingRequests.length})
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-amber-500/10">
                    <th className="text-left py-3 px-4 text-amber-300/70 font-medium">Name</th>
                    <th className="text-left py-3 px-4 text-amber-300/70 font-medium">Email</th>
                    <th className="text-left py-3 px-4 text-amber-300/70 font-medium">Phone</th>
                    <th className="text-left py-3 px-4 text-amber-300/70 font-medium">Requested</th>
                    <th className="text-right py-3 px-4 text-amber-300/70 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRequests.map((req) => (
                    <tr key={req.id} className="border-b border-amber-500/5 hover:bg-amber-500/5 transition">
                      <td className="py-3 px-4 font-medium">{req.guestName}</td>
                      <td className="py-3 px-4 text-slate-400">{req.email || '-'}</td>
                      <td className="py-3 px-4 text-slate-400">{req.phone || '-'}</td>
                      <td className="py-3 px-4 text-slate-400 text-sm">{new Date(req.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="primary" size="sm" onClick={() => approveRequest(req.id)} disabled={busyGuestId === req.id} className="bg-emerald-600 hover:bg-emerald-700">
                            <CheckCircle2 size={16} className="mr-1" />
                            Approve
                          </Button>
                          <Button variant="secondary" size="sm" onClick={() => rejectRequest(req.id)} disabled={busyGuestId === req.id} className="border-red-500/40 text-red-200 hover:bg-red-500/20">
                            <XCircle size={16} className="mr-1" />
                            Reject
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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

        <DeleteEventModal
          open={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          eventSlug={slug}
          eventTitle={eventData?.title || ''}
          onDeleted={() => {
            setShowDeleteModal(false);
            window.location.href = '/my-events';
          }}
        />
      </div>
    </div>
  );
}
