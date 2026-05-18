export type EventLifecycle = 'UPCOMING' | 'TODAY' | 'LIVE_NOW' | 'ENDED';

export interface LifecycleInfo {
  state: EventLifecycle;
  label: string;
  description: string;
  color: string;
  badgeClass: string;
}

export function getEventLifecycle(startAt: Date | string, endAt?: Date | string | null): EventLifecycle {
  const now = Date.now();
  const start = new Date(startAt).getTime();
  const end = endAt ? new Date(endAt).getTime() : start + 3 * 60 * 60 * 1000; // default 3h

  if (now >= end) return 'ENDED';
  if (now >= start && now < end) return 'LIVE_NOW';

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const eventStart = new Date(startAt);
  if (eventStart >= startOfToday && eventStart <= endOfToday) return 'TODAY';

  return 'UPCOMING';
}

export function getLifecycleInfo(state: EventLifecycle): LifecycleInfo {
  switch (state) {
    case 'TODAY':
      return {
        state,
        label: 'Happening Today',
        description: 'This event is happening today',
        color: 'text-amber-400',
        badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      };
    case 'LIVE_NOW':
      return {
        state,
        label: 'Live Now',
        description: 'Happening now',
        color: 'text-emerald-400',
        badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      };
    case 'ENDED':
      return {
        state,
        label: 'Event Ended',
        description: 'This event has concluded',
        color: 'text-slate-500',
        badgeClass: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
      };
    default:
      return {
        state,
        label: 'Upcoming',
        description: 'Upcoming event',
        color: 'text-gold',
        badgeClass: 'bg-gold/10 text-gold border-gold/20',
      };
  }
}
