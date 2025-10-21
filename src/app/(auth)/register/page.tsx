"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useAuthStore } from '@/store/authStore';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(1),
});

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = registerSchema.safeParse({ email, password, displayName });
    if (!parsed.success) {
      setError('入力内容を確認してください');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      // Register
      const reg = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, displayName }),
      });
      const regData = await reg.json();
      if (!reg.ok) {
        setError(regData?.error || '登録に失敗しました');
        return;
      }
      // Auto login
      const login = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const loginData = await login.json();
      if (!login.ok) {
        setError(loginData?.error || '自動ログインに失敗しました');
        return;
      }
      setAuth(loginData.token, loginData.user);
      router.push('/(virtual-space)/classroom');
    } catch {
      setError('ネットワークエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto">
      <h2 className="text-xl font-semibold mb-4">新規登録</h2>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-sm">表示名</label>
          <input className="mt-1 w-full rounded border p-2" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm">メールアドレス</label>
          <input className="mt-1 w-full rounded border p-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm">パスワード</label>
          <input className="mt-1 w-full rounded border p-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={loading} type="submit" className="w-full rounded bg-emerald-600 px-4 py-2 text-white disabled:opacity-50">
          {loading ? '処理中…' : '登録'}
        </button>
      </form>
    </div>
  );
}
