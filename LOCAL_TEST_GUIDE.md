# ローカルテスト環境セットアップガイド

美容室統合管理システムをローカル環境でテストするためのガイドです。

## 🚀 クイックスタート

### 1. 前提条件の確認

```bash
# Node.js バージョン確認
node --version  # v18.0.0 以上

# npm バージョン確認
npm --version   # v8.0.0 以上
```

### 2. 依存関係のインストール

```bash
# バックエンドディレクトリに移動
cd /Users/MBP/salon-management-system/backend

# 依存関係をインストール
npm install

# Prismaクライアントを生成
npx prisma generate

# データベースを初期化
npx prisma db push
```

### 3. 環境設定

既存の `.env` ファイルが設定済みです：

```bash
DATABASE_URL="file:./dev.db"
PORT=4002
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production-make-it-long-and-random"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-this-in-production-make-it-different"
ACCESS_TOKEN_EXPIRY="15m"
REFRESH_TOKEN_EXPIRY="7d"
SESSION_SECRET="your-super-secret-session-key-change-this-in-production-for-2fa-setup"
RATE_LIMIT_WINDOW_MS="900000"
RATE_LIMIT_MAX_REQUESTS="100"
NODE_ENV="development"
```

### 4. サーバー起動

3つの起動モードが利用可能です：

#### シンプルモード（推奨 - 基本機能テスト）
```bash
npm run dev-simple
```

#### 完全版モード（全機能テスト）
```bash
npm run dev
```

#### デモモード（既存のデモ版）
```bash
npm run dev-demo
```

## 📋 テスト手順

### 1. ヘルスチェック

サーバー起動後、以下のURLにアクセス：

```
http://localhost:4002/health
```

期待される応答：
```json
{
  "status": "OK",
  "timestamp": "2025-06-12T14:55:26.123Z",
  "version": "v1",
  "message": "Salon Management API - Simple Test Mode",
  "database": "Connected"
}
```

### 2. API エンドポイントテスト

#### 自動テストスクリプト実行
```bash
# テストスクリプトを実行
node test-api.js
```

#### 手動テスト - 顧客管理API

```bash
# 顧客一覧取得
curl -X GET "http://localhost:4002/api/v1/customers"

# 新規顧客作成
curl -X POST "http://localhost:4002/api/v1/customers" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "山田太郎",
    "phone": "090-1234-5678",
    "email": "yamada@example.com"
  }'

# 顧客詳細取得
curl -X GET "http://localhost:4002/api/v1/customers/{customer_id}"
```

#### メッセージ管理API

```bash
# メッセージスレッド一覧
curl -X GET "http://localhost:4002/api/v1/threads"

# 新規メッセージ送信
curl -X POST "http://localhost:4002/api/v1/threads/{thread_id}/messages" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "こんにちは！ご予約の件でご連絡いたします。",
    "senderType": "STAFF"
  }'
```

#### 予約管理API

```bash
# 予約一覧取得
curl -X GET "http://localhost:4002/api/v1/reservations"

# 新規予約作成
curl -X POST "http://localhost:4002/api/v1/reservations" \
  -H "Content-Type: application/json" \
  -d '{
    "startTime": "2025-06-15T10:00:00Z",
    "endTime": "2025-06-15T11:00:00Z",
    "customerName": "田中花子",
    "customerPhone": "090-9876-5432",
    "menuContent": "カット + カラー",
    "source": "MANUAL"
  }'
```

### 3. ブラウザでのテスト

以下のURLをブラウザで開いてJSONレスポンスを確認：

1. **ヘルスチェック**: http://localhost:4002/health
2. **顧客一覧**: http://localhost:4002/api/v1/customers
3. **メッセージスレッド**: http://localhost:4002/api/v1/threads
4. **予約一覧**: http://localhost:4002/api/v1/reservations
5. **タグ一覧**: http://localhost:4002/api/v1/tags

## 🔧 開発ツール

### データベース管理

```bash
# Prisma Studio でデータベースを視覚的に管理
npx prisma studio
```

ブラウザで http://localhost:5555 が開きます。

### ログの確認

サーバーログはターミナルにリアルタイムで表示されます：

```
2025-06-12 23:55:26 [info]: 🚀 Server is running on port 4002
2025-06-12 23:55:26 [info]: 📋 Health check: http://localhost:4002/health
2025-06-12 23:55:26 [info]: 💾 Database: SQLite (Connected)
```

## 🐛 トラブルシューティング

### ポート競合エラー

```bash
# ポート4002を使用しているプロセスを確認
lsof -i :4002

# プロセスを終了
kill -9 {PID}
```

### データベース接続エラー

```bash
# データベースを再初期化
rm dev.db
npx prisma db push
```

### 依存関係エラー

```bash
# node_modules を削除して再インストール
rm -rf node_modules package-lock.json
npm install
```

## 📊 機能テスト項目

### ✅ 基本機能（Simple Mode で確認）

- [ ] サーバー起動
- [ ] ヘルスチェック
- [ ] 顧客CRUD操作
- [ ] メッセージスレッド管理
- [ ] 予約管理
- [ ] タグ管理

### ✅ 高度な機能（Complete Mode で確認）

- [ ] JWT認証システム
- [ ] リアルタイム通知
- [ ] 自動メッセージ送信
- [ ] AIメニュー推奨
- [ ] 分析ダッシュボード
- [ ] セキュリティ機能

## 📝 APIドキュメント

### 主要エンドポイント

| エンドポイント | メソッド | 説明 |
|-------------|---------|------|
| `/health` | GET | ヘルスチェック |
| `/api/v1/customers` | GET, POST | 顧客管理 |
| `/api/v1/customers/{id}` | GET, PUT, DELETE | 個別顧客操作 |
| `/api/v1/threads` | GET, POST | メッセージスレッド |
| `/api/v1/threads/{id}/messages` | GET, POST | メッセージ操作 |
| `/api/v1/reservations` | GET, POST | 予約管理 |
| `/api/v1/tags` | GET, POST | タグ管理 |

### レスポンス形式

成功時：
```json
{
  "success": true,
  "data": { ... },
  "message": "操作が完了しました"
}
```

エラー時：
```json
{
  "success": false,
  "error": "エラーメッセージ",
  "details": { ... }
}
```

## 🚀 次のステップ

ローカルテストが完了したら：

1. **フロントエンド連携テスト**
2. **Docker環境でのテスト**
3. **本番環境デプロイ準備**

---

## 💡 ヒント

- 開発中は `npm run dev-simple` を使用することを推奨
- データベースの変更後は `npx prisma db push` を実行
- 新しい機能のテストは Prisma Studio で データを確認
- エラーが発生した場合は、ログを詳しく確認