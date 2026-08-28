import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CommandPalette } from '@/components/layout/CommandPalette';
import { ToastProvider } from '@/components/ui/Toast';
import { ThemeProvider } from '@/lib/theme';
import { LanguageProvider } from '@/lib/i18n';
import { MobileDock } from '@/components/layout/MobileDock';

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
      className="scroll-smooth"
      suppressHydrationWarning
    >
      <head>
        {/* Apply saved theme before first paint to avoid dark-mode flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('gati_theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-canvas text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-olive-600 selection:text-white transition-colors duration-200">
        {/* Ambient background wash — subtle, single system */}
        <div className="app-aurora" aria-hidden="true" />
        <ThemeProvider>
          <LanguageProvider>
            <ToastProvider>
              <Navbar />
              <main className="app-main flex-1 pt-24 pb-24 lg:pb-0">{children}</main>
              <Footer />
              <MobileDock />
              <CommandPalette />
            </ToastProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
