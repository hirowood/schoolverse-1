# OCR ワーカー実装 & 結果ドロワー共有 連携メモ (v2.1.0)

## 1. バックエンド / インフラ連携事項

| タスク | 担当 | 詳細 | 期限(目安) |
|--------|------|------|-------------|
| ワーカー実装ポリシー確定 | BE | Edge Functions vs Render Worker の選定。Vision API キーの取得方法確認 (Supabase KV or Render env)。 | 今週末 |
| Supabase Storage 設定 | Infra | `ocr-source` / `ocr-results` バケット作成、バケットポリシー (private + signed URL)。 | 今週末 |
| Secrets 配布フロー | Infra | サービスアカウント鍵は Git 禁止。1Password → KV 登録手順書作成。ローテーション間隔定義。 | 来週頭 |
| ワーカー監視 | BE/Infra | Cloud Logs → Grafana 連携。429/5xx アラート (5 分間 3 件以上) 設定。 | 来週頭 |
| API ステータスモデル | BE | `ocr_jobs` テーブル schema 最終レビュー。Audit ログ戦略と結合テストケース共有。 | 今週末 |

### 技術メモ
- ワーカーは Node.js 20 ベース、Vision SDK v4.x + tesseract.js v5.x。
- Secrets: Supabase KV に `VISION_SA_KEY`、`VISION_PROJECT_ID` を保存。Worker 起動時に fetch。
- 署名付き URL 生成時は TTL 10 分、再利用不可 (one-shot)。

### 次回 BE/Infra Sync Agenda (30 分)
1. アーキ選定結果 (Edge vs Render) / スケーリング要件
2. Secrets 配布フロー (権限・更新手順)
3. 監視・リトライ閾値 (バックオフ値の最終確認)
4. 実装スプリント計画とテストタスク分担

## 2. UI/UX チーム連携事項

| タスク | 担当 | 詳細 | 期限(目安) |
|--------|------|------|-------------|
| OCR 結果ドロワー モック共有 | Design | Figma フレーム (`Digital Note v1 / OCR Drawer`) をレビュー会にて提示。 | 今週水曜 |
| テキスト整形ルール承認 | Design/BE | 改行、箇条書き、confidence 表示形式 (0.6 未満強調) の同意。 | 今週水曜 |
| Copywriting | Design | 「OCR結果」「再解析」「ノートへ貼り付け」など CTA 文言確定。 | 今週金曜 |
| 運用フロー確認 | BE/Product | エラー時のユーザーフィードバック (トースト + リトライ) とチュートリアル案策定。 | 来週頭 |

### 共有素材
- docs/mockups/digital-note-ui-prototype.md (最新仕様)
- Figma: `https://www.figma.com/file/XXXX...` (UI チーム追記予定)
- 想定ステート：`待機 / 実行中 / 完了 / 失敗 / 再実行待ち`

### 次回 UI/UX Sync Agenda (25 分)
1. モック walkthrough (ドロワー構成、切り替え動線)
2. テキスト整形ロジック説明 (Markdown 変換ルール)
3. confidence 表示とハイライト基準合意
4. ドキュメント更新担当と次回レビュー日程

## 3. アクションアイテム一覧

- [ ] BE: ワーカー実装方式 (Edge / Render) 決定して Slack #proj-ocr に共有
- [ ] Infra: Secrets 配布ドキュメント (1Password → KV) を Confluence へ掲載
- [ ] Design: OCR ドロワー最新モックを Figma で公開しコメント受付開始
- [ ] Product: confidence 表示のしきい値とエラーメッセージ案の承認
- [ ] QA: Vision 成功 / レート制限 / tesseract fallback / ユーザー中断の 4 シナリオをテスト計画に追加

## 4. 共有用メッセージ（Slack 下書き）

```
@backend-team @infra-team  
Phase 1.5 の OCR 対応について、連携事項を docs/coordination/ocr-integration-sync.md にまとめました。  

⚙️ 決めたいポイント
- ワーカー実装方式：Edge Functions or Render Worker
- Vision API / tesseract 用 Secrets 配布フロー（保管場所・更新手順）
- 429/5xx 発生時のリトライ/監視閾値

⏱️ 希望スケジュール
- 今週末までに方式とフローの確定
- 来週頭の Sync で監視・テスト計画レビュー

ご確認のうえ、決定事項を Slack #proj-ocr で共有いただけると助かります。  
疑問点あればこのスレッドでお知らせください 🙏
```

---

更新履歴  
- 2025-10-24: 初版作成 (worker 実装と UI 共有タスク整理)
- 2025-10-24: BE/Infra 共有用メッセージ下書きを追加
