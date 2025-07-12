# 🚀 SMS (Salon Management System) 本番環境セットアップガイド

## 🎯 デプロイ状況
- **フロントエンド**: Vercel (デプロイ済み)
- **バックエンド**: Render.com (デプロイ準備完了)
- **データベース**: Supabase (設定済み)

## 📋 デプロイ手順

### 1. バックエンドデプロイ (Render.com)

1. **Renderアカウントにログイン**
   - https://render.com にアクセス
   - GitHubと連携

2. **新しいWebサービスを作成**
   - "New Web Service" をクリック
   - GitHubリポジトリを選択
   - Root Directory: `backend`

3. **ビルド設定**
   ```
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

4. **環境変数を設定**
   以下の環境変数をRenderダッシュボードで設定：
   ```
   NODE_ENV=production
   PORT=10000
   JWT_SECRET=y2RIDeHc7rqemR5GrUJpMbhxZN/tftC4MtJZL2fdd+E=
   SUPABASE_URL=https://fqwdbywgknavgwqpnlkj.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxd2RieXdna25hdmd3cXBubGtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExNzc2MDQsImV4cCI6MjA2Njc1MzYwNH0._CJ-IvMB1JqotdMQla75qj8U8SFZkEsEi2YWJSeHpMM
   SUPABASE_SERVICE_KEY=[Supabaseから取得]
   CORS_ORIGIN=https://salon-management-system-one.vercel.app
   ALLOWED_ORIGINS=https://salon-management-system-one.vercel.app,https://salon-management-system.vercel.app
   SESSION_SECRET=qR8Kj5hN9pL2vX4wY7zA3bC6dE9fG2hJ5kM8nP3qS6tV9wX2
   ENABLE_DEMO_MODE=false
   ENFORCE_HTTPS=true
   ```

5. **LINEとInstagram設定（後で設定）**
   ```
   LINE_CHANNEL_ACCESS_TOKEN=[お客様が設定]
   LINE_CHANNEL_SECRET=[お客様が設定]
   INSTAGRAM_ACCESS_TOKEN=[お客様が設定]
   INSTAGRAM_APP_SECRET=[お客様が設定]
   ```

### 2. フロントエンド設定確認

1. **Vercelプロジェクト設定**
   - 環境変数が正しく設定されているか確認
   - `VITE_ENABLE_LOGIN=true` が設定されているか確認

2. **API URL更新**
   - バックエンドのRender URLが分かったら
   - `VITE_API_URL=https://[render-app-name].onrender.com/api` に更新

### 3. データベース初期化

1. **Supabase管理画面**
   - https://supabase.com でプロジェクトを確認
   - SQL Editorで必要なテーブル作成

2. **初期データ投入**
   ```sql
   -- 管理者アカウント作成（Supabase Authentication）
   -- メールアドレス: admin@sms-system.com
   -- パスワード: [強力なパスワード]
   ```

## 🔐 セキュリティ設定

### 完了済み
- ✅ JWT秘密鍵の生成
- ✅ CORS設定の本番対応
- ✅ 認証の強制有効化
- ✅ セッション管理の強化
- ✅ Rate Limiting設定
- ✅ セキュリティヘッダー設定

### LINE/Instagram連携設定（お客様作業）

#### LINE設定
1. LINE Developers Consoleでチャネル作成
2. 以下の値を環境変数に設定：
   - `LINE_CHANNEL_ACCESS_TOKEN`
   - `LINE_CHANNEL_SECRET`

#### Instagram設定
1. Facebook Developers Consoleでアプリ作成
2. Instagram Basic Display API設定
3. 以下の値を環境変数に設定：
   - `INSTAGRAM_ACCESS_TOKEN`
   - `INSTAGRAM_APP_SECRET`

## 🚀 デプロイ後の確認

### 1. ヘルスチェック
```bash
# バックエンドの健康状態確認
curl https://[render-url]/health

# フロントエンドアクセス確認
curl https://salon-management-system-one.vercel.app
```

### 2. 認証テスト
1. フロントエンドにアクセス
2. ログイン画面が表示されることを確認
3. Supabaseで作成した管理者アカウントでログイン

### 3. 機能確認
- 顧客管理
- 予約管理
- メッセージ管理
- 分析画面
- 設定画面

## 📊 モニタリング

### ログ確認
- **Render**: サービスダッシュボードでログ確認
- **Vercel**: Function Logsでフロントエンドエラー確認
- **Supabase**: Logsタブでデータベースアクティビティ確認

### パフォーマンス
- **Render**: メトリクスタブで CPU/メモリ使用状況
- **Vercel**: Analyticsでページロード時間
- **Supabase**: Database > Reports でクエリパフォーマンス

## 🆘 トラブルシューティング

### よくある問題

1. **CORS エラー**
   - `ALLOWED_ORIGINS` にフロントエンドURLが含まれているか確認

2. **認証エラー**
   - Supabaseプロジェクト設定を確認
   - JWT秘密鍵が正しく設定されているか確認

3. **データベース接続エラー**
   - Supabase接続情報を確認
   - ネットワーク設定を確認

### ログの確認方法

```bash
# Renderログ確認
# ダッシュボード > Logs タブ

# Vercelログ確認  
# ダッシュボード > Functions > View Function Logs

# Supabaseログ確認
# プロジェクト > Logs > API / Auth / Database
```

## 📞 サポート

システムに問題が発生した場合：
1. 上記トラブルシューティングを確認
2. ログを確認してエラーメッセージを特定
3. 必要に応じて開発チームに連絡

---

**🎉 これで SMS は本番環境で稼働準備完了です！**