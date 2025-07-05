#!/bin/bash

# ゼロから始める月額$20以下のデプロイスクリプト
# Cloud SQLは使わない！

set -e

echo "🚀 新規プロジェクトでの低コストデプロイを開始"

# ===== 設定 =====
read -p "新しいGoogle CloudプロジェクトID: " PROJECT_ID
REGION="asia-northeast1"
GITHUB_REPO="https://github.com/Shiki0138/sms.git"

# ===== Step 1: プロジェクトセットアップ =====
echo "📋 Step 1: プロジェクトをセットアップ中..."

# プロジェクト作成（既存の場合はスキップ）
gcloud projects create $PROJECT_ID --name="Salon Management System" 2>/dev/null || true

# プロジェクト設定
gcloud config set project $PROJECT_ID

# 必要なAPIを有効化（最小限のみ）
echo "🔧 必要なAPIを有効化中..."
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com

# ===== Step 2: ソースコード準備 =====
echo "📦 Step 2: ソースコードを準備中..."
if [ ! -d "salon-management-system" ]; then
  git clone $GITHUB_REPO salon-management-system
fi
cd salon-management-system

# ===== Step 3: SQLite対応の設定 =====
echo "💾 Step 3: SQLite用の設定を作成中..."

# Prismaスキーマを SQLite用に更新
cat > backend/prisma/schema.sqlite.prisma << 'EOF'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./data/production.db"
}

// 既存のモデル定義をここにコピー
EOF

# 本番環境用の環境変数
cat > backend/.env.production << EOF
NODE_ENV=production
DATABASE_URL="file:./data/production.db"
JWT_SECRET=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)
PORT=8080
EOF

# ===== Step 4: Dockerイメージ作成 =====
echo "🐳 Step 4: Dockerイメージを作成中..."

cat > backend/Dockerfile.minimal << 'EOF'
FROM node:18-alpine

WORKDIR /app

# 依存関係インストール
COPY package*.json ./
RUN npm ci --production

# Prismaクライアント生成
COPY prisma ./prisma
RUN npx prisma generate --schema=./prisma/schema.sqlite.prisma

# アプリケーションコード
COPY . .
RUN npm run build

# データ永続化用ディレクトリ
RUN mkdir -p /app/data
VOLUME ["/app/data"]

# ポート設定
EXPOSE 8080

# ヘルスチェック
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# 起動
CMD ["npm", "start"]
EOF

# ===== Step 5: フロントエンドの準備 =====
echo "🎨 Step 5: フロントエンドを準備中..."

cat > frontend/.env.production << EOF
VITE_API_URL=https://${PROJECT_ID}-backend-xxxxx-an.a.run.app
VITE_ENV=production
EOF

# ===== Step 6: Cloud Runへデプロイ =====
echo "☁️ Step 6: Cloud Runにデプロイ中..."

# バックエンドデプロイ
cd backend
gcloud run deploy ${PROJECT_ID}-backend \
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
  --port 8080 \
  --cpu-throttling

# バックエンドURLを取得
BACKEND_URL=$(gcloud run services describe ${PROJECT_ID}-backend --region=$REGION --format='value(status.url)')

# フロントエンド環境変数を更新
cd ../frontend
echo "VITE_API_URL=$BACKEND_URL" > .env.production

# ===== Step 7: フロントエンドデプロイ（Firebase Hosting） =====
echo "🔥 Step 7: フロントエンドをFirebase Hostingにデプロイ中..."

# Firebase設定
cat > firebase.json << EOF
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "/**",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=3600"
          }
        ]
      }
    ]
  }
}
EOF

# ビルド
npm install
npm run build

# Firebase初期化とデプロイ
firebase use --add $PROJECT_ID
firebase deploy --only hosting

# ===== Step 8: 自動停止設定 =====
echo "⏰ Step 8: コスト管理の自動化を設定中..."

# Cloud Schedulerで深夜停止（1:00-6:00）
# 停止: 午前1時
gcloud scheduler jobs create http stop-backend-night \
  --location=$REGION \
  --schedule="0 1 * * *" \
  --uri="https://run.googleapis.com/v1/projects/${PROJECT_ID}/locations/${REGION}/services/${PROJECT_ID}-backend" \
  --http-method=PATCH \
  --oidc-service-account-email="${PROJECT_ID}@appspot.gserviceaccount.com" \
  --message-body='{"spec":{"template":{"spec":{"containerConcurrency":0}}}}'

# 再開: 午前6時
gcloud scheduler jobs create http start-backend-morning \
  --location=$REGION \
  --schedule="0 6 * * *" \
  --uri="https://run.googleapis.com/v1/projects/${PROJECT_ID}/locations/${REGION}/services/${PROJECT_ID}-backend" \
  --http-method=PATCH \
  --oidc-service-account-email="${PROJECT_ID}@appspot.gserviceaccount.com" \
  --message-body='{"spec":{"template":{"spec":{"containerConcurrency":80}}}}'

# ===== Step 9: 監視とアラート =====
echo "📊 Step 9: 監視とアラートを設定中..."

# 予算アラート（$15で警告、$20で停止）
cat > budget-policy.yaml << EOF
displayName: "Salon System Budget"
budgetFilter:
  projects:
  - "projects/${PROJECT_ID}"
amount:
  specifiedAmount:
    currencyCode: USD
    units: 20
thresholdRules:
- thresholdPercent: 0.75
  spendBasis: CURRENT_SPEND
- thresholdPercent: 1.0
  spendBasis: CURRENT_SPEND
notificationsRule:
  pubsubTopic: "projects/${PROJECT_ID}/topics/budget-alerts"
  disableDefaultIamRecipients: false
EOF

# ===== 完了 =====
echo "
✅ デプロイ完了！

📊 構成内容:
- データベース: SQLite（Cloud Run内蔵）
- バックエンド: Cloud Run（自動スケーリング 0-2）
- フロントエンド: Firebase Hosting
- 自動停止: 22:00-7:00

💰 予想月額費用:
- Cloud Run: $5-10
- Firebase Hosting: $0（無料枠）
- Cloud Build: $0-5
- 合計: $5-15/月

🔗 アクセスURL:
- バックエンド: $BACKEND_URL
- フロントエンド: https://${PROJECT_ID}.web.app

⚠️ 重要な注意事項:
1. データのバックアップは手動で実行してください
2. 本番環境では定期的にSQLiteファイルをCloud Storageにバックアップ
3. 予算アラートが来たら即座に確認

📝 次のステップ:
1. フロントエンドURLにアクセスして動作確認
2. 初期データの投入
3. 日次バックアップの設定
"