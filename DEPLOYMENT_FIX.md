# 🚨 緊急対応：Vercelデプロイ修正手順

## 問題
1. installCommandが古い設定（`echo 'Installing dependencies'`）のまま
2. ブランチが`restore-20250704`でmainではない

## 解決方法

### 方法1: Vercelダッシュボードで設定変更（推奨）

1. **Vercelダッシュボード** にログイン
2. **Settings** > **General** > **Build & Development Settings**
3. 以下を設定：
   - Install Command: `cd frontend && npm install`
   - Build Command: `cd frontend && npm run build`
   - Output Directory: `frontend/dist`
4. **Save**をクリック

### 方法2: ブランチ設定の確認

1. **Settings** > **Git**
2. **Production Branch** が `restore-20250704` になっているか確認
3. もし `main` になっている場合は、`restore-20250704` に変更
4. または、以下のコマンドでmainブランチにマージ：

```bash
git checkout main
git merge restore-20250704
git push origin main
```

### 方法3: 手動で再デプロイ

1. **Deployments** タブを開く
2. 最新のコミット（c3c48b9）の横の「...」メニュー
3. **Redeploy** をクリック
4. **Use different build settings** にチェック
5. Install Command: `cd frontend && npm install`

## 確認事項

修正後、以下を確認：
- ビルドログで `cd frontend && npm install` が実行されている
- viteパッケージが正しくインストールされている
- ビルドが成功している

## 今後の予防策

1. vercel.jsonの変更は必ずGitにプッシュ
2. Vercelのブランチ設定を確認
3. ローカルでビルドテストを実行してから本番デプロイ