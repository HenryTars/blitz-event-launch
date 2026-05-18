'use client';

interface Props {
  className?: string;
  variant?: 'waves' | 'diamonds' | 'lines';
}

export default function PatternDivider({ className = '', variant = 'waves' }: Props) {
  if (variant === 'diamonds') {
    return (
      <div className={`pointer-events-none select-none ${className}`} aria-hidden="true">
        <svg viewBox="0 0 1200 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full" preserveAspectRatio="none">
          <pattern id="diamonds" x="0" y="0" width="60" height="40" patternUnits="userSpaceOnUse">
            <rect x="22" y="12" width="16" height="16" rx="2" stroke="#c5a57b" strokeWidth="0.5" fill="none" opacity="0.15" transform="rotate(45 30 20)" />
          </pattern>
          <rect width="1200" height="40" fill="url(#diamonds)" />
        </svg>
      </div>
    );
  }

  if (variant === 'lines') {
    return (
      <div className={`pointer-events-none select-none ${className}`} aria-hidden="true">
        <svg viewBox="0 0 1200 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full" preserveAspectRatio="none">
          <line x1="0" y1="4" x2="1200" y2="4" stroke="#c5a57b" strokeWidth="0.5" opacity="0.08" />
          <line x1="0" y1="15" x2="1200" y2="15" stroke="#c5a57b" strokeWidth="0.5" opacity="0.05" />
          <line x1="0" y1="26" x2="1200" y2="26" stroke="#c5a57b" strokeWidth="0.5" opacity="0.03" />
        </svg>
      </div>
    );
  }

  // waves variant (default)
  return (
    <div className={`pointer-events-none select-none ${className}`} aria-hidden="true">
      <svg viewBox="0 0 1200 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full" preserveAspectRatio="none">
        <path
          d="M0 24 Q150 0 300 24 Q450 48 600 24 Q750 0 900 24 Q1050 48 1200 24"
          stroke="url(#goldLine)"
          strokeWidth="0.8"
          fill="none"
          opacity="0.15"
        />
        <path
          d="M0 32 Q150 12 300 32 Q450 52 600 32 Q750 12 900 32 Q1050 52 1200 32"
          stroke="url(#goldLine)"
          strokeWidth="0.5"
          fill="none"
          opacity="0.08"
        />
        <path
          d="M0 16 Q150 36 300 16 Q450 -4 600 16 Q750 36 900 16 Q1050 -4 1200 16"
          stroke="url(#goldLine)"
          strokeWidth="0.5"
          fill="none"
          opacity="0.06"
        />
        <defs>
          <linearGradient id="goldLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="20%" stopColor="#c5a57b" />
            <stop offset="50%" stopColor="#e5d3b8" />
            <stop offset="80%" stopColor="#c5a57b" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
