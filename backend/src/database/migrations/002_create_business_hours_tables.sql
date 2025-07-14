-- 営業時間設定テーブル
CREATE TABLE IF NOT EXISTS business_hours (
  salon_id UUID NOT NULL,
  day_of_week INT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=日曜日, 6=土曜日
  is_open BOOLEAN DEFAULT true,
  open_time TIME,
  close_time TIME,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (salon_id, day_of_week),
  FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE
);

-- 定期休日設定テーブル（毎月第N○曜日など）
CREATE TABLE IF NOT EXISTS regular_holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL,
  day_of_week INT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  week_numbers INT[] NOT NULL, -- 第何週の配列 [1,3]なら第1・第3
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE
);

-- 特別休日テーブル（年末年始、GWなど）
CREATE TABLE IF NOT EXISTS special_holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  description TEXT,
  allow_booking BOOLEAN DEFAULT false, -- 休日でも予約を許可するか
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE,
  CHECK (end_date >= start_date)
);

-- 毎週の定休日設定テーブル
CREATE TABLE IF NOT EXISTS weekly_closed_days (
  salon_id UUID NOT NULL,
  day_of_week INT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (salon_id, day_of_week),
  FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE
);

-- 営業時間外予約設定テーブル
CREATE TABLE IF NOT EXISTS booking_settings (
  salon_id UUID PRIMARY KEY,
  allow_out_of_hours_booking BOOLEAN DEFAULT false,
  out_of_hours_warning_message TEXT DEFAULT '営業時間外のご予約です。確認後、スタッフから連絡させていただく場合があります。',
  allow_holiday_booking BOOLEAN DEFAULT false,
  holiday_warning_message TEXT DEFAULT '休業日のご予約です。特別に対応可能か確認後、ご連絡させていただきます。',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE
);

-- インデックス
CREATE INDEX idx_special_holidays_salon_dates ON special_holidays(salon_id, start_date, end_date);
CREATE INDEX idx_regular_holidays_salon ON regular_holidays(salon_id);

-- 更新日時の自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_business_hours_updated_at BEFORE UPDATE ON business_hours
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_regular_holidays_updated_at BEFORE UPDATE ON regular_holidays
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_special_holidays_updated_at BEFORE UPDATE ON special_holidays
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_booking_settings_updated_at BEFORE UPDATE ON booking_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();