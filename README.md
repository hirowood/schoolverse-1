# EduVerse (schoolverse_1)

通学困難な生徒を支援する 3D メタバース学習プラットフォーム。  
`docs/requirements.md` に定義された **v2.0 / v2.1.0** の拡張要求 (ビデオ会議・課題提出/採点・多分野カリキュラム・デジタルノート・OCR・AIアシスタント) を段階的に実装する前提で、基本設計・詳細設計・インフラ構成を整備しています。

---

## 📁 リポジトリ構成概要

| ディレクトリ | 役割 (Phase 1〜4 で拡張予定) |
|--------------|-------------------------------|
| `src/app` | Next.js App Router (学習空間、ダッシュボード、API Routes) |
| `src/components` | UI コンポーネント (`features/`, `auth/`, `canvas/` など) |
| `src/services` | ドメインサービス層 (認証、課題、カリキュラム、会議、ノート、AI/OCR) |
| `src/repositories` | Prisma ラッパ (DB アクセスを集約) |
| `src/lib` | 共通ユーティリティ (auth, realtime, validators, AI/OCR クライアント) |
| `src/store` | Zustand ストア |
| `docs/requirements.md` | 仕様・WBS・ロードマップ (最新の要求定義) |
| `docs/DETAILED_DESIGN.md` | 詳細設計 (コメント指針、サービス分割) |
| `docs/DOCKER_SETUP.md` | Docker / インフラ運用ガイド |

---

## 🧑‍🔧 セットアップ

### 必要環境
- Node.js **20.x**
- npm (または pnpm / yarn)
- Docker (PostgreSQL・Redis をコンテナで起動する場合)

### 依存パッケージ

```bash
npm install
```

### 環境変数

`.env.local` を `.env.example` を参考に作成し、以下を設定してください (一部はフェーズ後半で使用)。

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/eduverse"
REDIS_URL="redis://localhost:6379"
ACCESS_TOKEN_SECRET="dev_access_secret"
REFRESH_TOKEN_SECRET="dev_refresh_secret"
OPENAI_API_KEY="(Phase4.5: AI要約/学習アドバイスで使用)"
GOOGLE_APPLICATION_CREDENTIALS="(Phase4.5: OCRで使用。サービスアカウントJSONへのパス)"
```

---

## 🛠️ 開発コマンド

| コマンド | 説明 |
|----------|------|
| `npm run dev` | Next.js 開発サーバー (http://localhost:3000) |
| `npm run rt:dev` | Socket.io realtime サーバー (`server/index.ts`) |
| `npm run lint` | ESLint (TypeScript / React) |
| `npm run type-check` | TypeScript の型チェック |
| `npm run build` / `npm run start` | 本番ビルド & 起動 |
| `npx prisma migrate dev` / `npx prisma studio` | DB マイグレーション / Prisma Studio |

Phase 2 以降で導入する mediasoup SFU / AI ワーカー等は `docs/DOCKER_SETUP.md` に準備手順を記載しています。

---

## 📡 API (Phase 1)

```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
POST /api/auth/refresh
GET  /api/auth/me

GET  /api/messages        (チャット一覧)
POST /api/messages        (チャット投稿)
GET  /api/socket          (Socket クライアント設定)
```

Phase 2 (ビデオ会議), Phase 3 (課題), Phase 4 (カリキュラム), Phase 3.5/4.5 (ノート/OCR/AI) の API は順次追加されます。最新仕様は `docs/requirements.md` を参照してください。

---

## 🐳 Docker / インフラ

開発用 Compose ファイル: `docker-compose.dev.yml`  

| サービス | 役割 | ポート |
|----------|------|--------|
| `db` | PostgreSQL 15 | 5432 |
| `redis` | Redis (Upstash 相当) | 6379 |
| `app` | Next.js 開発サーバー (ホットリロード) | 3000 |
| `rt` | Socket.io realtime サーバー | 3001 |

起動例:

```bash
docker compose -f docker-compose.dev.yml up -d db redis
# Next.js / realtime はローカル Node.js で起動する想定
```

Phase 2 以降で mediasoup SFU / AI / OCR ワーカーをコンテナ追加する際は `docs/DOCKER_SETUP.md` の指針に従ってください。

---

## 🗺️ ロードマップ概要

| 期間 | フェーズ / マイルストーン | 主な成果物 |
|------|---------------------------|------------|
| 2025-10〜11 | Phase 1 Hardening | 認証・3D空間の性能/ドキュメント整備 |
| 2025-12〜2026-01 | Phase 2 Beta | ビデオ会議 (WebRTC) / ホワイトボード / 録画 |
| 2026-02〜03 | Phase 3 Alpha | 課題提出・採点 / AI 採点アシスト |
| 2026-03〜04 | Phase 4 Pilot | カリキュラム CMS / 学習進捗レコメンド |
| 2026-03.5〜04.5 | Phase 3.5/4.5 PoC | デジタルノート / OCR / AI 思考整理 |
| 2026-05〜06 | Phase 5 RC→GA | インフラ整備 / セキュリティ監査 / リリース |

詳細な WBS は `docs/requirements.md` を参照してください。

---

## 📝 追加ドキュメント

- `docs/requirements.md` … 仕様/WBS/ロードマップ (常に最新に保つ)  
- `docs/DETAILED_DESIGN.md` … サービス構造、コメント方針、再利用モジュール設計  
- `docs/DOCKER_SETUP.md` … Compose の拡張計画 (Phase 2 以降の SFU/AI/OCR サービス)  

Pull Request を作成する際は **該当ドキュメントの更新** もセットで行い、レビュー時に確認できるようにしてください。
