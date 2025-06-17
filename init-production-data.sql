-- 本番環境初期データ投入
INSERT INTO tenants (id, name, address, phone, email, plan, "isActive", "createdAt", "updatedAt") 
VALUES ('default-tenant', '美容室サンプル', '東京都渋谷区1-1-1', '03-1234-5678', 'info@salon-sample.com', 'premium', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 管理者アカウント作成
INSERT INTO staff (id, email, password, name, role, "isActive", "tenantId", "createdAt", "updatedAt") 
VALUES (
  'admin-staff-001', 
  'admin@salon-sample.com', 
  '$2b$12$LQv3c1yqBwEHFx.1EczwcOaKQ.qj.V3M8c3c1yqBwEHFx.1EczwcO', -- password: admin123
  '管理者', 
  'ADMIN', 
  true, 
  'default-tenant',
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;