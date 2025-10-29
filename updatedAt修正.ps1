# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🔥 updatedAt 修正スクリプト
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🔥 updatedAt フィールドの修正" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ スキーマ修正完了:" -ForegroundColor Green
Write-Host "   - User.updatedAt に @updatedAt を追加" -ForegroundColor White
Write-Host "   - Session.updatedAt に @updatedAt を追加" -ForegroundColor White
Write-Host "   - Notebook.updatedAt に @updatedAt を追加" -ForegroundColor White
Write-Host "   - NotebookPage.updatedAt に @updatedAt を追加" -ForegroundColor White
Write-Host ""

Write-Host "次のステップ:" -ForegroundColor Yellow
Write-Host "  1. マイグレーション作成" -ForegroundColor White
Write-Host "  2. マイグレーション適用" -ForegroundColor White
Write-Host "  3. Prismaクライアント再生成" -ForegroundColor White
Write-Host "  4. キャッシュクリア" -ForegroundColor White
Write-Host ""

$confirm = Read-Host "続行しますか？ (y/n)"
if ($confirm -ne "y") {
    Write-Host "キャンセルしました" -ForegroundColor Red
    exit 0
}

Write-Host ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Step 1: マイグレーション作成
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "Step 1/4: マイグレーション作成" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host ""

Write-Host "📝 マイグレーションを作成中..." -ForegroundColor Cyan
npx prisma migrate dev --name add_updated_at_directive

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ マイグレーション作成に失敗しました" -ForegroundColor Red
    Write-Host ""
    Write-Host "対処方法:" -ForegroundColor Yellow
    Write-Host "1. データベースをリセット:" -ForegroundColor White
    Write-Host "   npx prisma migrate reset --force" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "2. 再度このスクリプトを実行" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "✅ マイグレーション作成完了" -ForegroundColor Green
Write-Host ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Step 2: Prismaクライアント再生成
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "Step 2/4: Prismaクライアント再生成" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host ""

Write-Host "⚙️  Prismaクライアントを再生成中..." -ForegroundColor Cyan
npx prisma generate

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Prismaクライアント再生成完了" -ForegroundColor Green
} else {
    Write-Host "❌ Prismaクライアント再生成に失敗しました" -ForegroundColor Red
    exit 1
}

Write-Host ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Step 3: キャッシュクリア
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "Step 3/4: キャッシュクリア" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host ""

Write-Host "🗑️  キャッシュをクリア中..." -ForegroundColor Cyan

if (Test-Path ".next") {
    Remove-Item -Path ".next" -Recurse -Force
    Write-Host "✅ .next フォルダを削除しました" -ForegroundColor Green
}

if (Test-Path "node_modules\.cache") {
    Remove-Item -Path "node_modules\.cache" -Recurse -Force
    Write-Host "✅ node_modules\.cache を削除しました" -ForegroundColor Green
}

Write-Host ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Step 4: 検証
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "Step 4/4: 検証" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host ""

Write-Host "🔍 スキーマ確認:" -ForegroundColor Cyan
$updatedAtCount = (Select-String -Path "prisma\schema.prisma" -Pattern "@updatedAt").Count
Write-Host "   @updatedAt の数: $updatedAtCount 個" -ForegroundColor White

if ($updatedAtCount -eq 4) {
    Write-Host "✅ 全4つの updatedAt フィールドが正しく設定されています" -ForegroundColor Green
} else {
    Write-Host "⚠️  updatedAt フィールドの数が期待値（4個）と一致しません" -ForegroundColor Yellow
}

Write-Host ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 完了
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "✨ 修正完了！" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""

Write-Host "📊 実施内容:" -ForegroundColor Cyan
Write-Host "  ✅ スキーマ修正: 4つの updatedAt に @updatedAt を追加" -ForegroundColor White
Write-Host "  ✅ マイグレーション: 実行完了" -ForegroundColor White
Write-Host "  ✅ Prismaクライアント: 再生成完了" -ForegroundColor White
Write-Host "  ✅ キャッシュ: クリーンアップ完了" -ForegroundColor White
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
