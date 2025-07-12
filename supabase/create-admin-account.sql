-- 新しい管理者アカウントを作成
-- パスワード: Admin2025!

-- 既存の管理者アカウントを確認
SELECT email, name, role FROM staff WHERE role = 'ADMIN';

-- 新しい管理者アカウントを作成
INSERT INTO staff (
    email, 
    password, 
    name, 
    role, 
    "tenantId", 
    "isActive",
    "createdAt",
    "updatedAt"
) VALUES (
    'admin@sms-system.com',
    '$2b$10$YKvJZxxxG8kVs1vqPPh3OuH8gWyVxC6sX8a3nBfEt3q2YxGKF1bDa', -- Admin2025!
    'システム管理者',
    'ADMIN',
    'beta-salon-001',
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    password = EXCLUDED.password,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    "isActive" = EXCLUDED."isActive",
    "updatedAt" = NOW();

-- 作成されたアカウントを確認
SELECT 
    email, 
    name, 
    role,
    "isActive",
    "createdAt"
FROM staff 
WHERE email = 'admin@sms-system.com';

-- 管理者アカウント一覧
SELECT 
    email, 
    name, 
    role,
    "isActive"
FROM staff 
WHERE role = 'ADMIN'
ORDER BY "createdAt" DESC;