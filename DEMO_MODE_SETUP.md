# 🎭 SMS デモモード セットアップガイド

## 概要

SMS（Salon Management System）のデモモードは、実際のユーザーがシステムを7日間無料で体験できる環境です。有料機能は制限されますが、CSVインポートや基本的な管理機能は実際のデータで試用可能です。

## デモモードの特徴

### ✅ 利用可能な機能
- 顧客管理（登録・編集・削除）
- 予約管理（作成・変更・キャンセル）
- CSVデータインポート/エクスポート
- 基本的な分析・レポート機能
- スタッフ管理
- メニュー管理
- 設定管理

### 🚫 制限される機能
- LINEメッセージ送信
- Instagramメッセージ送信
- SMS送信
- メール一斉配信
- 決済機能（Stripe、PayPal等）
- 高度なAI分析機能
- プッシュ通知

### 📊 フィードバック収集
- デモ期間中のユーザーフィードバックをGoogleスプレッドシートで収集
- バグ報告、改善要望、UI/UX提案を分類して管理

## セットアップ手順

### 1. 環境変数の設定

```bash
# デモ環境用の設定ファイルをコピー
cp .env.demo.example .env

# 必要に応じて設定を調整
vim .env
```

### 2. データベースの初期化

```bash
# SQLite（推奨）
DATABASE_URL="file:./demo.db"

# または PostgreSQL
# DATABASE_URL="postgresql://user:password@localhost:5432/sms_demo"
```

### 3. Googleスプレッドシート連携（オプション）

フィードバック収集を自動化する場合：

```bash
# Google Cloud Console でサービスアカウントを作成
# スプレッドシートを作成し、サービスアカウントに編集権限を付与
# 認証情報を環境変数に設定

GOOGLE_SHEETS_ID=your_spreadsheet_id
GOOGLE_SHEETS_CREDENTIALS='{"type":"service_account",...}'
```

### 4. アプリケーションの起動

```bash
# 依存関係のインストール
npm run setup

# データベースマイグレーション
cd backend && npx prisma migrate deploy && npx prisma generate

# アプリケーション起動
npm run dev
```

## デモモード管理

### データ自動削除

デモモードでは7日後にユーザーデータが自動削除されます：

```bash
# 手動でのデータ削除
curl -X POST http://localhost:3001/api/v1/demo/session/cleanup \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "demo_session_id", "force": true}'
```

### 統計情報の確認

```bash
# デモ利用統計の取得
curl -X GET http://localhost:3001/api/v1/demo/stats \
  -H "X-Admin-Key: your_admin_key"
```

## ユーザー向け案内

### デモアカウント作成の流れ

1. アクセス時にデモセッションが自動生成
2. デモバナーで制限事項を表示
3. 7日間の利用期限を明示
4. フィードバックフォームの案内

### フィードバック収集

- 各ページにフィードバックボタンを配置
- カテゴリ別分類（バグ・改善・機能要望・UI/UX）
- 該当ページをプルダウンで選択
- 自由記入のコメント欄

## セキュリティ考慮事項

### デモモード固有の制限

```typescript
// 決済機能の完全無効化
if (process.env.DEMO_MODE === 'true') {
  return { success: false, error: 'デモモードでは決済機能は無効です' }
}

// 外部API呼び出しの制限
if (config.isDemoMode) {
  console.warn('デモモードでは外部API呼び出しは制限されています')
  return mockResponse
}
```

### データ保護

- 個人情報は7日後に確実に削除
- フィードバックデータは匿名化
- セッションベースの分離

## 監視とメンテナンス

### ログ監視

```bash
# デモモード関連のログ確認
tail -f logs/demo.log | grep "DEMO"

# エラー監視
tail -f logs/error.log | grep "demo"
```

### パフォーマンス監視

```bash
# システム状態確認
curl http://localhost:3001/api/v1/demo/health

# パフォーマンス情報
curl http://localhost:3001/api/v1/system/performance
```

## トラブルシューティング

### よくある問題

1. **デモバナーが表示されない**
   ```bash
   # 環境変数を確認
   echo $VITE_DEMO_MODE
   # true になっているか確認
   ```

2. **フィードバックが送信されない**
   ```bash
   # Googleスプレッドシート設定を確認
   echo $GOOGLE_SHEETS_ID
   echo $GOOGLE_SHEETS_CREDENTIALS
   ```

3. **制限機能が動作してしまう**
   ```bash
   # デモモード設定を確認
   echo $DEMO_MODE
   echo $VITE_DEMO_MODE
   ```

### デバッグモード

```bash
# デバッグログを有効化
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=debug
```

## 本番運用への移行

デモモードから本番モードへの切り替え：

```bash
# 環境変数を変更
DEMO_MODE=false
VITE_DEMO_MODE=false

# 制限機能を有効化
VITE_ENABLE_LINE_MESSAGING=true
VITE_ENABLE_PAYMENTS=true
# ... その他の機能

# データベースを本番用に変更
DATABASE_URL="postgresql://prod_user:password@prod_host:5432/sms_prod"
```

## サポート

### 技術サポート

- GitHub Issues: [リポジトリのIssues](../../issues)
- 開発チーム連絡先: [連絡先情報]

### ユーザーサポート

- デモ期間中のフィードバック: システム内フィードバックフォーム
- 利用方法: 各画面のヘルプ機能

---

**注意**: デモモードは評価・体験用途に限定されます。本格運用前には必ず本番環境での十分なテストを実施してください。