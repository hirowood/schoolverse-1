"use client";

import { useMemo } from 'react';
import { useChatStore } from '@/store/chatStore';

export default function RoomListPanel() {
  const rooms = useChatStore((state) => state.rooms);
  const roomsStatus = useChatStore((state) => state.roomsStatus);
  const roomsError = useChatStore((state) => state.roomsError);
  const activeRoomId = useChatStore((state) => state.activeRoomId);
  const setActiveRoom = useChatStore((state) => state.setActiveRoom);

  const sortedRooms = useMemo(() => {
    return [...rooms].sort((a, b) => {
      const aTime = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
      const bTime = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
      return bTime - aTime;
    });
  }, [rooms]);

  return (
    <aside className="flex flex-col">
      <header className="border-b border-slate-200 p-4">
        <h2 className="text-base font-semibold text-slate-900">Rooms</h2>
        {roomsStatus === 'loading' ? (
          <p className="text-xs text-slate-500">Fetching rooms…</p>
        ) : roomsError ? (
          <p className="text-xs text-rose-500">{roomsError}</p>
        ) : null}
      </header>
      <ul className="max-h-72 overflow-y-auto md:max-h-full">
        {sortedRooms.map((room) => {
          const isActive = room.id === activeRoomId;
          const lastMessagePreview = room.lastMessage?.content ?? 'No messages yet';
          return (
            <li key={room.id}>
              <button
                type="button"
                onClick={() => setActiveRoom(room.id)}
                className={`flex w-full flex-col items-start border-b border-slate-100 px-4 py-3 text-left transition ${
                  isActive ? 'bg-slate-100' : 'hover:bg-slate-50'
                }`}
              >
                <span className="flex w-full items-center justify-between text-sm font-medium text-slate-900">
                  {room.name}
                  {room.unreadCount > 0 ? (
                    <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white">{room.unreadCount}</span>
                  ) : null}
                </span>
                <span className="mt-1 line-clamp-1 text-xs text-slate-500">{lastMessagePreview}</span>
              </button>
            </li>
          );
        })}
        {sortedRooms.length === 0 && roomsStatus !== 'loading' ? (
          <li className="px-4 py-6 text-sm text-slate-500">No rooms found.</li>
        ) : null}
      </ul>
    </aside>
  );
}
