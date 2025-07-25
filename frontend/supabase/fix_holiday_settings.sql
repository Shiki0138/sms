-- ============================================
-- holiday_settingsテーブルの修正SQL
-- ============================================

-- 1. 現在のテーブル構造を確認
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'holiday_settings'
ORDER BY ordinal_position;

-- 2. 現在のデータを確認（バックアップ用）
SELECT * FROM holiday_settings;

-- 3. RLSポリシーを一時的に無効化（テスト用）
ALTER TABLE holiday_settings DISABLE ROW LEVEL SECURITY;

-- 4. 既存のポリシーを削除
DROP POLICY IF EXISTS "Staff can view own tenant holiday settings" ON holiday_settings;
DROP POLICY IF EXISTS "Staff can insert own tenant holiday settings" ON holiday_settings;
DROP POLICY IF EXISTS "Staff can update own tenant holiday settings" ON holiday_settings;
DROP POLICY IF EXISTS "Staff can delete own tenant holiday settings" ON holiday_settings;

-- 5. シンプルなテーブル構造に変更（外部キー制約を削除）
-- まず既存のテーブルをバックアップ
CREATE TABLE holiday_settings_backup AS SELECT * FROM holiday_settings;

-- 6. テーブルを再作成（シンプルな構造）
DROP TABLE IF EXISTS holiday_settings CASCADE;

CREATE TABLE holiday_settings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "tenantId" TEXT NOT NULL,
  weekly_closed_days INTEGER[] DEFAULT '{}',
  nth_weekday_rules JSONB DEFAULT '[]',
  specific_holidays TEXT[] DEFAULT '{}',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("tenantId")
);

-- 7. インデックスを作成
CREATE INDEX idx_holiday_settings_tenant_id ON holiday_settings("tenantId");

-- 8. RLSを無効のままにする（開発/テスト用）
-- 本番環境では以下のようなシンプルなポリシーを使用
/*
ALTER TABLE holiday_settings ENABLE ROW LEVEL SECURITY;

-- 認証されたユーザーは全ての操作が可能（シンプルなポリシー）
CREATE POLICY "Authenticated users can do everything" ON holiday_settings
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);
*/

-- 9. バックアップからデータを復元（必要に応じて）
-- INSERT INTO holiday_settings SELECT * FROM holiday_settings_backup;

-- 10. テスト用のデータを挿入
-- greenroom51@gmail.com用のテストデータ
INSERT INTO holiday_settings ("tenantId", weekly_closed_days, nth_weekday_rules, specific_holidays)
VALUES 
  ('demo-user', ARRAY[1], '[]'::jsonb, ARRAY[]::text[]),
  ('YOUR_ACTUAL_SUPABASE_USER_ID', ARRAY[4], '[]'::jsonb, ARRAY[]::text[])
ON CONFLICT ("tenantId") DO UPDATE
SET 
  weekly_closed_days = EXCLUDED.weekly_closed_days,
  nth_weekday_rules = EXCLUDED.nth_weekday_rules,
  specific_holidays = EXCLUDED.specific_holidays,
  "updatedAt" = CURRENT_TIMESTAMP;

-- 11. 現在のデータを確認
SELECT * FROM holiday_settings;