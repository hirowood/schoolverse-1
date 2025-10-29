@echo off
echo ========================================
echo Schoolverse プロジェクトセットアップ
echo ========================================
echo.

REM 管理者権限チェックは省略（オプション）

echo [1/5] Node.js バージョン確認...
node --version
if %errorlevel% neq 0 (
    echo エラー: Node.js がインストールされていません
    echo https://nodejs.org/ からインストールしてください
    pause
    exit /b 1
)
echo.

echo [2/5] 依存関係のインストール...
call npm install
if %errorlevel% neq 0 (
    echo エラー: npm install が失敗しました
    pause
    exit /b 1
)
echo.

echo [3/5] Prismaクライアント生成...
call npm run prisma:generate
if %errorlevel% neq 0 (
    echo エラー: Prismaクライアント生成が失敗しました
    pause
    exit /b 1
)
echo.

echo [4/5] .env.local ファイル確認...
if not exist .env.local (
    echo .env.local が見つかりません
    echo .env.example からコピーしています...
    copy .env.example .env.local
    echo.
    echo 重要: .env.local を編集してDATABASE_URLを設定してください
    echo.
    pause
)
echo.

echo [5/5] データベースマイグレーション実行...
echo.
set /p confirm="データベースマイグレーションを実行しますか？ (y/n): "
if /i "%confirm%"=="y" (
    call npm run prisma:migrate
    if %errorlevel% neq 0 (
        echo 警告: マイグレーションが失敗しました
        echo データベース接続を確認してください
    )
)
echo.

echo ========================================
echo セットアップ完了！
echo ========================================
echo.
echo 開発サーバーを起動するには:
echo   npm run dev
echo.
echo Prisma Studioを起動するには:
echo   npm run prisma:studio
echo.
pause
