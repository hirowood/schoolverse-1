@echo off
setlocal enabledelayedexpansion
echo ========================================
echo Prisma 包括的修正スクリプト
echo ========================================
echo.

echo このスクリプトは以下を実行します:
echo 1. workspaces 設定を一時的に無効化
echo 2. node_modules と .next を完全削除
echo 3. package-lock.json をバックアップして削除
echo 4. npm install を再実行
echo 5. prisma generate を強制実行
echo 6. 開発サーバーを起動
echo.

set /p confirm="続行しますか？ (y/n): "
if /i not "%confirm%"=="y" (
    echo キャンセルしました
    pause
    exit /b 0
)
echo.

echo ========================================
echo ステップ 1: バックアップ作成
echo ========================================
if exist "package.json" (
    copy /y package.json package.json.backup
    echo ✅ package.json をバックアップしました
)
if exist "package-lock.json" (
    copy /y package-lock.json package-lock.json.backup
    echo ✅ package-lock.json をバックアップしました
)
echo.

echo ========================================
echo ステップ 2: 開発サーバー停止確認
echo ========================================
echo 注意: 開発サーバーが起動している場合は Ctrl+C で停止してください
timeout /t 3
echo.

echo ========================================
echo ステップ 3: クリーンアップ
echo ========================================
echo .next フォルダを削除中...
if exist ".next" (
    rmdir /s /q .next
    echo ✅ .next フォルダを削除しました
)

echo node_modules フォルダを削除中...
if exist "node_modules" (
    echo これには時間がかかる場合があります...
    rmdir /s /q node_modules
    echo ✅ node_modules フォルダを削除しました
) else (
    echo ℹ️ node_modules フォルダは存在しません
)

echo package-lock.json を削除中...
if exist "package-lock.json" (
    del /f /q package-lock.json
    echo ✅ package-lock.json を削除しました
)
echo.

echo ========================================
echo ステップ 4: workspaces を一時的に無効化
echo ========================================
REM package.json から workspaces 行を削除（一時的）
powershell -Command "(Get-Content package.json) | Where-Object { $_ -notmatch '\"workspaces\"' -and $_ -notmatch 'apps/backend' } | Set-Content package.json.temp"
move /y package.json.temp package.json
echo ✅ workspaces を無効化しました
echo.

echo ========================================
echo ステップ 5: npm install 再実行
echo ========================================
echo これには数分かかる場合があります...
call npm install
if %errorlevel% neq 0 (
    echo ❌ エラー: npm install が失敗しました
    echo.
    echo バックアップから復元するには restore-backup.bat を実行してください
    pause
    exit /b 1
)
echo ✅ npm install が完了しました
echo.

echo ========================================
echo ステップ 6: Prisma Client 強制生成
echo ========================================
call npx prisma generate --force
if %errorlevel% neq 0 (
    echo ❌ エラー: Prisma Client 生成が失敗しました
    echo.
    echo 考えられる原因:
    echo - DATABASE_URL が設定されていない
    echo - schema.prisma に構文エラーがある
    echo.
    pause
    exit /b 1
)
echo ✅ Prisma Client が生成されました
echo.

echo ========================================
echo ステップ 7: 生成確認
echo ========================================
if exist "node_modules\.prisma\client\index.js" (
    for %%A in ("node_modules\.prisma\client\index.js") do (
        echo ファイルサイズ: %%~zA bytes
        if %%~zA lss 10000 (
            echo ❌ 警告: ファイルサイズが小さすぎます
            echo Prisma Client が正しく生成されていない可能性があります
            pause
            exit /b 1
        ) else (
            echo ✅ Prisma Client は正常に生成されました
        )
    )
) else (
    echo ❌ エラー: Prisma Client ファイルが見つかりません
    pause
    exit /b 1
)
echo.

echo ========================================
echo ステップ 8: .env.local 確認
echo ========================================
if not exist ".env.local" (
    echo ⚠️ 警告: .env.local が存在しません
    if exist ".env.example" (
        copy .env.example .env.local
        echo .env.example から .env.local を作成しました
        echo.
        echo 重要: .env.local を編集してDATABASE_URLを設定してください
        echo.
        pause
    )
)
echo.

echo ========================================
echo 修正完了！
echo ========================================
echo.
echo 次のステップ:
echo 1. .env.local の DATABASE_URL を確認
echo 2. データベースが起動しているか確認
echo 3. npm run dev で開発サーバーを起動
echo.
echo 注意: workspaces 設定を無効化しました
echo 元に戻す場合は package.json.backup から復元してください
echo.

set /p start="開発サーバーを起動しますか？ (y/n): "
if /i "%start%"=="y" (
    echo.
    echo 開発サーバーを起動しています...
    echo ブラウザで http://localhost:3000 を開いてください
    echo.
    call npm run dev
) else (
    echo.
    echo 開発サーバーを起動するには: npm run dev
    pause
)
