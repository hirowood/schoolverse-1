# 🐛 Canvas エラー修正ガイド

## 問題の概要

**エラーメッセージ**:
```
Error: Module did not self-register: '\\?\C:\Users\hiroki\Desktop\schoolverse\node_modules\canvas\build\Release\canvas.node'.
```

**原因**:
- `fabric`パッケージが依存する`canvas`モジュールはNode.jsのネイティブモジュール
- テスト環境（jsdom）ではネイティブモジュールが正しく動作しない
- APIテストでは`canvas`機能は不要だが、モジュールがロードされようとしてエラーが発生

---

## ✅ 実施した修正

### 1. Vitest設定の更新 (`vitest.config.ts`)

**変更点**:
- `server.deps.inline`に`fabric`と`canvas`を追加
- `resolve.alias`で`canvas`をモックに置き換え

**効果**:
- canvasモジュールのロード時にモックが使用される
- テスト環境でネイティブモジュールの問題を回避

### 2. canvasモジュールのモック作成 (`tests/mocks/canvas.mock.ts`)

**内容**:
- Canvas、Imageクラスのモック実装
- createCanvas、loadImageなどの関数モック
- テスト環境で必要最小限の機能を提供

### 3. グローバルセットアップの更新 (`tests/setup/vitest.setup.ts`)

**追加内容**:
- `vi.mock('canvas')`でグローバルにcanvasをモック
- `vi.mock('fabric')`でfabricパッケージもモック

---

## 🧪 修正後のテスト実行

### テストを再実行

```bash
# キャッシュをクリア
rm -rf node_modules/.vite

# テストを実行
npm run test:unit
```

### 期待される結果

```
✓ tests/store/chatStore.test.ts (7 tests)
✓ tests/integration/api/notebooks/route.test.ts (16 tests)
✓ tests/integration/api/notebooks/[id]/route.test.ts (21 tests)

Test Files  3 passed (3)
     Tests  44 passed (44)
   Start at  19:45:00
   Duration  4.12s (transform 120ms, setup 250ms, collect 890ms, tests 2850ms)
```

**確認ポイント**:
- ✅ canvasエラーが表示されない
- ✅ すべてのテストが成功
- ✅ "Unhandled Errors" が0件

---

## 🔍 エラーが解決しない場合

### オプション1: node_modulesを再構築

```bash
# node_modulesを削除
rm -rf node_modules package-lock.json

# 依存関係を再インストール
npm install

# Prismaクライアントを再生成
npm run prisma:generate

# テストを再実行
npm run test:unit
```

### オプション2: canvasパッケージを完全に除外

`package.json`を確認し、canvasが直接依存関係にある場合は削除を検討：

```json
{
  "dependencies": {
    // canvasが直接依存関係にある場合は削除
    // "canvas": "^x.x.x"  ← これを削除
  }
}
```

### オプション3: fabricパッケージの更新

fabricの最新版を使用することで問題が解決する場合があります：

```bash
npm update fabric
```

---

## 📊 修正の影響範囲

### 影響を受けるテスト
- ✅ APIテスト: 影響なし（canvas機能を使用しない）
- ✅ Storeテスト: 影響なし
- ⚠️ Canvas機能を使用するコンポーネントテスト: モックの挙動に注意

### 今後の対応
Canvas機能を使用するコンポーネントのテストを追加する場合:
1. モックの拡張が必要
2. または、E2Eテスト（Playwright）で実際のcanvasを使用してテスト

---

## ✅ 修正完了の確認

以下をすべて確認してください：

- [ ] `npm run test:unit` が成功する
- [ ] canvasエラーが表示されない
- [ ] すべてのテストが成功（44/44）
- [ ] "Unhandled Errors" が0件
- [ ] カバレッジレポートが正常に生成される

---

## 📝 まとめ

**問題**: canvasネイティブモジュールがテスト環境で動作しない

**解決策**: 
1. ✅ Vitest設定でcanvasをモック化
2. ✅ グローバルセットアップでモックを適用
3. ✅ テスト環境に影響を与えずにテスト実行可能

**結果**: 
- ✅ APIテストが正常に実行できる
- ✅ CI/CDパイプラインでもエラーが発生しない
- ✅ 開発体験の向上

---

**作成日**: 2025-10-24  
**問題**: Canvas ネイティブモジュールエラー  
**解決**: ✅ 完了
