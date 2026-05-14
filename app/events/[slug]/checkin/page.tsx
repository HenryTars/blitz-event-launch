'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface CheckInResult {
  success: boolean;
  message: string;
  guestName?: string;
  eventTitle?: string;
  checkedInAt?: string;
  error?: string;
}

export default function CheckInPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [invitationToken, setInvitationToken] = useState('');
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`/api/checkin/${invitationToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: data.message,
          guestName: data.guestName,
          eventTitle: data.eventTitle,
          checkedInAt: data.checkedInAt
        });
        setInvitationToken('');
      } else {
        setResult({
          success: false,
          message: 'Check-in failed',
          error: data.error
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'An error occurred',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09070b] text-pearl py-12 px-6">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-semibold mb-2">Event Check-In</h1>
          <p className="text-slate-400">Enter your invitation code to check in</p>
        </motion.div>

        {/* Success Message */}
        {result?.success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 p-6 bg-green-500/20 border border-green-500/30 rounded-xl"
          >
            <div className="flex items-start gap-4">
              <CheckCircle2 size={24} className="text-green-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-green-300 mb-1">✅ Check-In Successful!</h3>
                <p className="text-green-200 mb-2">{result.guestName}, you're all checked in.</p>
                <p className="text-sm text-green-300/80">Welcome to {result.eventTitle}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Error Message */}
        {result?.success === false && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 p-6 bg-red-500/20 border border-red-500/30 rounded-xl"
          >
            <div className="flex items-start gap-4">
              <AlertCircle size={24} className="text-red-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-red-300 mb-1">Check-In Failed</h3>
                <p className="text-red-200 text-sm">{result.error}</p>
                <button
                  onClick={() => setResult(null)}
                  className="text-red-300 hover:text-red-200 text-sm mt-2 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Check-In Form */}
        {!result?.success && (
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleCheckIn}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 space-y-6"
          >
            <div>
              <label className="block text-sm font-medium mb-2 text-white">
                Invitation Code
              </label>
              <input
                type="text"
                value={invitationToken}
                onChange={(e) => setInvitationToken(e.target.value.toUpperCase())}
                placeholder="Enter your 8-character code"
                maxLength={50}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent text-white placeholder:text-slate-400 uppercase"
                required
              />
              <p className="text-xs text-slate-500 mt-2">
                You'll find this code in your invitation email or text message.
              </p>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={loading || !invitationToken}
              className="w-full"
            >
              {loading ? 'Checking In...' : 'Check In'}
            </Button>
          </motion.form>
        )}

        {/* Success Action */}
        {result?.success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <Button
              onClick={() => setResult(null)}
              variant="secondary"
              className="w-full"
            >
              Check In Another Guest
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
