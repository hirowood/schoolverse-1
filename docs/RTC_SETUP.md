# RTC / Mediasoup Setup Guide

Phase 2 で WebRTC ベースの音声・ビデオ会議を本格導入するための環境準備メモです。

## 1. 依存パッケージ

- `npm install mediasoup mediasoup-client --save`

> **Note:** mediasoup はネイティブモジュールを含むため、Linux もしくは WSL2 上でのビルドを推奨します。macOS / Windows (ネイティブ) でも動作しますが build-essential / Visual Studio Build Tools 等が必要になります。

## 2. ネットワーク / ポート

- `MEDIASOUP_PORT` (default: `4001`): シグナリング + Socket.io 用
- `MEDIASOUP_MIN_PORT` / `MEDIASOUP_MAX_PORT`: WebRTC RTP ポートレンジ (デフォルト 40000-49999)
- `MEDIASOUP_LISTEN_IP`: サーバーがバインドするローカル IP (デフォルト `0.0.0.0`)
- `MEDIASOUP_ANNOUNCED_IP`: 外部に公開するグローバル IP (NAT 越え用)
- STUN/TURN: 最低限 STUN (`stun:stun.l.google.com:19302`) を前提、企業/学校環境では TURN サーバーの併用を推奨

## 3. サーバー起動

- `npm run rt:mediasoup`

環境変数例 (.env.local or プロセス変数)

- `MEDIASOUP_PORT=4001`
- `MEDIASOUP_LISTEN_IP=0.0.0.0`
- `MEDIASOUP_ANNOUNCED_IP=xxx.xxx.xxx.xxx` (公開IP)
- `MEDIASOUP_MIN_PORT=40000`
- `MEDIASOUP_MAX_PORT=49999`

## 4. mediasoup ワーカー挙動

- ワーカーが `died` した場合は 2 秒後にプロセスを終了 (pm2 / systemd などで自動再起動させる運用を想定)
- `server/rtc/mediasoupServer.ts` 内でルーム・Peer を管理しています。現状は単一 Router を共有していますが、必要に応じてルームごとに Router を複製してください。

## 5. クライアント統合 (概要)

1. クライアントは Socket.io で `voice:join` を送信し、Router の `rtpCapabilities` を取得
2. mediasoup-client の Device で `createSendTransport` / `createRecvTransport` を準備し `voice:createTransport` -> `voice:connectTransport` -> `voice:produce` / `voice:consume`
3. 新規 Producer が追加された際 `voice:newProducer` をフックし、他ユーザーが `voice:consume` を実行

> 現状の `src/lib/rtc/rtcManager.ts` は P2P 前提です。mediasoup 版では Device 設定やサブスクを扱う専用マネージャー実装が必要になります。

## 6. 次ステップ

- TURN サーバーの導入 (coturn 等)
- 認証 / トークン検証 (声チャネルへの権限管理)
- 映像 (Video) 用の codec / Simulcast 設定
- 負荷テスト (20人同時通話) & モニタリング指標の整備

