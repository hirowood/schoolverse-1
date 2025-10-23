# ノートインサイトダッシュボード (F065) 実装連携メモ

## 1. バックエンドタスク

| タスク | 担当 | 詳細 | 期限目安 |
|--------|------|------|-----------|
| Summary API 実装 | BE | `GET /api/insights/notes/summary` を App Router で実装。今週/先週/今月の KPI を返す。 | Sprint 開始 +5日 |
| AI 利用状況 API | BE | `GET /api/insights/notes/ai` (summaryCount / mindmapCount / adviceCount / reuseRate)。 | Sprint 開始 +7日 |
| 共有状況 API | BE | `GET /api/insights/notes/shared` (sharedWithTeachers / sharedWithPeers / publicLinks / viewerCount)。 | Sprint 開始 +7日 |
| 集計 Edge Function | BE | Supabase Edge Function で 1h ごとに `note_insights_daily` テーブルへ集計。Cron 設定も含む。 | Sprint 中盤 |
| Redis キャッシュフック | BE | Upstash Redis へ 10 分 TTL でキャッシュし、ノート/AI 更新時に `invalidateInsightsCache(noteId)` を発火。 | Sprint 中盤 |
| Export API | BE | `GET /api/insights/export.csv` で現在フィルタを反映した CSV をストリーミング返却。 | Sprint 終盤 |

### メモ
- テーブル: `note_insights_daily` (date, user_id, total_notes, notes_with_ai, shared_count, avg_completion_minutes, keywords JSONB)。
- Edge Function から Supabase Service Role を使用 (env `SUPABASE_SERVICE_KEY`)。
- 429 対策: Upstash rate limit 6 req/min (ユーザー単位) + exponential backoff。

## 2. フロントエンドタスク

| タスク | 担当 | 詳細 | 期限目安 |
|--------|------|------|-----------|
| Zustand ストア実装 | FE | `insightsStore` を作成。SWR パターン + フィルタ(State machine) を構築。 | Sprint 開始 +5日 |
| KPI/グラフ UI | FE | `InsightsDashboard.tsx` (KPI カード + Word Cloud + Line + Radar)。レスポンシブ対応。 | Sprint 中盤 |
| Recent Activity リスト | FE | Shared の SSE ログをテーブル表示。再試行ボタン実装。 | Sprint 中盤 |
| CSV Export & 共有モーダル | FE | Export ボタン + `/api/insights/share` 呼び出しモーダル。 | Sprint 終盤 |
| Playwright テスト | FE | フィルタ操作・CSV Export・共有リンク生成シナリオ。 | Sprint 終盤 |

### ライブラリ
- Chart: `@tanstack/react-charts` + `d3-cloud` (word cloud)。
- UI: shadcn/ui Card・Badge・Alert。
- Diff 表示は既存 `ai-insights-ui.md` のコンポーネントを流用。

## 3. インフラ設定

| タスク | 担当 | 詳細 | 期限目安 |
|--------|------|------|-----------|
| Upstash Redis セットアップ | Infra | insights 用に DB 作成。環境変数 `UPSTASH_INSIGHTS_REST_URL`, `UPSTASH_INSIGHTS_REST_TOKEN` を Render/Vercel に登録。 | Sprint 開始前 |
| Supabase Edge Function Cron | Infra | `note-insights-aggregate` 関数のスケジュール (*/60 * * * * ) 設定。 | Sprint 中盤 |
| Secrets 配布 | Infra | Supabase Service Key / Upstash Token を 1Password → 環境変数へ反映。Rotations ルール策定。 | Sprint 開始前 |

## 4. QA / プロダクト

- QA:
  - [ ] Vitest で `buildInsightsResponse` / `mergeRealtimeMetrics` を追加。
  - [ ] Playwright シナリオ: `フィルタ変更→グラフ更新`, `CSV Export`, `共有リンク生成`, `429 再試行`。
  - [ ] k6 で API P95 < 400ms (n=20 ユーザー/秒) を確認。
- Product:
  - [ ] KPI 定義確定 (週開始曜日, 再閲覧率の算出方法)。
  - [ ] ダッシュボード初期フィルタ値、共有リンクの有効期限ポリシー。

## 5. Slack 共有用ドラフト

```
@backend-team @frontend-team @infra-team  
F065 ノートインサイトダッシュボードの実装タスクを docs/coordination/insights-dashboard-sync.md にまとめました。

Backend:
- /api/insights/notes/{summary|ai|shared}, Export API
- Supabase Edge Function で1時間毎の集計 + Upstashキャッシュ

Frontend:
- Insights Dashboard UI (KPI / Word Cloud / Line / Radar)
- Zustand store + CSV Export + 共有モーダル

Infra:
- Upstash Redis 専用DBとSupabase Edge Function Cron設定

スプリント計画に組み込めるか今週中に確認いただけると助かります。質問があればこのスレッドでどうぞ 🙏
```

---

更新履歴  
- 2025-10-24: 初版作成 (BE/FE/Infra 連携タスク整理)
