@echo off
echo ========================================
echo バックアップ復元スクリプト
echo ========================================
echo.

echo このスクリプトは package.json を元に戻します
echo.

set /p confirm="バックアップから復元しますか？ (y/n): "
if /i not "%confirm%"=="y" (
    echo キャンセルしました
    pause
    exit /b 0
)

if exist "package.json.backup" (
    copy /y package.json.backup package.json
    echo ✅ package.json を復元しました
) else (
    echo ❌ エラー: package.json.backup が見つかりません
    pause
    exit /b 1
)

if exist "package-lock.json.backup" (
    copy /y package-lock.json.backup package-lock.json
    echo ✅ package-lock.json を復元しました
)

echo.
echo ========================================
echo 復元完了
echo ========================================
pause
