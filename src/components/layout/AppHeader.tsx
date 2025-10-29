"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut, signIn } from 'next-auth/react';
import type { SessionUser } from '@/types/session';
// replaced authStore with NextAuth
// useAuthBootstrap removed

export default function AppHeader() {
  
  const router = useRouter();
  const { data: session, status } = useSession();
  const user = session?.user as SessionUser | undefined;

  const handleLogout = async () => { await signOut({ redirect: false }); router.push('/login'); };

  const displayName = user?.displayName || user?.name || user?.email || 'ゲスト';

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <h1 className="font-semibold">
          <Link href="/">Schoolverse_1</Link>
        </h1>
        <nav className="flex items-center space-x-4 text-sm">
          <Link className="hover:underline" href="/">
            Home
          </Link>
          <Link className="hover:underline" href="/classroom">
            Classroom
          </Link>
          <Link className="hover:underline" href="/notes">
            Notes
          </Link>
          {status === 'authenticated' ? (
            <>
              <span className="hidden text-gray-600 sm:inline">{displayName}</span>
              <button
                onClick={handleLogout}
                disabled={status === 'loading'}
                className="rounded bg-gray-200 px-3 py-1"
              >
                ログアウト
              </button>
            </>
          ) : (
            <>
              <Link className="rounded bg-blue-600 px-3 py-1 text-white" href="/login">
                ログイン
              </Link>
              <Link className="rounded bg-gray-200 px-3 py-1" href="/register">
                登録
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

