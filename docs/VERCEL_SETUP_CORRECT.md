# Vercelプロジェクトの正しい設定方法

## 問題
現在、間違ったプロジェクト（ai-subsidy-system-frontend）にリンクされています。
正しいプロジェクトは `salon-management-system` です。

## 解決手順

### 1. 既存のVercel設定を削除

```bash
cd /Users/leadfive/Desktop/system/salon-management-system/frontend
rm -rf .vercel
```

### 2. 正しいプロジェクトにリンク

```bash
# 対話形式でプロジェクトを選択
vercel link

# プロンプトで以下を選択：
# 1. Set up and deploy "~/Desktop/system/salon-management-system/frontend"? → Y
# 2. Which scope do you want to deploy to? → あなたのスコープを選択
# 3. Link to existing project? → Y
# 4. What's the name of your existing project? → salon-management-system
```

### 3. デプロイ

```bash
# 正しいプロジェクトにデプロイ
vercel --prod
```

または

```bash
npm run deploy
```

## 確認方法

デプロイ後、以下のURLでアクセスできることを確認：
- https://salon-management-system.vercel.app

## トラブルシューティング

### 間違ったプロジェクトが表示される場合

1. Vercelダッシュボード（https://vercel.com/dashboard）にアクセス
2. 正しいプロジェクト名が `salon-management-system` であることを確認
3. プロジェクトが存在しない場合は新規作成

### プロジェクトを新規作成する場合

```bash
# 新規プロジェクトとして設定
vercel

# プロンプトで以下を選択：
# 1. Set up and deploy? → Y
# 2. Which scope? → あなたのスコープ
# 3. Link to existing project? → N
# 4. What's your project's name? → salon-management-system
# 5. In which directory is your code located? → ./
```

## 環境変数の設定

Vercelダッシュボードで以下の環境変数を設定：

```
VITE_API_URL=https://salon-management-system.vercel.app/api
VITE_ENABLE_LOGIN=true
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```