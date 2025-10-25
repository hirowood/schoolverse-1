/**
 * EduVerse Phase 2: ビデオ会議テストページ
 * 
 * VideoConferencePanel のテスト用ページ
 */

'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { io } from 'socket.io-client';
import { MediasoupClient } from '@/lib/rtc/mediasoupClient';
import { useVoiceStore } from '@/store/voiceStore';
import { VideoConferencePanel } from '@/components/features/voice/VideoConferencePanel';

export default function VideoConferencePage() {
  const params = useParams();
  const roomId = params.roomId as string;
  const setClient = useVoiceStore((state) => state.setClient);

  useEffect(() => {
    // ━━━ Socket.io とMediasoupClient を初期化 ━━━
    const socket = io(process.env.NEXT_PUBLIC_MEDIASOUP_URL || 'http://localhost:4001');
    const client = new MediasoupClient({ socket });

    setClient(client);

    return () => {
      socket.disconnect();
      setClient(null);
    };
  }, [setClient]);

  // ━━━ テスト用のユーザーID (実際は認証から取得) ━━━
  const userId = `user-${Math.random().toString(36).substring(7)}`;

  return (
    <div className="h-screen bg-gray-900">
      <header className="bg-gray-800 text-white p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">ビデオ会議: {roomId}</h1>
      </header>
      <main className="h-[calc(100vh-64px)]">
        <VideoConferencePanel roomId={roomId} userId={userId} />
      </main>
    </div>
  );
}
