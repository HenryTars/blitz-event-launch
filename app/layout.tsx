import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BliTz Launch — Book & Poetry Events',
  description: 'Luxury event launch platform for book and poetry experiences.',
  metadataBase: new URL('https://example.com')
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
