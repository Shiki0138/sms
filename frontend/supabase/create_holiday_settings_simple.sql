-- ============================================
-- holiday_settingsテーブルを作成（シンプル版）
-- ============================================

-- 1. テーブルを作成（外部キー制約なし）
CREATE TABLE IF NOT EXISTS holiday_settings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "tenantId" TEXT NOT NULL,
  weekly_closed_days INTEGER[] DEFAULT '{}',
  nth_weekday_rules JSONB DEFAULT '[]',
  specific_holidays TEXT[] DEFAULT '{}',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("tenantId")
);

-- 2. インデックスを作成
CREATE INDEX IF NOT EXISTS idx_holiday_settings_tenant_id ON holiday_settings("tenantId");

-- 3. RLSを無効にする（テスト用）
ALTER TABLE holiday_settings DISABLE ROW LEVEL SECURITY;

-- 4. 確認
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'holiday_settings'
ORDER BY ordinal_position;

-- 5. テストデータを挿入
INSERT INTO holiday_settings ("tenantId", weekly_closed_days, nth_weekday_rules, specific_holidays)
VALUES 
  ('demo-user', ARRAY[1], '[]'::jsonb, ARRAY[]::text[])
ON CONFLICT ("tenantId") 
DO UPDATE SET 
  weekly_closed_days = EXCLUDED.weekly_closed_days,
  "updatedAt" = CURRENT_TIMESTAMP;

-- 6. データを確認
SELECT * FROM holiday_settings;

-- 7. 成功メッセージ
SELECT 'テーブルが正常に作成されました！' as message;