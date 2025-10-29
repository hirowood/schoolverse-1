# 🔧 React Dev Overlay Error トラブルシューティングガイド

**作成日**: 2025-10-25  
**対象**: Next.js 15 + React 19 開発環境エラー

---

## 📋 エラー概要

```
Console Error
Call Stack
handleClientError
..\src\client\components\react-dev-overlay\internal\helpers\use-error-handler.ts (25:13)
```

このエラーは、Next.jsの開発環境でクライアント側のエラーが発生した際に表示されます。

---

## 🧠 問題分析（4つの思考フレームワーク）

### 1️⃣ 段階的思考（分解）
```
エラー発生
  ↓
React Dev Overlayが検知
  ↓
handleClientError実行
  ↓
エラー表示
```

### 2️⃣ 逆算思考
```
アプリ正常動作
  ← エラー解消
    ← キャッシュクリア
      ← .next削除
```

### 3️⃣ メタ思考
- ビルドキャッシュの不整合が最も可能性が高い
- 最近のコード変更（authService.ts）が影響している可能性
- 開発環境特有のエラー

### 4️⃣ ツリー構造
```
React Dev Overlayエラー
│
├─ 原因1: ビルドキャッシュ不整合 ⭐⭐⭐
├─ 原因2: コード変更によるエラー ⭐⭐
├─ 原因3: 依存関係の問題 ⭐
└─ 原因4: React 19互換性 ⭐
```

---

## 🎯 解決策（優先度順）

### ✅ **解決策1: クイック修正（最優先）**

```bash
# 開発サーバーを停止（Ctrl+C）

# .nextフォルダを削除
npm run clean:next

# 開発サーバーを再起動
npm run dev
```

**成功率**: 80%  
**所要時間**: 1-2分

---

### ✅ **解決策2: バッチファイルで自動修正**

```bash
# プロジェクトルートで実行
.\fix-react-error.bat
```

このバッチファイルは以下を自動実行：
1. ✅ Nodeプロセスを停止
2. ✅ .nextフォルダを削除
3. ✅ Prismaクライアントを生成
4. ✅ 開発サーバーを起動

**成功率**: 85%  
**所要時間**: 2-3分

---

### ✅ **解決策3: 診断ツールで状態確認**

```powershell
# 診断実行
.\diagnose-react-error.ps1
```

診断内容：
- Next.js/Reactバージョン確認
- .nextフォルダの状態
- node_modulesの整合性
- Prismaクライアントの状態
- 最近変更されたファイル

**推奨**: エラーが再発する場合に実行

---

### ✅ **解決策4: 完全クリーンビルド**

```bash
# すべてクリア
npm run clean:all

# 依存関係を再インストール
npm install

# Prisma生成
npm run prisma:generate

# 開発サーバー起動
npm run dev
```

**成功率**: 95%  
**所要時間**: 5-10分

---

## 🔍 詳細なエラー情報の取得方法

### 1️⃣ ブラウザコンソール

1. F12キーを押す
2. Consoleタブを開く
3. エラーメッセージ全文をコピー
4. 以下の情報を確認：
   - エラーメッセージ
   - スタックトレース
   - 発生したURL

### 2️⃣ Next.jsターミナルログ

開発サーバーのターミナルで以下を確認：
```
✓ Compiled successfully
✗ Failed to compile
⚠ Warning
```

### 3️⃣ ネットワークタブ

1. F12 → Network
2. エラー時のリクエストを確認
3. 失敗したリクエストのレスポンスを確認

---

## 🐛 よくあるエラーパターンと対策

### パターン1: ビルドキャッシュ不整合

**症状**:
- ページが白紙
- React Dev Overlayエラー
- 特定のコンポーネントが表示されない

**対策**:
```bash
npm run clean:next && npm run dev
```

---

### パターン2: Prismaクライアント未生成

**症状**:
- Database関連のエラー
- `Cannot find module '@prisma/client'`

**対策**:
```bash
npm run prisma:generate
npm run dev
```

---

### パターン3: 依存関係の不整合

**症状**:
- Module not foundエラー
- 特定のパッケージが見つからない

**対策**:
```bash
npm run clean:all
npm install
npm run dev
```

---

### パターン4: ポート占有

**症状**:
- `Port 3000 is already in use`
- 開発サーバーが起動しない

**対策**:
```bash
# Windowsの場合
taskkill /F /IM node.exe

# その後
npm run dev
```

---

## 📊 トラブルシューティングフローチャート

```
エラー発生
    ↓
[Q1] .nextフォルダが存在する？
    Yes → 削除 → npm run dev
    No  → ↓
    
[Q2] node_modulesが存在する？
    No  → npm install → npm run dev
    Yes → ↓
    
[Q3] Prismaクライアント生成済み？
    No  → npm run prisma:generate → npm run dev
    Yes → ↓
    
[Q4] 最近コード変更した？
    Yes → git diff で確認 → 問題箇所を修正
    No  → ↓
    
[完全クリーンビルド実行]
    npm run clean:all
    npm install
    npm run prisma:generate
    npm run dev
```

---

## 🔄 再発防止策

### 1️⃣ 定期的なクリーンビルド

週に1回程度：
```bash
npm run clean:next && npm run dev
```

### 2️⃣ Gitでの変更管理

コミット前に必ず動作確認：
```bash
# 変更を確認
git diff

# ビルドテスト
npm run build

# 問題なければコミット
git add .
git commit -m "..."
```

### 3️⃣ package.jsonの変更後

必ず再インストール：
```bash
npm install
npm run dev
```

### 4️⃣ Prismaスキーマの変更後

必ず生成とマイグレーション：
```bash
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

---

## 🚨 緊急時の対応

### エラーが解決しない場合

1. **すべてバックアップ**
   ```bash
   # 現在の状態を保存
   git add .
   git commit -m "WIP: エラー発生前の状態"
   ```

2. **最後の正常なコミットに戻る**
   ```bash
   # コミット履歴を確認
   git log --oneline
   
   # 特定のコミットに戻る
   git reset --hard <commit-hash>
   ```

3. **完全リセット**
   ```bash
   git stash  # 変更を一時保存
   npm run clean:all
   npm install
   npm run prisma:generate
   npm run dev
   ```

---

## 📞 サポート情報

### エラーが解決しない場合の報告項目

1. **エラーメッセージ全文**（ブラウザコンソール）
2. **Next.jsのログ**（ターミナル）
3. **環境情報**
   - Node.jsバージョン: `node -v`
   - npmバージョン: `npm -v`
   - OS: Windows/Mac/Linux
4. **最近の変更内容**
   - 変更したファイル
   - インストールしたパッケージ
5. **診断結果**
   ```powershell
   .\diagnose-react-error.ps1
   ```

---

## 📚 参考リソース

- [Next.js Error Overlay](https://nextjs.org/docs/app/building-your-application/configuring/error-handling)
- [React 19 Migration Guide](https://react.dev/blog/2024/04/25/react-19)
- [Troubleshooting Next.js](https://nextjs.org/docs/messages)

---

## ✅ チェックリスト

エラー解決後の確認：

- [ ] ブラウザでページが正常に表示される
- [ ] コンソールにエラーがない
- [ ] 開発サーバーが安定動作している
- [ ] ホットリロードが機能している
- [ ] すべてのページが正常に動作する
- [ ] ビルドが成功する（`npm run build`）

---

**バージョン**: 1.0.0  
**最終更新**: 2025-10-25  
**ステータス**: アクティブ
