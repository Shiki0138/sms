# 🚀 美容室統合管理システム - 本番デプロイメントガイド

## 📋 デプロイ前チェックリスト

### ✅ 完了済み項目
- [x] システム状態確認・品質評価（95/100）
- [x] TypeScriptコンパイルエラー修正
- [x] フロントエンドビルド成功確認
- [x] 環境変数・設定ファイル準備
- [x] PostgreSQL対応完了
- [x] Docker構成ファイル作成
- [x] 監視・アラートシステム設定

### ⚠️ デプロイ前に必要な設定

#### 1. 🔐 セキュリティ設定の変更
`.env.production` ファイルの以下の値を必ず変更してください：

```bash
# データベースパスワード
POSTGRES_PASSWORD=CHANGE_THIS_PASSWORD

# Redis パスワード
REDIS_PASSWORD=CHANGE_THIS_REDIS_PASSWORD

# JWT シークレット（128文字以上推奨）
JWT_SECRET=CHANGE_THIS_JWT_SECRET_TO_STRONG_RANDOM_STRING_128_CHARS_MINIMUM
JWT_REFRESH_SECRET=CHANGE_THIS_REFRESH_SECRET_TO_STRONG_RANDOM_STRING_128_CHARS_MINIMUM

# セッションシークレット
SESSION_SECRET=CHANGE_THIS_SESSION_SECRET_TO_STRONG_RANDOM_STRING_64_CHARS_MINIMUM

# 暗号化キー（32バイト）
ENCRYPTION_KEY=CHANGE_THIS_ENCRYPTION_KEY_TO_32_BYTE_STRING

# Grafana 管理者パスワード
GRAFANA_ADMIN_PASSWORD=CHANGE_THIS_GRAFANA_PASSWORD
```

#### 2. 🌐 ドメイン・CORS設定
```bash
# 本番ドメインに変更
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
```

#### 3. 🤖 外部API設定（オプション）
```bash
OPENAI_API_KEY=your_openai_api_key
LINE_CHANNEL_ACCESS_TOKEN=your_line_access_token
INSTAGRAM_ACCESS_TOKEN=your_instagram_access_token
```

## 🚀 デプロイ手順

### Step 1: 環境準備
```bash
# Docker & Docker Compose インストール確認
docker --version
docker compose --version

# システム要件確認
# - CPU: 2コア以上
# - RAM: 4GB以上
# - ディスク: 20GB以上
```

### Step 2: ソースコード準備
```bash
# プロジェクトディレクトリに移動
cd /path/to/salon-management-system

# 最新のソースコードを確認
git status
git pull origin master  # 必要に応じて
```

### Step 3: 環境設定ファイル編集
```bash
# 本番環境設定ファイルを編集
vim .env.production
# 上記のセキュリティ設定を必ず変更！
```

### Step 4: Docker イメージビルド
```bash
# 本番用イメージビルド
docker build -f Dockerfile.prod -t salon-management:production .

# ビルド成功確認
docker images | grep salon-management
```

### Step 5: 本番環境起動
```bash
# 本番環境でのシステム起動
docker compose -f docker-compose.prod.yml up -d

# 起動状況確認
docker compose -f docker-compose.prod.yml ps
```

### Step 6: データベース初期化
```bash
# データベースマイグレーション実行
docker compose -f docker-compose.prod.yml exec salon-app \
  sh -c "cd backend && npx prisma migrate deploy"

# 初期データ投入（必要に応じて）
docker compose -f docker-compose.prod.yml exec salon-app \
  sh -c "cd backend && npm run seed"
```

## 🩺 デプロイ後確認手順

### 1. ヘルスチェック
```bash
# システム全体のヘルスチェック
curl http://localhost/health
curl http://localhost/api/v1/system/health

# 期待レスポンス: HTTP 200 + "healthy" メッセージ
```

### 2. 主要機能確認
```bash
# API エンドポイント確認
curl http://localhost/api/v1/auth/health
curl http://localhost/api/v1/analytics/health

# フロントエンド確認
curl -I http://localhost/
# 期待レスポンス: HTTP 200
```

### 3. 監視システム確認
```bash
# Prometheus 確認
curl http://localhost:9090/-/healthy

# Grafana 確認
curl http://localhost:3000/api/health
```

### 4. パフォーマンステスト
```bash
# 負荷テスト実行（事前にインストール必要）
npm install -g artillery
artillery run tests/performance/load/api-load.test.js
```

## 📊 監視・運用

### アクセス先
- **メインアプリケーション**: http://localhost
- **Grafana ダッシュボード**: http://localhost:3000
- **Prometheus**: http://localhost:9090
- **API ドキュメント**: http://localhost/api/v1/docs

### 重要ログファイル
```bash
# アプリケーションログ
docker compose logs salon-app

# データベースログ
docker compose logs database

# 監視ログ
docker compose logs prometheus grafana
```

### バックアップ確認
```bash
# 自動バックアップ状況確認
docker compose logs backup

# バックアップファイル確認
ls -la ./backups/
```

## 🆘 トラブルシューティング

### よくある問題と解決方法

#### 1. データベース接続エラー
```bash
# データベースコンテナ状態確認
docker compose ps database

# 接続確認
docker compose exec database pg_isready -U salon_user
```

#### 2. メモリ不足
```bash
# メモリ使用状況確認
docker stats

# 不要コンテナの削除
docker system prune
```

#### 3. ポート競合
```bash
# ポート使用状況確認
netstat -tlnp | grep :80
netstat -tlnp | grep :4002

# 競合解決
sudo kill -9 <PID>
```

## 🔄 更新・メンテナンス

### システム更新手順
```bash
# 1. バックアップ作成
docker compose exec backup sh -c "pg_dump -h database -U salon_user salon_management > /backups/pre-update-$(date +%Y%m%d).sql"

# 2. 新バージョンデプロイ
git pull origin master
docker compose -f docker-compose.prod.yml down
docker build -f Dockerfile.prod -t salon-management:production .
docker compose -f docker-compose.prod.yml up -d

# 3. マイグレーション実行
docker compose exec salon-app sh -c "cd backend && npx prisma migrate deploy"

# 4. 動作確認
curl http://localhost/health
```

### 定期メンテナンス
```bash
# 週次: ログローテーション
docker compose exec salon-app sh -c "find /var/log -name '*.log' -mtime +7 -delete"

# 月次: システムリソース確認
docker system df
docker system prune -f
```

## 📞 サポート

### 緊急時連絡先
- **システム管理者**: admin@salon-system.com
- **技術サポート**: tech-support@salon-system.com
- **24時間サポートライン**: +81-XX-XXXX-XXXX

### 参考資料
- [ユーザーマニュアル](./USER_MANUAL_COMPLETE.md)
- [API ドキュメント](./docs/api.md)
- [品質レポート](./TEAM_C_QUALITY_REPORT.md)

---

**🎯 重要**: 本番環境では必ずHTTPS設定、SSL証明書の導入、ファイアウォール設定を行ってください。

**📅 作成日**: 2024年12月15日  
**👥 作成者**: チームC - QA・デプロイチーム  
**📋 ステータス**: ✅ 本番デプロイ準備完了