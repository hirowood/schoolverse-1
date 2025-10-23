"use client";

import { useEffect } from 'react';
import { useChatStore } from '@/store/chatStore';
import RoomListPanel from './RoomListPanel';
import MessageViewport from './MessageViewport';
import MessageComposer from './MessageComposer';
import TypingIndicator from './TypingIndicator';

export default function ChatLayout() {
  const rooms = useChatStore((state) => state.rooms);
  const roomsStatus = useChatStore((state) => state.roomsStatus);
  const activeRoomId = useChatStore((state) => state.activeRoomId);
  const setActiveRoom = useChatStore((state) => state.setActiveRoom);
  const loadInitialMessages = useChatStore((state) => state.loadInitialMessages);

  useEffect(() => {
    const { connectSocket, loadRooms } = useChatStore.getState();
    connectSocket();
    loadRooms();
  }, []);

  useEffect(() => {
    if (!activeRoomId && rooms.length > 0) {
      setActiveRoom(rooms[0].id);
    }
  }, [activeRoomId, rooms, setActiveRoom]);

  useEffect(() => {
    if (!activeRoomId) return;
    const messages = useChatStore.getState().messages[activeRoomId];
    if (!messages || messages.length === 0) {
      loadInitialMessages(activeRoomId);
    }
  }, [activeRoomId, loadInitialMessages]);

  return (
    <div className="flex h-full min-h-[600px] w-full rounded-lg border border-slate-200 bg-white text-slate-900">
      <div className="hidden w-72 border-r border-slate-200 md:block">
        <RoomListPanel />
      </div>
      <div className="flex flex-1 flex-col">
        <div className="md:hidden border-b border-slate-200">
          <RoomListPanel />
        </div>
        <main className="flex flex-1 flex-col">
          {roomsStatus === 'loading' && rooms.length === 0 ? (
            <div className="flex grow flex-col items-center justify-center text-sm text-slate-500">Loading chat rooms...</div>
          ) : rooms.length === 0 ? (
            <div className="flex grow flex-col items-center justify-center text-sm text-slate-500">
              No rooms available. Please join a room to start chatting.
            </div>
          ) : (
            <>
              <MessageViewport />
              <TypingIndicator />
              <MessageComposer />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
