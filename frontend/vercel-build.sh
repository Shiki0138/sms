#!/bin/bash
# Vercelビルドスクリプト - エラー防止版

echo "🚀 Vercelビルドを開始します..."

# エラーが発生したら即座に停止
set -e

# 現在のディレクトリを確認
echo "📍 現在のディレクトリ: $(pwd)"

# frontendディレクトリに移動
cd frontend || { echo "❌ frontendディレクトリが見つかりません"; exit 1; }

# Node.jsバージョンを確認
echo "📦 Node.jsバージョン: $(node --version)"
echo "📦 npmバージョン: $(npm --version)"

# キャッシュをクリア
echo "🧹 npmキャッシュをクリア中..."
npm cache clean --force || true

# 既存のnode_modulesを削除
echo "🗑️ 既存のnode_modulesを削除中..."
rm -rf node_modules || true

# package-lock.jsonがない場合は生成
if [ ! -f "package-lock.json" ]; then
    echo "⚠️ package-lock.jsonが見つかりません。生成中..."
    npm install --legacy-peer-deps --no-audit --no-fund
else
    echo "✅ package-lock.jsonが見つかりました"
fi

# 依存関係をインストール
echo "📦 依存関係をインストール中..."
npm ci --legacy-peer-deps --no-audit --no-fund || npm install --legacy-peer-deps --no-audit --no-fund

# ビルドを実行
echo "🔨 ビルドを実行中..."
npm run build

echo "✅ ビルドが正常に完了しました！"