-- 既存のテーブルを確認してから安全に作成/更新するSQL

-- 1. Service Menus Table (既存の場合はスキップ)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'service_menus') THEN
        CREATE TABLE service_menus (
            id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
            "tenantId" TEXT NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            price INTEGER NOT NULL DEFAULT 0,
            duration INTEGER NOT NULL DEFAULT 30,
            category TEXT NOT NULL CHECK (category IN ('cut', 'color', 'perm', 'treatment', 'other')),
            "isActive" BOOLEAN DEFAULT true,
            "displayOrder" INTEGER DEFAULT 0,
            "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            "createdBy" TEXT,
            "updatedBy" TEXT
        );
    END IF;
END $$;

-- Create indexes if not exists
CREATE INDEX IF NOT EXISTS idx_service_menus_tenant ON service_menus("tenantId");
CREATE INDEX IF NOT EXISTS idx_service_menus_active ON service_menus("tenantId", "isActive");

-- 2. Payment Methods Table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'payment_methods') THEN
        CREATE TABLE payment_methods (
            id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
            "tenantId" TEXT NOT NULL,
            name TEXT NOT NULL,
            type TEXT NOT NULL CHECK (type IN ('cash', 'credit_card', 'debit_card', 'qr_payment', 'bank_transfer', 'other')),
            "isActive" BOOLEAN DEFAULT true,
            "displayOrder" INTEGER DEFAULT 0,
            settings JSONB DEFAULT '{}',
            "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_payment_methods_tenant ON payment_methods("tenantId");

-- 3. Reminder Settings Table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'reminder_settings') THEN
        CREATE TABLE reminder_settings (
            id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
            "tenantId" TEXT NOT NULL UNIQUE,
            "enableReminders" BOOLEAN DEFAULT true,
            "reminderTiming" INTEGER DEFAULT 24,
            "reminderChannels" TEXT[] DEFAULT '{"email"}',
            "reminderTemplate" TEXT,
            "enableConfirmation" BOOLEAN DEFAULT true,
            "confirmationTiming" INTEGER DEFAULT 0,
            "enableFollowUp" BOOLEAN DEFAULT false,
            "followUpTiming" INTEGER DEFAULT 24,
            "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_reminder_settings_tenant ON reminder_settings("tenantId");

-- 4. General Settings Table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'general_settings') THEN
        CREATE TABLE general_settings (
            id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
            "tenantId" TEXT NOT NULL,
            key TEXT NOT NULL,
            value JSONB NOT NULL,
            "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            UNIQUE("tenantId", key)
        );
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_general_settings_tenant ON general_settings("tenantId");

-- Disable RLS for development
ALTER TABLE service_menus DISABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods DISABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE general_settings DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON service_menus TO authenticated;
GRANT ALL ON payment_methods TO authenticated;
GRANT ALL ON reminder_settings TO authenticated;
GRANT ALL ON general_settings TO authenticated;

-- Create or replace trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist and recreate
DROP TRIGGER IF EXISTS update_service_menus_updated_at ON service_menus;
CREATE TRIGGER update_service_menus_updated_at BEFORE UPDATE ON service_menus
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payment_methods_updated_at ON payment_methods;
CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reminder_settings_updated_at ON reminder_settings;
CREATE TRIGGER update_reminder_settings_updated_at BEFORE UPDATE ON reminder_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_general_settings_updated_at ON general_settings;
CREATE TRIGGER update_general_settings_updated_at BEFORE UPDATE ON general_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 確認用クエリ
SELECT 
    'テーブル作成完了' as status,
    table_name,
    'created' as action
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('service_menus', 'payment_methods', 'reminder_settings', 'general_settings')
ORDER BY table_name;