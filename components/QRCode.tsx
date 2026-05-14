'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface QRCodeProps {
  eventSlug: string;
  size?: number;
}

export default function QRCodeComponent({ eventSlug, size = 256 }: QRCodeProps) {
  // Generate QR code URL using QR Server API (free, no dependencies needed)
  const qrCodeUrl = useMemo(() => {
    const checkInUrl = `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3004'}/events/${eventSlug}/checkin`;
    const encodedUrl = encodeURIComponent(checkInUrl);
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedUrl}`;
  }, [eventSlug, size]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center gap-4"
    >
      <div className="p-4 bg-white rounded-xl">
        <img
          src={qrCodeUrl}
          alt="Event Check-in QR Code"
          width={size}
          height={size}
          className="rounded-lg"
        />
      </div>
      <p className="text-sm text-slate-400 text-center">
        Scan to check in to {eventSlug}
      </p>
    </motion.div>
  );
}
