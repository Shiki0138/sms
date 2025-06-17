-- CreateTable
CREATE TABLE "customer_preferences" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "preferenceValue" TEXT NOT NULL,
    "confidenceScore" REAL NOT NULL DEFAULT 0.5,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "customer_preferences_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "customer_preferences_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "marketing_campaigns" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "targetSegment" TEXT,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "budget" DECIMAL DEFAULT 0,
    "conversionRate" REAL NOT NULL DEFAULT 0.0,
    "roi" REAL NOT NULL DEFAULT 0.0,
    "tenantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "marketing_campaigns_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "staff_performance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "staffId" TEXT NOT NULL,
    "month" DATETIME NOT NULL,
    "appointmentsCount" INTEGER NOT NULL DEFAULT 0,
    "revenueGenerated" DECIMAL NOT NULL DEFAULT 0,
    "customerSatisfaction" REAL NOT NULL DEFAULT 0.0,
    "upsellRate" REAL NOT NULL DEFAULT 0.0,
    "repeatRate" REAL NOT NULL DEFAULT 0.0,
    "avgServiceTime" INTEGER NOT NULL DEFAULT 0,
    "tenantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "staff_performance_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "staff" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "staff_performance_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- AlterTable
ALTER TABLE "customers" ADD COLUMN "segment" TEXT;
ALTER TABLE "customers" ADD COLUMN "lifetimeValue" DECIMAL DEFAULT 0;
ALTER TABLE "customers" ADD COLUMN "riskScore" INTEGER DEFAULT 0;
ALTER TABLE "customers" ADD COLUMN "preferredStaffId" TEXT;
ALTER TABLE "customers" ADD COLUMN "totalSpent" DECIMAL DEFAULT 0;

-- AlterTable
ALTER TABLE "reservations" ADD COLUMN "totalAmount" DECIMAL DEFAULT 0;
ALTER TABLE "reservations" ADD COLUMN "estimatedDuration" INTEGER;
ALTER TABLE "reservations" ADD COLUMN "profitMargin" DECIMAL;
ALTER TABLE "reservations" ADD COLUMN "weatherImpact" TEXT;
ALTER TABLE "reservations" ADD COLUMN "sourceCampaign" TEXT;

-- AlterTable
ALTER TABLE "message_threads" ADD COLUMN "aiAnalyzed" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "message_threads" ADD COLUMN "sentimentScore" REAL;
ALTER TABLE "message_threads" ADD COLUMN "priorityLevel" INTEGER NOT NULL DEFAULT 3;
ALTER TABLE "message_threads" ADD COLUMN "autoReplyEnabled" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "customer_preferences_customerId_idx" ON "customer_preferences"("customerId");

-- CreateIndex
CREATE INDEX "customer_preferences_category_idx" ON "customer_preferences"("category");

-- CreateIndex
CREATE INDEX "customer_preferences_tenantId_idx" ON "customer_preferences"("tenantId");

-- CreateIndex
CREATE INDEX "customer_preferences_customerId_category_idx" ON "customer_preferences"("customerId", "category");

-- CreateIndex
CREATE INDEX "marketing_campaigns_tenantId_idx" ON "marketing_campaigns"("tenantId");

-- CreateIndex
CREATE INDEX "marketing_campaigns_startDate_endDate_idx" ON "marketing_campaigns"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "marketing_campaigns_targetSegment_idx" ON "marketing_campaigns"("targetSegment");

-- CreateIndex
CREATE INDEX "marketing_campaigns_tenantId_type_idx" ON "marketing_campaigns"("tenantId", "type");

-- CreateIndex
CREATE INDEX "staff_performance_staffId_idx" ON "staff_performance"("staffId");

-- CreateIndex
CREATE INDEX "staff_performance_month_idx" ON "staff_performance"("month");

-- CreateIndex
CREATE INDEX "staff_performance_tenantId_idx" ON "staff_performance"("tenantId");

-- CreateIndex
CREATE INDEX "staff_performance_staffId_month_idx" ON "staff_performance"("staffId", "month");

-- CreateIndex
CREATE UNIQUE INDEX "staff_performance_staffId_month_key" ON "staff_performance"("staffId", "month");

-- Performance optimization indexes
CREATE INDEX "idx_customers_segment" ON "customers"("segment");
CREATE INDEX "idx_customers_last_visit" ON "customers"("last_visit_date");
CREATE INDEX "idx_reservations_date_staff" ON "reservations"("start_time", "staff_id");
CREATE INDEX "idx_messages_thread_created" ON "message_threads"("created_at");
CREATE INDEX "idx_customer_analytics" ON "customers"("tenant_id", "segment", "lifetime_value", "last_visit_date");
CREATE INDEX "idx_reservation_analysis" ON "reservations"("tenant_id", "start_time", "status", "total_amount");
CREATE INDEX "idx_message_sentiment" ON "message_threads"("tenant_id", "sentiment_score", "priority_level");