'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description: string;
    slug: string;
    venue?: string | null;
    startAt: string | Date;
    heroImageUrl?: string | null;
    theme: string;
    authorName?: string | null;
    book?: { title: string; author: string; coverUrl?: string | null } | null;
    attendanceCount?: number;
    totalInvites?: number;
  };
  index?: number;
}

const themeGradients: Record<string, string> = {
  luxury: 'from-gold/20 via-amber-900/10 to-transparent',
  poetry: 'from-purple-500/20 via-pink-900/10 to-transparent',
  minimal: 'from-slate-300/10 via-slate-700/5 to-transparent'
};

export default function EventCard({ event, index = 0 }: EventCardProps) {
  const startDate = new Date(event.startAt);
  const gradient = themeGradients[event.theme] ?? themeGradients.luxury;
  const hasCover = event.heroImageUrl || event.book?.coverUrl;
  const coverUrl = event.heroImageUrl || event.book?.coverUrl;

  return (
    <Link href={`/events/${event.slug}`} className="group block">
      <motion.article
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
        className="card-premium relative overflow-hidden"
      >
        {/* Cover / Gradient */}
        <div className="relative aspect-[16/9] overflow-hidden rounded-t-2xl">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt=""
              className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />
          ) : (
            <div className={`h-full w-full bg-gradient-to-br ${gradient}`} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#09070b] via-[#09070b]/30 to-transparent" />

          {/* Theme badge */}
          <div className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold backdrop-blur-sm">
            {event.theme}
          </div>

          {/* Date badge */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-black/50 px-3 py-1.5 text-xs text-pearl backdrop-blur-sm">
            <Calendar className="h-3.5 w-3.5 text-gold" />
            {startDate.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </div>

          {/* Attendance */}
          {(event.attendanceCount ?? 0) > 0 && (
            <div className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-xs text-slate-300 backdrop-blur-sm">
              <Users className="h-3.5 w-3.5 text-gold" />
              {event.attendanceCount} attending
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-3 p-5">
          <h3 className="font-serif text-xl font-semibold leading-tight text-white transition group-hover:text-gold">
            {event.title}
          </h3>

          <p className="line-clamp-2 text-sm leading-relaxed text-slate-400">
            {event.description}
          </p>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              {event.venue && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {event.venue}
                </span>
              )}
              {event.authorName && (
                <span className="text-gold-400">by {event.authorName}</span>
              )}
            </div>
            <span className="flex items-center gap-1 text-xs font-medium text-gold transition group-hover:gap-2">
              View event <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </motion.article>
    </Link>
  );
}
