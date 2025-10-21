import type { Metadata } from 'next';
import './globals.css';
import AppHeader from '@/components/layout/AppHeader';

export const metadata: Metadata = {
  title: 'Schoolverse_1',
  description: 'Virtual school platform (MVP)',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <AppHeader />
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
