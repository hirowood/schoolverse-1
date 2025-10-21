# Schoolverse_1

仮想学校プラットフォーム（MVP）用リポジトリの初期セットアップ。

## セットアップ概要
- Next.js 15 + React 19 + TypeScript
- Prisma + PostgreSQL, Redis（Docker Compose）
- Zustand / Socket.io クライアントの土台
- Tailwind CSS セットアップ

## 迅速起動（開発）
1. `.env` を `.env.example` から作成し、値を設定
2. Docker を起動（DB/Redis）: `docker compose up -d db redis`
3. 依存関係をインストール: `npm install`
4. Prisma 生成: `npm run prisma:generate`
5. Dev サーバー起動: `npm run dev` （http://localhost:3000）

※ ネットワーク制限下では依存関係のインストールや Docker ビルドが失敗する可能性があります。まずはファイル構造とスクリプトを確認してください。

## コマンド
- 開発: `npm run dev`
- 本番ビルド: `npm run build && npm run start`
- Prisma 生成: `npm run prisma:generate`
- Prisma マイグレーション: `npm run prisma:migrate`
- Lint: `npm run lint`
- Format: `npm run format`

## ディレクトリ構造（抜粋）
```
prisma/
  schema.prisma
src/
  app/
    (auth)/{login,register}/page.tsx
    (virtual-space)/classroom/page.tsx
    api/health/route.ts
    globals.css
    layout.tsx
    page.tsx
  components/
    canvas/VirtualSpace.tsx
  hooks/
    useKeyboard.ts
  lib/
    socket/{events.ts,socketClient.ts}
    utils/validators.ts
  store/
    userStore.ts chatStore.ts spaceStore.ts
  types/
    user.ts message.ts room.ts events.ts
```

## Docker
- 開発用: `docker-compose.dev.yml`（`Dockerfile.dev` 使用、ホットリロード）
  - 起動: `npm run docker:dev`
  - 終了: `npm run docker:dev:down`
- 本番用: `docker-compose.prod.yml`（`Dockerfile` マルチステージ、本番ビルド）
  - 起動: `npm run docker:prod`
  - 終了: `npm run docker:prod:down`
- 環境変数:
  - 開発: `.env.local`（ホスト） / `.env.docker.dev`（コンテナ）
  - 本番: `.env.production.example`（テンプレート） / `.env.docker.prod`（コンテナ）

## 参考
- 要求定義書の「次のアクション」を満たす初期土台を作成済み。今後、Socket.io サーバーや WebRTC、Canvas 機能を段階的に拡張してください。
