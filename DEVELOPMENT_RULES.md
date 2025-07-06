# 開発ルール

## 目的
チーム全体で統一された開発手法を確立し、エラーを最小限に抑える。

---

## 必須ルール

### 1. エラー管理
- **エラー発生時**: 必ず`ERROR_LOG.md`に記録
- **解決後**: 原因と対策を明記
- **新規開発前**: 既存のエラーログを確認

### 2. 環境設定
```bash
# 開発環境
VITE_API_URL=http://localhost:3000/api
VITE_ENABLE_LOGIN=false

# 本番環境
VITE_API_URL=https://your-app.vercel.app/api
VITE_ENABLE_LOGIN=true
```

### 3. デプロイ前チェックリスト
- [ ] `npm run build` でローカルビルド成功
- [ ] 環境変数が正しく設定されている
- [ ] APIエンドポイントが正しい
- [ ] vite.config.tsのbase設定が適切

### 4. ブランチ戦略
- `main`: 本番環境
- `develop`: 開発環境
- `feature/*`: 機能開発
- `fix/*`: バグ修正

### 5. コミットメッセージ
```
feat: 新機能追加
fix: バグ修正
docs: ドキュメント更新
style: コードスタイル修正
refactor: リファクタリング
test: テスト追加・修正
chore: ビルド・設定変更
```

---

## Vercelデプロイ設定

### 必須設定
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "frontend/dist",
  "installCommand": "npm install",
  "framework": "vite"
}
```

### 環境変数
- `VITE_API_URL`: APIエンドポイント
- `VITE_ENABLE_LOGIN`: ログイン機能の有効化
- `NEXT_PUBLIC_SUPABASE_URL`: SupabaseプロジェクトURL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase公開キー

---

## APIエンドポイント規約

### 構造
```
/api
  /auth
    /login    # POST: ログイン
    /logout   # POST: ログアウト
  /customers  # GET, POST, PUT, DELETE
  /reservations # GET, POST, PUT, DELETE
```

### レスポンス形式
```json
{
  "success": true,
  "data": {},
  "message": "成功メッセージ"
}
```

---

## トラブルシューティング

### 白画面になる場合
1. ブラウザのコンソールを確認
2. Network タブでアセットの読み込みエラーを確認
3. `vite.config.ts`のbase設定を確認

### ビルドエラー
1. `node_modules`を削除して再インストール
2. `package-lock.json`を削除して再生成
3. Node.jsのバージョンを確認（18以上推奨）

---

## ワーカー間の連携

### 作業開始時
1. 最新の`main`ブランチをpull
2. `ERROR_LOG.md`を確認
3. 新しいfeatureブランチを作成

### 作業終了時
1. エラーが発生した場合は`ERROR_LOG.md`に記録
2. PRを作成してレビュー依頼
3. マージ後、他のワーカーに通知

### 情報共有
- 重要な変更は`DEVELOPMENT_RULES.md`に追記
- 新しいエラーパターンは即座に共有
- 解決できない問題は早めにエスカレーション