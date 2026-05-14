import React from 'react';
import { motion } from 'framer-motion';

interface EventCardData {
  title: string;
  description: string;
  author: string;
  date: string;
}

export default function EventCard({ event }: { event: EventCardData }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 transition-all duration-300 hover:bg-white/10 hover:border-white/20"
    >
      <div className="aspect-[16/9] rounded-xl bg-gradient-to-br from-gold/20 to-slate-600/20 mb-4" />
      <h3 className="text-xl font-semibold text-white mb-2">{event.title}</h3>
      <p className="text-slate-300 text-sm mb-4">{event.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-gold text-sm font-medium">{event.author}</span>
        <span className="text-slate-400 text-xs">{event.date}</span>
      </div>
    </motion.div>
  );
}
