@echo off
chcp 65001 > nul
echo =====================================
echo   Schoolverse 開発環境起動スクリプト
echo =====================================
echo.

echo [ステップ 1/4] Dockerの状態を確認中...
docker info > nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ Docker Desktopが起動していません
    echo.
    echo Docker Desktopを起動してから、このスクリプトを再実行してください。
    pause
    exit /b 1
)
echo ✓ Docker Desktop は起動しています
echo.

echo [ステップ 2/4] PostgreSQLとRedisを起動中...
docker compose up -d db redis
if %errorlevel% neq 0 (
    echo ✗ データベースの起動に失敗しました
    pause
    exit /b %errorlevel%
)
echo ✓ データベース起動完了
echo.

echo [ステップ 3/4] データベースの準備を待機中...
timeout /t 5 /nobreak > nul
echo ✓ 準備完了
echo.

echo [ステップ 4/4] 開発サーバーを起動中...
echo.
echo =====================================
echo   起動完了！
echo =====================================
echo.
echo ブラウザで http://localhost:3000 にアクセスしてください
echo.
echo 終了するには Ctrl+C を押してください
echo.

call npm run dev
