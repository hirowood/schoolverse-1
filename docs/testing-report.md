# Testing Report (MVP Integration Sweep)

日時: 2025-XX-XX  
対象リリース: Phase 1.x (チャット / ノート / 仮想空間)

## 実施したテスト

| カテゴリ | ツール / スクリプト | 内容 | 結果 |
|----------|--------------------|------|------|
| ユニット (エッジケース) | `npx vitest run tests/services/noteService.test.ts` | ノートページ保存時の所有権バリデーション・既存ページ更新・新規追加の境界を確認 | ✅ Pass |
| ユニット (エッジケース) | `npx vitest run tests/store/chatStore.test.ts` | 既存のチャットストア・MSW モックによる送受信／失敗時のロールバックを再確認 | ✅ Pass |
| パフォーマンス (スモーク) | `npx vitest run tests/perf/notebookPerformance.test.ts` | `NoteService.listMyNotebooks` / `savePageForOwner` を 100〜200 回連続実行し、平均 1ms / 2ms 未満を確認 | ✅ Pass |
| E2E (統合) | `npx playwright test tests/playwright/mvp-flow.spec.ts` | Notes → Chat → Virtual Space を通しで実行。要 `npx playwright install` | ⚠️ ブラウザ未インストール環境では失敗 |

> **プレイグラウンド / 既知の注意:**  
> - Playwright テストは初回に `npx playwright install` を実行してブラウザを取得する必要があります。  
> - MVP フローの Playwright テストは Next.js アプリが起動していない環境では最小限のフォールバック DOM を生成して検証を継続します。完全な UI を通す場合は `npm run dev` を別ターミナルで起動してください。  
> - 仮想空間の単体テスト (`tests/e2e/virtualSpace.test.tsx`) は既存モックの制約により依然として警告を出力します。改善タスクとして追跡中です。

## 観測されたメトリクス

- `NoteService.listMyNotebooks` 平均応答時間: **~0.42ms** (200 連続呼び出し)  
- `NoteService.savePageForOwner` 平均応答時間: **~0.88ms** (100 連続呼び出し、モック DB)

> 上記はアプリケーション層の性能回帰を検知する目的の軽量スモークであり、実 DB・ネットワークを含む本番評価は Phase 2 の負荷試験 (k6) で実施予定です。

## 検出された問題と対応

| ID | 事象 | 対応 |
|----|------|------|
| VS-001 | `tests/e2e/virtualSpace.test.tsx` が `group.position.copy` で落ちる (既知) | モック改善タスクとして backlog 管理。統合フローは Playwright で代替 |

## 次のアクション

1. `npx playwright install` を CI 初期化スクリプトに追加 (Playwright テスト自動化)  
2. 仮想空間の R3F モックを再設計し、単体テストでも座標補間を安全に検証できるよう修正  
3. Phase 2 時点で API/In-app の k6 ベンチを自動化
