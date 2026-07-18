import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Proventa – Enterprise AI Credit Intelligence SaaS Platform',
  description: 'AI-powered credit scoring, risk assessment, due diligence, and receivables monitoring for banks, distributors, and finance teams.',
};

import AuthProvider from '@/components/AuthProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
