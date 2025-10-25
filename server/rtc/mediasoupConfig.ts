/**
 * mediasoup 設定
 * 
 * Worker, Router, WebRtcTransport の設定を定義
 */

export type MediasoupConfig = {
  worker: {
    logLevel: 'debug' | 'warn' | 'error' | 'none';
    logTags: string[];
    rtcMinPort: number;
    rtcMaxPort: number;
  };
  router: {
    mediaCodecs: Array<{
      kind: 'audio' | 'video';
      mimeType: string;
      clockRate: number;
      channels?: number;
      parameters?: Record<string, any>;
    }>;
  };
  webRtcTransport: {
    listenIps: Array<{ ip: string; announcedIp?: string }>;
    initialAvailableOutgoingBitrate: number;
    minimumAvailableOutgoingBitrate: number;
    turnServers: Array<{ urls: string; username?: string; credential?: string }>;
  };
};

export function createMediasoupConfig(): MediasoupConfig {
  const announcedIp = process.env.MEDIASOUP_ANNOUNCED_IP || undefined;
  return {
    worker: {
      logLevel: (process.env.MEDIASOUP_WORKER_LOG_LEVEL as any) || 'warn',
      logTags: ['info', 'ice', 'dtls', 'rtp', 'srtp', 'rtcp'],
      rtcMinPort: Number(process.env.MEDIASOUP_MIN_PORT || 40000),
      rtcMaxPort: Number(process.env.MEDIASOUP_MAX_PORT || 49999),
    },
    router: {
      mediaCodecs: [
        {
          kind: 'audio',
          mimeType: 'audio/opus',
          clockRate: 48000,
          channels: 2,
        },
        {
          kind: 'video',
          mimeType: 'video/VP8',
          clockRate: 90000,
          parameters: {
            'x-google-start-bitrate': 1000,
          },
        },
        {
          kind: 'video',
          mimeType: 'video/H264',
          clockRate: 90000,
          parameters: {
            'packetization-mode': 1,
            'profile-level-id': '42e01f',
            'level-asymmetry-allowed': 1,
          },
        },
      ],
    },
    webRtcTransport: {
      listenIps: [
        {
          ip: process.env.MEDIASOUP_LISTEN_IP || '0.0.0.0',
          announcedIp,
        },
      ],
      initialAvailableOutgoingBitrate: Number(process.env.MEDIASOUP_INITIAL_BITRATE || 600_000),
      minimumAvailableOutgoingBitrate: Number(process.env.MEDIASOUP_MIN_BITRATE || 300_000),
      turnServers: parseTurnServers(
        process.env.MEDIASOUP_TURN_URIS,
        process.env.MEDIASOUP_TURN_USERNAME,
        process.env.MEDIASOUP_TURN_PASSWORD
      ),
    },
  };
}

export function createTransportOptions(config: MediasoupConfig) {
  return {
    listenIps: config.webRtcTransport.listenIps,
    enableUdp: true,
    enableTcp: true,
    preferUdp: true,
    initialAvailableOutgoingBitrate: config.webRtcTransport.initialAvailableOutgoingBitrate,
    minimumAvailableOutgoingBitrate: config.webRtcTransport.minimumAvailableOutgoingBitrate,
    enableSctp: true,
  };
}

function parseTurnServers(uris?: string, username?: string, credential?: string) {
  if (!uris) return [] as Array<{ urls: string; username?: string; credential?: string }>;
  return uris
    .split(',')
    .map((uri) => uri.trim())
    .filter(Boolean)
    .map((urls) => ({ urls, username: username || undefined, credential: credential || undefined }));
}
