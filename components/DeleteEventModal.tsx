'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  open: boolean;
  onClose: () => void;
  eventSlug: string;
  eventTitle: string;
  onDeleted: () => void;
}

export default function DeleteEventModal({ open, onClose, eventSlug, eventTitle, onDeleted }: Props) {
  const [deleting, setDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (confirmText !== 'delete') return;
    setDeleting(true);
    setError('');
    try {
      const res = await fetch(`/api/events/${eventSlug}/delete`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        onDeleted();
      } else {
        setError(data.error || 'Delete failed');
      }
    } catch {
      setError('Network error');
    }
    setDeleting(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md rounded-2xl border border-red-500/20 bg-[#0a0a0f] p-6 shadow-xl"
          >
            <button onClick={onClose} className="absolute right-4 top-4 text-slate-500 transition hover:text-pearl">
              <X className="h-4 w-4" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
                <AlertTriangle className="h-7 w-7 text-red-400" />
              </div>
              <h2 className="font-serif text-xl font-semibold text-white">Delete Event</h2>
              <p className="mt-2 text-sm text-slate-400">
                This will hide <span className="font-medium text-white">{eventTitle}</span> from public view. This action is irreversible.
              </p>

              <div className="mt-6 w-full">
                <label className="mb-2 block text-xs text-slate-500">
                  Type <span className="font-mono text-red-400">delete</span> to confirm
                </label>
                <input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="delete"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center font-mono text-white placeholder:text-slate-600 focus:border-red-500/40 focus:outline-none transition"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>

              {error && <p className="mt-3 text-xs text-red-400">{error}</p>}

              <div className="mt-6 flex w-full gap-3">
                <Button variant="secondary" size="lg" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <button
                  onClick={handleDelete}
                  disabled={confirmText !== 'delete' || deleting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-500 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {deleting ? 'Deleting...' : 'Delete Event'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
