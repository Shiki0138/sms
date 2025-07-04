#!/bin/bash

# デモサーバーをCloud Runにデプロイ
echo "🎯 デモサーバーをデプロイ中..."

cd backend

# Dockerfileを使用してCloud Runにデプロイ
gcloud run deploy salon-demo \
  --source . \
  --dockerfile Dockerfile.demo \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --memory 256Mi \
  --cpu 0.5 \
  --min-instances 0 \
  --max-instances 1 \
  --port 8080

echo "✅ デモサーバーのデプロイ完了"

# デモサーバーのURLを取得
DEMO_URL=$(gcloud run services describe salon-demo --region=asia-northeast1 --format="value(status.url)")
echo "📋 デモサーバーURL: $DEMO_URL"

# フロントエンドの環境変数を更新
cd ../frontend
echo "VITE_API_URL=$DEMO_URL" > .env.production
echo "VITE_APP_NAME=美容室統合管理システム（デモ版）" >> .env.production

echo "🔧 環境変数を更新:"
cat .env.production

# フロントエンドを再ビルド
echo "🔨 フロントエンドを再ビルド中..."
npm run build

# Cloud Storageに再アップロード
echo "☁️ Cloud Storageに再アップロード中..."
gsutil -m rsync -r -d dist/ gs://salon-frontend-static/

echo ""
echo "🎉 デモ環境のデプロイ完了！"
echo "📱 URL: https://salon-frontend-static.storage.googleapis.com/index.html"
echo "🔑 ログイン: どんなメール/パスワードでもOK"
echo "🎯 デモバックエンド: $DEMO_URL"