import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { PwaRegistry } from '@/components/PwaRegistry';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Proventa – Enterprise AI Credit Intelligence SaaS Platform',
  description: 'AI-powered credit scoring, risk assessment, due diligence, and receivables monitoring for banks, distributors, and finance teams.',
  manifest: '/manifest.json',
  themeColor: '#2563eb',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Proventa',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <PwaRegistry />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
