"use client";

import AuthGuard from '@/components/auth/AuthGuard';
import ChatLayout from '@/components/features/chat/ChatLayout';

export default function ChatPage() {
  return (
    <AuthGuard>
      <div className="mx-auto h-full w-full max-w-5xl p-4 md:p-6">
        <ChatLayout />
      </div>
    </AuthGuard>
  );
}
