-- ログイン問題のデバッグ用スクリプト（修正版）

-- 1. auth.usersテーブルでユーザーの存在確認
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    last_sign_in_at
FROM auth.users 
WHERE email = 'greenroom51@gmail.com';

-- 2. staffテーブルでの対応レコード確認
SELECT 
    id,
    email,
    name,
    role,
    "isActive",
    password IS NULL as password_is_null
FROM staff 
WHERE email = 'greenroom51@gmail.com';

-- 3. 両テーブルのJOIN確認
SELECT 
    u.id as auth_id,
    u.email as auth_email,
    u.email_confirmed_at,
    s.id as staff_id,
    s.email as staff_email,
    s.name,
    s.role,
    s."isActive"
FROM auth.users u
LEFT JOIN staff s ON u.id::text = s.id
WHERE u.email = 'greenroom51@gmail.com';

-- 4. テナント情報の確認
SELECT * FROM tenants WHERE id = 'beta-salon-001';

-- 5. RLS（Row Level Security）の設定確認
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'staff';

-- 6. 簡単なテスト用アカウント作成（デバッグ用）
-- 既存のauth.usersレコードがある場合のみ実行
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
) 
SELECT 
    u.id::text,
    u.email,
    NULL,
    'デバッグ管理者',
    'ADMIN',
    'beta-salon-001',
    true,
    NOW(),
    NOW()
FROM auth.users u
WHERE u.email = 'greenroom51@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM staff WHERE email = 'greenroom51@gmail.com'
);

-- 7. 最終確認（型を統一）
SELECT 
    'AUTH_USER' as type,
    email,
    id::text as id,
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN 'confirmed'
        ELSE 'not_confirmed'
    END as status
FROM auth.users 
WHERE email = 'greenroom51@gmail.com'
UNION ALL
SELECT 
    'STAFF_USER' as type,
    email,
    id,
    CASE 
        WHEN "isActive" = true THEN 'active'
        ELSE 'inactive'
    END as status
FROM staff 
WHERE email = 'greenroom51@gmail.com';

-- 8. 追加の診断情報
SELECT 
    'Total auth users' as info,
    COUNT(*)::text as count,
    '' as details
FROM auth.users
UNION ALL
SELECT 
    'Total staff users' as info,
    COUNT(*)::text as count,
    '' as details
FROM staff
UNION ALL
SELECT 
    'Staff with null password' as info,
    COUNT(*)::text as count,
    '' as details
FROM staff 
WHERE password IS NULL;