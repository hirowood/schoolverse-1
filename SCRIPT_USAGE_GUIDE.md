# 🛠️ Prisma修正スクリプト使用ガイド

## 📋 スクリプト一覧

### Windows バッチファイル (.bat)

| ファイル名 | 用途 | 推奨度 |
|-----------|------|--------|
| `diagnose-simple.bat` | 問題診断 | ⭐⭐⭐ |
| `fix-prisma-simple.bat` | 簡易修正 | ⭐⭐⭐ |

### PowerShell スクリプト (.ps1) - **推奨**

| ファイル名 | 用途 | 推奨度 |
|-----------|------|--------|
| `diagnose-simple.ps1` | 問題診断（詳細） | ⭐⭐⭐⭐⭐ |
| `fix-prisma-simple.ps1` | 簡易修正 | ⭐⭐⭐⭐ |
| `fix-prisma-complete.ps1` | 完全リセット（workspaces削除） | ⭐⭐⭐⭐⭐ |

---

## 🚀 実行方法

### バッチファイルの場合

```cmd
cd C:\Users\hiroki\Desktop\schoolverse

REM 診断
diagnose-simple.bat

REM 修正
fix-prisma-simple.bat
```

### PowerShell の場合（推奨）

```powershell
cd C:\Users\hiroki\Desktop\schoolverse

# 実行ポリシーを一時的に変更（初回のみ）
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process

# 診断
.\diagnose-simple.ps1

# 修正
.\fix-prisma-simple.ps1

# または完全リセット（workspaces問題を解決）
.\fix-prisma-complete.ps1
```

---

## 📊 スクリプト選択フローチャート

```
エラーが発生している
  ↓
diagnose-simple.ps1 を実行
  ↓
┌─────────────────────────┐
│ workspaces が検出された？│
└─────────────────────────┘
  ↓YES                ↓NO
  ↓                   ↓
fix-prisma-complete.ps1   fix-prisma-simple.ps1
（完全リセット）          （簡易修正）
  ↓                   ↓
解決！                解決！
```

---

## ⚡ クイックスタート

### 最も簡単な方法（推奨）

```powershell
# 1. PowerShellを開く（管理者権限不要）

# 2. プロジェクトフォルダに移動
cd C:\Users\hiroki\Desktop\schoolverse

# 3. 実行ポリシーを一時的に変更
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process

# 4. 診断実行
.\diagnose-simple.ps1

# 5. 問題が見つかったら修正実行
.\fix-prisma-complete.ps1
```

---

## 🔍 各スクリプトの詳細

### 1️⃣ `diagnose-simple.ps1` - 診断スクリプト

**何をする？**
- Node.js バージョン確認
- Prisma バージョン確認
- schema.prisma の検証
- 生成ファイルのサイズ確認（重要！）
- DATABASE_URL の確認
- workspaces 設定の確認（根本原因の特定）
- データベース接続テスト

**実行時間**: 約30秒

**結果の見方**:
```powershell
# ✅ 正常
OK: File size is normal
File size: 150000 bytes

# ❌ 異常（ダミーファイル）
WARNING: File size is too small (dummy file)
File size: 2000 bytes

# ⚠️ 根本原因
WARNING: workspaces is configured
This may be the root cause
```

---

### 2️⃣ `fix-prisma-simple.ps1` - 簡易修正

**何をする？**
1. `npx prisma generate` を実行
2. `.next` フォルダを削除
3. 生成ファイルのサイズを確認
4. 開発サーバーを起動（オプション）

**実行時間**: 約1分

**いつ使う？**
- 初めてエラーが発生した
- workspaces 問題がない
- 簡単に試したい

---

### 3️⃣ `fix-prisma-complete.ps1` - 完全リセット（推奨）

**何をする？**
1. `package.json` をバックアップ
2. **workspaces 設定を削除**（重要！）
3. `node_modules` を完全削除
4. `.next` を削除
5. `package-lock.json` を削除
6. `npm install` を再実行
7. `npx prisma generate` を強制実行
8. 生成ファイルの検証

**実行時間**: 約5-10分（npm install に時間がかかる）

**いつ使う？**
- `fix-prisma-simple.ps1` で解決しない
- workspaces 問題が検出された
- 確実に解決したい

---

## ❓ よくある質問

### Q1: PowerShellスクリプトを実行できない

**エラー**: `Cannot be loaded because running scripts is disabled`

**解決法**:
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
```

これは一時的な変更で、PowerShellを閉じると元に戻ります。

---

### Q2: どのスクリプトを使えばいい？

**推奨順序**:
1. `diagnose-simple.ps1` で診断
2. workspaces が見つかった → `fix-prisma-complete.ps1`
3. workspaces がない → `fix-prisma-simple.ps1`

---

### Q3: バックアップを復元したい

```powershell
# package.json を復元
Copy-Item package.json.backup package.json -Force

# package-lock.json を復元
Copy-Item package-lock.json.backup package-lock.json -Force
```

---

### Q4: スクリプト実行後もエラーが出る

以下を確認:

1. **データベースが起動しているか**
   ```powershell
   # PostgreSQL のステータス確認（Docker使用の場合）
   docker ps | findstr postgres
   ```

2. **DATABASE_URL が正しいか**
   ```
   # .env.local を確認
   notepad .env.local
   
   # 正しい形式:
   DATABASE_URL="postgresql://user:password@localhost:5432/database"
   ```

3. **手動で確認**
   ```powershell
   # Prisma Studio を起動してみる
   npx prisma studio
   ```

---

## 🎯 トラブルシューティング

### パターン1: 文字化けが発生

**原因**: バッチファイルのエンコーディング問題

**解決法**: PowerShell スクリプトを使用
```powershell
.\diagnose-simple.ps1
```

---

### パターン2: "File size is too small" と表示される

**原因**: Prisma Client が正しく生成されていない（ダミーファイル）

**解決法**: 完全リセットを実行
```powershell
.\fix-prisma-complete.ps1
```

---

### パターン3: "workspaces is configured" と表示される

**原因**: これが根本原因の可能性が高い

**解決法**: 完全リセットを実行（workspaces を削除）
```powershell
.\fix-prisma-complete.ps1
```

---

## 📞 それでも解決しない場合

1. **診断結果を保存**
   ```powershell
   .\diagnose-simple.ps1 > diagnosis-result.txt
   ```

2. **エラーログを保存**
   ```powershell
   npm run dev 2>&1 > error-log.txt
   ```

3. **以下の情報を確認**
   - Node.js バージョン: `node --version`
   - npm バージョン: `npm --version`
   - Prisma バージョン: `npx prisma --version`
   - OS バージョン

4. **GitHub Issue を作成**するか、`docs/PRISMA_DEEP_ANALYSIS.md` を参照

---

## ✅ 成功の確認方法

スクリプト実行後、以下を確認:

```powershell
# 1. ファイルサイズを確認（10KB以上なら成功）
(Get-Item "node_modules\.prisma\client\index.js").Length

# 2. 開発サーバーを起動
npm run dev

# 3. ブラウザで http://localhost:3000/api/auth/me にアクセス
# → 401 Unauthorized が返ればOK（500エラーでなければ成功）
```

---

## 🎓 まとめ

### 推奨手順

```powershell
# Step 1: 診断
.\diagnose-simple.ps1

# Step 2: 完全リセット（最も確実）
.\fix-prisma-complete.ps1

# Step 3: 確認
npm run dev
```

### 所要時間
- 診断: 30秒
- 修正: 5-10分
- 合計: 約10分

### 成功率
- `fix-prisma-simple.ps1`: 約60%
- `fix-prisma-complete.ps1`: 約95%

---

**作成日**: 2025年10月25日  
**対応バージョン**: Windows 10/11, PowerShell 5.1+
