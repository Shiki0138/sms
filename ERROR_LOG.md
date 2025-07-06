# エラーログと対策

## 目的
開発中に発生したエラーとその解決策を記録し、今後の開発効率を向上させる。

---

## エラー #001: CORS Policy Error - Google Cloud Storage

### 発生日時
2025年7月5日

### エラー内容
```
Access to script at 'https://storage.googleapis.com/salon-frontend-static/assets/...' 
from origin 'https://salon-management-system-one.vercel.app' has been blocked by CORS policy
```

### 原因
`vite.config.ts`の`base`設定が本番環境でGoogle Cloud Storageを指定していた：
```typescript
base: process.env.NODE_ENV === 'production' ? 'https://storage.googleapis.com/salon-frontend-static/' : '/'
```

### 解決策
Vercelでホスティングする場合は、アセットもVercelから配信するため、baseを`'/'`に設定：
```typescript
base: '/'
```

### 予防策
- 本番環境のアセット配信先を事前に確認する
- デプロイ先に応じたvite.config.tsの設定を行う

---

## エラー #002: Vite Command Not Found

### 発生日時
2025年7月5日

### エラー内容
```
sh: line 1: vite: command not found
Error: Command "cd frontend && npm install && npm run build" exited with 127
```

### 原因
Vercelのビルド環境でviteコマンドが直接利用できない

### 解決策
1. `vercel.json`でビルドコマンドを修正：
   ```json
   "buildCommand": "npm run build",
   "installCommand": "npm install",
   "framework": "vite"
   ```

2. ルートに`package.json`を作成してワークスペース設定：
   ```json
   {
     "scripts": {
       "build": "cd frontend && npm install && npm run build"
     }
   }
   ```

### 予防策
- パッケージマネージャーのコマンドは`npm run`経由で実行
- フレームワーク固有のコマンドは避ける

---

## エラー #003: PostgreSQL Table Not Found

### 発生日時
2025年7月5日

### エラー内容
```
ERROR: 42P01: relation "tenants" does not exist
```

### 原因
テーブル作成前にデータ挿入SQLを実行した

### 解決策
1. 先にスキーマ定義SQL（`schema.sql`）を実行
2. その後、シードデータSQL（`seed-test-users.sql`）を実行

### 予防策
- SQL実行順序を明確にドキュメント化
- 依存関係のあるSQLは統合するか、実行順序を明記

---

## 開発ルール

### 1. エラーログの記録
- 重要なエラーは必ずこのファイルに記録する
- 原因、解決策、予防策を明記する

### 2. 設定ファイルの管理
- 環境依存の設定は環境変数で管理
- デプロイ先に応じた設定を事前に確認

### 3. デプロイ前チェックリスト
- [ ] 環境変数が正しく設定されているか
- [ ] ビルドコマンドが適切か
- [ ] APIエンドポイントが正しいか
- [ ] アセットのパスが正しいか

### 4. テスト手順
1. ローカルでビルド確認：`npm run build`
2. ビルド成果物の確認：`dist/`ディレクトリ
3. 本番環境での動作確認

---

## ワーカーへの指示事項

### 必須確認事項
1. **新機能開発前**：このエラーログを確認
2. **エラー発生時**：同様のエラーがないか確認
3. **解決後**：新しいエラーと解決策を記録

### 開発フロー
1. 機能開発
2. ローカルテスト
3. ビルド確認
4. エラーログ確認
5. デプロイ

### 報告事項
- 新しいエラーパターンを発見した場合は即座に記録
- 既存の解決策が効かない場合は、新しい解決策を追記