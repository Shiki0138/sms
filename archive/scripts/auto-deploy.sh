#!/bin/bash

# 自動デプロイスクリプト（非対話型）

set -e

PROJECT_ID="salon-management-prod"
REGION="asia-northeast1"

echo "🚀 美容室管理システムのデプロイを開始します"
echo "プロジェクト: $PROJECT_ID"
echo ""

# プロジェクト設定
echo "📋 プロジェクトを設定中..."
gcloud config set project $PROJECT_ID

# APIを有効化
echo "🔧 必要なAPIを有効化中..."
gcloud services enable run.googleapis.com cloudbuild.googleapis.com || true

# バックエンドのデプロイ準備
echo "🔨 バックエンドを準備中..."
cd backend

# 環境変数を生成
JWT_SECRET=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)

cat > .env.production << EOF
NODE_ENV=production
DATABASE_URL="file:./data/production.db"
JWT_SECRET=$JWT_SECRET
SESSION_SECRET=$SESSION_SECRET
PORT=8080
API_VERSION=v1
EOF

# Dockerfileをコピー
cp Dockerfile.minimal Dockerfile

# .dockerignoreを作成
cat > .dockerignore << EOF
node_modules
npm-debug.log
.env*
.git
.gitignore
README.md
.vscode
coverage
.nyc_output
*.log
EOF

# Cloud Runへデプロイ
echo "☁️ Cloud Runにデプロイ中..."
echo "注意: 初回デプロイは5-10分かかる場合があります..."

gcloud run deploy salon-backend \
  --source . \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --min-instances 0 \
  --max-instances 2 \
  --memory 512Mi \
  --cpu 1 \
  --port 8080 \
  --set-env-vars="NODE_ENV=production,JWT_SECRET=$JWT_SECRET,SESSION_SECRET=$SESSION_SECRET,DATABASE_URL=file:./data/production.db"

# URLを取得
BACKEND_URL=$(gcloud run services describe salon-backend --region=$REGION --format='value(status.url)')
echo "✅ バックエンドURL: $BACKEND_URL"

# フロントエンドの環境変数設定
cd ../frontend
echo "VITE_API_URL=$BACKEND_URL" > .env.production

# 自動停止/起動の設定
echo "⏰ 自動停止設定を作成中..."

# Cloud Schedulerを有効化
gcloud services enable cloudscheduler.googleapis.com || true

# サービスアカウントの作成
gcloud iam service-accounts create cloud-run-scheduler \
  --display-name="Cloud Run Scheduler" || true

# 権限の付与
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:cloud-run-scheduler@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.admin" || true

# 1時に停止
gcloud scheduler jobs create http stop-backend-night \
  --location=$REGION \
  --schedule="0 1 * * *" \
  --time-zone="Asia/Tokyo" \
  --uri="https://run.googleapis.com/v1/projects/$PROJECT_ID/locations/$REGION/services/salon-backend" \
  --http-method=PATCH \
  --oauth-service-account-email="cloud-run-scheduler@$PROJECT_ID.iam.gserviceaccount.com" \
  --oauth-token-scope="https://www.googleapis.com/auth/cloud-platform" \
  --message-body='{"spec":{"template":{"spec":{"containerConcurrency":0}}}}' || true

# 6時に起動
gcloud scheduler jobs create http start-backend-morning \
  --location=$REGION \
  --schedule="0 6 * * *" \
  --time-zone="Asia/Tokyo" \
  --uri="https://run.googleapis.com/v1/projects/$PROJECT_ID/locations/$REGION/services/salon-backend" \
  --http-method=PATCH \
  --oauth-service-account-email="cloud-run-scheduler@$PROJECT_ID.iam.gserviceaccount.com" \
  --oauth-token-scope="https://www.googleapis.com/auth/cloud-platform" \
  --message-body='{"spec":{"template":{"spec":{"containerConcurrency":80}}}}' || true

echo "
✅ バックエンドのデプロイが完了しました！

===========================
バックエンドURL: $BACKEND_URL
===========================

🎉 次のステップ:

1. フロントエンドのビルド:
   cd frontend
   npm install
   npm run build

2. Netlifyでフロントエンドをデプロイ:
   - https://app.netlify.com にアクセス
   - 'New site from Git' をクリック
   - GitHubリポジトリを選択
   - ビルド設定:
     * Base directory: frontend
     * Build command: npm run build
     * Publish directory: frontend/dist
   - 環境変数を追加:
     * VITE_API_URL = $BACKEND_URL

3. 動作確認:
   - バックエンドヘルスチェック: $BACKEND_URL/health
   - フロントエンド: Netlifyで生成されたURL

💰 コスト情報:
- 自動停止: 毎日1:00 AM - 6:00 AM
- 予想月額: $8-12
"