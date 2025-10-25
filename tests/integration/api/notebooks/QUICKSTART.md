# 🧪 notebooks API テストクイックスタート

## 📦 セットアップ

依存関係がインストールされていることを確認してください：

```bash
npm install
```

---

## 🚀 テストの実行

### 1. すべてのテストを実行

```bash
npm run test
```

または

```bash
npm run test:unit
```

### 2. Watchモードで実行（推奨：開発中）

```bash
npm run test:watch
```

ファイルを保存すると、自動的にテストが再実行されます。

### 3. 特定のテストファイルのみ実行

```bash
npm run test tests/integration/api/notebooks/route.test.ts
```

### 4. カバレッジレポートを生成

```bash
npm run test:coverage
```

カバレッジレポートは `coverage/` ディレクトリに生成されます。

---

## ✅ 期待される結果

すべてのテストが成功すると、以下のような出力が表示されます：

```
✓ tests/integration/api/notebooks/route.test.ts (16)
  ✓ GET /api/notebooks (4)
    ✓ 正常系 (2)
      ✓ 認証済みユーザーのノート一覧を返す
      ✓ ノートが0件の場合は空配列を返す
    ✓ 異常系 (2)
      ✓ 未認証の場合は401エラーを返す
      ✓ データベースエラーの場合は500エラーを返す
  ✓ POST /api/notebooks (12)
    ✓ 正常系 (3)
    ✓ 異常系: バリデーションエラー (6)
    ✓ 異常系: 認証エラー (1)
    ✓ エッジケース (3)

✓ tests/integration/api/notebooks/[id]/route.test.ts (21)
  ✓ GET /api/notebooks/[id] (4)
  ✓ PUT /api/notebooks/[id] (11)
  ✓ DELETE /api/notebooks/[id] (5)
  ✓ 統合テスト: CRUD操作の連携 (1)

Test Files  2 passed (2)
     Tests  37 passed (37)
```

---

## 📊 カバレッジ目標

| ファイル | カバレッジ目標 |
|---------|------------|
| `route.ts` | 90%+ |
| `[id]/route.ts` | 90%+ |
| `noteService.ts` | 85%+ |
| `notebookRepository.ts` | 85%+ |

---

## 🐛 トラブルシューティング

### エラー: "Cannot find module '@/...'"

**原因**: パスエイリアスが解決されていない

**解決策**:
```bash
# TypeScriptコンパイルを確認
npm run type-check

# tsconfig.jsonのpathsを確認
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### エラー: "Test timeout"

**原因**: 非同期処理が完了していない

**解決策**:
```typescript
// すべての非同期関数でawaitを使用
const response = await GET(request);
const data = await response.json();
```

### エラー: "Mock not called"

**原因**: モックが正しくセットアップされていない

**解決策**:
```typescript
// beforeEachでモックをリセット
beforeEach(() => {
  resetNoteServiceMocks();
  resetAuthMock();
});

// モックが呼ばれることを確認
expect(mockNoteService.createNotebook).toHaveBeenCalled();
```

---

## 📝 次のステップ

1. ✅ すべてのテストが通ることを確認
2. ✅ カバレッジレポートを確認
3. ✅ 不足しているテストケースを追加
4. ✅ CI/CDパイプラインに統合

---

## 📚 詳細ドキュメント

より詳細な情報は、以下を参照してください：

- [テストREADME](./README.md) - 詳細なテストドキュメント
- [Vitest公式ドキュメント](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)

---

**最終更新**: 2025-10-24  
**作成者**: Schoolverse Development Team
