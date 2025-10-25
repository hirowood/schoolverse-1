# 🔧 Schoolverse プロジェクトセットアップガイド

## 📋 目次
1. [必須要件](#必須要件)
2. [初回セットアップ](#初回セットアップ)
3. [Prismaエラーの解決](#prismaエラーの解決)
4. [トラブルシューティング](#トラブルシューティング)

---

## 🎯 必須要件

- **Node.js**: 20.x
- **PostgreSQL**: 14以上
- **npm**: 9.x以上

---

## 🚀 初回セットアップ

### ステップ1: リポジトリのクローン

```bash
git clone <repository-url>
cd schoolverse
```

### ステップ2: 環境変数の設定

```bash
# .env.local ファイルを作成
cp .env.example .env.local

# DATABASE_URL を編集
# 例: postgresql://postgres:postgres@localhost:5432/schoolverse?schema=public
```

### ステップ3: 依存関係のインストール

```bash
npm install
```

**重要**: `npm install` 実行時に自動的に `prisma generate` が実行されます。

### ステップ4: データベースのマイグレーション

```bash
npm run prisma:migrate
```

### ステップ5: 開発サーバーの起動

```bash
npm run dev
```

---

## ⚠️ Prismaエラーの解決

### エラー: `@prisma/client did not initialize yet`

このエラーが発生した場合、以下の手順で解決してください:

#### **即座の対処法**

```bash
# ステップ1: Prismaクライアントを生成
npm run prisma:generate

# または直接
npx prisma generate

# ステップ2: ビルドキャッシュをクリーン
npm run clean:next

# ステップ3: 開発サーバーを再起動
npm run dev
```

#### **根本的な解決**

このエラーは通常、以下の原因で発生します:

1. **初回セットアップ時**: `prisma generate` が実行されていない
2. **npm install後**: 自動生成が失敗した
3. **schema.prisma変更後**: 再生成が必要

**解決策**: `package.json` に `postinstall` スクリプトを追加済み

```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

これにより、`npm install` 実行時に自動的にPrismaクライアントが生成されます。

---

## 🔍 トラブルシューティング

### 問題1: データベース接続エラー

**症状**: `Can't reach database server`

**原因**:
- PostgreSQLが起動していない
- DATABASE_URLが間違っている
- ポート5432が使用中

**解決策**:
```bash
# PostgreSQLの状態を確認
# Windows: サービスを確認
services.msc

# .env.local のDATABASE_URLを確認
# 正しい形式: postgresql://user:password@localhost:5432/database?schema=public
```

### 問題2: ポート競合

**症状**: `Port 3000 is already in use`

**解決策**:
```bash
# Windowsでポートを使用しているプロセスを確認
netstat -ano | findstr :3000

# プロセスを終了
taskkill /PID <プロセスID> /F

# または別のポートを使用
npm run dev -- -p 3001
```

### 問題3: node_modules の破損

**症状**: 不可解なエラーが続く

**解決策**:
```bash
# 完全クリーンインストール
npm run clean:install

# これは以下を実行します:
# 1. .next と node_modules を削除
# 2. npm install を実行
# 3. prisma generate を実行
# 4. npm run dev を実行
```

---

## 📚 便利なコマンド一覧

### 開発関連

```bash
# 開発サーバー起動
npm run dev

# ビルド（本番用）
npm run build

# 本番サーバー起動
npm start

# 型チェック
npm run type-check

# Lint
npm run lint

# フォーマット
npm run format
```

### Prisma関連

```bash
# Prismaクライアント生成
npm run prisma:generate

# マイグレーション実行
npm run prisma:migrate

# Prisma Studio起動（DB GUI）
npm run prisma:studio
```

### クリーン関連

```bash
# .next フォルダのみ削除
npm run clean:next

# node_modules のみ削除
npm run clean:modules

# 全てクリーン
npm run clean:all

# クリーン後に開発サーバー起動
npm run clean:dev

# 完全リセット（推奨）
npm run clean:install
```

### テスト関連

```bash
# テスト実行（watch モード）
npm run test

# テスト実行（1回のみ）
npm run test:unit

# カバレッジ付きテスト
npm run test:coverage

# E2Eテスト
npm run test:e2e
```

### Docker関連

```bash
# 開発環境起動
npm run docker:dev

# 開発環境停止
npm run docker:dev:down

# 本番環境起動
npm run docker:prod

# 本番環境停止
npm run docker:prod:down
```

---

## 🎓 学習リソース

### 公式ドキュメント

- [Next.js 15 ドキュメント](https://nextjs.org/docs)
- [Prisma ドキュメント](https://www.prisma.io/docs)
- [React 19 ドキュメント](https://react.dev)
- [TypeScript ドキュメント](https://www.typescriptlang.org/docs)

### プロジェクト固有

- `docs/ARCHITECTURE.md`: システムアーキテクチャ
- `docs/API.md`: API仕様
- `docs/DATABASE.md`: データベース設計

---

## 🐛 バグ報告

問題が発生した場合は、以下の情報を含めて報告してください:

1. **エラーメッセージ全文**
2. **再現手順**
3. **環境情報**:
   ```bash
   node --version
   npm --version
   ```
4. **実行したコマンド**

---

## 📝 よくある質問（FAQ）

### Q1: `prisma generate` はいつ実行する必要がありますか?

**A**: 以下の場合に実行が必要です:
- 初回セットアップ時（自動実行）
- `schema.prisma` を変更した後
- `npm install` 後にエラーが出た場合

### Q2: データベースがリセットされましたか?

**A**: `prisma migrate` を実行すると、開発環境ではデータがリセットされます。
本番環境では慎重に実行してください。

### Q3: `.env.local` と `.env` の違いは?

**A**:
- `.env.local`: ローカル開発用（Git追跡対象外）
- `.env`: デフォルト値（Git追跡対象）

### Q4: ポートを変更するには?

**A**: 
```bash
# 開発サーバー
npm run dev -- -p 3001

# または .env.local に追加
PORT=3001
```

---

## 🔐 セキュリティ注意事項

1. **機密情報の管理**:
   - `.env.local` は絶対にコミットしない
   - JWT_SECRET は本番環境で必ず変更する

2. **データベース接続**:
   - 本番環境ではSSL接続を使用
   - パスワードは強力なものを使用

3. **依存関係**:
   - 定期的に `npm audit` を実行
   - セキュリティアップデートを適用

---

## 📞 サポート

問題が解決しない場合は、以下にお問い合わせください:

- **GitHub Issues**: <repository-issues-url>
- **Discord**: <discord-url>
- **Email**: <support-email>

---

**最終更新**: 2025年10月25日  
**バージョン**: 0.1.0
