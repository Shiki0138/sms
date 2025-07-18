# トラブルシューティングガイド

## 問題：ローカルでも本番でも画面が表示されない

### 確認事項と解決方法

#### 1. ローカル環境の確認

**開発サーバーの起動**
```bash
cd frontend
npm run dev
```

**アクセスURL**
- http://localhost:4004/ （ポート番号は起動時のログで確認）

#### 2. ブラウザでの確認事項

**デベロッパーツールを開く**（F12キー）
1. **Console**タブでエラーを確認
2. **Network**タブでリソースの読み込み状況を確認
3. **Elements**タブでHTMLが正しく表示されているか確認

#### 3. 環境変数の確認

**ローカル環境**
- `.env.development` に `VITE_ENABLE_LOGIN=false` を追加済み
- 開発サーバーを再起動してください

**本番環境（Vercel）**
1. Vercelダッシュボードにログイン
2. Settings → Environment Variables
3. 以下を追加：
   - `VITE_ENABLE_LOGIN` = `false`
4. 再デプロイを実行

#### 4. よくある問題と解決方法

**白い画面が表示される場合**
- JavaScriptエラーが発生している可能性
- ブラウザのコンソールでエラーを確認

**404エラーの場合**
- URLが正しいか確認
- Vercelのデプロイが成功しているか確認

**ログイン画面が表示される場合**
- 環境変数が反映されていない
- ブラウザキャッシュをクリア（Ctrl+Shift+R）
- プライベートブラウジングモードで確認

#### 5. デプロイ状況の確認

**Vercelダッシュボード**
1. Deploymentsタブで最新のデプロイ状況を確認
2. ビルドログでエラーがないか確認
3. 「Ready」ステータスになっているか確認

#### 6. 緊急対応

もし上記で解決しない場合：
1. ブラウザのコンソールエラーのスクリーンショットを取る
2. Vercelのビルドログを確認
3. 具体的なエラーメッセージを報告してください