"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginSchema } from '@/lib/utils/validators';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError('入力内容を確認してください');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'ログインに失敗しました');
        return;
      }
      setAuth(data.token, data.user);
      router.push('/classroom');
    } catch {
      setError('ネットワークエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto">
      <h2 className="text-xl font-semibold mb-4">ログイン</h2>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-sm">メールアドレス</label>
          <input className="mt-1 w-full rounded border p-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm">パスワード</label>
          <input className="mt-1 w-full rounded border p-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={loading} type="submit" className="w-full rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50">
          {loading ? '処理中…' : 'ログイン'}
        </button>
      </form>
    </div>
  );
}
