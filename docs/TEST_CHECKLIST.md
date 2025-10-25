# ✅ テスト実行最終チェックリスト

## 🎯 目的
このチェックリストを使用して、テストが正しく実行され、CI/CDパイプラインが正常に動作することを確認します。

---

## 📋 実行前チェックリスト

### ステップ1: 環境確認

```bash
# Node.jsバージョン確認（20.x必須）
node --version
# Expected: v20.x.x

# npmバージョン確認
npm --version
# Expected: 10.x.x以上
```

- [ ] Node.js 20.x がインストールされている
- [ ] npm がインストールされている

---

### ステップ2: 依存関係のインストール

```bash
# 依存関係をインストール
npm install
```

**確認ポイント**:
- [ ] エラーなくインストール完了
- [ ] `node_modules/` ディレクトリが作成された
- [ ] `package-lock.json` が更新された

---

### ステップ3: Prismaクライアント生成

```bash
# Prismaクライアントを生成
npm run prisma:generate
```

**確認ポイント**:
- [ ] エラーなく生成完了
- [ ] `✔ Generated Prisma Client` メッセージが表示された

---

### ステップ4: 型チェック

```bash
# TypeScript型チェック
npm run type-check
```

**期待される結果**:
```
✓ No errors found
```

**確認ポイント**:
- [ ] 型エラーが0件
- [ ] 警告がない（または許容範囲内）

---

### ステップ5: Lintチェック

```bash
# ESLintチェック
npm run lint
```

**期待される結果**:
```
✓ No linting errors found
```

**確認ポイント**:
- [ ] Lintエラーが0件
- [ ] コーディング規約に準拠

---

## 🧪 テスト実行チェックリスト

### ステップ6: 単体テスト実行

```bash
# すべての単体テストを実行
npm run test:unit
```

**期待される結果**:
```
✓ tests/integration/api/notebooks/route.test.ts (16 tests)
✓ tests/integration/api/notebooks/[id]/route.test.ts (21 tests)

Test Files  2 passed (2)
     Tests  37 passed (37)
  Start at  10:00:00
  Duration  3.58s
```

**確認ポイント**:
- [ ] すべてのテストが成功（37/37）
- [ ] 失敗したテストが0件
- [ ] 実行時間が10秒以内

---

### ステップ7: カバレッジ測定

```bash
# カバレッジ付きでテスト実行
npm run test:coverage
```

**期待される結果**:
```
---------------------|---------|----------|---------|---------|-------------------
File                 | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
---------------------|---------|----------|---------|---------|-------------------
All files            |   92.31 |    88.89 |     100 |   92.31 |
 notebooks/route.ts  |   95.00 |    90.00 |     100 |   95.00 | 42-43
 notebooks/[id]/route|   90.00 |    85.00 |     100 |   90.00 | 78-80
---------------------|---------|----------|---------|---------|-------------------

✓ Coverage thresholds met
```

**確認ポイント**:
- [ ] Lines カバレッジ ≥ 90%
- [ ] Functions カバレッジ ≥ 90%
- [ ] Branches カバレッジ ≥ 85%
- [ ] Statements カバレッジ ≥ 90%
- [ ] `coverage/` ディレクトリが生成された

---

### ステップ8: カバレッジレポート確認

```bash
# HTMLレポートを開く
# Windows
start coverage/index.html

# Mac
open coverage/index.html

# Linux
xdg-open coverage/index.html
```

**確認ポイント**:
- [ ] HTMLレポートがブラウザで開ける
- [ ] ファイルごとのカバレッジが表示される
- [ ] カバーされていない行が赤色で表示される

---

### ステップ9: ビルドチェック

```bash
# 本番ビルドを実行
npm run build
```

**期待される結果**:
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Creating an optimized production build
```

**確認ポイント**:
- [ ] ビルドが成功
- [ ] `.next/` ディレクトリが作成された
- [ ] ビルドエラーが0件

---

## 🚀 CI/CD統合チェックリスト

### ステップ10: GitHub Actions設定確認

**確認ポイント**:
- [ ] `.github/workflows/ci.yml` が存在する
- [ ] ワークフローファイルが正しく設定されている
- [ ] すべてのジョブが定義されている（lint, type-check, test, build, security, test-summary）

---

### ステップ11: GitHubシークレット設定

**必須シークレット**:
- [ ] `CODECOV_TOKEN` （Codecov統合用）
- [ ] `SLACK_WEBHOOK` （Slack通知用、オプション）

**設定方法**:
1. GitHubリポジトリ → Settings
2. Secrets and variables → Actions
3. New repository secret

---

### ステップ12: プルリクエストテスト

```bash
# 新しいブランチを作成
git checkout -b test/ci-integration

# 変更をコミット
git add .
git commit -m "test: CI/CD integration test"

# プッシュ
git push origin test/ci-integration
```

**確認ポイント**:
- [ ] GitHub Actionsが自動実行される
- [ ] すべてのジョブが成功する
- [ ] カバレッジレポートがPRにコメントされる

---

## 📊 最終確認

### ステップ13: 全チェック項目の確認

#### ローカル環境
- [ ] Node.js 20.x インストール済み
- [ ] 依存関係インストール完了
- [ ] Prismaクライアント生成完了
- [ ] 型チェック成功
- [ ] Lintチェック成功
- [ ] 単体テスト成功（37/37）
- [ ] カバレッジ閾値達成（90%+）
- [ ] ビルド成功

#### CI/CD環境
- [ ] GitHub Actions設定完了
- [ ] ワークフローファイル正常
- [ ] シークレット設定完了
- [ ] プルリクエストで自動実行
- [ ] すべてのジョブ成功

#### ドキュメント
- [ ] `docs/TEST_RUNNER.md` 作成済み
- [ ] `docs/CI_CD_INTEGRATION.md` 作成済み
- [ ] `docs/TEST_EXECUTION.md` 作成済み
- [ ] `tests/integration/api/notebooks/README.md` 作成済み
- [ ] `tests/integration/api/notebooks/QUICKSTART.md` 作成済み

---

## 🎉 完了判定

### すべてのチェック項目が ✅ の場合

**おめでとうございます！** 🎊

テスト環境の整備とCI/CD統合が完了しました！

### 次のアクション:

1. **READMEにバッジを追加**
   ```markdown
   [![CI](https://github.com/USERNAME/schoolverse/workflows/CI/badge.svg)](https://github.com/USERNAME/schoolverse/actions)
   [![codecov](https://codecov.io/gh/USERNAME/schoolverse/branch/main/graph/badge.svg)](https://codecov.io/gh/USERNAME/schoolverse)
   ```

2. **チームに共有**
   - テスト実行方法を共有
   - CI/CDパイプラインの説明
   - カバレッジ目標の周知

3. **継続的な改善**
   - テストケースの追加
   - カバレッジの向上
   - パフォーマンスの最適化

---

## 🐛 トラブルシューティング

### 問題が発生した場合

#### テストが失敗する
```bash
# 詳細ログを確認
npm run test:unit -- --reporter=verbose

# 特定のテストのみ実行
npm run test tests/integration/api/notebooks/route.test.ts
```

#### カバレッジが閾値未満
```bash
# カバーされていないコードを特定
npm run test:coverage
open coverage/index.html

# 赤色の行に対応するテストを追加
```

#### CI/CDで失敗する
```bash
# CI環境をシミュレート
CI=true npm run test:coverage

# ログを確認
# GitHub Actions → 失敗したジョブ → ログを確認
```

---

## 📞 サポート

### 質問や問題がある場合

1. **ドキュメントを確認**
   - `docs/TEST_RUNNER.md`
   - `docs/CI_CD_INTEGRATION.md`
   - `tests/integration/api/notebooks/README.md`

2. **Issueを作成**
   - GitHub Issues で質問
   - 詳細なエラーログを添付

3. **チームに相談**
   - Slackで質問
   - コードレビューで相談

---

**作成日**: 2025-10-24  
**最終更新**: 2025-10-24  
**バージョン**: 1.0.0
