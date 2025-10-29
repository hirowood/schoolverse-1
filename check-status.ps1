# Quick Diagnostic Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Quick Status Check" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check Prisma Client file
Write-Host "[1] Prisma Client Status:" -ForegroundColor Yellow
$prismaClient = "node_modules\.prisma\client\index.js"
if (Test-Path $prismaClient) {
    $fileSize = (Get-Item $prismaClient).Length
    Write-Host "  File exists: YES" -ForegroundColor Green
    Write-Host "  File size: $fileSize bytes"
    
    if ($fileSize -lt 10000) {
        Write-Host "  Status: DUMMY FILE (NOT GENERATED)" -ForegroundColor Red
    } else {
        Write-Host "  Status: PROPERLY GENERATED" -ForegroundColor Green
    }
} else {
    Write-Host "  File exists: NO" -ForegroundColor Red
    Write-Host "  Status: NOT GENERATED" -ForegroundColor Red
}
Write-Host ""

# 2. Check .env.local
Write-Host "[2] Environment Variables:" -ForegroundColor Yellow
if (Test-Path ".env.local") {
    Write-Host "  .env.local exists: YES" -ForegroundColor Green
    $envContent = Get-Content ".env.local" -Raw
    if ($envContent -match "DATABASE_URL=(.+)") {
        Write-Host "  DATABASE_URL: SET" -ForegroundColor Green
        Write-Host "  Value: $($matches[1].Substring(0, [Math]::Min(50, $matches[1].Length)))..."
    } else {
        Write-Host "  DATABASE_URL: NOT SET" -ForegroundColor Red
    }
} else {
    Write-Host "  .env.local exists: NO" -ForegroundColor Red
}
Write-Host ""

# 3. Check database connection
Write-Host "[3] Database Connection Test:" -ForegroundColor Yellow
Write-Host "  Testing connection..." -ForegroundColor Gray
$dbTest = npx prisma db pull --force --schema=prisma/schema.prisma 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Connection: SUCCESS" -ForegroundColor Green
} else {
    Write-Host "  Connection: FAILED" -ForegroundColor Red
    Write-Host "  Error: Database may not be running" -ForegroundColor Yellow
}
Write-Host ""

# 4. Check if server is running
Write-Host "[4] Development Server:" -ForegroundColor Yellow
$serverProcess = Get-Process node -ErrorAction SilentlyContinue | Where-Object {$_.CommandLine -like "*next dev*"}
if ($serverProcess) {
    Write-Host "  Status: RUNNING (PID: $($serverProcess.Id))" -ForegroundColor Green
    Write-Host "  Action: You need to RESTART the server" -ForegroundColor Yellow
} else {
    Write-Host "  Status: NOT RUNNING" -ForegroundColor Yellow
}
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DIAGNOSIS SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$prismaOk = (Test-Path $prismaClient) -and ((Get-Item $prismaClient).Length -gt 10000)
$envOk = (Test-Path ".env.local") -and ((Get-Content ".env.local" -Raw) -match "DATABASE_URL=")

if ($prismaOk -and $envOk) {
    Write-Host "Status: READY TO START" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Stop any running dev server (Ctrl+C)"
    Write-Host "2. Run: npm run dev"
} elseif (-not $prismaOk) {
    Write-Host "Status: PRISMA CLIENT NOT GENERATED" -ForegroundColor Red
    Write-Host ""
    Write-Host "ACTION REQUIRED:" -ForegroundColor Yellow
    Write-Host "Run this command now:" -ForegroundColor White
    Write-Host "  npx prisma generate" -ForegroundColor Cyan
} elseif (-not $envOk) {
    Write-Host "Status: DATABASE_URL NOT CONFIGURED" -ForegroundColor Red
    Write-Host ""
    Write-Host "ACTION REQUIRED:" -ForegroundColor Yellow
    Write-Host "1. Check if .env.local exists"
    Write-Host "2. Set DATABASE_URL in .env.local"
}

Write-Host ""
Read-Host "Press Enter to exit"
