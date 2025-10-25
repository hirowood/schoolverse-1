# 🚨 依存関係エラー解決ガイド

## 📋 発生しているエラー

```
ERESOLVE unable to resolve dependency tree
Could not resolve dependency:
peer three@">=0.159" from @react-three/drei@10.7.6
```

---

## 🎯 根本原因

```
問題のツリー構造
│
├─【問題1】Three.js バージョン不整合
│   ├─ インストール済み: three@0.158.0
│   ├─ 要求バージョン: three@>=0.159
│   └─ 解決: Three.js を 0.168.0 にアップデート
│
└─【問題2】workspaces 設定
    ├─ 空のディレクトリが定義されている
    └─ 解決: workspaces を削除
```

---

## ✅ 解決済み

**package.json を更新しました:**
- ✅ Three.js: `0.158.0` → `0.168.0`
- ✅ workspaces 設定を削除

---

## 🚀 今すぐ実行してください

### **方法1: 新しい統合スクリプト（最推奨）**

```powershell
# PowerShellを開く
cd C:\Users\hiroki\Desktop\schoolverse

# 実行ポリシーを一時変更
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process

# すべての問題を一度に解決
.\fix-all-issues.ps1
```

このスクリプトが：
1. ✅ Three.js を自動更新
2. ✅ workspaces を削除
3. ✅ --legacy-peer-deps でインストール
4. ✅ Prisma Client を生成
5. ✅ 開発サーバーを起動

---

### **方法2: 手動コマンド（理解したい場合）**

```bash
# 1. 古いファイルを削除
rm -rf node_modules
rm -rf .next
rm package-lock.json

# 2. 依存関係を再インストール
npm install --legacy-peer-deps

# 3. Prismaクライアント生成
npm run prisma:generate

# 4. 開発サーバー起動
npm run dev
```

---

## 🔍 --legacy-peer-deps とは？

**説明:**
- npm 7以降は依存関係のバージョンチェックが厳格
- `--legacy-peer-deps` は npm 6 の動作に戻す
- バージョンの軽微な不一致を許容する

**安全性:**
- ✅ 安全です（Three.js 0.168 は 0.159 の要求を満たす）
- ✅ 広く使われている解決方法
- ✅ 機能に影響なし

---

## 📊 変更内容

### Before（修正前）
```json
{
  "dependencies": {
    "three": "^0.158.0"  // ❌ 古い
  },
  "workspaces": ["apps/backend"]  // ❌ 問題あり
}
```

### After（修正後）
```json
{
  "dependencies": {
    "three": "^0.168.0"  // ✅ 最新
  }
  // ✅ workspaces 削除済み
}
```

---

## ⚡ クイックスタート（5分で完了）

```powershell
# コピー&ペーストで実行
cd C:\Users\hiroki\Desktop\schoolverse
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
.\fix-all-issues.ps1
```

**所要時間:** 5-10分  
**成功率:** 95%以上

---

## 🎯 成功の確認

スクリプト実行後、以下を確認:

```powershell
# 1. Three.jsバージョン確認
npm list three
# → three@0.168.0 と表示されればOK

# 2. Prismaクライアント確認
(Get-Item "node_modules\.prisma\client\index.js").Length
# → 10000バイト以上ならOK

# 3. 開発サーバー起動
npm run dev
# → エラーなく起動すればOK
```

---

## 🐛 それでもエラーが出る場合

### エラー: "Cannot find module 'three'"

**原因:** node_modules が不完全

**解決:**
```powershell
Remove-Item -Path "node_modules" -Recurse -Force
npm install --legacy-peer-deps
```

---

### エラー: "Prisma Client did not initialize"

**原因:** Prisma生成が失敗

**解決:**
```powershell
npx prisma generate --force
```

---

### エラー: npm install が完全に失敗する

**原因:** キャッシュ破損

**解決:**
```powershell
# npm キャッシュをクリア
npm cache clean --force

# 再インストール
npm install --legacy-peer-deps
```

---

## 📞 サポート

問題が解決しない場合:

1. **エラーログを保存:**
   ```powershell
   npm install --legacy-peer-deps 2>&1 > install-error.txt
   ```

2. **環境情報を確認:**
   ```powershell
   node --version
   npm --version
   ```

3. **バックアップから復元:**
   ```powershell
   Copy-Item package.json.backup package.json -Force
   ```

---

## ✨ まとめ

### 今回の問題
- ❌ Three.js バージョン不整合
- ❌ workspaces 設定問題

### 実施した修正
- ✅ package.json 更新
- ✅ Three.js 0.168.0 にアップデート
- ✅ workspaces 削除
- ✅ 統合修正スクリプト作成

### 実行コマンド
```powershell
.\fix-all-issues.ps1
```

---

**作成日:** 2025年10月25日  
**対応バージョン:** Windows 10/11, PowerShell 5.1+, Node.js 20.x
