-- Create all missing settings tables for the salon management system

-- 1. Service Menus Table
CREATE TABLE IF NOT EXISTS service_menus (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "tenantId" TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL DEFAULT 0,
  duration INTEGER NOT NULL DEFAULT 30, -- in minutes
  category TEXT NOT NULL CHECK (category IN ('cut', 'color', 'perm', 'treatment', 'other')),
  "isActive" BOOLEAN DEFAULT true,
  "displayOrder" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  "updatedBy" TEXT
);

-- Create index for faster queries
CREATE INDEX idx_service_menus_tenant ON service_menus("tenantId");
CREATE INDEX idx_service_menus_active ON service_menus("tenantId", "isActive");

-- 2. Payment Methods Table
CREATE TABLE IF NOT EXISTS payment_methods (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "tenantId" TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('cash', 'credit_card', 'debit_card', 'qr_payment', 'bank_transfer', 'other')),
  "isActive" BOOLEAN DEFAULT true,
  "displayOrder" INTEGER DEFAULT 0,
  settings JSONB DEFAULT '{}', -- For provider-specific settings
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index
CREATE INDEX idx_payment_methods_tenant ON payment_methods("tenantId");

-- 3. Reminder Settings Table
CREATE TABLE IF NOT EXISTS reminder_settings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "tenantId" TEXT NOT NULL UNIQUE,
  "enableReminders" BOOLEAN DEFAULT true,
  "reminderTiming" INTEGER DEFAULT 24, -- hours before appointment
  "reminderChannels" TEXT[] DEFAULT '{"email"}', -- email, sms, line
  "reminderTemplate" TEXT,
  "enableConfirmation" BOOLEAN DEFAULT true,
  "confirmationTiming" INTEGER DEFAULT 0, -- immediately after booking
  "enableFollowUp" BOOLEAN DEFAULT false,
  "followUpTiming" INTEGER DEFAULT 24, -- hours after appointment
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index
CREATE INDEX idx_reminder_settings_tenant ON reminder_settings("tenantId");

-- 4. General Settings Table (for other misc settings)
CREATE TABLE IF NOT EXISTS general_settings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "tenantId" TEXT NOT NULL,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("tenantId", key)
);

-- Create index
CREATE INDEX idx_general_settings_tenant ON general_settings("tenantId");

-- Disable RLS temporarily for easier development (enable in production)
ALTER TABLE service_menus DISABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods DISABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE general_settings DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON service_menus TO authenticated;
GRANT ALL ON payment_methods TO authenticated;
GRANT ALL ON reminder_settings TO authenticated;
GRANT ALL ON general_settings TO authenticated;

-- Create update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_service_menus_updated_at BEFORE UPDATE ON service_menus
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reminder_settings_updated_at BEFORE UPDATE ON reminder_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_general_settings_updated_at BEFORE UPDATE ON general_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();