export default function HomePage() {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-xl font-semibold">ようこそ</h2>
        <p className="text-sm text-gray-600 mt-1">
          Schoolverse_1 の初期セットアップ。ログイン後、仮想教室に移動できます。
        </p>
      </section>

      <div className="flex gap-3">
        <a className="rounded bg-blue-600 px-4 py-2 text-white" href="/login">ログイン</a>
        <a className="rounded bg-gray-200 px-4 py-2" href="/register">新規登録</a>
        <a className="rounded bg-emerald-600 px-4 py-2 text-white" href="/classroom">教室へ</a>
      </div>
    </div>
  );
}
