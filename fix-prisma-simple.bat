@echo off
chcp 65001 > nul
echo ========================================
echo Prisma Simple Fix Script
echo ========================================
echo.

echo This script will:
echo 1. Generate Prisma Client
echo 2. Clean .next folder
echo 3. Restart dev server
echo.

set /p confirm="Continue? (y/n): "
if /i not "%confirm%"=="y" (
    echo Cancelled
    pause
    exit /b 0
)
echo.

echo ========================================
echo Step 1: Generate Prisma Client
echo ========================================
call npx prisma generate
if %errorlevel% neq 0 (
    echo ERROR: Prisma generate failed
    echo.
    echo Possible causes:
    echo - DATABASE_URL not set
    echo - schema.prisma has errors
    pause
    exit /b 1
)
echo OK: Prisma Client generated
echo.

echo ========================================
echo Step 2: Clean .next folder
echo ========================================
if exist ".next" (
    rmdir /s /q .next
    echo OK: .next folder deleted
) else (
    echo INFO: .next folder does not exist
)
echo.

echo ========================================
echo Step 3: Check generated file
echo ========================================
if exist "node_modules\.prisma\client\index.js" (
    echo OK: Prisma Client file exists
    dir "node_modules\.prisma\client\index.js" | findstr "index.js"
) else (
    echo ERROR: Prisma Client file not found
    pause
    exit /b 1
)
echo.

echo ========================================
echo Fix Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Check DATABASE_URL in .env.local
echo 2. Make sure database is running
echo 3. Run: npm run dev
echo.

set /p start="Start dev server? (y/n): "
if /i "%start%"=="y" (
    echo.
    echo Starting dev server...
    echo Open browser: http://localhost:3000
    echo.
    call npm run dev
) else (
    echo.
    echo To start server: npm run dev
    pause
)
