const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateShortCode(): string {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return code;
}

export function isShortCodeExpired(eventEndAt: Date | null, eventStartAt: Date): boolean {
  const endDate = eventEndAt || new Date(eventStartAt.getTime() + 24 * 60 * 60 * 1000);
  return Date.now() > endDate.getTime();
}
