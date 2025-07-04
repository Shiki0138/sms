# 🚀 Vercelデプロイメントガイド

## 現在の状況
✅ GitHubにコードをpush完了 (ブランチ: `restore-20250704`)
✅ Vercel設定ファイル準備完了
✅ 環境変数設定完了

## Vercelでの設定手順

### 1. Vercelダッシュボードにアクセス
1. https://vercel.com にアクセス
2. GitHubアカウントでログイン

### 2. 新しいプロジェクトの作成
1. 「New Project」をクリック
2. 「Import Git Repository」を選択
3. リポジトリ `Shiki0138/sms` を選択

### 3. プロジェクト設定
```
Project Name: salon-management-system
Framework Preset: Other
Root Directory: ./
Build Command: cd frontend && npm install && npm run build
Output Directory: frontend/dist
Install Command: npm install
```

### 4. 環境変数の設定
以下の環境変数を設定：

```
NODE_ENV=production
VITE_ENABLE_LOGIN=true
VITE_APP_NAME=美容室統合管理システム
VITE_API_URL=  (空白のまま - 相対パスを使用)
```

### 5. デプロイブランチの指定
- Production Branch: `restore-20250704`

### 6. デプロイ実行
1. 「Deploy」ボタンをクリック
2. ビルドログを確認
3. エラーがあれば修正

## 期待される結果

### ✅ 成功時
- デプロイURL: `https://salon-management-system-xxx.vercel.app`
- ログイン画面が表示される
- API呼び出しが正常に動作する

### ⚠️ 注意点
- 初回デプロイ時はビルド時間が長い場合があります
- エラーが発生した場合は、ビルドログを確認してください

## テスト手順

### 1. 基本動作確認
- [ ] サイトにアクセスできるか
- [ ] ログイン画面が表示されるか
- [ ] レスポンシブデザインが正常か

### 2. API動作確認
- [ ] `/api/health` でヘルスチェック
- [ ] `/api/v1/auth/login` でログインテスト

### 3. 環境確認
- [ ] 本番環境でログイン機能が有効か
- [ ] 開発環境との動作の違いを確認

## トラブルシューティング

### よくあるエラー
1. **ビルドエラー**: TypeScriptエラーの場合
2. **環境変数エラー**: 設定漏れの場合
3. **API 404エラー**: API関数の配置ミス

### 解決方法
- Vercelのビルドログを確認
- 環境変数の再設定
- ブランチの確認

---
**作成日**: 2025-07-04
**作成者**: デプロイメント担当