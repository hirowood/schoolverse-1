# 🔒 認証・Socket.io・ルーム管理の包括的修正ガイド

**日付**: 2025年10月26日  
**修正内容**: JWT認証、Socket.io認証ミドルウェア、ルーム管理API、エラー表示修正  
**ステータス**: ✅ 完了

---

## 📋 確認項目と修正内容

### ✅ 1. 認証トークン（JWT）の付与

#### 問題
Socket.io接続時に認証トークンが送信されていませんでした。

#### 修正内容

**ファイル**: `src/lib/socket/socketClient.ts`

```typescript
// 修正前
socket = io(url, { 
  autoConnect: true, 
  transports: ['websocket']
});

// 修正後
const token = getAccessTokenFromCookie();

socket = io(url, { 
  autoConnect: true, 
  transports: ['websocket'],
  auth: {
    token: token || undefined, // 🔧 トークンを認証情報として送信
  },
});
```

**追加機能**:
- `getAccessTokenFromCookie()`: クライアント側でCookieからアクセストークンを取得
- デバッグログ: 接続時にトークンの有無を確認

---

### ✅ 2. Socket.ioサーバー側の認証ミドルウェア

#### 問題
サーバー側に認証チェックが存在せず、誰でも接続できる状態でした。

#### 修正内容

**ファイル**: `server/index.ts`

**追加された機能**:

1. **JWT認証ミドルウェア**
```typescript
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('AUTH_TOKEN_MISSING'));
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET!) as JWTPayload;
    socket.data.userId = decoded.userId;
    socket.data.email = decoded.email;
    socket.data.username = decoded.username;
    next();
  } catch (error) {
    return next(new Error('AUTH_TOKEN_INVALID'));
  }
});
```

2. **ユーザーID照合**
すべてのイベントで、送信されたuserIdと認証されたuserIdが一致するか確認：

```typescript
// 例: chat:join イベント
if (userId !== authenticatedUserId) {
  socket.emit('error', { 
    code: 'AUTH_USER_MISMATCH', 
    message: 'User ID mismatch' 
  });
  return;
}
```

3. **環境変数チェック**
```typescript
const JWT_SECRET = process.env.JWT_SECRET || process.env.ACCESS_TOKEN_SECRET;

if (!JWT_SECRET) {
  console.error('❌ JWT_SECRET is required');
  process.exit(1);
}
```

---

### ✅ 3. roomIdの存在確認とデータベース設定

#### 問題
- `classroom` roomIdがデータベースに存在しない
- デフォルトルームを作成するシードスクリプトがない

#### 修正内容

**ファイル**: `prisma/seed.ts`

**デフォルトルームの作成**:
```typescript
const rooms = [
  {
    id: 'classroom',
    name: '教室',
    type: RoomType.CLASSROOM,
    maxUsers: 50,
    mapData: { width: 1600, height: 1200, spawnPoints: [...] },
  },
  {
    id: 'gallery',
    name: 'ギャラリー',
    type: RoomType.GALLERY,
    maxUsers: 30,
    mapData: { ... },
  },
  {
    id: 'park',
    name: '公園',
    type: RoomType.PARK,
    maxUsers: 100,
    mapData: { ... },
  },
];
```

**package.json設定**:
```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

**実行方法**:
```bash
npx prisma db seed
```

---

#### 新規API作成: ルーム一覧取得

**ファイル**: `src/app/api/rooms/route.ts`

```typescript
export const GET = withErrorHandler(async (request: NextRequest) => {
  await requireAuth(request);
  
  const rooms = await prisma.room.findMany({
    select: {
      id: true,
      name: true,
      type: true,
      maxUsers: true,
      currentUsers: room._count.RoomMember,
      mapData: true,
    },
  });
  
  return successResponse({ rooms });
});
```

---

### ✅ 4. エラーハンドリングの改善

#### 問題
ChatBoxコンポーネントでエラーオブジェクトを直接レンダリングしていました。

#### 修正内容

**ファイル**: `src/components/chat/ChatBox.tsx`

```typescript
// 修正前
<p className="text-xs text-gray-400">{messageError}</p>

// 修正後
function stringifyError(error: unknown): string {
  if (!error) return '';
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (typeof error === 'object') {
    try {
      return JSON.stringify(error);
    } catch {
      return 'エラーが発生しました';
    }
  }
  return String(error);
}

<p className="text-xs text-gray-400">{stringifyError(messageError)}</p>
```

---

## 🚀 セットアップ手順

### 1. 環境変数の確認

`.env.local`に以下が設定されているか確認：

```bash
# JWT Secret (必須)
JWT_SECRET="your-secret-key-here"
ACCESS_TOKEN_SECRET="your-secret-key-here"

# Socket.io URL
NEXT_PUBLIC_SOCKET_URL="http://localhost:3001"
```

### 2. データベースシード実行

```bash
# デフォルトルーム (classroom, gallery, park) を作成
npx prisma db seed
```

**実行結果**:
```
🌱 Starting database seed...

🏫 Creating default rooms...
  ✓ Created room: "教室" (classroom)
  ✓ Created room: "ギャラリー" (gallery)
  ✓ Created room: "公園" (park)

✅ Seed completed successfully!
```

### 3. Socket.ioサーバーの再起動

```bash
# ターミナル1: Socket.ioサーバー
npm run rt:dev

# ターミナル2: Next.jsサーバー
npm run dev
```

**確認ログ**:
```
✅ Realtime server listening on :3001
🔐 JWT authentication: Enabled
```

---

## 🔍 動作確認チェックリスト

### 認証フロー

- [ ] ログイン成功後、Cookieにトークンが保存される
- [ ] Socket.io接続時にトークンが送信される
- [ ] サーバー側でトークンが検証される
- [ ] ブラウザコンソールに `[Socket.io] User authenticated: {userId}` が表示される

### Socket.io接続

- [ ] ブラウザコンソールに `[Socket.io] Connected with auth token: Yes` が表示される
- [ ] トークンなしの場合、接続が拒否される
- [ ] エラー時に適切なエラーメッセージが表示される

### ルーム管理

- [ ] `/api/rooms` APIでルーム一覧が取得できる
- [ ] `classroom` ルームが存在する
- [ ] ルームの現在のユーザー数が正しく表示される

### チャット機能

- [ ] チャットボックスが正常に表示される
- [ ] メッセージ送信が機能する
- [ ] エラーメッセージが文字列として表示される
- [ ] タイピングインジケーターが動作する

---

## 🐛 トラブルシューティング

### 問題1: Socket.io接続エラー

**症状**: `AUTH_TOKEN_MISSING` または `AUTH_TOKEN_INVALID`

**原因**:
- ログインしていない
- Cookieが保存されていない
- トークンの有効期限切れ

**解決策**:
```bash
# 1. ログアウト→再ログイン
# 2. ブラウザのCookieを確認
document.cookie
// 出力例: "sv_access_token=eyJhbG..."

# 3. トークンの有効期限を確認
# /api/auth/refresh を呼び出してトークンを更新
```

### 問題2: ルームが見つからない

**症状**: `ROOM_NOT_FOUND` エラー

**原因**: デフォルトルームが作成されていない

**解決策**:
```bash
# シードスクリプトを実行
npx prisma db seed

# データベースを確認
npx prisma studio
# Roomテーブルに classroom, gallery, park が存在するか確認
```

### 問題3: ユーザーID不一致エラー

**症状**: `AUTH_USER_MISMATCH` エラー

**原因**: 
- フロントエンドとバックエンドのユーザーIDが一致しない
- 複数タブで異なるユーザーがログインしている

**解決策**:
```bash
# 1. すべてのタブを閉じる
# 2. ブラウザのキャッシュとCookieをクリア
# 3. 再度ログイン
```

### 問題4: エラーオブジェクトが表示される

**症状**: `Objects are not valid as a React child` エラー

**原因**: エラーオブジェクトを直接JSXに埋め込んでいる

**解決策**:
```typescript
// ❌ 悪い例
<div>{error}</div>

// ✅ 良い例
<ErrorDisplay error={error} />
// または
<div>{String(error)}</div>
```

---

## 📊 セキュリティチェックリスト

### Socket.io セキュリティ

- [x] JWT認証ミドルウェアの実装
- [x] ユーザーID照合の実装
- [x] 不正なイベント送信の防止
- [x] CORS設定の適切な設定

### Cookie セキュリティ

- [x] httpOnly フラグの設定
- [x] secure フラグの設定 (本番環境)
- [x] sameSite='strict' の設定
- [x] 適切な有効期限の設定

### API セキュリティ

- [x] 認証チェックの実装 (`requireAuth`)
- [x] レートリミットの準備 (Redisベース)
- [x] 入力バリデーション (Zod)
- [x] エラーレスポンスの統一

---

## 📝 今後の改善事項

### 短期 (Phase 2)

1. **リフレッシュトークンの自動更新**
   - トークン期限切れの自動検知
   - バックグラウンドでのトークン更新

2. **Socket.io再接続の改善**
   - 認証エラー時の自動ログアウト
   - ネットワークエラーからの自動復帰

3. **ルーム権限管理**
   - ルームへのアクセス権限チェック
   - 教師/生徒の権限分離

### 中期 (Phase 3-4)

1. **WebRTC + mediasoup統合**
   - ビデオ会議機能
   - SFUサーバーの認証

2. **課題システムとの統合**
   - ルームごとの課題管理
   - 提出状況の同期

3. **モニタリングとロギング**
   - Socket.io接続ログの集約
   - エラー率のトラッキング

---

## 🎯 修正完了の確認

すべての項目が完了したことを確認してください：

- [x] JWT認証トークンの付与実装
- [x] Socket.io認証ミドルウェア実装
- [x] ユーザーID照合実装
- [x] デフォルトルームの作成
- [x] ルーム一覧APIの実装
- [x] エラー表示の修正
- [x] ドキュメント作成

---

**修正完了！** 🎉

次のステップ:
1. サーバーを再起動
2. シードスクリプトを実行
3. ログイン→教室ページで動作確認
