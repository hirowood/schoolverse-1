# EduVerse (schoolverse_1)

通学困難な生徒を支援する 3D メタバース学習プラットフォーム。  
`docs/requirements.md` に定義された **v2.0 / v2.1.0** の拡張要求 (ビデオ会議・課題提出/採点・多分野カリキュラム・デジタルノート・OCR・AIアシスタント) を段階的に実装する前提で、基本設計・詳細設計・インフラ構成を整備しています。

---

## 🚀 クイックスタート

### Windows ユーザー向け

```bash
# ワンコマンドセットアップ
setup.bat
```

### 手動セットアップ

```bash
# 1. 依存関係のインストール
npm install

# 2. Prismaクライアント生成（npm installで自動実行）
npm run prisma:generate

# 3. .env.local を作成
copy .env.example .env.local

# 4. データベース接続情報を編集
# .env.local の DATABASE_URL を設定

# 5. データベースマイグレーション
npm run prisma:migrate

# 6. 開発サーバー起動
npm run dev
```

### ⚠️ Prisma エラーが発生した場合

`@prisma/client did not initialize yet` エラーが表示される場合:

**Windows:**
```bash
fix-prisma.bat
```

**手動修正:**
```bash
# 1. Prismaクライアント再生成
npm run prisma:generate

# 2. ビルドキャッシュをクリーン
npm run clean:next

# 3. 開発サーバー再起動
npm run dev
```

**詳細なトラブルシューティングは `SETUP.md` を参照してください。**

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
| `SETUP.md` | 詳細セットアップガイド & トラブルシューティング |

---

## 🧑‍🔧 セットアップ

### 必要環境
- Node.js **20.x**
- npm (または pnpm / yarn)
- PostgreSQL **14以上**
- Docker (PostgreSQL・Redis をコンテナで起動する場合)

### 依存パッケージ

```bash
npm install
```

**重要**: `npm install` 実行時に自動的に `prisma generate` が実行されます。

### 環境変数

`.env.local` を `.env.example` を参考に作成し、以下を設定してください (一部はフェーズ後半で使用)。

```bash
# データベース接続（必須）
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/schoolverse?schema=public"

# Redis
REDIS_URL="redis://localhost:6379"

# 認証（必須）
JWT_SECRET="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2"
JWT_EXPIRES_IN="15m"
REFRESH_TOKEN_TTL_SECONDS="604800"

# Socket.io（必須）
NEXT_PUBLIC_SOCKET_URL="http://localhost:3001"

# OpenAI（Phase 4.5: AI要約/学習アドバイスで使用）
OPENAI_API_KEY="(Phase4.5: AI要約/学習アドバイスで使用)"

# Google Cloud（Phase4.5: OCRで使用）
GOOGLE_APPLICATION_CREDENTIALS="(Phase4.5: OCRで使用。サービスアカウントJSONへのパス)"

# mediasoup（Phase 2: ビデオ会議で使用）
NEXT_PUBLIC_MEDIASOUP_URL="http://localhost:4001"
MEDIASOUP_PORT="4001"
```

---

## 🛠️ 開発コマンド

### 基本コマンド

| コマンド | 説明 |
|----------|------|
| `npm run dev` | Next.js 開発サーバー (http://localhost:3000) |
| `npm run build` | 本番ビルド |
| `npm run start` | 本番サーバー起動 |
| `npm run lint` | ESLint (TypeScript / React) |
| `npm run type-check` | TypeScript の型チェック |
| `npm run format` | Prettier によるコード整形 |

### Prisma コマンド

| コマンド | 説明 |
|----------|------|
| `npm run prisma:generate` | Prismaクライアント生成 |
| `npm run prisma:migrate` | データベースマイグレーション |
| `npm run prisma:studio` | Prisma Studio (DB GUI) |

### クリーン & リセット

| コマンド | 説明 |
|----------|------|
| `npm run clean:next` | .next フォルダのみ削除 |
| `npm run clean:modules` | node_modules のみ削除 |
| `npm run clean:all` | .next と node_modules を削除 |
| `npm run clean:dev` | クリーン後に開発サーバー起動 |
| `npm run clean:install` | 完全リセット（推奨） |

### リアルタイム通信

| コマンド | 説明 |
|----------|------|
| `npm run rt:dev` | Socket.io realtime サーバー (`server/index.ts`) |
| `npm run rt:mediasoup` | WebRTC SFU / mediasoup シグナリング (`server/rtc/mediasoupServer.ts`) |

### テスト

| コマンド | 説明 |
|----------|------|
| `npm run test` | テスト実行（watch モード） |
| `npm run test:unit` | 単体テスト（1回のみ） |
| `npm run test:coverage` | カバレッジ付きテスト |
| `npm run test:e2e` | E2Eテスト（Playwright） |

Phase 2 以降で導入する mediasoup SFU / AI ワーカー等は `docs/DOCKER_SETUP.md` に準備手順を記載しています。

---

## 認証 / API 概要（NextAuth）

```
POST /api/auth/[...nextauth]    # Auth.js (NextAuth) のエンドポイント
GET  /api/auth/socket-token     # RTサーバー用JWTを発行（15分TTL, sv_access_token Cookie）
```

旧エンドポイント（/api/auth/login|logout|refresh）は廃止しました。UIからは next-auth/react の `signIn` / `signOut` を利用してください。

### E2E テスト（Playwright）向け設定

```
# 認証ミドルウェアをバイパス
NEXT_PUBLIC_E2E=1 npm run test:e2e
```

テストでは `tests/playwright/utils/auth.ts` の `signInViaUI` を利用してUI経由でログインし、`/api/auth/socket-token` でRT用トークンCookie（sv_access_token）を発行します。

#### CI（GitHub Actions）例: E2E 実行ジョブ

```
name: E2E
on: [push, pull_request]
jobs:
  playwright:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx playwright install --with-deps
      - name: Run E2E with middleware bypass
        env:
          NEXT_PUBLIC_E2E: '1'
        run: npm run test:e2e
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
# Docker で DB と Redis を起動
docker compose -f docker-compose.dev.yml up -d db redis

# Next.js / realtime はローカル Node.js で起動
npm run dev
npm run rt:dev
```

完全な Docker セットアップ:

```bash
# 全てのサービスを Docker で起動
npm run docker:dev

# 停止
npm run docker:dev:down
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

## ✅ テスト & ベンチマーク概要

| カテゴリ | コマンド | 備考 |
|----------|----------|------|
| 単体テスト (チャット/ノート) | `npm run test:unit`<br/>`npx vitest run tests/services/chatService.test.ts tests/services/noteService.test.ts` | 仮想空間モック (`tests/e2e/virtualSpace.test.tsx`) は既知の制約により失敗することがあります |
| パフォーマンス・スモーク | `npx vitest run tests/perf/notebookPerformance.test.ts` | `NoteService` の平均応答時間が 1〜2ms 未満であることを継続確認 |
| E2E 統合フロー | `npx playwright install` (初回のみ)<br/>`npx playwright test tests/playwright/mvp-flow.spec.ts`<br/>_サーバーを起動せずに実行する場合_: `PLAYWRIGHT_SKIP_WEB_SERVER=1 npx playwright test tests/playwright/mvp-flow.spec.ts` | Notes → Chat → Virtual Space のハッピーパスを通しで検証 |

詳細なレポートは `docs/testing-report.md` を参照してください。

---

## 🐛 トラブルシューティング

### よくある問題

#### 1. `@prisma/client did not initialize yet` エラー

**原因**: Prismaクライアントが生成されていない

**解決法**:
```bash
# Windows
fix-prisma.bat

# 手動
npm run prisma:generate
npm run clean:next
npm run dev
```

#### 2. ポート競合エラー

**原因**: ポート 3000 または 3001 が既に使用中

**解決法**:
```bash
# Windows でポートを確認
netstat -ano | findstr :3000

# プロセスを終了
taskkill /PID <プロセスID> /F

# または別のポートを使用
npm run dev -- -p 3001
```

#### 3. データベース接続エラー

**原因**: PostgreSQL が起動していないか、接続情報が間違っている

**解決法**:
1. PostgreSQL サービスが起動しているか確認
2. `.env.local` の `DATABASE_URL` を確認
3. Docker を使用している場合: `docker compose -f docker-compose.dev.yml up -d db`

#### 4. node_modules 破損

**原因**: npm install が中断されたか、依存関係の競合

**解決法**:
```bash
# 完全リセット
npm run clean:install
```

**詳細なトラブルシューティングは `SETUP.md` を参照してください。**

---

## 📝 追加ドキュメント

| ドキュメント | 内容 |
|-------------|------|
| `SETUP.md` | 詳細セットアップガイド & トラブルシューティング |
| `docs/requirements.md` | 仕様/WBS/ロードマップ (常に最新に保つ) |
| `docs/DETAILED_DESIGN.md` | サービス構造、コメント方針、再利用モジュール設計 |
| `docs/DOCKER_SETUP.md` | Compose の拡張計画 (Phase 2 以降の SFU/AI/OCR サービス) |
| `docs/testing-report.md` | テスト結果レポート |

Pull Request を作成する際は **該当ドキュメントの更新** もセットで行い、レビュー時に確認できるようにしてください。

---

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. Pull Request を作成

---

## 📄 ライセンス

This project is licensed under the MIT License.

---

## 📞 サポート

問題が発生した場合は、以下を確認してください:

1. `SETUP.md` のトラブルシューティングセクション
2. GitHub Issues で既知の問題を検索
3. 新しい Issue を作成（再現手順と環境情報を含める）

---

**最終更新**: 2025年10月25日  
**バージョン**: 0.1.0
