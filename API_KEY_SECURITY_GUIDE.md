# 🔐 APIキー セキュリティガイド

## ⚠️ 重要な警告

**絶対に`.env`ファイルをGitHubにプッシュしないでください！**

APIキーが公開されると：
- 🚨 他人があなたのAPIキーを悪用して高額な請求が発生する可能性
- 🚫 OpenAIがあなたのAPIキーを即座に無効化
- 💸 予期しない課金が発生
- 🔓 システムのセキュリティが危険にさらされる

## ✅ 安全な設定方法

### 1. ローカル開発環境での設定

```bash
# backend/.envファイルを作成（既に.gitignoreに含まれています）
cd backend
cp .env.example .env

# .envファイルを編集
OPENAI_API_KEY=sk-あなたの実際のAPIキー
```

### 2. 確認事項

```bash
# .gitignoreに.envが含まれていることを確認（✅既に確認済み）
cat .gitignore | grep .env

# git statusで.envがトラッキングされていないことを確認
git status
# .envファイルが表示されないことを確認
```

### 3. 万が一誤ってコミットした場合の対処法

```bash
# 履歴から完全に削除
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch backend/.env" \
  --prune-empty --tag-name-filter cat -- --all

# または、より簡単な方法（BFG Repo-Cleaner使用）
bfg --delete-files .env
git push origin --force --all
```

**重要**: 一度でも公開されたAPIキーは、即座にOpenAIダッシュボードで無効化し、新しいキーを生成してください。

## 🚀 本番環境でのベストプラクティス

### 1. 環境変数サービスの利用

#### Google Cloud Run（推奨）
```bash
# Cloud Runに環境変数を設定
gcloud run services update salon-backend \
  --set-env-vars OPENAI_API_KEY=sk-xxxxx \
  --region asia-northeast1
```

#### Vercel
```bash
# Vercelダッシュボードで設定
vercel env add OPENAI_API_KEY production
```

#### Heroku
```bash
heroku config:set OPENAI_API_KEY=sk-xxxxx
```

### 2. シークレット管理サービス

#### Google Secret Manager
```bash
# シークレットを作成
echo -n "sk-xxxxx" | gcloud secrets create openai-api-key --data-file=-

# アプリケーションで使用
gcloud secrets versions access latest --secret="openai-api-key"
```

#### AWS Secrets Manager
```bash
aws secretsmanager create-secret \
  --name prod/salon/openai-key \
  --secret-string "sk-xxxxx"
```

## 📋 チェックリスト

開発開始前に必ず確認：

- [ ] `.env`ファイルが`.gitignore`に含まれている
- [ ] `.env.example`には実際のキーが含まれていない
- [ ] `git status`で`.env`が表示されない
- [ ] APIキーをコード内に直接記載していない
- [ ] 環境変数から読み込むようになっている

## 🛡️ セキュリティのベストプラクティス

### 1. APIキーの制限

OpenAIダッシュボードで：
- 使用量制限を設定（月額上限）
- IPアドレス制限（可能な場合）
- 使用状況の定期的な監視

### 2. キーのローテーション

- 3ヶ月ごとにAPIキーを更新
- 不審なアクセスがあった場合は即座に更新
- 古いキーは必ず無効化

### 3. アクセスログの監視

```javascript
// backend/src/services/aiSupportService.ts
// APIコール時にログを記録
console.log(`AI API called at ${new Date().toISOString()} by user ${userId}`)
```

## 🆘 緊急時の対応

### APIキーが漏洩した場合

1. **即座に無効化**
   - [OpenAI API Keys](https://platform.openai.com/api-keys)にアクセス
   - 該当のキーを「Revoke」

2. **新しいキーを生成**
   - 「Create new secret key」をクリック
   - 新しいキーを安全に保管

3. **影響範囲の確認**
   - OpenAIダッシュボードで使用量を確認
   - 不正な使用がないかチェック

4. **システムの更新**
   - 新しいキーで`.env`を更新
   - 本番環境の環境変数も更新

## 📚 参考リンク

- [OpenAI API Keys Best Practices](https://platform.openai.com/docs/guides/production-best-practices)
- [GitHub: Removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [12 Factor App: Config](https://12factor.net/config)

---

**Remember**: APIキーは**パスワードと同じ**です。絶対に公開しないでください！