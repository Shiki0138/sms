-- シンプルなログイン確認用スクリプト

-- 1. auth.usersの状況確認
SELECT 
    'AUTH USERS' as table_name,
    email,
    email_confirmed_at IS NOT NULL as email_confirmed,
    created_at
FROM auth.users 
WHERE email = 'greenroom51@gmail.com';

-- 2. staffの状況確認
SELECT 
    'STAFF TABLE' as table_name,
    email,
    name,
    role,
    "isActive"
FROM staff 
WHERE email = 'greenroom51@gmail.com';

-- 3. もしauth.usersにユーザーが存在しない場合の確認
SELECT 
    'ALL AUTH USERS' as info,
    email,
    created_at
FROM auth.users 
ORDER BY created_at DESC
LIMIT 5;

-- 4. メール確認を強制実行（必要に応じて）
-- UPDATE auth.users 
-- SET email_confirmed_at = NOW() 
-- WHERE email = 'greenroom51@gmail.com' AND email_confirmed_at IS NULL;

-- 5. RLSを一時的に無効化（トラブルシューティング用）
-- ALTER TABLE staff DISABLE ROW LEVEL SECURITY;

-- 6. 基本的な接続テスト
SELECT 
    'CONNECTION TEST' as test,
    NOW() as current_time,
    current_database() as database_name;