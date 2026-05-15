export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }
  // Fallback for dev
  if (process.env.NODE_ENV === 'development') {
    // Try to detect machine IP
    const host = process.env.HOST || 'localhost';
    const port = process.env.PORT || 3000;
    return `http://${host}:${port}`;
  }
  return `http://localhost:3000`;
}

export function getInviteLink(token: string): string {
  return `${getBaseUrl()}/invite/${token}`;
}
