# notebooks API テストドキュメント

## 📋 概要

このディレクトリには、notebooks APIの包括的なテストスイートが含まれています。

- **テストフレームワーク**: Vitest
- **カバレッジ**: GET, POST, PUT, DELETE すべてのエンドポイント
- **テストタイプ**: 正常系、異常系、エッジケース

---

## 📂 ディレクトリ構造

```
tests/
├── helpers/
│   └── api.helper.ts          # APIテスト用ヘルパー関数
├── factories/
│   └── notebook.factory.ts    # テストデータファクトリー
├── mocks/
│   ├── auth.mock.ts           # 認証モック
│   └── noteService.mock.ts    # noteServiceモック
└── integration/
    └── api/
        └── notebooks/
            ├── route.test.ts          # GET /api/notebooks, POST /api/notebooks
            └── [id]/
                └── route.test.ts      # GET/PUT/DELETE /api/notebooks/[id]
```

---

## 🚀 テストの実行

### すべてのテストを実行
```bash
npm run test
```

### 特定のテストファイルを実行
```bash
npm run test tests/integration/api/notebooks/route.test.ts
```

### Watchモードで実行（開発中）
```bash
npm run test:watch
```

### カバレッジレポートを生成
```bash
npm run test:coverage
```

---

## 📊 テストカバレッジ

### /api/notebooks (route.ts)

**GET /api/notebooks** - ノート一覧取得
- ✅ 正常系: 認証済みユーザーのノート一覧を返す
- ✅ 正常系: ノートが0件の場合は空配列を返す
- ✅ 異常系: 未認証の場合は401エラーを返す
- ✅ 異常系: データベースエラーの場合は500エラーを返す

**POST /api/notebooks** - ノート作成
- ✅ 正常系: 有効なデータで新しいノートを作成
- ✅ 正常系: descriptionがnullの場合でも作成可能
- ✅ 正常系: tagsが空配列の場合でも作成可能
- ✅ 異常系: titleが空の場合は400エラー
- ✅ 異常系: titleが101文字以上の場合は400エラー
- ✅ 異常系: descriptionが501文字以上の場合は400エラー
- ✅ 異常系: tagsが21個以上の場合は400エラー
- ✅ 異常系: tagが21文字以上の場合は400エラー
- ✅ 異常系: 不正なJSONの場合は400エラー
- ✅ 異常系: 未認証の場合は401エラー
- ✅ エッジケース: titleが1文字でも作成可能
- ✅ エッジケース: titleが100文字でも作成可能
- ✅ エッジケース: tagsが20個でも作成可能

### /api/notebooks/[id] ([id]/route.ts)

**GET /api/notebooks/[id]** - 個別ノートブック取得
- ✅ 正常系: 指定されたIDのノートブックを返す
- ✅ 異常系: 未認証の場合は401エラー
- ✅ 異常系: 存在しないノートブックの場合は404エラー
- ✅ 異常系: 他人のノートブックにアクセスした場合はエラー

**PUT /api/notebooks/[id]** - ノートブック更新
- ✅ 正常系: 有効なデータでノートブックを更新
- ✅ 正常系: 一部のフィールドのみ更新可能
- ✅ 正常系: 空のリクエストボディでも処理可能
- ✅ 異常系: titleが空文字の場合は400エラー
- ✅ 異常系: titleが101文字以上の場合は400エラー
- ✅ 異常系: descriptionが501文字以上の場合は400エラー
- ✅ 異常系: tagsが21個以上の場合は400エラー
- ✅ 異常系: 未認証の場合は401エラー
- ✅ 異常系: 存在しないノートブックの場合はエラー

**DELETE /api/notebooks/[id]** - ノートブック削除
- ✅ 正常系: 指定されたIDのノートブックを削除
- ✅ 異常系: 未認証の場合は401エラー
- ✅ 異常系: 存在しないノートブックの場合は404エラー
- ✅ 異常系: 他人のノートブックを削除しようとした場合は404エラー

**合計**: 37テストケース

---

## 🧪 テストの書き方

### 基本パターン

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockRequest, expectSuccessResponse } from '@/tests/helpers/api.helper';

describe('API Endpoint', () => {
  beforeEach(() => {
    // モックのリセット
  });

  it('should do something', async () => {
    // Arrange: テストデータの準備
    const request = createMockRequest({
      method: 'POST',
      body: { title: 'Test' },
      userId: 'user-123',
    });

    // Act: テスト対象の実行
    const response = await POST(request);

    // Assert: 結果の検証
    expect(response.status).toBe(201);
    const data = await expectSuccessResponse(response, 201);
    expect(data).toHaveProperty('notebook');
  });
});
```

### ヘルパー関数の使用

```typescript
// モックリクエストの作成
const request = createMockRequest({
  method: 'POST',
  url: 'http://localhost:3000/api/notebooks',
  body: { title: 'Test' },
  userId: 'user-123',
  headers: { 'X-Custom': 'value' },
  searchParams: { page: '1' },
});

// 成功レスポンスの検証
const data = await expectSuccessResponse<{ notebook: Notebook }>(
  response,
  201 // 期待するステータスコード
);

// エラーレスポンスの検証
await expectErrorResponse(
  response,
  'AUTHENTICATION_FAILED', // エラーコード
  401 // ステータスコード
);

// バリデーションエラーの検証
await expectValidationError(
  response,
  'title' // エラーが発生したフィールド
);
```

### テストデータファクトリーの使用

```typescript
import {
  createMockNotebook,
  createMockNotebooks,
  createMockNotebookWithPages,
  createNotebookRequestBody,
} from '@/tests/factories/notebook.factory';

// 単一のノートブック
const notebook = createMockNotebook({
  title: 'Custom Title',
  ownerId: 'user-123',
});

// 複数のノートブック
const notebooks = createMockNotebooks(5, {
  ownerId: 'user-123',
});

// ページ付きノートブック
const notebookWithPages = createMockNotebookWithPages(3, {
  title: 'Notebook with 3 pages',
});

// リクエストボディ
const requestBody = createNotebookRequestBody({
  title: 'New Notebook',
  tags: ['test'],
});
```

---

## 🔧 トラブルシューティング

### テストが失敗する場合

1. **モックが正しく設定されているか確認**
   ```typescript
   vi.mock('@/services/noteService', () => ({
     noteService: mockNoteService,
   }));
   ```

2. **beforeEachでモックをリセット**
   ```typescript
   beforeEach(() => {
     resetNoteServiceMocks();
     resetAuthMock();
   });
   ```

3. **非同期処理を正しく待機**
   ```typescript
   const response = await GET(request); // await を忘れずに
   ```

### よくあるエラー

**"Cannot read property 'json' of undefined"**
- レスポンスが正しく返されていない
- モックが正しく設定されていない

**"Expected 201 to be 400"**
- バリデーションが期待通りに動作していない
- リクエストボディの形式を確認

**"Mock function not called"**
- モックがリセットされていない
- 条件分岐で期待するパスが実行されていない

---

## 📈 今後の改善

- [ ] E2Eテストの追加（Playwright）
- [ ] パフォーマンステストの追加
- [ ] テストカバレッジ80%以上を目標
- [ ] CI/CDパイプラインへの統合
- [ ] スナップショットテストの検討

---

## 🤝 貢献

新しいテストを追加する際は、以下を確認してください：

1. ✅ 正常系、異常系、エッジケースをカバー
2. ✅ Arrange-Act-Assert パターンを使用
3. ✅ 明確なテスト名（何をテストするか）
4. ✅ モックを適切にリセット
5. ✅ ヘルパー関数を活用

---

**作成日**: 2025-10-24  
**最終更新**: 2025-10-24  
**メンテナー**: Schoolverse Development Team
