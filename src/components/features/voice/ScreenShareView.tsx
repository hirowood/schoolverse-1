/**
 * EduVerse Phase 2: ScreenShareView
 * 
 * 画面共有時の専用ビュー
 * ✅ 画面共有を大きく表示
 * ✅ 参加者を小さく表示
 */

'use client';

import { useVoiceStore } from '@/store/voiceStore';
import { LocalVideoTile } from './LocalVideoTile';
import { RemoteVideoTile } from './RemoteVideoTile';

/**
 * ✅ ScreenShareView
 * 
 * 画面共有時の専用ビュー
 */
export function ScreenShareView() {
  const { participants } = useVoiceStore();
  const participantArray = Array.from(participants.values());

  // 画面共有しているユーザーを見つける
  const screenSharingParticipant = participantArray.find((p) => p.screenStream);

  return (
    <div className="flex-1 flex gap-2 p-4 overflow-hidden">
      {/* ━━━ 画面共有の大画面表示 ━━━ */}
      <div className="flex-1 bg-gray-800 rounded-lg overflow-hidden">
        {screenSharingParticipant?.screenStream ? (
          <video
            autoPlay
            playsInline
            className="w-full h-full object-contain"
            ref={(el) => {
              if (el && screenSharingParticipant.screenStream) {
                el.srcObject = screenSharingParticipant.screenStream;
              }
            }}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <p className="text-gray-400">画面共有中...</p>
          </div>
        )}
      </div>

      {/* ━━━ 参加者のサムネイル表示 ━━━ */}
      <div className="w-48 flex flex-col gap-2 overflow-y-auto">
        <LocalVideoTile />
        {participantArray.map((participant) => (
          <RemoteVideoTile key={participant.userId} participant={participant} />
        ))}
      </div>
    </div>
  );
}
