@echo off
echo ================================
echo React Dev Overlay Error Fix
echo ================================
echo.

echo [1/4] Stopping any running servers...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/4] Cleaning .next folder...
if exist .next (
    rmdir /s /q .next
    echo .next folder deleted
) else (
    echo .next folder not found
)

echo [3/4] Generating Prisma client...
call npm run prisma:generate

echo [4/4] Starting development server...
echo.
echo ================================
echo Starting Next.js...
echo ================================
echo.
call npm run dev

pause
