# Prisma Fix PowerShell Script
# UTF-8 encoding supported

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Prisma Simple Fix Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "This script will:" -ForegroundColor Yellow
Write-Host "1. Generate Prisma Client"
Write-Host "2. Clean .next folder"
Write-Host "3. Restart dev server"
Write-Host ""

$confirm = Read-Host "Continue? (y/n)"
if ($confirm -ne "y") {
    Write-Host "Cancelled" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit
}
Write-Host ""

# Step 1: Generate Prisma Client
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step 1: Generate Prisma Client" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Prisma generate failed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Possible causes:" -ForegroundColor Yellow
    Write-Host "- DATABASE_URL not set"
    Write-Host "- schema.prisma has errors"
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "OK: Prisma Client generated" -ForegroundColor Green
Write-Host ""

# Step 2: Clean .next folder
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step 2: Clean .next folder" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
if (Test-Path ".next") {
    Remove-Item -Path ".next" -Recurse -Force
    Write-Host "OK: .next folder deleted" -ForegroundColor Green
} else {
    Write-Host "INFO: .next folder does not exist" -ForegroundColor Yellow
}
Write-Host ""

# Step 3: Check generated file
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step 3: Check generated file" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
$prismaClient = "node_modules\.prisma\client\index.js"
if (Test-Path $prismaClient) {
    Write-Host "OK: Prisma Client file exists" -ForegroundColor Green
    $fileSize = (Get-Item $prismaClient).Length
    Write-Host "File size: $fileSize bytes"
    
    if ($fileSize -lt 10000) {
        Write-Host "WARNING: File size is too small" -ForegroundColor Red
        Write-Host "Prisma Client may not be properly generated" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
} else {
    Write-Host "ERROR: Prisma Client file not found" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host ""

# Success
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Fix Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Check DATABASE_URL in .env.local"
Write-Host "2. Make sure database is running"
Write-Host "3. Run: npm run dev"
Write-Host ""

$start = Read-Host "Start dev server? (y/n)"
if ($start -eq "y") {
    Write-Host ""
    Write-Host "Starting dev server..." -ForegroundColor Green
    Write-Host "Open browser: http://localhost:3000" -ForegroundColor Cyan
    Write-Host ""
    npm run dev
} else {
    Write-Host ""
    Write-Host "To start server: npm run dev" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
}
