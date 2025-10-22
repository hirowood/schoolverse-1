# Docker / インフラ運用メモ (v2.0 / v2.1.0 計画)

本ドキュメントは `docs/requirements.md` の WBS・ロードマップに沿って、開発・検証環境を Docker Compose でどう拡張していくかを整理したものです。  
Pull Request でインフラ周辺を更新する際は、本メモを併せて更新してください。

---

## 1. 現在の Compose (Phase 1 基準)

`docker-compose.dev.yml` には以下のサービスが定義されています:

| サービス | ポート | 説明 |
|----------|--------|------|
| `db` | 5432 | PostgreSQL 15 (Prisma 用) |
| `redis` | 6379 | Redis (セッション・Rate Limit 用) |
| `app` | 3000 | Next.js 開発サーバー (ボリュームマウントでホットリロード) |
| `rt` | 3001 | Socket.io realtime サーバー (`server/index.ts`) |

> Next.js / Socket.io はローカルの Node.js で起動した方が開発サイクルが速いため、コンテナ化は主に DB/Redis 用として活用しています。

起動例:

```bash
docker compose -f docker-compose.dev.yml up -d db redis
```

終了:

```bash
docker compose -f docker-compose.dev.yml down
```

---

## 2. フェーズ別追加サービス計画

| フェーズ | 追加サービス案 | メモ |
|----------|----------------|------|
| Phase 2 (ビデオ会議) | `sfu` (mediasoup サーバー) | Node.js アプリ。最低限 1CPU/512MB 以上。ICE/STUN/TURN 設定が必要。 |
| Phase 3 (課題管理) | `files` (MinIO など) | Supabase Storage を使う場合は省略。ローカル開発では `minio` を採用予定。 |
| Phase 3.5 (デジタルノート) | `notes-worker` | PDF 変換・画像処理向けのジョブワーカー (sharp / pdf-lib など)。 |
| Phase 4.5 (AI/OCR) | `ai-proxy`, `ocr-worker` | OpenAI / Google Vision の呼び出しを集中管理するプロキシ。Rate Limit や API Key 安全管理のため。 |
| Phase 5 (監視) | `prometheus`, `grafana` | Render/Vercel のログに加えて、独自メトリクスを収集。 |

> これらはまだ `docker-compose.dev.yml` には追加されていません。実装着手フェーズで必要最低限の構成を追加し、本ファイルを更新します。

---

## 3. 開発フロー例

1. **Phase 1 Hardening**  
   - `db`, `redis` をコンテナで起動  
   - Next.js / Socket.io をローカル Node.js で起動  
   - Prisma マイグレーション → `npx prisma migrate dev`

2. **Phase 2 (ビデオ会議)**  
   - `sfu` サービス (mediasoup) を追加する予定  
   - TURN/STUN サーバー (coturn) を別途用意する場合は Compose で定義  

3. **Phase 3 (課題・評価)**  
   - Supabase Storage を使わない場合は `minio` コンテナを追加 (S3 API 互換)  
   - ファイル保存先は環境変数 `FILE_STORAGE_ENDPOINT` で切り替え  

4. **Phase 3.5/4.5 (ノート/OCR/AI)**  
   - 画像処理/AI 推論をワーカーコンテナで実行  
   - キューイング (Redis Streams など) を利用し、`docker-compose.dev.yml` でキュー専用サービスを立ち上げる  

5. **Phase 5 (運用準備)**  
   - 本番相当の Compose (`docker-compose.prod.yml`) を再定義  
   - CI/CD (GitHub Actions) で Docker ビルド・プッシュを自動化  

---

## 4. 環境変数整理 (フェーズ別)

| 変数 | フェーズ | 用途 |
|------|----------|------|
| `DATABASE_URL` | Phase 1〜 | PostgreSQL |
| `REDIS_URL` | Phase 1〜 | Redis |
| `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET` | Phase 1〜 | JWT |
| `MEDIASOUP_LISTEN_IP`, `MEDIASOUP_ANNOUNCED_IP` | Phase 2 | SFU |
| `TURN_SERVER` | Phase 2 | P2P  fallback |
| `MINIO_ENDPOINT` / `MINIO_ACCESS_KEY` | Phase 3 | 課題ファイル保存 |
| `OPENAI_API_KEY` | Phase 3.5/4.5 | AI 要約/採点 |
| `GOOGLE_APPLICATION_CREDENTIALS` | Phase 4.5 | OCR (Vision API) |

`.env.example` を段階的に更新し、必要なキーと説明をコメントで追加してください。

---

## 5. 運用上の注意

- 無料枠サービスを利用するため、**コストが発生する操作は禁止** (本番相当環境に移行するまでは課金が発生しない Plan を利用)。  
- 新規サービスを Compose に追加する場合は以下を PR に含める:  
  1. `docker-compose.dev.yml` 更新  
  2. `docs/DOCKER_SETUP.md` 更新  
  3. 必要な環境変数説明 (`.env.example`, README)  
- 大規模な構成変更 (例: Supabase 利用開始) は `docs/requirements.md` のスコープにも反映すること。  

---

## 6. 今後の拡張 TODO

- [ ] Phase 2 着手時に `sfu` / `coturn` サービス定義を追加し、起動手順を追記する。  
- [ ] Phase 3 で `minio` などのオブジェクトストレージを導入するか検討。Supabase Storage を採用する場合でもローカル開発手順を記載する。  
- [ ] Phase 3.5/4.5 のワーカー構成 (ノート変換 / AI推論) を決定し、キュー構成をドキュメント化する。  
- [ ] Phase 5 で監視・アラート指針を明記し、プロダクション Compose を整備する。  

---

必要に応じてこのファイルを更新し、チーム内でインフラ関連の共通認識を保ってください。 Pull Request には「どのフェーズの変更か」「追加サービスの役割」を明記するとレビューがスムーズです。  
