-- 安全なベータテスト環境セットアップスクリプト
-- 既存のテーブルがある場合でも安全に実行できます

-- 1. ベータテスト用テナントが存在しない場合のみ作成
INSERT INTO tenants (id, name, address, phone, email, plan) 
SELECT 'beta-salon-001', 'ベータテストサロン', '東京都渋谷区テスト1-1-1', '03-0000-0001', 'beta@salon.com', 'premium'
WHERE NOT EXISTS (
    SELECT 1 FROM tenants WHERE id = 'beta-salon-001'
);

-- 2. 既存のベータテスターアカウントを確認
SELECT email FROM staff WHERE email LIKE 'tester%@salon.com' OR email = 'admin@salon.com';

-- 3. 存在しないアカウントのみ作成
-- パスワードは 'beta2024!' のbcryptハッシュ
DO $$
DECLARE
    test_accounts TEXT[] := ARRAY[
        'tester01@salon.com',
        'tester02@salon.com',
        'tester03@salon.com',
        'tester04@salon.com',
        'tester05@salon.com',
        'tester06@salon.com',
        'tester07@salon.com',
        'tester08@salon.com',
        'tester09@salon.com',
        'tester10@salon.com',
        'tester11@salon.com',
        'tester12@salon.com',
        'tester13@salon.com',
        'tester14@salon.com',
        'tester15@salon.com',
        'tester16@salon.com',
        'tester17@salon.com',
        'tester18@salon.com',
        'tester19@salon.com',
        'tester20@salon.com'
    ];
    account TEXT;
    staff_name TEXT;
    index INT;
BEGIN
    FOREACH account IN ARRAY test_accounts
    LOOP
        index := array_position(test_accounts, account);
        staff_name := '美容師' || lpad(index::text, 2, '0');
        
        INSERT INTO staff (email, password, name, role, "tenantId", "isActive")
        SELECT 
            account,
            '$2b$10$8KzN5VerI8RQFNRxKwzX6OMF4xGLrDPhA7HJgf8nxUkXM0vRfvzXq',
            staff_name,
            'STAFF',
            'beta-salon-001',
            true
        WHERE NOT EXISTS (
            SELECT 1 FROM staff WHERE email = account
        );
    END LOOP;
    
    -- 管理者アカウント
    INSERT INTO staff (email, password, name, role, "tenantId", "isActive")
    SELECT 
        'admin@salon.com',
        '$2b$10$8KzN5VerI8RQFNRxKwzX6OMF4xGLrDPhA7HJgf8nxUkXM0vRfvzXq',
        '管理者',
        'ADMIN',
        'beta-salon-001',
        true
    WHERE NOT EXISTS (
        SELECT 1 FROM staff WHERE email = 'admin@salon.com'
    );
END $$;

-- 4. 作成されたアカウントを確認
SELECT email, name, role 
FROM staff 
WHERE "tenantId" = 'beta-salon-001'
ORDER BY email;

-- 5. サンプル顧客データ（存在しない場合のみ）
INSERT INTO customers (name, "nameKana", gender, phone, email, "tenantId", "firstVisitDate")
SELECT '山田 太郎', 'ヤマダ タロウ', '男性', '090-1111-1111', 'yamada@example.com', 'beta-salon-001', CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM customers WHERE email = 'yamada@example.com' AND "tenantId" = 'beta-salon-001'
);

INSERT INTO customers (name, "nameKana", gender, phone, email, "tenantId", "firstVisitDate")
SELECT '佐藤 花子', 'サトウ ハナコ', '女性', '090-2222-2222', 'sato@example.com', 'beta-salon-001', CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM customers WHERE email = 'sato@example.com' AND "tenantId" = 'beta-salon-001'
);

INSERT INTO customers (name, "nameKana", gender, phone, email, "tenantId", "firstVisitDate")
SELECT '鈴木 一郎', 'スズキ イチロウ', '男性', '090-3333-3333', 'suzuki@example.com', 'beta-salon-001', CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM customers WHERE email = 'suzuki@example.com' AND "tenantId" = 'beta-salon-001'
);

-- 6. Row Level Security (RLS) の設定（エラーを無視）
DO $$
BEGIN
    -- RLSを有効化（既に有効な場合はエラーを無視）
    ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
    ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
    ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
    ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN OTHERS THEN
        -- エラーを無視
        NULL;
END $$;

-- 7. 結果サマリー
SELECT 
    (SELECT COUNT(*) FROM tenants WHERE id = 'beta-salon-001') as tenants_count,
    (SELECT COUNT(*) FROM staff WHERE "tenantId" = 'beta-salon-001') as staff_count,
    (SELECT COUNT(*) FROM customers WHERE "tenantId" = 'beta-salon-001') as customers_count;