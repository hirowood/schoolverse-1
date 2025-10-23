# AI 機能 (F064) 実装連携メモ - バックエンド向け共有

## 1. エンドポイント概要

| エンドポイント | メソッド | 用途 | 特記事項 |
|----------------|----------|------|-----------|
| `/api/notes/{noteId}/ai/summary` | POST | ノート本文を要約して返却 | OpenAI JSON Mode で逐次応答 (SSE)。 |
| `/api/notes/{noteId}/ai/mindmap` | POST | マインドマップ用ノード/エッジ生成 | Summary → MindMap フローの単体実行。 |
| `/api/notes/{noteId}/ai/advice` | POST | 学習アドバイス (プラン/リソース/ウォームアップ) | 出力 JSON Schema あり。 |
| `/api/notes/{noteId}/ai/batch` | POST | 上記 3 タスクを一括処理 | Upstash キュー投入→非同期処理。 |
| `/api/notes/{noteId}/ai/jobs/{jobId}` | GET | バッチ処理の状態参照 | queued / processing / failed / completed。 |

### 共通仕様
- 認証: Supabase JWT (既存 API と同様)。
- リクエスト: `noteId`, `pageIds[]`, `subject`, `grade`, `focusTopics[]`, `targetExamDate` を JSON で渡す。
- レスポンス: `data`, `confidence`, `cacheStatus` を含む標準ラッパーへ統一。
- Rate Limit: ユーザーあたり 1 分 6 リクエスト (Upstash)。

## 2. バックエンド実装タスク

| タスク | 担当 | メモ | 期限(目安) |
|--------|------|------|-------------|
| API ルーティング追加 | BE | App Router の `/api/notes/[noteId]/ai/*` ディレクトリ作成。 | Sprint 開始日 |
| サービスレイヤ実装 | BE | `src/services/aiAgentService.ts` と `mindmapBuilder.ts` の雛形作成。 | Sprint 1 週目 |
| Upstash キュー設定 | BE/Infra | Stream + Rate-Limit ルール設定。ステータスは Redis Hash 管理。 | Sprint 1 週目 |
| JSON Schema 契約 | BE | `docs/contracts/ai-responses.json` を公開し ajv で検証。 | Sprint 1 週目 |
| OpenAI Secrets 展開 | Infra | `OPENAI_API_KEY` を Render/Vercel Secret に登録、ワーカーから env 経由取得。 | Sprint 開始前 |
| テスト追加 | BE | Vitest (サービス) + Playwright (E2E) シナリオ実装。 | Sprint 2 週目 |

## 3. 実装スプリント提案 (2 週間)

### Sprint 1
1. エンドポイント scaffold + 型定義
2. OpenAI ラッパー (summary) 実装 & 単体テスト
3. Upstash キューセットアップ・batch パイプライン雛形

### Sprint 2
1. mindmapBuilder / advice 生成ロジック
2. SSE ストリーミングと UI フィードバック API
3. レート制限・キャッシュ・監視アラート追加
4. Playwright/E2E シナリオ整備

## 4. 共有用メッセージ（Slack 下書き）

```
@backend-team  
F064 (AI要約・マインドマップ・学習アドバイス) のエンドポイント設計を docs/coordination/ai-endpoints-sync.md にまとめました。

✅ 実装ポイント
- `/api/notes/{noteId}/ai/{summary|mindmap|advice|batch}` の 4 系列
- OpenAI ラッパー + Upstash キュー構成
- JSON Schema (docs/contracts/ai-responses.json) で応答検証

🗓️ 提案スプリント: 2 週間 (詳細はドキュメント参照)

Secrets 展開やキュー設定の前提も書いているので、次スプリント計画に組み込み可否を確認いただけると助かります！  
質問や懸念点があればこのスレッドでお願いします 🙏
```

## 5. 次アクション
- [ ] BE: スプリント計画に反映可否を回答 (今週中)
- [ ] Infra: OPENAI Secrets の配布手順と Upstash 権限確認
- [ ] Product: 要約/計画の SLA (応答時間 max, 再実行ポリシー) を定義
- [ ] QA: 新規エンドポイント向けテストケースをテスト計画に追加

---

更新履歴  
- 2025-10-24: 初版作成 (エンドポイント概要と連携タスク)
