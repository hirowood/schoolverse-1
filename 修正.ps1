# ========================================
# Prisma エラー修正スクリプト（完全版）
# 実行方法: .\修正.ps1
# ========================================

Write-Host "🔧 Prisma エラー修正を開始します..." -ForegroundColor Cyan
Write-Host ""
Write-Host "このスクリプトは以下を実行します:" -ForegroundColor Yellow
Write-Host "  1. PostgreSQL の起動（Docker）" -ForegroundColor White
Write-Host "  2. データベースの作成確認" -ForegroundColor White
Write-Host "  3. Prismaクライアントの再生成" -ForegroundColor White
Write-Host "  4. マイグレーションの実行" -ForegroundColor White
Write-Host "  5. .next フォルダのクリーンアップ" -ForegroundColor White
Write-Host ""

$confirm = Read-Host "続行しますか？ (y/n)"
if ($confirm -ne "y") {
    Write-Host "キャンセルしました" -ForegroundColor Red
    exit
}
Write-Host ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Step 1: PostgreSQL の起動
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "Step 1/5: PostgreSQL 起動" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

$dockerRunning = docker ps --filter "name=schoolverse_db" --format "{{.Names}}" 2>$null
if ($dockerRunning -eq "schoolverse_db") {
    Write-Host "✅ PostgreSQL は既に起動しています" -ForegroundColor Green
} else {
    Write-Host "📦 PostgreSQL を起動中..." -ForegroundColor Cyan
    docker-compose up -d db
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ PostgreSQL の起動に成功しました" -ForegroundColor Green
        Write-Host "⏳ データベースの準備を待機中（10秒）..." -ForegroundColor Cyan
        Start-Sleep -Seconds 10
    } else {
        Write-Host "❌ PostgreSQL の起動に失敗しました" -ForegroundColor Red
        Write-Host "   手動で docker-compose up -d db を実行してください" -ForegroundColor Yellow
        Read-Host "Enterキーを押して終了"
        exit 1
    }
}
Write-Host ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Step 2: データベース接続確認
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "Step 2/5: データベース接続確認" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

# データベース接続テスト（最大3回リトライ）
$maxRetries = 3
$retryCount = 0
$connected = $false

while ($retryCount -lt $maxRetries -and -not $connected) {
    Write-Host "🔌 接続テスト中... (試行 $($retryCount + 1)/$maxRetries)" -ForegroundColor Cyan
    
    $testResult = docker exec schoolverse_db pg_isready -U postgres 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ データベース接続成功" -ForegroundColor Green
        $connected = $true
    } else {
        $retryCount++
        if ($retryCount -lt $maxRetries) {
            Write-Host "⏳ 再試行まで待機中（5秒）..." -ForegroundColor Yellow
            Start-Sleep -Seconds 5
        }
    }
}

if (-not $connected) {
    Write-Host "❌ データベースへの接続に失敗しました" -ForegroundColor Red
    Write-Host "   PostgreSQLが正しく起動していない可能性があります" -ForegroundColor Yellow
    Write-Host "   docker logs schoolverse_db でログを確認してください" -ForegroundColor Yellow
    Read-Host "Enterキーを押して終了"
    exit 1
}
Write-Host ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Step 3: Prismaクライアント再生成
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "Step 3/5: Prismaクライアント再生成" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

npx prisma generate
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Prismaクライアントの生成に成功しました" -ForegroundColor Green
} else {
    Write-Host "❌ Prismaクライアントの生成に失敗しました" -ForegroundColor Red
    Write-Host "   schema.prisma にエラーがある可能性があります" -ForegroundColor Yellow
    Read-Host "Enterキーを押して終了"
    exit 1
}
Write-Host ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Step 4: マイグレーション実行
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "Step 4/5: マイグレーション実行" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

Write-Host "🔄 マイグレーション状態を確認中..." -ForegroundColor Cyan
npx prisma migrate status

Write-Host ""
Write-Host "📝 マイグレーションを実行します..." -ForegroundColor Cyan
npx prisma migrate dev --name fix_migration

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ マイグレーションが完了しました" -ForegroundColor Green
} else {
    Write-Host "⚠️  マイグレーションでエラーが発生しました" -ForegroundColor Yellow
    Write-Host "   deploy モードで再試行します..." -ForegroundColor Cyan
    
    npx prisma migrate deploy
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ マイグレーション（deploy）が完了しました" -ForegroundColor Green
    } else {
        Write-Host "❌ マイグレーションに失敗しました" -ForegroundColor Red
        Write-Host "   手動でマイグレーションを確認してください:" -ForegroundColor Yellow
        Write-Host "   npx prisma migrate status" -ForegroundColor White
        Read-Host "Enterキーを押して終了"
        exit 1
    }
}
Write-Host ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Step 5: .next フォルダのクリーンアップ
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
Write-Host "✨ 修正が完了しました！" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""
Write-Host "次のステップ:" -ForegroundColor Yellow
Write-Host "  1. npm run dev で開発サーバーを起動" -ForegroundColor White
Write-Host "  2. http://localhost:3000 にアクセス" -ForegroundColor White
Write-Host "  3. /api/auth/me にアクセスして500エラーが解消されているか確認" -ForegroundColor White
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
