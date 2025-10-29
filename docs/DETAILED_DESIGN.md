# 🏗️ EduVerse 詳細設計書 (v2.0 / v2.1.0 拡張計画反映)

**ドキュメントバージョン**: 2.1.0  
**最終更新**: 2025-10-22  
**プロジェクトコード**: schoolverse_1 (EduVerse)  
**参照元**: `docs/requirements.md`, Phase 1〜4 WBS, v2.0/2.1.0 要件  

---

## 📑 目次

1. [ドキュメント概要](#ドキュメント概要)  
2. [コンテキストとスコープ](#コンテキストとスコープ)  
3. [全体アーキテクチャ](#全体アーキテクチャ)  
4. [バックエンド詳細設計](#バックエンド詳細設計)  
5. [フロントエンド詳細設計](#フロントエンド詳細設計)  
6. [リアルタイム・メディア処理設計](#リアルタイムメディア処理設計)  
7. [データベース設計](#データベース設計)  
8. [外部サービス連携設計](#外部サービス連携設計)  
9. [WBS/ロードマップ連携設計観点](#wbsロードマップ連携設計観点)  
10. [品質保証・運用設計](#品質保証運用設計)  

---

## ドキュメント概要

- 本書は `docs/requirements.md` に基づく **v2.0/v2.1.0 拡張** を想定した詳細設計書です。  
- Phase 1〜4 の新機能 (ビデオ会議・課題/採点・多分野カリキュラム・デジタルノート/OCR/AIサポート) を段階的に統合する前提で、再利用可能なモジュール設計とコメント方針を明記しています。  
- コード変更時には、本設計書該当セクションを更新し、コミットに設計変更の要約を添えてください。  

---

## コンテキストとスコープ

| 項目 | 内容 |
|------|------|
| **目的** | 通学困難な生徒向けに、3D仮想空間で学習・交流・評価・カリキュラムを提供する統合プラットフォーム。 |
| **解決する課題 (v2.0 要求)** | リアルタイム授業 (WebRTC)、課題提出/採点、自動学習プラン、メンタルサポート、完全無料運用。 |
| **拡張計画 (v2.1.0)** | デジタルノート、OCR、AI思考整理アシスタント、学習サマリー等。 |
| **リソース制約** | Vercel / Render / Supabase / Upstash 無料枠内。 |
| **開発期間** | 2025-10 〜 2026-06 (Phase 5まで)。 |

---

## 全体アーキテクチャ

```
┌──────────────────────────────────────────────┐
│                フロントエンド (Vercel)            │
│ Next.js 15 / React 19 / TypeScript                │
│ Tailwind + shadcn/ui / Zustand                    │
│ Three.js + React-Three-Fiber (3D空間)             │
│ fabric.js / react-pdf / pdfjs-dist (ノート描画)   │
│ WebRTC (mediasoup-client) / Socket.io-client      │
└───────▲─────────────HTTPS/WSS───────────────┘
        │
┌───────▼──────────────────────────────────────────┐
│                 バックエンド (Render)              │
│ Node.js 20 / Express 4                             │
│ Socket.io 4 / mediasoup 3                          │
│ Prisma 5 (PostgreSQL)                              │
│ Multer + Sharp (課題・画像)                        │
│ OpenAI / Google Vision API クライアント           │
└───────▲──────────────────────┬─────────────────┘
        │                      │
        │                      │
┌───────▼────────────┐   ┌─────▼─────────────┐
│  データベース層     │   │  キャッシュ/キュー │
│  Supabase PostgreSQL│   │  Upstash Redis     │
│  ノート・課題・成績 │   │  セッション / Rate │
└───────────────┬───┘   └──────┬────────────┘
                │                │
        ┌───────▼────────┐   ┌──▼──────────┐
        │ ストレージ      │   │ 外部AI Services│
        │ Supabase Storage│   │ OpenAI / GCV    │
        │ PDF/画像/記録   │   │ (OCR/AI要約等)  │
        └────────────────┘   └──────────────┘
```

**レイヤリング方針**
- `src/services/**` … ドメインサービス (Auth, Classroom, Assignment, Curriculum, Note, OCR, AI)  
- `src/repositories/**` … Prisma アクセスラッパ (Mockable & 再利用)  
- `src/lib/**` … 共通ライブラリ (auth utils, realtime, webrtc wrappers, validations)  
- `src/app/api/**` … Next.js Route Handlers, Service呼び出しのみで薄く保つ  
- フロントエンドは `app/(domain)/` & `components/features/` 単位でモジュール化。  

---

## バックエンド詳細設計

### 4.1 コード設計原則
- **再利用可能なモジュール化**: services / repositories / lib 層を明確に分離し、テスト容易性と初心者が追跡しやすい構造にする。  
- **コメント指針**:  
  - ファイル冒頭に責務の要約コメント (例: `/* AuthService handles signup/login/token refresh */`)  
  - 主要メソッドに JSDoc (引数・戻り値・副作用・例外)  
  - 初学者向けに重要な流れや API 仕様は `README` ではなく該当モジュール付近にドキュメントコメントを置く。  
- **型共有**: `src/types/**` にリクエスト/レスポンスや DTO を集約 (`auth.ts`, `assignment.ts` 等)。  

### 4.2 Auth Service (Phase1 Hardening)

```
src/services/authService.ts
├─ signup(payload: SignupPayload): AuthResult
│  ├─ userRepository.findByEmail / findByUsername
│  ├─ hashPassword、signAccessToken/RefreshToken
│  └─ sessionRepository.create
├─ login(payload: LoginPayload): AuthResult
├─ refresh(payload: RefreshPayload): AuthResult
├─ logout(userId: string): void
└─ getSafeUser(userId: string): SafeUser
```

- **認証共通型**: `src/types/auth.ts` にまとめ、API routes / hooks / tests で共通利用。  
- **コメント例**: `AuthService` 冒頭に「JWT + httpOnly Cookie を使用し、フロントは cookie-include fetch で連携」と明記。  

### 4.3 課題・採点 (Phase 3)

```
src/services/assignmentService.ts (新規)
├─ createAssignment(dto)
├─ submitAssignment(dto) → Storage + DB
├─ autoGrade(assignmentId) → AI API連携
├─ teacherReview(assignmentId, rubric)
└─ fetchResults(studentId)

src/repositories/assignmentRepository.ts
├─ create / update / findById
├─ submissions.byAssignment / byStudent
└─ gradingRecords
```

- **Storage**: Supabase Storage (階層: `/assignments/{assignmentId}/{submissionId}/original.pdf`)  
- **メタデータ**: DB テーブル `Assignment`, `Submission`, `Grading` (詳細は [データベース設計](#データベース設計) を参照)  
- **AI採点**: `src/services/gradingAiService.ts` で OpenAI などと連携。JSDoc で API の呼び出し例をコメント。  

### 4.4 カリキュラム (Phase 4)

```
src/services/curriculumService.ts
├─ listDomains() / listUnits(domainId)
├─ getContent(contentId)
├─ trackProgress(studentId, unitId, status)
├─ recommendNext(studentId) → DataTeamアルゴ
└─ uploadContent(metadata, file)
```

- **Content Pipeline**: Content JSON (学年/カテゴリ/難易度) + ファイル (動画/PDF etc)  
- **レコメンド**: DataTeam 提供の `ProgressEvaluator` (別モジュール) を依存注入。  
- **コメント**: 難しいロジックは `/** レコメンドアルゴ概要: ... */` と説明を加える。  

### 4.5 ノート / OCR / AI (Phase 3.5 & 4.5)

```
src/services/noteService.ts
├─ createNotebook(metadata)
├─ savePage(noteId, pageId, vectorData) // fabric.js JSON
├─ annotatePdf(noteId, pdfAssetId, annotationLayer)
└─ shareNote (classmates, teacher)

src/services/ocrService.ts
├─ extractText(imageBinary, { mode }) // Google Vision / tesseract
└─ postProcessText (layout, formatting)

src/services/aiAssistantService.ts
├─ summarizeNotes(noteIds, level) // GPT-4o
├─ generateMindmap(noteIds or text)
└─ suggestStudyPlan(studentId)
```

- **Plan**: Phase 3.5 でノート保存基盤 + OCR PoC、Phase 4.5 でAIアシスタント統合。  
- **コメント**: API連携部には Rate Limit や API Key 取得方法を記述。  

### 4.6 ガードレール
- 例外定義: `src/lib/errors.ts` (DomainError, ValidationError など) を共通化し、API routes でハンドリング。  
- バリデーション: `src/lib/utils/validators.ts` に zod スキーマを整理。  

---

## フロントエンド詳細設計

### 5.1 ページ構造

```
src/app
├─ (auth)/{login,register}/page.tsx
├─ (virtual-space)/classroom/page.tsx
├─ (dashboard)/student/page.tsx
├─ (dashboard)/teacher/page.tsx
├─ notebooks/[noteId]/page.tsx            (Phase 3.5)
├─ assignments/[id]/page.tsx              (Phase 3)
├─ curriculum/[domain]/[unit]/page.tsx    (Phase 4)
└─ meetings/[meetingId]/page.tsx          (Phase 2)
```

### 5.2 状態管理 (Zustand)
- `src/store/authStore.ts` (DEPRECATED: NextAuthに移行済み): cookie ベースのログイン状態。`login/signup/fetchMe/logout` はコメント付きで説明済み。  
- 新規ストア:
  - `noteStore.ts`: 現在開いているノートのページ＆レイヤー状態。  
  - `assignmentStore.ts`: 課題一覧・ステータス。  
  - `meetingStore.ts`: WebRTC 接続状態 (muted, videoEnabled 等)。  
- 各ストアに `/** Summary */` コメントと `set`, `selectors` の説明を入れる。  

### 5.3 UI コンポーネント
- `components/features/notes/*`: Canvas (fabric.js) ラップ、ツールバー。  
- `components/features/assignments/*`: 提出フォーム、採点ビュー。  
- `components/features/meetings/*`: メディアコントロール、参加者リスト。  
- `components/features/curriculum/*`: コンテンツカード、進捗チャート。  
- 各コンポーネント冒頭で「役割 + 主要Props」をコメント。  

### 5.4 再利用モジュール
- `hooks/useAuthBootstrap` (すでに導入) → コメントで役割明記。  
- `hooks/useRealtimeCanvas`, `hooks/useMeetingRoom` … リアルタイム状態を統一し、初心者でも追えるよう `useEffect` ロジックにコメント。  
- `lib/api/client.ts` … fetch wrapper, CSRF/cookie 設定、エラーハンドリングコメント付与。  

---

## リアルタイム・メディア処理設計

### 6.1 Socket.io
- `server/index.ts` (TypeScript化済み)  
  - イベント: `presence:*`, `space:position:update`, `chat:*`, 追加で `meeting:join/leave`, `note:collab`.  
  - `SOCKET_EVENTS` 定数に JSDoc 追加し、イベント用途を記載。  
- WebRTC:
  - Phase 2: mediasoup SFU on Render (サーバー側 `mediasoupService.ts`)  
  - `MeetingService`: joinRoom → createTransport → produce/consume → leave  
- P2P 近接音声: 既存 P2P のまま (Phase 2 から SFU へ漸進的移行)  
- コメント: 接続/切断のライフサイクルと fallback (P2P -> SFU) をコード内に説明。  

### 6.2 ノートコラボ同期 (Phase 3.5)
- `note:page:update` イベントで diff (fabric.js JSON) を配信。  
- `note:lock` で同時編集を制限。`note:cursor` で他ユーザー位置を表示。  
- `hooks/useCollaborativeNote` に同期手順コメントを記述。  

---

## データベース設計

### 7.1 主テーブル (抜粋)

| テーブル | 主要カラム | 補足 |
|----------|------------|------|
| `User` | `username`, `displayName`, `status`, `avatarUrl`, `lastLoginAt` | v2.0で拡張済み |
| `Session` | `refreshToken`, `accessToken`, `expiresAt` | 再ログイン時に再利用 |
| `Assignment` | `title`, `description`, `dueAt`, `category`, `rubricJson` | Rubric JSON は frontend でも参照 |
| `Submission` | `assignmentId`, `studentId`, `assetPath`, `autoScore`, `teacherScore` | `assetPath` は Supabase Storage |
| `Notebook` | `title`, `ownerId`, `sharedWith`, `tags` | sharedWith は JSON 配列 |
| `NotebookPage` | `noteId`, `pageNumber`, `vectorJson`, `pdfAssetId` | fabric.js JSON を `vectorJson` に保存 |
| `OcrJob` | `inputAssetPath`, `status`, `resultText`, `confidence` | OCR 履歴 |
| `CurriculumUnit` | `domain`, `grade`, `title`, `contentAssetPath`, `metadataJson` | コンテンツ情報 |
| `Progress` | `studentId`, `unitId`, `status`, `score`, `lastReviewedAt` | レコメンドの基礎データ |

### 7.2 モデル追加時の指針
- Prisma モデルにコメント (`///`) を付与し、用途を示す。  
- マイグレーション命名例: `20260201_add_assignment_tables`.  
- 複雑な JSON フィールド (rubricJson 等) は `src/types/curriculum.ts` に型定義して共有。  

---

## 外部サービス連携設計

| 区分 | サービス | 用途 | 実装ファイル | コメント指針 |
|------|----------|------|--------------|--------------|
| AI | OpenAI GPT-4o mini | ノート要約、学習アドバイス、Mindmap | `lib/ai/openaiClient.ts`, `services/aiAssistantService.ts` | API Rate/Token の注意を JSDoc に明記 |
| OCR | Google Cloud Vision | 手書き/印刷文字認識 | `lib/ocr/visionClient.ts`, `services/ocrService.ts` | 前処理 (ノイズ除去等) の説明コメント |
| 採点 | OpenAI/Claude (TBD) | 記述式採点支援 | `services/gradingAiService.ts` | 例外処理・fallback コメント |
| メディア | mediasoup | SFU (20人ビデオ) | `services/meetingService.ts` | Transport/Producer/Consumer 流れ |
| 分析 | MindGarden (将来) | 感情トラッキング | `services/wellbeingService.ts` (placeholder) | 未実装は TODO コメント |

環境変数は `.env.example` に追加し、`README` にてキー取得手順を解説。

---

## WBS/ロードマップ連携設計観点

### 9.1 Phase ごとの技術境界

| WBS ID | 対応Service/Module | 説明 |
|--------|-------------------|------|
| 1.1 | `authService`, `authStore`, `requirements.md` | ドキュメントとコメント整備により教育用途での引継ぎ容易化。 |
| 2.1 | `meetingService`, `hooks/useMeetingRoom` | WebRTC + Socket.io 連携。コメントで P2P→SFU 切替を記述。 |
| 3.1 | `assignmentService`, `assignmentRepository`, `components/features/assignments` | 課題管理フロー。送信/採点/通知のコメント必須。 |
| 4.1 | `curriculumService`, `curriculumStore`, `components/features/curriculum` | コンテンツCMS + 進捗ロジック。アルゴリズムの意図をコメント化。 |
| 3.5 | `noteService`, `hooks/useCollaborativeNote`, `components/features/notes` | fabric.js JSON と Supabase 保存の説明を記述。 |
| 4.5 | `aiAssistantService`, `ocrService` | 外部AI連携。API制限とエラーハンドリングをコメントで案内。 |

### 9.2 ロードマップ反映
- ロードマップ各マイルストーンで「完了条件 = テスト + コメント/ドキュメント更新完了」であることを開発規約に明記。  
- Phase 終了時に `docs/DETAILED_DESIGN.md` および `docs/requirements.md` を更新する「定常タスク」を WBS に追加 (WBS: 0.x ドキュメント更新)。  

---

## 品質保証・運用設計

| 項目 | 設計内容 |
|------|----------|
| **テスト方針** | `tests/unit` (サービス/リポジトリ), `tests/integration` (API E2E), `tests/e2e` (Playwright)。主要ケースにコメントで目的を説明。 |
| **Lint/Format** | ESLint + Prettier + TypeScript strict。CI で `npm run lint && npm run type-check && npm run test`。 |
| **ログ/モニタリング** | バックエンド: pino で構造化ログ。Render のログ + Supabase logs + Vercel Observability (無料枠)。 |
| **セキュリティ** | JWT + httpOnly Cookie、Rate Limit (Redis)、アップロードファイルの MIME チェック。コメントで理由を明記。 |
| **コメント規約** | - ファイル冒頭に責務と利用例  
  - 複雑なロジックは 5〜10 行で概要説明  
  - 未実装/検討中は TODO: (担当者/目的/期日) 形式  
| **ドキュメント更新** | 設計/仕様変更 → `requirements.md` & `DETAILED_DESIGN.md` 更新が必須。CI で差分チェック (将来的に導入)。 |

---

## 付録: モジュールとコメント例

### A. AuthService 冒頭コメントサンプル
```ts
/**
 * AuthService
 * -----------
 * - HTTP-only cookies + JWT を用いた認証フローを提供
 * - signup/login/refresh/logout を統一的に管理
 * - Repository 層を利用することで DB 実装を隠蔽し、テスト容易性を担保
 */
```

### B. API Route コメント例 (`src/app/api/auth/login/route.ts`)
```ts
// POST /api/auth/login
// 1. リクエスト JSON (email, password) を zod で検証
// 2. AuthService.login で JWT & セッションを生成
// 3. httpOnly Cookie にトークンを設定しつつ、SafeUser を返す
//    → フロントエンドは cookie: include fetch で認証状態を維持する
```

### C. フロント Hook コメント例 (`hooks/useCollaborativeNote.ts`)
```ts
/**
 * useCollaborativeNote
 * - Socket.io を用いたノートページ同期ロジック
 * - fabric.js JSON 差分を送受信し、他ユーザーの編集内容を即時反映
 * - Lock/Cursor イベントで競合を緩和 (Phase 3.5)
 */
```

---

## 今後の更新について

- Phase 2 (ビデオ会議) 実装着手時に WebRTC セクションを詳細化し、mediasoup サーバー構成図を追加する。  
- Phase 3/4 完了時にノート/OCR/AI サービスの例外処理・テスト戦略を追記。  
- Phase 5 リリース候補時にセキュリティ監査項目・運用 Runbook を追補。  

---

**作成者**: Codex (ChatGPT)  
**レビュアー**: （未記入）  

この設計書を基に、コミット時は「該当セクション」の更新と PR コメントでの言及を徹底してください。  
