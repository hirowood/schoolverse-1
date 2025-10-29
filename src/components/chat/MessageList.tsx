/**
 * @file MessageList.tsx
 * @description チャットメッセージ一覧を表示するコンポーネント
 * @features
 * - メッセージの一覧表示（時系列順）
 * - 自分/他人のメッセージを区別して表示
 * - タイピングインジケーター
 * - 新着メッセージ時の自動スクロール
 * - メッセージ送信者名の表示
 */

"use client";

import { useEffect, useRef, useMemo } from 'react';
import { useChatStore, type ChatMessage } from '@/store/chatStore';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import type { SessionUser } from '@/types/session';

type MessageListProps = {
  roomId: string;
};

/**
 * MessageList メインコンポーネント
 * 
 * @param roomId - 表示対象のチャットルームID
 */
export default function MessageList({ roomId }: MessageListProps) {
  const messages = useChatStore((state) => state.messages[roomId] ?? []);
  const typing = useChatStore((state) => state.typing[roomId]?.users ?? {});
  const { user }: { user: SessionUser | null } = useCurrentUser();
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef(messages.length);

  // 新着メッセージ時に自動スクロール
  useEffect(() => {
    if (messages.length > prevMessageCountRef.current) {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
    prevMessageCountRef.current = messages.length;
  }, [messages.length]);

  // タイピング中のユーザー名リストを取得（自分以外）
  const typingUserIds = useMemo(() => {
    return Object.keys(typing).filter((uid) => uid !== user?.id);
  }, [typing, user?.id]);

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        ログインしてください
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-4 space-y-3"
      style={{ maxHeight: '400px' }}
    >
      {messages.length === 0 ? (
        <div className="text-center text-gray-400 text-sm py-8">
          まだメッセージがありません
        </div>
      ) : (
        messages.map((msg) => (
          <MessageItem
            key={msg.id}
            message={msg}
            isOwn={msg.senderId === user.id}
          />
        ))
      )}

      {/* タイピングインジケーター */}
      {typingUserIds.length > 0 && (
        <TypingIndicator count={typingUserIds.length} />
      )}
    </div>
  );
}

/**
 * MessageItem - 個別メッセージ表示コンポーネント
 */
type MessageItemProps = {
  message: ChatMessage;
  isOwn: boolean;
};

function MessageItem({ message, isOwn }: MessageItemProps) {
  const displayName = message.sender?.displayName ?? '匿名ユーザー';
  const timestamp = new Date(message.createdAt).toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}
    >
      {/* 送信者名とタイムスタンプ */}
      <div className="flex items-center gap-2 mb-1">
        {!isOwn && (
          <span className="text-xs font-semibold text-gray-700">
            {displayName}
          </span>
        )}
        <span className="text-xs text-gray-400">{timestamp}</span>
      </div>

      {/* メッセージバブル */}
      <div
        className={`
          max-w-[70%] px-4 py-2 rounded-2xl
          ${
            isOwn
              ? 'bg-blue-500 text-white rounded-br-sm'
              : 'bg-gray-200 text-gray-900 rounded-bl-sm'
          }
        `}
      >
        <p className="text-sm whitespace-pre-wrap break-words">
          {message.content}
        </p>
      </div>
    </div>
  );
}

/**
 * TypingIndicator - タイピング中表示
 */
type TypingIndicatorProps = {
  count: number;
};

function TypingIndicator({ count }: TypingIndicatorProps) {
  return (
    <div className="flex items-center gap-2 text-gray-500 text-sm px-2">
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span>
        {count === 1 ? '誰かが' : `${count}人が`}入力中...
      </span>
    </div>
  );
}
