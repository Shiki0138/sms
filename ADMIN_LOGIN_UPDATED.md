# 管理者ログイン情報（更新版）

## 新しい管理者アカウント

### ログイン情報
- **メールアドレス**: `greenroom51@gmail.com`
- **パスワード**: Supabaseで設定したパスワード
- **権限**: システム管理者（ADMIN）

## 修正手順

### 1. 既にSupabase Authにユーザーが作成されている場合
1. **SQL修正スクリプトを実行**
   - Supabase SQL Editorで `fix-admin-auth.sql` を実行
   - これによりpasswordカラムの制約が解決されます

### 2. まだSupabase Authにユーザーが作成されていない場合
1. **Supabaseダッシュボードでユーザー作成**
   - Authentication > Users > 「Add user」
   - Email: `greenroom51@gmail.com`
   - Password: お好みのパスワード（例：`Admin2025!`）

2. **SQL修正スクリプトを実行**
   - `fix-admin-auth.sql` を実行

## 変更点

### 技術的な変更
1. **staffテーブルのpasswordカラム**: NOT NULL制約を削除
2. **Supabase Auth統合**: 認証はauth.usersテーブルで管理
3. **ID連携**: Supabase AuthのUUIDとstaffテーブルのidを連携

### セキュリティ向上
- パスワードハッシュはSupabaseが安全に管理
- 2FA（二要素認証）も将来的に設定可能
- セッション管理も自動化

## ログイン手順

1. **本番サイトにアクセス**
   - https://sms-henna-one.vercel.app

2. **ログイン**
   - Email: `greenroom51@gmail.com`
   - Password: Supabaseで設定したパスワード

3. **確認事項**
   - 管理者権限でログイン
   - 全機能にアクセス可能
   - データの読み書きが可能

## トラブルシューティング

### エラーが発生した場合
1. **"User not found"**: Supabase Authにユーザーが作成されているか確認
2. **"Invalid credentials"**: パスワードが正しいか確認
3. **"Permission denied"**: SQL修正スクリプトが実行されているか確認

### 確認コマンド
```sql
-- ユーザーの存在確認
SELECT email, email_confirmed_at FROM auth.users WHERE email = 'greenroom51@gmail.com';

-- スタッフテーブルとの連携確認
SELECT s.email, s.name, s.role, u.email_confirmed_at 
FROM staff s 
JOIN auth.users u ON s.id = u.id 
WHERE s.email = 'greenroom51@gmail.com';
```