/**
 * @file MessageInput.tsx
 * @description チャットメッセージ入力フォームコンポーネント
 * @features
 * - テキスト入力
 * - Enterキーで送信、Shift+Enterで改行
 * - タイピング状態の通知
 * - 送信ボタン
 * - フォーカス管理
 */

"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import { useChatStore } from '@/store/chatStore';
import { Send } from 'lucide-react';

type MessageInputProps = {
  roomId: string;
  placeholder?: string;
  disabled?: boolean;
};

/**
 * MessageInput メインコンポーネント
 * 
 * @param roomId - メッセージ送信先のルームID
 * @param placeholder - 入力欄のプレースホルダー
 * @param disabled - 入力無効化フラグ
 */
export default function MessageInput({
  roomId,
  placeholder = 'メッセージを入力...',
  disabled = false,
}: MessageInputProps) {
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const sendMessage = useChatStore((state) => state.sendMessage);
  const notifyTyping = useChatStore((state) => state.notifyTyping);

  // メッセージ送信処理
  const handleSend = useCallback(async () => {
    const trimmed = content.trim();
    if (!trimmed || isSending || disabled) return;

    setIsSending(true);
    try {
      await sendMessage(roomId, { content: trimmed, type: 'TEXT' });
      setContent('');
      
      // タイピング終了を通知
      notifyTyping(roomId, 'stopped');
      
      // フォーカスを戻す
      textareaRef.current?.focus();
    } catch (error) {
      console.error('[MessageInput] Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  }, [content, isSending, disabled, sendMessage, notifyTyping, roomId]);

  // タイピング状態の通知（デバウンス付き）
  const handleTyping = useCallback(() => {
    if (disabled) return;

    // タイピング開始を通知
    notifyTyping(roomId, 'started');

    // 既存のタイムアウトをクリア
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // 3秒後にタイピング終了を通知
    typingTimeoutRef.current = setTimeout(() => {
      notifyTyping(roomId, 'stopped');
    }, 3000);
  }, [disabled, notifyTyping, roomId]);

  // テキスト変更ハンドラー
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setContent(e.target.value);
      handleTyping();
    },
    [handleTyping],
  );

  // キーボードイベントハンドラー
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Enter押下で送信（Shiftキーなしの場合）
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        void handleSend();
      }
    },
    [handleSend],
  );

  // クリーンアップ: タイピングタイムアウトをクリア
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // クリーンアップ: アンマウント時にタイピング終了を通知
  useEffect(() => {
    return () => {
      notifyTyping(roomId, 'stopped');
    };
  }, [roomId, notifyTyping]);

  // テキストエリアの高さを自動調整
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [content, adjustTextareaHeight]);

  return (
    <div className="border-t border-gray-200 p-3 bg-white">
      <div className="flex items-end gap-2">
        {/* テキスト入力エリア */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isSending}
          rows={1}
          className={`
            flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2
            text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
            disabled:bg-gray-100 disabled:cursor-not-allowed
            transition-colors
          `}
          style={{
            minHeight: '40px',
            maxHeight: '120px',
          }}
          aria-label="メッセージ入力"
        />

        {/* 送信ボタン */}
        <button
          onClick={() => void handleSend()}
          disabled={disabled || isSending || !content.trim()}
          className={`
            flex items-center justify-center
            w-10 h-10 rounded-lg
            transition-all duration-200
            ${
              disabled || isSending || !content.trim()
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 active:scale-95 cursor-pointer'
            }
          `}
          aria-label="メッセージ送信"
          title="Enterキーで送信"
        >
          <Send
            size={18}
            className={`
              ${
                disabled || isSending || !content.trim()
                  ? 'text-gray-400'
                  : 'text-white'
              }
            `}
          />
        </button>
      </div>

      {/* ヒント表示 */}
      <div className="mt-1 text-xs text-gray-400 text-center">
        Enterで送信 / Shift+Enterで改行
      </div>
    </div>
  );
}
