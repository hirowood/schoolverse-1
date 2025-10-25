# 🔍 Prisma リレーション使用チェックリスト

**目的**: Prismaリレーションを使用する際の命名エラーを防ぐ  
**対象**: セッション作成エラーのような命名不一致を防止  
**作成日**: 2025-10-25

---

## ✅ 実装前チェックリスト

### 1️⃣ **Prismaスキーマの確認**

- [ ] リレーション対象のモデルを `prisma/schema.prisma` で確認
- [ ] リレーション名を正確にメモ（大文字・小文字に注意）
- [ ] フィールド名とリレーション名を区別して確認

**例**:
```prisma
model Session {
  id     String @id
  userId String        // ← フィールド名（小文字）
  User   User   @relation(fields: [userId], references: [id])
  //     ↑                                                     
  //     リレーション名（大文字） ← これをコードで使用
}
```

---

### 2️⃣ **型定義の確認**

- [ ] `Prisma.[Model]CreateInput` 型を確認
- [ ] TypeScriptの型エラーがないか確認
- [ ] IDEのオートコンプリートを活用

**VSCode操作**:
1. `Prisma.SessionCreateInput` と入力
2. `Ctrl + Space` でオートコンプリート表示
3. 正しいリレーション名を確認

---

### 3️⃣ **コーディング時の確認**

- [ ] リレーション名をスキーマから直接コピー
- [ ] 大文字・小文字を正確に一致させる
- [ ] タイポがないか確認

**正しい例**:
```typescript
// ✅ 正しい：スキーマと一致
prisma.session.create({
  data: {
    User: { connect: { id: userId } },  // リレーション名 "User"
    accessToken: "...",
    refreshToken: "...",
    expiresAt: new Date(),
  }
})
```

**間違った例**:
```typescript
// ❌ 間違い：スキーマと不一致
prisma.session.create({
  data: {
    user: { connect: { id: userId } },  // 小文字 "user" はエラー
    ...
  }
})
```

---

### 4️⃣ **テスト実施**

- [ ] 単体テストでリレーション作成を確認
- [ ] エラーメッセージを確認
- [ ] 実際のデータがDBに保存されることを確認

---

## 🧪 実装後チェックリスト

### 1️⃣ **コードレビュー**

- [ ] リレーション名がスキーマと一致しているか
- [ ] 他の箇所で同様の間違いがないか
- [ ] 一貫した命名規則が守られているか

---

### 2️⃣ **動作確認**

- [ ] 開発環境でエンドツーエンドテスト
- [ ] エラーログを確認
- [ ] データベースに正しくデータが保存されているか

---

### 3️⃣ **ドキュメント更新**

- [ ] READMEにリレーション使用のルールを追加
- [ ] チームメンバーに共有
- [ ] 修正履歴を記録

---

## 🎯 よくある間違いパターン

### ❌ パターン1: フィールド名とリレーション名の混同

```prisma
model Session {
  userId String  // ← フィールド名
  User   User    // ← リレーション名
}
```

```typescript
// ❌ 間違い
{ userId: userId }  // フィールド名を使ってしまう

// ✅ 正しい
{ User: { connect: { id: userId } } }  // リレーション名を使う
```

---

### ❌ パターン2: 小文字で記述

```typescript
// ❌ 間違い
{ user: { connect: { id: userId } } }

// ✅ 正しい
{ User: { connect: { id: userId } } }
```

---

### ❌ パターン3: タイポ

```typescript
// ❌ 間違い
{ Usr: { connect: { id: userId } } }  // タイポ

// ✅ 正しい
{ User: { connect: { id: userId } } }
```

---

## 📚 Prismaリレーション名の命名規則

### 基本ルール

1. **モデル名と同じ名前を使用**（推奨）
   ```prisma
   model Session {
     User User @relation(...)  // モデル名 "User" と同じ
   }
   ```

2. **複数形の場合**
   ```prisma
   model User {
     Sessions Session[]  // 複数形
   }
   ```

3. **自己参照の場合**
   ```prisma
   model User {
     Friends    User[] @relation("UserFriends")
     FriendsOf  User[] @relation("UserFriends")
   }
   ```

---

## 🔧 トラブルシューティング

### エラー: "Argument `XXX` is missing"

**原因**: リレーション名が不一致

**解決手順**:
1. Prismaスキーマでリレーション名を確認
2. コードでその名前を正確に使用
3. TypeScriptの型エラーを確認
4. テストを実行

---

### エラー: "Unknown arg `xxx`"

**原因**: 存在しないフィールドまたはリレーション名を使用

**解決手順**:
1. スキーマで正しいフィールド名を確認
2. `npx prisma generate` を実行
3. IDEを再起動
4. 型定義を確認

---

## 💡 ベストプラクティス

### 1️⃣ **型定義を活用**

```typescript
import type { Prisma } from '@prisma/client';

// 型を明示することで、間違いを防ぐ
const createData: Prisma.SessionCreateInput = {
  User: { connect: { id: userId } },
  accessToken: "...",
  refreshToken: "...",
  expiresAt: new Date(),
};

await prisma.session.create({ data: createData });
```

---

### 2️⃣ **リポジトリパターンを使用**

```typescript
// ❌ 直接Prismaを使う（ミスしやすい）
await prisma.session.create({
  data: {
    user: { connect: { id: userId } },  // タイポの可能性
  }
});

// ✅ リポジトリを使う（型安全）
await sessionRepository.create({
  User: { connect: { id: userId } },  // Prisma.SessionCreateInput型で保護
  ...
});
```

---

### 3️⃣ **定数を使用**

```typescript
// 定数ファイル
export const PRISMA_RELATIONS = {
  SESSION_USER: 'User',
  USER_SESSIONS: 'Sessions',
} as const;

// 使用箇所
await prisma.session.create({
  data: {
    [PRISMA_RELATIONS.SESSION_USER]: { connect: { id: userId } },
    ...
  }
});
```

---

## 🎓 学習リソース

### 公式ドキュメント
- [Prisma Relations](https://www.prisma.io/docs/concepts/components/prisma-schema/relations)
- [Prisma Client API](https://www.prisma.io/docs/concepts/components/prisma-client/crud)

### チェックポイント
```typescript
// 開発時に常に確認すること
// 1. スキーマで定義されたリレーション名を使用している
// 2. 大文字・小文字が正確に一致している
// 3. TypeScriptの型エラーがない
// 4. テストでデータが正しく保存される
```

---

## ✅ 最終確認

実装完了後、以下を確認：

- [ ] Prismaスキーマと実装コードが一致
- [ ] TypeScriptの型エラーなし
- [ ] テストが全てパス
- [ ] エラーログなし
- [ ] データベースに正しくデータが保存されている
- [ ] ドキュメント更新済み
- [ ] チームメンバーに共有済み

---

**バージョン**: 1.0.0  
**最終更新**: 2025-10-25  
**参考**: セッション作成エラー修正 (BUGFIX_SESSION_CREATE_ERROR.md)
