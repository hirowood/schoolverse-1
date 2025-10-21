"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

export default function AppHeader() {
  const router = useRouter();
  const { user, token, restore, logout } = useAuthStore();

  useEffect(() => {
    restore();
  }, [restore]);

  const onLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    logout();
    router.push('/login');
  };

  return (
    <header className="border-b bg-white">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        <h1 className="font-semibold"><Link href="/">Schoolverse_1</Link></h1>
        <nav className="text-sm space-x-4 flex items-center">
          <Link className="hover:underline" href="/">Home</Link>
          <Link className="hover:underline" href="/classroom">Classroom</Link>
          {token ? (
            <>
              <span className="text-gray-600 hidden sm:inline">{user?.displayName}</span>
              <button onClick={onLogout} className="rounded bg-gray-200 px-3 py-1">ログアウト</button>
            </>
          ) : (
            <>
              <Link className="rounded bg-blue-600 px-3 py-1 text-white" href="/login">ログイン</Link>
              <Link className="rounded bg-gray-200 px-3 py-1" href="/register">登録</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
