#!/bin/bash

# テストユーザー作成スクリプト

echo "🚀 テストユーザー作成を開始します..."

# 環境変数の読み込み
source .env.test

# Node.jsでスクリプトを実行
cd "$(dirname "$0")/.."

# TypeScriptをコンパイル
echo "📦 TypeScriptをコンパイル中..."
npx ts-node scripts/setup-test-users.ts

echo "✅ 完了しました！"