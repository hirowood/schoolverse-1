"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useAuthStore } from '@/store/authStore';

const registerSchema = z.object({
  email: z.string().email(),
  username: z
    .string()
    .min(3, 'ユーザー名は3文字以上で入力してください。')
    .max(20, 'ユーザー名は20文字以内で入力してください。')
    .regex(/^[a-zA-Z0-9_]+$/, 'ユーザー名は英数字とアンダースコアのみ使用できます。'),
  password: z
    .string()
    .min(8, 'パスワードは8文字以上で入力してください。'),
  displayName: z.string().min(1, '表示名を入力してください。').optional(),
});

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', username: '', password: '', displayName: '' });
  const [localError, setLocalError] = useState<string | null>(null);
  const { signup, isLoading, error, clearError } = useAuthStore((state) => ({
    signup: state.signup,
    isLoading: state.isLoading,
    error: state.error,
    clearError: state.clearError,
  }));

  const handleChange =
    (key: keyof typeof form) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (error) clearError();
      if (localError) setLocalError(null);
      setForm((prev) => ({ ...prev, [key]: event.target.value }));
    };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = registerSchema.safeParse({
      email: form.email,
      username: form.username,
      password: form.password,
      displayName: form.displayName?.trim() || undefined,
    });
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? '入力内容を確認してください。';
      setLocalError(message);
      return;
    }

    try {
      await signup(parsed.data);
      router.push('/classroom');
    } catch (err) {
      if (err instanceof Error) {
        setLocalError(err.message);
      } else {
        setLocalError('登録に失敗しました。');
      }
    }
  };

  return (
    <div className="mx-auto max-w-sm">
      <h2 className="mb-4 text-xl font-semibold">新規登録</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium">
            表示名
          </label>
          <input
            id="displayName"
            className="mt-1 w-full rounded border px-3 py-2"
            value={form.displayName}
            onChange={handleChange('displayName')}
            placeholder="山田 太郎"
          />
        </div>
        <div>
          <label htmlFor="username" className="block text-sm font-medium">
            ユーザー名
          </label>
          <input
            id="username"
            className="mt-1 w-full rounded border px-3 py-2"
            value={form.username}
            onChange={handleChange('username')}
            placeholder="taro_yamada"
            required
          />
        </div>
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
            autoComplete="new-password"
            required
          />
        </div>
        {(localError || error) && <p className="text-sm text-red-600">{localError ?? error}</p>}
        <button
          disabled={isLoading}
          type="submit"
          className="w-full rounded bg-emerald-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {isLoading ? '処理中…' : '登録'}
        </button>
      </form>
    </div>
  );
}
