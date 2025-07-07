# 🚨 Vercel 404エラー解決手順

## 現在の問題
- DEPLOYMENT_NOT_FOUND エラー
- 古いプロジェクトIDが残存
- 新しいプロジェクトへの接続が必要

## 解決手順

### 1. Vercelプロジェクトの再接続

```bash
# 1. 古い設定を削除
rm -rf frontend/.vercel
rm -rf .vercel

# 2. フロントエンドディレクトリに移動
cd frontend

# 3. Vercel CLIでプロジェクトをリンク
vercel link

# 4. デプロイ実行
vercel --prod
```

### 2. 手動デプロイ（CLIが使えない場合）

1. **GitHub連携を確認**
   - Vercelダッシュボード → Import Git Repository
   - リポジトリ: Shiki0138/sms
   - ブランチ: main

2. **プロジェクト設定**
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

3. **環境変数設定**
   ```
   VITE_API_URL=https://salon-management-system-one.vercel.app/api
   VITE_ENABLE_LOGIN=true
   VITE_SUPABASE_URL=https://fqwdbywgknavgwqpnlkj.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### 3. 代替デプロイ方法

#### Option A: Netlifyへのデプロイ
```bash
# Netlify CLIインストール
npm install -g netlify-cli

# デプロイ
cd frontend
npm run build
netlify deploy --prod --dir=dist
```

#### Option B: GitHub Pagesへのデプロイ
```bash
# gh-pagesパッケージインストール
npm install --save-dev gh-pages

# package.jsonに追加
"scripts": {
  "deploy": "vite build && gh-pages -d dist"
}

# デプロイ実行
npm run deploy
```

## 確認事項

1. **Vercelアカウント**
   - 正しいアカウントでログインしているか
   - プロジェクトが存在するか
   - デプロイ権限があるか

2. **GitHubリポジトリ**
   - Vercelと連携されているか
   - mainブランチが最新か
   - アクセス権限があるか

3. **ビルド設定**
   - Root Directoryが正しいか（frontend）
   - Build Commandが正しいか
   - Output Directoryが正しいか（dist）

## 推奨アクション

1. Vercelダッシュボードで新規プロジェクト作成
2. GitHubリポジトリを再インポート
3. 上記の設定を適用
4. デプロイ実行

これで404エラーが解決されるはずです。