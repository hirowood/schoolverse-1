# ========================================
# Prisma エラー診断スクリプト
# 実行方法: .\診断.ps1
# ========================================

Write-Host "🔍 Prisma エラー診断を開始します..." -ForegroundColor Cyan
Write-Host ""

# Step 1: PostgreSQL の起動確認
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "Step 1: PostgreSQL 起動確認" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

$dockerRunning = docker ps --filter "name=schoolverse_db" --format "{{.Names}}" 2>$null
if ($dockerRunning -eq "schoolverse_db") {
    Write-Host "✅ PostgreSQL (Docker) が起動しています" -ForegroundColor Green
} else {
    Write-Host "❌ PostgreSQL (Docker) が起動していません" -ForegroundColor Red
    Write-Host "   → docker-compose up -d で起動してください" -ForegroundColor Yellow
}
Write-Host ""

# Step 2: データベース接続テスト
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "Step 2: データベース接続テスト" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

$env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/schoolverse?schema=public"
$dbTest = npx prisma db execute --stdin --schema prisma/schema.prisma <<< "SELECT 1;" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ データベース接続成功" -ForegroundColor Green
} else {
    Write-Host "❌ データベース接続失敗" -ForegroundColor Red
    Write-Host "   エラー詳細:" -ForegroundColor Yellow
    Write-Host $dbTest -ForegroundColor Red
}
Write-Host ""

# Step 3: マイグレーション状態の確認
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "Step 3: マイグレーション状態確認" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

npx prisma migrate status
Write-Host ""

# Step 4: Prismaクライアント生成状態の確認
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "Step 4: Prismaクライアント確認" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

$prismaClientPath = "node_modules\.prisma\client\index.js"
if (Test-Path $prismaClientPath) {
    $fileSize = (Get-Item $prismaClientPath).Length
    Write-Host "✅ Prismaクライアント: 生成済み ($fileSize bytes)" -ForegroundColor Green
    
    if ($fileSize -lt 10000) {
        Write-Host "⚠️  ファイルサイズが小さすぎます（ダミーファイルの可能性）" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Prismaクライアント: 未生成" -ForegroundColor Red
}
Write-Host ""

# Step 5: .env.local の確認
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "Step 5: 環境変数確認" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

if (Test-Path ".env.local") {
    Write-Host "✅ .env.local ファイルが存在します" -ForegroundColor Green
    $dbUrl = Select-String -Path ".env.local" -Pattern "DATABASE_URL" | Select-Object -First 1
    Write-Host "   設定値: $dbUrl" -ForegroundColor Cyan
} else {
    Write-Host "❌ .env.local ファイルが見つかりません" -ForegroundColor Red
}
Write-Host ""

# 診断結果サマリー
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📊 診断結果サマリー" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "次のステップ:" -ForegroundColor Yellow
Write-Host "1. 上記の ❌ マークの項目を修正してください" -ForegroundColor White
Write-Host "2. 修正後、.\修正.ps1 を実行してください" -ForegroundColor White
Write-Host ""

Read-Host "Enterキーを押して終了"
