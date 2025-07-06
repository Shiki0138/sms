-- テスト用テナント作成
INSERT INTO tenants (id, name, email, phone, address, plan, "isActive")
VALUES 
  ('test-salon-001', 'テストサロン渋谷店', 'test@salon.jp', '03-1234-5678', '東京都渋谷区1-2-3', 'standard', true),
  ('test-salon-002', 'テストサロン新宿店', 'test2@salon.jp', '03-2345-6789', '東京都新宿区2-3-4', 'standard', true)
ON CONFLICT (id) DO NOTHING;

-- テストユーザー作成（パスワードは全て 'TestUser2024!' のハッシュ）
-- bcrypt hash: $2b$10$p9AYdKId9mBID.Dr1qr7j.yZ3FJQFa.djwtJSA8Nbzi4c/y4zsKEW
INSERT INTO staff (email, password, name, role, "isActive", "tenantId", "twoFactorEnabled")
VALUES 
  -- 管理者
  ('admin@test-salon.jp', '$2b$10$p9AYdKId9mBID.Dr1qr7j.yZ3FJQFa.djwtJSA8Nbzi4c/y4zsKEW', 'テスト管理者', 'ADMIN', true, 'test-salon-001', false),
  
  -- スタッフ（19名）
  ('tester1@test-salon.jp', '$2b$10$p9AYdKId9mBID.Dr1qr7j.yZ3FJQFa.djwtJSA8Nbzi4c/y4zsKEW', 'テスター1番', 'STAFF', true, 'test-salon-001', false),
  ('tester2@test-salon.jp', '$2b$10$p9AYdKId9mBID.Dr1qr7j.yZ3FJQFa.djwtJSA8Nbzi4c/y4zsKEW', 'テスター2番', 'STAFF', true, 'test-salon-001', false),
  ('tester3@test-salon.jp', '$2b$10$p9AYdKId9mBID.Dr1qr7j.yZ3FJQFa.djwtJSA8Nbzi4c/y4zsKEW', 'テスター3番', 'STAFF', true, 'test-salon-001', false),
  ('tester4@test-salon.jp', '$2b$10$p9AYdKId9mBID.Dr1qr7j.yZ3FJQFa.djwtJSA8Nbzi4c/y4zsKEW', 'テスター4番', 'STAFF', true, 'test-salon-001', false),
  ('tester5@test-salon.jp', '$2b$10$p9AYdKId9mBID.Dr1qr7j.yZ3FJQFa.djwtJSA8Nbzi4c/y4zsKEW', 'テスター5番', 'STAFF', true, 'test-salon-001', false),
  ('tester6@test-salon.jp', '$2b$10$p9AYdKId9mBID.Dr1qr7j.yZ3FJQFa.djwtJSA8Nbzi4c/y4zsKEW', 'テスター6番', 'STAFF', true, 'test-salon-001', false),
  ('tester7@test-salon.jp', '$2b$10$p9AYdKId9mBID.Dr1qr7j.yZ3FJQFa.djwtJSA8Nbzi4c/y4zsKEW', 'テスター7番', 'STAFF', true, 'test-salon-001', false),
  ('tester8@test-salon.jp', '$2b$10$p9AYdKId9mBID.Dr1qr7j.yZ3FJQFa.djwtJSA8Nbzi4c/y4zsKEW', 'テスター8番', 'STAFF', true, 'test-salon-001', false),
  ('tester9@test-salon.jp', '$2b$10$p9AYdKId9mBID.Dr1qr7j.yZ3FJQFa.djwtJSA8Nbzi4c/y4zsKEW', 'テスター9番', 'STAFF', true, 'test-salon-001', false),
  ('tester10@test-salon.jp', '$2b$10$p9AYdKId9mBID.Dr1qr7j.yZ3FJQFa.djwtJSA8Nbzi4c/y4zsKEW', 'テスター10番', 'STAFF', true, 'test-salon-002', false),
  ('tester11@test-salon.jp', '$2b$10$p9AYdKId9mBID.Dr1qr7j.yZ3FJQFa.djwtJSA8Nbzi4c/y4zsKEW', 'テスター11番', 'STAFF', true, 'test-salon-002', false),
  ('tester12@test-salon.jp', '$2b$10$p9AYdKId9mBID.Dr1qr7j.yZ3FJQFa.djwtJSA8Nbzi4c/y4zsKEW', 'テスター12番', 'STAFF', true, 'test-salon-002', false),
  ('tester13@test-salon.jp', '$2b$10$p9AYdKId9mBID.Dr1qr7j.yZ3FJQFa.djwtJSA8Nbzi4c/y4zsKEW', 'テスター13番', 'STAFF', true, 'test-salon-002', false),
  ('tester14@test-salon.jp', '$2b$10$p9AYdKId9mBID.Dr1qr7j.yZ3FJQFa.djwtJSA8Nbzi4c/y4zsKEW', 'テスター14番', 'STAFF', true, 'test-salon-002', false),
  ('tester15@test-salon.jp', '$2b$10$p9AYdKId9mBID.Dr1qr7j.yZ3FJQFa.djwtJSA8Nbzi4c/y4zsKEW', 'テスター15番', 'STAFF', true, 'test-salon-002', false),
  ('tester16@test-salon.jp', '$2b$10$p9AYdKId9mBID.Dr1qr7j.yZ3FJQFa.djwtJSA8Nbzi4c/y4zsKEW', 'テスター16番', 'STAFF', true, 'test-salon-002', false),
  ('tester17@test-salon.jp', '$2b$10$p9AYdKId9mBID.Dr1qr7j.yZ3FJQFa.djwtJSA8Nbzi4c/y4zsKEW', 'テスター17番', 'STAFF', true, 'test-salon-002', false),
  ('tester18@test-salon.jp', '$2b$10$p9AYdKId9mBID.Dr1qr7j.yZ3FJQFa.djwtJSA8Nbzi4c/y4zsKEW', 'テスター18番', 'STAFF', true, 'test-salon-002', false),
  ('tester19@test-salon.jp', '$2b$10$p9AYdKId9mBID.Dr1qr7j.yZ3FJQFa.djwtJSA8Nbzi4c/y4zsKEW', 'テスター19番', 'STAFF', true, 'test-salon-002', false)
ON CONFLICT (email) DO NOTHING;

-- メニューカテゴリーデータ
INSERT INTO menu_categories (id, name, "displayOrder", "isActive", "tenantId")
VALUES 
  ('cat-001', 'カット', 1, true, 'test-salon-001'),
  ('cat-002', 'カラー', 2, true, 'test-salon-001'),
  ('cat-003', 'パーマ', 3, true, 'test-salon-001'),
  ('cat-004', 'トリートメント', 4, true, 'test-salon-001'),
  ('cat-005', 'カット', 1, true, 'test-salon-002'),
  ('cat-006', 'カラー', 2, true, 'test-salon-002'),
  ('cat-007', 'パーマ', 3, true, 'test-salon-002'),
  ('cat-008', 'トリートメント', 4, true, 'test-salon-002')
ON CONFLICT DO NOTHING;

-- サンプルメニューデータ
INSERT INTO menus (name, price, "durationMin", "isActive", "tenantId", "categoryId")
VALUES 
  ('カット', 3500, 30, true, 'test-salon-001', 'cat-001'),
  ('カラー', 5000, 90, true, 'test-salon-001', 'cat-002'),
  ('パーマ', 8000, 120, true, 'test-salon-001', 'cat-003'),
  ('トリートメント', 3000, 45, true, 'test-salon-001', 'cat-004'),
  ('カット', 3800, 30, true, 'test-salon-002', 'cat-005'),
  ('カラー', 5500, 90, true, 'test-salon-002', 'cat-006'),
  ('パーマ', 8500, 120, true, 'test-salon-002', 'cat-007'),
  ('トリートメント', 3500, 45, true, 'test-salon-002', 'cat-008')
ON CONFLICT DO NOTHING;

-- サンプル顧客データ（各店舗に3名ずつ）
INSERT INTO customers (name, "nameKana", email, phone, "tenantId", "visitCount")
VALUES 
  ('山田 花子', 'ヤマダ ハナコ', 'hanako@example.com', '090-1111-1111', 'test-salon-001', 5),
  ('田中 太郎', 'タナカ タロウ', 'taro@example.com', '090-2222-2222', 'test-salon-001', 3),
  ('佐藤 美咲', 'サトウ ミサキ', 'misaki@example.com', '090-3333-3333', 'test-salon-001', 8),
  ('鈴木 一郎', 'スズキ イチロウ', 'ichiro@example.com', '090-4444-4444', 'test-salon-002', 2),
  ('高橋 由美', 'タカハシ ユミ', 'yumi@example.com', '090-5555-5555', 'test-salon-002', 6),
  ('渡辺 健太', 'ワタナベ ケンタ', 'kenta@example.com', '090-6666-6666', 'test-salon-002', 4)
ON CONFLICT DO NOTHING;