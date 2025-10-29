# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🔥 最終修正スクリプト（診断結果に基づく）
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Red
Write-Host "🔥 最終修正: データベーススキーマの完全再構築" -ForegroundColor Red
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Red
Write-Host ""

Write-Host "このスクリプトは以下を実行します:" -ForegroundColor Yellow
Write-Host "  1. 全マイグレーションファイルを削除" -ForegroundColor White
Write-Host "  2. データベースを完全リセット" -ForegroundColor White
Write-Host "  3. 新しいマイグレーションを作成" -ForegroundColor White
Write-Host "  4. マイグレーションを適用" -ForegroundColor White
Write-Host "  5. Prismaクライアント再生成" -ForegroundColor White
Write-Host "  6. 全キャッシュクリア" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  全てのデータが削除されます！" -ForegroundColor Red
Write-Host ""

$confirm = Read-Host "続行しますか？ (yes と入力)"
if ($confirm -ne "yes") {
    Write-Host "キャンセルしました" -ForegroundColor Red
    exit 0
}

Write-Host ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Step 1: 古いマイグレーションファイルを削除
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "Step 1/8: 古いマイグレーション削除" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host ""

$migrations = Get-ChildItem -Path "prisma\migrations" -Directory
if ($migrations.Count -gt 0) {
    Write-Host "🗑️  古いマイグレーションを削除中..." -ForegroundColor Cyan
    foreach ($migration in $migrations) {
        Write-Host "   削除: $($migration.Name)" -ForegroundColor White
        Remove-Item -Path $migration.FullName -Recurse -Force
    }
    Write-Host "✅ 古いマイグレーション削除完了" -ForegroundColor Green
} else {
    Write-Host "ℹ️  削除するマイグレーションはありません" -ForegroundColor Cyan
}

Write-Host ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Step 2: データベースを手動でDROP
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "Step 2/8: データベース削除と再作成" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host ""

Write-Host "🗑️  既存のデータベースを削除中..." -ForegroundColor Cyan
docker exec schoolverse_db psql -U postgres -c "DROP DATABASE IF EXISTS schoolverse;" 2>&1 | Out-Null

Write-Host "📦 新しいデータベースを作成中..." -ForegroundColor Cyan
docker exec schoolverse_db psql -U postgres -c "CREATE DATABASE schoolverse;" 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ データベース再作成完了" -ForegroundColor Green
} else {
    Write-Host "❌ データベース再作成に失敗しました" -ForegroundColor Red
    exit 1
}

Write-Host ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Step 3: uuid-ossp 拡張機能を有効化
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "Step 3/8: UUID拡張機能の有効化" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host ""

Write-Host "⚙️  uuid-ossp 拡張機能を有効化中..." -ForegroundColor Cyan
docker exec schoolverse_db psql -U postgres -d schoolverse -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";" 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ UUID拡張機能を有効化しました" -ForegroundColor Green
} else {
    Write-Host "⚠️  UUID拡張機能の有効化に失敗しました（継続します）" -ForegroundColor Yellow
}

Write-Host ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Step 4: スキーマの最終確認
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "Step 4/8: スキーマの最終確認" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host ""

$uuidCount = (Select-String -Path "prisma\schema.prisma" -Pattern "@default\(uuid\(\)\)").Count
Write-Host "📊 @default(uuid()) の数: $uuidCount/8" -ForegroundColor Cyan

if ($uuidCount -eq 8) {
    Write-Host "✅ スキーマは正しく修正されています" -ForegroundColor Green
} else {
    Write-Host "❌ スキーマに問題があります" -ForegroundColor Red
    Write-Host "   schema.prisma を確認してください" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Step 5: 新しいマイグレーションを作成
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "Step 5/8: 新しいマイグレーション作成" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host ""

Write-Host "📝 初期マイグレーションを作成中..." -ForegroundColor Cyan
npx prisma migrate dev --name init_with_uuid_defaults --create-only

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ マイグレーション作成に失敗しました" -ForegroundColor Red
    exit 1
}

Write-Host "✅ マイグレーション作成完了" -ForegroundColor Green
Write-Host ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Step 6: マイグレーションファイルの確認と修正
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "Step 6/8: マイグレーションファイル確認" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host ""

$latestMigration = Get-ChildItem -Path "prisma\migrations" -Directory | Sort-Object Name -Descending | Select-Object -First 1

if ($latestMigration) {
    Write-Host "📝 作成されたマイグレーション: $($latestMigration.Name)" -ForegroundColor Cyan
    
    $sqlFile = "$($latestMigration.FullName)\migration.sql"
    if (Test-Path $sqlFile) {
        $sqlContent = Get-Content $sqlFile -Raw
        
        # gen_random_uuid() を uuid_generate_v4() に置換
        $modifiedSql = $sqlContent -replace 'gen_random_uuid\(\)', 'uuid_generate_v4()'
        
        # 変更があった場合のみ書き込み
        if ($modifiedSql -ne $sqlContent) {
            [System.IO.File]::WriteAllText($sqlFile, $modifiedSql, [System.Text.UTF8Encoding]::new($false))
            Write-Host "✅ マイグレーションファイルを修正しました（uuid_generate_v4を使用）" -ForegroundColor Green
        } else {
            Write-Host "ℹ️  マイグレーションファイルは既に正しい形式です" -ForegroundColor Cyan
        }
        
        # DEFAULT 句の確認
        if ($modifiedSql -match "DEFAULT.*uuid") {
            Write-Host "✅ DEFAULT 句が含まれています" -ForegroundColor Green
        } else {
            Write-Host "⚠️  DEFAULT 句が見つかりません" -ForegroundColor Yellow
        }
    }
}

Write-Host ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Step 7: マイグレーションを適用
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "Step 7/8: マイグレーション適用" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host ""

Write-Host "🔄 マイグレーションを適用中..." -ForegroundColor Cyan
npx prisma migrate deploy

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ マイグレーション適用完了" -ForegroundColor Green
} else {
    Write-Host "❌ マイグレーション適用に失敗しました" -ForegroundColor Red
    exit 1
}

Write-Host ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Step 8: 検証
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "Step 8/8: 検証" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host ""

Write-Host "🔍 User テーブルの定義を確認中..." -ForegroundColor Cyan
Write-Host ""
docker exec schoolverse_db psql -U postgres -d schoolverse -c "\d+ \"User\"" 2>&1

Write-Host ""

# Prismaクライアント再生成
Write-Host "⚙️  Prismaクライアント再生成中..." -ForegroundColor Cyan
npx prisma generate

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Prismaクライアント再生成完了" -ForegroundColor Green
} else {
    Write-Host "❌ Prismaクライアント再生成に失敗しました" -ForegroundColor Red
    exit 1
}

Write-Host ""

# キャッシュクリア
Write-Host "🗑️  キャッシュをクリア中..." -ForegroundColor Cyan
if (Test-Path ".next") {
    Remove-Item -Path ".next" -Recurse -Force
}
if (Test-Path "node_modules\.cache") {
    Remove-Item -Path "node_modules\.cache" -Recurse -Force
}
Write-Host "✅ キャッシュクリア完了" -ForegroundColor Green

Write-Host ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 完了
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "✨ 完全修正が完了しました！" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""

Write-Host "🎯 次のステップ:" -ForegroundColor Yellow
Write-Host "  1. 開発サーバーを起動: npm run dev" -ForegroundColor White
Write-Host "  2. ブラウザで確認: http://localhost:3000" -ForegroundColor White
Write-Host "  3. ユーザー登録を試す" -ForegroundColor White
Write-Host ""
Write-Host "期待される結果:" -ForegroundColor Yellow
Write-Host "  ✅ POST /api/auth/register 200 OK" -ForegroundColor Green
Write-Host "  ✅ ユーザー登録成功" -ForegroundColor Green
Write-Host ""

$startDev = Read-Host "今すぐ開発サーバーを起動しますか？ (y/n)"
if ($startDev -eq "y") {
    Write-Host ""
    Write-Host "🚀 開発サーバーを起動しています..." -ForegroundColor Green
    Write-Host "   停止するには Ctrl+C を押してください" -ForegroundColor Yellow
    Write-Host ""
    npm run dev
} else {
    Write-Host ""
    Write-Host "手動で起動: npm run dev" -ForegroundColor White
    Write-Host ""
    Read-Host "Enterキーを押して終了"
}
