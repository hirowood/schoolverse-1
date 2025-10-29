# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🔬 超詳細診断スクリプト
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🔬 Prisma問題の超詳細診断" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 診断1: スキーマファイルの確認
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "診断1: schema.prisma の状態" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host ""

$uuidCount = (Select-String -Path "prisma\schema.prisma" -Pattern "@default\(uuid\(\)\)").Count
Write-Host "📊 @default(uuid()) の数: $uuidCount 個" -ForegroundColor Cyan

if ($uuidCount -eq 8) {
    Write-Host "✅ schema.prisma は正しく修正されています" -ForegroundColor Green
} else {
    Write-Host "❌ schema.prisma に問題があります（期待: 8個）" -ForegroundColor Red
}

Write-Host ""
Write-Host "📝 User モデルの id フィールド:" -ForegroundColor Cyan
Select-String -Path "prisma\schema.prisma" -Pattern "model User" -Context 0,15 | ForEach-Object {
    $_.Context.PostContext | Select-Object -First 1 | ForEach-Object {
        Write-Host "   $_" -ForegroundColor White
    }
}

Write-Host ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 診断2: データベース接続確認
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "診断2: データベース接続" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host ""

# DATABASE_URL を確認
Write-Host "📊 DATABASE_URL の確認:" -ForegroundColor Cyan
if (Test-Path ".env.local") {
    $dbUrl = Select-String -Path ".env.local" -Pattern "DATABASE_URL" | Select-Object -First 1
    Write-Host "   .env.local: $dbUrl" -ForegroundColor White
}
if (Test-Path ".env") {
    $dbUrl = Select-String -Path ".env" -Pattern "DATABASE_URL" | Select-Object -First 1
    Write-Host "   .env: $dbUrl" -ForegroundColor White
}

Write-Host ""

# PostgreSQL 起動確認
Write-Host "🐘 PostgreSQL 起動状態:" -ForegroundColor Cyan
$dockerRunning = docker ps --filter "name=schoolverse_db" --format "{{.Names}}" 2>$null
if ($dockerRunning -eq "schoolverse_db") {
    Write-Host "✅ PostgreSQL は起動しています" -ForegroundColor Green
    
    # 接続テスト
    Write-Host ""
    Write-Host "🔌 データベース接続テスト:" -ForegroundColor Cyan
    $testResult = docker exec schoolverse_db pg_isready -U postgres 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ データベース接続成功" -ForegroundColor Green
    } else {
        Write-Host "❌ データベース接続失敗" -ForegroundColor Red
    }
} else {
    Write-Host "❌ PostgreSQL が起動していません" -ForegroundColor Red
}

Write-Host ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 診断3: 実際のデータベーススキーマ確認（最重要）
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "診断3: PostgreSQL テーブル定義（最重要）" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host ""

Write-Host "🔍 User テーブルの定義を確認中..." -ForegroundColor Cyan
Write-Host ""

$tableSchema = docker exec schoolverse_db psql -U postgres -d schoolverse -c "\d+ \"User\"" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "📊 User テーブルの定義:" -ForegroundColor Cyan
    Write-Host $tableSchema -ForegroundColor White
    Write-Host ""
    
    # id フィールドに DEFAULT があるか確認
    if ($tableSchema -match "id.*uuid_generate") {
        Write-Host "✅ id フィールドに DEFAULT 句があります" -ForegroundColor Green
    } elseif ($tableSchema -match "id.*gen_random_uuid") {
        Write-Host "✅ id フィールドに DEFAULT 句があります (gen_random_uuid)" -ForegroundColor Green
    } else {
        Write-Host "❌ id フィールドに DEFAULT 句がありません" -ForegroundColor Red
        Write-Host "   → これが問題の原因です！" -ForegroundColor Red
    }
} else {
    Write-Host "❌ User テーブルが存在しないか、接続できません" -ForegroundColor Red
    Write-Host $tableSchema -ForegroundColor Red
}

Write-Host ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 診断4: マイグレーション履歴
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "診断4: マイグレーション履歴" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host ""

npx prisma migrate status

Write-Host ""

# マイグレーションファイル一覧
Write-Host "📁 マイグレーションファイル一覧:" -ForegroundColor Cyan
Get-ChildItem -Path "prisma\migrations" -Directory | ForEach-Object {
    Write-Host "   - $($_.Name)" -ForegroundColor White
}

Write-Host ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 診断5: Prismaクライアントの状態
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "診断5: Prismaクライアントの状態" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host ""

$prismaClientPath = "node_modules\.prisma\client"
if (Test-Path $prismaClientPath) {
    Write-Host "✅ Prismaクライアントは存在します" -ForegroundColor Green
    
    $indexJsPath = "$prismaClientPath\index.js"
    if (Test-Path $indexJsPath) {
        $fileInfo = Get-Item $indexJsPath
        Write-Host "   ファイルサイズ: $($fileInfo.Length) bytes" -ForegroundColor Cyan
        Write-Host "   最終更新: $($fileInfo.LastWriteTime)" -ForegroundColor Cyan
        
        if ($fileInfo.Length -lt 10000) {
            Write-Host "⚠️  ファイルサイズが小さすぎます（ダミーファイルの可能性）" -ForegroundColor Yellow
        }
    }
    
    # schema.prisma の更新時刻
    $schemaInfo = Get-Item "prisma\schema.prisma"
    Write-Host ""
    Write-Host "📅 schema.prisma の最終更新: $($schemaInfo.LastWriteTime)" -ForegroundColor Cyan
    
    # 比較
    if ($fileInfo.LastWriteTime -lt $schemaInfo.LastWriteTime) {
        Write-Host "⚠️  Prismaクライアントが古い可能性があります" -ForegroundColor Yellow
        Write-Host "   → npx prisma generate を実行してください" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Prismaクライアントが存在しません" -ForegroundColor Red
}

Write-Host ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 診断6: 最新マイグレーションファイルの内容確認
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "診断6: 最新マイグレーションの内容" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host ""

$latestMigration = Get-ChildItem -Path "prisma\migrations" -Directory | Sort-Object Name -Descending | Select-Object -First 1

if ($latestMigration) {
    Write-Host "📝 最新マイグレーション: $($latestMigration.Name)" -ForegroundColor Cyan
    Write-Host ""
    
    $sqlFile = Get-ChildItem -Path $latestMigration.FullName -Filter "migration.sql" | Select-Object -First 1
    if ($sqlFile) {
        Write-Host "📄 migration.sql の内容（User テーブル作成部分）:" -ForegroundColor Cyan
        $sqlContent = Get-Content $sqlFile.FullName -Raw
        
        # User テーブル作成部分を抽出
        if ($sqlContent -match 'CREATE TABLE.*"User".*?\);') {
            $userTableDef = $matches[0]
            Write-Host $userTableDef -ForegroundColor White
            Write-Host ""
            
            # DEFAULT 句があるか確認
            if ($userTableDef -match "DEFAULT") {
                Write-Host "✅ マイグレーションファイルに DEFAULT 句があります" -ForegroundColor Green
            } else {
                Write-Host "❌ マイグレーションファイルに DEFAULT 句がありません" -ForegroundColor Red
                Write-Host "   → マイグレーションファイルを再作成する必要があります" -ForegroundColor Red
            }
        }
    }
}

Write-Host ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 診断結果サマリー
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📊 診断結果サマリー" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

Write-Host "【診断項目】" -ForegroundColor Yellow
Write-Host "1. schema.prisma: $uuidCount/8 個の @default(uuid())" -ForegroundColor White
Write-Host "2. PostgreSQL: $(if ($dockerRunning -eq 'schoolverse_db') { '起動中' } else { '停止中' })" -ForegroundColor White
Write-Host "3. テーブル定義: 上記の診断3を参照" -ForegroundColor White
Write-Host "4. マイグレーション: 上記の診断4を参照" -ForegroundColor White
Write-Host "5. Prismaクライアント: 上記の診断5を参照" -ForegroundColor White
Write-Host ""

Write-Host "【推奨される対処法】" -ForegroundColor Yellow
Write-Host ""
Write-Host "診断3で「DEFAULT 句がない」と表示された場合:" -ForegroundColor Cyan
Write-Host "  → .\最終修正.ps1 を実行してください" -ForegroundColor White
Write-Host ""
Write-Host "診断4でマイグレーションが未適用の場合:" -ForegroundColor Cyan
Write-Host "  → npx prisma migrate deploy を実行してください" -ForegroundColor White
Write-Host ""
Write-Host "診断5でPrismaクライアントが古い場合:" -ForegroundColor Cyan
Write-Host "  → npx prisma generate を実行してください" -ForegroundColor White
Write-Host ""

Read-Host "Enterキーを押して終了"
