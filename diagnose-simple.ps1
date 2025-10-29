# Prisma Diagnosis PowerShell Script
# UTF-8 encoding supported

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Prisma Problem Diagnosis" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "[1/7] Node.js Version Check" -ForegroundColor Yellow
node --version
npm --version
Write-Host ""

# Check Prisma
Write-Host "[2/7] Prisma Version Check" -ForegroundColor Yellow
npx prisma --version
Write-Host ""

# Validate Schema
Write-Host "[3/7] Schema Validation" -ForegroundColor Yellow
npx prisma validate
Write-Host ""

# Check generated files
Write-Host "[4/7] Check Generated Files" -ForegroundColor Yellow
$prismaClient = "node_modules\.prisma\client\index.js"
if (Test-Path $prismaClient) {
    Write-Host "OK: File exists - $prismaClient" -ForegroundColor Green
    $fileSize = (Get-Item $prismaClient).Length
    Write-Host "File size: $fileSize bytes"
    
    if ($fileSize -lt 10000) {
        Write-Host "WARNING: File size is too small (dummy file)" -ForegroundColor Red
    } else {
        Write-Host "OK: File size is normal" -ForegroundColor Green
    }
} else {
    Write-Host "ERROR: File not found - $prismaClient" -ForegroundColor Red
}
Write-Host ""

# Check .env.local
Write-Host "[5/7] Check DATABASE_URL" -ForegroundColor Yellow
if (Test-Path ".env.local") {
    Write-Host "OK: .env.local exists" -ForegroundColor Green
    Select-String -Path ".env.local" -Pattern "DATABASE_URL"
} else {
    Write-Host "ERROR: .env.local not found" -ForegroundColor Red
}
Write-Host ""

# Check workspaces
Write-Host "[6/7] Check workspaces" -ForegroundColor Yellow
$workspaces = Select-String -Path "package.json" -Pattern "workspaces"
if ($workspaces) {
    Write-Host "WARNING: workspaces is configured" -ForegroundColor Yellow
    Write-Host "This may be the root cause" -ForegroundColor Yellow
    Write-Host $workspaces
} else {
    Write-Host "OK: workspaces not configured" -ForegroundColor Green
}
Write-Host ""

# Check database connection
Write-Host "[7/7] Database Connection Test" -ForegroundColor Yellow
Write-Host "Testing database connection..."
$dbTest = npx prisma db pull --force 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "OK: Database connection successful" -ForegroundColor Green
} else {
    Write-Host "WARNING: Database connection may have issues" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Diagnosis Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "If problems found, run: .\fix-prisma-simple.ps1" -ForegroundColor Yellow
Write-Host ""

Read-Host "Press Enter to continue"
