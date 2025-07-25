-- ============================================
-- テナントIDの問題をデバッグするSQL
-- ============================================

-- 1. 現在の認証ユーザーIDを確認
SELECT auth.uid() as current_user_id;

-- 2. holiday_settingsテーブルの全データを確認
SELECT 
  id,
  "tenantId",
  weekly_closed_days,
  nth_weekday_rules,
  specific_holidays,
  "createdAt",
  "updatedAt"
FROM holiday_settings
ORDER BY "updatedAt" DESC;

-- 3. greenroom51@gmail.comのユーザー情報を確認
SELECT 
  id,
  email,
  created_at
FROM auth.users
WHERE email = 'greenroom51@gmail.com';

-- 4. 特定のtenantIdでデータを検索
-- 以下のクエリで実際のデータを確認
SELECT * FROM holiday_settings WHERE "tenantId" = 'demo-user';

-- 5. RLSが有効かどうか確認
SELECT 
  relname AS table_name,
  relrowsecurity AS rls_enabled
FROM pg_class
WHERE relname = 'holiday_settings';

-- 6. 現在のRLSポリシーを確認
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'holiday_settings';

-- 7. テスト: 新しいデータを挿入してみる
-- 実際のユーザーIDに置き換えて実行
/*
INSERT INTO holiday_settings ("tenantId", weekly_closed_days)
VALUES ('YOUR_USER_ID_HERE', ARRAY[4])
ON CONFLICT ("tenantId") DO UPDATE
SET weekly_closed_days = ARRAY[4],
    "updatedAt" = CURRENT_TIMESTAMP;
*/

-- 8. Supabase JavaScriptクライアントで使用されるユーザーIDを確認
-- ブラウザのコンソールで以下を実行:
/*
const { data: { user } } = await supabase.auth.getUser()
console.log('Supabase User ID:', user?.id)
console.log('Supabase Email:', user?.email)
*/