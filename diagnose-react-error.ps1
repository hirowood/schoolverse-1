# ================================
# React Dev Overlay Error 診断ツール
# ================================

Write-Host "================================" -ForegroundColor Cyan
Write-Host "React Dev Overlay Error 診断" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# 1. Next.jsのバージョン確認
Write-Host "[1/6] Next.jsバージョン確認..." -ForegroundColor Yellow
$packageJson = Get-Content "package.json" | ConvertFrom-Json
Write-Host "  Next.js: $($packageJson.dependencies.next)" -ForegroundColor Green
Write-Host "  React: $($packageJson.dependencies.react)" -ForegroundColor Green
Write-Host "  React-DOM: $($packageJson.dependencies.'react-dom')" -ForegroundColor Green
Write-Host ""

# 2. .nextフォルダの状態確認
Write-Host "[2/6] .nextフォルダの状態確認..." -ForegroundColor Yellow
if (Test-Path ".next") {
    $nextSize = (Get-ChildItem ".next" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "  .nextフォルダ: 存在 ($([math]::Round($nextSize, 2)) MB)" -ForegroundColor Green
    Write-Host "  推奨: 削除して再ビルド" -ForegroundColor Yellow
} else {
    Write-Host "  .nextフォルダ: 存在しない" -ForegroundColor Red
    Write-Host "  推奨: npm run dev を実行" -ForegroundColor Yellow
}
Write-Host ""

# 3. node_modulesの状態確認
Write-Host "[3/6] node_modulesの状態確認..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    $modulesSize = (Get-ChildItem "node_modules" -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "  node_modules: 存在 ($([math]::Round($modulesSize, 2)) MB)" -ForegroundColor Green
    
    # package-lock.jsonとの整合性確認
    $packageLockTime = (Get-Item "package-lock.json").LastWriteTime
    $nodeModulesTime = (Get-Item "node_modules").LastWriteTime
    
    if ($packageLockTime -gt $nodeModulesTime) {
        Write-Host "  警告: package-lock.jsonが更新されています" -ForegroundColor Red
        Write-Host "  推奨: npm install を実行" -ForegroundColor Yellow
    }
} else {
    Write-Host "  node_modules: 存在しない" -ForegroundColor Red
    Write-Host "  推奨: npm install を実行" -ForegroundColor Yellow
}
Write-Host ""

# 4. Prismaクライアントの状態確認
Write-Host "[4/6] Prismaクライアントの状態確認..." -ForegroundColor Yellow
if (Test-Path "node_modules\.prisma\client") {
    Write-Host "  Prismaクライアント: 生成済み" -ForegroundColor Green
} else {
    Write-Host "  Prismaクライアント: 未生成" -ForegroundColor Red
    Write-Host "  推奨: npm run prisma:generate を実行" -ForegroundColor Yellow
}
Write-Host ""

# 5. 最近変更されたファイル確認
Write-Host "[5/6] 最近変更されたファイル（過去1時間）..." -ForegroundColor Yellow
$recentFiles = Get-ChildItem -Path "src" -Recurse -File | 
    Where-Object { $_.LastWriteTime -gt (Get-Date).AddHours(-1) } | 
    Select-Object -First 10 FullName, LastWriteTime

if ($recentFiles) {
    foreach ($file in $recentFiles) {
        $relativePath = $file.FullName -replace [regex]::Escape((Get-Location).Path + "\"), ""
        Write-Host "  $relativePath" -ForegroundColor Cyan
        Write-Host "    変更時刻: $($file.LastWriteTime.ToString('yyyy-MM-dd HH:mm:ss'))" -ForegroundColor Gray
    }
} else {
    Write-Host "  過去1時間以内に変更されたファイルなし" -ForegroundColor Gray
}
Write-Host ""

# 6. 推奨アクション
Write-Host "[6/6] 推奨アクション:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  オプション1: クイック修正（推奨）" -ForegroundColor Green
Write-Host "    1. npm run clean:next" -ForegroundColor White
Write-Host "    2. npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "  オプション2: 完全修正" -ForegroundColor Green
Write-Host "    1. npm run clean:all" -ForegroundColor White
Write-Host "    2. npm install" -ForegroundColor White
Write-Host "    3. npm run prisma:generate" -ForegroundColor White
Write-Host "    4. npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "  オプション3: バッチファイルで自動修正" -ForegroundColor Green
Write-Host "    .\fix-react-error.bat" -ForegroundColor White
Write-Host ""

Write-Host "================================" -ForegroundColor Cyan
Write-Host "診断完了" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
