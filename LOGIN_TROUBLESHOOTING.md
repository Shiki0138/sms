# ログイン問題のトラブルシューティング

## 確認手順

### 1. Supabaseでのデバッグ
以下のスクリプトを順番に実行してください：

```sql
-- debug-login.sql の内容を実行
```

### 2. 考えられる問題と解決策

#### A. Supabase Authにユーザーが存在しない
**確認方法：**
- Supabaseダッシュボード > Authentication > Users
- `greenroom51@gmail.com` があるかチェック

**解決方法：**
1. ユーザーを手動で作成
2. Email: `greenroom51@gmail.com`
3. Password: `Admin2025!`（または任意）
4. Email confirm: ✅ チェック

#### B. email_confirmed_at が NULL
**確認方法：**
```sql
SELECT email, email_confirmed_at FROM auth.users WHERE email = 'greenroom51@gmail.com';
```

**解決方法：**
```sql
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'greenroom51@gmail.com' AND email_confirmed_at IS NULL;
```

#### C. staffテーブルとの連携ができていない
**確認方法：**
```sql
SELECT 
    u.email as auth_email,
    s.email as staff_email,
    s.name,
    s.role
FROM auth.users u
LEFT JOIN staff s ON u.id::text = s.id
WHERE u.email = 'greenroom51@gmail.com';
```

**解決方法：**
前回の `fix-admin-auth-v2.sql` を再実行

#### D. RLS（Row Level Security）の制限
**確認方法：**
```sql
SELECT * FROM pg_policies WHERE tablename = 'staff';
```

**解決方法：**
```sql
-- 一時的にRLSを無効化してテスト
ALTER TABLE staff DISABLE ROW LEVEL SECURITY;
-- テスト後は必ず有効化
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
```

#### E. 環境変数の問題
**確認方法：**
- ブラウザの開発者ツール > Console
- エラーメッセージを確認

**解決方法：**
- Vercelの環境変数が正しく設定されているか確認
- `VITE_SUPABASE_URL` と `VITE_SUPABASE_ANON_KEY`

### 3. ログイン処理のフロー確認

1. **フロントエンド**: `supabase.auth.signInWithPassword()` を呼び出し
2. **Supabase Auth**: メール/パスワードを検証
3. **フロントエンド**: 成功した場合、`staff` テーブルからユーザー情報を取得
4. **認証完了**: AuthContextに情報を保存

### 4. エラーパターン別の対処

#### "Invalid login credentials"
- パスワードが間違っている
- ユーザーが存在しない
- メール未確認

#### "User not found"
- auth.usersテーブルにユーザーが存在しない

#### "staffData not found"
- Supabase認証は成功したが、staffテーブルに対応レコードがない

#### "Permission denied"
- RLSポリシーにより、staffテーブルへのアクセスが拒否されている

### 5. 緊急時の回避方法

#### 仮の管理者アカウントを作成
```sql
-- 既存のauth.usersレコードを使用
INSERT INTO staff (
    id,
    email,
    password,
    name,
    role,
    "tenantId",
    "isActive",
    "createdAt",
    "updatedAt"
) VALUES (
    gen_random_uuid()::text,
    'temp-admin@test.com',
    NULL,
    'テスト管理者',
    'ADMIN',
    'beta-salon-001',
    true,
    NOW(),
    NOW()
);
```

#### ログインを無効化してテスト
```bash
# 環境変数を変更
VITE_ENABLE_LOGIN=false
```

## 次のステップ

1. `debug-login.sql` を実行
2. 結果を確認
3. 問題に応じて上記の解決方法を適用
4. 再度ログインテスト