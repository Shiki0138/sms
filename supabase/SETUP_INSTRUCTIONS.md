# Supabaseセットアップ手順

## エラーが発生した場合の対処法

### 状況
「trigger "update_tenants_updated_at" for relation "tenants" already exists」というエラーが出ています。
これは、テーブルが既に存在していることを示しています。

### 推奨手順

## 1. 既存のデータを確認（必須）
まず、現在の状態を確認してください：

```sql
-- check-existing-tables.sql を実行
-- 既存のテーブルとデータ数を確認
```

## 2. 安全なセットアップを実行

### オプションA: 既存データを保持したまま追加（推奨）
```sql
-- safe-beta-setup.sql を実行
-- 既存のデータに影響を与えずにベータテスターアカウントを追加
```

### オプションB: クリーンインストール（注意！）
**⚠️ 警告: すべてのデータが削除されます**

```sql
-- 1. 既存のテーブルを削除
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

-- 2. schema.sql を実行
-- 3. beta-test-setup.sql を実行
```

## 3. Supabase認証の設定

### Supabaseダッシュボードでの設定

1. **Authentication > Providers**
   - Email認証を有効化
   - パスワードの最小文字数: 8

2. **Authentication > URL Configuration**
   - Site URL: `https://sms-henna-one.vercel.app`
   - Redirect URLs: `https://sms-henna-one.vercel.app/*`

3. **SQL Editor で実行**
   ```sql
   -- Supabase Authとスタッフテーブルを連携
   CREATE OR REPLACE FUNCTION public.handle_new_user()
   RETURNS trigger AS $$
   BEGIN
     UPDATE staff 
     SET "lastLoginAt" = NOW()
     WHERE email = NEW.email;
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;

   -- トリガー作成
   CREATE TRIGGER on_auth_user_created
     AFTER INSERT ON auth.users
     FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
   ```

## 4. 動作確認

1. **テストアカウントでログイン**
   ```
   メール: tester01@salon.com
   パスワード: beta2024!
   ```

2. **基本操作の確認**
   - 顧客登録
   - 顧客一覧表示
   - データの永続化

## トラブルシューティング

### Q: ログインできない
A: 以下を確認してください：
1. Supabaseで認証が有効になっているか
2. 環境変数が正しく設定されているか
3. パスワードが正しいか（beta2024!）

### Q: データが保存されない
A: 以下を確認してください：
1. RLS（Row Level Security）が適切に設定されているか
2. ネットワーク接続があるか
3. ブラウザのコンソールでエラーを確認

### Q: Permission deniedエラー
A: RLSポリシーを確認してください：
```sql
-- RLSを一時的に無効化してテスト
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE reservations DISABLE ROW LEVEL SECURITY;
-- テスト後は必ず有効化
```

## 次のステップ

1. ✅ safe-beta-setup.sql を実行
2. ✅ 作成されたアカウントを確認
3. ✅ Vercelの環境変数を確認
4. ✅ テストログインを実施
5. ✅ ベータテスターにガイドを配布