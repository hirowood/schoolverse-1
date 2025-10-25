# 🚀 CI/CD パイプライン統合ガイド

## 📋 概要

このドキュメントでは、schoolverseプロジェクトのCI/CDパイプライン統合について説明します。

---

## 🎯 CI/CDパイプラインの目的

1. **品質保証**: すべてのコード変更が品質基準を満たすことを確認
2. **自動テスト**: プルリクエストごとに自動テスト実行
3. **カバレッジ監視**: テストカバレッジを90%以上に維持
4. **早期発見**: バグやエラーを早期に検出
5. **安心デプロイ**: 本番環境へのデプロイ前に品質確認

---

## 🔄 パイプライン構成

### 全体フロー

```
コミット/PR作成
    ↓
┌──────────────────────────────────┐
│  並列実行（パフォーマンス最適化） │
└──────────────────────────────────┘
    ↓
┌─────────┬──────────────┬─────────┬──────────┐
│  Lint   │  Type Check  │  Test   │ Security │
│  🔍     │      📝      │   🧪    │    🔒    │
└─────────┴──────────────┴─────────┴──────────┘
    ↓         ↓              ↓          ↓
    └─────────┴──────────────┴──────────┘
                    ↓
            ┌─────────────┐
            │    Build    │
            │     🏗️     │
            └─────────────┘
                    ↓
            ┌─────────────┐
            │   Summary   │
            │     📊      │
            └─────────────┘
                    ↓
            ┌─────────────┐
            │   Notify    │
            │     📢      │
            └─────────────┘
```

---

## 📊 各ジョブの詳細

### Job 1: Lint 🔍
**目的**: コードスタイルと潜在的なエラーをチェック

**実行内容**:
- ESLintによる静的解析
- コーディング規約の確認
- 潜在的なバグの検出

**失敗する条件**:
- ESLintエラーが存在する
- コーディング規約違反

**修正方法**:
```bash
# ローカルで確認
npm run lint

# 自動修正
npm run lint -- --fix
```

---

### Job 2: Type Check 📝
**目的**: TypeScript型チェック

**実行内容**:
- TypeScriptコンパイラによる型検証
- 型エラーの検出
- Prismaクライアントの生成確認

**失敗する条件**:
- 型エラーが存在する
- import/exportの不整合

**修正方法**:
```bash
# ローカルで確認
npm run type-check

# Prismaクライアント再生成
npm run prisma:generate
```

---

### Job 3: Test 🧪
**目的**: 単体テスト実行とカバレッジ測定

**実行内容**:
- 全テストケースの実行（37テスト）
- カバレッジレポート生成
- Codecovへのアップロード
- PRへのカバレッジコメント

**失敗する条件**:
- テストケースが失敗
- カバレッジが閾値（90%）未満

**修正方法**:
```bash
# ローカルで確認
npm run test:coverage

# 特定のテストのみ実行
npm run test tests/integration/api/notebooks/route.test.ts
```

**カバレッジ閾値**:
| 指標 | 閾値 |
|------|------|
| Lines | 90% |
| Functions | 90% |
| Branches | 85% |
| Statements | 90% |

---

### Job 4: Build 🏗️
**目的**: 本番ビルドの確認

**実行内容**:
- Next.jsプロダクションビルド
- ビルドエラーの検出
- .nextディレクトリの確認

**失敗する条件**:
- ビルドエラーが発生
- .nextディレクトリが生成されない

**修正方法**:
```bash
# ローカルで確認
npm run build

# ビルドキャッシュをクリア
rm -rf .next
npm run build
```

---

### Job 5: Security 🔒
**目的**: セキュリティ脆弱性チェック

**実行内容**:
- npm auditによる依存関係チェック
- Trivyによるファイルスキャン
- GitHub Security Alertsへのアップロード

**失敗する条件**:
- 重大な脆弱性が検出される

**修正方法**:
```bash
# ローカルで確認
npm audit

# 自動修正
npm audit fix

# 手動で依存関係を更新
npm update <package-name>
```

---

## 📈 カバレッジレポート

### Codecov統合

**セットアップ手順**:

1. **Codecovアカウント作成**
   - https://codecov.io/ にアクセス
   - GitHubアカウントでサインイン

2. **リポジトリを追加**
   - schoolverseリポジトリを選択
   - トークンを取得

3. **GitHubシークレット設定**
   ```
   Settings → Secrets and variables → Actions
   
   Name: CODECOV_TOKEN
   Value: <Codecovから取得したトークン>
   ```

4. **バッジをREADMEに追加**
   ```markdown
   [![codecov](https://codecov.io/gh/USERNAME/schoolverse/branch/main/graph/badge.svg)](https://codecov.io/gh/USERNAME/schoolverse)
   ```

### カバレッジレポートの見方

**コンソール出力例**:
```
---------------------|---------|----------|---------|---------|-------------------
File                 | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
---------------------|---------|----------|---------|---------|-------------------
All files            |   92.31 |    88.89 |     100 |   92.31 |
 notebooks/route.ts  |   95.00 |    90.00 |     100 |   95.00 | 42-43
 notebooks/[id]/route|   90.00 |    85.00 |     100 |   90.00 | 78-80
---------------------|---------|----------|---------|---------|-------------------
```

**用語説明**:
- **% Stmts**: ステートメントカバレッジ（実行された文の割合）
- **% Branch**: 分岐カバレッジ（実行された分岐の割合）
- **% Funcs**: 関数カバレッジ（実行された関数の割合）
- **% Lines**: ラインカバレッジ（実行された行の割合）
- **Uncovered Line #s**: カバーされていない行番号

---

## 🔧 トラブルシューティング

### 問題1: テストが CI で失敗するがローカルでは成功する

**原因**: 環境変数や依存関係の違い

**解決策**:
1. CIと同じNode.jsバージョンを使用
   ```bash
   nvm use 20
   ```

2. クリーンインストール
   ```bash
   rm -rf node_modules package-lock.json
   npm ci
   ```

3. CI環境をシミュレート
   ```bash
   CI=true npm run test:coverage
   ```

---

### 問題2: カバレッジが閾値を下回る

**原因**: 新しいコードがテストされていない

**解決策**:
1. カバレッジレポートを確認
   ```bash
   npm run test:coverage
   open coverage/index.html
   ```

2. カバーされていないコードを特定

3. 対応するテストを追加

---

### 問題3: Prisma関連のエラー

**原因**: Prismaクライアントが生成されていない

**解決策**:
```bash
# CI環境で自動実行されるが、ローカルでも確認
npm run prisma:generate
```

---

## 🎯 ベストプラクティス

### 1. プルリクエスト前のチェック

```bash
# すべてのチェックをローカルで実行
npm run lint
npm run type-check
npm run test:coverage
npm run build
```

### 2. コミット前のフック設定

`.husky/pre-commit` を作成:
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run lint
npm run type-check
npm run test:unit
```

### 3. コミットメッセージ規約

Conventional Commits を使用:
```
feat: 新機能追加
fix: バグ修正
test: テスト追加
docs: ドキュメント更新
refactor: リファクタリング
```

---

## 📊 パフォーマンス最適化

### 並列実行

Jobs 1-3 は並列実行されるため、以下の時間が短縮されます：

| ジョブ | 実行時間 |
|--------|---------|
| Lint | ~30秒 |
| Type Check | ~45秒 |
| Test | ~60秒 |
| Security | ~90秒 |

**合計**: 約2.5分（並列実行）vs 約4分（順次実行）

### キャッシュ活用

- `actions/setup-node@v4` の `cache: 'npm'` により、node_modulesがキャッシュされる
- 2回目以降のビルドは約50%高速化

---

## 🔔 通知設定

### Slack通知（オプション）

**セットアップ手順**:

1. **Slack Webhook URL取得**
   - Slackワークスペースで Incoming Webhooks を有効化
   - Webhook URLを取得

2. **GitHubシークレット設定**
   ```
   Name: SLACK_WEBHOOK
   Value: <Webhook URL>
   ```

3. **通知内容カスタマイズ**
   `.github/workflows/ci.yml` の `notify` ジョブを編集

---

## 📋 チェックリスト

### セットアップ完了チェック

- [ ] GitHub Actionsが有効
- [ ] Codecovトークン設定済み
- [ ] Slackウェブフック設定済み（オプション）
- [ ] ローカルで全テストが通る
- [ ] カバレッジが90%以上
- [ ] READMEにバッジ追加

### プルリクエスト前チェック

- [ ] `npm run lint` が成功
- [ ] `npm run type-check` が成功
- [ ] `npm run test:coverage` が成功
- [ ] カバレッジが閾値以上
- [ ] `npm run build` が成功

---

## 🎉 期待される結果

### 成功時のGitHub Actions画面

```
✅ Lint - 30s
✅ Type Check - 45s
✅ Unit Tests & Coverage - 60s
✅ Build Check - 90s
✅ Security Check - 90s
✅ Test Summary - 5s

All checks have passed
```

### PRコメントにカバレッジ情報が表示

```
Coverage: 92.31% (+0.45%)

File                 | Coverage
---------------------|----------
notebooks/route.ts   | 95.00%
notebooks/[id]/route | 90.00%
```

---

## 📚 参考リンク

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Codecov Documentation](https://docs.codecov.io/)
- [Vitest Coverage](https://vitest.dev/guide/coverage.html)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

**作成日**: 2025-10-24  
**最終更新**: 2025-10-24  
**メンテナー**: Schoolverse Development Team
