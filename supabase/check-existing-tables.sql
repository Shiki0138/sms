-- 既存のテーブルとデータを確認するスクリプト

-- 1. 既存のテーブル一覧を確認
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. 各テーブルのレコード数を確認
SELECT 'tenants' as table_name, COUNT(*) as record_count FROM tenants
UNION ALL
SELECT 'staff', COUNT(*) FROM staff
UNION ALL
SELECT 'customers', COUNT(*) FROM customers
UNION ALL
SELECT 'reservations', COUNT(*) FROM reservations
UNION ALL
SELECT 'messages', COUNT(*) FROM messages;

-- 3. 既存のスタッフアカウントを確認
SELECT id, email, name, role, "isActive" 
FROM staff 
ORDER BY email;

-- 4. 既存のテナント情報を確認
SELECT id, name, plan, "isActive" 
FROM tenants;