import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Schoolverse_1',
  description: 'Virtual school platform (MVP)',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <header className="border-b bg-white">
          <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
            <h1 className="font-semibold">Schoolverse_1</h1>
            <nav className="text-sm space-x-4">
              <a href="/" className="hover:underline">Home</a>
              <a href="/(auth)/login" className="hover:underline">Login</a>
              <a href="/(virtual-space)/classroom" className="hover:underline">Classroom</a>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
