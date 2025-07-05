#!/bin/bash

# 簡単デプロイスクリプト（手動ステップ付き）

set -e

echo "🚀 美容室管理システムのデプロイを開始します"
echo ""
echo "事前準備:"
echo "1. Google Cloud Consoleで新規プロジェクトを作成済み"
echo "2. gcloud CLIがインストール済み"
echo "3. gcloud auth login 実行済み"
echo ""
read -p "プロジェクトID: " PROJECT_ID
REGION="asia-northeast1"

# プロジェクト設定
echo "📋 プロジェクトを設定中..."
gcloud config set project $PROJECT_ID

# APIを有効化
echo "🔧 必要なAPIを有効化中..."
gcloud services enable run.googleapis.com cloudbuild.googleapis.com

# バックエンドのデプロイ準備
echo "🔨 バックエンドを準備中..."
cd backend

# Dockerfileをコピー
cp Dockerfile.minimal Dockerfile

# Cloud Runへデプロイ
echo "☁️ Cloud Runにデプロイ中..."
gcloud run deploy salon-backend \
  --source . \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --min-instances 0 \
  --max-instances 2 \
  --memory 512Mi \
  --cpu 1 \
  --port 8080

# URLを取得
BACKEND_URL=$(gcloud run services describe salon-backend --region=$REGION --format='value(status.url)')
echo "✅ バックエンドURL: $BACKEND_URL"

# フロントエンドの環境変数設定
cd ../frontend
echo "VITE_API_URL=$BACKEND_URL" > .env.production

# ビルド
echo "🏗️ フロントエンドをビルド中..."
npm install
npm run build

echo "
✅ バックエンドのデプロイが完了しました！

次のステップ:
1. フロントエンドは手動でデプロイしてください:
   - Netlify: https://app.netlify.com
   - または Firebase Hosting

2. 自動停止の設定（1-6時）:
   gcloud scheduler jobs create http stop-backend \\
     --location=$REGION \\
     --schedule='0 1 * * *' \\
     --uri='https://run.googleapis.com/v1/projects/$PROJECT_ID/locations/$REGION/services/salon-backend' \\
     --http-method=PATCH \\
     --message-body='{\"spec\":{\"template\":{\"spec\":{\"containerConcurrency\":0}}}}'

3. 自動起動の設定（6時）:
   gcloud scheduler jobs create http start-backend \\
     --location=$REGION \\
     --schedule='0 6 * * *' \\
     --uri='https://run.googleapis.com/v1/projects/$PROJECT_ID/locations/$REGION/services/salon-backend' \\
     --http-method=PATCH \\
     --message-body='{\"spec\":{\"template\":{\"spec\":{\"containerConcurrency\":80}}}}'

バックエンドURL: $BACKEND_URL
"