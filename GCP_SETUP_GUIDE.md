# 🚀 GCP美容室管理システム デプロイガイド

## 📋 事前準備

### 1. Google Cloud Platform アカウント作成
1. https://cloud.google.com/ にアクセス
2. 「無料で開始」をクリック
3. Googleアカウントでログイン
4. **$300の無料クレジット取得**
5. 請求先アカウント設定

### 2. プロジェクト作成
1. [GCPコンソール](https://console.cloud.google.com/)にアクセス
2. 「プロジェクトを作成」
3. プロジェクト名: `salon-management-prod`
4. プロジェクトIDをメモ

### 3. Google Cloud CLI インストール
```bash
# Mac
brew install --cask google-cloud-sdk

# Windows
# https://cloud.google.com/sdk/docs/install からダウンロード

# 認証
gcloud auth login
gcloud config set project salon-management-prod
```

## 🚀 自動デプロイ実行

### ワンクリックデプロイ
```bash
cd /Users/MBP/salon-management-system
./deploy-gcp.sh
```

### 手動デプロイ手順

#### ステップ1: APIを有効化
```bash
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    sql-component.googleapis.com \
    storage.googleapis.com
```

#### ステップ2: Cloud SQL作成
```bash
# PostgreSQLインスタンス作成（約10分）
gcloud sql instances create salon-db-production \
    --database-version=POSTGRES_15 \
    --tier=db-custom-2-8192 \
    --region=asia-northeast1 \
    --storage-size=100GB

# データベース作成
gcloud sql databases create salon_management_production \
    --instance=salon-db-production
```

#### ステップ3: バックエンドデプロイ
```bash
cd backend
gcloud builds submit --tag gcr.io/salon-management-prod/salon-backend

gcloud run deploy salon-backend \
    --image gcr.io/salon-management-prod/salon-backend \
    --region asia-northeast1 \
    --allow-unauthenticated
```

#### ステップ4: フロントエンドデプロイ
```bash
cd frontend
npm run build
gsutil mb gs://salon-management-prod-frontend
gsutil -m cp -r dist/* gs://salon-management-prod-frontend
```

## 💰 コスト管理

### 月額費用見積もり（200店舗）
- **Cloud Run**: ¥15,000
- **Cloud SQL**: ¥12,000  
- **Cloud Storage**: ¥2,000
- **データ転送**: ¥3,000
- **合計**: **¥32,000/月**

### コスト最適化設定
```bash
# 予算アラート設定
gcloud billing budgets create \
    --billing-account=YOUR_BILLING_ACCOUNT \
    --display-name="Salon System Budget" \
    --budget-amount=40000JPY \
    --threshold-percent=80,90,100
```

## 🔧 運用・監視

### 1. ログ監視
```bash
# Cloud Runログ
gcloud logs read "resource.type=cloud_run_revision" --limit 50

# データベースログ
gcloud logs read "resource.type=gce_instance" --filter="salon-db" --limit 20
```

### 2. パフォーマンス監視
- [Cloud Monitoring](https://console.cloud.google.com/monitoring)
- [Cloud SQL Insights](https://console.cloud.google.com/sql/insights)

### 3. 自動バックアップ確認
```bash
gcloud sql backups list --instance=salon-db-production
```

## 🌐 独自ドメイン設定

### 1. ドメイン取得
- Google Domains
- お名前.com
- など

### 2. Cloud DNS設定
```bash
# DNSゾーン作成
gcloud dns managed-zones create salon-zone \
    --description="Salon Management System" \
    --dns-name="your-salon-domain.jp"

# レコード設定
gcloud dns record-sets transaction start --zone=salon-zone
gcloud dns record-sets transaction add \
    --zone=salon-zone \
    --name="app.your-salon-domain.jp" \
    --type=CNAME \
    --ttl=300 \
    "ghs.googlehosted.com."
```

### 3. SSL証明書（自動）
Cloud RunとCloud Storageで自動的にSSL証明書が設定されます。

## 🔒 セキュリティ設定

### 1. IAM設定
```bash
# 最小権限の原則
gcloud projects add-iam-policy-binding salon-management-prod \
    --member="user:admin@your-salon-domain.jp" \
    --role="roles/editor"
```

### 2. VPCファイアウォール
```bash
# 必要なポートのみ開放
gcloud compute firewall-rules create allow-salon-backend \
    --allow tcp:8080 \
    --source-ranges 0.0.0.0/0 \
    --description "Salon backend access"
```

## 🚨 トラブルシューティング

### よくある問題

1. **API有効化エラー**
   ```bash
   gcloud services enable cloudbuild.googleapis.com
   ```

2. **権限エラー**
   ```bash
   gcloud auth application-default login
   ```

3. **Cloud SQLアクセスエラー**
   - Cloud SQL Admin APIが有効か確認
   - 正しいデータベース接続文字列を使用

4. **メモリ不足エラー**
   ```bash
   # Cloud Runメモリ増量
   gcloud run services update salon-backend \
       --memory 4Gi \
       --region asia-northeast1
   ```

## 📞 サポート

### GCPサポート
- [技術サポート](https://cloud.google.com/support/)
- [コミュニティ](https://cloud.google.com/community/)
- [ドキュメント](https://cloud.google.com/docs/)

### システム固有の問題
- [GitHub Issues](https://github.com/your-repo/salon-management/issues)

---

🎉 **200店舗規模の美容室管理システムが稼働開始します！**