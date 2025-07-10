-- ベータテスト環境セットアップスクリプト
-- 実行前に必ずバックアップを取ってください

-- 1. 既存のテーブルをクリア（開発環境のみ）
-- TRUNCATE TABLE customers, reservations, messages, staff, tenants CASCADE;

-- 2. ベータテスト用テナント（サロン）作成
INSERT INTO tenants (id, name, address, phone, email, plan) VALUES
('beta-salon-001', 'ベータテストサロン', '東京都渋谷区テスト1-1-1', '03-0000-0001', 'beta@salon.com', 'premium');

-- 3. ベータテスター用スタッフアカウント（20名）
-- パスワードは全て 'beta2024!' (本番環境では必ず変更してください)
-- パスワードハッシュは bcrypt で生成: $2b$10$8KzN5VerI8RQFNRxKwzX6OMF4xGLrDPhA7HJgf8nxUkXM0vRfvzXq
INSERT INTO staff (email, password, name, role, "tenantId", "isActive") VALUES
('tester01@salon.com', '$2b$10$8KzN5VerI8RQFNRxKwzX6OMF4xGLrDPhA7HJgf8nxUkXM0vRfvzXq', '美容師01', 'STAFF', 'beta-salon-001', true),
('tester02@salon.com', '$2b$10$8KzN5VerI8RQFNRxKwzX6OMF4xGLrDPhA7HJgf8nxUkXM0vRfvzXq', '美容師02', 'STAFF', 'beta-salon-001', true),
('tester03@salon.com', '$2b$10$8KzN5VerI8RQFNRxKwzX6OMF4xGLrDPhA7HJgf8nxUkXM0vRfvzXq', '美容師03', 'STAFF', 'beta-salon-001', true),
('tester04@salon.com', '$2b$10$8KzN5VerI8RQFNRxKwzX6OMF4xGLrDPhA7HJgf8nxUkXM0vRfvzXq', '美容師04', 'STAFF', 'beta-salon-001', true),
('tester05@salon.com', '$2b$10$8KzN5VerI8RQFNRxKwzX6OMF4xGLrDPhA7HJgf8nxUkXM0vRfvzXq', '美容師05', 'STAFF', 'beta-salon-001', true),
('tester06@salon.com', '$2b$10$8KzN5VerI8RQFNRxKwzX6OMF4xGLrDPhA7HJgf8nxUkXM0vRfvzXq', '美容師06', 'STAFF', 'beta-salon-001', true),
('tester07@salon.com', '$2b$10$8KzN5VerI8RQFNRxKwzX6OMF4xGLrDPhA7HJgf8nxUkXM0vRfvzXq', '美容師07', 'STAFF', 'beta-salon-001', true),
('tester08@salon.com', '$2b$10$8KzN5VerI8RQFNRxKwzX6OMF4xGLrDPhA7HJgf8nxUkXM0vRfvzXq', '美容師08', 'STAFF', 'beta-salon-001', true),
('tester09@salon.com', '$2b$10$8KzN5VerI8RQFNRxKwzX6OMF4xGLrDPhA7HJgf8nxUkXM0vRfvzXq', '美容師09', 'STAFF', 'beta-salon-001', true),
('tester10@salon.com', '$2b$10$8KzN5VerI8RQFNRxKwzX6OMF4xGLrDPhA7HJgf8nxUkXM0vRfvzXq', '美容師10', 'STAFF', 'beta-salon-001', true),
('tester11@salon.com', '$2b$10$8KzN5VerI8RQFNRxKwzX6OMF4xGLrDPhA7HJgf8nxUkXM0vRfvzXq', '美容師11', 'STAFF', 'beta-salon-001', true),
('tester12@salon.com', '$2b$10$8KzN5VerI8RQFNRxKwzX6OMF4xGLrDPhA7HJgf8nxUkXM0vRfvzXq', '美容師12', 'STAFF', 'beta-salon-001', true),
('tester13@salon.com', '$2b$10$8KzN5VerI8RQFNRxKwzX6OMF4xGLrDPhA7HJgf8nxUkXM0vRfvzXq', '美容師13', 'STAFF', 'beta-salon-001', true),
('tester14@salon.com', '$2b$10$8KzN5VerI8RQFNRxKwzX6OMF4xGLrDPhA7HJgf8nxUkXM0vRfvzXq', '美容師14', 'STAFF', 'beta-salon-001', true),
('tester15@salon.com', '$2b$10$8KzN5VerI8RQFNRxKwzX6OMF4xGLrDPhA7HJgf8nxUkXM0vRfvzXq', '美容師15', 'STAFF', 'beta-salon-001', true),
('tester16@salon.com', '$2b$10$8KzN5VerI8RQFNRxKwzX6OMF4xGLrDPhA7HJgf8nxUkXM0vRfvzXq', '美容師16', 'STAFF', 'beta-salon-001', true),
('tester17@salon.com', '$2b$10$8KzN5VerI8RQFNRxKwzX6OMF4xGLrDPhA7HJgf8nxUkXM0vRfvzXq', '美容師17', 'STAFF', 'beta-salon-001', true),
('tester18@salon.com', '$2b$10$8KzN5VerI8RQFNRxKwzX6OMF4xGLrDPhA7HJgf8nxUkXM0vRfvzXq', '美容師18', 'STAFF', 'beta-salon-001', true),
('tester19@salon.com', '$2b$10$8KzN5VerI8RQFNRxKwzX6OMF4xGLrDPhA7HJgf8nxUkXM0vRfvzXq', '美容師19', 'STAFF', 'beta-salon-001', true),
('tester20@salon.com', '$2b$10$8KzN5VerI8RQFNRxKwzX6OMF4xGLrDPhA7HJgf8nxUkXM0vRfvzXq', '美容師20', 'STAFF', 'beta-salon-001', true),
('admin@salon.com', '$2b$10$8KzN5VerI8RQFNRxKwzX6OMF4xGLrDPhA7HJgf8nxUkXM0vRfvzXq', '管理者', 'ADMIN', 'beta-salon-001', true);

-- 4. サンプル顧客データ（テスト用）
INSERT INTO customers (name, "nameKana", gender, phone, email, "tenantId", "firstVisitDate") VALUES
('山田 太郎', 'ヤマダ タロウ', '男性', '090-1111-1111', 'yamada@example.com', 'beta-salon-001', CURRENT_TIMESTAMP),
('佐藤 花子', 'サトウ ハナコ', '女性', '090-2222-2222', 'sato@example.com', 'beta-salon-001', CURRENT_TIMESTAMP),
('鈴木 一郎', 'スズキ イチロウ', '男性', '090-3333-3333', 'suzuki@example.com', 'beta-salon-001', CURRENT_TIMESTAMP);

-- 5. Row Level Security (RLS) ポリシー設定
-- 各テナントは自分のデータのみアクセス可能
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

-- スタッフは自分のテナントのデータのみ参照・編集可能
CREATE POLICY "Staff can view own tenant customers" ON customers
  FOR ALL USING (auth.uid()::text IN (
    SELECT id FROM staff WHERE "tenantId" = customers."tenantId"
  ));

CREATE POLICY "Staff can view own tenant reservations" ON reservations
  FOR ALL USING (auth.uid()::text IN (
    SELECT id FROM staff WHERE "tenantId" = reservations."tenantId"
  ));

-- 6. インデックス作成（パフォーマンス向上）
CREATE INDEX idx_customers_tenant ON customers("tenantId");
CREATE INDEX idx_reservations_tenant ON reservations("tenantId");
CREATE INDEX idx_staff_tenant ON staff("tenantId");
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_email ON customers(email);