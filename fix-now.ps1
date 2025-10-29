# Manual Step-by-Step Fix
# This script guides you through each step

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Manual Fix - Step by Step" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This will fix the 500 error by regenerating Prisma Client" -ForegroundColor Yellow
Write-Host ""

# Check if server is running
$serverProcess = Get-Process node -ErrorAction SilentlyContinue
if ($serverProcess) {
    Write-Host "WARNING: Dev server appears to be running" -ForegroundColor Red
    Write-Host "Please STOP the server first (press Ctrl+C in the server window)" -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "Have you stopped the server? (y/n)"
    if ($continue -ne "y") {
        Write-Host "Please stop the server and run this script again" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "STEP 1: Delete .next folder" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
if (Test-Path ".next") {
    Write-Host "Deleting .next..." -ForegroundColor Yellow
    Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "OK: .next deleted" -ForegroundColor Green
} else {
    Write-Host "INFO: .next does not exist (OK)" -ForegroundColor Gray
}
Write-Host ""
Read-Host "Press Enter to continue to Step 2"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "STEP 2: Generate Prisma Client" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Running: npx prisma generate" -ForegroundColor Yellow
Write-Host ""

npx prisma generate

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "OK: Prisma Client generated successfully" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "ERROR: Prisma generation failed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Common causes:" -ForegroundColor Yellow
    Write-Host "1. DATABASE_URL not set in .env.local" -ForegroundColor White
    Write-Host "2. Database is not running" -ForegroundColor White
    Write-Host "3. schema.prisma has errors" -ForegroundColor White
    Write-Host ""
    
    # Check DATABASE_URL
    if (Test-Path ".env.local") {
        $envContent = Get-Content ".env.local" -Raw
        if ($envContent -match "DATABASE_URL") {
            Write-Host "DATABASE_URL is set in .env.local" -ForegroundColor Green
        } else {
            Write-Host "DATABASE_URL is NOT set in .env.local" -ForegroundColor Red
            Write-Host "Please add DATABASE_URL to .env.local" -ForegroundColor Yellow
        }
    } else {
        Write-Host ".env.local does NOT exist" -ForegroundColor Red
        Write-Host "Creating .env.local from .env.example..." -ForegroundColor Yellow
        if (Test-Path ".env.example") {
            Copy-Item ".env.example" ".env.local"
            Write-Host "Please edit .env.local and set DATABASE_URL" -ForegroundColor Yellow
        }
    }
    
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Read-Host "Press Enter to continue to Step 3"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "STEP 3: Verify Prisma Client" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$prismaClient = "node_modules\.prisma\client\index.js"
if (Test-Path $prismaClient) {
    $fileSize = (Get-Item $prismaClient).Length
    Write-Host "File exists: YES" -ForegroundColor Green
    Write-Host "File size: $fileSize bytes" -ForegroundColor Cyan
    
    if ($fileSize -gt 10000) {
        Write-Host "Status: PROPERLY GENERATED" -ForegroundColor Green
    } else {
        Write-Host "Status: STILL A DUMMY FILE" -ForegroundColor Red
        Write-Host ""
        Write-Host "This means Prisma generate succeeded but something is wrong" -ForegroundColor Yellow
        Write-Host "Possible issues:" -ForegroundColor Yellow
        Write-Host "1. Wrong Prisma version"
        Write-Host "2. Corrupted node_modules"
        Write-Host ""
        Write-Host "Recommended action: Delete node_modules and reinstall" -ForegroundColor Yellow
        Read-Host "Press Enter to exit"
        exit 1
    }
} else {
    Write-Host "ERROR: File not found" -ForegroundColor Red
    Write-Host "Prisma Client was not generated properly" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Read-Host "Press Enter to continue to Step 4"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "STEP 4: Start Development Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "All checks passed!" -ForegroundColor Green
Write-Host ""
Write-Host "Starting dev server..." -ForegroundColor Yellow
Write-Host "The server will start in a moment..." -ForegroundColor Gray
Write-Host ""
Write-Host "To test if it works, open:" -ForegroundColor Cyan
Write-Host "  http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "The /api/auth/me endpoint should return 401 (not 500)" -ForegroundColor Cyan
Write-Host ""

Start-Sleep -Seconds 2

npm run dev
