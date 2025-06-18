# 🔐 GitHub Secrets設定ガイド

このプロジェクトのCI/CDパイプラインに必要なGitHub Secretsの設定方法を説明します。

## 📋 必須Secrets

### 🔐 GCPデプロイ用
```
GCP_SERVICE_ACCOUNT_KEY
```
- **説明**: GitHub ActionsがGCPにアクセスするためのサービスアカウントキー
- **取得方法**: 
  ```bash
  # サービスアカウント作成
  gcloud iam service-accounts create github-actions \
    --description="GitHub Actions deployment" \
    --display-name="GitHub Actions" \
    --project=salon-system-1750113683

  # 権限付与
  gcloud projects add-iam-policy-binding salon-system-1750113683 \
    --member="serviceAccount:github-actions@salon-system-1750113683.iam.gserviceaccount.com" \
    --role="roles/run.admin"

  gcloud projects add-iam-policy-binding salon-system-1750113683 \
    --member="serviceAccount:github-actions@salon-system-1750113683.iam.gserviceaccount.com" \
    --role="roles/storage.admin"

  gcloud projects add-iam-policy-binding salon-system-1750113683 \
    --member="serviceAccount:github-actions@salon-system-1750113683.iam.gserviceaccount.com" \
    --role="roles/cloudsql.client"

  gcloud projects add-iam-policy-binding salon-system-1750113683 \
    --member="serviceAccount:github-actions@salon-system-1750113683.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"

  # キーファイル作成
  gcloud iam service-accounts keys create github-actions-key.json \
    --iam-account=github-actions@salon-system-1750113683.iam.gserviceaccount.com
  ```
- **設定値**: `github-actions-key.json`の内容をそのまま貼り付け

### 💳 Stripe設定
```
STRIPE_PUBLISHABLE_KEY
STRIPE_PUBLISHABLE_KEY_TEST
```
- **説明**: Stripe決済システム用の公開可能キー
- **本番用**: `pk_live_...` で始まるキー
- **テスト用**: `pk_test_...` で始まるキー
- **取得方法**: [Stripe Dashboard](https://dashboard.stripe.com/apikeys) から取得

### 🗄️ データベース設定
```
TEST_DATABASE_URL
DATABASE_URL_STAGING
```
- **説明**: テスト・ステージング用データベース接続URL
- **形式**: `postgresql://username:password@host:port/database`
- **テスト用**: ローカルまたは専用テストDB
- **ステージング用**: ステージング環境専用DB

### 🌐 Cloud Run設定
```
GCP_CLOUD_RUN_URL_SUFFIX
```
- **説明**: Cloud RunのURL末尾（地域固有）
- **例**: `12345abcde-an.a.run.app`
- **取得方法**: Cloud Run地域のデフォルトドメイン確認

## 🔧 オプショナルSecrets

### 🔍 セキュリティ監視
```
SNYK_TOKEN
```
- **説明**: Snykセキュリティスキャン用トークン
- **取得方法**: [Snyk](https://app.snyk.io/) でアカウント作成後、APIトークンを生成

### 📊 監視・通知
```
SLACK_WEBHOOK_URL
DISCORD_WEBHOOK_URL
```
- **説明**: デプロイ結果通知用Webhook URL
- **設定**: 各サービスでWebhook URLを生成

## 🚀 設定手順

### 1. GitHubリポジトリのSecrets設定
1. GitHubリポジトリページに移動
2. `Settings` → `Secrets and variables` → `Actions`
3. `New repository secret` をクリック
4. Name（シークレット名）とSecret（値）を入力
5. `Add secret` をクリック

### 2. Environment Secrets設定
本番環境とステージング環境で異なる値を使用する場合：

1. `Settings` → `Environments`
2. `New environment` で `production`, `staging` を作成
3. 各環境でEnvironment secretsを設定

### 3. GCP Secret Manager設定
機密情報はGCP Secret Managerでも管理：

```bash
# プロジェクトID設定
export PROJECT_ID="salon-system-1750113683"

# JWT Secrets
echo -n "$(openssl rand -base64 64)" | gcloud secrets create jwt-secret --data-file=- --project=${PROJECT_ID}
echo -n "$(openssl rand -base64 64)" | gcloud secrets create jwt-refresh-secret --data-file=- --project=${PROJECT_ID}

# OpenAI API Key
echo -n "YOUR_OPENAI_API_KEY" | gcloud secrets create openai-api-key --data-file=- --project=${PROJECT_ID}

# LINE API
echo -n "YOUR_LINE_CHANNEL_ACCESS_TOKEN" | gcloud secrets create line-channel-access-token --data-file=- --project=${PROJECT_ID}
echo -n "YOUR_LINE_CHANNEL_SECRET" | gcloud secrets create line-channel-secret --data-file=- --project=${PROJECT_ID}

# Instagram API
echo -n "YOUR_INSTAGRAM_ACCESS_TOKEN" | gcloud secrets create instagram-access-token --data-file=- --project=${PROJECT_ID}

# ステージング用データベース
echo -n "postgresql://user:pass@host:port/db_staging" | gcloud secrets create database-url-staging --data-file=- --project=${PROJECT_ID}
```

## 🔐 セキュリティベストプラクティス

### ✅ DO
- 定期的にシークレットをローテーション
- 最小権限の原則に従う
- 環境ごとに異なるシークレットを使用
- Secret Manager使用を推奨

### ❌ DON'T
- シークレットをコードに直接記述
- 本番用シークレットをテスト環境で使用
- 不要な権限を付与
- 古いシークレットを放置

## 🚨 緊急時対応

### シークレット漏洩時の対応
1. **即座に無効化**: 漏洩したキー・シークレットを無効化
2. **新しいシークレット生成**: 新しい値を生成・設定
3. **アクセスログ確認**: 不正使用がないか確認
4. **関係者通知**: チームメンバーに状況を共有

### 復旧手順
1. `Settings` → `Secrets and variables` → `Actions`
2. 対象のシークレットを削除
3. 新しい値で再作成
4. 必要に応じてワークフローを再実行

## 📞 サポート

設定に関する質問や問題が発生した場合：
1. このドキュメントを確認
2. GCP・GitHub・Stripeの公式ドキュメントを参照
3. チーム内で情報共有

---

**⚠️ 重要**: このドキュメント自体にはシークレットの実際の値を記載しないでください。