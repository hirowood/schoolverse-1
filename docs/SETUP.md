# セットアップ手順（開発）

## 前提
- Node.js 20
- Docker / Docker Compose

## 手順
1. 依存関係インストール
   ```bash
   npm install
   ```
2. 環境変数を設定
   - `.env.local`（フロントエンド）
   - `NEXT_PUBLIC_SOCKET_URL=http://localhost:3001` 等
3. Dev用DB/Redis を起動（任意）
   ```bash
   docker compose -f docker-compose.dev.yml up -d db redis
   ```
4. Realtimeサーバ起動
   ```bash
   npm run rt:dev
   ```
5. Next.js 起動
   ```bash
   npm run dev
   ```

---
## コマンド一覧
- `npm run type-check`
- `npm run lint`
- `npm run build`
- `npm run docker:dev` / `npm run docker:dev:down`
- `npm run docker:prod` / `npm run docker:prod:down`
