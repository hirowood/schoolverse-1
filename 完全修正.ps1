# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🎯 Prisma ID自動生成 完全修正スクリプト
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 
# 【目的】
# 全モデルの id フィールドに @default(uuid()) を追加し、
# ID自動生成を有効化する
#
# 【対象モデル】
# User, Session, Message, Notebook, NotebookPage, 
# Room, RoomMember, VoiceCall (計8モデル)
#
# 【実行内容】
# 1. 環境診断
# 2. バックアップ作成
# 3. スキーマ修正
# 4. マイグレーション実行
# 5. Prismaクライアント再生成
# 6. キャッシュクリーンアップ
# 7. 動作確認
#
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# エラーで停止
$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🔧 Prisma ID自動生成 完全修正スクリプト" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Step 0: 環境診断
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "Step 0/7: 環境診断" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

# Node.js 確認
Write-Host "📦 Node.js バージョン:" -ForegroundColor Cyan
node --version

# PostgreSQL 確認
Write-Host ""
Write-Host "🐘 PostgreSQL 起動確認:" -ForegroundColor Cyan
$dockerRunning = docker ps --filter "name=schoolverse_db" --format "{{.Names}}" 2>$null
if ($dockerRunning -eq "schoolverse_db") {
    Write-Host "✅ PostgreSQL は起動しています" -ForegroundColor Green
} else {
    Write-Host "❌ PostgreSQL が起動していません" -ForegroundColor Red
    Write-Host ""
    $startDb = Read-Host "PostgreSQL を起動しますか？ (y/n)"
    if ($startDb -eq "y") {
        docker-compose up -d db
        Write-Host "⏳ データベース起動を待機中（10秒）..." -ForegroundColor Cyan
        Start-Sleep -Seconds 10
    } else {
        Write-Host "PostgreSQL を起動してから再実行してください" -ForegroundColor Red
        exit 1
    }
}

# schema.prisma 存在確認
Write-Host ""
Write-Host "📄 schema.prisma 存在確認:" -ForegroundColor Cyan
if (-not (Test-Path "prisma\schema.prisma")) {
    Write-Host "❌ prisma\schema.prisma が見つかりません" -ForegroundColor Red
    exit 1
}
Write-Host "✅ schema.prisma が存在します" -ForegroundColor Green

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "診断完了 - 環境は正常です" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# 実行確認
Write-Host "このスクリプトは以下を実行します:" -ForegroundColor Yellow
Write-Host "  1. schema.prisma のバックアップ" -ForegroundColor White
Write-Host "  2. 全8モデルに @default(uuid()) を追加" -ForegroundColor White
Write-Host "  3. マイグレーション実行（データベース更新）" -ForegroundColor White
Write-Host "  4. Prismaクライアント再生成" -ForegroundColor White
Write-Host "  5. .next フォルダのクリーンアップ" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  注意: 既存データがある場合、マイグレーションが失敗する可能性があります" -ForegroundColor Yellow
Write-Host "         その場合、データベースリセット（全データ削除）が必要です" -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "続行しますか？ (y/n)"
if ($confirm -ne "y") {
    Write-Host "キャンセルしました" -ForegroundColor Red
    exit 0
}
Write-Host ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Step 1: バックアップ作成
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "Step 1/7: バックアップ作成" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupPath = "prisma\schema.prisma.backup.$timestamp"

try {
    Copy-Item "prisma\schema.prisma" $backupPath -ErrorAction Stop
    Write-Host "✅ バックアップ作成: $backupPath" -ForegroundColor Green
} catch {
    Write-Host "❌ バックアップ作成に失敗しました" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
Write-Host ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Step 2: スキーマ修正
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "Step 2/7: スキーマ修正" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

# スキーマファイルを読み込み
$schemaContent = Get-Content "prisma\schema.prisma" -Raw

# 修正前の id フィールド数をカウント
$beforeCount = ([regex]::Matches($schemaContent, '^\s+id\s+String\s+@id\s*$', [System.Text.RegularExpressions.RegexOptions]::Multiline)).Count
Write-Host "📊 修正対象: $beforeCount 個の id フィールド" -ForegroundColor Cyan

# 修正: id String @id → id String @id @default(uuid())
# 複数行モードで、改行を考慮した正規表現
$modifiedContent = $schemaContent -replace '(?m)^(\s+id\s+String\s+@id)\s*$', '$1 @default(uuid())'

# 修正後のカウント
$afterCount = ([regex]::Matches($modifiedContent, '@default\(uuid\(\)\)', [System.Text.RegularExpressions.RegexOptions]::Multiline)).Count

if ($afterCount -eq 0) {
    Write-Host "❌ 修正に失敗しました（@default(uuid()) が追加されませんでした）" -ForegroundColor Red
    Write-Host "   バックアップから復元: Copy-Item $backupPath prisma\schema.prisma" -ForegroundColor Yellow
    exit 1
}

# ファイルに書き込み（UTF-8 BOM無し）
[System.IO.File]::WriteAllText("$PWD\prisma\schema.prisma", $modifiedContent, [System.Text.UTF8Encoding]::new($false))

Write-Host "✅ schema.prisma を修正しました" -ForegroundColor Green
Write-Host "   修正されたフィールド数: $afterCount 個" -ForegroundColor Cyan
Write-Host ""

# 修正内容のプレビュー
Write-Host "📝 修正内容のプレビュー:" -ForegroundColor Cyan
$modifiedLines = Select-String -Path "prisma\schema.prisma" -Pattern "id\s+String\s+@id\s+@default\(uuid\(\)\)" 
$modifiedLines | ForEach-Object {
    $line = $_.Line.Trim()
    Write-Host "  ✓ $line" -ForegroundColor Green
}
Write-Host ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Step 3: スキーマバリデーション
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "Step 3/7: スキーマバリデーション" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

Write-Host "🔍 スキーマの妥当性を検証中..." -ForegroundColor Cyan
$validateOutput = npx prisma validate 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ スキーマにエラーがあります" -ForegroundColor Red
    Write-Host $validateOutput -ForegroundColor Red
    Write-Host ""
    Write-Host "バックアップから復元: Copy-Item $backupPath prisma\schema.prisma" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ スキーマは正常です" -ForegroundColor Green
Write-Host ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Step 4: マイグレーション実行
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "Step 4/7: マイグレーション実行" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

Write-Host "🔄 マイグレーションを作成・実行中..." -ForegroundColor Cyan
Write-Host "   （データベーススキーマを更新しています）" -ForegroundColor Cyan
Write-Host ""

$migrateOutput = npx prisma migrate dev --name add_uuid_default_to_all_id_fields 2>&1
$migrateSuccess = $LASTEXITCODE -eq 0

if ($migrateSuccess) {
    Write-Host "✅ マイグレーションが完了しました" -ForegroundColor Green
} else {
    Write-Host "⚠️  マイグレーションでエラーが発生しました" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "エラー内容:" -ForegroundColor Yellow
    Write-Host $migrateOutput -ForegroundColor Red
    Write-Host ""
    Write-Host "これは既存データと新しいスキーマの競合が原因の可能性があります" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "対処方法:" -ForegroundColor Cyan
    Write-Host "  1. データベースをリセット（全データ削除）して再マイグレーション" -ForegroundColor White
    Write-Host "  2. 手動でマイグレーションを修正" -ForegroundColor White
    Write-Host ""
    
    $reset = Read-Host "データベースをリセットしますか？ (y/n)"
    
    if ($reset -eq "y") {
        Write-Host ""
        Write-Host "🗑️  データベースをリセット中..." -ForegroundColor Cyan
        Write-Host "   ⚠️  全てのデータが削除されます！" -ForegroundColor Red
        Write-Host ""
        
        npx prisma migrate reset --force
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ データベースのリセットとマイグレーションが完了しました" -ForegroundColor Green
        } else {
            Write-Host "❌ リセットに失敗しました" -ForegroundColor Red
            Write-Host "   バックアップから復元: Copy-Item $backupPath prisma\schema.prisma" -ForegroundColor Yellow
            exit 1
        }
    } else {
        Write-Host ""
        Write-Host "マイグレーションをスキップしました" -ForegroundColor Yellow
        Write-Host "手動で修正してから、以下を実行してください:" -ForegroundColor Yellow
        Write-Host "  npx prisma migrate dev" -ForegroundColor White
        Write-Host ""
        Write-Host "バックアップから復元: Copy-Item $backupPath prisma\schema.prisma" -ForegroundColor Yellow
        exit 1
    }
}
Write-Host ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Step 5: Prismaクライアント再生成
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "Step 5/7: Prismaクライアント再生成" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

Write-Host "⚙️  Prismaクライアントを再生成中..." -ForegroundColor Cyan
npx prisma generate

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Prismaクライアントの再生成が完了しました" -ForegroundColor Green
} else {
    Write-Host "❌ Prismaクライアントの再生成に失敗しました" -ForegroundColor Red
    exit 1
}
Write-Host ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Step 6: キャッシュクリーンアップ
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "Step 6/7: キャッシュクリーンアップ" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

if (Test-Path ".next") {
    Write-Host "🗑️  .next フォルダを削除中..." -ForegroundColor Cyan
    Remove-Item -Path ".next" -Recurse -Force
    Write-Host "✅ .next フォルダを削除しました" -ForegroundColor Green
} else {
    Write-Host "ℹ️  .next フォルダは存在しません（スキップ）" -ForegroundColor Cyan
}
Write-Host ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Step 7: 動作確認サマリー
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "Step 7/7: 動作確認サマリー" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

Write-Host "📊 修正完了サマリー:" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ 修正されたモデル数: $afterCount 個" -ForegroundColor Green
Write-Host "   対象: User, Session, Message, Notebook, NotebookPage," -ForegroundColor White
Write-Host "         Room, RoomMember, VoiceCall" -ForegroundColor White
Write-Host ""
Write-Host "✅ マイグレーション: 完了" -ForegroundColor Green
Write-Host "✅ Prismaクライアント: 再生成完了" -ForegroundColor Green
Write-Host "✅ キャッシュ: クリーンアップ完了" -ForegroundColor Green
Write-Host ""
Write-Host "📁 バックアップファイル:" -ForegroundColor Cyan
Write-Host "   $backupPath" -ForegroundColor White
Write-Host ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 完了メッセージ
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "✨ 修正が完了しました！" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""
Write-Host "次のステップ:" -ForegroundColor Yellow
Write-Host "  1. npm run dev で開発サーバーを起動" -ForegroundColor White
Write-Host "  2. http://localhost:3000 にアクセス" -ForegroundColor White
Write-Host "  3. ユーザー登録を試す:" -ForegroundColor White
Write-Host "     - メール: test@example.com" -ForegroundColor White
Write-Host "     - ユーザー名: testuser" -ForegroundColor White
Write-Host "     - パスワード: password123" -ForegroundColor White
Write-Host "  4. ✅ 登録成功 → 問題解決！" -ForegroundColor White
Write-Host ""
Write-Host "トラブルシューティング:" -ForegroundColor Yellow
Write-Host "  問題が発生した場合は、以下で復元できます:" -ForegroundColor White
Write-Host "  Copy-Item $backupPath prisma\schema.prisma -Force" -ForegroundColor Cyan
Write-Host ""

# 開発サーバー起動の確認
$startDev = Read-Host "今すぐ開発サーバーを起動しますか？ (y/n)"
if ($startDev -eq "y") {
    Write-Host ""
    Write-Host "🚀 開発サーバーを起動しています..." -ForegroundColor Green
    Write-Host "   ブラウザで http://localhost:3000 を開いてください" -ForegroundColor Cyan
    Write-Host "   停止するには Ctrl+C を押してください" -ForegroundColor Yellow
    Write-Host ""
    npm run dev
} else {
    Write-Host ""
    Write-Host "手動で起動する場合は、以下を実行してください:" -ForegroundColor Yellow
    Write-Host "  npm run dev" -ForegroundColor White
    Write-Host ""
    Read-Host "Enterキーを押して終了"
}
