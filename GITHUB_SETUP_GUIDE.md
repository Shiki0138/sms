# 🚀 GitHub セットアップガイド

## 📋 GitHub リポジトリ設定

### 1. リポジトリ作成
```bash
# GitHubで新規リポジトリ作成
# リポジトリ名: salon-management-system
# 説明: AI搭載の次世代美容室統合管理システム
# Public/Private: お好みで選択

# ローカルリポジトリと連携
cd /Users/MBP/salon-management-system
git remote add origin https://github.com/YOUR_USERNAME/salon-management-system.git
```

### 2. GitHub Secrets 設定

GitHub リポジトリの Settings > Secrets and variables > Actions から以下を追加：

#### 必須シークレット
- `GCP_SA_KEY` - GCPサービスアカウントキー（JSON形式）
- `SLACK_WEBHOOK` - Slack通知用Webhook URL（オプション）

#### GCPサービスアカウントの作成
```bash
export PATH="/usr/local/bin:$PATH"
PROJECT_ID="salon-system-1750113683"

# サービスアカウント作成
gcloud iam service-accounts create github-actions \
  --description="GitHub Actions deployment" \
  --display-name="GitHub Actions" \
  --project=${PROJECT_ID}

# 必要な権限を付与
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:github-actions@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:github-actions@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:github-actions@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/cloudsql.client"

gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:github-actions@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# キーを生成
gcloud iam service-accounts keys create ~/github-actions-key.json \
  --iam-account=github-actions@${PROJECT_ID}.iam.gserviceaccount.com \
  --project=${PROJECT_ID}

# キーの内容をGitHub Secretsに登録
cat ~/github-actions-key.json
# この内容をコピーして GCP_SA_KEY として登録

# キーファイルを削除（セキュリティのため）
rm ~/github-actions-key.json
```

### 3. APIキーの管理

#### Secret Manager への登録（本番環境）
```bash
# 各種APIキーを Secret Manager に登録
echo -n "YOUR_OPENAI_API_KEY" | gcloud secrets create openai-api-key --data-file=- --project=${PROJECT_ID}
echo -n "YOUR_JWT_SECRET" | gcloud secrets create jwt-secret --data-file=- --project=${PROJECT_ID}
echo -n "YOUR_JWT_REFRESH_SECRET" | gcloud secrets create jwt-refresh-secret --data-file=- --project=${PROJECT_ID}
```

## 🔄 デプロイフロー

### 自動デプロイ
1. `main` または `production` ブランチにプッシュ
2. GitHub Actions が自動的にビルド・デプロイ
3. Slack通知（設定済みの場合）

### 手動デプロイ
1. GitHub Actions タブから
2. "Deploy to Google Cloud" ワークフロー選択
3. "Run workflow" ボタンをクリック

## 🔐 セキュリティベストプラクティス

### してはいけないこと ❌
- APIキーをコードに直接記述
- `.env` ファイルをコミット
- シークレット情報をログ出力

### すべきこと ✅
- すべての機密情報は Secret Manager で管理
- `.gitignore` で環境ファイルを除外
- 定期的なキーローテーション

## 📁 推奨ブランチ戦略

```
main (or master)
├── develop          # 開発ブランチ
├── feature/*        # 機能開発
├── hotfix/*         # 緊急修正
└── release/*        # リリース準備
```

## 🚀 初回プッシュ

```bash
# 既存のコミットがある場合
git add .
git commit -m "feat: 美容室管理システム完全版 with GCP deployment"
git branch -M main
git push -u origin main

# 新規の場合
git init
git add .
git commit -m "Initial commit: 美容室管理システム"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/salon-management-system.git
git push -u origin main
```

## 📊 GitHub Pages（ドキュメント公開）

```bash
# docs フォルダにドキュメントを配置
mkdir docs
cp USER_MANUAL_COMPLETE.md docs/index.md

# GitHub Pages を有効化
# Settings > Pages > Source: Deploy from a branch
# Branch: main, Folder: /docs
```

## 🔗 便利なGitHub機能

1. **Issues** - バグ報告・機能要望
2. **Projects** - タスク管理
3. **Wiki** - ドキュメント管理
4. **Discussions** - コミュニティ
5. **Actions** - CI/CD
6. **Packages** - Dockerイメージ管理

## 📝 README.md 推奨構成

```markdown
# 美容室統合管理システム

## 概要
AI搭載の次世代美容室管理システム

## 機能
- 予約管理
- 顧客管理
- AI自動返信
- 分析ダッシュボード

## デプロイ
[![Deploy to GCP](https://github.com/YOUR_USERNAME/salon-management-system/actions/workflows/deploy-gcp.yml/badge.svg)](https://github.com/YOUR_USERNAME/salon-management-system/actions/workflows/deploy-gcp.yml)

## ライセンス
MIT
```