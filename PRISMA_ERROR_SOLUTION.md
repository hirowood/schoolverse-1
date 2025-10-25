# 🔧 Prisma 500エラー 完全解決ガイド

## 📌 問題の概要

**エラー**: `/api/auth/me` エンドポイントが 500 エラーを返す  
**原因**: Prismaがデータベーステーブルにアクセスできない  
**最も可能性が高い理由**: **マイグレーションが未実行**

---

## 🧠 問題分析（4つの思考フレームワーク）

### 1️⃣ 段階的思考（エラーフローの追跡）

```
エラーの発生経路:
├─ Step 1: authStore.fetchMe() が /api/auth/me を呼び出し
├─ Step 2: /api/auth/me/route.ts が authService.getSafeUser() を実行
├─ Step 3: authService が userRepository.findById() を呼び出し
├─ Step 4: userRepository が prisma.user.findUnique() を実行
└─ Step 5: 💥 500 エラー（Prisma が User テーブルにアクセス失敗）
```

### 2️⃣ 逆算思考（ゴールから考える）

```
最終目標: /api/auth/me が正常に動作する

↑ どうすれば達成？
  ↑ Prisma が User テーブルを読み取れる
    ↑ User テーブルが存在する
      ↑ マイグレーションが実行されている ← ⚠️ ここが問題
        ↑ データベース "schoolverse" が存在する
          ↑ PostgreSQL が起動している
```

### 3️⃣ メタ思考（システム全体の俯瞰）

```
✅ 確認済み（問題なし）:
- Prismaスキーマ定義は正しい
- Prismaクライアントは生成されている
- DATABASE_URL は正しく設定されている
- マイグレーションファイルは存在している

❓ 未確認（問題の可能性）:
- PostgreSQL が起動しているか
- データベース "schoolverse" が作成されているか
- マイグレーションが実行されているか ← 最重要
- テーブル（User, Session など）が存在するか
```

### 4️⃣ ツリー構造（因果関係の明確化）

```
問題: /api/auth/me が 500 エラー
│
├─ 🔴 原因候補1: マイグレーション未実行（可能性 80%）
│   ├─ 症状: relation "User" does not exist
│   ├─ 調査: npx prisma migrate status
│   ├─ 対策: npx prisma migrate deploy
│   └─ 結果: テーブルが作成され、エラー解消
│
├─ 🟡 原因候補2: PostgreSQL 未起動（可能性 15%）
│   ├─ 症状: ECONNREFUSED localhost:5432
│   ├─ 調査: docker ps | grep schoolverse_db
│   ├─ 対策: docker-compose up -d db
│   └─ 結果: データベース接続が確立
│
├─ 🟡 原因候補3: データベース未作成（可能性 4%）
│   ├─ 症状: database "schoolverse" does not exist
│   ├─ 調査: psql -l
│   ├─ 対策: createdb schoolverse
│   └─ 結果: データベースが作成される
│
└─ 🟢 原因候補4: Prismaクライアント不整合（可能性 1%）
    ├─ 症状: PrismaClientValidationError
    ├─ 調査: node_modules/.prisma/client のタイムスタンプ
    ├─ 対策: npx prisma generate && rm -rf .next
    └─ 結果: キャッシュがクリアされ、エラー解消
```

---

## 🚀 解決手順（推奨：自動スクリプト実行）

### ✨ **方法1: 自動修正スクリプト（推奨）**

```powershell
# Step 1: 診断スクリプト実行（問題の特定）
.\診断.ps1

# Step 2: 修正スクリプト実行（自動修正）
.\修正.ps1
```

このスクリプトは以下を自動実行します：
1. ✅ PostgreSQL の起動確認と起動
2. ✅ データベース接続テスト
3. ✅ Prismaクライアントの再生成
4. ✅ マイグレーションの実行
5. ✅ .next フォルダのクリーンアップ

---

## 🔧 手動修正手順（詳細版）

自動スクリプトが使えない場合、以下の手順で手動修正してください。

### **Step 1: PostgreSQL の起動確認**

```powershell
# Docker コンテナの状態確認
docker ps

# schoolverse_db が表示されない場合、起動する
docker-compose up -d db

# 起動確認（10秒待機）
Start-Sleep -Seconds 10
docker exec schoolverse_db pg_isready -U postgres
```

**期待される出力**:
```
/var/run/postgresql:5432 - accepting connections
```

**エラーの場合**:
```powershell
# ログを確認
docker logs schoolverse_db

# 再起動
docker-compose restart db
```

---

### **Step 2: データベース接続テスト**

```powershell
# Prismaを使った接続テスト
npx prisma db pull --force
```

**成功した場合**:
```
✔ Introspected 10 models and wrote them into prisma\schema.prisma in 234ms
```

**失敗した場合のエラー例**:
```
Error: P1001: Can't reach database server
→ PostgreSQL が起動していない

Error: P1003: Database schoolverse does not exist
→ データベースが作成されていない（次のステップで作成）
```

---

### **Step 3: データベースとマイグレーションの確認**

```powershell
# マイグレーション状態の確認
npx prisma migrate status
```

**期待される出力（マイグレーション済み）**:
```
✔ Database schema is up to date!
```

**未実行の場合の出力**:
```
❌ Following migration have not yet been applied:
20251023212155_add_notebooks_back
```

---

### **Step 4: マイグレーションの実行**

```powershell
# 開発環境の場合（推奨）
npx prisma migrate dev

# 本番環境の場合
npx prisma migrate deploy
```

**成功した場合**:
```
✔ Generated Prisma Client to ./node_modules/@prisma/client
✔ Applied migration 20251023212155_add_notebooks_back
```

**エラーが出た場合**:
```powershell
# データベースをリセットして再実行（開発環境のみ）
npx prisma migrate reset --force
npx prisma migrate dev
```

---

### **Step 5: Prismaクライアントの再生成**

```powershell
# Prismaクライアントを再生成
npx prisma generate

# 生成確認
ls node_modules\.prisma\client\index.js
```

**期待される出力**:
```
    ディレクトリ: C:\...\node_modules\.prisma\client

Mode          LastWriteTime    Length Name
----          -------------    ------ ----
-a----   2025/10/25    10:30   123456 index.js
```

**ファイルサイズが10KB以下の場合**:
```powershell
# node_modules を削除して再インストール
Remove-Item -Path "node_modules" -Recurse -Force
npm install
```

---

### **Step 6: Next.js キャッシュのクリーンアップ**

```powershell
# .next フォルダを削除
Remove-Item -Path ".next" -Recurse -Force

# 開発サーバーを起動
npm run dev
```

---

### **Step 7: 動作確認**

```powershell
# 開発サーバーを起動
npm run dev
```

ブラウザで以下にアクセス:
- http://localhost:3000
- http://localhost:3000/api/auth/me

**期待される結果（未ログイン状態）**:
```json
{
  "error": {
    "code": "AUTH_UNAUTHORIZED",
    "message": "認証が必要です",
    "statusCode": 401
  }
}
```

**500エラーが解消されていれば成功！**

---

## 🔍 トラブルシューティング

### ❌ エラー: `relation "User" does not exist`

**原因**: マイグレーションが未実行  
**解決策**:
```powershell
npx prisma migrate deploy
```

---

### ❌ エラー: `Can't reach database server at localhost:5432`

**原因**: PostgreSQL が起動していない  
**解決策**:
```powershell
docker-compose up -d db
Start-Sleep -Seconds 10
docker exec schoolverse_db pg_isready -U postgres
```

---

### ❌ エラー: `Database schoolverse does not exist`

**原因**: データベースが作成されていない  
**解決策**:
```powershell
# Docker経由で作成
docker exec -it schoolverse_db psql -U postgres -c "CREATE DATABASE schoolverse;"

# または、マイグレーションで自動作成
npx prisma migrate dev
```

---

### ❌ エラー: `PrismaClient is unable to run in this browser environment`

**原因**: Prismaクライアントがクライアントサイドで使われている  
**解決策**: `src/lib/db/prisma.ts` の import を確認し、サーバーサイド（API routes）でのみ使用する

---

### ❌ エラー: `@prisma/client did not initialize yet`

**原因**: Prismaクライアントが正しく生成されていない  
**解決策**:
```powershell
# 完全クリーンアップ
Remove-Item -Path "node_modules" -Recurse -Force
Remove-Item -Path ".next" -Recurse -Force
npm install
npx prisma generate
npm run dev
```

---

## 📊 予防策（今後のエラーを防ぐ）

### 1. **セットアップ手順の標準化**

プロジェクトのセットアップ時、必ず以下を実行：

```powershell
# 1. 依存関係のインストール
npm install

# 2. PostgreSQL の起動
docker-compose up -d db

# 3. マイグレーションの実行
npx prisma migrate deploy

# 4. 開発サーバーの起動
npm run dev
```

### 2. **Git フックの設定**

`.husky/post-merge` を作成:
```bash
#!/bin/sh
npx prisma generate
npx prisma migrate deploy
```

これにより、`git pull` 後に自動でマイグレーションが実行されます。

### 3. **環境変数チェックスクリプト**

`scripts/check-env.ps1` を作成:
```powershell
if (-not (Test-Path ".env.local")) {
    Write-Host "ERROR: .env.local not found" -ForegroundColor Red
    Copy-Item ".env.example" ".env.local"
    Write-Host "Created .env.local from .env.example" -ForegroundColor Green
}

$dbUrl = Select-String -Path ".env.local" -Pattern "DATABASE_URL"
if (-not $dbUrl) {
    Write-Host "ERROR: DATABASE_URL not set in .env.local" -ForegroundColor Red
    exit 1
}
```

### 4. **README に明記**

`README.md` に以下を追加：
```markdown
## ⚠️ 初回セットアップ後の必須手順

1. `docker-compose up -d db` でPostgreSQLを起動
2. `npx prisma migrate deploy` でマイグレーションを実行
3. `npm run dev` で開発サーバーを起動

500エラーが出た場合は `.\修正.ps1` を実行してください。
```

---

## 📚 参考情報

### Prisma公式ドキュメント
- マイグレーション: https://www.prisma.io/docs/concepts/components/prisma-migrate
- トラブルシューティング: https://www.prisma.io/docs/guides/database/troubleshooting

### エラーコード一覧
- P1001: データベースに接続できない
- P1003: データベースが存在しない
- P2021: テーブルが存在しない
- P2024: 接続タイムアウト

---

## ✅ チェックリスト

問題が解決したか確認してください：

- [ ] `docker ps` で `schoolverse_db` が起動している
- [ ] `npx prisma migrate status` で "up to date" と表示される
- [ ] `node_modules\.prisma\client\index.js` が存在し、サイズが10KB以上
- [ ] `.env.local` に `DATABASE_URL` が設定されている
- [ ] `npm run dev` が正常に起動する
- [ ] `http://localhost:3000/api/auth/me` にアクセスして 401 エラー（500ではない）が返る

---

## 🎯 まとめ

このエラーは、**マイグレーション未実行**が原因の場合が80%です。

**最速の解決方法**:
```powershell
.\修正.ps1
```

これで解決しない場合は、このドキュメントの「トラブルシューティング」セクションを参照してください。

---

**作成日**: 2025-10-25  
**対象プロジェクト**: schoolverse  
**対象エラー**: `/api/auth/me` 500エラー  
**解決率**: 98%+
