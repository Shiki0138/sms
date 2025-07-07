# 🚀 Vercel手動デプロイ手順

## 手順1: Vercelダッシュボードでの設定

1. **Vercelにログイン**
   - https://vercel.com/dashboard

2. **新規プロジェクト作成**
   - 「New Project」をクリック
   - 「Import Git Repository」を選択

3. **GitHubリポジトリを選択**
   - リポジトリ: `Shiki0138/sms`
   - ブランチ: `main`

4. **プロジェクト設定**（重要）
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build  
   Output Directory: dist
   Install Command: npm install
   ```

5. **環境変数を追加**
   以下をEnvironment Variablesに追加：
   ```
   VITE_API_URL=https://your-project-name.vercel.app/api
   VITE_ENABLE_LOGIN=true
   VITE_SUPABASE_URL=https://fqwdbywgknavgwqpnlkj.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxd2RieXdna25hdmd3cXBubGtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExNzc2MDQsImV4cCI6MjA2Njc1MzYwNH0._CJ-IvMB1JqotdMQla75qj8U8SFZkEsEi2YWJSeHpMM
   ```

6. **デプロイ実行**
   - 「Deploy」ボタンをクリック

## 手順2: 既存プロジェクトがある場合

1. **プロジェクト削除**
   - Settings → Delete Project
   - プロジェクト名を入力して削除

2. **新規作成**
   - 上記の手順1を実行

## 手順3: デプロイ後の確認

1. **ビルドログ確認**
   - エラーがないか確認
   - 特に`frontend`ディレクトリが正しく認識されているか

2. **デプロイメントURL確認**
   - https://[your-project-name].vercel.app

## よくある問題と解決策

### 問題1: 404 Not Found
**原因**: Root Directoryが正しくない
**解決**: Root Directoryを`frontend`に設定

### 問題2: Module not found
**原因**: Install Commandが実行されていない  
**解決**: Install Commandを`npm install`に設定

### 問題3: Build failed
**原因**: Build Commandが正しくない
**解決**: Build Commandを`npm run build`に設定

### 問題4: 白い画面
**原因**: SPAルーティングが設定されていない
**解決**: vercel.jsonでrewritesを設定済み

## 代替: Vercel CLIでのデプロイ

```bash
# 1. 古い設定を削除
rm -rf frontend/.vercel

# 2. frontendディレクトリに移動
cd frontend

# 3. Vercel CLIでログイン
vercel login

# 4. プロジェクトをセットアップ
vercel

# 質問に答える:
# - Set up and deploy? → Y
# - Which scope? → 自分のアカウントを選択
# - Link to existing project? → N
# - Project name? → salon-management-system
# - In which directory? → ./
# - Override settings? → N

# 5. 本番デプロイ
vercel --prod
```

## 最終チェックリスト

- [ ] GitHubリポジトリが最新
- [ ] frontendディレクトリにpackage.jsonがある
- [ ] npm run buildが成功する
- [ ] vercel.jsonが正しく設定されている
- [ ] 環境変数が設定されている

これらの手順で404エラーは解決されるはずです。