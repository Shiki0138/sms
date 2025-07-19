# 開発ルール

## 目的
チーム全体で統一された開発手法を確立し、エラーを最小限に抑える。

---

## 最重要：ビルドエラー防止ルール

### 🚨 必須参照ドキュメント
**全ての開発者は `frontend/BUILD_ERROR_REFERENCE.md` を必ず参照すること**
- ビルド/デプロイエラー発生時は、まずE01-E120のエラーコードを確認
- 該当するパターンの解決策を優先的に適用
- 新規エラーパターンは必ずドキュメントに追記

---

## 必須ルール

### 1. エラー管理
- **ビルド/デプロイエラー発生時**: 
  1. `BUILD_ERROR_REFERENCE.md`でEコードを確認
  2. 該当しない場合は`ERROR_LOG.md`に記録
- **解決後**: 原因と対策を明記（Eコードも併記）
- **新規開発前**: 既存のエラーログとビルドエラーリファレンスを確認

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
fix(E##): ビルドエラー修正（Eコード付き）
docs: ドキュメント更新
style: コードスタイル修正
refactor: リファクタリング
test: テスト追加・修正
chore: ビルド・設定変更
```

### 6. ビルドエラー対策チェックリスト
開発前に以下を確認：
- [ ] Node.jsバージョンが統一されている（E01対策）
- [ ] package-lock.jsonが存在する（E02対策）
- [ ] 環境変数が正しく設定されている（E05, E56対策）
- [ ] 大文字小文字が正しい（E06対策）
- [ ] TypeScript設定が適切（E08対策）

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

### 🚨 エラー発生時の対処フロー
1. **まず `BUILD_ERROR_REFERENCE.md` のE01-E120を確認**
2. 該当するEコードがあれば、その解決策を適用
3. 解決しない場合は以下の手順へ

### 白画面になる場合
1. ブラウザのコンソールを確認
2. Network タブでアセットの読み込みエラーを確認（E38, E98参照）
3. `vite.config.ts`のbase設定を確認（E48参照）

### ビルドエラー
1. `BUILD_ERROR_REFERENCE.md`でエラーメッセージを検索
2. `node_modules`を削除して再インストール（E02, E16-E35対策）
3. `package-lock.json`を削除して再生成
4. Node.jsのバージョンを確認（18以上推奨）（E01対策）

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
- 新しいビルドエラーパターンは`BUILD_ERROR_REFERENCE.md`に追記
- 解決できない問題は早めにエスカレーション

---

## Claude Code専用ルール

Claude Codeとして作業する際は：
1. **セッション開始時に必ず`BUILD_ERROR_REFERENCE.md`を参照**
2. ビルド/デプロイエラー発生時は、まずEコードでの分類を試みる
3. 解決策適用時は「E##の対策として〜」と明示する
4. 新規パターンを発見したら、ユーザーに報告し`BUILD_ERROR_REFERENCE.md`の更新を提案