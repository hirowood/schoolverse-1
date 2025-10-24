import type { WorkerSettings, RouterOptions, WebRtcTransportOptions } from "mediasoup/node/lib/types";

export type MediasoupConfig = {
  worker: WorkerSettings;
  router: RouterOptions;
  webRtcTransport: {
    listenIps: Array<{ ip: string; announcedIp?: string };
    initialAvailableOutgoingBitrate: number;
    minimumAvailableOutgoingBitrate: number;
  };
};

export function createMediasoupConfig(): MediasoupConfig {
  const announcedIp = process.env.MEDIASOUP_ANNOUNCED_IP || undefined;
  return {
    worker: {
      logLevel: (process.env.MEDIASOUP_WORKER_LOG_LEVEL as WorkerSettings["logLevel"]) || "warn",
      logTags: ["info", "ice", "dtls", "rtp", "srtp", "rtcp"],
      rtcMinPort: Number(process.env.MEDIASOUP_MIN_PORT || 40000),
      rtcMaxPort: Number(process.env.MEDIASOUP_MAX_PORT || 49999),
    },
    router: {
      mediaCodecs: [
        {
          kind: "audio",
          mimeType: "audio/opus",
          clockRate: 48000,
          channels: 2,
        },
      ],
    },
    webRtcTransport: {
      listenIps: [
        {
          ip: process.env.MEDIASOUP_LISTEN_IP || "0.0.0.0",
          announcedIp,
        },
      ],
      initialAvailableOutgoingBitrate: Number(process.env.MEDIASOUP_INITIAL_BITRATE || 600_000),
      minimumAvailableOutgoingBitrate: Number(process.env.MEDIASOUP_MIN_BITRATE || 300_000),
    },
  };
}

export function createTransportOptions(config: MediasoupConfig): WebRtcTransportOptions {
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
