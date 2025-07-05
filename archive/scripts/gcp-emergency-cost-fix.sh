#!/bin/bash

# Google Cloud 緊急コスト削減スクリプト
# 目標: 月額$20以下

set -e

echo "🚨 Google Cloud 緊急コスト削減を開始します"

# プロジェクトIDを設定（実際のIDに変更してください）
PROJECT_ID="gen-lang-client-0545259967"

# 1. 現在のCloud SQLインスタンスを確認
echo "📊 現在のCloud SQLインスタンスを確認中..."
gcloud sql instances list --project=$PROJECT_ID

# 2. 高額なCloud SQLインスタンスを停止
echo "⛔ Cloud SQLインスタンスを停止中..."
# 注意: インスタンス名を実際の名前に変更してください
INSTANCE_NAME="your-instance-name"

# まずはインスタンスの詳細を確認
echo "詳細情報:"
gcloud sql instances describe $INSTANCE_NAME --project=$PROJECT_ID || true

# 3. 無料枠に収まる最小構成に変更
echo "💰 最小構成への変更オプション:"
cat << EOF

=== オプション1: 完全停止（推奨） ===
# データをエクスポートしてから削除
gcloud sql export sql $INSTANCE_NAME gs://your-bucket/backup.sql --database=your-db
gcloud sql instances delete $INSTANCE_NAME

=== オプション2: 最小構成に変更 ===
# db-f1-microに変更（月額$10程度）
gcloud sql instances patch $INSTANCE_NAME \\
  --tier=db-f1-micro \\
  --no-backup \\
  --no-require-ssl

=== オプション3: 開発用はローカルSQLiteを使用 ===
# Cloud SQLは本番環境のみ使用
EOF

# 4. 予算アラートの設定（$15で警告、$20で停止）
echo "🔔 予算アラートを設定中..."
cat > budget-alert.yaml << EOF
displayName: "Salon System Budget Alert"
budgetFilter:
  projects:
    - "projects/$PROJECT_ID"
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
  disableDefaultIamRecipients: false
  monitoringNotificationChannels: []
EOF

# 5. 使用していないリソースの確認
echo "🗑️ 使用していないリソースを確認中..."
echo "=== 未使用のディスク ==="
gcloud compute disks list --filter="users:[]" --project=$PROJECT_ID

echo "=== 未使用の静的IP ==="
gcloud compute addresses list --filter="status=RESERVED" --project=$PROJECT_ID

echo "=== 大きなCloud Storageバケット ==="
gsutil du -sh gs://*

echo "
🎯 推奨アクション:
1. Cloud SQLを即座に停止または削除
2. 開発環境ではSQLiteを使用
3. 本番環境でのみCloud SQLを使用（必要時のみ起動）
4. 予算上限を$20に設定

実行するには上記のコマンドをコピーして実行してください。
"