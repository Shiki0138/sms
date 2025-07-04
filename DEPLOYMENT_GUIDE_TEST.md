# 🚀 テスト環境デプロイガイド

## 前提条件

- GitHubアカウント
- Vercelアカウント
- Supabaseプロジェクト（作成済み）

## 手順

### 1. Supabaseでデータベース準備

1. Supabaseダッシュボードにログイン
2. SQL Editorで以下を実行：

```sql
-- schema.prismaに基づいてテーブルを作成
-- (Prismaで自動生成されるため、手動作成は不要)
```

3. 以下のコマンドでスキーマを適用：
```bash
cd backend
npx prisma db push --schema=../prisma/schema.prisma
```

### 2. テストユーザー作成

```bash
# 環境変数を設定
cp .env.test .env

# テストユーザー作成スクリプトを実行
./scripts/create-test-users.sh
```

### 3. Vercelへデプロイ

#### フロントエンド

1. GitHubにプッシュ
```bash
git add .
git commit -m "Add test environment setup"
git push origin main
```

2. Vercelダッシュボード
- 「New Project」をクリック
- GitHubリポジトリを選択
- 設定：
  - Framework Preset: `Vite`
  - Root Directory: `frontend`
  - Build Command: `npm run build`
  - Output Directory: `dist`

3. 環境変数を設定：
```
VITE_API_URL=デプロイしたバックエンドのURL
VITE_SUPABASE_URL=https://fqwdbywgknavgwqpnlkj.supabase.co
VITE_SUPABASE_ANON_KEY=あなたのキー
VITE_TEST_MODE=true
```

#### バックエンド（オプション1: Railway）

1. [Railway](https://railway.app)にログイン
2. 「New Project」→「Deploy from GitHub repo」
3. 環境変数を設定：
```
DATABASE_URL=Supabaseの接続文字列
JWT_SECRET=test-jwt-secret
NODE_ENV=test
PORT=4002
```

#### バックエンド（オプション2: Render）

1. [Render](https://render.com)にログイン
2. 「New Web Service」
3. GitHubリポジトリを接続
4. 設定：
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

### 4. デプロイ後の確認

1. フロントエンドURL: `https://your-app.vercel.app`
2. バックエンドURL: `https://your-api.railway.app`

### 5. テストユーザーに共有

`TEST_USER_GUIDE.md`を参照して、以下を共有：
- システムURL
- ログイン情報
- テスト項目
- フィードバック方法

## トラブルシューティング

### CORS エラー
バックエンドの`cors`設定にフロントエンドURLを追加

### データベース接続エラー
- DATABASE_URLが正しいか確認
- Supabaseの接続プーリングを使用

### ビルドエラー
- Node.jsバージョンを18以上に設定
- TypeScriptのビルドエラーを確認

## セキュリティ注意事項

⚠️ テスト環境でも以下に注意：
- 実際の顧客データは入力しない
- パスワードは安全なものを使用
- テスト終了後はデータを削除