# Vercel環境変数設定ガイド

## 🔧 必須環境変数

### 1. 認証・基本設定
```bash
VITE_ENABLE_LOGIN=true
VITE_API_URL=https://salon-management-system-one.vercel.app/api
```

### 2. データベース接続
```bash
DATABASE_URL=postgresql://[user]:[password]@[host]:5432/[database]?sslmode=require
NEXT_PUBLIC_SUPABASE_URL=https://fqwdbywgknavgwqpnlkj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxd2RieXdna25hdmd3cXBubGtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExNzc2MDQsImV4cCI6MjA2Njc1MzYwNH0._CJ-IvMB1JqotdMQla75qj8U8SFZkEsEi2YWJSeHpMM
```

### 3. 外部API連携
```bash
# Stripe決済
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...

# LINE Messaging API
LINE_CHANNEL_SECRET=...
LINE_CHANNEL_ACCESS_TOKEN=...

# OpenAI API
OPENAI_API_KEY=sk-...

# Instagram Business API
INSTAGRAM_ACCESS_TOKEN=...
INSTAGRAM_BUSINESS_ACCOUNT_ID=...

# Twilio SMS
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...
```

### 4. セキュリティ設定
```bash
JWT_SECRET=4f195d53c4d33c4f1b31ce516cbe5bc992e9aa80d28d62af41d1d2cafffae0ab
REFRESH_TOKEN_SECRET=993c388d06f267eb6ff1656fdb7fd0024aec22a3b7ce78b3480a846351ec2743
SESSION_SECRET=4f195d53c4d33c4f1b31ce516cbe5bc992e9aa80d28d62af41d1d2cafffae0ab
```

## 📝 設定手順

1. Vercelダッシュボードにログイン
2. プロジェクト設定 → Environment Variables
3. 上記の環境変数を一つずつ追加
4. 本番環境（Production）にチェック
5. Save で保存

## ⚠️ 重要な注意事項

- DATABASE_URLは実際のSupabaseプロジェクトから取得
- APIキーは本番用のものを使用（test/devキーは使わない）
- 環境変数設定後は必ず再デプロイが必要

## 🔄 確認方法

```bash
# ローカルでビルドテスト
cd frontend
npm run build

# Vercel CLIでの確認
vercel env ls
```

## 🚀 デプロイコマンド

```bash
# 環境変数設定後の再デプロイ
vercel --prod
```