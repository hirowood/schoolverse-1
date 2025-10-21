# Vercel へのデプロイ手順（Schoolverse_1 / MVP）

この手順で GitHub 連携の自動デプロイ（main ブランチ → 本番）を構築します。

## 1. 前提
- リポジトリ: https://github.com/hirowood/schoolverse-1
- main ブランチに初回コミット済み
- Prisma スキーマ: `prisma/schema.prisma`（User モデル利用）

## 2. Vercel プロジェクト作成（GitHub連携）
1. https://vercel.com にログイン
2. 「Add New」→「Project」→ GitHub を選択し、`hirowood/schoolverse-1` を Import
3. Framework は自動で Next.js が選択されます（変更不要）
4. Build & Output Settings:
   - Install Command: `npm install --no-audit --no-fund --legacy-peer-deps`
   - Build Command: `npm run build`
   - Output Directory: （空：Next.js 標準）
   - Root Directory: `/`（ルートのまま）

※ `vercel.json` にも同等設定を記載済みです。

## 3. 環境変数の設定（Project Settings → Environment Variables）
- `DATABASE_URL`（必須）
  - 例: Vercel Postgres を作成して、提供される接続文字列を設定
  - 低負荷のMVPでは通常の接続文字列でOK（必要なら pgbouncer 付与を検討）
- `JWT_SECRET`（必須）
  - 強固なランダム文字列を設定
- `JWT_EXPIRES_IN`（任意）
  - 例: `1d`
- `NEXT_PUBLIC_APP_URL`（任意）
  - 例: `https://schoolverse-1.vercel.app`

追加（任意）:
- `REDIS_URL` は MVP では未使用

## 4. データベース初期化（Prisma）
本番のDBにスキーマを反映します。Vercel のビルド時にマイグレーションを走らせないため、最初に一度だけ実行してください。

方法A（おすすめ）: ローカルから本番DBへマイグレーション
```bash
# .env の DATABASE_URL を本番DBのURLに一時的に差し替え
npx prisma migrate deploy
# もしくは初回なら
npx prisma migrate dev --name init
```

方法B: スキーマをそのまま反映（非推奨だが簡易）
```bash
npx prisma db push
```

実行後、`User` テーブルが作成されます。

## 5. 自動デプロイの確認
- GitHub の main へプッシュ → Vercel で自動ビルド・デプロイ
- 初回デプロイ後、`https://<your-project>.vercel.app` を開く
- API 確認
  - `POST /api/auth/register` → `POST /api/auth/login` → `GET /api/auth/me`

## 6. よくあるポイント
- 依存関係エラー（Next15/React19 の peer 差異）
  - `--legacy-peer-deps` を `vercel.json` / Install Command に設定済み
- Prisma Client がない
  - `@prisma/client` は `dependencies` に追加済み（ビルド時に生成）
- 接続数（Serverless + Postgres）
  - MVP規模では問題になりづらいですが、将来的に Vercel Postgres の Pooled URL へ切替を検討

## 7. 手元での本番相当確認（任意）
Docker の本番構成でビルド/起動:
```bash
npm run docker:prod
```

---
以上で Vercel 連携の自動デプロイを構築できます。
