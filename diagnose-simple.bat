@echo off
chcp 65001 > nul
echo ========================================
echo Prisma Problem Diagnosis
echo ========================================
echo.

echo [1/6] Node.js Version Check
node --version
npm --version
echo.

echo [2/6] Prisma Version Check
npx prisma --version
echo.

echo [3/6] Schema Validation
npx prisma validate
echo.

echo [4/6] Check Generated Files
if exist "node_modules\.prisma\client\index.js" (
    echo OK: File exists - node_modules\.prisma\client\index.js
    dir "node_modules\.prisma\client\index.js" | findstr "index.js"
) else (
    echo ERROR: File not found - node_modules\.prisma\client\index.js
)
echo.

echo [5/6] Check DATABASE_URL
if exist ".env.local" (
    echo OK: .env.local exists
    findstr "DATABASE_URL" .env.local
) else (
    echo ERROR: .env.local not found
)
echo.

echo [6/6] Check workspaces
findstr "workspaces" package.json
if %errorlevel% equ 0 (
    echo WARNING: workspaces is configured
    echo This may be the root cause
) else (
    echo OK: workspaces not configured
)
echo.

echo ========================================
echo Diagnosis Complete
echo ========================================
echo.
echo If problems found, run: fix-prisma-simple.bat
echo.
pause
