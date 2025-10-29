@echo off
chcp 65001 > nul
echo =====================================
echo   Next.js 15 クリーンビルドスクリプト
echo =====================================
echo.

echo [ステップ 1/5] .next フォルダを削除中...
if exist .next (
    rmdir /s /q .next
    echo ✓ .next フォルダを削除しました
) else (
    echo ℹ .next フォルダは存在しません
)
echo.

echo [ステップ 2/5] node_modules フォルダを削除中...
if exist node_modules (
    rmdir /s /q node_modules
    echo ✓ node_modules フォルダを削除しました
) else (
    echo ℹ node_modules フォルダは存在しません
)
echo.

echo [ステップ 3/5] 依存関係をインストール中...
call npm install
if %errorlevel% neq 0 (
    echo ✗ インストールに失敗しました
    pause
    exit /b %errorlevel%
)
echo ✓ インストール完了
echo.

echo [ステップ 4/5] Prismaクライアントを生成中...
call npm run prisma:generate
if %errorlevel% neq 0 (
    echo ✗ Prisma生成に失敗しました
    pause
    exit /b %errorlevel%
)
echo ✓ Prisma生成完了
echo.

echo [ステップ 5/5] 開発サーバーを起動中...
echo.
echo =====================================
echo   クリーンビルド完了！
echo =====================================
echo.
call npm run dev