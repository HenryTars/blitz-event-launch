'use client';

import { motion } from 'framer-motion';

interface Props {
  className?: string;
}

export default function HeroIllustration({ className = '' }: Props) {
  return (
    <div className={`pointer-events-none select-none ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 800 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
      >
        {/* Large ambient orb */}
        <motion.circle
          cx="400" cy="400" r="280"
          fill="url(#heroGlow)"
          className="opacity-30"
          animate={{ scale: [1, 1.05, 1], opacity: [0.2, 0.35, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Organic flowing curves — story/wave motif */}
        <motion.path
          d="M100 500 C200 350, 300 600, 400 400 C500 200, 600 550, 700 350"
          stroke="url(#goldGrad)"
          strokeWidth="1.5"
          fill="none"
          className="opacity-25"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, delay: 0.5, ease: 'easeInOut' }}
        />
        <motion.path
          d="M50 550 C180 380, 280 650, 420 450 C550 250, 650 600, 750 400"
          stroke="url(#goldGrad)"
          strokeWidth="1"
          fill="none"
          className="opacity-15"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 4, delay: 1, ease: 'easeInOut' }}
        />
        <motion.path
          d="M80 620 C220 420, 340 700, 480 480 C600 280, 680 650, 770 440"
          stroke="url(#goldGrad)"
          strokeWidth="0.8"
          fill="none"
          className="opacity-10"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 5, delay: 1.5, ease: 'easeInOut' }}
        />

        {/* Floating dots — constellation/literary dots motif */}
        {[[280, 280], [520, 200], [180, 500], [620, 550], [350, 620], [550, 350], [240, 380], [560, 480]].map(([cx, cy], i) => (
          <motion.circle
            key={i}
            cx={cx} cy={cy} r={3 + (i % 3)}
            fill="#c5a57b"
            className="opacity-30"
            animate={{
              y: [0, -8 - (i % 5) * 2, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 4 + i * 0.3,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Geometric accent — diamond motif (African pattern inspiration) */}
        <motion.g
          className="opacity-20"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '400px 400px' }}
        >
          <rect x="350" y="120" width="100" height="100" rx="4" stroke="#c5a57b" strokeWidth="1" fill="none" transform="rotate(45 400 420)" />
          <rect x="350" y="580" width="100" height="100" rx="4" stroke="#c5a57b" strokeWidth="1" fill="none" transform="rotate(45 400 630)" />
          <rect x="120" y="350" width="100" height="100" rx="4" stroke="#c5a57b" strokeWidth="1" fill="none" transform="rotate(45 420 400)" />
          <rect x="580" y="350" width="100" height="100" rx="4" stroke="#c5a57b" strokeWidth="1" fill="none" transform="rotate(45 630 400)" />
        </motion.g>

        {/* Smaller orbiting decorative dots */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <motion.circle
            key={`orb-${i}`}
            r={2}
            fill="#c5a57b"
            className="opacity-25"
            animate={{
              cx: [400 + 200 * Math.cos((angle * Math.PI) / 180), 400 + 200 * Math.cos(((angle + 180) * Math.PI) / 180)],
              cy: [400 + 200 * Math.sin((angle * Math.PI) / 180), 400 + 200 * Math.sin(((angle + 180) * Math.PI) / 180)],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          />
        ))}

        {/* Central abstract shape — open book / wings motif */}
        <motion.path
          d="M320 340 C350 300, 370 280, 400 320 C430 280, 450 300, 480 340 C450 370, 430 400, 400 380 C370 400, 350 370, 320 340Z"
          fill="url(#goldGrad)"
          className="opacity-8"
          animate={{ scale: [1, 1.08, 1], opacity: [0.06, 0.12, 0.06] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Defs */}
        <defs>
          <radialGradient id="heroGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#c5a57b" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#c5a57b" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#c5a57b" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#c5a57b" />
            <stop offset="50%" stopColor="#e5d3b8" />
            <stop offset="100%" stopColor="#c5a57b" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
