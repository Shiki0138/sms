#!/bin/bash

# 最適化されたCloud Runデプロイ設定（月額$30以内）

gcloud run deploy salon-backend \
  --source . \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --memory 256Mi \
  --cpu 0.5 \
  --min-instances 0 \
  --max-instances 2 \
  --concurrency 100 \
  --timeout 60 \
  --set-env-vars JWT_SECRET=fixed-secret-key-for-demo \
  --execution-environment gen2

echo "最適化されたCloud Run設定完了"
echo "予想月額コスト: $8-15"
echo ""
echo "設定内容:"
echo "- メモリ: 256Mi（最小）"
echo "- CPU: 0.5（最小）"
echo "- 最小インスタンス: 0（コールドスタートあり）"
echo "- 最大インスタンス: 2"
echo "- 同時実行数: 100"