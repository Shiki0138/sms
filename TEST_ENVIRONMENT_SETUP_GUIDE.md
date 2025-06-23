# 🧪 テスト環境設定ガイド

## ⚠️ 重要事項

### 🚫 外部送信の完全無効化
```
【テスト環境の安全保証】

✅ 実際に送信されない処理:
- Instagram DM送信
- LINE メッセージ送信  
- メール送信
- SMS送信
- プッシュ通知
- 外部API呼び出し（課金発生分）

✅ 模擬実行される処理:
- 送信ログ表示
- 成功・失敗レスポンス表示
- エラーハンドリング
- UI操作確認
```

---

## 🔧 テスト環境の技術的制限事項

### 📱 メッセージング機能
```javascript
// Instagram API
const INSTAGRAM_TEST_MODE = true
const INSTAGRAM_SEND_DISABLED = true

// LINE Bot API  
const LINE_TEST_MODE = true
const LINE_SEND_DISABLED = true

// メール送信
const EMAIL_TEST_MODE = true
const SMTP_DISABLED = true
```

### 📊 外部連携API
```javascript
// ホットペッパービューティー
const HOTPEPPER_TEST_MODE = true
const HOTPEPPER_LIVE_DATA = false

// Google Calendar
const GCAL_TEST_MODE = true
const GCAL_WRITE_DISABLED = true

// 決済API
const PAYMENT_TEST_MODE = true
const PAYMENT_LIVE_DISABLED = true
```

---

## 🛡️ セキュリティ設定

### 🔐 API認証情報の取り扱い

#### テスト用ダミー値一覧
```yaml
# Instagram API (テスト用)
app_id: "test_instagram_app_12345"
app_secret: "test_instagram_secret_abcdefg"
access_token: "test_instagram_token_xyz789"

# LINE Bot API (テスト用)  
channel_secret: "test_line_channel_secret_123"
channel_access_token: "test_line_access_token_456"
webhook_url: "https://test-webhook.salon-system.com"

# ホットペッパー API (テスト用)
api_key: "test_hotpepper_api_key_789"
secret_key: "test_hotpepper_secret_abc"
salon_id: "TEST_SALON_001"

# Google Calendar (テスト用)
client_id: "test_google_client_id_123"
client_secret: "test_google_client_secret_456"
calendar_id: "test@salon-system.com"
```

### 🚨 絶対に使用禁止
```
❌ 実際のAPIキー・トークン
❌ 個人のSNSアカウント情報
❌ 本番環境の認証情報
❌ 課金が発生する設定
❌ 実在する顧客情報
```

---

## 🧪 テスト実行手順

### Step 1: 環境確認
1. **テストモード確認**
   ```
   システム上部に「🧪 TEST MODE」表示確認
   ```

2. **外部送信無効化確認**
   ```
   設定 → システム情報 → 「外部送信: 無効」確認
   ```

### Step 2: API設定テスト
1. **Instagram設定**
   ```
   1. 設定タブ → 外部API設定 → Instagram
   2. テスト用値を入力
   3. 「接続テスト」実行
   4. 模擬成功レスポンス確認
   ```

2. **LINE設定**
   ```
   1. 設定タブ → 外部API設定 → LINE Bot
   2. テスト用値を入力  
   3. 「Webhook検証」実行
   4. 模擬検証結果確認
   ```

### Step 3: 送信機能テスト
1. **メッセージ送信テスト**
   ```
   1. メッセージ管理画面で返信作成
   2. 「送信」ボタンクリック
   3. 「模擬送信完了」メッセージ確認
   4. 送信ログに記録確認
   ```

2. **一括送信テスト**
   ```
   1. 顧客選択
   2. 一括メッセージ作成
   3. 送信実行
   4. 「模擬送信: ○○件」確認
   ```

---

## 🔍 動作確認項目

### ✅ 正常動作確認
- [ ] テストモード表示あり
- [ ] API設定画面の表示・操作
- [ ] 設定値の保存・編集
- [ ] 接続テストの実行
- [ ] エラーメッセージの表示
- [ ] ログ出力の確認

### ❌ 送信されないことの確認
- [ ] Instagram DM未送信
- [ ] LINE メッセージ未送信
- [ ] メール未送信
- [ ] プッシュ通知未送信
- [ ] 外部API未呼び出し

### 📊 ログ確認項目
- [ ] 送信試行ログの記録
- [ ] 模擬実行結果の表示
- [ ] エラー処理ログ
- [ ] 設定変更ログ

---

## 🆘 トラブルシューティング

### 問題: テストモードが表示されない
```
確認事項:
□ 正しいテスト環境URLアクセス
□ ブラウザキャッシュクリア
□ セッション再確立

対処法:
1. URL再確認: https://salon-frontend-979081193456.asia-northeast1.run.app
2. ページ完全リロード (Ctrl+Shift+R)
3. 管理者に環境状態確認依頼
```

### 問題: 実際に送信されている疑い
```
緊急対応:
1. 即座に操作停止
2. 緊急連絡: 080-XXXX-XXXX
3. 画面キャプチャ保存
4. 操作履歴の記録

確認方法:
- システムログの送信記録確認
- 外部サービスの受信履歴確認
- ネットワークトラフィック監視
```

### 問題: API設定が保存されない
```
確認事項:
□ テスト用値の正確性
□ 必須項目の入力完了
□ 権限設定の確認
□ セッション有効性

対処法:
1. 提供されたテスト用値を正確にコピー&ペースト
2. 必須項目の再確認
3. 管理者権限でのログイン
4. ブラウザの開発者ツールでエラー確認
```

---

## 📋 テスト完了チェックリスト

### 🔧 設定テスト
- [ ] Instagram API設定・保存・接続テスト
- [ ] LINE Bot API設定・保存・Webhook検証  
- [ ] ホットペッパー API設定・同期テスト
- [ ] Google Calendar API設定・認証テスト

### 💬 送信機能テスト
- [ ] 個別メッセージ返信（模擬）
- [ ] AI返信生成・送信（模擬）
- [ ] 一括メッセージ送信（模擬）
- [ ] メール通知送信（模擬）

### 📊 ログ・エラー処理
- [ ] 送信ログの正常記録
- [ ] エラー時の適切な表示
- [ ] 設定変更の履歴記録
- [ ] 接続失敗時の処理

### 🔒 セキュリティ確認
- [ ] テストモード表示確認
- [ ] 外部送信無効化確認
- [ ] ダミー値使用確認
- [ ] 実データ漏洩防止確認

---

## 📞 サポート・連絡先

### 🔧 技術サポート
- **メール**: tech-support@salon-system.com
- **チャット**: システム内サポート機能
- **緊急時**: 080-XXXX-XXXX（平日9-18時）

### 🚨 セキュリティインシデント
- **緊急連絡**: security@salon-system.com
- **電話**: 080-YYYY-YYYY（24時間対応）

### 📋 テスト運営
- **テスト統括**: test-manager@salon-system.com
- **フィードバック**: feedback@salon-system.com

---

## 📝 免責事項

```
【重要な免責事項】

本テスト環境は安全性を最優先に設計されており、
外部への実際の送信は技術的に無効化されています。

ただし、テスト参加者は以下を遵守してください：

✅ 提供されたテスト用ダミー値のみ使用
✅ 実際のAPI認証情報の入力禁止
✅ 個人情報・機密情報の入力禁止
✅ 発見した問題の即座報告

これらの遵守により、安全で効果的なテストを
実施することができます。
```

---

**最終更新**: 2025年6月19日
**バージョン**: v1.0
**承認者**: テスト運営チーム