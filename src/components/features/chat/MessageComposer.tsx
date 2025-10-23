"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';

export default function MessageComposer() {
  const [text, setText] = useState('');
  const activeRoomId = useChatStore((state) => state.activeRoomId);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const notifyTyping = useChatStore((state) => state.notifyTyping);
  const error = useChatStore((state) => (activeRoomId ? state.messageErrors[activeRoomId] : undefined));
  const authUser = useAuthStore((state) => state.user);

  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
    };
  }, []);

  const beginTyping = () => {
    if (!activeRoomId || !authUser) return;
    notifyTyping(activeRoomId, 'started');
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      notifyTyping(activeRoomId, 'stopped');
    }, 3000);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
      return;
    }
    beginTyping();
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!activeRoomId) return;
    const content = text.trim();
    if (!content) return;

    sendMessage(activeRoomId, { content })
      .finally(() => {
        setText('');
        if (typingTimeout.current) clearTimeout(typingTimeout.current);
        notifyTyping(activeRoomId, 'stopped');
      })
      .catch(() => {
        // error state handled inside store; optional local handling here
      });
  };

  const disabled = !activeRoomId || !authUser;

  return (
    <form onSubmit={handleSubmit} className="border-t border-slate-200 bg-white px-4 py-3">
      <div className="rounded-lg border border-slate-300 bg-white focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? 'Select a room to send a message' : 'Type your message…'}
          disabled={disabled}
          rows={3}
          className="w-full resize-none rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
        {error ? <span className="text-rose-600">{error}</span> : <span>Press Enter to send • Shift+Enter for new line</span>}
        <button
          type="submit"
          disabled={disabled || text.trim().length === 0}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Send
        </button>
      </div>
    </form>
  );
}
