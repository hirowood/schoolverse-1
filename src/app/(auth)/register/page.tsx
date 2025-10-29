"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { z } from 'zod';
import ErrorDisplay from '@/components/ui/ErrorDisplay';

// ============================================
// バリデーションスキーマ（バックエンドと統一）
// ============================================

const registerSchema = z.object({
  email: z
    .string()
    .email('有効なメールアドレスを入力してください'),
  
  username: z
    .string()
    .min(3, 'ユーザー名は3文字以上である必要があります')
    .max(20, 'ユーザー名は20文字以内である必要があります')
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'ユーザー名は英数字とアンダースコアのみ使用できます'
    ),
  
  password: z
    .string()
    .min(8, 'パスワードは8文字以上である必要があります')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'パスワードには英小文字、英大文字、数字を含める必要があります'
    ),
  
  displayName: z
    .string()
    .min(1, '表示名は1文字以上である必要があります')
    .max(50, '表示名は50文字以内である必要があります')
    .optional(),
});

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ 
    email: '', 
    username: '', 
    password: '', 
    displayName: '' 
  });
  const [localError, setLocalError] = useState<string | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false); const [error, setError] = useState<string|null>(null);

  const handleChange =
    (key: keyof typeof form) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (error) setError(null);
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
      setIsSubmitting(true);
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setLocalError(data?.message || '登録に失敗しました');
        setIsSubmitting(false);
        return;
      }
      const si = await signIn('credentials', { email: parsed.data.email, password: parsed.data.password, redirect: false });
      if (si?.error) {
        setLocalError('自動ログインに失敗しました');
        setIsSubmitting(false);
        return;
      }
      await fetch('/api/auth/socket-token', { method: 'GET' });
      router.push('/');
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : '登録に失敗しました');
    } finally {
      setIsSubmitting(false);
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
          <p className="mt-1 text-xs text-gray-500">
            オプション（1-50文字）
          </p>
        </div>
        
        <div>
          <label htmlFor="username" className="block text-sm font-medium">
            ユーザー名 *
          </label>
          <input
            id="username"
            className="mt-1 w-full rounded border px-3 py-2"
            value={form.username}
            onChange={handleChange('username')}
            placeholder="taro_yamada"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            3-20文字、英数字とアンダースコアのみ
          </p>
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            メールアドレス *
          </label>
          <input
            id="email"
            className="mt-1 w-full rounded border px-3 py-2"
            type="email"
            value={form.email}
            onChange={handleChange('email')}
            placeholder="taro@example.com"
            autoComplete="email"
            required
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            パスワード *
          </label>
          <input
            id="password"
            className="mt-1 w-full rounded border px-3 py-2"
            type="password"
            value={form.password}
            onChange={handleChange('password')}
            placeholder="Password123"
            autoComplete="new-password"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            8文字以上、英小文字・英大文字・数字を含む
          </p>
        </div>
        
        {/* 🔧 修正: ErrorDisplayコンポーネントを使用 */}
        <ErrorDisplay error={localError ?? null} />
        
        <button
          disabled={isSubmitting}
          type="submit"
          className="w-full rounded bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {isSubmitting ? '処理中…' : '登録'}
        </button>
      </form>
    </div>
  );
}


