# Supabase認証設定ガイド

## 1. Supabase Authユーザー作成

### 手順1: Supabaseダッシュボードで管理者ユーザーを作成

1. **Supabaseダッシュボードにログイン**
   - https://app.supabase.com にアクセス
   - プロジェクト「salon-management-system」を選択

2. **Authenticationセクション**
   - サイドバーの「Authentication」をクリック
   - 「Users」タブを選択

3. **新しいユーザーを作成**
   - 「Add user」または「Create new user」ボタンをクリック
   - 以下の情報を入力：
     - **Email**: `admin@sms-system.com`
     - **Password**: `Admin2025!`
     - **Email confirm**: ✅ チェック

4. **ユーザー作成を確認**
   - ユーザーが作成されたことを確認
   - UUIDが自動生成されることを確認

### 手順2: SQLでスタッフテーブルとの連携

1. **SQL Editorを開く**
   - サイドバーの「SQL Editor」をクリック

2. **create-admin-with-auth.sqlを実行**
   ```sql
   -- 管理者ユーザー情報を確認
   SELECT 
       id,
       email,
       email_confirmed_at,
       created_at
   FROM auth.users 
   WHERE email = 'admin@sms-system.com';
   
   -- スタッフテーブルに管理者情報を追加/更新
   INSERT INTO staff (
       id,
       email, 
       name, 
       role, 
       "tenantId", 
       "isActive",
       "createdAt",
       "updatedAt"
   ) VALUES (
       (SELECT id FROM auth.users WHERE email = 'admin@sms-system.com'),
       'admin@sms-system.com',
       'システム管理者',
       'ADMIN',
       'beta-salon-001',
       true,
       NOW(),
       NOW()
   ) ON CONFLICT (id) DO UPDATE SET
       email = EXCLUDED.email,
       name = EXCLUDED.name,
       role = EXCLUDED.role,
       "isActive" = EXCLUDED."isActive",
       "updatedAt" = NOW();
   ```

## 2. 認証設定の確認

### URL設定
1. **Authentication > Settings**
   - Site URL: `https://sms-henna-one.vercel.app`
   - Redirect URLs: `https://sms-henna-one.vercel.app/*`

### Email設定
1. **Authentication > Settings > Email**
   - Email confirmationを有効にする
   - 必要に応じてカスタムSMTPを設定

## 3. 動作確認

### ログインテスト
1. **本番サイトでテスト**
   - URL: https://sms-henna-one.vercel.app
   - Email: `admin@sms-system.com`
   - Password: `Admin2025!`

2. **確認ポイント**
   - ログイン成功
   - 管理者権限でアクセス可能
   - データの読み書き可能

## 4. 追加のベータテスターアカウント（オプション）

同様の手順で20名のベータテスターアカウントを作成可能：

```
tester01@salon.com - tester20@salon.com
パスワード: beta2024!
```

## 5. トラブルシューティング

### よくある問題
1. **"User not found"エラー**
   - Supabase Authにユーザーが作成されているか確認
   - メールアドレスが正確か確認

2. **"Invalid credentials"エラー**
   - パスワードが正しいか確認
   - Email confirmationが完了しているか確認

3. **"Permission denied"エラー**
   - RLSポリシーの設定を確認
   - staffテーブルとauth.usersの連携を確認

### デバッグ方法
1. **ブラウザの開発者ツールでエラーを確認**
2. **Supabase Logsでエラーを確認**
3. **SQL Editorでデータの整合性を確認**