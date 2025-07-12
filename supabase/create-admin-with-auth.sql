-- 管理者アカウントをSupabase Authに作成するスクリプト
-- 注意：このスクリプトはSupabase Authユーザーが作成された後に実行してください

-- 1. 管理者ユーザー情報を確認
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at
FROM auth.users 
WHERE email = 'greenroom51@gmail.com';

-- 2. スタッフテーブルに管理者情報を追加/更新
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
    -- Supabase AuthのユーザーIDを使用
    (SELECT id FROM auth.users WHERE email = 'greenroom51@gmail.com'),
    'greenroom51@gmail.com',
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

-- 3. 作成されたスタッフ情報を確認
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

-- 4. 他のベータテスターアカウントも同様に処理
-- （必要に応じて実行）

-- 5. RLS（Row Level Security）ポリシーを確認
-- スタッフが自分のデータにアクセスできることを確認
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'staff';

-- 6. 簡単なテストクエリ
-- 管理者として顧客データにアクセスできることを確認
SELECT COUNT(*) as customer_count 
FROM customers 
WHERE "tenantId" = 'beta-salon-001';