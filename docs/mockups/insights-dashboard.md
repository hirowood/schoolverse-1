# Insights Dashboard UI Brief

AI insights (F064) のアウトプットを横断的に確認するためのダッシュボード画面仕様。Summary / MindMap / Advice で得られた学習インサイトを KPI・グラフ・アクティビティで表示する。

## 1. レイアウト概要 (Desktop ≥1280px)

```
┌───────────── Top App Bar ─────────────┐
│ Notes ▸ Insights      Filter: This week │
│ KPI Cards (4x)                          │
└────────────────────────────────────────┘
┌───────────────┬───────────────┐
│ Word Cloud     │ Study Time    │
│ (d3-cloud)     │ (Line chart)  │
├───────────────┴───────────────┤
│ AI Score Radar + Legend        │
└───────────────────────────────┘
Recent Activity List (AI summary generated, shared with teacher…)
```

### KPI カード
- 「今週ノート数」「AI要約済み」「共有済み」「平均完了時間」4 枚。
- 前週比を右上に表示 (▲/▼ + %)。閾値で色変更 (良: #22C55E, 悪: #EF4444)。
- クリックで該当ノート一覧モーダル。

### フィルタバー
- Date range (This week / Last week / Custom)。
- Subject タグ (multi-select chips)。
- AI コンテンツ種別 (Summary / MindMap / Advice)。

## 2. グラフ

| グラフ | データ | ライブラリ | 備考 |
|--------|--------|------------|------|
| Word Cloud | トップキーワード + 重み | `d3-cloud` | Hover で使用ノートへジャンプ |
| Study Time Line | 日別学習時間 (分) | `@tanstack/react-charts` | フィルタに応じて色変更 |
| AI Score Radar | Summary/MindMap/Advice の信頼度平均 | Chart.js Radar | ラジオで absolute / delta 切替 |

### アクセシビリティ
- グラフ下に表形式の「数値リスト」を表示しスクリーンリーダー対応。
- 色のみで差を表現しない (線の種類, アイコン併用)。

## 3. Recent Activity
- 最新 20 件の AI イベントを時間順に表示。
- 各行: アイコン + タイトル + ノート名 + タイムスタンプ + CTA (View note / Copy link)。
- ステータス: 成功=緑, 失敗=赤 (再試行ボタン)。

## 4. インタラクション
- フィルタ変更 → Skeleton (gray shimmer) → 更新された KPI/グラフをフェードイン。
- ノート行クリックで右スライドドロワー (最新 Summary/Advice を差分付きで表示)。
- 「教員と共有」: 共有設定モーダル → 成功で toast + 共有リンクコピー。
- CSV Export: 現在フィルタを適用したデータで `/api/insights/export.csv` をダウンロード。

## 5. Zustand ストア
```ts
type InsightsState = {
  kpis: KpiCard[];
  keywordTrends: TrendItem[];
  studyTimeSeries: TimePoint[];
  aiScores: RadarPoint[];
  recentActivities: Activity[];
  filters: { range: DateRange; subjects: string[]; aiTypes: AiType[] };
  status: 'idle' | 'loading' | 'error';
  error?: string;
  load: (filters?: Partial<Filters>) => Promise<void>;
  retry: () => Promise<void>;
};
```
- `load` はキャッシュ (Redis) → API → 状態更新の順に実行。
- `retry` は指数バックオフで 3 回再試行。

## 6. QA チェック
- Unit: `buildKpiCards`, `createWordCloudData` など util を Vitest で検証。
- Playwright: フィルタ操作 / CSV Export / ドロワー表示 / 429 再試行をシナリオ化。
- パフォーマンス: Lighthouse で TTI < 3s, main thread blocking < 150ms。

## 7. TODO (Design / FE)
- [ ] Figma で KPI カード & グラフのスタイル確定 (フォント: Inter / 色: Slate scale)。
- [ ] モバイル (≤768px) レイアウト: KPI 2 列 → グラフ縦積み → アクティビティ accordion。
- [ ] アイコンセット: phosphor icons (ChartLine, Brain, ShareNetwork, Timer)。

---
更新履歴  
- 2025-10-24: 初版作成 (ダッシュボードレイアウト・グラフ仕様・インタラクション)
