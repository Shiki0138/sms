# GitHub Actions Workflows

## アクティブなワークフロー

### 🚀 deploy-production.yml
- **トリガー**: main/masterブランチへのプッシュ
- **内容**: GCPへの本番環境デプロイ
- **必要なSecrets**:
  - `GCP_SERVICE_ACCOUNT_KEY`
  - `STRIPE_PUBLISHABLE_KEY`
  - 各種APIキー（LINE, Instagram, OpenAI等）

### 🧪 test.yml
- **トリガー**: 全ブランチへのプッシュ、PR
- **内容**: 包括的なテストスイート実行

### 🔍 ci.yml
- **トリガー**: 全ブランチへのプッシュ、PR
- **内容**: コード品質チェック、ビルドテスト

### 🎭 deploy-staging.yml
- **トリガー**: developブランチへのプッシュ
- **内容**: ステージング環境へのデプロイ

### ☁️ deploy-gcp.yml
- **トリガー**: 手動実行
- **内容**: GCP環境への汎用デプロイ

## 無効化されたワークフロー

### ❌ deploy.yml.disabled
- DockerHubを使用する古いワークフロー
- deploy-production.ymlで置き換え済み