import type { Metadata } from 'next';
import { Inter, Sora, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CommandPalette } from '@/components/layout/CommandPalette';
import { ToastProvider } from '@/components/ui/Toast';
import { ThemeProvider } from '@/lib/theme';
import { LanguageProvider } from '@/lib/i18n';

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
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col bg-canvas text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-olive-600 selection:text-white transition-colors duration-200">
        {/* Ambient background wash — subtle, single system */}
        <div className="app-aurora" aria-hidden="true" />
        <ThemeProvider>
          <LanguageProvider>
            <ToastProvider>
              <Navbar />
              <main className="flex-1 pt-24">{children}</main>
              <Footer />
              <CommandPalette />
            </ToastProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
