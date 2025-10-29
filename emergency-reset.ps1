# Emergency Full Reset
# Use this if simple fixes don't work

Write-Host "========================================" -ForegroundColor Red
Write-Host "EMERGENCY FULL RESET" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host ""
Write-Host "WARNING: This will delete and reinstall everything" -ForegroundColor Yellow
Write-Host "This may take 5-10 minutes" -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "Are you sure? Type 'YES' to continue"
if ($confirm -ne "YES") {
    Write-Host "Cancelled" -ForegroundColor Gray
    Read-Host "Press Enter to exit"
    exit
}

Write-Host ""
Write-Host "Starting full reset..." -ForegroundColor Red
Write-Host ""

# Stop any running servers
$processes = Get-Process node -ErrorAction SilentlyContinue
if ($processes) {
    Write-Host "Stopping Node processes..." -ForegroundColor Yellow
    $processes | Stop-Process -Force
    Start-Sleep -Seconds 2
}

# Step 1: Delete .next
Write-Host "[1/6] Deleting .next..." -ForegroundColor Cyan
if (Test-Path ".next") {
    Remove-Item -Path ".next" -Recurse -Force
}
Write-Host "OK" -ForegroundColor Green

# Step 2: Delete node_modules
Write-Host "[2/6] Deleting node_modules (this takes a while)..." -ForegroundColor Cyan
if (Test-Path "node_modules") {
    Remove-Item -Path "node_modules" -Recurse -Force
}
Write-Host "OK" -ForegroundColor Green

# Step 3: Delete package-lock.json
Write-Host "[3/6] Deleting package-lock.json..." -ForegroundColor Cyan
if (Test-Path "package-lock.json") {
    Remove-Item "package-lock.json" -Force
}
Write-Host "OK" -ForegroundColor Green

# Step 4: npm install
Write-Host "[4/6] Running npm install (this takes several minutes)..." -ForegroundColor Cyan
Write-Host "Please wait..." -ForegroundColor Yellow
Write-Host ""

npm install --legacy-peer-deps

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERROR: npm install failed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Possible causes:" -ForegroundColor Yellow
    Write-Host "1. Network connection issues"
    Write-Host "2. npm registry issues"
    Write-Host "3. Disk space issues"
    Write-Host ""
    Write-Host "Try running this manually:" -ForegroundColor Cyan
    Write-Host "  npm install --legacy-peer-deps --verbose" -ForegroundColor White
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "OK: npm install completed" -ForegroundColor Green
Write-Host ""

# Step 5: Generate Prisma Client
Write-Host "[5/6] Generating Prisma Client..." -ForegroundColor Cyan
npx prisma generate

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERROR: Prisma generate failed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Check your .env.local file:" -ForegroundColor Yellow
    if (Test-Path ".env.local") {
        Write-Host ".env.local exists" -ForegroundColor Green
        $envContent = Get-Content ".env.local" -Raw
        if ($envContent -match "DATABASE_URL") {
            Write-Host "DATABASE_URL is set" -ForegroundColor Green
        } else {
            Write-Host "DATABASE_URL is NOT set" -ForegroundColor Red
        }
    } else {
        Write-Host ".env.local does NOT exist" -ForegroundColor Red
        Write-Host ""
        Write-Host "Creating from .env.example..." -ForegroundColor Yellow
        if (Test-Path ".env.example") {
            Copy-Item ".env.example" ".env.local"
            Write-Host "Created .env.local" -ForegroundColor Green
            Write-Host ""
            Write-Host "ACTION REQUIRED:" -ForegroundColor Red
            Write-Host "1. Edit .env.local" -ForegroundColor White
            Write-Host "2. Set DATABASE_URL" -ForegroundColor White
            Write-Host "3. Run this script again" -ForegroundColor White
        }
    }
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "OK: Prisma Client generated" -ForegroundColor Green
Write-Host ""

# Step 6: Verify
Write-Host "[6/6] Verifying..." -ForegroundColor Cyan

$prismaClient = "node_modules\.prisma\client\index.js"
if (Test-Path $prismaClient) {
    $fileSize = (Get-Item $prismaClient).Length
    Write-Host "Prisma Client file size: $fileSize bytes" -ForegroundColor Cyan
    
    if ($fileSize -gt 10000) {
        Write-Host "OK: Prisma Client properly generated" -ForegroundColor Green
    } else {
        Write-Host "ERROR: Prisma Client is still a dummy file" -ForegroundColor Red
        Write-Host ""
        Write-Host "This is a serious issue. Please:" -ForegroundColor Yellow
        Write-Host "1. Check schema.prisma for errors"
        Write-Host "2. Verify DATABASE_URL is correct"
        Write-Host "3. Make sure database is running"
        Read-Host "Press Enter to exit"
        exit 1
    }
} else {
    Write-Host "ERROR: Prisma Client file not found" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "RESET COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Everything has been reinstalled" -ForegroundColor Green
Write-Host ""

$start = Read-Host "Start dev server now? (y/n)"
if ($start -eq "y") {
    Write-Host ""
    Write-Host "Starting server..." -ForegroundColor Cyan
    Write-Host "Open: http://localhost:3000" -ForegroundColor White
    Write-Host ""
    npm run dev
} else {
    Write-Host ""
    Write-Host "To start server later:" -ForegroundColor Cyan
    Write-Host "  npm run dev" -ForegroundColor White
    Write-Host ""
    Read-Host "Press Enter to exit"
}
