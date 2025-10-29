@echo off
echo ========================================
echo Prisma 問題診断スクリプト
echo ========================================
echo.

echo [診断 1/7] Node.js バージョン確認
node --version
npm --version
echo.

echo [診断 2/7] Prisma バージョン確認
call npx prisma --version
echo.

echo [診断 3/7] schema.prisma の検証
call npx prisma validate
if %errorlevel% neq 0 (
    echo ❌ エラー: schema.prisma に問題があります
) else (
    echo ✅ schema.prisma は正常です
)
echo.

echo [診断 4/7] 生成されたファイルの確認
if exist "node_modules\.prisma\client\index.js" (
    echo ✅ ファイル存在: node_modules\.prisma\client\index.js
    
    REM ファイルサイズを確認
    for %%A in ("node_modules\.prisma\client\index.js") do (
        echo ファイルサイズ: %%~zA bytes
        if %%~zA lss 10000 (
            echo ❌ 警告: ファイルサイズが小さすぎます（ダミーファイルの可能性）
        ) else (
            echo ✅ ファイルサイズは正常です
        )
    )
) else (
    echo ❌ エラー: ファイルが存在しません
)
echo.

echo [診断 5/7] DATABASE_URL の確認
if exist ".env.local" (
    echo ✅ .env.local が存在します
    findstr "DATABASE_URL" .env.local
) else (
    echo ❌ エラー: .env.local が存在しません
)
echo.

echo [診断 6/7] package.json の workspaces 確認
findstr "workspaces" package.json
if %errorlevel% equ 0 (
    echo ⚠️ 警告: workspaces が設定されています
    echo これが問題の原因の可能性があります
) else (
    echo ✅ workspaces は設定されていません
)
echo.

echo [診断 7/7] データベース接続テスト
echo データベース接続をテストしています...
call npx prisma db pull --force 2>nul
if %errorlevel% equ 0 (
    echo ✅ データベース接続成功
) else (
    echo ⚠️ 警告: データベース接続に問題がある可能性があります
)
echo.

echo ========================================
echo 診断完了
echo ========================================
echo.
echo 問題が見つかった場合、fix-prisma-advanced.bat を実行してください
echo.
pause
