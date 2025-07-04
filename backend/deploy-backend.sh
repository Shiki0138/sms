#!/bin/bash

# バックエンドデプロイスクリプト
set -e

echo "🚀 バックエンドデプロイを開始します..."

# 現在のディレクトリを確認
echo "📍 作業ディレクトリ: $(pwd)"

# データベースファイルの存在確認
if [ -f "prisma/data/production.db" ]; then
    echo "✅ データベースファイルが見つかりました"
else
    echo "❌ データベースファイルが見つかりません"
    exit 1
fi

# Cloud Runにデプロイ
echo "☁️ Cloud Runにデプロイしています..."
gcloud run deploy salon-backend \
    --source . \
    --region asia-northeast1 \
    --platform managed \
    --allow-unauthenticated \
    --set-env-vars NODE_ENV=production,JWT_SECRET=$(openssl rand -base64 32),DATABASE_URL=file:/app/prisma/data/production.db \
    --min-instances 0 \
    --max-instances 2 \
    --memory 512Mi \
    --cpu 1 \
    --timeout 60s \
    --port 8080

echo "✅ デプロイが完了しました！"