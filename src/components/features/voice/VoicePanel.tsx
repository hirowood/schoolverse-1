“use client”;

import { useEffect, useMemo, useState } from "react";
import { createRTCManager } from "@/lib/rtc";
import type { RTCManager } from "@/lib/rtc/rtcManager";
import { MediasoupClient } from "@/lib/rtc/mediasoupClient";
import { getSocket } from "@/lib/socket/socketClient";
import { useAuthStore } from "@/store/authStore";
import type { VoiceUserId } from "@/types/rtc";

type VoicePanelProps = {
  roomId: string | null;
};

type Participant = {
  userId: VoiceUserId;
  displayName?: string | null;
};

export default function VoicePanel({ roomId }: VoicePanelProps) {
  const authUser = useAuthStore((state) => state.user);
  const socket = useMemo(() => getSocket(), []);
  const [rtcManager, setRtcManager] = useState<RTCManager | null>(null);
  const [sfuClient, setSfuClient] = useState<MediasoupClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const manager = createRTCManager({ socket });
    setRtcManager(manager);
    const client = new MediasoupClient({ socket });
    setSfuClient(client);

    const unsubscribeRemoteTrack = client.on("remote-track", ({ userId, stream }) => {
      attachRemoteStream(userId, stream);
    });

    const unsubscribeProducerClosed = client.on("producer-closed", ({ consumerId, userId }) => {
      if (userId) {
        detachRemoteStream(userId);
      }
    });

    const unsubscribeClientError = client.on("error", ({ error: rtcError }) => {
      console.error("[VoicePanel] mediasoup error", rtcError);
      setError(rtcError.message);
    });

    const unsubscribeTrack = manager.on("remote-track", ({ userId, stream }) => {
      attachRemoteStream(userId, stream);
    });

    const unsubscribeParticipantLeft = manager.on("participant-left", ({ userId }) => {
      detachRemoteStream(userId);
      setParticipants((prev) => prev.filter((participant) => participant.userId !== userId));
    });

    const unsubscribeLocalStream = manager.on("local-stream", (stream) => {
      attachLocalStream(stream);
    });

    const unsubscribeError = manager.on("error", ({ error: rtcError }) => {
      console.error("[VoicePanel] rtc error", rtcError);
      setError(rtcError.message);
    });

    return () => {
      unsubscribeTrack();
      unsubscribeParticipantLeft();
      unsubscribeLocalStream();
      unsubscribeError();
      unsubscribeRemoteTrack();
      unsubscribeProducerClosed();
      unsubscribeClientError();
      manager.dispose();
      setRtcManager(null);
      setSfuClient(null);
    };
  }, [socket]);

  useEffect(() => {
    if (!rtcManager || !sfuClient || !authUser?.id || !roomId) {
      setIsConnected(false);
      return;
    }

    rtcManager
      .joinRoom({
        roomId,
        userId: authUser.id,
        displayName: authUser.displayName,
      })
      .then(() => {
        setIsConnected(true);
        setError(null);
      })
      .catch((joinError) => {
        console.error("[VoicePanel] failed to join voice room", joinError);
        setError(joinError instanceof Error ? joinError.message : "Failed to join voice room");
      });

    const setupSfu = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        attachLocalStream(stream);
        await sfuClient.joinRoom({ roomId, userId: authUser.id, stream });
      } catch (sfuError) {
        console.error("[VoicePanel] mediasoup join failed", sfuError);
        setError(sfuError instanceof Error ? sfuError.message : "Failed to initialize SFU");
      }
    };

    setupSfu().catch((error) => console.error("[VoicePanel] setupSfu error", error));

    const handleUserJoined = (data: { roomId: string; userId: VoiceUserId; displayName?: string | null }) => {
      if (data.roomId !== roomId) return;
      setParticipants((prev) => {
        const exists = prev.some((participant) => participant.userId === data.userId);
        if (exists) return prev;
        return [...prev, { userId: data.userId, displayName: data.displayName }];
      });
    };

    const handleParticipants = (data: { roomId: string; participants: VoiceUserId[] }) => {
      if (data.roomId !== roomId) return;
      setParticipants(
        data.participants.map((userId) => ({
          userId,
        })),
      );
    };

    const handleUserLeft = (data: { roomId: string; userId: VoiceUserId }) => {
      if (data.roomId !== roomId) return;
      setParticipants((prev) => prev.filter((participant) => participant.userId !== data.userId));
    };

    socket.on("voice:userJoined", handleUserJoined);
    socket.on("voice:participants", handleParticipants);
    socket.on("voice:userLeft", handleUserLeft);

    return () => {
      rtcManager.leaveRoom();
      sfuClient.leaveRoom();
      setIsConnected(false);
      socket.off("voice:userJoined", handleUserJoined);
      socket.off("voice:participants", handleParticipants);
      socket.off("voice:userLeft", handleUserLeft);
      setParticipants([]);
      detachLocalStream();
      detachAllRemoteStreams();
    };
  }, [rtcManager, sfuClient, authUser?.id, authUser?.displayName, roomId, socket]);

  const handleToggleMute = async () => {
    if (!rtcManager) return;
    try {
      await rtcManager.toggleMute(!isMuted);
      setIsMuted((prev) => !prev);
    } catch (toggleError) {
      console.error("[VoicePanel] toggle mute error", toggleError);
      setError(toggleError instanceof Error ? toggleError.message : "Failed to toggle mute");
    }
  };

  if (!authUser) {
    return null;
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <header className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">音声チャネル</h3>
          <p className="text-xs text-slate-500">
            {roomId ? `ルーム: ${roomId}` : "参加するルームを選択してください"}
          </p>
        </div>
        <button
          type="button"
          onClick={handleToggleMute}
          disabled={!isConnected}
          className={`rounded-md px-3 py-1 text-xs font-semibold ${
            isMuted
              ? "bg-rose-500 text-white hover:bg-rose-600"
              : "bg-blue-600 text-white hover:bg-blue-700"
          } disabled:cursor-not-allowed disabled:opacity-60`}
        >
          {isMuted ? "ミュート解除" : "ミュート"}
        </button>
      </header>

      {error && (
        <div className="mt-3 rounded border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-600">
          {error}
        </div>
      )}

      <div className="mt-3 space-y-3">
        <div>
          <h4 className="text-xs font-semibold text-slate-600">自分の音声</h4>
          <audio id="local-voice-audio" autoPlay muted className="mt-1 w-full" />
        </div>
        <div>
          <h4 className="text-xs font-semibold text-slate-600">参加者</h4>
          {participants.length === 0 ? (
            <p className="mt-1 text-xs text-slate-500">他の参加者はいません。</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {participants.map((participant) => (
                <li
                  key={participant.userId}
                  className="flex items-center justify-between rounded border border-slate-200 px-2 py-1 text-xs text-slate-700"
                >
                  <span>{participant.displayName ?? participant.userId}</span>
                  <audio id={`remote-voice-${participant.userId}`} autoPlay className="hidden" />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function attachLocalStream(stream: MediaStream) {
  const element = document.getElementById("local-voice-audio") as HTMLAudioElement | null;
  if (element) {
    element.srcObject = stream;
  }
}

function detachLocalStream() {
  const element = document.getElementById("local-voice-audio") as HTMLAudioElement | null;
  if (element) {
    element.srcObject = null;
  }
}

function attachRemoteStream(userId: VoiceUserId, stream: MediaStream) {
  const element = document.getElementById(`remote-voice-${userId}`) as HTMLAudioElement | null;
  if (element) {
    element.srcObject = stream;
    element.classList.remove("hidden");
  }
}

function detachRemoteStream(userId: VoiceUserId) {
  const element = document.getElementById(`remote-voice-${userId}`) as HTMLAudioElement | null;
  if (element) {
    element.srcObject = null;
    element.classList.add("hidden");
  }
}

function detachAllRemoteStreams() {
  const elements = document.querySelectorAll<HTMLAudioElement>('[id^="remote-voice-"]');
  elements.forEach((element) => {
    element.srcObject = null;
    element.classList.add("hidden");
  });
}
