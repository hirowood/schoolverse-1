/**
 * EduVerse Phase 2: ControlBar
 * 
 * ビデオ会議のコントロールバー
 * ✅ ミュート/ミュート解除
 * ✅ カメラオン/オフ
 * ✅ 画面共有の開始/停止
 */

'use client';

import { useVoiceStore } from '@/store/voiceStore';
import { Mic, MicOff, Video, VideoOff, Monitor, MonitorOff } from 'lucide-react';

/**
 * ✅ ControlBar
 * 
 * ビデオ会議のコントロールバー
 */
export function ControlBar() {
  const {
    muted,
    cameraEnabled,
    screenShareEnabled,
    setMuted,
    toggleCamera,
    startScreenShare,
    stopScreenShare,
  } = useVoiceStore();

  return (
    <div className="flex items-center justify-center gap-4 p-4 bg-gray-900 border-t border-gray-700">
      {/* ━━━ ミュートボタン ━━━ */}
      <button
        onClick={() => setMuted(!muted)}
        className={`p-4 rounded-full transition-colors ${
          muted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
        }`}
        data-testid="mute-button"
        aria-label={muted ? 'ミュート解除' : 'ミュート'}
      >
        {muted ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
      </button>

      {/* ━━━ カメラボタン ━━━ */}
      <button
        onClick={toggleCamera}
        className={`p-4 rounded-full transition-colors ${
          !cameraEnabled ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
        }`}
        data-testid="camera-button"
        aria-label={cameraEnabled ? 'カメラオフ' : 'カメラオン'}
      >
        {cameraEnabled ? <Video className="w-6 h-6 text-white" /> : <VideoOff className="w-6 h-6 text-white" />}
      </button>

      {/* ━━━ 画面共有ボタン ━━━ */}
      <button
        onClick={screenShareEnabled ? stopScreenShare : startScreenShare}
        className={`p-4 rounded-full transition-colors ${
          screenShareEnabled ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
        }`}
        data-testid="screen-share-button"
        aria-label={screenShareEnabled ? '画面共有停止' : '画面共有開始'}
      >
        {screenShareEnabled ? (
          <MonitorOff className="w-6 h-6 text-white" />
        ) : (
          <Monitor className="w-6 h-6 text-white" />
        )}
      </button>
    </div>
  );
}
