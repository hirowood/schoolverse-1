# ========================================
# Prisma ID フィールド自動生成修正スクリプト
# 実行方法: .\ID問題修正.ps1
# ========================================

Write-Host "🔧 Prisma ID フィールド自動生成の修正を開始します..." -ForegroundColor Cyan
Write-Host ""
Write-Host "この修正により、以下が実行されます:" -ForegroundColor Yellow
Write-Host "  1. schema.prisma の全モデルに @default(uuid()) を追加" -ForegroundColor White
Write-Host "  2. マイグレーションの作成と実行" -ForegroundColor White
Write-Host "  3. Prismaクライアントの再生成" -ForegroundColor White
Write-Host "  4. .next フォルダのクリーンアップ" -ForegroundColor White
Write-Host ""

$confirm = Read-Host "続行しますか？ (y/n)"
if ($confirm -ne "y") {
    Write-Host "キャンセルしました" -ForegroundColor Red
    exit
}
Write-Host ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Step 1: schema.prisma のバックアップ
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "Step 1/5: schema.prisma のバックアップ" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupPath = "prisma\schema.prisma.backup.$timestamp"

Copy-Item "prisma\schema.prisma" $backupPath
Write-Host "✅ バックアップ作成: $backupPath" -ForegroundColor Green
Write-Host ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Step 2: schema.prisma の修正
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "Step 2/5: schema.prisma の修正" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

# スキーマファイルを読み込み
$schemaContent = Get-Content "prisma\schema.prisma" -Raw

# 修正パターン：id String @id → id String @id @default(uuid())
$modifiedContent = $schemaContent -replace '(\s+id\s+String\s+@id)(\s)', '$1 @default(uuid())$2'

# ファイルに書き込み
Set-Content "prisma\schema.prisma" $modifiedContent -NoNewline

Write-Host "✅ schema.prisma を修正しました" -ForegroundColor Green
Write-Host ""

# 修正内容の確認
Write-Host "📝 修正内容のプレビュー:" -ForegroundColor Cyan
Select-String -Path "prisma\schema.prisma" -Pattern "@id @default\(uuid\(\)\)" | ForEach-Object {
    Write-Host "  - $($_.Line.Trim())" -ForegroundColor White
}
Write-Host ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Step 3: マイグレーションの作成と実行
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "Step 3/5: マイグレーションの作成と実行" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

Write-Host "🔄 マイグレーションを作成中..." -ForegroundColor Cyan
npx prisma migrate dev --name add_uuid_default_to_all_models

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ マイグレーションが完了しました" -ForegroundColor Green
} else {
    Write-Host "❌ マイグレーションに失敗しました" -ForegroundColor Red
    Write-Host ""
    Write-Host "⚠️  エラーが発生した可能性があります" -ForegroundColor Yellow
    Write-Host "   データベースをリセットしますか？ (既存データは全て削除されます)" -ForegroundColor Yellow
    $reset = Read-Host "リセットする (y/n)"
    
    if ($reset -eq "y") {
        Write-Host "🗑️  データベースをリセット中..." -ForegroundColor Cyan
        npx prisma migrate reset --force
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ データベースのリセットが完了しました" -ForegroundColor Green
        } else {
            Write-Host "❌ リセットに失敗しました" -ForegroundColor Red
            Write-Host "   バックアップから復元: Copy-Item $backupPath prisma\schema.prisma" -ForegroundColor Yellow
            Read-Host "Enterキーを押して終了"
            exit 1
        }
    } else {
        Write-Host "   バックアップから復元: Copy-Item $backupPath prisma\schema.prisma" -ForegroundColor Yellow
        Read-Host "Enterキーを押して終了"
        exit 1
    }
}
Write-Host ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Step 4: Prismaクライアント再生成
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "Step 4/5: Prismaクライアント再生成" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

npx prisma generate

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Prismaクライアントの再生成が完了しました" -ForegroundColor Green
} else {
    Write-Host "❌ Prismaクライアントの再生成に失敗しました" -ForegroundColor Red
    Read-Host "Enterキーを押して終了"
    exit 1
}
Write-Host ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Step 5: キャッシュクリーンアップ
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "Step 5/5: キャッシュクリーンアップ" -ForegroundColor Yellow
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
# 完了メッセージ
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "✨ ID フィールドの修正が完了しました！" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""
Write-Host "📝 実施内容:" -ForegroundColor Cyan
Write-Host "  ✅ 全モデルの id フィールドに @default(uuid()) を追加" -ForegroundColor White
Write-Host "  ✅ マイグレーションの実行完了" -ForegroundColor White
Write-Host "  ✅ Prismaクライアントの再生成完了" -ForegroundColor White
Write-Host ""
Write-Host "次のステップ:" -ForegroundColor Yellow
Write-Host "  1. npm run dev で開発サーバーを起動" -ForegroundColor White
Write-Host "  2. ユーザー登録を試す" -ForegroundColor White
Write-Host "  3. エラーが出ないことを確認" -ForegroundColor White
Write-Host ""
Write-Host "バックアップファイル: $backupPath" -ForegroundColor Cyan
Write-Host "問題が発生した場合は、このファイルから復元できます" -ForegroundColor Yellow
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
