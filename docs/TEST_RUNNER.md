/**
 * @file test-runner.md
 * @description テスト実行ガイド
 * @created 2025-10-24
 */

# 🧪 テスト実行ガイド

## ステップ1: 事前準備

### 1.1 依存関係のインストール確認
```bash
npm install
```

### 1.2 Prismaクライアントの生成
```bash
npm run prisma:generate
```

### 1.3 環境変数の確認
テストに必要な環境変数が設定されているか確認：
```bash
# .env.test ファイル（存在しない場合は作成）
NODE_ENV=test
DATABASE_URL="postgresql://test:test@localhost:5432/test_db"
```

---

## ステップ2: テスト実行

### 2.1 全テストの実行
```bash
npm run test:unit
```

### 2.2 カバレッジ付きでテスト実行
```bash
npm run test:coverage
```

### 2.3 Watchモードでテスト実行（開発中）
```bash
npm run test:watch
```

---

## ステップ3: カバレッジレポートの確認

カバレッジレポートは `coverage/` ディレクトリに生成されます。

### 3.1 コンソールでカバレッジ確認
テスト実行後、コンソールに表示されます：

```
---------------------|---------|----------|---------|---------|-------------------
File                 | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
---------------------|---------|----------|---------|---------|-------------------
All files            |   92.31 |    88.89 |     100 |   92.31 |
 notebooks/route.ts  |   95.00 |    90.00 |     100 |   95.00 | 42-43
 notebooks/[id]/route|   90.00 |    85.00 |     100 |   90.00 | 78-80
---------------------|---------|----------|---------|---------|-------------------
```

### 3.2 HTMLレポートの確認
ブラウザで詳細なレポートを確認：

```bash
# HTMLレポートを開く（Windows）
start coverage/index.html

# HTMLレポートを開く（Mac）
open coverage/index.html

# HTMLレポートを開く（Linux）
xdg-open coverage/index.html
```

---

## ステップ4: トラブルシューティング

### 問題1: モジュールが見つからない
```
Error: Cannot find module '@/lib/auth/middleware'
```

**解決策**:
```bash
# TypeScriptの型チェック
npm run type-check

# node_modules を再インストール
rm -rf node_modules package-lock.json
npm install
```

### 問題2: テストがタイムアウトする
```
Error: Test timeout of 5000ms exceeded
```

**解決策**:
vitest.config.ts にタイムアウト設定を追加：
```typescript
export default defineConfig({
  test: {
    testTimeout: 10000, // 10秒に延長
  },
});
```

### 問題3: Prisma関連のエラー
```
Error: PrismaClient is not configured
```

**解決策**:
```bash
# Prismaクライアントを再生成
npm run prisma:generate
```

---

## ステップ5: CI/CD統合の確認

### 5.1 GitHub Actions でテスト実行
Pull Request を作成すると、自動的にテストが実行されます。

### 5.2 ローカルでCI環境をシミュレート
```bash
# 1. クリーンインストール
npm ci

# 2. Lintチェック
npm run lint

# 3. 型チェック
npm run type-check

# 4. テスト実行
npm run test:unit

# 5. カバレッジ生成
npm run test:coverage
```

---

## 期待される結果

### ✅ 成功時の出力例

```
 ✓ tests/integration/api/notebooks/route.test.ts (16) 1234ms
 ✓ tests/integration/api/notebooks/[id]/route.test.ts (21) 2345ms

 Test Files  2 passed (2)
      Tests  37 passed (37)
   Start at  10:00:00
   Duration  3.58s (transform 123ms, setup 456ms, collect 789ms, tests 2190ms, environment 0ms, prepare 12ms)

---------------------|---------|----------|---------|---------|-------------------
File                 | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
---------------------|---------|----------|---------|---------|-------------------
All files            |   92.31 |    88.89 |     100 |   92.31 |
 notebooks/route.ts  |   95.00 |    90.00 |     100 |   95.00 | 42-43
 notebooks/[id]/route|   90.00 |    85.00 |     100 |   90.00 | 78-80
---------------------|---------|----------|---------|---------|-------------------
```

---

## 📊 カバレッジ目標

| ファイル | 目標カバレッジ | 現状 |
|---------|-------------|------|
| route.ts | 90%+ | 🎯 |
| [id]/route.ts | 90%+ | 🎯 |
| noteService.ts | 85%+ | 🎯 |
| errorHandler.ts | 80%+ | 🎯 |

---

**作成日**: 2025-10-24  
**最終更新**: 2025-10-24
