# Docker Deployment Guide

美容室統合管理システムのDocker環境でのデプロイメントガイドです。

## 📋 前提条件

- Docker 20.10+
- Docker Compose 2.0+
- Git
- 2GB以上のメモリ

## 🚀 クイックスタート

### 開発環境

```bash
# リポジトリをクローン
git clone <repository-url>
cd salon-management-system

# 開発環境で起動
docker-compose up -d

# または専用スクリプトを使用
./scripts/deploy.sh development
```

### 本番環境

```bash
# 本番環境設定ファイルを編集
cp .env.production .env.production.local
nano .env.production.local

# 本番環境で起動
./scripts/deploy.sh production
```

## 🏗️ アーキテクチャ

```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │────│   Nginx LB      │
│   (React)       │    │   (Port 80/443) │
└─────────────────┘    └─────────────────┘
                                │
                       ┌─────────────────┐
                       │   Backend API   │
                       │   (Node.js)     │
                       └─────────────────┘
                                │
                ┌───────────────┴───────────────┐
           ┌─────────────┐              ┌─────────────┐
           │ PostgreSQL  │              │   Redis     │
           │ (Database)  │              │  (Cache)    │
           └─────────────┘              └─────────────┘
```

## 📁 サービス構成

| サービス | ポート | 説明 |
|---------|--------|-----|
| frontend | 80, 443 | React フロントエンド |
| backend | 4002 | Node.js API サーバー |
| postgres | 5432 | PostgreSQL データベース |
| redis | 6379 | Redis キャッシュ |
| pgadmin | 8080 | データベース管理 (開発時のみ) |

## 🔧 設定

### 環境変数

#### 必須設定項目 (本番環境)

```bash
# セキュリティ (必ず変更してください!)
JWT_SECRET="your-256-bit-secret-key"
JWT_REFRESH_SECRET="your-different-256-bit-refresh-key"
SESSION_SECRET="your-session-secret-key"

# データベース
DATABASE_URL="postgresql://user:password@postgres:5432/dbname"

# Redis
REDIS_URL="redis://redis:6379"
```

#### オプション設定

```bash
# SSL/TLS
USE_HTTPS="true"
SSL_CERT_PATH="/etc/ssl/certs/salon.crt"
SSL_KEY_PATH="/etc/ssl/private/salon.key"

# 外部API
GOOGLE_CLIENT_ID="your-google-client-id"
TWILIO_ACCOUNT_SID="your-twilio-sid"
SENDGRID_API_KEY="your-sendgrid-key"

# 監視
ENABLE_METRICS="true"
```

## 🔐 セキュリティ

### 本番環境でのセキュリティ対策

1. **シークレットキーの変更**
   ```bash
   # 強力なランダムキーを生成
   openssl rand -base64 64
   ```

2. **SSL/TLS証明書の設定**
   ```bash
   # Let's Encryptを使用する場合
   certbot --nginx -d yourdomain.com
   ```

3. **ファイアウォール設定**
   ```bash
   # 必要なポートのみ開放
   ufw allow 80/tcp
   ufw allow 443/tcp
   ufw deny 5432/tcp  # PostgreSQLへの外部アクセスを拒否
   ```

### セキュリティヘッダー

Nginxで以下のセキュリティヘッダーを設定済み：
- X-Frame-Options
- X-XSS-Protection
- X-Content-Type-Options
- Referrer-Policy
- Content-Security-Policy

## 📊 監視とロギング

### ヘルスチェック

```bash
# 全サービスのヘルスチェック
curl http://localhost/health
curl http://localhost:4002/health

# 個別サービスの確認
docker-compose ps
docker-compose logs backend
```

### 監視システム (オプション)

```bash
# Prometheus + Grafana を有効化
docker-compose --profile monitoring up -d

# アクセス
# Prometheus: http://localhost:9090
# Grafana: http://localhost:3000 (admin/admin123)
```

### ログ管理

```bash
# ログの確認
docker-compose logs -f backend
docker-compose logs -f frontend

# ログローテーション設定
# /etc/docker/daemon.json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

## 🔄 デプロイメント

### 通常のデプロイ

```bash
# 最新コードをプル
git pull origin main

# サービスを再構築
docker-compose build --no-cache
docker-compose up -d

# またはスクリプトを使用
./scripts/deploy.sh production
```

### ゼロダウンタイムデプロイ

```bash
# Blue-Greenデプロイメント
docker-compose -f docker-compose.yml -f docker-compose.blue.yml up -d
# トラフィックを切り替え
docker-compose -f docker-compose.yml -f docker-compose.green.yml up -d
```

### ロールバック

```bash
# 前のバージョンに戻す
git checkout <previous-commit>
docker-compose up -d --build

# またはイメージタグを指定
docker-compose pull salon_backend:previous-tag
docker-compose up -d
```

## 💾 バックアップ

### データベースバックアップ

```bash
# 自動バックアップスクリプト
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T postgres pg_dump -U salon_user salon_management > backup_${DATE}.sql

# リストア
docker-compose exec -T postgres psql -U salon_user salon_management < backup_20240101_120000.sql
```

### ボリュームバックアップ

```bash
# データボリュームのバックアップ
docker run --rm -v salon_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .

# リストア
docker run --rm -v salon_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres_backup.tar.gz -C /data
```

## 🐛 トラブルシューティング

### よくある問題

1. **ポート競合**
   ```bash
   # 使用中のポートを確認
   netstat -tulpn | grep :4002
   
   # ポートを変更するか、プロセスを停止
   ```

2. **メモリ不足**
   ```bash
   # メモリ使用量確認
   docker stats
   
   # 不要なコンテナ・イメージを削除
   docker system prune -a
   ```

3. **データベース接続エラー**
   ```bash
   # PostgreSQLの状態確認
   docker-compose logs postgres
   
   # コンテナ再起動
   docker-compose restart postgres
   ```

4. **SSL証明書エラー**
   ```bash
   # 証明書の確認
   openssl x509 -in /path/to/cert.pem -text -noout
   
   # 証明書の更新
   certbot renew
   ```

### ログ分析

```bash
# エラーログのフィルタリング
docker-compose logs backend | grep ERROR

# 特定期間のログ
docker-compose logs --since 2024-01-01T00:00:00 backend

# リアルタイムログ監視
docker-compose logs -f --tail 100 backend
```

## 📈 パフォーマンス最適化

### リソース制限

```yaml
# docker-compose.yml での設定例
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### キャッシュ戦略

```bash
# Redis の最適化
redis-cli CONFIG SET maxmemory 256mb
redis-cli CONFIG SET maxmemory-policy allkeys-lru

# Docker イメージの最適化
# Multi-stage builds を使用
# .dockerignore の活用
```

## 🔄 アップデート

### システムアップデート

```bash
# 定期的なアップデート
./scripts/update.sh

# セキュリティアップデート
docker-compose pull
docker-compose up -d
```

### データベース移行

```bash
# Prisma マイグレーション
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npx prisma generate
```

## 📞 サポート

問題が発生した場合：

1. ログを確認: `docker-compose logs`
2. ヘルスチェック: `curl http://localhost:4002/health`
3. コンテナ状態: `docker-compose ps`
4. システムリソース: `docker stats`

その他の問題については、プロジェクトのIssueページで報告してください。