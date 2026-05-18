'use client';

import { motion } from 'framer-motion';

interface Props {
  className?: string;
  variant?: 'events' | 'guests' | 'analytics' | 'general';
}

export default function EmptyStateIllustration({ className = '', variant = 'general' }: Props) {
  if (variant === 'events') {
    return (
      <div className={`pointer-events-none select-none ${className}`} aria-hidden="true">
        <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
          <motion.circle cx="100" cy="60" r="30" stroke="#c5a57b" strokeWidth="1" fill="none" className="opacity-20"
            animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 4, repeat: Infinity }} />
          <motion.circle cx="100" cy="60" r="20" stroke="#c5a57b" strokeWidth="0.8" fill="none" className="opacity-15"
            animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 4, repeat: Infinity, delay: 0.3 }} />
          <motion.circle cx="100" cy="60" r="10" fill="#c5a57b" className="opacity-10"
            animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 3, repeat: Infinity }} />
          {/* Small decorative dots */}
          <circle cx="60" cy="110" r="3" fill="#c5a57b" opacity="0.12" />
          <circle cx="140" cy="110" r="3" fill="#c5a57b" opacity="0.12" />
          <circle cx="80" cy="130" r="2" fill="#c5a57b" opacity="0.08" />
          <circle cx="120" cy="130" r="2" fill="#c5a57b" opacity="0.08" />
          <circle cx="100" cy="140" r="2" fill="#c5a57b" opacity="0.06" />
        </svg>
      </div>
    );
  }

  if (variant === 'guests') {
    return (
      <div className={`pointer-events-none select-none ${className}`} aria-hidden="true">
        <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
          {[80, 100, 120].map((cx, i) => (
            <motion.circle key={i} cx={cx} cy={60} r={8 + i * 2} stroke="#c5a57b" strokeWidth="0.6" fill="none" className="opacity-15"
              animate={{ y: [0, -4, 0] }} transition={{ duration: 3, repeat: Infinity, delay: i * 0.2 }} />
          ))}
          <motion.path d="M60 110 Q80 100, 100 110 Q120 100, 140 110" stroke="#c5a57b" strokeWidth="0.8" fill="none" className="opacity-12"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, ease: 'easeInOut' }} />
        </svg>
      </div>
    );
  }

  return (
    <div className={`pointer-events-none select-none ${className}`} aria-hidden="true">
      <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
        <motion.circle cx="100" cy="70" r="25" stroke="#c5a57b" strokeWidth="1" fill="none" className="opacity-15"
          animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 5, repeat: Infinity }} />
        <motion.circle cx="100" cy="70" r="12" fill="#c5a57b" className="opacity-8"
          animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 4, repeat: Infinity, delay: 0.5 }} />
        <circle cx="65" cy="110" r="2.5" fill="#c5a57b" opacity="0.1" />
        <circle cx="135" cy="110" r="2.5" fill="#c5a57b" opacity="0.1" />
        <circle cx="100" cy="120" r="2" fill="#c5a57b" opacity="0.08" />
      </svg>
    </div>
  );
}
