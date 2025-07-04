-- テスト環境用データベース初期設定

-- Row Level Security (RLS) の設定
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;

-- テナント（美容室）ポリシー
CREATE POLICY "Users can view their own tenant" ON tenants
  FOR SELECT USING (id = current_setting('app.current_tenant_id')::text);

-- スタッフポリシー
CREATE POLICY "Staff can view their own profile" ON staff
  FOR SELECT USING (
    id = current_setting('app.current_user_id')::text 
    OR tenantId = current_setting('app.current_tenant_id')::text
  );

CREATE POLICY "Staff can update their own profile" ON staff
  FOR UPDATE USING (id = current_setting('app.current_user_id')::text);

-- 顧客ポリシー
CREATE POLICY "Staff can manage customers in their tenant" ON customers
  FOR ALL USING (tenantId = current_setting('app.current_tenant_id')::text);

-- 予約ポリシー
CREATE POLICY "Staff can manage reservations in their tenant" ON reservations
  FOR ALL USING (tenantId = current_setting('app.current_tenant_id')::text);

-- メニューポリシー
CREATE POLICY "Staff can manage menus in their tenant" ON menus
  FOR ALL USING (tenantId = current_setting('app.current_tenant_id')::text);

-- 基本インデックス作成
CREATE INDEX idx_customers_tenant ON customers(tenantId);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_reservations_tenant ON reservations(tenantId);
CREATE INDEX idx_reservations_date ON reservations(startTime);
CREATE INDEX idx_staff_email ON staff(email);
CREATE INDEX idx_staff_tenant ON staff(tenantId);

-- テスト用関数：データリセット
CREATE OR REPLACE FUNCTION reset_test_data()
RETURNS void AS $$
BEGIN
  -- テストテナント以外のデータは削除しない
  DELETE FROM reservations WHERE tenantId LIKE 'test-%';
  DELETE FROM customers WHERE tenantId LIKE 'test-%';
  DELETE FROM menus WHERE tenantId LIKE 'test-%';
  DELETE FROM staff WHERE tenantId LIKE 'test-%';
  DELETE FROM tenants WHERE id LIKE 'test-%';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 使用状況トラッキング用テーブル
CREATE TABLE IF NOT EXISTS test_usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE test_usage_logs IS 'テストユーザーの操作ログ';

-- エラーログ用テーブル
CREATE TABLE IF NOT EXISTS test_error_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  error_type TEXT NOT NULL,
  error_message TEXT,
  stack_trace TEXT,
  context JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE test_error_logs IS 'テスト環境のエラーログ';

-- フィードバック用テーブル
CREATE TABLE IF NOT EXISTS test_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  category TEXT NOT NULL, -- 'bug', 'improvement', 'feature_request'
  title TEXT NOT NULL,
  description TEXT,
  screenshot_url TEXT,
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  status TEXT DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'closed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE test_feedback IS 'テストユーザーからのフィードバック';