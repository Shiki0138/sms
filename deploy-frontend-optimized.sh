#!/bin/bash

# 最適化されたCloud Storageデプロイ

BUCKET_NAME="salon-frontend-optimized"
PROJECT_ID="salon-management-prod"

# バケット作成（低コストストレージクラス）
gsutil mb -p $PROJECT_ID -c STANDARD -l asia-northeast1 gs://$BUCKET_NAME

# ライフサイクル設定（コスト削減）
gsutil lifecycle set - gs://$BUCKET_NAME <<EOF
{
  "lifecycle": {
    "rule": [
      {
        "action": {"type": "SetStorageClass", "storageClass": "NEARLINE"},
        "condition": {"age": 7}
      }
    ]
  }
}
EOF

# フロントエンドをビルドしてアップロード
cd frontend
npm run build

# ファイルのアップロード（キャッシュ設定付き）
gsutil -m cp -r dist/* gs://$BUCKET_NAME

# キャッシュ設定
gsutil -m setmeta -h "Cache-Control:public, max-age=31536000" gs://$BUCKET_NAME/assets/*
gsutil -m setmeta -h "Cache-Control:public, max-age=3600" gs://$BUCKET_NAME/index.html

# 公開設定
gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME

# ウェブサイト設定
gsutil web set -m index.html -e index.html gs://$BUCKET_NAME

echo "最適化されたCloud Storage設定完了"
echo "URL: https://storage.googleapis.com/$BUCKET_NAME/index.html"
echo "予想月額コスト: $1-3"