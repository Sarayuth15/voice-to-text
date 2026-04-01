import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VoiceScript – Speech to Text',
  description: 'Real-time voice to text in Khmer & English',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#FF5252',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body suppressHydrationWarning>
        {/* Noise texture overlay for depth */}
        <div className="noise-overlay" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
