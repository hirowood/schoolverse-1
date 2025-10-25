/**
 * EduVerse Phase 2: VideoGrid
 * 
 * 参加者の映像をグリッド表示
 * ✅ 動的なグリッドレイアウト
 * ✅ ローカル映像とリモート映像の表示
 */

'use client';

import { useVoiceStore } from '@/store/voiceStore';
import { LocalVideoTile } from './LocalVideoTile';
import { RemoteVideoTile } from './RemoteVideoTile';

/**
 * ✅ VideoGrid
 * 
 * 参加者の映像をグリッド表示
 */
export function VideoGrid() {
  const { participants } = useVoiceStore();
  const participantArray = Array.from(participants.values());

  // ━━━ グリッドのカラム数を動的に計算 ━━━
  const totalParticipants = participantArray.length + 1; // +1 for local user
  const gridCols = Math.ceil(Math.sqrt(totalParticipants));

  return (
    <div
      className="grid gap-2 p-4 flex-1 overflow-auto"
      style={{
        gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
        gridAutoRows: '1fr',
      }}
      data-testid="video-grid"
    >
      {/* ━━━ ローカルユーザーの映像 ━━━ */}
      <LocalVideoTile />

      {/* ━━━ リモートユーザーの映像 ━━━ */}
      {participantArray.map((participant) => (
        <RemoteVideoTile key={participant.userId} participant={participant} />
      ))}
    </div>
  );
}
