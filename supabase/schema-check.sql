-- スキーマとデータ型の確認用スクリプト

-- 1. staffテーブルの構造を確認
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'staff' 
ORDER BY ordinal_position;

-- 2. auth.usersテーブルの構造を確認
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'auth' AND table_name = 'users'
ORDER BY ordinal_position;

-- 3. 既存のstaffレコードを確認
SELECT 
    id,
    email,
    name,
    role,
    "tenantId",
    "isActive",
    password IS NULL as password_is_null
FROM staff 
ORDER BY email;

-- 4. auth.usersの既存レコードを確認
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at
FROM auth.users
ORDER BY email;

-- 5. 型変換のテスト
-- UUID文字列の変換確認
SELECT 
    'c881b627-304a-4368-b690-0b2e3aa43dcd'::uuid as uuid_test,
    'c881b627-304a-4368-b690-0b2e3aa43dcd'::text as text_test;

-- 6. JOINのテスト（型キャストあり）
SELECT 
    s.email as staff_email,
    u.email as auth_email,
    s.id as staff_id,
    u.id as auth_id
FROM staff s
RIGHT JOIN auth.users u ON s.id::uuid = u.id
WHERE u.email = 'greenroom51@gmail.com';

-- 7. 制約の確認
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    tc.constraint_type
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'staff' AND kcu.column_name IN ('id', 'password');

-- 8. 外部キー制約の確認
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'staff';