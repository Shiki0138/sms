-- Holiday Settings Table for Salon Management System
-- This table stores holiday settings for each salon (tenant)

-- Create holiday_settings table
CREATE TABLE IF NOT EXISTS holiday_settings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "tenantId" TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  weekly_closed_days INTEGER[] DEFAULT '{}', -- Array of day numbers (0=Sunday, 1=Monday, etc.)
  nth_weekday_rules JSONB DEFAULT '[]', -- Array of {nth: number[], weekday: number} objects
  specific_holidays TEXT[] DEFAULT '{}', -- Array of dates in YYYY-MM-DD format
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT REFERENCES staff(id) ON DELETE SET NULL,
  "updatedBy" TEXT REFERENCES staff(id) ON DELETE SET NULL,
  UNIQUE("tenantId") -- Each tenant has only one holiday setting
);

-- Create index for faster queries
CREATE INDEX idx_holiday_settings_tenant_id ON holiday_settings("tenantId");

-- Enable Row Level Security (RLS)
ALTER TABLE holiday_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS (following the same pattern as other tables)
-- Policy: Staff can view their own tenant's holiday settings
CREATE POLICY "Staff can view own tenant holiday settings" ON holiday_settings
  FOR SELECT
  USING (auth.uid()::text IN (
    SELECT id FROM staff WHERE "tenantId" = holiday_settings."tenantId"
  ));

-- Policy: Staff can insert their own tenant's holiday settings
CREATE POLICY "Staff can insert own tenant holiday settings" ON holiday_settings
  FOR INSERT
  WITH CHECK (auth.uid()::text IN (
    SELECT id FROM staff WHERE "tenantId" = holiday_settings."tenantId"
  ));

-- Policy: Staff can update their own tenant's holiday settings
CREATE POLICY "Staff can update own tenant holiday settings" ON holiday_settings
  FOR UPDATE
  USING (auth.uid()::text IN (
    SELECT id FROM staff WHERE "tenantId" = holiday_settings."tenantId"
  ))
  WITH CHECK (auth.uid()::text IN (
    SELECT id FROM staff WHERE "tenantId" = holiday_settings."tenantId"
  ));

-- Policy: Staff can delete their own tenant's holiday settings
CREATE POLICY "Staff can delete own tenant holiday settings" ON holiday_settings
  FOR DELETE
  USING (auth.uid()::text IN (
    SELECT id FROM staff WHERE "tenantId" = holiday_settings."tenantId"
  ));

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_holiday_settings_updated_at
  BEFORE UPDATE ON holiday_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE holiday_settings IS 'Stores holiday and closed day settings for each salon';
COMMENT ON COLUMN holiday_settings.salon_id IS 'Unique identifier for the salon (usually user ID)';
COMMENT ON COLUMN holiday_settings.weekly_closed_days IS 'Array of weekday numbers that are closed (0=Sunday, 6=Saturday)';
COMMENT ON COLUMN holiday_settings.nth_weekday_rules IS 'JSON array of recurring monthly holidays (e.g., 2nd and 4th Tuesday)';
COMMENT ON COLUMN holiday_settings.specific_holidays IS 'Array of specific dates that are holidays in YYYY-MM-DD format';