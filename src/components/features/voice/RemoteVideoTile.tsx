/**
 * EduVerse Phase 2: RemoteVideoTile
 * 
 * リモートユーザーの映像タイル
 * ✅ リモートストリームの表示
 * ✅ 音声/映像の状態表示
 */

'use client';

import { useEffect, useRef } from 'react';
import type { Participant } from '@/types/mediasoup';
import { Mic, MicOff, Video as VideoIcon } from 'lucide-react';

type RemoteVideoTileProps = {
  participant: Participant;
};

/**
 * ✅ RemoteVideoTile
 * 
 * リモートユーザーの映像タイル
 */
export function RemoteVideoTile({ participant }: RemoteVideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // ━━━ 映像ストリームの設定 ━━━
  useEffect(() => {
    if (!videoRef.current || !participant.videoStream) return;
    videoRef.current.srcObject = participant.videoStream;
  }, [participant.videoStream]);

  // ━━━ 音声ストリームの設定 ━━━
  useEffect(() => {
    if (!audioRef.current || !participant.audioStream) return;
    audioRef.current.srcObject = participant.audioStream;
  }, [participant.audioStream]);

  const hasVideo = !!participant.videoStream;

  return (
    <div
      className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video"
      data-testid="remote-video-tile"
    >
      {/* ━━━ 映像ストリーム ━━━ */}
      {hasVideo ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="flex items-center justify-center w-full h-full bg-gray-700">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gray-600 flex items-center justify-center mx-auto mb-2">
              <VideoIcon className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-sm text-gray-400">
              {participant.displayName || participant.userId}
            </p>
          </div>
        </div>
      )}

      {/* ━━━ 音声ストリーム (非表示) ━━━ */}
      <audio ref={audioRef} autoPlay />

      {/* ━━━ ユーザー情報とミュート状態 ━━━ */}
      <div className="absolute bottom-2 left-2 flex items-center gap-2">
        <div className={`p-2 rounded-full ${participant.isMuted ? 'bg-red-500' : 'bg-gray-900/50'}`}>
          {participant.isMuted ? (
            <MicOff className="w-4 h-4 text-white" />
          ) : (
            <Mic className="w-4 h-4 text-white" />
          )}
        </div>
        <span className="text-xs text-white bg-gray-900/50 px-2 py-1 rounded">
          {participant.displayName || participant.userId}
        </span>
      </div>

      {/* ━━━ 話している状態の表示 ━━━ */}
      {participant.isSpeaking && (
        <div className="absolute inset-0 border-4 border-green-500 rounded-lg pointer-events-none" />
      )}
    </div>
  );
}
