/**
 * @file ChatBox.tsx
 * @description チャット機能の統合コンポーネント
 * @features
 * - MessageList と MessageInput の統合
 * - チャットルームへの参加/退出管理
 * - 初期メッセージ読み込み
 * - Socket接続管理
 * - エラーハンドリング
 * - ローディング状態表示
 */

"use client";

import { useEffect, useState, useCallback } from 'react';
import { useChatStore } from '@/store/chatStore';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import type { SessionUser } from '@/types/session';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { MessageSquare, X, Minimize2, Maximize2 } from 'lucide-react';

type ChatBoxProps = {
  roomId: string;
  roomName?: string;
  className?: string;
};

/**
 * エラーを安全に文字列化
 */
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

/**
 * ChatBox メインコンポーネント
 * 
 * @param roomId - チャットルームのID
 * @param roomName - チャットルームの表示名
 * @param className - 追加のCSSクラス
 */
export default function ChatBox({
  roomId,
  roomName = 'チャット',
  className = '',
}: ChatBoxProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const { user }: { user: SessionUser | null } = useCurrentUser();
  const connectSocket = useChatStore((state) => state.connectSocket);
  const setActiveRoom = useChatStore((state) => state.setActiveRoom);
  const loadInitialMessages = useChatStore((state) => state.loadInitialMessages);
  const messageStatus = useChatStore((state) => state.messageStatus[roomId]);
  const messageError = useChatStore((state) => state.messageErrors[roomId]);

  // Socket接続とルーム参加
  useEffect(() => {
    if (!user?.id) return;

    // Socket接続を確立
    connectSocket();

    // チャットルームに参加
    setActiveRoom(roomId);

    // 初期メッセージを読み込み
    void loadInitialMessages(roomId);

    // クリーンアップ: ルームから退出
    return () => {
      setActiveRoom(null);
    };
  }, [user?.id, roomId, connectSocket, setActiveRoom, loadInitialMessages]);

  // 最小化トグル
  const toggleMinimize = useCallback(() => {
    setIsMinimized((prev) => !prev);
  }, []);

  // チャットボックスを閉じる
  const handleClose = useCallback(() => {
    setIsVisible(false);
  }, []);

  // チャットボックスを開く
  const handleOpen = useCallback(() => {
    setIsVisible(true);
    setIsMinimized(false);
  }, []);

  // チャットボックスが非表示の場合、開くボタンのみ表示
  if (!isVisible) {
    return (
      <button
        onClick={handleOpen}
        className="fixed bottom-4 right-4 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all flex items-center justify-center z-50"
        aria-label="チャットを開く"
      >
        <MessageSquare size={24} />
      </button>
    );
  }

  return (
    <div
      className={`
        fixed bottom-4 right-4 
        bg-white rounded-lg shadow-2xl
        transition-all duration-300 ease-in-out
        z-40
        ${isMinimized ? 'h-14' : 'h-[500px]'}
        w-[400px]
        ${className}
      `}
      style={{
        maxWidth: 'calc(100vw - 32px)',
      }}
    >
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-blue-500 text-white rounded-t-lg">
        <div className="flex items-center gap-2">
          <MessageSquare size={20} />
          <h3 className="font-semibold text-sm">{roomName}</h3>
        </div>

        <div className="flex items-center gap-1">
          {/* 最小化ボタン */}
          <button
            onClick={toggleMinimize}
            className="p-1.5 hover:bg-blue-600 rounded transition-colors"
            aria-label={isMinimized ? 'チャットを展開' : 'チャットを最小化'}
            title={isMinimized ? '展開' : '最小化'}
          >
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>

          {/* 閉じるボタン */}
          <button
            onClick={handleClose}
            className="p-1.5 hover:bg-blue-600 rounded transition-colors"
            aria-label="チャットを閉じる"
            title="閉じる"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* コンテンツエリア */}
      {!isMinimized && (
        <div className="flex flex-col h-[calc(100%-56px)]">
          {/* ローディング状態 */}
          {messageStatus === 'loading' && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-500">読み込み中...</p>
              </div>
            </div>
          )}

          {/* エラー状態 */}
          {messageStatus === 'error' && messageError && (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center">
                <p className="text-sm text-red-500 mb-2">
                  メッセージの読み込みに失敗しました
                </p>
                {/* 🔧 修正: エラーを安全に表示 */}
                <p className="text-xs text-gray-400">{stringifyError(messageError)}</p>
                <button
                  onClick={() => void loadInitialMessages(roomId)}
                  className="mt-3 px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                >
                  再試行
                </button>
              </div>
            </div>
          )}

          {/* 通常状態 */}
          {messageStatus !== 'loading' && messageStatus !== 'error' && (
            <>
              {/* メッセージリスト */}
              <MessageList roomId={roomId} />

              {/* メッセージ入力 */}
              <MessageInput
                roomId={roomId}
                disabled={!user?.id}
              />
            </>
          )}

          {/* ログインしていない場合 */}
          {!user?.id && messageStatus !== 'loading' && (
            <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
              <p className="text-sm text-gray-600">
                チャットを使用するにはログインしてください
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
