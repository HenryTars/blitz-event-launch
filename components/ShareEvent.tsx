'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Link, Check, X, MessageCircle, Send, Twitter, Mail, Globe } from 'lucide-react';

interface Props {
  url: string;
  title: string;
  description?: string;
  className?: string;
  variant?: 'icon' | 'button';
}

const shareOptions = [
  {
    id: 'copy',
    label: 'Copy Link',
    icon: Link,
    color: 'text-slate-300 hover:bg-white/5',
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    icon: MessageCircle,
    color: 'text-emerald-400 hover:bg-emerald-500/10',
  },
  {
    id: 'telegram',
    label: 'Telegram',
    icon: Send,
    color: 'text-sky-400 hover:bg-sky-500/10',
  },
  {
    id: 'twitter',
    label: 'X / Twitter',
    icon: Twitter,
    color: 'text-slate-300 hover:bg-white/5',
  },
  {
    id: 'email',
    label: 'Email',
    icon: Mail,
    color: 'text-gold hover:bg-gold/10',
  },
];

export default function ShareEvent({ url, title, description, className = '', variant = 'icon' }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  const showToast = useCallback((message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast({ message: '', visible: false }), 2500);
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      showToast('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Failed to copy link');
    }
  }, [url, showToast]);

  const handleShare = useCallback(async (platform?: string) => {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    const encodedDesc = encodeURIComponent(description || '');

    switch (platform) {
      case 'copy':
        await handleCopy();
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodedTitle}%20-%20${encodedUrl}`, '_blank', 'noopener');
        showToast('Opening WhatsApp');
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`, '_blank', 'noopener');
        showToast('Opening Telegram');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`, '_blank', 'noopener');
        showToast('Opening X');
        break;
      case 'email':
        window.open(`mailto:?subject=${encodedTitle}&body=${encodedDesc}%0A%0A${encodedUrl}`, '_blank');
        showToast('Opening email client');
        break;
      default:
        // Native Web Share API
        if (typeof navigator !== 'undefined' && 'share' in navigator) {
          try {
            await navigator.share({ title, text: description || title, url });
            showToast('Shared successfully');
          } catch {
            // User cancelled or error
          }
        } else {
          setIsOpen(true);
        }
    }

    if (platform) setIsOpen(false);
  }, [url, title, description, handleCopy, showToast]);

  return (
    <>
      {/* Trigger button */}
      {variant === 'icon' ? (
        <button onClick={() => typeof navigator !== 'undefined' && 'share' in navigator ? handleShare() : setIsOpen(!isOpen)}
          className={`flex items-center justify-center rounded-full border border-white/10 bg-white/5 p-2.5 text-slate-400 backdrop-blur-sm transition hover:border-white/20 hover:bg-white/10 hover:text-pearl ${className}`}
          aria-label="Share this event"
        >
          <Share2 className="h-4 w-4" />
        </button>
      ) : (
        <button onClick={() => setIsOpen(!isOpen)}
          className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-slate-300 backdrop-blur-sm transition hover:border-white/20 hover:bg-white/10 hover:text-pearl ${className}`}
        >
          <Share2 className="h-4 w-4" />
          Share
        </button>
      )}

      {/* Share modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 10 }}
              transition={{ type: 'spring', duration: 0.4, bounce: 0.2 }}
              className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-sm -translate-x-1/2 -translate-y-1/2"
            >
              <div className="rounded-2xl border border-white/10 bg-[#120d17] p-6 shadow-2xl">
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Share this event</h3>
                  <button onClick={() => setIsOpen(false)}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-slate-500 transition hover:bg-white/5 hover:text-pearl">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="mb-4 space-y-1">
                  <p className="truncate text-sm font-medium text-white">{title}</p>
                  <p className="truncate text-xs text-slate-500">{url}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {shareOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleShare(option.id)}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${option.color}`}
                    >
                      <option.icon className="h-4 w-4 shrink-0" />
                      {option.label}
                    </button>
                  ))}
                </div>

                {typeof navigator !== 'undefined' && 'share' in navigator && (
                  <button onClick={() => { handleShare(); setIsOpen(false); }}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/5">
                    <Globe className="h-4 w-4" />
                    More sharing options
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Toast notification */}
      <AnimatePresence>
        {toast.visible && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2"
          >
            <div className="flex items-center gap-2.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-5 py-3 text-sm text-emerald-300 shadow-lg backdrop-blur-sm">
              <Check className="h-4 w-4" />
              {toast.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
