# 📋 Schoolverse_1 プロジェクト要件定義書

**バージョン**: 1.0.0  
**最終更新**: 2025年10月22日  
**プロジェクトコード**: schoolverse_1  
**ドキュメント種別**: 要件定義書 (Functional Specification Document)

---

## 解決する課題 (v2.0 拡張)

`
通学困難な生徒(慢性疾患・不登校・遠隔地)が
↓
リアルタイム3D空間で学習・交流
↓
継続的な教育機会 + メンタルサポート + 社会性育成
↓ (v2.0 新機能)
ビデオ会議授業 + 課題提出・採点 + 多分野カリキュラム
`

### 1.2 v2.0 新機能サマリー

| 機能カテゴリ | 提供価値 | 優先度 |
|-------------|----------|--------|
| **ビデオ会議システム** | リアルタイム授業・グループ学習 | 🔴 Must Have |
| **課題提出・採点** | 学習評価の自動化・フィードバック | 🟡 Should Have |
| **多分野カリキュラム** | 数学・国語・理科・社会・英語・プログラミング等 | 🟡 Should Have |

### 1.3 技術的特徴(拡張版)

- **3Dリアルタイム同期**: Three.js + Socket.io
- **ビデオ会議**: WebRTC (音声+ビデオ多人数対応)
- **近接音声通話**: WebRTC P2P通信
- **課題管理**: ファイルアップロード + 自動採点(AI連携)
- **カリキュラムエンジン**: 分野別コンテンツ管理
- **ゲーミフィケーション**: 経験値・バッジ・クエストシステム
- **感情トラッキング**: MindGarden (日記+グラフ可視化)
- **完全無料運用**: Vercel + Render + Supabase (無料枠)

---

## 2. プロジェクト概要

### 2.1 基本情報

| 項目 | 内容 |
|------|------|
| **プロジェクト名** | EduVerse (エデュバース) |
| **サブタイトル** | 3D Metaverse Comprehensive Learning Platform |
| **開発期間** | 2025年10月〜2026年6月 (8ヶ月) ← 延長 |
| **フェーズ** | Phase 1: MVP → Phase 2: ビデオ会議 → Phase 3: 課題・カリキュラム |
| **ライセンス** | MIT License (オープンソース予定) |

### 2.2 プロジェクトスコープ v2.0

#### ✅ 含まれるもの (In Scope)
`
【Phase 1: 基本機能 (v1.0)】
✅ 3D仮想教室・ギャラリー・公園の実装
✅ リアルタイムアバター移動システム
✅ 近接音声通話(WebRTC P2P)
✅ テキストチャット(全体・DM)
✅ 出席・学習時間記録
✅ 感情・体調トラッキング
✅ ゲーミフィケーション(経験値・バッジ・クエスト)
✅ 生徒用ダッシュボード
✅ 教師・支援者用管理画面

【Phase 2: ビデオ会議機能 (v2.0 NEW)】
✅ グループビデオ通話(最大20人)
✅ 画面共有機能
✅ ホワイトボード機能
✅ 録画機能(教師のみ)
✅ 授業スケジュール管理
✅ 仮想教室での授業開催

【Phase 3: 課題・評価システム (v2.0 NEW)】
✅ 課題作成・配布
✅ ファイルアップロード(PDF/Word/画像)
✅ 提出期限管理
✅ 採点・コメント機能
✅ 自動採点(選択式問題)
✅ AI採点アシスタント(記述式)
✅ 成績集計・レポート

【Phase 4: カリキュラム管理 (v2.0 NEW)】
✅ 分野別コンテンツ管理
   ├─ 数学(小学〜高校)
   ├─ 国語(読解・作文)
   ├─ 理科(実験動画含む)
   ├─ 社会(地理・歴史)
   ├─ 英語(リスニング含む)
   ├─ プログラミング(Scratch/Python)
   ├─ 芸術(音楽・美術)
   └─ 体育(自宅エクササイズ)
✅ 学習進捗管理
✅ 推奨学習パス
✅ 復習アルゴリズム
✅ コンテンツアップロード(教師)

【Phase 5: インフラ】
✅ Docker開発環境
✅ Vercel + Render デプロイ
✅ CI/CD (GitHub Actions)
`

#### ❌ 含まれないもの (Out of Scope)
`
❌ モバイルネイティブアプリ(Web PWA対応のみ)
❌ VRヘッドセット対応(将来検討)
❌ 決済機能(完全無料)
❌ 保護者向け専用アプリ(Webで閲覧可)
`

---

### 2.3 WBS (v2.0 基準)

| WBS ID | フェーズ | 主タスク | 担当ロール | 期間(目安) | 完了条件 |
|--------|----------|-----------|------------|-------------|-----------|
| 1.1 | Phase 1 | 認証基盤リファイン・ドキュメント整備 | Backend Lead | 2025-10 | API v2審査通過・仕様レビュー完了 |
| 1.2 | Phase 1 | 3D空間リファクタリングとソケット最適化 | Metaverse Team | 2025-11 | パフォーマンス指標(60FPS)達成 |
| 2.1 | Phase 2 | ビデオ会議SFU構築(WebRTC/mediasoup) | RTC Team | 2025-12〜2026-01 | 20人通話負荷テスト合格 |
| 2.2 | Phase 2 | 授業スケジュール/録画管理UI | Frontend Team | 2026-01 | 教師向けUXレビュー承認 |
| 3.1 | Phase 3 | 課題提出API・ストレージ設計 | Backend Team | 2026-02 | 提出→採点フローの統合テスト合格 |
| 3.2 | Phase 3 | 自動採点エンジン & AI採点アシスト | AI/ML Team | 2026-02〜03 | 新旧採点差分5%以内 |
| 4.1 | Phase 4 | カリキュラムCMS・コンテンツ Pipeline | Curriculum Team | 2026-03 | 7分野コンテンツ登録完了 |
| 4.2 | Phase 4 | 学習進捗 & 推奨パスアルゴリズム | Data Team | 2026-04 | 推奨精度80%以上 (検証データ) |
| 5.1 | Phase 5 | インフラIaC / CI 拡張 | DevOps | 2025-10〜継続 | GitHub Actions + 監視基盤稼働 |
| 5.2 | Phase 5 | セキュリティ & 法務レビュー | PM/Compliance | 2026-05 | Pen-test & 個人情報保護チェック合格 |

### 2.4 開発ロードマップ (ガントチャート概要)

| 期間 | マイルストーン | 主な成果物 | 依存関係 |
|------|----------------|------------|-----------|
| 2025-10〜11 | Phase 1 Hardening | 認証・3D空間の性能/ドキュメント補強、Moodトラッキング改善 | 既存MVP |
| 2025-12〜2026-01 | Phase 2 Beta | グループビデオ・画面共有・録画、ホワイトボードβ | Phase1完了 |
| 2026-02〜03 | Phase 3 Alpha | 課題提出/採点、AI採点アシスト PoC | Phase2機能安定 |
| 2026-03〜04 | Phase 4 Pilot | カリキュラムCMS+進捗追跡、推奨学習パス | Phase3の課題システム |
| 2026-05 | Phase 5 Release Candidate | インフラ整備、セキュリティ監査、教師/生徒向けオンボーディング資料 | Phase1〜4完了 |
| 2026-06 | GA リリース | EduVerse v2.0 公開、支援自治体/学校への展開 | 全マイルストーン達成 |
## 3. 目的と背景

### 3.1 背景分析

#### 3.1.1 社会的背景
`
【日本の教育課題】
┌─────────────────────────────────┐
│ 不登校生徒数: 約29.9万人 (2022年度)   │
│ 前年比22.1%増加 - 過去最多           │
│                                     │
│ 長期欠席理由:                        │
│ ├─ 無気力・不安: 49.7%              │
│ ├─ いじめ以外の友人関係: 11.5%       │
│ ├─ 生活リズムの乱れ: 11.7%           │
│ └─ 病気(慢性疾患含む): 7.2%         │
│                                     │
│ 出典: 文部科学省「令和4年度調査」    │
└─────────────────────────────────┘

【オンライン教育の課題】
❌ 一方通行の動画授業 → 双方向性の欠如
❌ 孤独感・疎外感 → メンタルケア不足
❌ 課題管理の煩雑さ → 提出・評価の非効率
❌ 学習進捗の不透明さ → 個別最適化困難
`

---
## 📑 目次

1. [ドキュメント概要](#ドキュメント概要)
2. [段階的思考による要件分解](#段階的思考による要件分解)
3. [逆算思考による実装戦略](#逆算思考による実装戦略)
4. [メタ思考による設計判断](#メタ思考による設計判断)
5. [ツリー構造による依存関係](#ツリー構造による依存関係)
6. [システムアーキテクチャ詳細](#システムアーキテクチャ詳細)
7. [データベース設計](#データベース設計)
8. [API仕様](#api仕様)
9. [フロントエンド設計](#フロントエンド設計)
10. [リアルタイム通信設計](#リアルタイム通信設計)
11. [状態管理設計](#状態管理設計)
12. [エラーハンドリング戦略](#エラーハンドリング戦略)
13. [セキュリティ実装](#セキュリティ実装)
14. [パフォーマンス最適化](#パフォーマンス最適化)
15. [テスト戦略](#テスト戦略)
16. [デプロイメント戦略](#デプロイメント戦略)

---

## 📝 ドキュメント概要

### 目的

本ドキュメントは「Schoolverse_1 プロジェクト要求定義書 v2.0.0」で定義された要求を、実装可能な技術要件に落とし込んだものです。

### 対象読者

- 開発者(あなた)
- 将来的な協力開発者
- コードレビュアー
- プロジェクトマネージャー

### 使い方

1. 実装前に該当セクションを熟読
2. 設計の意図と制約を理解
3. チェックリストに従って実装
4. テスト要件を満たすことを確認

---

## 🔄 段階的思考による要件分解

### レベル1: システム全体アーキテクチャ

```
Schoolverse_1 システム
│
├── フロントエンド層 (Next.js 15 + React 19)
│   ├── プレゼンテーション層
│   ├── ビジネスロジック層
│   └── データアクセス層
│
├── バックエンド層 (Next.js API Routes)
│   ├── API層
│   ├── サービス層
│   └── データアクセス層
│
├── リアルタイム通信層 (Socket.io + WebRTC)
│   ├── Socket.ioサーバー
│   ├── WebRTCシグナリング
│   └── イベント管理
│
├── データ層
│   ├── PostgreSQL (永続化データ)
│   └── Redis (キャッシュ・セッション)
│
└── インフラ層
    ├── Docker Compose (開発環境)
    ├── Vercel (フロントエンド本番)
    └── Render/Railway (バックエンド本番)
```

### レベル2: 各層の詳細分解

#### フロントエンド層の分解

```
フロントエンド
│
├── 1. ページ層 (app/)
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   └── world/page.tsx
│   └── api/ (API Routes)
│
├── 2. コンポーネント層 (components/)
│   ├── ui/ (shadcn/ui)
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Card.tsx
│   ├── features/
│   │   ├── auth/
│   │   ├── world/
│   │   ├── chat/
│   │   └── voice/
│   └── layout/
│       ├── Header.tsx
│       └── Sidebar.tsx
│
├── 3. 状態管理層 (stores/)
│   ├── authStore.ts (Zustand)
│   ├── worldStore.ts
│   ├── chatStore.ts
│   └── voiceStore.ts
│
├── 4. ビジネスロジック層 (lib/)
│   ├── canvas/
│   │   ├── CanvasRenderer.ts
│   │   ├── AvatarManager.ts
│   │   └── CollisionDetector.ts
│   ├── socket/
│   │   ├── SocketManager.ts
│   │   └── EventHandlers.ts
│   └── webrtc/
│       ├── RTCManager.ts
│       └── SignalingHandler.ts
│
└── 5. 型定義層 (types/)
    ├── api.types.ts
    ├── socket.types.ts
    ├── world.types.ts
    └── user.types.ts
```

#### バックエンド層の分解

```
バックエンド
│
├── 1. API層 (app/api/)
│   ├── auth/
│   │   ├── login/route.ts
│   │   ├── signup/route.ts
│   │   └── refresh/route.ts
│   ├── users/
│   │   ├── [id]/route.ts
│   │   └── me/route.ts
│   ├── messages/
│   │   ├── route.ts
│   │   └── [roomId]/route.ts
│   └── rooms/
│       └── route.ts
│
├── 2. サービス層 (services/)
│   ├── authService.ts
│   ├── userService.ts
│   ├── messageService.ts
│   └── roomService.ts
│
├── 3. データアクセス層 (repositories/)
│   ├── userRepository.ts
│   ├── messageRepository.ts
│   └── roomRepository.ts
│
├── 4. ミドルウェア層 (middleware/)
│   ├── authMiddleware.ts
│   ├── validationMiddleware.ts
│   ├── errorHandler.ts
│   └── rateLimiter.ts
│
└── 5. ユーティリティ層 (utils/)
    ├── jwt.ts
    ├── bcrypt.ts
    ├── validation.ts
    └── logger.ts
```

### レベル3: 機能単位の詳細分解

#### 認証システムの詳細

```
認証システム
│
├── フロントエンド
│   ├── 1. ログインフォーム
│   │   ├── バリデーション (Zod)
│   │   ├── エラー表示
│   │   └── ローディング状態
│   │
│   ├── 2. サインアップフォーム
│   │   ├── 入力バリデーション
│   │   ├── パスワード強度チェック
│   │   └── 確認メール送信UI
│   │
│   └── 3. 認証状態管理
│       ├── トークン保存 (httpOnly Cookie)
│       ├── リフレッシュトークン処理
│       └── 自動ログアウト
│
├── バックエンド
│   ├── 1. サインアップAPI
│   │   ├── 入力バリデーション
│   │   ├── 重複チェック
│   │   ├── パスワードハッシュ化 (bcrypt)
│   │   └── ユーザー作成
│   │
│   ├── 2. ログインAPI
│   │   ├── 認証情報検証
│   │   ├── JWT トークン生成
│   │   ├── リフレッシュトークン生成
│   │   └── Cookie設定
│   │
│   └── 3. トークンリフレッシュAPI
│       ├── リフレッシュトークン検証
│       ├── 新規アクセストークン生成
│       └── Cookie更新
│
└── データベース
    └── User テーブル
        ├── id (UUID)
        ├── email (UNIQUE)
        ├── passwordHash
        ├── username
        ├── createdAt
        └── updatedAt
```

---

## 🎯 逆算思考による実装戦略

### 最終目標: 本番運用可能なMVP

```
本番環境で50名が同時利用できる状態
│
└─ 必要条件: パフォーマンス・安定性・セキュリティの担保
   │
   └─ 必要条件: 包括的なテストの実施
      │
      └─ 必要条件: 全機能の統合完了
         │
         └─ 必要条件: 各機能の個別実装完了
            │
            └─ 必要条件: 詳細設計の完了
               │
               └─ **現在位置: 要件定義書の作成** ✅
```

### 実装順序の決定 (逆算ベース)

#### Phase 1: 基盤構築 (Week 1-2)

**目標**: 開発環境と基本構造の確立

```
最終状態: 認証が動作し、基本的なページ遷移が可能
  ↑
ステップ4: フロントエンドとバックエンドの統合
  ↑
ステップ3: 認証APIの実装
  ↑
ステップ2: データベーススキーマの作成
  ↑
ステップ1: プロジェクト構造の作成
```

**具体的タスク**:
1. Next.js プロジェクト初期化
2. TypeScript設定
3. Prisma セットアップ
4. Docker Compose 設定
5. 共通型定義ファイル作成
6. 認証システム実装
7. ルーティング設定

#### Phase 2: 仮想空間実装 (Week 3-5)

**目標**: 1つの仮想空間でアバター移動と複数ユーザー同期

```
最終状態: 複数ユーザーが同じ空間で互いのアバターを見ながら移動
  ↑
ステップ5: 位置同期の最適化
  ↑
ステップ4: Socket.ioでの位置同期
  ↑
ステップ3: アバター移動ロジック
  ↑
ステップ2: Canvas描画システム
  ↑
ステップ1: ゲームループの実装
```

**具体的タスク**:
1. Canvas初期化とレンダリングループ
2. タイルマップシステム
3. アバター描画システム
4. キーボード入力処理
5. 衝突検知システム
6. Socket.io統合
7. 位置同期イベント実装

#### Phase 3: コミュニケーション機能 (Week 6-8)

**目標**: テキストチャットと音声通話の実装

```
最終状態: ユーザー同士がテキストと音声で会話可能
  ↑
ステップ6: 近接ベース自動通話
  ↑
ステップ5: WebRTC音声通話
  ↑
ステップ4: チャット履歴の永続化
  ↑
ステップ3: ルームチャットの実装
  ↑
ステップ2: Socket.ioチャットイベント
  ↑
ステップ1: チャットUI実装
```

---

## 🧠 メタ思考による設計判断

### 設計原則の俯瞰

#### 1. スケーラビリティを意識した設計

**判断基準**:
```
現在の要求: 50名同時接続
将来の可能性: 500名同時接続

設計の選択:
✅ 採用: Redis Adapter (水平スケーリング可能)
✅ 採用: 状態の分離 (ステートレス設計)
✅ 採用: CDN活用 (静的アセット配信)
❌ 不採用: インメモリ状態管理のみ (スケールしない)
```

**実装への影響**:
- Socket.ioサーバーはRedis Adapterを使用
- セッション情報はRedisに保存
- ユーザー状態はデータベースで管理
- WebRTC接続はP2Pで直接確立

#### 2. 保守性を重視した構造

**判断基準**:
```
開発者: 1名（現在）→ 複数名（将来）
コードベース寿命: 1年以上

設計の選択:
✅ 採用: TypeScript (型安全性)
✅ 採用: コンポーネント分離 (責任の明確化)
✅ 採用: 共通型定義 (インターフェース統一)
✅ 採用: JSDocコメント (ドキュメント埋め込み)
❌ 不採用: 巨大な単一ファイル
```

**実装への影響**:
- すべてのコンポーネントは単一責任
- 型定義は `types/` ディレクトリに集約
- 各関数にJSDocコメント必須
- ファイル分割の徹底 (最大300行)

#### 3. セキュリティ最優先

**判断基準**:
```
ターゲットユーザー: 未成年含む
データの性質: 個人情報・会話内容

設計の選択:
✅ 採用: JWT + httpOnly Cookie
✅ 採用: HTTPS必須
✅ 採用: CORS厳格設定
✅ 採用: レートリミット
✅ 採用: 入力サニタイゼーション
❌ 不採用: localStorage でのトークン保存
```

**実装への影響**:
- 認証トークンはhttpOnly Cookie
- すべてのAPI入力にバリデーション
- XSS対策の徹底
- CSRF対策の実装
- SQLインジェクション対策（Prisma ORM）

#### 4. パフォーマンス最適化

**判断基準**:
```
ターゲットデバイス: PC・タブレット
ネットワーク: 不安定な可能性あり

設計の選択:
✅ 採用: オフスクリーンCanvas (描画最適化)
✅ 採用: デバウンス・スロットル (イベント削減)
✅ 採用: レンダリング最適化 (表示範囲のみ描画)
✅ 採用: 自動再接続 (Socket.io)
❌ 不採用: 毎フレーム全体再描画
```

**実装への影響**:
- Canvas描画は差分更新
- Socket.ioイベントは適切な頻度制限
- 画像はWebP形式
- コンポーネントのメモ化

---

## 🌳 ツリー構造による依存関係

### システム依存関係ツリー

```
Schoolverse_1 システム
│
├── レベル0: インフラストラクチャ (他に依存しない)
│   ├── PostgreSQL データベース
│   ├── Redis キャッシュサーバー
│   └── Node.js ランタイム
│
├── レベル1: 基盤レイヤー (インフラに依存)
│   ├── Prisma ORM
│   │   └── 依存: PostgreSQL
│   ├── JWT ユーティリティ
│   │   └── 依存: なし
│   ├── bcrypt ユーティリティ
│   │   └── 依存: なし
│   └── Logger
│       └── 依存: なし
│
├── レベル2: データアクセス層 (基盤に依存)
│   ├── userRepository
│   │   └── 依存: Prisma
│   ├── messageRepository
│   │   └── 依存: Prisma
│   └── roomRepository
│       └── 依存: Prisma
│
├── レベル3: ビジネスロジック層 (データアクセスに依存)
│   ├── authService
│   │   ├── 依存: userRepository
│   │   ├── 依存: JWT
│   │   └── 依存: bcrypt
│   ├── userService
│   │   └── 依存: userRepository
│   ├── messageService
│   │   └── 依存: messageRepository
│   └── roomService
│       └── 依存: roomRepository
│
├── レベル4: API層 (ビジネスロジックに依存)
│   ├── /api/auth/*
│   │   └── 依存: authService
│   ├── /api/users/*
│   │   └── 依存: userService
│   ├── /api/messages/*
│   │   └── 依存: messageService
│   └── /api/rooms/*
│       └── 依存: roomService
│
├── レベル5: リアルタイム通信層 (API層に依存)
│   ├── Socket.io サーバー
│   │   ├── 依存: Redis
│   │   ├── 依存: authService (認証)
│   │   └── 依存: messageService
│   └── WebRTC シグナリング
│       └── 依存: Socket.io
│
└── レベル6: フロントエンド層 (全てに依存)
    ├── ページ
    │   └── 依存: コンポーネント
    ├── コンポーネント
    │   └── 依存: 状態管理・API
    ├── 状態管理 (Zustand)
    │   └── 依存: API
    ├── Canvas システム
    │   └── 依存: Socket.io
    └── WebRTC クライアント
        └── 依存: Socket.io シグナリング
```

### 機能間依存関係

```
認証システム (独立)
  │
  ├→ ユーザープロフィール (認証に依存)
  │     │
  │     └→ アバター管理 (プロフィールに依存)
  │
  ├→ 仮想空間システム (認証に依存)
  │     │
  │     ├→ Canvas描画 (空間に依存)
  │     ├→ 移動システム (空間に依存)
  │     └→ 衝突検知 (空間に依存)
  │
  ├→ チャットシステム (認証に依存)
  │     │
  │     ├→ ルームチャット (チャットに依存)
  │     └→ DM (チャットに依存)
  │
  └→ 音声通話システム (認証に依存)
        │
        ├→ 1対1通話 (音声に依存)
        ├→ グループ通話 (音声に依存)
        └→ 近接通話 (音声 + 空間に依存)
```

### データフロー依存関係

```
ユーザー入力
  │
  ├→ バリデーション
  │     │
  │     ├→ OK → API送信
  │     │        │
  │     │        └→ サーバー処理
  │     │              │
  │     │              ├→ DB操作
  │     │              │   │
  │     │              │   └→ 成功 → レスポンス
  │     │              │             │
  │     │              │             └→ UI更新
  │     │              │
  │     │              └→ Socket.io イベント
  │     │                    │
  │     │                    └→ 他ユーザーへブロードキャスト
  │     │                          │
  │     │                          └→ クライアントで受信
  │     │                                │
  │     │                                └→ Canvas更新
  │     │
  │     └→ NG → エラー表示
  │
  └→ (バリデーションなし) → エラー
```

---

## 🏗️ システムアーキテクチャ詳細

### 全体アーキテクチャ図

```
┌─────────────────────────────────────────────────────────────┐
│                        クライアント                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │            Next.js 15 + React 19                      │   │
│  │  ┌─────────────┐  ┌──────────────┐  ┌────────────┐  │   │
│  │  │   Pages     │  │  Components  │  │   Stores   │  │   │
│  │  │   (App      │  │  (UI + Logic)│  │  (Zustand) │  │   │
│  │  │   Router)   │  │              │  │            │  │   │
│  │  └──────┬──────┘  └──────┬───────┘  └─────┬──────┘  │   │
│  │         │                │                 │         │   │
│  │  ┌──────┴────────────────┴─────────────────┴──────┐  │   │
│  │  │         Canvas Rendering Engine                 │  │   │
│  │  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │  │   │
│  │  │  │ Renderer │  │  Avatar  │  │  Collision   │ │  │   │
│  │  │  │          │  │  Manager │  │   Detector   │ │  │   │
│  │  │  └──────────┘  └──────────┘  └──────────────┘ │  │   │
│  │  └─────────────────────────────────────────────────┘  │   │
│  └───────────┬──────────────────┬───────────────────────┘   │
│              │                  │                           │
│              │ HTTPS            │ WebSocket                 │
│              │                  │                           │
└──────────────┼──────────────────┼───────────────────────────┘
               │                  │
               ▼                  ▼
┌──────────────────────────────────────────────────────────────┐
│                        サーバー                               │
│  ┌──────────────────────────────────────────────────────┐    │
│  │            Next.js API Routes + Socket.io             │    │
│  │  ┌──────────────┐         ┌─────────────────────┐    │    │
│  │  │   REST API   │         │   Socket.io Server  │    │    │
│  │  │   Endpoints  │         │   + WebRTC Signal   │    │    │
│  │  └──────┬───────┘         └──────────┬──────────┘    │    │
│  │         │                            │               │    │
│  │  ┌──────┴────────────────────────────┴──────┐        │    │
│  │  │           Services Layer                  │        │    │
│  │  │  ┌────────┐  ┌────────┐  ┌────────────┐ │        │    │
│  │  │  │  Auth  │  │  User  │  │  Message   │ │        │    │
│  │  │  │Service │  │Service │  │  Service   │ │        │    │
│  │  │  └────┬───┘  └────┬───┘  └─────┬──────┘ │        │    │
│  │  └───────┼───────────┼────────────┼────────┘        │    │
│  │          │           │            │                 │    │
│  │  ┌───────┴───────────┴────────────┴────────┐        │    │
│  │  │        Repositories Layer                │        │    │
│  │  │  ┌────────────┐      ┌────────────────┐ │        │    │
│  │  │  │   Prisma   │      │   Redis Client │ │        │    │
│  │  │  │   Client   │      │                │ │        │    │
│  │  │  └─────┬──────┘      └────────┬───────┘ │        │    │
│  │  └────────┼───────────────────────┼─────────┘        │    │
│  └───────────┼───────────────────────┼──────────────────┘    │
│              │                       │                       │
│              ▼                       ▼                       │
│  ┌───────────────────┐   ┌──────────────────┐               │
│  │   PostgreSQL      │   │     Redis        │               │
│  │   (Main DB)       │   │   (Cache/Queue)  │               │
│  └───────────────────┘   └──────────────────┘               │
└──────────────────────────────────────────────────────────────┘
```

### フォルダ構造

```
schoolverse_1/
├── .env.local                    # 環境変数
├── .gitignore
├── docker-compose.yml            # Docker設定
├── package.json
├── tsconfig.json
├── next.config.js
├── prisma/
│   ├── schema.prisma             # データベーススキーマ
│   └── migrations/               # マイグレーションファイル
│
├── public/                       # 静的ファイル
│   ├── assets/
│   │   ├── maps/                 # マップ画像
│   │   └── avatars/              # アバター画像
│   └── fonts/
│
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── (auth)/               # 認証関連ページ
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── signup/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/          # メインアプリ
│   │   │   ├── layout.tsx
│   │   │   └── world/
│   │   │       └── page.tsx
│   │   └── api/                  # API Routes
│   │       ├── auth/
│   │       │   ├── login/route.ts
│   │       │   ├── signup/route.ts
│   │       │   └── refresh/route.ts
│   │       ├── users/
│   │       │   ├── route.ts
│   │       │   ├── [id]/route.ts
│   │       │   └── me/route.ts
│   │       ├── messages/
│   │       │   ├── route.ts
│   │       │   └── [roomId]/route.ts
│   │       └── rooms/
│   │           └── route.ts
│   │
│   ├── components/               # Reactコンポーネント
│   │   ├── ui/                   # shadcn/ui コンポーネント
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   └── ...
│   │   ├── features/             # 機能別コンポーネント
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── SignupForm.tsx
│   │   │   ├── world/
│   │   │   │   ├── WorldCanvas.tsx
│   │   │   │   └── AvatarDisplay.tsx
│   │   │   ├── chat/
│   │   │   │   ├── ChatPanel.tsx
│   │   │   │   ├── MessageList.tsx
│   │   │   │   └── MessageInput.tsx
│   │   │   └── voice/
│   │   │       ├── VoiceControls.tsx
│   │   │       └── UserAudioDisplay.tsx
│   │   └── layout/
│   │       ├── Header.tsx
│   │       ├── Sidebar.tsx
│   │       └── Footer.tsx
│   │
│   ├── lib/                      # ビジネスロジック
│   │   ├── canvas/
│   │   │   ├── CanvasRenderer.ts
│   │   │   ├── AvatarManager.ts
│   │   │   ├── MapRenderer.ts
│   │   │   ├── CollisionDetector.ts
│   │   │   └── CameraController.ts
│   │   ├── socket/
│   │   │   ├── SocketManager.ts
│   │   │   ├── EventHandlers.ts
│   │   │   └── reconnection.ts
│   │   ├── webrtc/
│   │   │   ├── RTCManager.ts
│   │   │   ├── SignalingHandler.ts
│   │   │   ├── AudioManager.ts
│   │   │   └── ProximityCallHandler.ts
│   │   └── utils/
│   │       ├── validation.ts
│   │       ├── formatting.ts
│   │       └── constants.ts
│   │
│   ├── stores/                   # Zustand状態管理
│   │   ├── authStore.ts
│   │   ├── worldStore.ts
│   │   ├── chatStore.ts
│   │   ├── voiceStore.ts
│   │   └── uiStore.ts
│   │
│   ├── types/                    # TypeScript型定義
│   │   ├── api.types.ts
│   │   ├── socket.types.ts
│   │   ├── world.types.ts
│   │   ├── user.types.ts
│   │   ├── chat.types.ts
│   │   └── voice.types.ts
│   │
│   ├── services/                 # バックエンドサービス
│   │   ├── authService.ts
│   │   ├── userService.ts
│   │   ├── messageService.ts
│   │   └── roomService.ts
│   │
│   ├── repositories/             # データアクセス
│   │   ├── userRepository.ts
│   │   ├── messageRepository.ts
│   │   └── roomRepository.ts
│   │
│   ├── middleware/               # ミドルウェア
│   │   ├── authMiddleware.ts
│   │   ├── validationMiddleware.ts
│   │   ├── errorHandler.ts
│   │   └── rateLimiter.ts
│   │
│   └── config/                   # 設定ファイル
│       ├── database.ts
│       ├── redis.ts
│       ├── jwt.ts
│       └── socket.ts
│
├── tests/                        # テストファイル
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
└── docs/                         # ドキュメント
    ├── API.md
    ├── SETUP.md
    └── ARCHITECTURE.md
```

---

## 💾 データベース設計

### Prisma スキーマ定義

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ユーザーモデル
model User {
  id                String    @id @default(uuid())
  email             String    @unique
  username          String    @unique
  passwordHash      String
  displayName       String?
  avatarUrl         String?
  status            UserStatus @default(OFFLINE)
  
  // タイムスタンプ
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  lastLoginAt       DateTime?
  
  // リレーション
  sentMessages      Message[]    @relation("SentMessages")
  receivedMessages  Message[]    @relation("ReceivedMessages")
  roomMemberships   RoomMember[]
  profile           UserProfile?
  sessions          Session[]
  
  @@index([email])
  @@index([username])
  @@map("users")
}

// ユーザーステータス
enum UserStatus {
  ONLINE
  AWAY
  BUSY
  OFFLINE
}

// ユーザープロフィール
model UserProfile {
  id          String   @id @default(uuid())
  userId      String   @unique
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  bio         String?
  avatarStyle Json?    // アバターのカスタマイズ情報
  
  // 現在の位置情報（仮想空間内）
  currentRoomId String?
  positionX     Float?
  positionY     Float?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("user_profiles")
}

// セッション管理
model Session {
  id            String   @id @default(uuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  refreshToken  String   @unique
  accessToken   String
  expiresAt     DateTime
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@index([userId])
  @@index([refreshToken])
  @@map("sessions")
}

// ルーム（仮想空間）
model Room {
  id          String       @id @default(uuid())
  name        String
  type        RoomType
  description String?
  mapData     Json         // マップデータ（衝突判定など）
  maxUsers    Int          @default(50)
  
  isActive    Boolean      @default(true)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  
  // リレーション
  members     RoomMember[]
  messages    Message[]
  
  @@index([type])
  @@map("rooms")
}

// ルームタイプ
enum RoomType {
  CLASSROOM
  GALLERY
  PARK
  CUSTOM
}

// ルームメンバーシップ
model RoomMember {
  id        String   @id @default(uuid())
  userId    String
  roomId    String
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  room      Room     @relation(fields: [roomId], references: [id], onDelete: Cascade)
  
  joinedAt  DateTime @default(now())
  
  @@unique([userId, roomId])
  @@index([roomId])
  @@map("room_members")
}

// メッセージ
model Message {
  id         String      @id @default(uuid())
  content    String
  type       MessageType @default(TEXT)
  
  // 送信者
  senderId   String
  sender     User        @relation("SentMessages", fields: [senderId], references: [id], onDelete: Cascade)
  
  // 受信者（DM の場合）
  receiverId String?
  receiver   User?       @relation("ReceivedMessages", fields: [receiverId], references: [id], onDelete: Cascade)
  
  // ルーム（ルームチャットの場合）
  roomId     String?
  room       Room?       @relation(fields: [roomId], references: [id], onDelete: Cascade)
  
  createdAt  DateTime    @default(now())
  
  @@index([senderId])
  @@index([receiverId])
  @@index([roomId])
  @@index([createdAt])
  @@map("messages")
}

// メッセージタイプ
enum MessageType {
  TEXT
  SYSTEM
  IMAGE
  FILE
}
```

### データベースインデックス戦略

```sql
-- パフォーマンス最適化のための追加インデックス

-- ユーザー検索用
CREATE INDEX idx_users_display_name ON users(display_name);
CREATE INDEX idx_users_last_login ON users(last_login_at DESC);

-- メッセージ取得用（ページネーション）
CREATE INDEX idx_messages_room_created ON messages(room_id, created_at DESC);
CREATE INDEX idx_messages_dm_created ON messages(sender_id, receiver_id, created_at DESC);

-- アクティブユーザー検索用
CREATE INDEX idx_users_status ON users(status) WHERE status != 'OFFLINE';

-- 複合インデックス
CREATE INDEX idx_room_members_composite ON room_members(room_id, joined_at DESC);
```

### ER図

```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│    User     │       │   Session    │       │ UserProfile │
├─────────────┤       ├──────────────┤       ├─────────────┤
│ id (PK)     │──1:n──│ id (PK)      │       │ id (PK)     │
│ email       │       │ userId (FK)  │   1:1 │ userId (FK) │
│ username    │       │ refreshToken │───────│ bio         │
│ passwordHash│       │ accessToken  │       │ avatarStyle │
│ displayName │       │ expiresAt    │       │ currentRoom │
│ status      │       └──────────────┘       │ positionX   │
└──────┬──────┘                              │ positionY   │
       │                                     └─────────────┘
       │
       │ 1:n
       │
┌──────┴──────┐       ┌──────────────┐
│   Message   │       │     Room     │
├─────────────┤       ├──────────────┤
│ id (PK)     │   n:1 │ id (PK)      │
│ content     │───────│ name         │
│ type        │       │ type         │
│ senderId(FK)│       │ description  │
│ receiverId  │       │ mapData      │
│ roomId (FK) │───┐   │ maxUsers     │
│ createdAt   │   │   └──────┬───────┘
└─────────────┘   │          │
                  │          │ 1:n
                  │   ┌──────┴───────┐
                  │   │  RoomMember  │
                  │   ├──────────────┤
                  └───│ id (PK)      │
                      │ userId (FK)  │
                      │ roomId (FK)  │
                      │ joinedAt     │
                      └──────────────┘
```

---

## 🔌 API仕様

### 認証API

#### POST /api/auth/signup

**説明**: 新規ユーザー登録

**リクエスト**:
```typescript
interface SignupRequest {
  email: string;      // メールアドレス
  username: string;   // ユーザー名 (3-20文字)
  password: string;   // パスワード (8文字以上)
  displayName?: string; // 表示名 (省略可)
}
```

**レスポンス (成功 - 201)**:
```typescript
interface SignupResponse {
  success: true;
  data: {
    user: {
      id: string;
      email: string;
      username: string;
      displayName: string | null;
      createdAt: string;
    };
  };
  message: "User created successfully";
}
```

**レスポンス (エラー - 400)**:
```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: "VALIDATION_ERROR" | "EMAIL_EXISTS" | "USERNAME_EXISTS";
    message: string;
    details?: Record<string, string[]>;
  };
}
```

**バリデーションルール**:
```typescript
const signupSchema = z.object({
  email: z.string().email("Invalid email format"),
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  displayName: z.string().max(50).optional(),
});
```

**実装例**:
```typescript
// app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { signupSchema } from '@/lib/validation';
import { authService } from '@/services/authService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // バリデーション
    const validatedData = signupSchema.parse(body);
    
    // ユーザー作成
    const user = await authService.signup(validatedData);
    
    return NextResponse.json(
      {
        success: true,
        data: { user },
        message: "User created successfully"
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Validation failed",
            details: error.flatten().fieldErrors
          }
        },
        { status: 400 }
      );
    }
    
    // その他のエラー処理
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An error occurred during signup"
        }
      },
      { status: 500 }
    );
  }
}
```

---

#### POST /api/auth/login

**説明**: ユーザーログイン

**リクエスト**:
```typescript
interface LoginRequest {
  email: string;
  password: string;
}
```

**レスポンス (成功 - 200)**:
```typescript
interface LoginResponse {
  success: true;
  data: {
    user: {
      id: string;
      email: string;
      username: string;
      displayName: string | null;
    };
    accessToken: string;
    refreshToken: string;
  };
  message: "Login successful";
}
```

**Cookie設定**:
- `accessToken`: httpOnly, secure, sameSite=strict, maxAge=15分
- `refreshToken`: httpOnly, secure, sameSite=strict, maxAge=7日

---

#### POST /api/auth/refresh

**説明**: アクセストークンのリフレッシュ

**リクエスト**: なし (Cookie から refreshToken を取得)

**レスポンス (成功 - 200)**:
```typescript
interface RefreshResponse {
  success: true;
  data: {
    accessToken: string;
  };
}
```

---

#### POST /api/auth/logout

**説明**: ログアウト

**リクエスト**: なし

**レスポンス (成功 - 200)**:
```typescript
interface LogoutResponse {
  success: true;
  message: "Logout successful";
}
```

**処理内容**:
1. DB からセッション削除
2. Cookie クリア
3. Redis からキャッシュ削除

---

### ユーザーAPI

#### GET /api/users/me

**説明**: 現在のユーザー情報取得

**認証**: 必須 (JWT)

**レスポンス (成功 - 200)**:
```typescript
interface UserMeResponse {
  success: true;
  data: {
    user: {
      id: string;
      email: string;
      username: string;
      displayName: string | null;
      avatarUrl: string | null;
      status: UserStatus;
      profile: {
        bio: string | null;
        currentRoomId: string | null;
        positionX: number | null;
        positionY: number | null;
      };
    };
  };
}
```

---

#### PATCH /api/users/me

**説明**: ユーザー情報更新

**認証**: 必須 (JWT)

**リクエスト**:
```typescript
interface UpdateUserRequest {
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  status?: UserStatus;
}
```

**レスポンス (成功 - 200)**:
```typescript
interface UpdateUserResponse {
  success: true;
  data: {
    user: UserMeResponse['data']['user'];
  };
  message: "User updated successfully";
}
```

---

#### GET /api/users/[id]

**説明**: 特定ユーザーの公開情報取得

**認証**: 必須 (JWT)

**レスポンス (成功 - 200)**:
```typescript
interface UserPublicResponse {
  success: true;
  data: {
    user: {
      id: string;
      username: string;
      displayName: string | null;
      avatarUrl: string | null;
      status: UserStatus;
      bio: string | null;
    };
  };
}
```

---

### メッセージAPI

#### GET /api/messages?roomId={roomId}&limit=50&before={timestamp}

**説明**: ルームメッセージ履歴取得

**認証**: 必須 (JWT)

**クエリパラメータ**:
- `roomId` (required): ルームID
- `limit` (optional): 取得件数 (デフォルト: 50, 最大: 100)
- `before` (optional): この時刻より前のメッセージ取得 (ページネーション用)

**レスポンス (成功 - 200)**:
```typescript
interface MessagesResponse {
  success: true;
  data: {
    messages: Array<{
      id: string;
      content: string;
      type: MessageType;
      senderId: string;
      sender: {
        username: string;
        displayName: string | null;
        avatarUrl: string | null;
      };
      roomId: string;
      createdAt: string;
    }>;
    hasMore: boolean;
    nextCursor: string | null;
  };
}
```

---

#### GET /api/messages/dm?userId={userId}&limit=50&before={timestamp}

**説明**: DM履歴取得

**認証**: 必須 (JWT)

**クエリパラメータ**:
- `userId` (required): 相手ユーザーID
- `limit` (optional): 取得件数
- `before` (optional): ページネーション用

**レスポンス**: `MessagesResponse` と同様

---

### ルームAPI

#### GET /api/rooms

**説明**: ルーム一覧取得

**認証**: 必須 (JWT)

**レスポンス (成功 - 200)**:
```typescript
interface RoomsResponse {
  success: true;
  data: {
    rooms: Array<{
      id: string;
      name: string;
      type: RoomType;
      description: string | null;
      maxUsers: number;
      currentUsers: number;
    }>;
  };
}
```

---

#### GET /api/rooms/[id]

**説明**: ルーム詳細取得

**認証**: 必須 (JWT)

**レスポンス (成功 - 200)**:
```typescript
interface RoomDetailResponse {
  success: true;
  data: {
    room: {
      id: string;
      name: string;
      type: RoomType;
      description: string | null;
      mapData: {
        width: number;
        height: number;
        tileSize: number;
        collisionMap: number[][];
        spawnPoints: Array<{ x: number; y: number }>;
      };
      maxUsers: number;
      members: Array<{
        userId: string;
        username: string;
        displayName: string | null;
        avatarUrl: string | null;
        position: { x: number; y: number };
        status: UserStatus;
      }>;
    };
  };
}
```

---

### エラーレスポンス統一フォーマット

すべてのAPIエラーは以下の形式で返します:

```typescript
interface APIError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
```

**エラーコード一覧**:
```typescript
const ERROR_CODES = {
  // 認証エラー
  UNAUTHORIZED: 'User not authenticated',
  FORBIDDEN: 'Access denied',
  INVALID_TOKEN: 'Invalid or expired token',
  
  // バリデーションエラー
  VALIDATION_ERROR: 'Validation failed',
  INVALID_INPUT: 'Invalid input data',
  
  // リソースエラー
  NOT_FOUND: 'Resource not found',
  ALREADY_EXISTS: 'Resource already exists',
  
  // レート制限
  RATE_LIMIT_EXCEEDED: 'Too many requests',
  
  // サーバーエラー
  INTERNAL_ERROR: 'Internal server error',
  DATABASE_ERROR: 'Database operation failed',
} as const;
```

---

## 🎨 フロントエンド設計

### コンポーネント設計原則

#### 1. 単一責任の原則

各コンポーネントは1つの責任のみを持つ:

```typescript
// ❌ 悪い例: 複数の責任
function UserDashboard() {
  // 認証、データ取得、表示、状態管理が混在
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  
  useEffect(() => {
    // 認証チェック
    // データ取得
    // WebSocket接続
  }, []);
  
  return (
    <div>
      {/* 複雑なUI */}
    </div>
  );
}

// ✅ 良い例: 責任を分離
function UserDashboard() {
  return (
    <DashboardLayout>
      <UserProfile />
      <MessageList />
      <WorldCanvas />
    </DashboardLayout>
  );
}
```

#### 2. プレゼンテーションとコンテナの分離

```typescript
// Presentational Component (見た目のみ)
interface MessageItemProps {
  message: Message;
  onDelete?: (id: string) => void;
}

export function MessageItem({ message, onDelete }: MessageItemProps) {
  return (
    <div className="message-item">
      <span>{message.content}</span>
      {onDelete && (
        <button onClick={() => onDelete(message.id)}>
          削除
        </button>
      )}
    </div>
  );
}

// Container Component (ロジック)
export function MessageListContainer() {
  const messages = useMessageStore((state) => state.messages);
  const deleteMessage = useMessageStore((state) => state.deleteMessage);
  
  return (
    <div>
      {messages.map((msg) => (
        <MessageItem 
          key={msg.id} 
          message={msg} 
          onDelete={deleteMessage} 
        />
      ))}
    </div>
  );
}
```

#### 3. Compound Components パターン

関連するコンポーネントをグループ化:

```typescript
// components/features/chat/ChatPanel.tsx
export function ChatPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="chat-panel">
      {children}
    </div>
  );
}

ChatPanel.Header = function ChatPanelHeader({ title }: { title: string }) {
  return <div className="chat-header">{title}</div>;
};

ChatPanel.Messages = function ChatPanelMessages({ messages }: { messages: Message[] }) {
  return (
    <div className="chat-messages">
      {messages.map((msg) => (
        <MessageItem key={msg.id} message={msg} />
      ))}
    </div>
  );
};

ChatPanel.Input = function ChatPanelInput({ onSend }: { onSend: (text: string) => void }) {
  const [text, setText] = useState('');
  
  return (
    <div className="chat-input">
      <input 
        value={text} 
        onChange={(e) => setText(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter' && text.trim()) {
            onSend(text);
            setText('');
          }
        }}
      />
      <button onClick={() => {
        if (text.trim()) {
          onSend(text);
          setText('');
        }
      }}>
        送信
      </button>
    </div>
  );
};

// 使用例
<ChatPanel>
  <ChatPanel.Header title="教室チャット" />
  <ChatPanel.Messages messages={messages} />
  <ChatPanel.Input onSend={handleSendMessage} />
</ChatPanel>
```

### カスタムフック設計

#### useAuth - 認証フック

```typescript
// hooks/useAuth.ts
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

interface UseAuthOptions {
  required?: boolean;
  redirectTo?: string;
}

export function useAuth(options: UseAuthOptions = {}) {
  const { required = false, redirectTo = '/login' } = options;
  const router = useRouter();
  const { user, isLoading, isAuthenticated, fetchUser, logout } = useAuthStore();
  
  useEffect(() => {
    if (!isLoading && required && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isLoading, isAuthenticated, required, redirectTo, router]);
  
  useEffect(() => {
    if (!user && !isLoading) {
      fetchUser();
    }
  }, [user, isLoading, fetchUser]);
  
  return {
    user,
    isLoading,
    isAuthenticated,
    logout,
  };
}

// 使用例
function ProfilePage() {
  const { user, isLoading } = useAuth({ required: true });
  
  if (isLoading) return <LoadingSpinner />;
  if (!user) return null;
  
  return <UserProfile user={user} />;
}
```

#### useSocket - Socket.io接続フック

```typescript
// hooks/useSocket.ts
import { useEffect, useRef } from 'react';
import { SocketManager } from '@/lib/socket/SocketManager';
import { useAuthStore } from '@/stores/authStore';

export function useSocket() {
  const socketRef = useRef<SocketManager | null>(null);
  const { user } = useAuthStore();
  
  useEffect(() => {
    if (user && !socketRef.current) {
      socketRef.current = new SocketManager();
      socketRef.current.connect();
    }
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user]);
  
  return socketRef.current;
}
```

#### useCanvas - Canvas描画フック

```typescript
// hooks/useCanvas.ts
import { useRef, useEffect } from 'react';
import { CanvasRenderer } from '@/lib/canvas/CanvasRenderer';

interface UseCanvasOptions {
  width: number;
  height: number;
  onRender?: (renderer: CanvasRenderer) => void;
}

export function useCanvas({ width, height, onRender }: UseCanvasOptions) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);
  
  useEffect(() => {
    if (canvasRef.current && !rendererRef.current) {
      rendererRef.current = new CanvasRenderer(canvasRef.current, width, height);
      rendererRef.current.start();
      
      if (onRender) {
        onRender(rendererRef.current);
      }
    }
    
    return () => {
      if (rendererRef.current) {
        rendererRef.current.stop();
        rendererRef.current = null;
      }
    };
  }, [width, height, onRender]);
  
  return {
    canvasRef,
    renderer: rendererRef.current,
  };
}

// 使用例
function WorldCanvas() {
  const { canvasRef, renderer } = useCanvas({
    width: 800,
    height: 600,
    onRender: (renderer) => {
      // レンダラーの初期設定
      renderer.loadMap('/assets/maps/classroom.png');
    },
  });
  
  return <canvas ref={canvasRef} />;
}
```

---

## ⚡ リアルタイム通信設計

### Socket.io イベント仕様

#### クライアント → サーバー イベント

```typescript
// types/socket.types.ts

/**
 * クライアントが送信するイベント
 */
export interface ClientToServerEvents {
  // 接続・認証
  'auth:authenticate': (token: string) => void;
  
  // ルーム管理
  'room:join': (roomId: string) => void;
  'room:leave': (roomId: string) => void;
  
  // 位置同期
  'player:move': (data: PlayerMoveData) => void;
  'player:stop': (data: PlayerPositionData) => void;
  
  // チャット
  'message:send': (data: MessageSendData) => void;
  'message:typing': (isTyping: boolean) => void;
  
  // 音声通話
  'voice:offer': (data: RTCOfferData) => void;
  'voice:answer': (data: RTCAnswerData) => void;
  'voice:iceCandidate': (data: ICECandidateData) => void;
  'voice:leave': () => void;
}

export interface PlayerMoveData {
  position: { x: number; y: number };
  direction: 'up' | 'down' | 'left' | 'right';
  velocity: { x: number; y: number };
}

export interface PlayerPositionData {
  position: { x: number; y: number };
}

export interface MessageSendData {
  roomId: string;
  content: string;
  type: 'TEXT' | 'SYSTEM';
}

export interface RTCOfferData {
  targetUserId: string;
  offer: RTCSessionDescriptionInit;
}

export interface RTCAnswerData {
  targetUserId: string;
  answer: RTCSessionDescriptionInit;
}

export interface ICECandidateData {
  targetUserId: string;
  candidate: RTCIceCandidateInit;
}
```

#### サーバー → クライアント イベント

```typescript
/**
 * サーバーが送信するイベント
 */
export interface ServerToClientEvents {
  // 接続・認証
  'auth:success': (data: AuthSuccessData) => void;
  'auth:error': (error: string) => void;
  
  // ルーム管理
  'room:joined': (data: RoomJoinedData) => void;
  'room:left': (data: RoomLeftData) => void;
  'room:userJoined': (data: UserJoinedData) => void;
  'room:userLeft': (data: UserLeftData) => void;
  
  // 位置同期
  'player:moved': (data: PlayerMovedData) => void;
  'player:stopped': (data: PlayerStoppedData) => void;
  
  // チャット
  'message:received': (data: MessageReceivedData) => void;
  'message:typingStatus': (data: TypingStatusData) => void;
  
  // 音声通話
  'voice:offer': (data: RTCOfferReceivedData) => void;
  'voice:answer': (data: RTCAnswerReceivedData) => void;
  'voice:iceCandidate': (data: ICECandidateReceivedData) => void;
  'voice:userJoined': (data: VoiceUserJoinedData) => void;
  'voice:userLeft': (data: VoiceUserLeftData) => void;
  
  // エラー
  'error': (error: SocketErrorData) => void;
}

export interface AuthSuccessData {
  userId: string;
  username: string;
}

export interface RoomJoinedData {
  roomId: string;
  users: Array<{
    userId: string;
    username: string;
    position: { x: number; y: number };
    status: UserStatus;
  }>;
}

export interface UserJoinedData {
  userId: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  position: { x: number; y: number };
}

export interface PlayerMovedData {
  userId: string;
  position: { x: number; y: number };
  direction: string;
  velocity: { x: number; y: number };
}

export interface MessageReceivedData {
  id: string;
  content: string;
  type: MessageType;
  senderId: string;
  sender: {
    username: string;
    displayName: string | null;
  };
  roomId: string;
  createdAt: string;
}

export interface SocketErrorData {
  code: string;
  message: string;
}
```

### Socket.io サーバー実装

```typescript
// server/socketServer.ts
import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import type { ClientToServerEvents, ServerToClientEvents } from '@/types/socket.types';

export class SocketServer {
  private io: SocketIOServer<ClientToServerEvents, ServerToClientEvents>;
  private userSocketMap: Map<string, string> = new Map();
  
  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL,
        credentials: true,
      },
    });
    
    this.setupRedisAdapter();
    this.setupMiddleware();
    this.setupEventHandlers();
  }
  
  private async setupRedisAdapter() {
    const pubClient = createClient({ url: process.env.REDIS_URL });
    const subClient = pubClient.duplicate();
    
    await Promise.all([
      pubClient.connect(),
      subClient.connect(),
    ]);
    
    this.io.adapter(createAdapter(pubClient, subClient));
  }
  
  private setupMiddleware() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        
        if (!token) {
          return next(new Error('Authentication error'));
        }
        
        // JWT検証
        const decoded = await verifyJWT(token);
        socket.data.userId = decoded.userId;
        socket.data.username = decoded.username;
        
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });
  }
  
  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.data.userId}`);
      
      // ユーザーIDとソケットIDのマッピング
      this.userSocketMap.set(socket.data.userId, socket.id);
      
      // ルーム参加
      socket.on('room:join', async (roomId) => {
        try {
          // データベースで権限確認
          const hasAccess = await checkRoomAccess(socket.data.userId, roomId);
          
          if (!hasAccess) {
            socket.emit('error', {
              code: 'ACCESS_DENIED',
              message: 'You do not have access to this room',
            });
            return;
          }
          
          // ルームに参加
          await socket.join(roomId);
          
          // 既存ユーザー情報を取得
          const users = await getRoomUsers(roomId);
          
          // 参加者に通知
          socket.emit('room:joined', { roomId, users });
          
          // 他のユーザーに新規参加を通知
          socket.to(roomId).emit('room:userJoined', {
            userId: socket.data.userId,
            username: socket.data.username,
            displayName: socket.data.displayName,
            avatarUrl: socket.data.avatarUrl,
            position: { x: 100, y: 100 }, // デフォルト位置
          });
        } catch (error) {
          console.error('Error joining room:', error);
          socket.emit('error', {
            code: 'ROOM_JOIN_ERROR',
            message: 'Failed to join room',
          });
        }
      });
      
      // 位置同期
      socket.on('player:move', (data) => {
        const rooms = Array.from(socket.rooms);
        rooms.forEach((roomId) => {
          if (roomId !== socket.id) {
            socket.to(roomId).emit('player:moved', {
              userId: socket.data.userId,
              ...data,
            });
          }
        });
      });
      
      // メッセージ送信
      socket.on('message:send', async (data) => {
        try {
          // データベースに保存
          const message = await saveMessage({
            content: data.content,
            type: data.type,
            senderId: socket.data.userId,
            roomId: data.roomId,
          });
          
          // ルーム内の全員に配信
          this.io.to(data.roomId).emit('message:received', {
            id: message.id,
            content: message.content,
            type: message.type,
            senderId: socket.data.userId,
            sender: {
              username: socket.data.username,
              displayName: socket.data.displayName,
            },
            roomId: data.roomId,
            createdAt: message.createdAt.toISOString(),
          });
        } catch (error) {
          console.error('Error sending message:', error);
          socket.emit('error', {
            code: 'MESSAGE_SEND_ERROR',
            message: 'Failed to send message',
          });
        }
      });
      
      // WebRTCシグナリング
      socket.on('voice:offer', (data) => {
        const targetSocketId = this.userSocketMap.get(data.targetUserId);
        if (targetSocketId) {
          this.io.to(targetSocketId).emit('voice:offer', {
            fromUserId: socket.data.userId,
            offer: data.offer,
          });
        }
      });
      
      socket.on('voice:answer', (data) => {
        const targetSocketId = this.userSocketMap.get(data.targetUserId);
        if (targetSocketId) {
          this.io.to(targetSocketId).emit('voice:answer', {
            fromUserId: socket.data.userId,
            answer: data.answer,
          });
        }
      });
      
      socket.on('voice:iceCandidate', (data) => {
        const targetSocketId = this.userSocketMap.get(data.targetUserId);
        if (targetSocketId) {
          this.io.to(targetSocketId).emit('voice:iceCandidate', {
            fromUserId: socket.data.userId,
            candidate: data.candidate,
          });
        }
      });
      
      // 切断処理
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.data.userId}`);
        this.userSocketMap.delete(socket.data.userId);
        
        // 全ルームに退出を通知
        const rooms = Array.from(socket.rooms);
        rooms.forEach((roomId) => {
          if (roomId !== socket.id) {
            socket.to(roomId).emit('room:userLeft', {
              userId: socket.data.userId,
            });
          }
        });
      });
    });
  }
}
```

### Socket.io クライアント実装

```typescript
// lib/socket/SocketManager.ts
import { io, Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents } from '@/types/socket.types';

export class SocketManager {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  
  constructor() {
    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);
  }
  
  public connect(): void {
    if (this.socket?.connected) {
      console.warn('Socket already connected');
      return;
    }
    
    const token = getAuthToken();
    
    if (!token) {
      console.error('No auth token available');
      return;
    }
    
    this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });
    
    this.setupEventListeners();
  }
  
  private setupEventListeners(): void {
    if (!this.socket) return;
    
    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.reconnectAttempts = 0;
    });
    
    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      
      if (reason === 'io server disconnect') {
        // サーバーから切断された場合は手動で再接続
        this.socket?.connect();
      }
    });
    
    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnect attempts reached');
        // ユーザーに通知
      }
    });
    
    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      // エラー通知
    });
  }
  
  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
  
  public emit<K extends keyof ClientToServerEvents>(
    event: K,
    ...args: Parameters<ClientToServerEvents[K]>
  ): void {
    if (!this.socket?.connected) {
      console.warn('Socket not connected');
      return;
    }
    
    this.socket.emit(event, ...args);
  }
  
  public on<K extends keyof ServerToClientEvents>(
    event: K,
    callback: ServerToClientEvents[K]
  ): void {
    if (!this.socket) {
      console.warn('Socket not initialized');
      return;
    }
    
    this.socket.on(event, callback);
  }
  
  public off<K extends keyof ServerToClientEvents>(
    event: K,
    callback?: ServerToClientEvents[K]
  ): void {
    if (!this.socket) return;
    
    if (callback) {
      this.socket.off(event, callback);
    } else {
      this.socket.off(event);
    }
  }
  
  public isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

// シングルトンインスタンス
let socketManagerInstance: SocketManager | null = null;

export function getSocketManager(): SocketManager {
  if (!socketManagerInstance) {
    socketManagerInstance = new SocketManager();
  }
  return socketManagerInstance;
}
```

---

## 🎮 状態管理設計

### Zustand ストア設計

#### authStore - 認証状態

```typescript
// stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserStatus } from '@/types/user.types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  setUser: (user: User) => void;
  clearUser: () => void;
  updateUserStatus: (status: UserStatus) => void;
  fetchUser: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      // Actions
      setUser: (user) => set({ user, isAuthenticated: true }),
      
      clearUser: () => set({ user: null, isAuthenticated: false }),
      
      updateUserStatus: (status) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, status } });
        }
      },
      
      fetchUser: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/users/me');
          if (response.ok) {
            const data = await response.json();
            set({ user: data.data.user, isAuthenticated: true });
          } else {
            set({ user: null, isAuthenticated: false });
          }
        } catch (error) {
          set({ error: 'Failed to fetch user', user: null, isAuthenticated: false });
        } finally {
          set({ isLoading: false });
        }
      },
      
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          
          if (response.ok) {
            const data = await response.json();
            set({ user: data.data.user, isAuthenticated: true });
          } else {
            const error = await response.json();
            set({ error: error.error.message });
          }
        } catch (error) {
          set({ error: 'Login failed' });
        } finally {
          set({ isLoading: false });
        }
      },
      
      signup: async (email, username, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, username, password }),
          });
          
          if (response.ok) {
            // サインアップ後は自動ログイン
            await get().login(email, password);
          } else {
            const error = await response.json();
            set({ error: error.error.message });
          }
        } catch (error) {
          set({ error: 'Signup failed' });
        } finally {
          set({ isLoading: false });
        }
      },
      
      logout: async () => {
        try {
          await fetch('/api/auth/logout', { method: 'POST' });
          set({ user: null, isAuthenticated: false });
        } catch (error) {
          console.error('Logout error:', error);
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
```

#### worldStore - 仮想空間状態

```typescript
// stores/worldStore.ts
import { create } from 'zustand';
import type { Room, User } from '@/types';

interface WorldState {
  currentRoom: Room | null;
  players: Map<string, PlayerState>;
  localPlayer: PlayerState | null;
}

interface PlayerState {
  userId: string;
  username: string;
  displayName: string | null;
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  direction: 'up' | 'down' | 'left' | 'right';
  status: UserStatus;
}

interface WorldActions {
  setCurrentRoom: (room: Room) => void;
  addPlayer: (player: PlayerState) => void;
  removePlayer: (userId: string) => void;
  updatePlayer: (userId: string, updates: Partial<PlayerState>) => void;
  updateLocalPlayer: (updates: Partial<PlayerState>) => void;
  clearRoom: () => void;
}

export const useWorldStore = create<WorldState & WorldActions>((set) => ({
  // State
  currentRoom: null,
  players: new Map(),
  localPlayer: null,
  
  // Actions
  setCurrentRoom: (room) => set({ currentRoom: room }),
  
  addPlayer: (player) => set((state) => {
    const newPlayers = new Map(state.players);
    newPlayers.set(player.userId, player);
    return { players: newPlayers };
  }),
  
  removePlayer: (userId) => set((state) => {
    const newPlayers = new Map(state.players);
    newPlayers.delete(userId);
    return { players: newPlayers };
  }),
  
  updatePlayer: (userId, updates) => set((state) => {
    const player = state.players.get(userId);
    if (!player) return state;
    
    const newPlayers = new Map(state.players);
    newPlayers.set(userId, { ...player, ...updates });
    return { players: newPlayers };
  }),
  
  updateLocalPlayer: (updates) => set((state) => ({
    localPlayer: state.localPlayer
      ? { ...state.localPlayer, ...updates }
      : null,
  })),
  
  clearRoom: () => set({
    currentRoom: null,
    players: new Map(),
    localPlayer: null,
  }),
}));
```

#### chatStore - チャット状態

```typescript
// stores/chatStore.ts
import { create } from 'zustand';
import type { Message } from '@/types';

interface ChatState {
  messages: Message[];
  typingUsers: Set<string>;
  unreadCount: number;
}

interface ChatActions {
  addMessage: (message: Message) => void;
  addMessages: (messages: Message[]) => void;
  clearMessages: () => void;
  setTypingUser: (userId: string, isTyping: boolean) => void;
  incrementUnread: () => void;
  resetUnread: () => void;
}

export const useChatStore = create<ChatState & ChatActions>((set) => ({
  // State
  messages: [],
  typingUsers: new Set(),
  unreadCount: 0,
  
  // Actions
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message],
    unreadCount: state.unreadCount + 1,
  })),
  
  addMessages: (messages) => set((state) => ({
    messages: [...messages, ...state.messages],
  })),
  
  clearMessages: () => set({ messages: [], unreadCount: 0 }),
  
  setTypingUser: (userId, isTyping) => set((state) => {
    const newTypingUsers = new Set(state.typingUsers);
    if (isTyping) {
      newTypingUsers.add(userId);
    } else {
      newTypingUsers.delete(userId);
    }
    return { typingUsers: newTypingUsers };
  }),
  
  incrementUnread: () => set((state) => ({
    unreadCount: state.unreadCount + 1,
  })),
  
  resetUnread: () => set({ unreadCount: 0 }),
}));
```

---

## 🚨 エラーハンドリング戦略

### エラー階層

```
エラーハンドリング4層構造
│
├── レベル1: 予防 (Prevention)
│   ├── TypeScript型システム
│   ├── Zodバリデーション
│   ├── ESLintルール
│   └── 入力サニタイゼーション
│
├── レベル2: 検知 (Detection)
│   ├── try-catchブロック
│   ├── Error Boundary
│   ├── Promiseエラーハンドリング
│   └── イベントリスナーエラーキャッチ
│
├── レベル3: 回復 (Recovery)
│   ├── 自動再接続
│   ├── フォールバック処理
│   ├── キャッシュからの復元
│   └── Graceful Degradation
│
└── レベル4: 通知 (Notification)
    ├── ユーザーフィードバック
    ├── エラーログ記録
    ├── モニタリングアラート
    └── 開発者通知
```

### Error Boundary実装

```typescript
// components/ErrorBoundary.tsx
'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // カスタムエラーハンドラーを実行
    this.props.onError?.(error, errorInfo);
    
    // エラーログサービスに送信
    logErrorToService({
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });
  }
  
  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="error-boundary-fallback">
          <h2>エラーが発生しました</h2>
          <p>申し訳ございません。予期しないエラーが発生しました。</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            再試行
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

### API エラーハンドリング

```typescript
// lib/api/apiClient.ts
import { z } from 'zod';

export class APIError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new APIError(
        data.error.code,
        data.error.message,
        response.status,
        data.error.details
      );
    }
    
    return data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    
    // ネットワークエラー等
    throw new APIError(
      'NETWORK_ERROR',
      'ネットワークエラーが発生しました',
      0
    );
  }
}

// 使用例
try {
  const data = await apiRequest<UserMeResponse>('/api/users/me');
  console.log(data.data.user);
} catch (error) {
  if (error instanceof APIError) {
    switch (error.code) {
      case 'UNAUTHORIZED':
        // ログインページにリダイレクト
        break;
      case 'VALIDATION_ERROR':
        // バリデーションエラー表示
        break;
      default:
        // 一般エラー表示
    }
  }
}
```

### WebSocket エラーハンドリング

```typescript
// lib/socket/errorHandling.ts
export function handleSocketError(error: SocketErrorData): void {
  switch (error.code) {
    case 'AUTHENTICATION_ERROR':
      // 認証エラー → ログインページへ
      window.location.href = '/login';
      break;
      
    case 'ROOM_NOT_FOUND':
      // ルームが存在しない
      showToast('指定されたルームが見つかりません', 'error');
      break;
      
    case 'MESSAGE_SEND_ERROR':
      // メッセージ送信失敗 → 再送を提案
      showRetryDialog('メッセージの送信に失敗しました');
      break;
      
    default:
      // 一般エラー
      showToast('エラーが発生しました', 'error');
  }
}
```

---

## 🔒 セキュリティ実装

### 認証トークン管理

```typescript
// lib/auth/jwt.ts
import jwt from 'jsonwebtoken';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;

export interface JWTPayload {
  userId: string;
  username: string;
  email: string;
}

export function generateAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: '15m',
  });
}

export function generateRefreshToken(payload: JWTPayload): string {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: '7d',
  });
}

export function verifyAccessToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid access token');
  }
}

export function verifyRefreshToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
}
```

### Cookie設定

```typescript
// lib/auth/cookies.ts
import { NextResponse } from 'next/server';

export function setAuthCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string
): void {
  // アクセストークン (15分)
  response.cookies.set('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60, // 15分
    path: '/',
  });
  
  // リフレッシュトークン (7日)
  response.cookies.set('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60, // 7日
    path: '/',
  });
}

export function clearAuthCookies(response: NextResponse): void {
  response.cookies.delete('accessToken');
  response.cookies.delete('refreshToken');
}
```

### CORS設定

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

const allowedOrigins = [
  process.env.NEXT_PUBLIC_APP_URL,
];

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin');
  
  // CORS チェック
  if (origin && !allowedOrigins.includes(origin)) {
    return new NextResponse(null, {
      status: 403,
      statusText: 'Forbidden',
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
  
  // 認証チェック
  const accessToken = request.cookies.get('accessToken');
  
  if (request.nextUrl.pathname.startsWith('/api/') && 
      !request.nextUrl.pathname.startsWith('/api/auth/')) {
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
  }
  
  const response = NextResponse.next();
  
  // CORS ヘッダー設定
  if (origin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, PATCH, DELETE, OPTIONS'
    );
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    );
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }
  
  return response;
}

export const config = {
  matcher: '/api/:path*',
};
```

### レートリミット

```typescript
// lib/rateLimit.ts
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!);

interface RateLimitConfig {
  windowMs: number;
  max: number;
}

export async function rateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number }> {
  const key = `ratelimit:${identifier}`;
  const now = Date.now();
  const windowStart = now - config.windowMs;
  
  // 古いエントリを削除
  await redis.zremrangebyscore(key, 0, windowStart);
  
  // 現在のカウントを取得
  const count = await redis.zcard(key);
  
  if (count >= config.max) {
    return { allowed: false, remaining: 0 };
  }
  
  // 新しいエントリを追加
  await redis.zadd(key, now, `${now}`);
  await redis.expire(key, Math.ceil(config.windowMs / 1000));
  
  return {
    allowed: true,
    remaining: config.max - count - 1,
  };
}

// 使用例
export async function rateLimitMiddleware(
  request: NextRequest,
  identifier: string
) {
  const result = await rateLimit(identifier, {
    windowMs: 60 * 1000, // 1分
    max: 60, // 60リクエスト
  });
  
  if (!result.allowed) {
    return NextResponse.json(
      {
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests',
        },
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': '60',
          'X-RateLimit-Remaining': '0',
          'Retry-After': '60',
        },
      }
    );
  }
  
  return NextResponse.next({
    headers: {
      'X-RateLimit-Limit': '60',
      'X-RateLimit-Remaining': result.remaining.toString(),
    },
  });
}
```

---

## ⚡ パフォーマンス最適化

### Canvas最適化戦略

```typescript
// lib/canvas/optimizations.ts

/**
 * オフスクリーンCanvasを使用した描画最適化
 */
export class OptimizedCanvasRenderer {
  private mainCanvas: HTMLCanvasElement;
  private offscreenCanvas: HTMLCanvasElement;
  private mainCtx: CanvasRenderingContext2D;
  private offscreenCtx: CanvasRenderingContext2D;
  private dirty = true;
  
  constructor(canvas: HTMLCanvasElement) {
    this.mainCanvas = canvas;
    this.mainCtx = canvas.getContext('2d')!;
    
    // オフスクリーンCanvasの作成
    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCanvas.width = canvas.width;
    this.offscreenCanvas.height = canvas.height;
    this.offscreenCtx = this.offscreenCanvas.getContext('2d')!;
  }
  
  /**
   * 描画が必要な場合のみ更新
   */
  public render(): void {
    if (!this.dirty) return;
    
    // オフスクリーンCanvasに描画
    this.offscreenCtx.clearRect(
      0,
      0,
      this.offscreenCanvas.width,
      this.offscreenCanvas.height
    );
    
    this.drawToOffscreen();
    
    // メインCanvasに転送
    this.mainCtx.clearRect(
      0,
      0,
      this.mainCanvas.width,
      this.mainCanvas.height
    );
    this.mainCtx.drawImage(this.offscreenCanvas, 0, 0);
    
    this.dirty = false;
  }
  
  private drawToOffscreen(): void {
    // 実際の描画処理
  }
  
  public markDirty(): void {
    this.dirty = true;
  }
}

/**
 * 表示範囲外のオブジェクトをカリング
 */
export class ViewportCulling {
  constructor(
    private viewportWidth: number,
    private viewportHeight: number,
    private margin = 100
  ) {}
  
  public isVisible(
    objectX: number,
    objectY: number,
    objectWidth: number,
    objectHeight: number,
    cameraX: number,
    cameraY: number
  ): boolean {
    return (
      objectX + objectWidth >= cameraX - this.margin &&
      objectX <= cameraX + this.viewportWidth + this.margin &&
      objectY + objectHeight >= cameraY - this.margin &&
      objectY <= cameraY + this.viewportHeight + this.margin
    );
  }
}
```

### Reactコンポーネント最適化

```typescript
// components/optimized/MemoizedComponent.tsx
import { memo } from 'react';

/**
 * メモ化されたコンポーネント
 */
export const MessageItem = memo(
  function MessageItem({ message }: { message: Message }) {
    return (
      <div className="message-item">
        <span>{message.content}</span>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // カスタム比較関数
    return prevProps.message.id === nextProps.message.id &&
           prevProps.message.content === nextProps.message.content;
  }
);

/**
 * useCallbackとuseMemoの適切な使用
 */
export function ChatPanel() {
  const messages = useChatStore((state) => state.messages);
  const addMessage = useChatStore((state) => state.addMessage);
  
  // コールバックのメモ化
  const handleSendMessage = useCallback((content: string) => {
    addMessage({
      id: generateId(),
      content,
      senderId: getCurrentUserId(),
      createdAt: new Date().toISOString(),
    });
  }, [addMessage]);
  
  // 重い計算のメモ化
  const sortedMessages = useMemo(() => {
    return [...messages].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [messages]);
  
  return (
    <div>
      {sortedMessages.map((msg) => (
        <MessageItem key={msg.id} message={msg} />
      ))}
      <MessageInput onSend={handleSendMessage} />
    </div>
  );
}
```

### Socket.io イベント最適化

```typescript
// lib/socket/throttle.ts
/**
 * イベント送信の頻度制限
 */
export function throttle<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  let timeoutId: NodeJS.Timeout | null = null;
  
  return function (...args: Parameters<T>) {
    const now = Date.now();
    
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        func(...args);
      }, delay - (now - lastCall));
    }
  };
}

// 使用例
const throttledMove = throttle((position: { x: number; y: number }) => {
  socket.emit('player:move', { position });
}, 50); // 50msごとに最大1回
```

---

## 🧪 テスト戦略

### テスト階層

```
テストピラミッド
│
├── E2Eテスト (5%)
│   └── Playwright
│
├── 統合テスト (15%)
│   └── Jest + React Testing Library
│
├── 単体テスト (60%)
│   └── Jest + Vitest
│
└── 型チェック (20%)
    └── TypeScript
```

### 単体テスト例

```typescript
// __tests__/services/authService.test.ts
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { authService } from '@/services/authService';
import { userRepository } from '@/repositories/userRepository';
import bcrypt from 'bcrypt';

jest.mock('@/repositories/userRepository');
jest.mock('bcrypt');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('signup', () => {
    it('should create a new user with hashed password', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        username: 'testuser',
        passwordHash: 'hashed_password',
      };
      
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      (userRepository.create as jest.Mock).mockResolvedValue(mockUser);
      
      const result = await authService.signup({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      });
      
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(userRepository.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        username: 'testuser',
        passwordHash: 'hashed_password',
      });
      expect(result).toEqual(mockUser);
    });
    
    it('should throw error if email already exists', async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValue({
        id: '123',
        email: 'test@example.com',
      });
      
      await expect(authService.signup({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      })).rejects.toThrow('Email already exists');
    });
  });
});
```

### 統合テスト例

```typescript
// __tests__/integration/auth.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from '@/components/features/auth/LoginForm';
import { useAuthStore } from '@/stores/authStore';

describe('Login Integration', () => {
  it('should login successfully with valid credentials', async () => {
    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Login' });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      const { isAuthenticated } = useAuthStore.getState();
      expect(isAuthenticated).toBe(true);
    });
  });
});
```

### E2Eテスト例

```typescript
// __tests__/e2e/user-flow.spec.ts
import { test, expect } from '@playwright/test';

test('complete user flow', async ({ page }) => {
  // サインアップ
  await page.goto('/signup');
  await page.fill('input[name="email"]', 'newuser@example.com');
  await page.fill('input[name="username"]', 'newuser');
  await page.fill('input[name="password"]', 'SecurePass123');
  await page.click('button[type="submit"]');
  
  // ログイン後、ダッシュボードに遷移
  await expect(page).toHaveURL('/world');
  
  // 仮想空間に入る
  await expect(page.locator('canvas')).toBeVisible();
  
  // チャットメッセージを送信
  await page.fill('input[placeholder="メッセージを入力"]', 'Hello World');
  await page.press('input[placeholder="メッセージを入力"]', 'Enter');
  
  // メッセージが表示されることを確認
  await expect(page.locator('text=Hello World')).toBeVisible();
});
```

---

## 🚀 デプロイメント戦略

### 環境構成

```
環境
├── Development (ローカル)
│   ├── Docker Compose
│   ├── ホットリロード有効
│   └── デバッグツール有効
│
├── Staging (テスト環境)
│   ├── Vercel Preview
│   ├── 本番同等の設定
│   └── テストデータ
│
└── Production (本番環境)
    ├── Vercel (フロントエンド)
    ├── Render/Railway (バックエンド)
    ├── Supabase/Neon (PostgreSQL)
    └── Upstash Redis (Redis)
```

### CI/CDパイプライン

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run type check
        run: npm run type-check
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
  
  deploy-staging:
    needs: test
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel (Staging)
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
  
  deploy-production:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel (Production)
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### 環境変数管理

```bash
# .env.example
# データベース
DATABASE_URL=postgresql://user:password@localhost:5432/schoolverse

# Redis
REDIS_URL=redis://localhost:6379

# JWT
ACCESS_TOKEN_SECRET=your_access_token_secret_here
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here

# アプリケーション
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001

# 外部サービス
# (将来的に追加)
```

---

## 📊 モニタリング・ロギング

### ロギング戦略

```typescript
// lib/logger.ts
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
});

export function logInfo(message: string, data?: any): void {
  logger.info({ ...data }, message);
}

export function logError(message: string, error: Error, data?: any): void {
  logger.error({
    ...data,
    error: {
      message: error.message,
      stack: error.stack,
    },
  }, message);
}

export function logDebug(message: string, data?: any): void {
  logger.debug({ ...data }, message);
}
```

---

## ✅ 実装チェックリスト

### Phase 1: MVP (Week 1-8)

**Week 1: 環境構築**
- [x] Next.js プロジェクト初期化
- [x] TypeScript設定
- [x] ESLint/Prettier設定
- [x] Docker Compose作成
- [x] PostgreSQL接続確認
- [x] Redis接続確認
- [x] Prisma セットアップ
- [x] 共通型定義ファイル作成

**Week 2-3: 認証システム**
- [x] Prisma User モデル作成
- [x] bcrypt統合
- [x] JWT生成・検証関数
- [x] サインアップAPI実装
- [x] ログインAPI実装
- [x] リフレッシュトークンAPI実装
- [x] ログインフォーム実装
- [x] サインアップフォーム実装
- [x] 認証状態管理 (Zustand)
- [ ] 認証テスト

**Week 4-5: 仮想空間**
- [ ] Canvas初期化
- [ ] レンダリングループ
- [ ] タイルマップ描画
- [ ] アバター描画システム
- [ ] キーボード入力処理
- [ ] 移動ロジック
- [ ] 衝突検知
- [ ] カメラ追従
- [ ] Socket.ioサーバー設定
- [ ] Socket.ioクライアント設定
- [ ] 位置同期イベント
- [ ] 複数ユーザー表示
- [ ] 仮想空間テスト

**Week 6-7: チャット**
- [ ] Message モデル作成
- [ ] チャットUI実装
- [ ] メッセージ送信イベント
- [ ] メッセージ受信イベント
- [ ] ルームチャット実装
- [ ] チャット履歴表示
- [ ] チャット履歴API
- [ ] タイピングインジケーター
- [ ] チャットテスト

**Week 8: MVP統合**
- [ ] 全機能統合テスト
- [ ] エッジケーステスト
- [ ] パフォーマンステスト
- [ ] バグ修正
- [ ] ドキュメント更新

---

## 🎓 開発ガイドライン

### コーディング規約

```typescript
/**
 * ファイル命名規則
 */
// コンポーネント: PascalCase
UserProfile.tsx
MessageList.tsx

// フック: camelCase with 'use' prefix
useAuth.ts
useSocket.ts

// ユーティリティ: camelCase
validation.ts
formatting.ts

// 型定義: camelCase with '.types' suffix
user.types.ts
api.types.ts

/**
 * コメント規約
 */
// ファイルヘッダー
/**
 * @file UserProfile.tsx
 * @description ユーザープロフィール表示コンポーネント
 * @author Your Name
 * @created 2025-10-22
 */

// 関数JSDoc
/**
 * ユーザーをデータベースから取得
 * @param userId - ユーザーID
 * @returns ユーザー情報、見つからない場合はnull
 * @throws {DatabaseError} データベースエラー時
 */
async function fetchUser(userId: string): Promise<User | null> {
  // implementation
}

// インラインコメント (複雑なロジックのみ)
// WebRTCのICE候補を収集中は接続を待機
if (connectionState === 'gathering') {
  await waitForIceCandidates();
}
```

### Gitワークフロー

```bash
# ブランチ戦略
main          # 本番環境
develop       # 開発環境
feature/*     # 機能開発
bugfix/*      # バグ修正
hotfix/*      # 緊急修正

# コミットメッセージ (Conventional Commits)
feat: 新機能追加
fix: バグ修正
docs: ドキュメント更新
style: コードフォーマット
refactor: リファクタリング
test: テスト追加・修正
chore: ビルド・設定変更

# 例
feat(auth): implement JWT authentication
fix(canvas): resolve avatar rendering issue
docs(api): update API documentation
```

---

## 📚 参考資料・リンク

### 公式ドキュメント
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Socket.io Documentation](https://socket.io/docs/)
- [WebRTC API](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)

### ベストプラクティス
- [React Best Practices](https://react.dev/learn)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [Next.js Production Checklist](https://nextjs.org/docs/pages/building-your-application/deploying/production-checklist)

---

## 🔄 変更履歴

| バージョン | 日付 | 変更内容 | 作成者 |
|-----------|------|----------|--------|
| 1.0.0 | 2025-10-22 | 初版作成 | Claude + User |

---

## ✨ 次のステップ

この要件定義書を完成させた後:

1. **今すぐ実行**
   - [x] 開発環境セットアップ
   - [x] プロジェクト構造作成
   - [x] Git初期化

2. **今週中に実行**
   - [x] Phase 1 Week 1タスク開始
   - [ ] 認証システム設計レビュー

3. **来週以降**
   - [ ] MVP開発本格開始
   - [ ] 定期的なレビューミーティング


4. **フォローアップ (2025-10-22)**
   - [ ] 認証APIの統合テスト追加
---

**このドキュメントは開発の羅針盤です。**
実装中に疑問が生じたら、常にこのドキュメントに立ち返り、
設計の意図と制約を確認してください。

**承認**

□ 要件定義書レビュー完了  
□ 技術設計承認  
□ 実装開始承認

---
## 追加機能計画 (v2.1.0)

```
【追加機能】
├─ デジタルノートシステム
│  ├─ PDF・画像への描画・注釈
│  ├─ 手書きメモ機能
│  └─ マルチデバイス同期
│
├─ OCR(文字認識)システム
│  ├─ 手書き文字認識
│  ├─ 印刷文字認識
│  └─ テキスト抽出
│
└─ AI思考整理アシスタント
   ├─ メモ・ノート自動要約
   ├─ マインドマップ生成
   └─ 学習アドバイス提案
```

## 5. 機能要求 (v2.1.0 拡張版)

### 5.1 機能一覧マップ(完全版)

```
EduVerse v2.1.0 機能ツリー
│
├─ (既存機能: 認証・3D空間・アバター・コミュニケーション)
│
├─ 【NEW】デジタルノートシステム (v2.1.0)
│  │
│  ├─ ノート作成・管理
│  │  ├─ 新規ノート作成
│  │  │  ├─ 空白ノート
│  │  │  ├─ テンプレート選択
│  │  │  │  ├─ 方眼紙
│  │  │  │  ├─ 罫線ノート
│  │  │  │  ├─ コーネルノート
│  │  │  │  ├─ マインドマップ
│  │  │  │  └─ 数学ノート(グラフ用紙)
│  │  │  └─ PDFインポート
│  │  │
│  │  ├─ ノート一覧
│  │  │  ├─ 科目別フォルダ
│  │  │  ├─ タグ管理
│  │  │  ├─ 検索・フィルター
│  │  │  ├─ 最近使用したノート
│  │  │  └─ お気に入り
│  │  │
│  │  └─ ノート共有
│  │     ├─ クラスメートと共有
│  │     ├─ 教師に提出
│  │     └─ エクスポート(PDF/PNG)
│  │
│  ├─ 描画・注釈ツール
│  │  ├─ ペンツール
│  │  │  ├─ 太さ調整(1-20px)
│  │  │  ├─ カラーパレット
│  │  │  │  ├─ 基本色(黒・赤・青・緑等)
│  │  │  │  └─ カスタムカラー
│  │  │  ├─ 透明度調整
│  │  │  └─ 筆圧感知(タブレット対応)
│  │  │
│  │  ├─ 蛍光ペン
│  │  │  ├─ 半透明マーカー
│  │  │  ├─ 複数色(黄・ピンク・青・緑)
│  │  │  └─ 太さ調整
│  │  │
│  │  ├─ 消しゴム
│  │  │  ├─ 部分消去
│  │  │  ├─ オブジェクト単位消去
│  │  │  └─ 全消去
│  │  │
│  │  ├─ 図形ツール
│  │  │  ├─ 直線
│  │  │  ├─ 矢印
│  │  │  ├─ 四角形(塗りつぶし・枠線)
│  │  │  ├─ 円・楕円
│  │  │  ├─ 三角形
│  │  │  └─ 自由多角形
│  │  │
│  │  ├─ テキストツール
│  │  │  ├─ テキストボックス挿入
│  │  │  ├─ フォント選択
│  │  │  ├─ サイズ調整
│  │  │  ├─ 色変更
│  │  │  └─ 太字・斜体
│  │  │
│  │  ├─ スタンプ・アイコン
│  │  │  ├─ チェックマーク(✓ ✗)
│  │  │  ├─ 星マーク(★)
│  │  │  ├─ 重要(!?)
│  │  │  ├─ 絵文字
│  │  │  └─ カスタムスタンプ
│  │  │
│  │  ├─ 付箋機能
│  │  │  ├─ カラフル付箋
│  │  │  ├─ サイズ変更
│  │  │  ├─ 移動・配置
│  │  │  └─ テキスト入力
│  │  │
│  │  └─ レイヤー管理
│  │     ├─ レイヤー追加・削除
│  │     ├─ 表示・非表示
│  │     ├─ 順序変更
│  │     └─ ロック機能
│  │
│  ├─ PDF・画像への注釈
│  │  ├─ PDFアップロード
│  │  │  ├─ ドラッグ&ドロップ
│  │  │  ├─ ファイル選択
│  │  │  └─ 最大サイズ: 20MB
│  │  │
│  │  ├─ 画像アップロード
│  │  │  ├─ JPG/PNG/HEIC対応
│  │  │  ├─ カメラ撮影(モバイル)
│  │  │  └─ 自動回転補正
│  │  │
│  │  ├─ ページナビゲーション
│  │  │  ├─ サムネイル表示
│  │  │  ├─ ページジャンプ
│  │  │  └─ 複数ページ編集
│  │  │
│  │  ├─ 描画モード
│  │  │  ├─ 全描画ツール使用可能
│  │  │  ├─ 元データ保護(非破壊編集)
│  │  │  └─ 注釈レイヤー分離
│  │  │
│  │  └─ エクスポート
│  │     ├─ 注釈付きPDF出力
│  │     ├─ 画像形式(PNG/JPG)
│  │     └─ 印刷レイアウト最適化
│  │
│  ├─ 手書き認識・変換
│  │  ├─ 手書き文字入力
│  │  │  ├─ リアルタイム認識
│  │  │  ├─ 後処理一括変換
│  │  │  └─ 手書き保持オプション
│  │  │
│  │  ├─ 図形認識
│  │  │  ├─ 手書き図形→整形図形
│  │  │  ├─ 円・四角・三角認識
│  │  │  └─ 矢印・線の整形
│  │  │
│  │  └─ 数式認識
│  │     ├─ 手書き数式→LaTeX
│  │     ├─ 分数・ルート認識
│  │     └─ 複雑な数式対応
│  │
│  └─ 編集・操作機能
│     ├─ Undo/Redo (無制限)
│     ├─ コピー・ペースト
│     ├─ 選択ツール(なげなわ・四角)
│     ├─ オブジェクト移動・リサイズ
│     ├─ グループ化
│     ├─ 回転・反転
│     └─ 整列ツール
│
├─ 【NEW】OCR(文字認識)システム (v2.1.0)
│  │
│  ├─ 画像からテキスト抽出
│  │  ├─ 写真撮影
│  │  │  ├─ カメラ起動
│  │  │  ├─ ノート・教科書撮影
│  │  │  ├─ ホワイトボード撮影
│  │  │  └─ テスト用紙撮影
│  │  │
│  │  ├─ 画像アップロード
│  │  │  ├─ ライブラリから選択
│  │  │  ├─ 複数枚一括処理
│  │  │  └─ 自動傾き補正
│  │  │
│  │  └─ 前処理
│  │     ├─ 画質向上(超解像)
│  │     ├─ ノイズ除去
│  │     ├─ コントラスト調整
│  │     └─ 歪み補正
│  │
│  ├─ OCR処理エンジン
│  │  ├─ 日本語対応
│  │  │  ├─ ひらがな・カタカナ
│  │  │  ├─ 漢字(常用漢字+教育漢字)
│  │  │  └─ 旧字体・異体字
│  │  │
│  │  ├─ 英語対応
│  │  │  ├─ 活字体
│  │  │  └─ 筆記体
│  │  │
│  │  ├─ 数式対応
│  │  │  ├─ 四則演算
│  │  │  ├─ 分数・ルート
│  │  │  ├─ 積分・微分記号
│  │  │  └─ 行列・ベクトル
│  │  │
│  │  └─ 手書き文字認識
│  │     ├─ 癖字対応
│  │     ├─ 学習機能(個人最適化)
│  │     └─ 信頼度スコア表示
│  │
│  ├─ テキスト編集・修正
│  │  ├─ 認識結果表示
│  │  │  ├─ 元画像と並列表示
│  │  │  ├─ 信頼度ハイライト
│  │  │  │  ├─ 高信頼度: 緑
│  │  │  │  ├─ 中信頼度: 黄
│  │  │  │  └─ 低信頼度: 赤
│  │  │  └─ 誤認識候補表示
│  │  │
│  │  ├─ 手動修正
│  │  │  ├─ インライン編集
│  │  │  ├─ 候補選択
│  │  │  └─ 削除・追加
│  │  │
│  │  └─ フォーマット保持
│  │     ├─ 改行・段落維持
│  │     ├─ 箇条書き検出
│  │     └─ レイアウト復元
│  │
│  └─ 出力・保存
│     ├─ プレーンテキスト
│     ├─ Markdown形式
│     ├─ Word文書(.docx)
│     ├─ PDF(検索可能)
│     └─ ノートに直接挿入
│
├─ 【NEW】AI思考整理アシスタント (v2.1.0)
│  │
│  ├─ 自動要約機能
│  │  ├─ ノート要約
│  │  │  ├─ 長文ノート→要点抽出
│  │  │  ├─ 要約レベル選択
│  │  │  │  ├─ 簡潔(50字)
│  │  │  │  ├─ 標準(200字)
│  │  │  │  └─ 詳細(500字)
│  │  │  └─ 箇条書き出力
│  │  │
│  │  ├─ 複数ノート統合
│  │  │  ├─ テーマ別まとめ
│  │  │  ├─ 時系列整理
│  │  │  └─ 関連性分析
│  │  │
│  │  └─ 学習用要約
│  │     ├─ 暗記カード自動生成
│  │     ├─ 重要キーワード抽出
│  │     └─ 問題形式変換
│  │
│  ├─ マインドマップ自動生成
│  │  ├─ テキストからマインドマップ
│  │  │  ├─ 中心トピック抽出
│  │  │  ├─ 階層構造分析
│  │  │  ├─ 関連語グルーピング
│  │  │  └─ ビジュアル配置最適化
│  │  │
│  │  ├─ カスタマイズ
│  │  │  ├─ 色・形状変更
│  │  │  ├─ ノード追加・削除
│  │  │  ├─ 接続線編集
│  │  │  └─ アイコン追加
│  │  │
│  │  └─ エクスポート
│  │     ├─ 画像(PNG/SVG)
│  │     ├─ PDF
│  │     └─ 編集可能形式
│  │
│  ├─ 思考整理支援
│  │  ├─ 論理構造分析
│  │  │  ├─ 主張・根拠の抽出
│  │  │  ├─ 矛盾点指摘
│  │  │  └─ 論理の飛躍検出
│  │  │
│  │  ├─ メモ整理提案
│  │  │  ├─ カテゴリ分類提案
│  │  │  ├─ 優先順位付け
│  │  │  └─ タスク抽出
│  │  │
│  │  └─ 補足情報提供
│  │     ├─ 関連概念説明
│  │     ├─ 具体例提示
│  │     └─ 参考資料リンク
│  │
│  ├─ 学習アドバイス
│  │  ├─ 理解度分析
│  │  │  ├─ ノート内容評価
│  │  │  ├─ 理解の穴発見
│  │  │  └─ 弱点克服提案
│  │  │
│  │  ├─ 学習計画提案
│  │  │  ├─ 復習タイミング
│  │  │  ├─ 次に学ぶべき内容
│  │  │  └─ 効率的学習順序
│  │  │
│  │  └─ 記憶定着支援
│  │     ├─ 語呂合わせ生成
│  │     ├─ イメージ連想法
│  │     └─ ストーリー化
│  │
│  └─ 質問応答機能
│     ├─ ノート内容への質問
│     │  ├─ 「これはどういう意味?」
│     │  ├─ 「もっと詳しく教えて」
│     │  └─ 「例を教えて」
│     │
│     ├─ 発展的質問
│     │  ├─ 「応用問題を出して」
│     │  ├─ 「実世界での使い方は?」
│     │  └─ 「関連する他の概念は?」
│     │
│     └─ 対話履歴保存
│        ├─ 質問・回答記録
│        ├─ ノートに追記
│        └─ 後で復習可能
│
├─ (既存機能: 学習管理・ビデオ会議・課題システム・カリキュラム等)
│
└─ 【ダッシュボード拡張】
   └─ 生徒用
      ├─ 【NEW】ノートサマリー
      │  ├─ 今週作成したノート
      │  ├─ AI要約済みノート
      │  └─ 共有されたノート
      │
      └─ 【NEW】学習インサイト
         ├─ よく書くキーワード
         ├─ 学習時間(ノート作成)
         └─ 理解度スコア(AI分析)
```

### 5.2 優先度別機能リスト(v2.1.0追加)

#### 🟡 Should Have (Phase 3.5 - ノート機能)

| 機能ID | 機能名 | 説明 | 工数 |
|--------|--------|------|------|
| F050 | デジタルノート基盤 | Canvas描画エンジン | 10日 |
| F051 | 描画ツール | ペン・図形・消しゴム | 10日 |
| F052 | PDF注釈 | PDFビューア+描画 | 7日 |
| F053 | 画像注釈 | 画像表示+描画 | 5日 |
| F054 | テキストツール | テキストボックス挿入 | 5日 |
| F055 | レイヤー管理 | レイヤー操作UI | 5日 |

**Phase 3.5 合計**: 約42日 (2ヶ月)

#### 🟡 Should Have (Phase 4.5 - OCR・AI)

| 機能ID | 機能名 | 説明 | 工数 |
|--------|--------|------|------|
| F060 | OCR統合 | Google Cloud Vision API | 7日 |
| F061 | 画像前処理 | 画質向上・補正 | 5日 |
| F062 | テキスト編集UI | 認識結果修正 | 5日 |
| F063 | 手書き認識 | 日本語手書き対応 | 7日 |
| F064 | AI要約 | GPT-4要約機能 | 7日 |
| F065 | マインドマップ生成 | 自動構造化 | 10日 |
| F066 | 学習アドバイス | AI分析・提案 | 7日 |

**Phase 4.5 合計**: 約48日 (2ヶ月)

---

## 7. 技術要求 (v2.1.0拡張版)

### 7.1 技術スタック全体像(v2.1.0)

```
┌─────────────────────────────────────────┐
│          フロントエンド (Vercel)          │
├─────────────────────────────────────────┤
│ Next.js 15.0.x (App Router)             │
│ React 19.x                              │
│ TypeScript 5.3.x                        │
│ Three.js / React Three Fiber            │
│ Socket.io-client 4.x                    │
│ mediasoup-client (WebRTC SFU)           │
│                                         │
│ 【NEW】ノート・描画ライブラリ            │
│ - fabric.js 6.x (Canvas描画)            │
│ - react-pdf 7.x (PDF表示)               │
│ - pdfjs-dist 3.x (PDF処理)              │
│ - react-signature-canvas (手書き)       │
│ - konva (高度な描画)                     │
│                                         │
│ 【NEW】画像処理                          │
│ - browser-image-compression (圧縮)      │
│ - cropperjs (トリミング)                 │
│                                         │
│ 【NEW】数式・図表                        │
│ - katex (数式レンダリング)               │
│ - mermaid (ダイアグラム)                 │
│ - react-flow (フローチャート)            │
│                                         │
│ Zustand (状態管理)                       │
│ TailwindCSS + shadcn/ui                 │
│ Chart.js (グラフ)                        │
│ react-dropzone (ファイルアップロード)     │
└─────────────────────────────────────────┘
                    ↕ HTTPS/WSS
┌─────────────────────────────────────────┐
│         バックエンド (Render)             │
├─────────────────────────────────────────┤
│ Node.js 20.x LTS                        │
│ Express.js 4.x                          │
│ TypeScript 5.3.x                        │
│ Socket.io 4.x                           │
│ mediasoup 3.x (WebRTC SFU)              │
│ Prisma 5.x (ORM)                        │
│ JWT (jsonwebtoken)                      │
│ bcryptjs                                │
│ multer (ファイルアップロード)             │
│ sharp (画像処理)                         │
│                                         │
│ 【NEW】PDF処理                           │
│ - pdf-lib 1.x (PDF操作)                 │
│ - pdf-parse (PDF解析)                   │
│                                         │
│ 【NEW】OCRライブラリ                     │
│ - @google-cloud/vision (Google Vision) │
│ - tesseract.js (オープンソースOCR)       │
│                                         │
│ 【NEW】AI処理                            │
│ - OpenAI API (GPT-4o-mini)              │
│ - Anthropic Claude API (代替)           │
└─────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────┐
│        データベース (Supabase)            │
├─────────────────────────────────────────┤
│ PostgreSQL 15.x                         │
│ (無料枠: 500MB DB, 1GB Storage)          │
│                                         │
│ 【NEW】ノートデータ管理                  │
│  ├─ ノートメタデータ(DB)                 │
│  ├─ 描画データ(JSON in DB)              │
│  └─ 画像・PDFファイル(Storage)           │
└─────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────┐
│          キャッシュ (Upstash)             │
├─────────────────────────────────────────┤
│ Redis (無料枠: 10,000リクエスト/日)       │
│ - セッション管理                         │
│ - Rate Limiting                         │
│ 【NEW】OCR結果キャッシュ                 │
└─────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────┐
│         【NEW】外部AI Services            │
├─────────────────────────────────────────┤
│ OpenAI API (GPT-4o-mini)                │
│ - AI要約                                │
│ - 学習アドバイス                         │
│ - マインドマップ生成                     │
│                                         │
│ Google Cloud Vision API                 │
│ - OCR処理                               │
│ - 手書き文字認識                         │
│ (無料枠: 1,000リクエスト/月)             │
└─────────────────────────────────────────┘
```
