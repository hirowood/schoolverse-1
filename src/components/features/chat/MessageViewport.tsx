"use client";

import { useEffect, useMemo, useRef } from 'react';
import { useChatStore } from '@/store/chatStore';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import type { SessionUser } from '@/types/session';

const formatTimestamp = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function MessageViewport() {
  const activeRoomId = useChatStore((state) => state.activeRoomId);
  const messages = useChatStore((state) => (activeRoomId ? state.messages[activeRoomId] ?? [] : []));
  const status = useChatStore((state) => (activeRoomId ? state.messageStatus[activeRoomId] ?? 'idle' : 'idle'));
  const cursor = useChatStore((state) => (activeRoomId ? state.messageCursors[activeRoomId] ?? null : null));
  const error = useChatStore((state) => (activeRoomId ? state.messageErrors[activeRoomId] : undefined));
  const loadOlder = useChatStore((state) => state.loadOlderMessages);
  const { user: authUser }: { user: SessionUser | null } = useCurrentUser();

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }, [messages]);

  const hasMore = useMemo(() => cursor !== null, [cursor]);

  if (!activeRoomId) {
    return <div className="flex grow items-center justify-center text-sm text-slate-500">Select a room to start chatting.</div>;
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-center border-b border-slate-200 py-2">
        {hasMore ? (
          <button
            type="button"
            onClick={() => loadOlder(activeRoomId)}
            disabled={status === 'loading'}
            className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === 'loading' ? 'Loading…' : 'Load older messages'}
          </button>
        ) : (
          <span className="text-xs text-slate-400">Beginning of conversation</span>
        )}
      </div>
      <div ref={containerRef} className="flex-1 overflow-y-auto bg-slate-50 px-4 py-3">
        <ul className="space-y-3">
          {messages.map((message) => {
            const isOwn = authUser?.id === message.senderId;
            return (
              <li key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] rounded-lg px-3 py-2 shadow-sm ${
                    isOwn ? 'bg-blue-600 text-white' : 'bg-white text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs opacity-80">
                    <span>{message.sender.displayName ?? 'Unknown'}</span>
                    <span>•</span>
                    <span>{formatTimestamp(message.createdAt)}</span>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                </div>
              </li>
            );
          })}
        </ul>
        {messages.length === 0 && (
          <div className="mt-6 text-center text-sm text-slate-500">No messages yet. Be the first to say hello!</div>
        )}
      </div>
      {error ? <div className="border-t border-rose-100 bg-rose-50 px-4 py-2 text-xs text-rose-600">{error}</div> : null}
    </div>
  );
}
