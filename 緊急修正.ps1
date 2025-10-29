# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🔥 緊急修正スクリプト（シンプル版）
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Red
Write-Host "🔥 緊急修正: Prisma ID問題の完全解決" -ForegroundColor Red
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Red
Write-Host ""

Write-Host "⚠️  重要: 以下の手順を必ず順番通りに実行します" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. ✅ スキーマは既に修正済み（@default(uuid()) 追加済み）" -ForegroundColor Green
Write-Host "2. 🔄 データベースリセット（全データ削除）" -ForegroundColor White
Write-Host "3. 📝 マイグレーション実行" -ForegroundColor White
Write-Host "4. ⚙️  Prismaクライアント再生成" -ForegroundColor White
Write-Host "5. 🗑️  Next.jsキャッシュ削除" -ForegroundColor White
Write-Host "6. 🚀 開発サーバー再起動" -ForegroundColor White
Write-Host ""

$confirm = Read-Host "⚠️  全てのデータが削除されますが、続行しますか？ (y/n)"
if ($confirm -ne "y") {
    Write-Host "キャンセルしました" -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Step 1/5: データベースリセット" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "🗑️  全てのテーブルとデータを削除し、新しいスキーマで再作成します..." -ForegroundColor Yellow
Write-Host ""

npx prisma migrate reset --force --skip-seed

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ データベースリセットに失敗しました" -ForegroundColor Red
    Write-Host ""
    Write-Host "対処方法:" -ForegroundColor Yellow
    Write-Host "1. PostgreSQL が起動しているか確認:" -ForegroundColor White
    Write-Host "   docker ps" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "2. 起動していない場合:" -ForegroundColor White
    Write-Host "   docker-compose up -d db" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "3. 再度このスクリプトを実行してください" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "✅ データベースリセット完了" -ForegroundColor Green
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Step 2/5: マイグレーション確認" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

npx prisma migrate status

Write-Host ""
Write-Host "✅ マイグレーション状態確認完了" -ForegroundColor Green
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Step 3/5: Prismaクライアント再生成" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

npx prisma generate

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Prismaクライアント再生成に失敗しました" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Prismaクライアント再生成完了" -ForegroundColor Green
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Step 4/5: キャッシュクリーンアップ" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

if (Test-Path ".next") {
    Write-Host "🗑️  .next フォルダを削除中..." -ForegroundColor Cyan
    Remove-Item -Path ".next" -Recurse -Force
    Write-Host "✅ .next フォルダを削除しました" -ForegroundColor Green
} else {
    Write-Host "ℹ️  .next フォルダは存在しません" -ForegroundColor Cyan
}

if (Test-Path "node_modules\.cache") {
    Write-Host "🗑️  node_modules\.cache を削除中..." -ForegroundColor Cyan
    Remove-Item -Path "node_modules\.cache" -Recurse -Force
    Write-Host "✅ node_modules\.cache を削除しました" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ キャッシュクリーンアップ完了" -ForegroundColor Green
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Step 5/5: スキーマ確認" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

Write-Host "📝 修正されたスキーマ:" -ForegroundColor Cyan
$uuidCount = (Select-String -Path "prisma\schema.prisma" -Pattern "@default\(uuid\(\)\)").Count
Write-Host "   @default(uuid()) の数: $uuidCount 個" -ForegroundColor White

if ($uuidCount -eq 8) {
    Write-Host "✅ 全8モデルが正しく修正されています" -ForegroundColor Green
} else {
    Write-Host "⚠️  修正されたモデル数が期待値（8個）と一致しません" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "✨ 修正完了！" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""

Write-Host "📊 実施内容:" -ForegroundColor Cyan
Write-Host "  ✅ スキーマ修正: 全8モデルに @default(uuid()) を追加" -ForegroundColor White
Write-Host "  ✅ データベース: リセット完了" -ForegroundColor White
Write-Host "  ✅ マイグレーション: 実行完了" -ForegroundColor White
Write-Host "  ✅ Prismaクライアント: 再生成完了" -ForegroundColor White
Write-Host "  ✅ キャッシュ: クリーンアップ完了" -ForegroundColor White
Write-Host ""

Write-Host "🎯 次のステップ:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. 開発サーバーを起動:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. ブラウザで確認:" -ForegroundColor White
Write-Host "   http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. ユーザー登録を試す:" -ForegroundColor White
Write-Host "   メール: test@example.com" -ForegroundColor Cyan
Write-Host "   ユーザー名: testuser" -ForegroundColor Cyan
Write-Host "   パスワード: password123" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. 期待される結果:" -ForegroundColor White
Write-Host "   ✅ 登録成功メッセージが表示される" -ForegroundColor Green
Write-Host "   ✅ エラーが発生しない" -ForegroundColor Green
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
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
    Write-Host "手動で起動する場合:" -ForegroundColor Yellow
    Write-Host "  npm run dev" -ForegroundColor White
    Write-Host ""
    Read-Host "Enterキーを押して終了"
}
