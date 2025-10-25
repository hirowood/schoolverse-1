# 🔌 SocketManager 使用ガイド

**作成日**: 2025-10-24  
**バージョン**: 1.0.0

---

## 📋 目次

1. [概要](#概要)
2. [アーキテクチャ](#アーキテクチャ)
3. [基本的な使い方](#基本的な使い方)
4. [API リファレンス](#apiリファレンス)
5. [トラブルシューティング](#トラブルシューティング)
6. [ベストプラクティス](#ベストプラクティス)

---

## 概要

SocketManagerは、Schoolverseプロジェクト全体でSocket.io接続を統一的に管理するためのシングルトンクラスです。

### 主な機能

✅ **型安全なイベント送受信** - TypeScriptで完全に型付けされたイベント  
✅ **自動再接続** - 切断時に自動的に再接続を試みる  
✅ **エラーハンドリング** - 接続エラーを適切に処理  
✅ **状態管理** - 接続状態をリアルタイムで監視  
✅ **React統合** - カスタムフックで簡単に使用可能

---

## アーキテクチャ

```
┌─────────────────────────────────────────┐
│         Reactコンポーネント              │
│  ┌───────────────────────────────────┐  │
│  │   useSocket() フック               │  │
│  │   useSocketEvent() フック          │  │
│  └────────────┬──────────────────────┘  │
└───────────────┼─────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│       SocketManager (シングルトン)       │
│  ┌───────────────────────────────────┐  │
│  │  - 接続管理                        │  │
│  │  - イベント送受信                  │  │
│  │  - 再接続処理                      │  │
│  │  - エラーハンドリング              │  │
│  └───────────────────────────────────┘  │
└───────────────┬─────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│        Socket.io Client Library         │
└─────────────────────────────────────────┘
                │
                ▼ WebSocket
┌─────────────────────────────────────────┐
│          Socket.io Server               │
│          (server/index.ts)              │
└─────────────────────────────────────────┘
```

---

## 基本的な使い方

### 1️⃣ 自動接続（推奨）

認証済みユーザーで自動的に接続：

```typescript
import { useSocket } from '@/hooks/useSocket';

function MyComponent() {
  const { socket, isConnected } = useSocket();
  
  return (
    <div>
      {isConnected ? '接続中' : '切断中'}
    </div>
  );
}
```

### 2️⃣ イベント受信

型安全なイベントリスナー：

```typescript
import { useSocketEvent } from '@/hooks/useSocket';

function MyComponent() {
  useSocketEvent('presence:joined', (data) => {
    console.log('ユーザー参加:', data.userId);
  });
  
  return <div>...</div>;
}
```

### 3️⃣ イベント送信

型安全なイベント送信：

```typescript
import { useSocket } from '@/hooks/useSocket';

function MyComponent() {
  const { socket } = useSocket();
  
  const sendMessage = () => {
    socket?.emit('chat:message:new', {
      roomId: 'room-123',
      userId: 'user-456',
      message: { content: 'Hello!' },
    });
  };
  
  return <button onClick={sendMessage}>送信</button>;
}
```

### 4️⃣ 接続状態の監視

詳細な接続情報を取得：

```typescript
import { useSocket } from '@/hooks/useSocket';

function ConnectionStatus() {
  const { isConnected, connectionInfo } = useSocket();
  
  return (
    <div>
      <div>状態: {connectionInfo.state}</div>
      <div>Socket ID: {connectionInfo.socketId}</div>
      <div>再接続試行: {connectionInfo.reconnectAttempts}</div>
      {connectionInfo.lastError && (
        <div>エラー: {connectionInfo.lastError}</div>
      )}
    </div>
  );
}
```

---

## API リファレンス

### SocketManager クラス

#### メソッド

##### `connect(userId: string): void`
Socket.io接続を確立します。

```typescript
import { socketManager } from '@/lib/socket/SocketManager';

socketManager.connect('user-123');
```

##### `disconnect(): void`
Socket.io接続を切断します。

```typescript
socketManager.disconnect();
```

##### `emit<K>(event: K, ...args): void`
サーバーにイベントを送信します。

```typescript
socketManager.emit('space:position:update', { x: 100, y: 200 });
```

##### `on<K>(event: K, callback): void`
サーバーからのイベントを受信します。

```typescript
socketManager.on('presence:joined', (data) => {
  console.log('User joined:', data);
});
```

##### `off<K>(event: K, callback?): void`
イベントリスナーを削除します。

```typescript
// 特定のコールバックを削除
socketManager.off('presence:joined', myCallback);

// すべてのリスナーを削除
socketManager.off('presence:joined');
```

##### `isConnected(): boolean`
接続状態を返します。

```typescript
if (socketManager.isConnected()) {
  console.log('接続中');
}
```

##### `getConnectionInfo(): SocketConnectionInfo`
詳細な接続情報を取得します。

```typescript
const info = socketManager.getConnectionInfo();
console.log(info.state); // 'connected' | 'disconnected' | ...
```

---

### useSocket フック

#### 返り値

```typescript
interface UseSocketReturn {
  socket: SocketManager | null;
  isConnected: boolean;
  connectionInfo: SocketConnectionInfo;
  reconnect: () => void;
  disconnect: () => void;
}
```

#### オプション

```typescript
interface UseSocketOptions {
  autoConnect?: boolean; // デフォルト: true
}
```

#### 使用例

```typescript
// 自動接続あり（デフォルト）
const { socket, isConnected } = useSocket();

// 自動接続なし
const { socket, reconnect } = useSocket({ autoConnect: false });
```

---

### useSocketEvent フック

#### 使用例

```typescript
useSocketEvent('presence:joined', (data) => {
  console.log('User joined:', data.userId);
});

// 依存配列を指定
useSocketEvent('chat:message:new', handleMessage, [roomId]);
```

---

## トラブルシューティング

### ❌ エラー: Socket not connected

**症状**: イベントを送信しようとすると「Socket not connected」という警告が出る

**原因**: Socket接続が確立されていない

**解決策**:
```typescript
const { socket, isConnected } = useSocket();

useEffect(() => {
  if (!socket || !isConnected) return;
  
  // ここでイベント送信
  socket.emit('...');
}, [socket, isConnected]);
```

---

### ❌ エラー: Cannot listen: Socket not initialized

**症状**: イベントリスナーを登録しようとするとエラーが出る

**原因**: SocketManagerが初期化されていない

**解決策**: `useSocketEvent`フックを使用する
```typescript
// ❌ 直接使用
socketManager.on('presence:joined', callback);

// ✅ フックを使用
useSocketEvent('presence:joined', callback);
```

---

### ⚠️ 警告: Already connected

**症状**: 複数回connect()を呼ぶと警告が出る

**原因**: 既に接続済み

**解決策**: 接続前に状態をチェック
```typescript
if (!socketManager.isConnected()) {
  socketManager.connect(userId);
}
```

---

### 🔄 再接続が失敗する

**症状**: 切断後に再接続できない

**原因**: 
1. サーバーが停止している
2. 最大再接続試行回数に達した

**解決策**:
```typescript
const { reconnect } = useSocket();

// 手動で再接続
reconnect();
```

---

## ベストプラクティス

### ✅ DO: フックを使う

```typescript
// ✅ 良い例
function MyComponent() {
  const { socket, isConnected } = useSocket();
  
  useSocketEvent('presence:joined', (data) => {
    console.log(data);
  });
}
```

```typescript
// ❌ 悪い例
import { socketManager } from '@/lib/socket/SocketManager';

function MyComponent() {
  useEffect(() => {
    socketManager.connect('user-123');
    socketManager.on('presence:joined', callback);
    
    // クリーンアップ漏れのリスク
  }, []);
}
```

---

### ✅ DO: 接続状態をチェック

```typescript
// ✅ 良い例
const { socket, isConnected } = useSocket();

const sendMessage = () => {
  if (!socket || !isConnected) {
    console.warn('Not connected');
    return;
  }
  socket.emit('chat:message:new', data);
};
```

```typescript
// ❌ 悪い例
const sendMessage = () => {
  socket.emit('chat:message:new', data); // エラーになる可能性
};
```

---

### ✅ DO: 型定義を活用

```typescript
// ✅ 良い例（型安全）
socket.emit('space:position:update', { x: 100, y: 200 });

// ❌ 悪い例（コンパイルエラー）
socket.emit('space:position:update', { invalidProp: true });
```

---

### ✅ DO: クリーンアップを忘れずに

```typescript
// ✅ 良い例（useSocketEventが自動でクリーンアップ）
useSocketEvent('presence:joined', callback);

// ✅ 良い例（手動でクリーンアップ）
useEffect(() => {
  const handler = (data) => console.log(data);
  socket?.on('presence:joined', handler);
  
  return () => {
    socket?.off('presence:joined', handler);
  };
}, [socket]);
```

---

### ✅ DO: エラーハンドリング

```typescript
// ✅ 良い例
useSocketEvent('error', (error) => {
  console.error('Socket error:', error);
  // ユーザーに通知
  toast.error(`接続エラー: ${error.message}`);
});
```

---

## チェックリスト

実装時に以下を確認してください：

- [ ] `useSocket()`フックで接続管理している
- [ ] `useSocketEvent()`でイベント受信している
- [ ] イベント送信前に`isConnected`をチェックしている
- [ ] 型定義を正しく使用している
- [ ] エラーハンドリングを実装している
- [ ] クリーンアップ処理を実装している
- [ ] テストコードを作成している

---

## 関連ドキュメント

- [Socket.io公式ドキュメント](https://socket.io/docs/)
- [TypeScript型定義: socket.types.ts](../src/types/socket.types.ts)
- [サーバー実装: server/index.ts](../server/index.ts)
- [要件定義書](./REQUIREMENTS.md)

---

**更新履歴**

| 日付 | バージョン | 変更内容 |
|------|-----------|---------|
| 2025-10-24 | 1.0.0 | 初版作成 |
