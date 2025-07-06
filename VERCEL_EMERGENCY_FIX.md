# 🚨 Vercel 緊急修正手順

## 現在の問題
- Vercelが古いbuildCommand `cd frontend && npm install && npx vite build` を使用
- vercel.jsonの変更が反映されていない

## 即座に実行すべき手順

### Step 1: Vercelダッシュボードで設定変更

1. **https://vercel.com** にアクセスしてログイン
2. **salon-management-system** プロジェクトを選択
3. **Settings** タブをクリック
4. **Build & Development Settings** を選択

### Step 2: ビルド設定を手動で変更

以下の設定に変更：

```
Framework Preset: Vite
Root Directory: ./
Build Command: cd frontend && npm run build
Output Directory: frontend/dist
Install Command: cd frontend && npm install
```

### Step 3: 環境変数の確認

**Environment Variables** で以下が設定されているか確認：

```
VITE_API_URL=https://salon-management-system-one.vercel.app/api
VITE_ENABLE_LOGIN=true
NEXT_PUBLIC_SUPABASE_URL=https://fqwdbywgknavgwqpnlkj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxd2RieXdna25hdmd3cXBubGtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExNzc2MDQsImV4cCI6MjA2Njc1MzYwNH0._CJ-IvMB1JqotdMQla75qj8U8SFZkEsEi2YWJSeHpMM
```

### Step 4: 再デプロイ実行

1. **Deployments** タブに移動
2. **Redeploy** ボタンをクリック
3. **Use existing Build Cache** のチェックを外す
4. **Redeploy** を実行

## 代替手順（上記で解決しない場合）

### Vercel CLIでのデプロイ

```bash
# Vercel CLIをインストール（未インストールの場合）
npm install -g vercel

# プロジェクトディレクトリで実行
cd /Users/MBP/Desktop/system/salon-management-system
vercel --prod
```

### ローカルビルドテスト

```bash
cd frontend
npm install
npm run build
```

これが成功すれば、Vercelの設定問題です。

## トラブルシューティング

### 問題: vercel.jsonが無視される
- **原因**: ダッシュボードの設定が優先される
- **解決**: ダッシュボードで手動設定変更

### 問題: 依然として古いコマンドが実行される
- **原因**: キャッシュまたは設定の反映遅延
- **解決**: 
  1. Build Cacheを無効化
  2. 5-10分待ってから再試行
  3. Vercelサポートに連絡

## 成功の確認方法

デプロイログで以下を確認：
1. `Running "install" command: cd frontend && npm install`
2. `Running "build" command: cd frontend && npm run build`
3. `vite build` が実行される（`npx vite build` ではない）

## 緊急連絡先

Vercelサポート: https://vercel.com/help
Discord: Vercel Community