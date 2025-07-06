# Supabaseセットアップ手順

## 1. Supabaseプロジェクト作成

1. https://supabase.com にアクセス
2. 「Start your project」をクリック
3. GitHubアカウントでサインイン
4. 「New project」をクリック
5. 以下の情報を入力：
   - Project name: `salon-management-system`
   - Database Password: 強力なパスワードを設定
   - Region: Asia Northeast (Tokyo)
   - Plan: Free tier

## 2. データベース初期化

1. Supabaseダッシュボードにログイン
2. 左メニューから「SQL Editor」を選択
3. 「New query」をクリック
4. `/supabase/schema.sql` の内容をコピー＆ペースト
5. 「Run」をクリックして実行

## 3. テストデータ投入

1. SQL Editorで新しいクエリを作成
2. `/supabase/seed-test-users.sql` の内容をコピー＆ペースト
3. 「Run」をクリックして実行

## 4. Edge Functions デプロイ

### 4.1 Supabase CLIインストール
```bash
npm install -g supabase
```

### 4.2 プロジェクトリンク
```bash
# ログイン
supabase login

# プロジェクトディレクトリに移動
cd /Users/MBP/Desktop/system/salon-management-system

# プロジェクトリンク（Project Ref は Settings > General から取得）
supabase link --project-ref <your-project-ref>
```

### 4.3 Edge Functionsデプロイ
```bash
# Auth関数デプロイ
supabase functions deploy auth

# Customers関数デプロイ  
supabase functions deploy customers
```

## 5. APIキー取得

1. Supabaseダッシュボード > Settings > API
2. 以下のキーを記録：
   - `Project URL`: https://xxxxx.supabase.co
   - `anon public`: Supabase Anon Key
   - `service_role`: Service Role Key（秘密保持）

## 6. CORSポリシー設定

Edge Functionsは自動的にCORSヘッダーを設定していますが、必要に応じて以下を確認：

1. Authentication > URL Configuration
2. Site URLに本番URLを追加：`https://salon-management-system.vercel.app`

## 7. 動作確認

### ローカルテスト
```bash
# テスト用環境変数設定
export SUPABASE_URL="https://xxxxx.supabase.co"
export SUPABASE_ANON_KEY="your-anon-key"

# Auth APIテスト
curl -X POST "$SUPABASE_URL/functions/v1/auth" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test-salon.jp","password":"TestUser2024!"}'
```

成功時のレスポンス例：
```json
{
  "success": true,
  "token": "...",
  "user": {
    "id": "...",
    "name": "テスト管理者",
    "email": "admin@test-salon.jp",
    "role": "ADMIN",
    "tenantId": "test-salon-001"
  }
}
```

## トラブルシューティング

### Edge Functions が404エラーを返す場合
- Project Refが正しいか確認
- 関数名が正しいか確認（大文字小文字区別）
- デプロイが成功しているか確認

### 認証エラーが発生する場合
- Anon Keyが正しいか確認
- CORSポリシーが設定されているか確認
- パスワードハッシュが正しいか確認