"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginSchema } from '@/lib/utils/validators';
import { useAuthStore } from '@/store/authStore';
import ErrorDisplay from '@/components/ui/ErrorDisplay';

export default function LoginPage() {
  const router = useRouter();
  const [localError, setLocalError] = useState<string | null>(null);
  const [form, setForm] = useState({ email: '', password: '' });
  const { login, isLoading, error, clearError } = useAuthStore((state) => ({
    login: state.login,
    isLoading: state.isLoading,
    error: state.error,
    clearError: state.clearError,
  }));

  const handleChange = (key: 'email' | 'password') => (event: React.ChangeEvent<HTMLInputElement>) => {
    if (error) clearError();
    if (localError) setLocalError(null);
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = loginSchema.safeParse(form);
    if (!parsed.success) {
      setLocalError('入力内容を確認してください。');
      return;
    }

    try {
      await login(parsed.data.email, parsed.data.password);
      router.push('/classroom');
    } catch (err) {
      if (err instanceof Error) {
        setLocalError(err.message);
      } else {
        setLocalError('ログインに失敗しました。');
      }
    }
  };

  return (
    <div className="mx-auto max-w-sm">
      <h2 className="mb-4 text-xl font-semibold">ログイン</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            メールアドレス
          </label>
          <input
            id="email"
            className="mt-1 w-full rounded border px-3 py-2"
            type="email"
            value={form.email}
            onChange={handleChange('email')}
            autoComplete="email"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            パスワード
          </label>
          <input
            id="password"
            className="mt-1 w-full rounded border px-3 py-2"
            type="password"
            value={form.password}
            onChange={handleChange('password')}
            autoComplete="current-password"
            required
          />
        </div>
        {/* 🔧 修正: ErrorDisplayコンポーネントを使用 */}
        <ErrorDisplay error={localError ?? error} />
        <button
          disabled={isLoading}
          type="submit"
          className="w-full rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {isLoading ? '処理中…' : 'ログイン'}
        </button>
      </form>
    </div>
  );
}
