-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "plan" TEXT NOT NULL DEFAULT 'light',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "tenant_settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "tenant_settings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "staff" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'STAFF',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" DATETIME,
    "tenantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" TEXT,
    "backupCodes" TEXT,
    "loginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" DATETIME,
    "passwordResetToken" TEXT,
    "passwordResetExpires" DATETIME,
    CONSTRAINT "staff_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "nameKana" TEXT,
    "gender" TEXT,
    "birthDate" DATETIME,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "instagramId" TEXT,
    "lineId" TEXT,
    "firstVisitDate" DATETIME,
    "lastVisitDate" DATETIME,
    "visitCount" INTEGER NOT NULL DEFAULT 0,
    "totalSpent" DECIMAL DEFAULT 0,
    "notes" TEXT,
    "segment" TEXT,
    "lifetimeValue" DECIMAL DEFAULT 0,
    "riskScore" INTEGER DEFAULT 0,
    "preferredStaffId" TEXT,
    "tenantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "customers_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "customers_preferredStaffId_fkey" FOREIGN KEY ("preferredStaffId") REFERENCES "staff" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#3B82F6',
    "type" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tags_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "customer_tags" (
    "customerId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("customerId", "tagId"),
    CONSTRAINT "customer_tags_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "customer_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "message_threads" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerId" TEXT,
    "channel" TEXT NOT NULL,
    "channelThreadId" TEXT NOT NULL,
    "assignedStaffId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "aiAnalyzed" BOOLEAN NOT NULL DEFAULT false,
    "sentimentScore" REAL,
    "priorityLevel" INTEGER NOT NULL DEFAULT 3,
    "autoReplyEnabled" BOOLEAN NOT NULL DEFAULT true,
    "tenantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "message_threads_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "message_threads_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "message_threads_assignedStaffId_fkey" FOREIGN KEY ("assignedStaffId") REFERENCES "staff" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "thread_tags" (
    "threadId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("threadId", "tagId"),
    CONSTRAINT "thread_tags_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "message_threads" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "thread_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "threadId" TEXT NOT NULL,
    "senderId" TEXT,
    "senderType" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "mediaType" TEXT NOT NULL DEFAULT 'TEXT',
    "mediaUrl" TEXT,
    "externalId" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "messages_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "message_threads" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "staff" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "reservations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME,
    "menuContent" TEXT,
    "customerName" TEXT,
    "customerId" TEXT,
    "customerPhone" TEXT,
    "customerEmail" TEXT,
    "staffId" TEXT,
    "source" TEXT NOT NULL,
    "sourceId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'CONFIRMED',
    "notes" TEXT,
    "totalAmount" DECIMAL DEFAULT 0,
    "estimatedDuration" INTEGER,
    "profitMargin" DECIMAL,
    "weatherImpact" TEXT,
    "sourceCampaign" TEXT,
    "tenantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "nextVisitDate" DATETIME,
    "reminderSentAt" DATETIME,
    "followUpSentAt" DATETIME,
    "beforePhotos" TEXT,
    "afterPhotos" TEXT,
    "stylistNotes" TEXT,
    CONSTRAINT "reservations_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "reservations_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "reservations_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "staff" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT,
    "createdById" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "templates_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "templates_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "staff" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "description" TEXT,
    "staffId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "tenantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "audit_logs_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "staff" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "auto_message_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "tenantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "auto_message_templates_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "auto_message_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reservationId" TEXT,
    "customerId" TEXT NOT NULL,
    "templateType" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "messageContent" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "sentAt" DATETIME,
    "errorMessage" TEXT,
    "tenantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "auto_message_logs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "auto_message_logs_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "auto_message_logs_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "reservations" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "menu_categories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "tenantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "menu_categories_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "menus" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "categoryId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "tenantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "popularity" INTEGER NOT NULL DEFAULT 0,
    "seasonality" TEXT,
    "ageGroup" TEXT,
    "genderTarget" TEXT,
    CONSTRAINT "menus_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "menus_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "menu_categories" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "menu_history" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerId" TEXT NOT NULL,
    "menuId" TEXT NOT NULL,
    "visitDate" DATETIME NOT NULL,
    "satisfaction" INTEGER,
    "notes" TEXT,
    "tenantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "menu_history_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "menu_history_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "menus" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "menu_history_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "menu_recommendations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerId" TEXT NOT NULL,
    "menuId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "score" REAL NOT NULL,
    "reasoning" TEXT NOT NULL,
    "factors" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    CONSTRAINT "menu_recommendations_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "menu_recommendations_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "menus" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "menu_recommendations_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "staffId" TEXT,
    "customerId" TEXT,
    "metadata" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notifications_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "notifications_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "staff" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "notifications_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "analytics_metrics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "metricKey" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "date" DATETIME NOT NULL,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "analytics_metrics_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "prediction_data" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "predictionType" TEXT NOT NULL,
    "targetDate" DATETIME NOT NULL,
    "predictedValue" REAL NOT NULL,
    "confidence" REAL NOT NULL,
    "actualValue" REAL,
    "features" TEXT NOT NULL,
    "modelVersion" TEXT NOT NULL DEFAULT 'v1.0',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "prediction_data_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "customer_behaviors" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "lastVisitDate" DATETIME,
    "visitFrequency" REAL,
    "averageSpending" REAL,
    "preferredTimeSlot" TEXT,
    "churnProbability" REAL,
    "lifetimeValue" REAL,
    "riskScore" REAL,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "customer_behaviors_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "customer_behaviors_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    CONSTRAINT "refresh_tokens_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "staff" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "login_history" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "staffId" TEXT,
    "tenantId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "failReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "login_history_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "staff" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "login_history_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "security_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "staffId" TEXT,
    "eventType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" TEXT,
    "severity" TEXT NOT NULL DEFAULT 'INFO',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "security_events_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "security_events_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "staff" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "customer_preferences" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "customerId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "preferredStaff" TEXT,
    "preferredTime" TEXT,
    "preferredDay" TEXT,
    "communicationPref" TEXT NOT NULL DEFAULT 'LINE',
    "favoriteServices" TEXT,
    "avoidServices" TEXT,
    "notes" TEXT,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "customer_preferences_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "customer_preferences_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "marketing_campaigns" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "targetSegment" TEXT,
    "targetCustomerIds" TEXT,
    "scheduledAt" DATETIME,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "messageContent" TEXT NOT NULL,
    "subject" TEXT,
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "openCount" INTEGER NOT NULL DEFAULT 0,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "responseCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "marketing_campaigns_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "staff_performance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "staffId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "totalReservations" INTEGER NOT NULL DEFAULT 0,
    "totalRevenue" REAL NOT NULL DEFAULT 0,
    "avgServiceTime" REAL NOT NULL DEFAULT 0,
    "customerSatisfaction" REAL NOT NULL DEFAULT 0,
    "newCustomers" INTEGER NOT NULL DEFAULT 0,
    "repeatCustomers" INTEGER NOT NULL DEFAULT 0,
    "referrals" INTEGER NOT NULL DEFAULT 0,
    "utilizationRate" REAL NOT NULL DEFAULT 0,
    "noShowRate" REAL NOT NULL DEFAULT 0,
    "cancelRate" REAL NOT NULL DEFAULT 0,
    "skillRating" REAL NOT NULL DEFAULT 0,
    "trainingHours" REAL NOT NULL DEFAULT 0,
    "certifications" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "staff_performance_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "staff" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "staff_performance_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "provider" TEXT NOT NULL,
    "providerPaymentId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'JPY',
    "status" TEXT NOT NULL,
    "description" TEXT,
    "paymentMethodId" TEXT NOT NULL,
    "failureReason" TEXT,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "payments_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "payments_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "planType" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerSubscriptionId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "currentPeriodStart" DATETIME NOT NULL,
    "currentPeriodEnd" DATETIME NOT NULL,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "trialEnd" DATETIME,
    "paymentMethodId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "subscriptions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerInvoiceId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'JPY',
    "status" TEXT NOT NULL,
    "periodStart" DATETIME NOT NULL,
    "periodEnd" DATETIME NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "paidAt" DATETIME,
    "invoiceUrl" TEXT,
    "invoicePdf" TEXT,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "invoices_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "invoices_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "webhook_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "feedback" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" TEXT,
    "category" TEXT,
    "screenshot" TEXT,
    "rating" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'open',
    "userId" TEXT,
    "userEmail" TEXT,
    "userName" TEXT,
    "tenantId" TEXT,
    "userAgent" TEXT,
    "url" TEXT,
    "metadata" TEXT,
    "adminNotes" TEXT,
    "resolvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "feedback_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "quick_ratings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rating" INTEGER NOT NULL,
    "userId" TEXT,
    "userEmail" TEXT,
    "tenantId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "quick_ratings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "beta_applications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "salonName" TEXT NOT NULL,
    "salonType" TEXT NOT NULL,
    "numberOfStylists" TEXT NOT NULL,
    "currentSoftware" TEXT,
    "painPoints" TEXT NOT NULL,
    "expectations" TEXT NOT NULL,
    "availableHours" TEXT NOT NULL,
    "referralSource" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewNotes" TEXT,
    "reviewedAt" DATETIME,
    "metadata" TEXT,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "feature_flags" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "rolloutPercentage" INTEGER NOT NULL DEFAULT 0,
    "enabledTenants" TEXT,
    "enabledPlans" TEXT,
    "config" TEXT,
    "dependencies" TEXT,
    "releaseDate" DATETIME,
    "deprecationDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "tenant_feature_flags" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "featureFlagId" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "config" TEXT,
    "enabledAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tenant_feature_flags_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "tenant_feature_flags_featureFlagId_fkey" FOREIGN KEY ("featureFlagId") REFERENCES "feature_flags" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "tenants_isActive_idx" ON "tenants"("isActive");

-- CreateIndex
CREATE INDEX "tenants_plan_isActive_idx" ON "tenants"("plan", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_settings_tenantId_key_key" ON "tenant_settings"("tenantId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "staff_email_key" ON "staff"("email");

-- CreateIndex
CREATE UNIQUE INDEX "customers_instagramId_key" ON "customers"("instagramId");

-- CreateIndex
CREATE UNIQUE INDEX "customers_lineId_key" ON "customers"("lineId");

-- CreateIndex
CREATE INDEX "customers_tenantId_idx" ON "customers"("tenantId");

-- CreateIndex
CREATE INDEX "customers_tenantId_name_idx" ON "customers"("tenantId", "name");

-- CreateIndex
CREATE INDEX "customers_tenantId_phone_idx" ON "customers"("tenantId", "phone");

-- CreateIndex
CREATE INDEX "customers_tenantId_email_idx" ON "customers"("tenantId", "email");

-- CreateIndex
CREATE INDEX "customers_tenantId_lastVisitDate_idx" ON "customers"("tenantId", "lastVisitDate");

-- CreateIndex
CREATE INDEX "customers_tenantId_visitCount_idx" ON "customers"("tenantId", "visitCount");

-- CreateIndex
CREATE INDEX "customers_tenantId_createdAt_idx" ON "customers"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "customers_instagramId_idx" ON "customers"("instagramId");

-- CreateIndex
CREATE INDEX "customers_lineId_idx" ON "customers"("lineId");

-- CreateIndex
CREATE INDEX "customers_tenantId_birthDate_idx" ON "customers"("tenantId", "birthDate");

-- CreateIndex
CREATE UNIQUE INDEX "tags_tenantId_name_type_key" ON "tags"("tenantId", "name", "type");

-- CreateIndex
CREATE INDEX "message_threads_tenantId_idx" ON "message_threads"("tenantId");

-- CreateIndex
CREATE INDEX "message_threads_tenantId_status_idx" ON "message_threads"("tenantId", "status");

-- CreateIndex
CREATE INDEX "message_threads_tenantId_assignedStaffId_idx" ON "message_threads"("tenantId", "assignedStaffId");

-- CreateIndex
CREATE INDEX "message_threads_tenantId_customerId_idx" ON "message_threads"("tenantId", "customerId");

-- CreateIndex
CREATE INDEX "message_threads_tenantId_channel_idx" ON "message_threads"("tenantId", "channel");

-- CreateIndex
CREATE INDEX "message_threads_tenantId_createdAt_idx" ON "message_threads"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "message_threads_tenantId_updatedAt_idx" ON "message_threads"("tenantId", "updatedAt");

-- CreateIndex
CREATE INDEX "message_threads_status_updatedAt_idx" ON "message_threads"("status", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "message_threads_tenantId_channel_channelThreadId_key" ON "message_threads"("tenantId", "channel", "channelThreadId");

-- CreateIndex
CREATE INDEX "reservations_tenantId_idx" ON "reservations"("tenantId");

-- CreateIndex
CREATE INDEX "reservations_tenantId_startTime_idx" ON "reservations"("tenantId", "startTime");

-- CreateIndex
CREATE INDEX "reservations_tenantId_status_idx" ON "reservations"("tenantId", "status");

-- CreateIndex
CREATE INDEX "reservations_tenantId_staffId_idx" ON "reservations"("tenantId", "staffId");

-- CreateIndex
CREATE INDEX "reservations_tenantId_customerId_idx" ON "reservations"("tenantId", "customerId");

-- CreateIndex
CREATE INDEX "reservations_tenantId_startTime_status_idx" ON "reservations"("tenantId", "startTime", "status");

-- CreateIndex
CREATE INDEX "reservations_tenantId_staffId_startTime_idx" ON "reservations"("tenantId", "staffId", "startTime");

-- CreateIndex
CREATE INDEX "reservations_startTime_endTime_idx" ON "reservations"("startTime", "endTime");

-- CreateIndex
CREATE INDEX "reservations_status_startTime_idx" ON "reservations"("status", "startTime");

-- CreateIndex
CREATE INDEX "reservations_tenantId_source_idx" ON "reservations"("tenantId", "source");

-- CreateIndex
CREATE INDEX "reservations_tenantId_nextVisitDate_idx" ON "reservations"("tenantId", "nextVisitDate");

-- CreateIndex
CREATE INDEX "reservations_reminderSentAt_idx" ON "reservations"("reminderSentAt");

-- CreateIndex
CREATE UNIQUE INDEX "auto_message_templates_tenantId_type_key" ON "auto_message_templates"("tenantId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "menu_categories_tenantId_name_key" ON "menu_categories"("tenantId", "name");

-- CreateIndex
CREATE INDEX "notifications_tenantId_isRead_idx" ON "notifications"("tenantId", "isRead");

-- CreateIndex
CREATE INDEX "notifications_staffId_isRead_idx" ON "notifications"("staffId", "isRead");

-- CreateIndex
CREATE INDEX "analytics_metrics_tenantId_metricKey_idx" ON "analytics_metrics"("tenantId", "metricKey");

-- CreateIndex
CREATE INDEX "analytics_metrics_date_idx" ON "analytics_metrics"("date");

-- CreateIndex
CREATE UNIQUE INDEX "analytics_metrics_tenantId_metricKey_date_key" ON "analytics_metrics"("tenantId", "metricKey", "date");

-- CreateIndex
CREATE INDEX "prediction_data_tenantId_predictionType_idx" ON "prediction_data"("tenantId", "predictionType");

-- CreateIndex
CREATE INDEX "prediction_data_targetDate_idx" ON "prediction_data"("targetDate");

-- CreateIndex
CREATE UNIQUE INDEX "prediction_data_tenantId_predictionType_targetDate_modelVersion_key" ON "prediction_data"("tenantId", "predictionType", "targetDate", "modelVersion");

-- CreateIndex
CREATE INDEX "customer_behaviors_tenantId_churnProbability_idx" ON "customer_behaviors"("tenantId", "churnProbability");

-- CreateIndex
CREATE INDEX "customer_behaviors_tenantId_lifetimeValue_idx" ON "customer_behaviors"("tenantId", "lifetimeValue");

-- CreateIndex
CREATE UNIQUE INDEX "customer_behaviors_customerId_key" ON "customer_behaviors"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "login_history_staffId_idx" ON "login_history"("staffId");

-- CreateIndex
CREATE INDEX "login_history_tenantId_createdAt_idx" ON "login_history"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "security_events_tenantId_severity_idx" ON "security_events"("tenantId", "severity");

-- CreateIndex
CREATE INDEX "security_events_eventType_idx" ON "security_events"("eventType");

-- CreateIndex
CREATE UNIQUE INDEX "customer_preferences_customerId_tenantId_key" ON "customer_preferences"("customerId", "tenantId");

-- CreateIndex
CREATE INDEX "staff_performance_tenantId_year_month_idx" ON "staff_performance"("tenantId", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "staff_performance_staffId_month_year_key" ON "staff_performance"("staffId", "month", "year");

-- CreateIndex
CREATE INDEX "payments_tenantId_status_idx" ON "payments"("tenantId", "status");

-- CreateIndex
CREATE INDEX "payments_provider_providerPaymentId_idx" ON "payments"("provider", "providerPaymentId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_tenantId_key" ON "subscriptions"("tenantId");

-- CreateIndex
CREATE INDEX "subscriptions_status_currentPeriodEnd_idx" ON "subscriptions"("status", "currentPeriodEnd");

-- CreateIndex
CREATE INDEX "subscriptions_provider_providerSubscriptionId_idx" ON "subscriptions"("provider", "providerSubscriptionId");

-- CreateIndex
CREATE INDEX "invoices_tenantId_status_idx" ON "invoices"("tenantId", "status");

-- CreateIndex
CREATE INDEX "invoices_subscriptionId_status_idx" ON "invoices"("subscriptionId", "status");

-- CreateIndex
CREATE INDEX "invoices_provider_providerInvoiceId_idx" ON "invoices"("provider", "providerInvoiceId");

-- CreateIndex
CREATE INDEX "webhook_events_provider_processed_idx" ON "webhook_events"("provider", "processed");

-- CreateIndex
CREATE INDEX "webhook_events_eventType_processed_idx" ON "webhook_events"("eventType", "processed");

-- CreateIndex
CREATE UNIQUE INDEX "webhook_events_provider_eventId_key" ON "webhook_events"("provider", "eventId");

-- CreateIndex
CREATE INDEX "feedback_type_status_idx" ON "feedback"("type", "status");

-- CreateIndex
CREATE INDEX "feedback_tenantId_createdAt_idx" ON "feedback"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "quick_ratings_tenantId_createdAt_idx" ON "quick_ratings"("tenantId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "beta_applications_email_key" ON "beta_applications"("email");

-- CreateIndex
CREATE INDEX "beta_applications_status_submittedAt_idx" ON "beta_applications"("status", "submittedAt");

-- CreateIndex
CREATE INDEX "beta_applications_salonType_submittedAt_idx" ON "beta_applications"("salonType", "submittedAt");

-- CreateIndex
CREATE UNIQUE INDEX "feature_flags_key_key" ON "feature_flags"("key");

-- CreateIndex
CREATE INDEX "feature_flags_isEnabled_category_idx" ON "feature_flags"("isEnabled", "category");

-- CreateIndex
CREATE INDEX "feature_flags_key_idx" ON "feature_flags"("key");

-- CreateIndex
CREATE INDEX "tenant_feature_flags_tenantId_isEnabled_idx" ON "tenant_feature_flags"("tenantId", "isEnabled");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_feature_flags_tenantId_featureFlagId_key" ON "tenant_feature_flags"("tenantId", "featureFlagId");
