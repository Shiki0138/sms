-- Supabase用スキーマ定義（PostgreSQL）

-- テナント（店舗）
CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  plan TEXT DEFAULT 'light',
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- スタッフ
CREATE TABLE IF NOT EXISTS staff (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'STAFF',
  "isActive" BOOLEAN DEFAULT true,
  "lastLoginAt" TIMESTAMP WITH TIME ZONE,
  "tenantId" TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "twoFactorEnabled" BOOLEAN DEFAULT false,
  "twoFactorSecret" TEXT,
  "backupCodes" TEXT,
  "loginAttempts" INTEGER DEFAULT 0,
  "lockedUntil" TIMESTAMP WITH TIME ZONE,
  "passwordResetToken" TEXT,
  "passwordResetExpires" TIMESTAMP WITH TIME ZONE
);

-- 顧客
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT,
  "nameKana" TEXT,
  gender TEXT,
  "birthDate" TIMESTAMP WITH TIME ZONE,
  phone TEXT,
  email TEXT,
  address TEXT,
  "instagramId" TEXT UNIQUE,
  "lineId" TEXT UNIQUE,
  "firstVisitDate" TIMESTAMP WITH TIME ZONE,
  "lastVisitDate" TIMESTAMP WITH TIME ZONE,
  "visitCount" INTEGER DEFAULT 0,
  "totalSpent" DECIMAL DEFAULT 0,
  notes TEXT,
  segment TEXT,
  "lifetimeValue" DECIMAL DEFAULT 0,
  "riskScore" INTEGER DEFAULT 0,
  "preferredStaffId" TEXT REFERENCES staff(id) ON DELETE SET NULL,
  "tenantId" TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- メニューカテゴリー
CREATE TABLE IF NOT EXISTS menu_categories (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  "displayOrder" INTEGER DEFAULT 0,
  "isActive" BOOLEAN DEFAULT true,
  "tenantId" TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("tenantId", name)
);

-- メニュー
CREATE TABLE IF NOT EXISTS menus (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  "durationMin" INTEGER NOT NULL,
  "categoryId" TEXT REFERENCES menu_categories(id) ON DELETE CASCADE,
  "isActive" BOOLEAN DEFAULT true,
  "displayOrder" INTEGER DEFAULT 0,
  "tenantId" TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  popularity INTEGER DEFAULT 0,
  seasonality TEXT,
  "ageGroup" TEXT,
  "genderTarget" TEXT
);

-- 予約
CREATE TABLE IF NOT EXISTS reservations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "startTime" TIMESTAMP WITH TIME ZONE NOT NULL,
  "endTime" TIMESTAMP WITH TIME ZONE,
  "menuContent" TEXT,
  "customerName" TEXT,
  "customerId" TEXT REFERENCES customers(id) ON DELETE SET NULL,
  "customerPhone" TEXT,
  "customerEmail" TEXT,
  "staffId" TEXT REFERENCES staff(id) ON DELETE SET NULL,
  source TEXT NOT NULL,
  "sourceId" TEXT,
  status TEXT DEFAULT 'CONFIRMED',
  notes TEXT,
  "totalAmount" DECIMAL DEFAULT 0,
  "estimatedDuration" INTEGER,
  "profitMargin" DECIMAL,
  "weatherImpact" TEXT,
  "sourceCampaign" TEXT,
  "tenantId" TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "nextVisitDate" TIMESTAMP WITH TIME ZONE,
  "reminderSentAt" TIMESTAMP WITH TIME ZONE,
  "followUpSentAt" TIMESTAMP WITH TIME ZONE,
  "beforePhotos" TEXT,
  "afterPhotos" TEXT,
  "stylistNotes" TEXT
);

-- メッセージスレッド
CREATE TABLE IF NOT EXISTS message_threads (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "customerId" TEXT REFERENCES customers(id) ON DELETE SET NULL,
  channel TEXT NOT NULL,
  "channelThreadId" TEXT NOT NULL,
  "assignedStaffId" TEXT REFERENCES staff(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'OPEN',
  "aiAnalyzed" BOOLEAN DEFAULT false,
  "sentimentScore" FLOAT,
  "priorityLevel" INTEGER DEFAULT 3,
  "autoReplyEnabled" BOOLEAN DEFAULT true,
  "tenantId" TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("tenantId", channel, "channelThreadId")
);

-- メッセージ
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "threadId" TEXT NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE,
  "senderId" TEXT REFERENCES staff(id) ON DELETE SET NULL,
  "senderType" TEXT NOT NULL,
  content TEXT NOT NULL,
  "mediaType" TEXT DEFAULT 'TEXT',
  "mediaUrl" TEXT,
  "externalId" TEXT,
  "isRead" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_tenants_active ON tenants("isActive");
CREATE INDEX IF NOT EXISTS idx_staff_tenant ON staff("tenantId");
CREATE INDEX IF NOT EXISTS idx_customers_tenant ON customers("tenantId");
CREATE INDEX IF NOT EXISTS idx_customers_tenant_name ON customers("tenantId", name);
CREATE INDEX IF NOT EXISTS idx_customers_tenant_phone ON customers("tenantId", phone);
CREATE INDEX IF NOT EXISTS idx_reservations_tenant ON reservations("tenantId");
CREATE INDEX IF NOT EXISTS idx_reservations_tenant_start ON reservations("tenantId", "startTime");
CREATE INDEX IF NOT EXISTS idx_message_threads_tenant ON message_threads("tenantId");

-- 更新時刻を自動更新するトリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_categories_updated_at BEFORE UPDATE ON menu_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menus_updated_at BEFORE UPDATE ON menus
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_message_threads_updated_at BEFORE UPDATE ON message_threads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();