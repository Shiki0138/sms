# Vercelデプロイ手順

## 1. 前提条件

- Supabaseのセットアップが完了していること
- 以下の情報を取得済みであること：
  - Supabase Project URL
  - Supabase Anon Key

## 2. Vercelアカウント作成

1. https://vercel.com にアクセス
2. GitHubアカウントでサインイン
3. リポジトリへのアクセスを許可

## 3. プロジェクトインポート

1. Vercelダッシュボードで「New Project」をクリック
2. GitHubリポジトリから `salon-management-system` を選択
3. Framework Preset: `Vite` を選択
4. Root Directory: `./` のまま
5. Build設定を確認：
   - Build Command: `cd frontend && npm install && npm run build`
   - Output Directory: `frontend/dist`

## 4. 環境変数設定

「Environment Variables」セクションで以下を追加：

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `your-supabase-anon-key` |
| `VITE_API_URL` | `https://salon-management-system.vercel.app/api` |
| `VITE_ENABLE_LOGIN` | `true` |

## 5. デプロイ実行

1. 「Deploy」ボタンをクリック
2. デプロイが完了するまで待機（通常2-3分）
3. デプロイ完了後、プロジェクトURLが表示される

## 6. カスタムドメイン設定（オプション）

1. Settings > Domains
2. 独自ドメインを追加
3. DNSレコードを設定

## 7. 本番環境の確認

1. デプロイされたURLにアクセス
2. ログイン画面が表示されることを確認
3. テストユーザーでログイン：
   - Email: `admin@test-salon.jp`
   - Password: `TestUser2024!`

## 8. CI/CD設定

GitHubリポジトリにプッシュすると自動デプロイされます：

- `main`ブランチ → Production環境
- その他のブランチ → Preview環境

## 9. モニタリング

Vercelダッシュボードで以下を確認：

- Functions タブ: API関数の実行状況
- Analytics タブ: アクセス状況
- Logs タブ: エラーログ

## トラブルシューティング

### ビルドエラーが発生する場合

1. Build Logsを確認
2. 依存関係のインストールエラーを確認
3. TypeScriptエラーを確認

### 404エラーが発生する場合

1. `vercel.json` の設定を確認
2. API routesが正しく設定されているか確認

### 環境変数が反映されない場合

1. 環境変数名が正しいか確認
2. デプロイを再実行

## セキュリティ注意事項

- Service Role Keyは**絶対に**クライアント側の環境変数に設定しない
- 本番環境では強力なパスワードポリシーを設定
- 定期的にアクセスログを確認