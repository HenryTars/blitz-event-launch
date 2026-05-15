import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import Header from '@/components/Header';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'BLITZ Dar — Book & Poetry Events',
  description:
    'A premium platform for cinematic book launches, intimate poetry salons, and unforgettable literary events. Curate invitations, manage RSVPs, and craft immersive guest experiences.',
  metadataBase: new URL('https://blitzlaunch.com'),
  openGraph: {
    title: 'BLITZ Dar — Book & Poetry Events',
    description:
      'A premium platform for cinematic book launches, intimate poetry salons, and unforgettable literary events.',
    type: 'website',
    siteName: 'BLITZ Dar'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased">
        <Header />
        <main className="pt-16">{children}</main>
      </body>
    </html>
  );
}
