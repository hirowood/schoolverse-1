/**
 * EduVerse Phase 2: VideoConferencePanel
 * 
 * ビデオ会議のメインコンテナ
 * ✅ Room への参加/退出
 * ✅ VideoGrid と ControlBar の統合
 */

'use client';

import { useEffect } from 'react';
import { useVoiceStore } from '@/store/voiceStore';
import { VideoGrid } from './VideoGrid';
import { ControlBar } from './ControlBar';
import { ScreenShareView } from './ScreenShareView';

type VideoConferencePanelProps = {
  roomId: string;
  userId: string;
};

/**
 * ✅ VideoConferencePanel
 * 
 * ビデオ会議のメインコンテナ
 */
export function VideoConferencePanel({ roomId, userId }: VideoConferencePanelProps) {
  const { joinRoom, leaveRoom, isJoined, screenShareEnabled } = useVoiceStore();

  useEffect(() => {
    // ━━━ 音声ストリームを取得して Room に参加 ━━━
    const initVoice = async () => {
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        await joinRoom(roomId, userId, audioStream);
      } catch (error) {
        console.error('[VideoConferencePanel] Failed to get audio stream:', error);
      }
    };

    initVoice();

    // ━━━ クリーンアップ: Room から退出 ━━━
    return () => {
      leaveRoom();
    };
  }, [roomId, userId, joinRoom, leaveRoom]);

  if (!isJoined) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>接続中...</p>
        </div>
      </div>
    );
  }

  // ━━━ 画面共有中は専用ビューを表示 ━━━
  if (screenShareEnabled) {
    return (
      <div className="flex flex-col h-full bg-gray-900">
        <ScreenShareView />
        <ControlBar />
      </div>
    );
  }

  // ━━━ 通常のグリッドビュー ━━━
  return (
    <div className="flex flex-col h-full bg-gray-900">
      <VideoGrid />
      <ControlBar />
    </div>
  );
}
