-- 管理者アカウント作成の修正版
-- passwordカラムの制約を解決

-- 1. 管理者ユーザー情報を確認
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at
FROM auth.users 
WHERE email = 'greenroom51@gmail.com';

-- 2. staffテーブルのpasswordカラムをNULL許可に変更
ALTER TABLE staff ALTER COLUMN password DROP NOT NULL;

-- 3. スタッフテーブルに管理者情報を追加/更新
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
    -- Supabase AuthのユーザーIDを使用
    (SELECT id FROM auth.users WHERE email = 'greenroom51@gmail.com'),
    'greenroom51@gmail.com',
    NULL, -- Supabase Authを使用するためNULL
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

-- 4. 作成されたスタッフ情報を確認
SELECT 
    s.id,
    s.email,
    s.name,
    s.role,
    s."isActive",
    u.email_confirmed_at
FROM staff s
JOIN auth.users u ON s.id = u.id
WHERE s.email = 'greenroom51@gmail.com';

-- 5. 既存のベータテスターアカウントも同様に修正
UPDATE staff 
SET password = NULL
WHERE email LIKE 'tester%@salon.com' 
   OR email = 'admin@salon.com';

-- 6. 修正結果を確認
SELECT 
    email,
    name,
    role,
    password IS NULL as password_is_null,
    "isActive"
FROM staff 
WHERE "tenantId" = 'beta-salon-001'
ORDER BY email;