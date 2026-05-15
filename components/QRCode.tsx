'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { getBaseUrl } from '@/lib/url';

interface QRCodeProps {
  eventSlug?: string;
  token?: string;
  shortCode?: string;
  size?: number;
  label?: string;
}

export default function QRCodeComponent({ eventSlug, token, shortCode, size = 256, label }: QRCodeProps) {
  const qrData = useMemo(() => {
    if (shortCode) return shortCode;
    const base = typeof window !== 'undefined' ? window.location.origin : getBaseUrl();
    if (token) return `${base}/invite/${token}`;
    if (eventSlug) return `${base}/events/${eventSlug}/checkin`;
    return getBaseUrl();
  }, [eventSlug, token, shortCode]);

  const qrCodeUrl = useMemo(() => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(qrData)}`;
  }, [qrData, size]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center gap-4"
    >
      <div className="rounded-xl bg-white p-4 shadow-lg">
        <img
          src={qrCodeUrl}
          alt="QR Code"
          width={size}
          height={size}
          className="rounded-lg"
        />
      </div>
      {label && (
        <p className="text-sm text-slate-400 text-center max-w-xs">{label}</p>
      )}
      {shortCode && (
        <p className="font-mono text-lg tracking-[0.3em] text-gold">{shortCode}</p>
      )}
    </motion.div>
  );
}
