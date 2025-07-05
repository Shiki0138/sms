#!/bin/bash

# Google Cloud Storage静的ホスティングへのデプロイスクリプト
# コスト: 月額$0.02/GB程度（非常に低コスト）

set -e

echo "🚀 Google Cloud Storage静的ホスティングへのデプロイを開始します..."

# 変数設定
PROJECT_ID="salon-management-prod"
BUCKET_NAME="salon-frontend-static"
REGION="asia-northeast1"

# gcloudプロジェクトの設定
echo "🔧 プロジェクトを設定しています..."
gcloud config set project $PROJECT_ID

# バケットの作成（既に存在する場合はスキップ）
echo "🪣 Cloud Storageバケットを作成しています..."
gsutil mb -p $PROJECT_ID -c STANDARD -l $REGION gs://$BUCKET_NAME/ 2>/dev/null || echo "バケットは既に存在します"

# バケットを公開設定
echo "🌐 バケットを公開設定にしています..."
gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME

# ウェブサイト設定
echo "🔧 ウェブサイト設定を適用しています..."
gsutil web set -m index.html -e index.html gs://$BUCKET_NAME

# フロントエンドのビルド確認
if [ ! -d "frontend/dist" ]; then
    echo "📦 フロントエンドをビルドしています..."
    cd frontend
    npm run build
    cd ..
fi

# 環境変数ファイルを更新してリビルド
echo "📝 環境変数を更新しています..."
cat > frontend/.env.production << EOF
VITE_API_URL=https://salon-backend-29707400517.asia-northeast1.run.app
VITE_APP_NAME=美容室統合管理システム
EOF

echo "🔨 プロダクション環境用にリビルドしています..."
cd frontend
npm run build
cd ..

# ファイルをアップロード
echo "📤 ファイルをアップロードしています..."
gsutil -m rsync -R -d frontend/dist/ gs://$BUCKET_NAME/

# キャッシュ設定を適用
echo "⚡ キャッシュ設定を適用しています..."
gsutil -m setmeta -h "Cache-Control:public, max-age=31536000" gs://$BUCKET_NAME/assets/**/*.js
gsutil -m setmeta -h "Cache-Control:public, max-age=31536000" gs://$BUCKET_NAME/assets/**/*.css
gsutil -m setmeta -h "Cache-Control:public, max-age=3600" gs://$BUCKET_NAME/index.html

# Load Balancerとバックエンドバケットの設定（カスタムドメイン用）
echo "🔧 ロードバランサーを設定しています..."

# バックエンドバケットの作成
gcloud compute backend-buckets create salon-frontend-backend \
    --gcs-bucket-name=$BUCKET_NAME \
    --enable-cdn \
    2>/dev/null || echo "バックエンドバケットは既に存在します"

# URLマップの作成
gcloud compute url-maps create salon-frontend-lb \
    --default-backend-bucket=salon-frontend-backend \
    2>/dev/null || echo "URLマップは既に存在します"

# HTTPプロキシの作成
gcloud compute target-http-proxies create salon-frontend-http-proxy \
    --url-map=salon-frontend-lb \
    2>/dev/null || echo "HTTPプロキシは既に存在します"

# グローバル転送ルールの作成
gcloud compute forwarding-rules create salon-frontend-http-rule \
    --global \
    --target-http-proxy=salon-frontend-http-proxy \
    --ports=80 \
    2>/dev/null || echo "転送ルールは既に存在します"

# IPアドレスを取得
FRONTEND_IP=$(gcloud compute forwarding-rules describe salon-frontend-http-rule --global --format="get(IPAddress)")

echo "
✅ デプロイが完了しました！

🌐 フロントエンドURL:
   - Cloud Storage直接: https://storage.googleapis.com/$BUCKET_NAME/index.html
   - Load Balancer経由: http://$FRONTEND_IP

📊 コスト見積もり（月額）:
   - Storage: ~$0.02/GB
   - 転送量: ~$0.12/GB（アジア内）
   - Load Balancer: ~$18/月（固定）
   - 予想総コスト: $18-20/月（Load Balancer使用時）
   - 予想総コスト: <$1/月（Storage直接アクセス時）

💡 コスト削減のため、Cloud Storage直接URLの使用を推奨します。

🔧 次のステップ:
   1. バックエンドのCORS設定を更新
   2. カスタムドメインが必要な場合は別途設定
"