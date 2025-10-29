# Prisma Complete Reset PowerShell Script
# This script removes workspaces and does a clean reinstall

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Prisma Complete Reset Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "WARNING: This script will:" -ForegroundColor Red
Write-Host "1. Backup package.json"
Write-Host "2. Remove workspaces configuration"
Write-Host "3. Delete node_modules"
Write-Host "4. Delete .next"
Write-Host "5. Delete package-lock.json"
Write-Host "6. Run npm install"
Write-Host "7. Generate Prisma Client"
Write-Host ""
Write-Host "This may take several minutes." -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "Continue? (y/n)"
if ($confirm -ne "y") {
    Write-Host "Cancelled" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit
}
Write-Host ""

# Step 1: Backup
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step 1: Create Backup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Copy-Item "package.json" "package.json.backup" -Force
Write-Host "OK: package.json backed up" -ForegroundColor Green
if (Test-Path "package-lock.json") {
    Copy-Item "package-lock.json" "package-lock.json.backup" -Force
    Write-Host "OK: package-lock.json backed up" -ForegroundColor Green
}
Write-Host ""

# Step 2: Remove workspaces
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step 2: Remove workspaces" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
if ($packageJson.workspaces) {
    Write-Host "Found workspaces configuration" -ForegroundColor Yellow
    $packageJson.PSObject.Properties.Remove('workspaces')
    $packageJson | ConvertTo-Json -Depth 100 | Set-Content "package.json"
    Write-Host "OK: workspaces removed" -ForegroundColor Green
} else {
    Write-Host "INFO: workspaces not found" -ForegroundColor Yellow
}
Write-Host ""

# Step 3: Delete node_modules
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step 3: Delete node_modules" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
if (Test-Path "node_modules") {
    Write-Host "Deleting node_modules... (this may take a while)" -ForegroundColor Yellow
    Remove-Item -Path "node_modules" -Recurse -Force
    Write-Host "OK: node_modules deleted" -ForegroundColor Green
} else {
    Write-Host "INFO: node_modules not found" -ForegroundColor Yellow
}
Write-Host ""

# Step 4: Delete .next
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step 4: Delete .next" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
if (Test-Path ".next") {
    Remove-Item -Path ".next" -Recurse -Force
    Write-Host "OK: .next deleted" -ForegroundColor Green
} else {
    Write-Host "INFO: .next not found" -ForegroundColor Yellow
}
Write-Host ""

# Step 5: Delete package-lock.json
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step 5: Delete package-lock.json" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
if (Test-Path "package-lock.json") {
    Remove-Item "package-lock.json" -Force
    Write-Host "OK: package-lock.json deleted" -ForegroundColor Green
}
Write-Host ""

# Step 6: npm install
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step 6: npm install" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Running npm install... (this may take several minutes)" -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: npm install failed" -ForegroundColor Red
    Write-Host ""
    Write-Host "To restore backup:" -ForegroundColor Yellow
    Write-Host "Copy-Item package.json.backup package.json -Force"
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "OK: npm install completed" -ForegroundColor Green
Write-Host ""

# Step 7: Generate Prisma Client (WITHOUT --force)
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step 7: Generate Prisma Client" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Prisma generate failed" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "OK: Prisma Client generated" -ForegroundColor Green
Write-Host ""

# Step 8: Verify
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step 8: Verify" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
$prismaClient = "node_modules\.prisma\client\index.js"
if (Test-Path $prismaClient) {
    $fileSize = (Get-Item $prismaClient).Length
    Write-Host "File size: $fileSize bytes"
    
    if ($fileSize -gt 10000) {
        Write-Host "OK: Prisma Client properly generated" -ForegroundColor Green
    } else {
        Write-Host "WARNING: File size is too small" -ForegroundColor Red
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
Write-Host "Reset Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Note: workspaces has been removed from package.json" -ForegroundColor Yellow
Write-Host "To restore: Copy-Item package.json.backup package.json -Force" -ForegroundColor Yellow
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
