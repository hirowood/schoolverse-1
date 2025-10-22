"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useAuthBootstrap } from '@/hooks/useAuth';

export default function AppHeader() {
  useAuthBootstrap();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuthStore((state) => ({
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    logout: state.logout,
  }));

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const displayName = user?.displayName || user?.username || user?.email || 'ゲスト';

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
          {isAuthenticated ? (
            <>
              <span className="hidden text-gray-600 sm:inline">{displayName}</span>
              <button
                onClick={handleLogout}
                disabled={isLoading}
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
