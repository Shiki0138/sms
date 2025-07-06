# デプロイメントガイド

## 1. Supabaseセットアップ

### 1.1 プロジェクト作成
1. https://supabase.com にアクセス
2. 新しいプロジェクトを作成
3. プロジェクトURL、Anon Key、Service Role Keyを記録

### 1.2 データベース初期化
1. Supabase ダッシュボードのSQL Editorを開く
2. `/backend/prisma/schema.prisma` の内容を基にテーブルを作成
3. `/supabase/seed-test-users.sql` を実行してテストデータを投入

### 1.3 Edge Functions デプロイ
```bash
# Supabase CLIインストール
npm install -g supabase

# ログイン
supabase login

# プロジェクトリンク
supabase link --project-ref your-project-ref

# Edge Functionsデプロイ
supabase functions deploy auth
supabase functions deploy customers
```

## 2. Vercelデプロイ

### 2.1 環境変数設定
Vercelダッシュボードで以下の環境変数を設定：
- `NEXT_PUBLIC_SUPABASE_URL`: SupabaseプロジェクトURL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase Anon Key
- `VITE_API_URL`: https://your-vercel-app.vercel.app/api
- `VITE_ENABLE_LOGIN`: true

### 2.2 デプロイコマンド
```bash
# プロジェクトをVercelにリンク
vercel link

# 本番環境へデプロイ
vercel --prod
```

## 3. テストユーザーアクセス情報

### 管理者アカウント
- メール: admin@test-salon.jp
- パスワード: TestUser2024!

### テストユーザー（1-19）
- メール: tester1@test-salon.jp ～ tester19@test-salon.jp
- パスワード: TestUser2024!（共通）

### アクセスURL
- 本番環境: https://your-app.vercel.app

## 4. 動作確認チェックリスト

- [ ] ログイン画面が表示される
- [ ] テストユーザーでログインできる
- [ ] 顧客一覧が表示される
- [ ] 新規顧客を登録できる
- [ ] 顧客情報を編集できる
- [ ] 予約を作成できる
- [ ] 売上データが記録される