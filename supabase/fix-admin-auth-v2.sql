-- 管理者アカウント作成の修正版v2
-- データ型の不整合を解決

-- 1. 管理者ユーザー情報を確認
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at
FROM auth.users 
WHERE email = 'greenroom51@gmail.com';

-- 2. staffテーブルのidカラムの型を確認
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'staff' AND column_name = 'id';

-- 3. auth.usersテーブルのidカラムの型を確認
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'auth' AND table_name = 'users' AND column_name = 'id';

-- 4. staffテーブルのpasswordカラムをNULL許可に変更
ALTER TABLE staff ALTER COLUMN password DROP NOT NULL;

-- 5. 既存のstaffレコードを確認
SELECT id, email, name, role FROM staff WHERE email = 'greenroom51@gmail.com';

-- 6. 既存レコードを削除（存在する場合）
DELETE FROM staff WHERE email = 'greenroom51@gmail.com';

-- 7. スタッフテーブルに管理者情報を追加
-- UUIDを文字列として挿入
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
    -- Supabase AuthのユーザーIDを文字列として使用
    (SELECT id::text FROM auth.users WHERE email = 'greenroom51@gmail.com'),
    'greenroom51@gmail.com',
    NULL, -- Supabase Authを使用するためNULL
    'システム管理者',
    'ADMIN',
    'beta-salon-001',
    true,
    NOW(),
    NOW()
);

-- 8. 作成されたスタッフ情報を確認（型キャストを使用）
SELECT 
    s.id,
    s.email,
    s.name,
    s.role,
    s."isActive",
    u.email_confirmed_at
FROM staff s
JOIN auth.users u ON s.id::uuid = u.id
WHERE s.email = 'greenroom51@gmail.com';

-- 9. 既存のベータテスターアカウントも同様に修正
UPDATE staff 
SET password = NULL
WHERE email LIKE 'tester%@salon.com' 
   OR email = 'admin@salon.com';

-- 10. 修正結果を確認
SELECT 
    email,
    name,
    role,
    password IS NULL as password_is_null,
    "isActive"
FROM staff 
WHERE "tenantId" = 'beta-salon-001'
ORDER BY email;