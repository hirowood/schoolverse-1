@echo off
echo ========================================
echo Prisma エラー修正スクリプト
echo ========================================
echo.

echo このスクリプトは以下を実行します:
echo 1. Prismaクライアントの再生成
echo 2. .nextフォルダのクリーン
echo 3. 開発サーバーの起動
echo.

set /p confirm="続行しますか？ (y/n): "
if /i not "%confirm%"=="y" (
    echo キャンセルしました
    pause
    exit /b 0
)
echo.

echo [1/3] Prismaクライアント生成中...
call npx prisma generate
if %errorlevel% neq 0 (
    echo エラー: Prismaクライアント生成が失敗しました
    echo.
    echo 考えられる原因:
    echo - schema.prisma に構文エラーがある
    echo - prisma パッケージがインストールされていない
    echo.
    echo 解決策:
    echo 1. npm install を実行
    echo 2. schema.prisma を確認
    pause
    exit /b 1
)
echo ✓ Prismaクライアント生成完了
echo.

echo [2/3] .nextフォルダをクリーン中...
if exist .next (
    rmdir /s /q .next
    echo ✓ .nextフォルダを削除しました
) else (
    echo ℹ .nextフォルダは存在しません（スキップ）
)
echo.

echo [3/3] 開発サーバーを起動中...
echo.
echo ========================================
echo 修正完了！
echo ========================================
echo.
echo 開発サーバーを起動します...
echo ブラウザで http://localhost:3000 を開いてください
echo.
echo サーバーを停止するには Ctrl+C を押してください
echo.

call npm run dev
