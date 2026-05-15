export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }
  // Vercel deployment
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  // Dev fallback
  const host = process.env.HOST || 'localhost';
  const port = process.env.PORT || 3000;
  return `http://${host}:${port}`;
}

export function getInviteLink(token: string): string {
  return `${getBaseUrl()}/invite/${token}`;
}
