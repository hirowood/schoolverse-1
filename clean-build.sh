#!/bin/bash

echo "====================================="
echo "  Next.js 15 クリーンビルドスクリプト"
echo "====================================="
echo ""

echo "[ステップ 1/5] .next フォルダを削除中..."
if [ -d ".next" ]; then
    rm -rf .next
    echo "✓ .next フォルダを削除しました"
else
    echo "ℹ .next フォルダは存在しません"
fi
echo ""

echo "[ステップ 2/5] node_modules フォルダを削除中..."
if [ -d "node_modules" ]; then
    rm -rf node_modules
    echo "✓ node_modules フォルダを削除しました"
else
    echo "ℹ node_modules フォルダは存在しません"
fi
echo ""

echo "[ステップ 3/5] 依存関係をインストール中..."
npm install
if [ $? -ne 0 ]; then
    echo "✗ インストールに失敗しました"
    exit 1
fi
echo "✓ インストール完了"
echo ""

echo "[ステップ 4/5] Prismaクライアントを生成中..."
npm run prisma:generate
if [ $? -ne 0 ]; then
    echo "✗ Prisma生成に失敗しました"
    exit 1
fi
echo "✓ Prisma生成完了"
echo ""

echo "[ステップ 5/5] 開発サーバーを起動中..."
echo ""
echo "====================================="
echo "  クリーンビルド完了！"
echo "====================================="
echo ""
npm run dev
