/**
 * EduVerse Phase 2: LocalVideoTile
 * 
 * 自分の映像タイル
 * ✅ ローカルストリームの表示
 * ✅ ミュート状態の表示
 */

'use client';

import { useEffect, useRef } from 'react';
import { useVoiceStore } from '@/store/voiceStore';
import { Mic, MicOff, Video as VideoIcon } from 'lucide-react';

/**
 * ✅ LocalVideoTile
 * 
 * 自分の映像タイル
 */
export function LocalVideoTile() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { localStream, muted, cameraEnabled } = useVoiceStore();

  useEffect(() => {
    if (!videoRef.current || !localStream) return;

    // ━━━ ビデオ要素にストリームをセット ━━━
    videoRef.current.srcObject = localStream;
  }, [localStream]);

  return (
    <div
      className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video"
      data-testid="local-video-tile"
    >
      {/* ━━━ カメラが有効な場合は映像を表示 ━━━ */}
      {cameraEnabled ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="flex items-center justify-center w-full h-full bg-gray-700">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gray-600 flex items-center justify-center mx-auto mb-2">
              <VideoIcon className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-sm text-gray-400">あなた</p>
          </div>
        </div>
      )}

      {/* ━━━ ミュート状態の表示 ━━━ */}
      <div className="absolute bottom-2 left-2 flex items-center gap-2">
        <div className={`p-2 rounded-full ${muted ? 'bg-red-500' : 'bg-gray-900/50'}`}>
          {muted ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4 text-white" />}
        </div>
        <span className="text-xs text-white bg-gray-900/50 px-2 py-1 rounded">あなた</span>
      </div>
    </div>
  );
}
