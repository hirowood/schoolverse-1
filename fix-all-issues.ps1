# Prisma Fix with Dependency Resolution
# Handles both Prisma and Three.js dependency issues

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Prisma & Dependencies Fix Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "This script will:" -ForegroundColor Yellow
Write-Host "1. Backup package.json"
Write-Host "2. Update Three.js to 0.168.0 (fixes @react-three/drei compatibility)"
Write-Host "3. Remove workspaces configuration"
Write-Host "4. Clean install with --legacy-peer-deps"
Write-Host "5. Generate Prisma Client"
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

# Step 2: Update package.json
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step 2: Update Dependencies" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json

# Remove workspaces
if ($packageJson.workspaces) {
    Write-Host "Removing workspaces configuration..." -ForegroundColor Yellow
    $packageJson.PSObject.Properties.Remove('workspaces')
    Write-Host "OK: workspaces removed" -ForegroundColor Green
}

# Update Three.js version
if ($packageJson.dependencies.three) {
    $oldVersion = $packageJson.dependencies.three
    $packageJson.dependencies.three = "^0.168.0"
    Write-Host "Updating Three.js: $oldVersion -> ^0.168.0" -ForegroundColor Yellow
    Write-Host "OK: Three.js updated" -ForegroundColor Green
}

# Save updated package.json
$packageJson | ConvertTo-Json -Depth 100 | Set-Content "package.json"
Write-Host ""

# Step 3: Clean old files
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step 3: Clean Old Files" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if (Test-Path "node_modules") {
    Write-Host "Deleting node_modules... (this may take a while)" -ForegroundColor Yellow
    Remove-Item -Path "node_modules" -Recurse -Force
    Write-Host "OK: node_modules deleted" -ForegroundColor Green
}

if (Test-Path ".next") {
    Remove-Item -Path ".next" -Recurse -Force
    Write-Host "OK: .next deleted" -ForegroundColor Green
}

if (Test-Path "package-lock.json") {
    Remove-Item "package-lock.json" -Force
    Write-Host "OK: package-lock.json deleted" -ForegroundColor Green
}
Write-Host ""

# Step 4: Install with legacy-peer-deps
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step 4: npm install (with --legacy-peer-deps)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Running npm install... (this may take several minutes)" -ForegroundColor Yellow
Write-Host "Using --legacy-peer-deps to resolve dependency conflicts" -ForegroundColor Yellow
Write-Host ""

npm install --legacy-peer-deps

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: npm install failed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Trying alternative: npm install --force" -ForegroundColor Yellow
    npm install --force
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: npm install --force also failed" -ForegroundColor Red
        Write-Host ""
        Write-Host "To restore backup:" -ForegroundColor Yellow
        Write-Host "Copy-Item package.json.backup package.json -Force" -ForegroundColor Yellow
        Read-Host "Press Enter to exit"
        exit 1
    }
}

Write-Host "OK: npm install completed" -ForegroundColor Green
Write-Host ""

# Step 5: Generate Prisma Client (WITHOUT --force)
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step 5: Generate Prisma Client" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

npx prisma generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Prisma generate failed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Checking DATABASE_URL..." -ForegroundColor Yellow
    if (Test-Path ".env.local") {
        $envContent = Get-Content ".env.local" -Raw
        if ($envContent -match "DATABASE_URL") {
            Write-Host "DATABASE_URL is set in .env.local" -ForegroundColor Green
        } else {
            Write-Host "WARNING: DATABASE_URL not found in .env.local" -ForegroundColor Red
        }
    } else {
        Write-Host "WARNING: .env.local does not exist" -ForegroundColor Red
    }
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "OK: Prisma Client generated" -ForegroundColor Green
Write-Host ""

# Step 6: Verify
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step 6: Verify Installation" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Check Prisma Client
$prismaClient = "node_modules\.prisma\client\index.js"
if (Test-Path $prismaClient) {
    $fileSize = (Get-Item $prismaClient).Length
    Write-Host "Prisma Client file size: $fileSize bytes"
    
    if ($fileSize -gt 10000) {
        Write-Host "OK: Prisma Client properly generated" -ForegroundColor Green
    } else {
        Write-Host "WARNING: File size is too small" -ForegroundColor Red
    }
} else {
    Write-Host "ERROR: Prisma Client file not found" -ForegroundColor Red
}

# Check Three.js
if (Test-Path "node_modules\three\package.json") {
    $threePackage = Get-Content "node_modules\three\package.json" | ConvertFrom-Json
    Write-Host "Three.js version: $($threePackage.version)" -ForegroundColor Cyan
}

Write-Host ""

# Success
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Installation Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Changes made:" -ForegroundColor Yellow
Write-Host "- Updated Three.js to 0.168.0"
Write-Host "- Removed workspaces configuration"
Write-Host "- Installed with --legacy-peer-deps"
Write-Host ""
Write-Host "Backup saved as:" -ForegroundColor Yellow
Write-Host "- package.json.backup"
if (Test-Path "package-lock.json.backup") {
    Write-Host "- package-lock.json.backup"
}
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
