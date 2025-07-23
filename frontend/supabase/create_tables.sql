-- Holiday Settings Table
CREATE TABLE IF NOT EXISTS holiday_settings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "tenantId" TEXT NOT NULL UNIQUE,
  weekly_closed_days INTEGER[] DEFAULT '{}',
  nth_weekday_rules JSONB DEFAULT '[]',
  specific_holidays TEXT[] DEFAULT '{}',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- API Settings Table (for LINE/Instagram/Google credentials)
CREATE TABLE IF NOT EXISTS api_settings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "tenantId" TEXT NOT NULL,
  service TEXT NOT NULL, -- 'line', 'instagram', 'google'
  credentials JSONB,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("tenantId", service)
);

-- Disable RLS temporarily for testing
ALTER TABLE holiday_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE api_settings DISABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_holiday_settings_tenant ON holiday_settings("tenantId");
CREATE INDEX IF NOT EXISTS idx_api_settings_tenant ON api_settings("tenantId");

-- Grant permissions
GRANT ALL ON holiday_settings TO authenticated;
GRANT ALL ON api_settings TO authenticated;