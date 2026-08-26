import type { Metadata } from 'next';
import { Inter, Sora, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CommandPalette } from '@/components/layout/CommandPalette';
import { ToastProvider } from '@/components/ui/Toast';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Gati (गति) — Modern Indian Vehicle & Driving Services',
  description:
    'A radically better digital public service experience for Indian vehicle licensing, fancy number allocations, driving licences, and commercial permits.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`scroll-smooth ${inter.variable} ${sora.variable} ${jetbrains.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-canvas text-slate-900 font-sans antialiased selection:bg-olive-600 selection:text-white">
        {/* Ambient background wash — subtle, single system */}
        <div className="app-aurora" aria-hidden="true" />
        {/* Subtle Indian jali weave for distinct identity */}
        <div className="app-jali" aria-hidden="true" />
        <ToastProvider>
          <Navbar />
          <main className="flex-1 pt-24">{children}</main>
          <Footer />
          <CommandPalette />
        </ToastProvider>
      </body>
    </html>
  );
}
