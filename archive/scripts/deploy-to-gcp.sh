#!/bin/bash

# Google Cloud 最適化デプロイスクリプト（月額$20以内）

set -e

# 設定
PROJECT_ID="your-project-id"
REGION="asia-northeast1"
SERVICE_NAME="salon-management"

echo "🚀 Google Cloud デプロイ開始（コスト最適化版）"

# 1. プロジェクト設定
echo "📋 プロジェクト設定中..."
gcloud config set project $PROJECT_ID
gcloud config set run/region $REGION

# 2. 必要なAPIを有効化
echo "🔧 APIを有効化中..."
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  sqladmin.googleapis.com \
  redis.googleapis.com

# 3. Dockerイメージのビルド（バックエンド）
echo "🏗️ バックエンドをビルド中..."
cd backend
cat > Dockerfile.cloudrun << EOF
FROM node:18-alpine

WORKDIR /app

# 依存関係のインストール
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --only=production
RUN npx prisma generate

# アプリケーションコード
COPY . .
RUN npm run build

# ポート設定
ENV PORT=8080
EXPOSE 8080

# メモリ最適化
ENV NODE_OPTIONS="--max-old-space-size=384"

CMD ["npm", "start"]
EOF

# 4. Cloud Runへデプロイ（コスト最適化設定）
echo "☁️ Cloud Runにデプロイ中..."
gcloud run deploy $SERVICE_NAME-backend \
  --source . \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --min-instances 0 \
  --max-instances 2 \
  --memory 512Mi \
  --cpu 1 \
  --timeout 60 \
  --concurrency 80 \
  --cpu-throttling \
  --set-env-vars "NODE_ENV=production"

# 5. フロントエンドのデプロイ（静的ホスティング）
echo "🎨 フロントエンドをデプロイ中..."
cd ../frontend

# Firebase Hostingの設定（Cloud Runより安い）
cat > firebase.json << EOF
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "/api/**",
        "run": {
          "serviceId": "$SERVICE_NAME-backend",
          "region": "$REGION"
        }
      }
    ]
  }
}
EOF

npm run build
npx firebase deploy --only hosting

# 6. Cloud SQLの作成（最小構成）
echo "💾 データベースを作成中..."
gcloud sql instances create $SERVICE_NAME-db \
  --tier=db-f1-micro \
  --region=$REGION \
  --database-version=POSTGRES_14 \
  --storage-size=10GB \
  --storage-type=HDD \
  --backup \
  --backup-start-time=03:00 \
  --maintenance-window-day=SUN \
  --maintenance-window-hour=3 \
  --deletion-protection

# 7. コスト管理の設定
echo "💰 コスト管理を設定中..."

# 予算アラートの作成
gcloud billing budgets create \
  --billing-account=$(gcloud beta billing accounts list --format="value(name)" --limit=1) \
  --display-name="Salon Management Budget" \
  --budget-amount=25 \
  --threshold-rule=percent=80 \
  --threshold-rule=percent=100

# 8. 自動停止スケジュールの設定
echo "⏰ 自動停止スケジュールを設定中..."

# Cloud Schedulerで夜間自動停止
gcloud scheduler jobs create http stop-services \
  --location=$REGION \
  --schedule="0 22 * * *" \
  --uri="https://run.googleapis.com/v1/projects/$PROJECT_ID/locations/$REGION/services/$SERVICE_NAME-backend" \
  --http-method=PATCH \
  --message-body='{"spec":{"template":{"spec":{"containerConcurrency":0}}}}' \
  --oauth-service-account-email=$(gcloud iam service-accounts list --format="value(email)" --limit=1)

# 9. 監視ダッシュボードの作成
echo "📊 監視ダッシュボードを作成中..."
cat > monitoring-dashboard.json << EOF
{
  "displayName": "Salon Management Dashboard",
  "widgets": [
    {
      "title": "Request Count",
      "xyChart": {
        "dataSets": [{
          "timeSeriesQuery": {
            "timeSeriesFilter": {
              "filter": "resource.type=\"cloud_run_revision\" AND metric.type=\"run.googleapis.com/request_count\""
            }
          }
        }]
      }
    },
    {
      "title": "Monthly Cost Estimate",
      "scorecard": {
        "timeSeriesQuery": {
          "timeSeriesFilter": {
            "filter": "metric.type=\"billing.googleapis.com/project/cost\""
          }
        }
      }
    }
  ]
}
EOF

echo "✅ デプロイ完了！"
echo ""
echo "🔗 アクセスURL:"
echo "   Backend: $(gcloud run services describe $SERVICE_NAME-backend --format='value(status.url)')"
echo "   Frontend: https://$PROJECT_ID.web.app"
echo ""
echo "💡 コスト削減のヒント:"
echo "   - 使用しない時は手動で停止: gcloud run services update $SERVICE_NAME-backend --max-instances=0"
echo "   - 週末の自動停止も設定可能"
echo "   - Cloud SQLは開発時はローカルSQLiteでもOK"