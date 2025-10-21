# Schoolverse MVP 要件定義（抜粋）

本ファイルは IDE で共有いただいた「Schoolverse MVP要件定義書」を反映した作業用ドキュメントです。詳細は原本を参照してください。

## コア機能（MVP）
- 認証（サインアップ/ログイン/JWT）
- 仮想空間（教室1つ、WASD移動、壁衝突、プレゼンス表示）
- テキストチャット（MVP後半で実装）

## ディレクトリ方針
- `src/app`（Next.js App Router）
- `src/components`（UI/Canvas）
- `src/hooks`（`useSocket`, `useKeyboard`, `useCanvas`）
- `src/lib`（`socket/`, `webrtc/`, `utils/`）
- `src/store`（Zustand）
- `src/types`（型定義）
- `server/`（Realtime: Socket.io）
- `prisma/`（DB スキーマ）
- `docs/`（セットアップ/デプロイ/要件）

## 今後の拡張（Phase 2+）
- WebRTC 音声通話（`src/lib/webrtc/*`）
- 複数空間/DM/履歴保存 等
