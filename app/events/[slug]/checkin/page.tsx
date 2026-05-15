'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  QrCode,
  Scan,
  Camera,
  CheckCircle2,
  AlertCircle,
  User,
  Calendar,
  ArrowRight,
  ChevronLeft,
  Sparkles,
  Keyboard
} from 'lucide-react';

interface CheckInResult {
  message?: string;
  guestName?: string;
  shortCode?: string;
  checkedInAt?: string;
  eventTitle?: string;
  eventSlug?: string;
  alreadyCheckedIn?: boolean;
  error?: string;
}

export default function CheckInPage() {
  const params = useParams();
  const slug = params.slug as string;
  const inputRef = useRef<HTMLInputElement>(null);
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<any>(null);

  const [code, setCode] = useState('');
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'manual' | 'scan' | 'success' | 'error'>('manual');
  const [recentCheckIns, setRecentCheckIns] = useState<string[]>([]);
  const [scannerStarted, setScannerStarted] = useState(false);

  // Focus input when switching to manual mode
  useEffect(() => {
    if (mode === 'manual') inputRef.current?.focus();
  }, [mode]);

  const processCheckIn = useCallback(async (checkCode: string) => {
    if (!checkCode.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`/api/checkin/${checkCode.trim()}`, { method: 'POST' });
      const data: CheckInResult = await res.json();

      if (res.ok) {
        setResult(data);
        setMode('success');
        setRecentCheckIns((prev) => [data.guestName || 'Guest', ...prev].slice(0, 5));
        setCode('');
      } else {
        setResult(data);
        setMode('error');
      }
    } catch {
      setResult({ message: '', error: 'Connection error. Please try again.' });
      setMode('error');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processCheckIn(code);
  };

  // Start/stop scanner
  const startScanner = useCallback(async () => {
    if (typeof window === 'undefined') return;
    const { Html5Qrcode } = await import('html5-qrcode');

    if (html5QrCodeRef.current) {
      await html5QrCodeRef.current.stop();
      html5QrCodeRef.current.clear();
    }

    const scannerId = 'qr-scanner-element';
    const html5QrCode = new Html5Qrcode(scannerId);
    html5QrCodeRef.current = html5QrCode;

    try {
      await html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText: string) => {
          // QR encodes: short code (6 chars) or URL containing it
          const match = decodedText.match(/[A-Z0-9]{6}/);
          const scanned = match ? match[0] : decodedText.trim();
          html5QrCode.stop().catch(() => {});
          setScannerStarted(false);
          processCheckIn(scanned);
        },
        () => {}
      );
      setScannerStarted(true);
    } catch {
      setScannerStarted(false);
    }
  }, [processCheckIn]);

  const stopScanner = useCallback(async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        await html5QrCodeRef.current.clear();
      } catch {}
      html5QrCodeRef.current = null;
    }
    setScannerStarted(false);
  }, []);

  // Clean up scanner on unmount
  useEffect(() => {
    return () => { stopScanner(); };
  }, [stopScanner]);

  const switchToScan = async () => {
    setMode('scan');
    setResult(null);
    setCode('');
    setTimeout(() => startScanner(), 200);
  };

  const switchToManual = () => {
    stopScanner();
    setMode('manual');
    setResult(null);
    setCode('');
  };

  const reset = () => {
    stopScanner();
    setMode('manual');
    setResult(null);
    setCode('');
  };

  return (
    <div className="min-h-screen bg-[#09070b] text-pearl">
      <div className="mx-auto max-w-lg px-6 pt-8">
        <Link
          href={`/events/${slug}/dashboard`}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-pearl"
        >
          <ChevronLeft className="h-4 w-4" />
          Dashboard
        </Link>
      </div>

      <div className="mx-auto max-w-lg px-6 pb-20">
        {/* ─── Mode Tabs ─── */}
        {(mode === 'manual' || mode === 'scan') && (
          <div className="flex gap-2 pt-4 pb-6">
            <button
              onClick={switchToManual}
              className={`flex items-center gap-2 rounded-full px-5 py-2 text-xs font-medium transition ${
                mode === 'manual'
                  ? 'bg-gold text-ink'
                  : 'border border-white/10 text-slate-400 hover:text-pearl'
              }`}
            >
              <Keyboard className="h-3.5 w-3.5" />
              Type Code
            </button>
            <button
              onClick={switchToScan}
              className={`flex items-center gap-2 rounded-full px-5 py-2 text-xs font-medium transition ${
                mode === 'scan'
                  ? 'bg-gold text-ink'
                  : 'border border-white/10 text-slate-400 hover:text-pearl'
              }`}
            >
              <Camera className="h-3.5 w-3.5" />
              Scan QR
            </button>
          </div>
        )}

        {/* Scanner div — always in DOM so Html5Qrcode can find it */}
        <div
          id="qr-scanner-element"
          ref={scannerRef}
          className={`w-full max-w-lg aspect-square rounded-xl overflow-hidden bg-black/40 flex items-center justify-center mx-auto mb-6 transition-all ${mode === 'scan' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none absolute inset-0 -z-10'}`}
        >
          {!scannerStarted && mode === 'scan' && (
            <div className="text-center text-slate-500 p-8">
              <Camera className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Camera access required</p>
              <Button onClick={startScanner} variant="secondary" size="sm" className="mt-4">
                Start Camera
              </Button>
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {/* ─── Manual Entry ─── */}
          {mode === 'manual' && (
            <motion.div
              key="manual"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex flex-col items-center pt-2">
                <div className="relative mb-6">
                  <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/20 flex items-center justify-center">
                    <Scan className="h-8 w-8 text-gold" />
                  </div>
                  <div className="absolute -inset-2 rounded-3xl border border-gold/10 animate-pulse-glow" />
                </div>
                <h1 className="font-serif text-2xl font-semibold text-white">Guest Check-In</h1>
                <p className="mt-2 text-sm text-slate-400 text-center max-w-xs">
                  Enter the guest&apos;s 6-character code.
                </p>
              </div>

              {recentCheckIns.length > 0 && (
                <div className="glass rounded-xl p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-3">Recent</p>
                  <div className="space-y-2">
                    {recentCheckIns.map((name, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-slate-400">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-400 shrink-0" />
                        {name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handleManualSubmit} className="glass rounded-2xl p-6 space-y-5">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">
                    Check-In Code
                  </label>
                  <div className="relative">
                    <QrCode className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      ref={inputRef}
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
                      placeholder="e.g. A3X9K2"
                      maxLength={6}
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-4 font-mono text-lg tracking-[0.3em] text-white placeholder:text-sm placeholder:tracking-normal placeholder:text-slate-600 focus:border-gold/40 focus:outline-none focus:ring-1 focus:ring-gold/30 transition uppercase"
                      autoComplete="off"
                      spellCheck={false}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="secondary" size="lg" onClick={reset} className="flex-1">
                    Clear
                  </Button>
                  <Button type="submit" size="lg" disabled={loading || code.length < 6} className="flex-1 gap-2">
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink border-t-transparent" />
                        Checking...
                      </span>
                    ) : (
                      <>
                        <Scan className="h-4 w-4" />
                        Check In
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          )}

          {/* ─── Scan QR ─── */}
          {mode === 'scan' && (
            <motion.div
              key="scan"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex flex-col items-center pt-2">
                <h1 className="font-serif text-2xl font-semibold text-white">Scan QR Code</h1>
                <p className="mt-2 text-sm text-slate-400 text-center max-w-xs">
                  Point your camera at the guest&apos;s QR code to check them in.
                </p>
              </div>

              <div className="text-center">
                <Button variant="secondary" size="sm" onClick={switchToManual} className="gap-2">
                  <Keyboard className="h-3.5 w-3.5" />
                  Enter code manually instead
                </Button>
              </div>
            </motion.div>
          )}

          {/* ─── Success ─── */}
          {mode === 'success' && result && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 pt-6"
            >
              <div className="flex flex-col items-center text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                >
                  <div className={`h-24 w-24 rounded-full flex items-center justify-center mb-6 ${
                    result.alreadyCheckedIn
                      ? 'bg-amber-500/20 border border-amber-500/30'
                      : 'bg-green-500/20 border border-green-500/30'
                  }`}>
                    {result.alreadyCheckedIn ? (
                      <AlertCircle className="h-10 w-10 text-amber-400" />
                    ) : (
                      <CheckCircle2 className="h-10 w-10 text-green-400" />
                    )}
                  </div>
                </motion.div>

                <h2 className="font-serif text-2xl font-semibold text-white">
                  {result.alreadyCheckedIn ? 'Already Checked In' : 'Check-In Successful!'}
                </h2>

                <div className="mt-6 glass rounded-2xl p-6 w-full text-left space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-gold shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500">Guest</p>
                      <p className="text-white font-medium">{result.guestName}</p>
                    </div>
                  </div>
                  {result.shortCode && (
                    <div className="flex items-center gap-3">
                      <QrCode className="h-4 w-4 text-gold shrink-0" />
                      <div>
                        <p className="text-xs text-slate-500">Code</p>
                        <p className="text-white font-mono tracking-wider">{result.shortCode}</p>
                      </div>
                    </div>
                  )}
                  {result.eventTitle && (
                    <div className="flex items-center gap-3">
                      <Sparkles className="h-4 w-4 text-gold shrink-0" />
                      <div>
                        <p className="text-xs text-slate-500">Event</p>
                        <p className="text-white">{result.eventTitle}</p>
                      </div>
                    </div>
                  )}
                  {result.checkedInAt && (
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-gold shrink-0" />
                      <div>
                        <p className="text-xs text-slate-500">Checked in at</p>
                        <p className="text-white">
                          {new Date(result.checkedInAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-8 flex flex-col gap-3 w-full">
                  <Button onClick={reset} size="lg" className="w-full gap-2">
                    <Scan className="h-4 w-4" />
                    Check In Next Guest
                  </Button>
                  {result.eventSlug && (
                    <Link href={`/events/${result.eventSlug}/dashboard`}>
                      <Button variant="secondary" size="lg" className="w-full gap-2">
                        <ArrowRight className="h-4 w-4" />
                        View Dashboard
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── Error ─── */}
          {mode === 'error' && result && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 pt-6"
            >
              <div className="flex flex-col items-center text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                >
                  <div className="h-24 w-24 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center mb-6">
                    <AlertCircle className="h-10 w-10 text-red-400" />
                  </div>
                </motion.div>

                <h2 className="font-serif text-2xl font-semibold text-white">Check-In Failed</h2>
                <p className="mt-3 text-sm text-slate-400 max-w-xs">
                  {result.error || 'Unable to process check-in.'}
                </p>
                {result.guestName && (
                  <p className="mt-2 text-xs text-slate-500">Guest: {result.guestName}</p>
                )}

                <div className="mt-8 flex flex-col gap-3 w-full">
                  <Button onClick={reset} size="lg" className="w-full">
                    Try Again
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
