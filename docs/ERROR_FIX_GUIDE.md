# 🔧 エラー修正: "Objects are not valid as a React child" 解決ガイド

**日付**: 2025年10月25日  
**エラー**: `Objects are not valid as a React child (found: object with keys {code, message, statusCode, timestamp, metadata})`  
**ステータス**: ✅ 解決済み

---

## 📋 問題の概要

Reactコンポーネント内で**エラーオブジェクト**を直接レンダリングしようとしたため、ランタイムエラーが発生していました。

### エラーの原因

1. **authStore.ts**: `error` プロパティにオブジェクト全体が保存される可能性があった
2. **コンポーネント**: エラーを `{error}` として直接JSXに埋め込んでいた
3. **型チェック不足**: `error` の型が `string | null` であるべきところ、実際にはオブジェクトが入る場合があった

---

## 🛠️ 実施した修正

### 1. authStore.ts の改善

**修正内容**:
- `extractErrorMessage` 関数を強化し、必ず文字列を返すように改善
- エラーオブジェクトを受け取った場合、自動的に文字列化
- catch ブロックでのエラーハンドリングを厳密化

**変更前**:
```typescript
function extractErrorMessage(data: unknown): string {
  if (typeof data === 'object' && data !== null) {
    const errorData = data as Partial<ErrorResponse>;
    if (errorData.error?.message) {
      return errorData.error.message;
    }
    if (errorData.error?.code) {
      return errorData.error.code;
    }
  }
  return 'UNKNOWN_ERROR';
}
```

**変更後**:
```typescript
function extractErrorMessage(data: unknown): string {
  // データがnullまたはundefinedの場合
  if (data == null) {
    return 'UNKNOWN_ERROR';
  }
  
  // データが文字列の場合
  if (typeof data === 'string') {
    return data;
  }
  
  // データがオブジェクトの場合
  if (typeof data === 'object') {
    const errorData = data as Partial<ErrorResponse>;
    
    // error.message が存在する場合
    if (errorData.error?.message && typeof errorData.error.message === 'string') {
      return errorData.error.message;
    }
    
    // error.code が存在する場合
    if (errorData.error?.code && typeof errorData.error.code === 'string') {
      return errorData.error.code;
    }
    
    // オブジェクト全体をJSON文字列化して返す（デバッグ用）
    try {
      return `エラーが発生しました: ${JSON.stringify(data)}`;
    } catch {
      return 'ERROR_PARSE_FAILED';
    }
  }
  
  // その他の型の場合
  return String(data) || 'UNKNOWN_ERROR';
}
```

**catchブロックの強化**:
```typescript
} catch (error) {
  // 🔧 重要: errorは必ず文字列として保存
  let errorMessage = 'LOGIN_FAILED';
  
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else if (error && typeof error === 'object') {
    errorMessage = extractErrorMessage(error);
  }
  
  set({ error: errorMessage, isLoading: false });
  throw new Error(errorMessage);
}
```

---

### 2. ErrorDisplay コンポーネントの作成

**ファイル**: `src/components/ui/ErrorDisplay.tsx`

**目的**: どんな型のエラーでも安全に文字列として表示する汎用コンポーネント

**機能**:
- オブジェクト、文字列、Error インスタンス、null/undefined に対応
- エラーオブジェクトから適切なメッセージを抽出
- JSON文字列化のフォールバック処理

**使用例**:
```tsx
// 基本的な使用
<ErrorDisplay error={error} />

// カスタムスタイル
<ErrorDisplay error={error} className="text-sm text-red-600" />

// インライン表示
<InlineError error={error} />
```

---

### 3. ログイン・登録ページの修正

**修正内容**:
- `{error}` の直接レンダリングを `<ErrorDisplay>` コンポーネントに置き換え
- エラーの安全な表示を保証

**変更前** (login/page.tsx):
```tsx
{(localError || error) && <p className="text-sm text-red-600">{localError ?? error}</p>}
```

**変更後**:
```tsx
<ErrorDisplay error={localError ?? error} />
```

---

## 🎯 修正のポイント

### 型安全性の確保

```typescript
// authStoreの型定義
type AuthState = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null; // 🔧 必ず文字列型
};
```

### 防御的プログラミング

1. **入力の検証**: すべての入力パターンをカバー
2. **型チェック**: `typeof` による厳密なチェック
3. **フォールバック**: 予期しないケースへの対応
4. **エラーログ**: デバッグ情報の保持

---

## ✅ 動作確認チェックリスト

修正後、以下を確認してください：

- [ ] 開発サーバーを再起動 (`npm run dev`)
- [ ] ログインページでエラーが正しく表示される
- [ ] 登録ページでエラーが正しく表示される
- [ ] ブラウザコンソールにエラーが表示されない
- [ ] エラーメッセージが読みやすい形式で表示される

---

## 🧪 テスト方法

### 1. ログインエラーのテスト

```bash
# 間違ったパスワードでログイン
Email: test@example.com
Password: wrongpassword
```

**期待結果**: エラーメッセージが文字列として表示される

### 2. バリデーションエラーのテスト

```bash
# 無効なメールアドレス
Email: invalid-email
Password: Password123
```

**期待結果**: バリデーションエラーが表示される

### 3. ネットワークエラーのテスト

```bash
# サーバーを停止してログインを試行
```

**期待結果**: ネットワークエラーが文字列として表示される

---

## 📚 今後の推奨事項

### 1. エラー処理の統一

すべてのコンポーネントで `<ErrorDisplay>` を使用：

```tsx
// 推奨
<ErrorDisplay error={error} />

// 非推奨
<p>{error}</p>
{error && <div>{error.message}</div>}
```

### 2. 型定義の厳密化

```typescript
// エラー型を明示的に定義
type ErrorState = string | null; // オブジェクトは不可

interface ComponentState {
  error: ErrorState;
  // ...
}
```

### 3. エラーバウンダリーの追加

将来的に、予期しないエラーをキャッチするためのError Boundaryの実装を検討：

```tsx
// 例: components/ErrorBoundary.tsx
export class ErrorBoundary extends Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }
}
```

---

## 🔍 デバッグ情報

### エラーオブジェクトの構造

APIから返されるエラーの標準形式：

```json
{
  "error": {
    "code": "AUTH_INVALID_CREDENTIALS",
    "message": "メールアドレスまたはパスワードが正しくありません",
    "statusCode": 401,
    "timestamp": "2025-10-25T00:00:00.000Z"
  }
}
```

### extractErrorMessage の処理フロー

```
入力: unknown
  ↓
null/undefined? → "UNKNOWN_ERROR"
  ↓
string? → そのまま返す
  ↓
object?
  ↓
  error.message? → 返す
  error.code? → 返す
  JSON.stringify → 返す
  ↓
その他 → String(data)
```

---

## 📝 関連ファイル

修正したファイル一覧：

1. `src/store/authStore.ts` - エラーハンドリングの強化
2. `src/components/ui/ErrorDisplay.tsx` - 新規作成
3. `src/app/(auth)/login/page.tsx` - ErrorDisplay使用
4. `src/app/(auth)/register/page.tsx` - ErrorDisplay使用

---

## 💡 学んだこと

1. **Reactの制約**: オブジェクトは直接レンダリングできない
2. **型安全性**: TypeScriptの型定義だけでは不十分、ランタイムチェックも必要
3. **防御的プログラミング**: あらゆる入力パターンを想定する
4. **コンポーネント化**: エラー表示のような共通機能は再利用可能なコンポーネントに

---

**修正完了！** 🎉

エラーが解消されない場合は、以下を確認してください：
- 開発サーバーの再起動
- ブラウザのキャッシュクリア
- コンソールのエラーメッセージの詳細確認
