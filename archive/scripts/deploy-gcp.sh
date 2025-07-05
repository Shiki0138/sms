#!/bin/bash

# GCP美容室管理システムデプロイスクリプト
set -e

# 色付きログ
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# 設定変数
PROJECT_ID="salon-system-1750113683"  # 生成されたユニークプロジェクトID
REGION="asia-northeast1"
SERVICE_NAME="salon-backend"

log "🚀 GCP美容室管理システムデプロイ開始"

# 1. 前提条件チェック
log "📋 前提条件チェック中..."

if ! command -v gcloud &> /dev/null; then
    error "Google Cloud CLI (gcloud) がインストールされていません"
fi

if ! command -v terraform &> /dev/null; then
    warn "Terraform がインストールされていません（手動構築の場合は無視）"
fi

# 2. GCPプロジェクト設定
log "🔧 GCPプロジェクト設定..."
gcloud config set project $PROJECT_ID
gcloud auth configure-docker

# 3. Terraformでインフラ構築（オプション）
if [ -f "terraform/main.tf" ]; then
    log "🏗️ Terraformでインフラ構築中..."
    cd terraform
    terraform init
    terraform plan -var="project_id=$PROJECT_ID"
    
    read -p "Terraformを実行しますか？ (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        terraform apply -var="project_id=$PROJECT_ID" -auto-approve
    fi
    cd ..
fi

# 4. 必要なAPIを有効化
log "🔌 必要なGCP APIを有効化中..."
gcloud services enable cloudbuild.googleapis.com \
    run.googleapis.com \
    sql-component.googleapis.com \
    sqladmin.googleapis.com \
    storage.googleapis.com \
    secretmanager.googleapis.com

# 5. Cloud SQLセットアップ
log "🗄️ Cloud SQLデータベース確認..."
if ! gcloud sql instances describe salon-db-production --quiet 2>/dev/null; then
    log "Cloud SQLインスタンス作成中..."
    gcloud sql instances create salon-db-production \
        --database-version=POSTGRES_15 \
        --tier=db-custom-2-8192 \
        --region=$REGION \
        --storage-size=100GB \
        --storage-type=SSD \
        --storage-auto-increase \
        --backup-start-time=03:00 \
        --enable-bin-log \
        --availability-type=regional
    
    log "データベース作成中..."
    gcloud sql databases create salon_management_production \
        --instance=salon-db-production
    
    log "データベースユーザー作成中..."
    DB_PASSWORD=$(openssl rand -base64 32)
    gcloud sql users create salon_user \
        --instance=salon-db-production \
        --password=$DB_PASSWORD
    
    # Secret Managerに保存
    echo "postgresql://salon_user:$DB_PASSWORD@//cloudsql/$PROJECT_ID:$REGION:salon-db-production/salon_management_production" | \
        gcloud secrets create database-url --data-file=-
else
    log "Cloud SQLインスタンスは既に存在します"
fi

# 6. バックエンドビルド・デプロイ
log "🔨 バックエンドDockerイメージビルド中..."
cd backend
gcloud builds submit --tag gcr.io/$PROJECT_ID/salon-backend:latest -f Dockerfile.gcp .
cd ..

# 7. Cloud Runデプロイ
log "☁️ Cloud Runにデプロイ中..."
gcloud run deploy $SERVICE_NAME \
    --image gcr.io/$PROJECT_ID/salon-backend:latest \
    --region $REGION \
    --platform managed \
    --port 8080 \
    --memory 2Gi \
    --cpu 2 \
    --min-instances 1 \
    --max-instances 100 \
    --allow-unauthenticated \
    --set-env-vars NODE_ENV=production \
    --set-cloudsql-instances $PROJECT_ID:$REGION:salon-db-production \
    --set-secrets DATABASE_URL=database-url:latest

# 8. フロントエンドデプロイ
log "🌐 フロントエンドビルド・デプロイ中..."
cd frontend

# ビルド設定更新
export VITE_API_BASE_URL="https://$(gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)')/api/v1"

npm run build

# Cloud Storageにアップロード
gsutil mb -p $PROJECT_ID -l $REGION gs://$PROJECT_ID-salon-frontend 2>/dev/null || true
gsutil -m rsync -r -d dist gs://$PROJECT_ID-salon-frontend

# 静的ウェブサイトとして設定
gsutil web set -m index.html -e index.html gs://$PROJECT_ID-salon-frontend

cd ..

# 9. 初期データ投入
log "📊 初期データ投入中..."
BACKEND_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)')

# データベースマイグレーション
gcloud run jobs create salon-migrate \
    --image gcr.io/$PROJECT_ID/salon-backend:latest \
    --region $REGION \
    --set-cloudsql-instances $PROJECT_ID:$REGION:salon-db-production \
    --set-secrets DATABASE_URL=database-url:latest \
    --set-env-vars NODE_ENV=production \
    --command npm \
    --args "run,db:push" || true

gcloud run jobs execute salon-migrate --region=$REGION --wait

# 10. デプロイ完了
log "✅ デプロイ完了！"
echo ""
echo "🎉 美容室管理システムが正常にデプロイされました！"
echo ""
echo "📍 アクセス情報:"
echo "   バックエンドAPI: $BACKEND_URL"
echo "   フロントエンド: https://storage.googleapis.com/$PROJECT_ID-salon-frontend/index.html"
echo ""
echo "🔧 管理コンソール:"
echo "   Cloud Run: https://console.cloud.google.com/run?project=$PROJECT_ID"
echo "   Cloud SQL: https://console.cloud.google.com/sql?project=$PROJECT_ID"
echo "   Cloud Storage: https://console.cloud.google.com/storage?project=$PROJECT_ID"
echo ""
echo "💰 コスト監視:"
echo "   https://console.cloud.google.com/billing?project=$PROJECT_ID"
echo ""

# ヘルスチェック
log "🏥 ヘルスチェック実行中..."
if curl -f "$BACKEND_URL/health" > /dev/null 2>&1; then
    log "✅ バックエンドAPIは正常です"
else
    warn "⚠️ バックエンドAPIの初期化に時間がかかっています（数分後に再確認してください）"
fi

log "🚀 デプロイプロセス完了！"