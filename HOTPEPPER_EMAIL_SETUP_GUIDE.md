# ホットペッパービューティー メール連動設定ガイド

このガイドでは、ホットペッパービューティーからの新規予約メールを自動的にシステムに取り込む設定方法を説明します。

## 🎯 機能概要

- ホットペッパービューティーからの予約確認メールを自動解析
- 顧客情報と予約情報を自動登録
- 重複チェック機能
- 複数の美容室アカウントに対応

## 📋 設定方法

### ステップ1: メール転送サービスの選択

以下のいずれかのメールサービスを選択してください：

#### A. SendGrid（推奨）
- 月間40,000通まで無料
- 高い配信率
- 詳細な分析機能

#### B. Mailgun
- 月間5,000通まで無料
- 開発者向け機能が豊富

#### C. Postmark
- 月間100通まで無料
- トランザクションメールに特化

### ステップ2: メール転送設定

#### 2-1. 専用メールアドレスの設定

システムが提供する専用アドレス形式：
```
salon-[あなたのテナントID]@[設定ドメイン].com
```

例：
```
salon-abc123@reservations.yoursalon.com
```

#### 2-2. ホットペッパービューティーでの設定

1. ホットペッパービューティー管理画面にログイン
2. 「店舗設定」→「メール設定」に移動
3. 「予約確認メール転送先」に専用アドレスを設定

### ステップ3: Webhookエンドポイントの設定

選択したメールサービスで以下のWebhookエンドポイントを設定：

```
POST https://yourdomain.com/api/v1/webhooks/email
```

#### SendGridの場合
1. SendGrid管理画面で「Settings」→「Mail Settings」→「Event Webhook」
2. HTTP POST URLに上記エンドポイントを設定
3. 「Delivered」と「Processed」イベントを有効化

#### Mailgunの場合
1. Mailgun管理画面で「Webhooks」
2. 「Create Webhook」をクリック
3. URLに上記エンドポイントを設定

#### Postmarkの場合
1. Postmark管理画面で「Message Streams」
2. 「Inbound」ストリームを選択
3. Webhook URLを設定

### ステップ4: DNS設定（カスタムドメイン使用の場合）

#### MXレコードの設定
```
Type: MX
Name: reservations.yoursalon.com
Value: inbound-smtp.us-east-1.amazonaws.com
Priority: 10
```

#### SPFレコードの設定
```
Type: TXT
Name: reservations.yoursalon.com
Value: "v=spf1 include:sendgrid.net ~all"
```

## 🔧 システム設定

### 環境変数の設定

`.env`ファイルに以下を追加：

```bash
# メールサービス設定
EMAIL_WEBHOOK_SECRET=your-webhook-secret-key
SENDGRID_API_KEY=your-sendgrid-api-key
MAILGUN_API_KEY=your-mailgun-api-key

# ホットペッパー連携設定
HOTPEPPER_AUTO_IMPORT=true
HOTPEPPER_DEFAULT_DURATION_HOURS=2
HOTPEPPER_NOTIFICATION_EMAIL=your-salon@example.com
```

### データベース設定

システムが自動的に以下のテーブルを使用します：
- `customers` - 顧客情報
- `reservations` - 予約情報
- `tenant_settings` - テナント設定

## 📧 対応メール形式

システムは以下の形式のメールを自動認識します：

### 件名パターン
- 「予約確認」
- 「ご予約を承りました」
- 「予約完了」

### 本文パターン
```
お客様名：山田 太郎
予約日時：2024年6月10日(月) 14:00
メニュー：カット + カラー
電話番号：090-1234-5678
メールアドレス：customer@example.com
```

## 🔍 動作確認方法

### テストメールの送信

以下のサンプルメールを使用してテストできます：

```
件名: 【ホットペッパービューティー】ご予約を承りました

美容室サンプル様

いつもホットペッパービューティーをご利用いただき、ありがとうございます。
下記の通りご予約を承りました。

■ご予約内容
お客様名：テスト 太郎
予約日時：2024年6月20日(木) 15:00
メニュー：カット + シャンプー
電話番号：090-0000-0000
メールアドレス：test@example.com

ご来店をお待ちしております。
```

### 確認手順

1. 上記テストメールを専用アドレスに送信
2. システム管理画面で予約一覧を確認
3. 新規予約が自動登録されていることを確認

## ⚙️ 詳細設定

### 重複チェック設定

```javascript
// 重複判定条件（カスタマイズ可能）
- 同じ顧客名
- 同じ予約日時（±30分以内）
- 同じ電話番号またはメールアドレス
```

### 自動応答設定

```javascript
// 自動応答メール設定
{
  "enabled": true,
  "template": "予約を承りました。ご来店をお待ちしております。",
  "delay_minutes": 5
}
```

### 通知設定

```javascript
// スタッフ通知設定
{
  "new_reservation_notification": true,
  "notification_channels": ["email", "slack"],
  "notification_timing": "immediate"
}
```

## 🚨 トラブルシューティング

### よくある問題と解決方法

#### 問題1: メールが取り込まれない
**確認項目：**
- Webhookエンドポイントの設定
- メール転送設定
- DNSレコードの設定

**解決方法：**
```bash
# ログの確認
tail -f /var/log/salon-system/webhook.log

# Webhookテスト
curl -X POST https://yourdomain.com/api/v1/webhooks/email \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

#### 問題2: 顧客情報の解析エラー
**確認項目：**
- メール形式の確認
- 正規表現パターンの適合性

**解決方法：**
システム管理画面で「メール解析ログ」を確認

#### 問題3: 重複予約の作成
**確認項目：**
- 重複チェック設定
- 顧客マッチング条件

**解決方法：**
重複チェック条件の調整

## 📊 運用監視

### 監視指標

- **メール処理成功率**: 95%以上を維持
- **解析エラー率**: 5%以下を維持
- **重複予約率**: 2%以下を維持

### アラート設定

```javascript
// アラート条件
{
  "email_parsing_failure_rate": "> 10%",
  "webhook_timeout_rate": "> 5%",
  "duplicate_reservation_rate": "> 5%"
}
```

## 📞 サポート

設定に関するお問い合わせ：
- メール：support@salon-system.com
- 電話：0120-XXX-XXX（平日 9:00-18:00）

## 📝 更新履歴

- 2024/06/20: 初版作成
- 2024/06/20: Mailgun、Postmark対応追加
- 2024/06/20: トラブルシューティング章追加

---

## 🔐 セキュリティ注意事項

1. **Webhook秘密鍵の管理**: 定期的な更新を推奨
2. **メール転送の暗号化**: TLS/SSL必須
3. **アクセスログの監視**: 異常なアクセスパターンの検知
4. **顧客情報の保護**: GDPR/個人情報保護法準拠

このガイドに従って設定することで、ホットペッパービューティーからの新規予約を自動的にシステムに取り込むことができます。