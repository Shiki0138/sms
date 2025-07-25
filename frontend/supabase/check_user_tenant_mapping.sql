-- ============================================
-- ユーザーとテナントIDのマッピングを確認
-- ============================================

-- 1. 現在のholiday_settingsのデータを確認
SELECT 
  id,
  "tenantId",
  weekly_closed_days,
  "createdAt",
  "updatedAt"
FROM "holiday_settings"
ORDER BY "updatedAt" DESC;

-- 2. auth.usersテーブルでユーザーを確認
SELECT 
  id,
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- 3. 特定のメールアドレスのユーザーIDを確認
-- あなたのログインメールアドレスに置き換えてください
SELECT 
  id as user_id,
  email
FROM auth.users
WHERE email = 'あなたのメールアドレス';

-- 4. 現在ログインしているユーザーのIDで休日設定を保存
-- 上記で取得したuser_idを使用
INSERT INTO "holiday_settings" ("tenantId", weekly_closed_days, nth_weekday_rules, specific_holidays)
VALUES 
  ('ここに上記で取得したuser_idを入力', ARRAY[4], '[]'::jsonb, ARRAY[]::text[])
ON CONFLICT ("tenantId") 
DO UPDATE SET 
  weekly_closed_days = ARRAY[4], -- 木曜日
  "updatedAt" = CURRENT_TIMESTAMP;

-- 5. 保存後、データを確認
SELECT * FROM "holiday_settings";