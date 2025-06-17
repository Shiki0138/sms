-- チームC データベース拡張 - 美容室業務最適化のための新テーブル群

-- 1. 顧客プリファレンステーブル - 美容室スタッフがお客様の好みを完璧に理解
CREATE TABLE IF NOT EXISTS customer_preferences (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  category TEXT NOT NULL, -- 'service', 'staff', 'time', 'communication'
  preference_value TEXT NOT NULL,
  confidence_score REAL DEFAULT 0.5,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
  tenant_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- 2. マーケティングキャンペーンテーブル - 美容室の売上向上戦略
CREATE TABLE IF NOT EXISTS marketing_campaigns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'email', 'sms', 'line', 'instagram'
  target_segment TEXT, -- 'VIP', 'REGULAR', 'NEW', 'CHURNED'
  start_date DATE,
  end_date DATE,
  budget DECIMAL(10,2),
  conversion_rate REAL DEFAULT 0.0,
  roi REAL DEFAULT 0.0,
  tenant_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- 3. スタッフパフォーマンステーブル - 美容師の成績を見える化
CREATE TABLE IF NOT EXISTS staff_performance (
  id TEXT PRIMARY KEY,
  staff_id TEXT NOT NULL,
  month DATE NOT NULL,
  appointments_count INTEGER DEFAULT 0,
  revenue_generated DECIMAL(10,2) DEFAULT 0.0,
  customer_satisfaction REAL DEFAULT 0.0,
  upsell_rate REAL DEFAULT 0.0,
  repeat_rate REAL DEFAULT 0.0,
  avg_service_time INTEGER DEFAULT 0, -- in minutes
  tenant_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- パフォーマンス最適化インデックス群
CREATE INDEX IF NOT EXISTS idx_customer_preferences_customer ON customer_preferences(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_preferences_category ON customer_preferences(category);
CREATE INDEX IF NOT EXISTS idx_customer_preferences_tenant ON customer_preferences(tenant_id);

CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_tenant ON marketing_campaigns(tenant_id);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_dates ON marketing_campaigns(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_segment ON marketing_campaigns(target_segment);

CREATE INDEX IF NOT EXISTS idx_staff_performance_staff ON staff_performance(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_performance_month ON staff_performance(month);
CREATE INDEX IF NOT EXISTS idx_staff_performance_tenant ON staff_performance(tenant_id);

-- 複合インデックス - 美容室業務の高速化
CREATE INDEX IF NOT EXISTS idx_customer_analytics ON customers(tenant_id, segment, lifetime_value, last_visit_date);
CREATE INDEX IF NOT EXISTS idx_reservation_analysis ON reservations(tenant_id, start_time, status, total_amount);
CREATE INDEX IF NOT EXISTS idx_message_sentiment ON message_threads(tenant_id, sentiment_score, priority_level);
CREATE INDEX IF NOT EXISTS idx_customers_segment ON customers(segment);
CREATE INDEX IF NOT EXISTS idx_customers_last_visit ON customers(last_visit_date);
CREATE INDEX IF NOT EXISTS idx_reservations_date_staff ON reservations(start_time, staff_id);
CREATE INDEX IF NOT EXISTS idx_messages_thread_created ON message_threads(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON message_threads(unread_count);