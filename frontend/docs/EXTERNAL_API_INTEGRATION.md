# 外部API連携ガイド

## 概要
美容室管理システムは、LINE、Instagram、Google Calendar、Stripeなどの外部サービスと連携できます。

## 実装状況

### 1. LINE連携
**状態**: 部分実装済み
- ✅ API設定画面（UI）
- ✅ 認証情報の保存機能
- ✅ OAuth認証フロー（バックエンド）
- ❌ メッセージ送受信機能
- ❌ リッチメニュー管理

**必要な設定**:
```env
# バックエンド環境変数
LINE_CHANNEL_ID=your_channel_id
LINE_CHANNEL_SECRET=your_channel_secret
LINE_CHANNEL_ACCESS_TOKEN=your_access_token
LINE_CALLBACK_URL=https://yourdomain.com/api/v1/external/line/callback
```

**セットアップ手順**:
1. LINE Developersコンソールでチャネルを作成
2. Messaging API設定を有効化
3. チャネルアクセストークンを発行
4. 環境変数に設定情報を追加
5. 管理画面から認証情報を設定

### 2. Instagram連携
**状態**: UI実装済み、バックエンド未実装
- ✅ API設定画面（UI）
- ✅ 認証情報の保存機能
- ❌ Instagram Basic Display API連携
- ❌ メディア取得機能
- ❌ DM管理機能

**必要な設定**:
```env
# 将来的に必要な環境変数
INSTAGRAM_APP_ID=your_app_id
INSTAGRAM_APP_SECRET=your_app_secret
INSTAGRAM_REDIRECT_URI=https://yourdomain.com/api/v1/external/instagram/callback
```

### 3. Google Calendar連携
**状態**: 計画中
- ✅ API設定画面（UI）
- ✅ 認証情報の保存機能
- ❌ OAuth2認証フロー
- ❌ カレンダーイベント同期
- ❌ 予約の双方向同期

**必要な設定**:
```env
# 将来的に必要な環境変数
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/v1/external/google/callback
```

### 4. Stripe決済連携
**状態**: 部分実装済み
- ✅ Stripeライブラリ統合
- ✅ 支払いフォームコンポーネント
- ✅ 環境変数設定
- ❌ 実際の決済処理
- ❌ Webhook処理
- ❌ 返金機能

**必要な設定**:
```env
# フロントエンド環境変数
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx

# バックエンド環境変数
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

## データベース構造

### api_settings テーブル
```sql
CREATE TABLE api_settings (
  id TEXT PRIMARY KEY,
  tenantId TEXT NOT NULL,
  service TEXT NOT NULL, -- 'line', 'instagram', 'google', 'stripe'
  credentials JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP,
  UNIQUE(tenantId, service)
);
```

### 認証情報の保存形式
```typescript
// LINE
{
  channelAccessToken: string,
  channelSecret: string,
  channelId: string
}

// Instagram
{
  accessToken: string,
  pageId: string,
  appId: string,
  appSecret: string
}

// Google
{
  clientId: string,
  clientSecret: string,
  redirectUri: string,
  refreshToken?: string
}

// Stripe
{
  publishableKey: string,
  secretKey: string, // 暗号化して保存
  webhookSecret: string
}
```

## セキュリティ考慮事項

1. **APIキーの管理**
   - 秘密鍵は環境変数で管理
   - データベース保存時は暗号化を推奨
   - フロントエンドには公開可能キーのみ露出

2. **アクセス制御**
   - API設定は管理者権限のみアクセス可能
   - RLS（Row Level Security）で適切に保護

3. **OAuth認証**
   - stateパラメータでCSRF対策
   - リダイレクトURIの検証
   - アクセストークンの適切な管理

## トラブルシューティング

### 問題: LINE連携でエラーが発生する
**原因と対策**:
1. チャネルアクセストークンの有効期限切れ
   → LINE Developersコンソールで再発行
2. Webhook URLの設定ミス
   → 正しいURLを設定し、SSL証明書を確認
3. 権限不足
   → 必要なスコープが有効か確認

### 問題: Stripe決済が動作しない
**原因と対策**:
1. APIキーの設定ミス
   → テスト環境と本番環境のキーを確認
2. CORS設定
   → バックエンドのCORS設定を確認
3. Webhookの署名検証失敗
   → Webhook秘密鍵が正しいか確認

### 問題: API設定が保存されない
**原因と対策**:
1. Supabaseテーブルが存在しない
   → マイグレーションスクリプトを実行
2. RLS設定の問題
   → ポリシー設定を確認
3. 認証エラー
   → ログイン状態とテナントIDを確認

## 実装予定の機能

1. **LINE連携の完全実装**
   - プッシュメッセージ送信
   - リッチメニュー管理
   - 顧客とのチャット履歴管理

2. **Instagram連携**
   - Instagram Basic Display API
   - メディアギャラリー表示
   - DMの統合管理

3. **Google Calendar連携**
   - 予約の自動同期
   - スタッフカレンダー連携
   - 空き時間の自動計算

4. **Stripe決済の完全実装**
   - オンライン決済
   - サブスクリプション管理
   - 返金処理

## 開発者向け情報

### API連携テストパネル
`ExternalAPITestPanel`コンポーネントを使用して、各サービスの接続状態をテストできます。

```typescript
import ExternalAPITestPanel from './components/Settings/ExternalAPITestPanel'

// 設定画面に追加
<ExternalAPITestPanel />
```

### API設定の取得方法
```typescript
import { loadApiSettings } from './lib/settings-manager'

const settings = await loadApiSettings(user, 'line')
console.log(settings?.credentials)
```

### API設定の保存方法
```typescript
import { saveApiSettings } from './lib/settings-manager'

const success = await saveApiSettings(user, 'line', {
  channelAccessToken: 'xxx',
  channelSecret: 'yyy',
  channelId: 'zzz'
})
```