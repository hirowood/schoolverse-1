"use client";

import { useMemo } from 'react';
import { useChatStore } from '@/store/chatStore';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import type { SessionUser } from '@/types/session';

export default function TypingIndicator() {
  const activeRoomId = useChatStore((state) => state.activeRoomId);
  const typingState = useChatStore((state) => (activeRoomId ? state.typing[activeRoomId] : undefined));
  const rooms = useChatStore((state) => state.rooms);
  const { user: authUser }: { user: SessionUser | null } = useCurrentUser();

  const typingUsers = useMemo(() => {
    if (!typingState) return [];
    const now = Date.now();
    return Object.entries(typingState.users)
      .filter(([userId, expires]) => expires > now && userId !== authUser?.id)
      .map(([userId]) => userId);
  }, [typingState, authUser]);

  const displayNames = useMemo(() => {
    if (!typingUsers.length) return [];
    return typingUsers.map((userId) => {
      const inRooms = rooms
        .flatMap((room) => room.lastMessage ? [room.lastMessage] : [])
        .find((message) => message.senderId === userId);
      return inRooms?.sender.displayName ?? userId;
    });
  }, [typingUsers, rooms]);

  if (!typingUsers.length) return null;

  const label =
    displayNames.length === 1
      ? `${displayNames[0]} is typing…`
      : displayNames.length === 2
        ? `${displayNames[0]} and ${displayNames[1]} are typing…`
        : `${displayNames[0]}, ${displayNames[1]} and others are typing…`;

  return (
    <div className="border-t border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-500">
      {label}
    </div>
  );
}
