# テスト環境セットアップガイド

## 🚀 統合メッセージ管理システム - APIテストガイド

このシステムは美容室向けのSaaS統合管理システムです。LINE公式アカウントとInstagram DMからのメッセージを一元管理し、予約管理機能も提供します。

## 📋 実装済み機能

### ✅ 認証・認可システム
- JWT認証
- ロールベース認可（ADMIN/MANAGER/STAFF）
- マルチテナント対応

### ✅ 顧客管理
- 顧客CRUD操作
- タグ管理
- 来店履歴追跡
- Instagram・LINE IDとの連携

### ✅ **統合メッセージ管理**
- **LINE公式アカウントからのメッセージ受信・送信**
- **Instagram DMからのメッセージ受信・送信**
- **統合インボックス表示**
- スレッド管理
- 既読管理
- Webhook対応

### ✅ 予約管理
- 予約CRUD操作
- ホットペッパービューティーCSVインポート
- Google Calendar同期
- ダブルブッキング検出

## 🛠 テスト手順

### 1. サーバー起動確認
```bash
curl http://localhost:4001/health
```

### 2. 認証テスト

#### 管理者アカウント作成
```bash
curl -X POST http://localhost:4001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@salon.test",
    "password": "AdminPass123!",
    "name": "システム管理者",
    "tenantId": "test-tenant-id",
    "role": "ADMIN"
  }'
```

#### ログイン
```bash
curl -X POST http://localhost:4001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@salon.test",
    "password": "AdminPass123!"
  }'
```

**※ 取得したJWTトークンを以下の`YOUR_JWT_TOKEN`部分に設定してください**

### 3. 顧客管理テスト

#### 顧客作成
```bash
curl -X POST http://localhost:4001/api/v1/customers \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "田中花子",
    "phone": "090-1234-5678",
    "email": "tanaka@example.com",
    "instagramId": "tanaka_hanako",
    "lineId": "line_tanaka_123"
  }'
```

### 4. 統合メッセージ管理テスト

#### 統合インボックス表示
```bash
curl -X GET http://localhost:4001/api/v1/messages/threads \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Instagram Webhookテスト（メッセージ受信シミュレーション）
```bash
curl -X POST http://localhost:4001/api/v1/webhooks/instagram \
  -H "Content-Type: application/json" \
  -H "X-Hub-Signature-256: sha256=test-signature" \
  -d '{
    "object": "instagram",
    "entry": [{
      "messaging": [{
        "sender": {"id": "instagram_user_123"},
        "recipient": {"id": "business_account"},
        "timestamp": 1701234567890,
        "message": {
          "mid": "msg_123",
          "text": "予約を取りたいのですが"
        }
      }]
    }]
  }'
```

#### LINE Webhookテスト（メッセージ受信シミュレーション）
```bash
curl -X POST http://localhost:4001/api/v1/webhooks/line \
  -H "Content-Type: application/json" \
  -H "X-Line-Signature: test-signature" \
  -d '{
    "events": [{
      "type": "message",
      "timestamp": 1701234567890,
      "source": {"userId": "line_user_123"},
      "destination": "line_channel_id",
      "message": {
        "id": "line_msg_123",
        "type": "text",
        "text": "こんにちは！予約状況を教えてください"
      }
    }]
  }'
```

### 5. 予約管理テスト

#### 予約作成
```bash
curl -X POST http://localhost:4001/api/v1/reservations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "startTime": "2024-12-15T10:00:00.000Z",
    "endTime": "2024-12-15T11:30:00.000Z",
    "menuContent": "カット＋カラー",
    "customerName": "田中花子",
    "source": "MANUAL",
    "status": "CONFIRMED"
  }'
```

## 🔍 主要APIエンドポイント

### 認証
- `POST /api/v1/auth/register` - ユーザー登録
- `POST /api/v1/auth/login` - ログイン
- `GET /api/v1/auth/profile` - プロファイル取得

### 顧客管理
- `GET /api/v1/customers` - 顧客一覧
- `POST /api/v1/customers` - 顧客作成
- `GET /api/v1/customers/:id` - 顧客詳細

### 統合メッセージ管理
- `GET /api/v1/messages/threads` - 統合インボックス
- `POST /api/v1/messages/send` - メッセージ送信
- `POST /api/v1/webhooks/instagram` - Instagram Webhook
- `POST /api/v1/webhooks/line` - LINE Webhook

### 予約管理
- `GET /api/v1/reservations` - 予約一覧
- `POST /api/v1/reservations` - 予約作成
- `POST /api/v1/reservations/import/hotpepper` - CSV インポート
- `POST /api/v1/reservations/sync/google-calendar` - Google Calendar同期

## 📱 メッセージ統合機能の特徴

### 受信メッセージの一元管理
- LINE公式アカウントとInstagram DMのメッセージを統一インターフェースで表示
- 自動顧客紐付け（LINE ID・Instagram IDベース）
- リアルタイムWebhook受信

### 送信機能
- 各プラットフォームへの個別メッセージ送信
- メディアファイル対応（画像・スタンプ・ファイル）
- 送信履歴管理

### 今後の拡張計画
- 一斉送信機能
- テンプレートメッセージ
- 自動応答機能

## 🔐 セキュリティ機能
- JWT認証による認可
- ロールベース権限管理
- 監査ログ
- Rate Limiting
- Webhook署名検証

## 📊 データベース設計
- マルチテナント対応
- 完全なエンティティリレーション
- カスケード削除対応
- 監査ログ記録

このシステムにより、美容室は複数のメッセージングプラットフォームを一元管理し、予約と顧客情報を統合して効率的な運営が可能になります。