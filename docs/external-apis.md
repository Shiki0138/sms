# 外部API連携仕様書

## 概要
本システムで利用する外部APIの技術仕様と連携方法をまとめた資料です。

## 1. Instagram Graph API（Instagram Messaging API）

### 基本情報
- **提供元**: Meta (Facebook)
- **目的**: InstagramビジネスアカウントのDM送受信
- **API Version**: v17.0以降推奨
- **認証方式**: OAuth 2.0 + Page Access Token

### 必要な権限
```
instagram_basic
instagram_manage_messages
pages_messaging
pages_show_list
```

### セットアップ手順
1. Facebook Developer アカウント作成
2. アプリケーション作成
3. Instagram Business Account とFacebookページの連携
4. Webhook設定

### 主要エンドポイント

#### メッセージ受信（Webhook）
```javascript
// Webhook URL: POST /api/v1/webhooks/instagram
{
  "object": "instagram",
  "entry": [
    {
      "id": "INSTAGRAM_BUSINESS_ACCOUNT_ID",
      "time": 1569262486,
      "messaging": [
        {
          "sender": {
            "id": "CUSTOMER_INSTAGRAM_ID"
          },
          "recipient": {
            "id": "YOUR_INSTAGRAM_BUSINESS_ACCOUNT_ID"
          },
          "timestamp": 1569262485249,
          "message": {
            "mid": "MESSAGE_ID",
            "text": "メッセージ内容"
          }
        }
      ]
    }
  ]
}
```

#### メッセージ送信
```javascript
// POST https://graph.facebook.com/v17.0/{ig-user-id}/messages
{
  "recipient": {
    "id": "CUSTOMER_INSTAGRAM_ID"
  },
  "message": {
    "text": "返信メッセージ"
  }
}
```

### 制限事項
- 24時間ルール: ユーザーから最後にメッセージを受信してから24時間以内のみ送信可能
- レート制限: アカウントの信頼度による
- メディア対応: テキスト、画像、テンプレート

### 実装上の注意点
- トークンの有効期限管理（60日間）
- Webhook検証の実装
- エラーハンドリング（API制限、トークン期限切れ等）

## 2. LINE Messaging API

### 基本情報
- **提供元**: LINE株式会社
- **目的**: LINE公式アカウントのメッセージ送受信
- **API Version**: 最新版
- **認証方式**: Channel Access Token

### 必要な設定
- LINE Developers アカウント
- LINE公式アカウント
- チャネル作成（Messaging API）

### 主要エンドポイント

#### メッセージ受信（Webhook）
```javascript
// Webhook URL: POST /api/v1/webhooks/line
{
  "destination": "CHANNEL_ID",
  "events": [
    {
      "type": "message",
      "mode": "active",
      "timestamp": 1569262486699,
      "source": {
        "type": "user",
        "userId": "USER_ID"
      },
      "message": {
        "id": "MESSAGE_ID",
        "type": "text",
        "text": "メッセージ内容"
      },
      "replyToken": "REPLY_TOKEN"
    }
  ]
}
```

#### Reply API（返信）
```javascript
// POST https://api.line.me/v2/bot/message/reply
{
  "replyToken": "REPLY_TOKEN",
  "messages": [
    {
      "type": "text",
      "text": "返信メッセージ"
    }
  ]
}
```

#### Push API（プッシュメッセージ）
```javascript
// POST https://api.line.me/v2/bot/message/push
{
  "to": "USER_ID",
  "messages": [
    {
      "type": "text",
      "text": "プッシュメッセージ"
    }
  ]
}
```

### 料金体系
- 無料メッセージ数: 月1,000通（Freeプラン）
- 従量課金: 追加送信料

### 制限事項
- 友だち追加が前提
- Webhook応答時間制限（30秒）
- 一斉送信の制限

### 実装上の注意点
- Webhook署名検証の実装
- リッチメニュー、クイックリプライ対応
- メッセージタイプ対応（テキスト、画像、スタンプ等）

## 3. Google Calendar API

### 基本情報
- **提供元**: Google
- **目的**: Googleカレンダーの予定読み取り
- **API Version**: v3
- **認証方式**: OAuth 2.0

### 必要な権限スコープ
```
https://www.googleapis.com/auth/calendar.readonly
```

### セットアップ手順
1. Google Cloud Console でプロジェクト作成
2. Calendar API有効化
3. OAuth 2.0認証情報作成
4. 同意画面設定

### 主要エンドポイント

#### イベント一覧取得
```javascript
// GET https://www.googleapis.com/calendar/v3/calendars/{calendarId}/events
{
  "timeMin": "2024-01-01T00:00:00Z",
  "timeMax": "2024-01-31T23:59:59Z",
  "singleEvents": true,
  "orderBy": "startTime"
}
```

#### レスポンス例
```javascript
{
  "items": [
    {
      "id": "EVENT_ID",
      "summary": "予約件名",
      "start": {
        "dateTime": "2024-01-15T10:00:00+09:00"
      },
      "end": {
        "dateTime": "2024-01-15T11:00:00+09:00"
      },
      "attendees": [
        {
          "email": "staff@salon.com"
        }
      ]
    }
  ]
}
```

### 実装上の注意点
- トークン自動更新の実装
- カレンダーID管理
- タイムゾーン考慮
- 読み取り専用アクセス

## 4. Hot Pepper Beauty（サロンボード）

### 基本情報
- **提供元**: リクルート
- **制約**: 公開API非提供
- **連携方法**: CSVインポート + スクレイピング

### CSVインポート方式

#### 想定フォーマット
```csv
予約日,予約時間,メニュー,顧客名,電話番号,メールアドレス,担当者,ステータス
2024-01-15,10:00,カット+カラー,山田太郎,090-1234-5678,yamada@example.com,佐藤,確定
```

#### 実装フロー
1. サロンボードからCSVエクスポート（手動）
2. システムへのCSVアップロード
3. データ解析・バリデーション
4. データベース取り込み

### スクレイピング方式（補助的）

#### 技術仕様
- **ツール**: Puppeteer / Playwright
- **頻度**: 1時間に1回程度
- **対象**: 予約一覧ページ

#### 実装上の注意点
- 利用規約遵守
- 過度なアクセス回避
- DOM構造変更への対応
- エラーハンドリング

### セキュリティ考慮事項
- ログイン情報の安全な保存
- セッション管理
- 失敗時のフォールバック

## 5. 統合実装方針

### データ同期戦略
1. **リアルタイム**: Instagram/LINE（Webhook）
2. **定期同期**: Google Calendar（10分間隔）
3. **手動同期**: Hot Pepper（CSVアップロード）

### エラーハンドリング
- 外部API障害時の継続運用
- 再試行機構
- ユーザー通知

### モニタリング
- API呼び出し回数の監視
- 成功率の計測
- 異常検知・アラート

### セキュリティ
- API認証情報の暗号化保存
- トークン自動更新
- アクセスログ記録

## 6. 開発環境でのテスト方法

### Instagram
- 開発者アカウントでのテスト環境構築
- ngrok等を使用したWebhook受信テスト

### LINE
- LINE Developers のテストチャネル使用
- サンドボックス環境でのメッセージテスト

### Google Calendar
- 開発用Googleアカウント作成
- テストカレンダーでのデータ取得確認

### Hot Pepper
- ダミーCSVファイルでのインポートテスト
- スクレイピング用のテストサイト構築