-- 休日設定テーブルの修正・作成
-- このスクリプトは、既存のテーブルがある場合は修正し、ない場合は新規作成します

-- テーブルが存在しない場合は作成
CREATE TABLE IF NOT EXISTS holiday_settings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "tenantId" TEXT NOT NULL UNIQUE,
  weekly_closed_days INTEGER[] DEFAULT '{}',
  nth_weekday_rules JSONB DEFAULT '[]',
  specific_holidays TEXT[] DEFAULT '{}',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- カラムが存在しない場合は追加（既存テーブルの場合）
DO $$ 
BEGIN
  -- weekly_closed_days カラムの確認と追加
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='holiday_settings' AND column_name='weekly_closed_days') THEN
    ALTER TABLE holiday_settings ADD COLUMN weekly_closed_days INTEGER[] DEFAULT '{}';
  END IF;
  
  -- nth_weekday_rules カラムの確認と追加
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='holiday_settings' AND column_name='nth_weekday_rules') THEN
    ALTER TABLE holiday_settings ADD COLUMN nth_weekday_rules JSONB DEFAULT '[]';
  END IF;
  
  -- specific_holidays カラムの確認と追加
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='holiday_settings' AND column_name='specific_holidays') THEN
    ALTER TABLE holiday_settings ADD COLUMN specific_holidays TEXT[] DEFAULT '{}';
  END IF;
  
  -- updatedAt カラムの確認と追加
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='holiday_settings' AND column_name='updatedAt') THEN
    ALTER TABLE holiday_settings ADD COLUMN "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
  END IF;
END $$;

-- インデックスの作成（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_holiday_settings_tenant_id ON holiday_settings("tenantId");

-- RLS（Row Level Security）を有効化
ALTER TABLE holiday_settings ENABLE ROW LEVEL SECURITY;

-- RLSポリシーの作成（既存のポリシーがある場合はスキップ）
DO $$ 
BEGIN
  -- 読み取りポリシー
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'holiday_settings' AND policyname = 'Allow read own holiday settings'
  ) THEN
    CREATE POLICY "Allow read own holiday settings" ON holiday_settings
      FOR SELECT USING (true);  -- 一時的に全員読み取り可能（本番環境では適切な条件に変更）
  END IF;
  
  -- 書き込みポリシー
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'holiday_settings' AND policyname = 'Allow write own holiday settings'
  ) THEN
    CREATE POLICY "Allow write own holiday settings" ON holiday_settings
      FOR ALL USING (true);  -- 一時的に全員書き込み可能（本番環境では適切な条件に変更）
  END IF;
END $$;

-- リアルタイム機能を有効化
ALTER PUBLICATION supabase_realtime ADD TABLE holiday_settings;

-- 更新時にupdatedAtを自動更新する関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- トリガーの作成（既存の場合は削除して再作成）
DROP TRIGGER IF EXISTS update_holiday_settings_updated_at ON holiday_settings;
CREATE TRIGGER update_holiday_settings_updated_at
  BEFORE UPDATE ON holiday_settings
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- デモデータの挿入（必要に応じて）
-- INSERT INTO holiday_settings ("tenantId", weekly_closed_days, nth_weekday_rules, specific_holidays)
-- VALUES 
--   ('demo-user', ARRAY[1], '[{"nth": [2, 4], "weekday": 2}]'::jsonb, ARRAY['2025-01-01', '2025-12-31'])
-- ON CONFLICT ("tenantId") DO NOTHING;

-- 確認用のクエリ
-- SELECT * FROM holiday_settings;