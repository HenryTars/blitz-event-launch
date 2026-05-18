'use client';

import { motion } from 'framer-motion';

interface Props {
  className?: string;
  variant?: 'book' | 'poetry' | 'celebration';
}

export default function LiteraryIllustration({ className = '', variant = 'book' }: Props) {
  if (variant === 'poetry') {
    return (
      <div className={`pointer-events-none select-none ${className}`} aria-hidden="true">
        <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
          {/* Floating text lines — poetry motif */}
          {[
            { y: 60, w: 120, delay: 0 },
            { y: 95, w: 160, delay: 0.2 },
            { y: 130, w: 140, delay: 0.4 },
            { y: 165, w: 100, delay: 0.6 },
          ].map((line, i) => (
            <motion.rect
              key={i}
              x={200 - line.w / 2}
              y={line.y}
              width={line.w}
              height="3"
              rx="1.5"
              fill="#c5a57b"
              className="opacity-30"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: line.w, opacity: 0.3 }}
              transition={{ duration: 1.5, delay: line.delay, ease: 'easeOut' }}
            />
          ))}
          {/* Sparkle dots */}
          {[[160, 50], [240, 85], [180, 120], [250, 155], [190, 190]].map(([cx, cy], i) => (
            <motion.circle
              key={`dot-${i}`}
              cx={cx}
              cy={cy}
              r={2.5}
              fill="#e5d3b8"
              className="opacity-40"
              animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
            />
          ))}
          {/* Ornamental line */}
          <motion.path
            d="M100 240 C150 230, 200 250, 250 235 C300 220, 320 240, 360 230"
            stroke="#c5a57b"
            strokeWidth="1"
            fill="none"
            className="opacity-15"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 1, ease: 'easeInOut' }}
          />
          <motion.path
            d="M120 250 C160 242, 200 258, 240 245 C280 232, 310 250, 340 242"
            stroke="#c5a57b"
            strokeWidth="0.6"
            fill="none"
            className="opacity-10"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2.5, delay: 1.3, ease: 'easeInOut' }}
          />
        </svg>
      </div>
    );
  }

  if (variant === 'celebration') {
    return (
      <div className={`pointer-events-none select-none ${className}`} aria-hidden="true">
        <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
          {/* Central glow */}
          <motion.circle
            cx="200" cy="150" r="80"
            fill="url(#celebrateGlow)"
            className="opacity-30"
            animate={{ scale: [1, 1.08, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Radiating lines */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const x1 = 200 + 30 * Math.cos(rad);
            const y1 = 150 + 30 * Math.sin(rad);
            const x2 = 200 + 80 * Math.cos(rad);
            const y2 = 150 + 80 * Math.sin(rad);
            return (
              <motion.line
                key={i}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="#c5a57b"
                strokeWidth="1"
                className="opacity-20"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: i * 0.05 }}
              />
            );
          })}
          {/* Sparkles */}
          {[[120, 60], [290, 50], [340, 140], [60, 200], [310, 240], [80, 100]].map(([cx, cy], i) => (
            <motion.circle
              key={`spark-${i}`}
              cx={cx}
              cy={cy}
              r={2 + (i % 2)}
              fill="#e5d3b8"
              className="opacity-40"
              animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.5, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4 }}
            />
          ))}
          <defs>
            <radialGradient id="celebrateGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#c5a57b" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#c5a57b" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      </div>
    );
  }

  // book variant (default)
  return (
    <div className={`pointer-events-none select-none ${className}`} aria-hidden="true">
      <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
        {/* Open book shape */}
        <motion.path
          d="M60 220 C80 180, 130 150, 200 140 C270 150, 320 180, 340 220"
          stroke="url(#bookGold)"
          strokeWidth="1.5"
          fill="none"
          className="opacity-25"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.5, ease: 'easeInOut' }}
        />
        {/* Pages */}
        <motion.path
          d="M70 210 C90 175, 140 150, 200 140 C260 150, 310 175, 330 210"
          stroke="#c5a57b"
          strokeWidth="0.8"
          fill="none"
          className="opacity-15"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 0.5, ease: 'easeInOut' }}
        />
        <motion.path
          d="M80 200 C100 170, 145 150, 200 140 C255 150, 300 170, 320 200"
          stroke="#c5a57b"
          strokeWidth="0.5"
          fill="none"
          className="opacity-10"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.8, delay: 1, ease: 'easeInOut' }}
        />
        {/* Rising sparkles — ideas/literature */}
        {[[160, 120], [200, 100], [240, 115], [180, 85], [220, 80]].map(([cx, cy], i) => (
          <motion.circle
            key={i}
            cx={cx}
            cy={cy}
            r={2}
            fill="#e5d3b8"
            className="opacity-40"
            animate={{
              y: [0, -15, 0],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 2.5 + i * 0.2,
              repeat: Infinity,
              delay: i * 0.3,
              ease: 'easeInOut',
            }}
          />
        ))}
        <defs>
          <linearGradient id="bookGold" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#c5a57b" />
            <stop offset="50%" stopColor="#e5d3b8" />
            <stop offset="100%" stopColor="#c5a57b" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
