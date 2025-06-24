-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "plan" TEXT NOT NULL DEFAULT 'light',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_settings" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'STAFF',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" TEXT,
    "backupCodes" TEXT,
    "loginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "passwordResetToken" TEXT,
    "passwordResetExpires" TIMESTAMP(3),

    CONSTRAINT "staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "nameKana" TEXT,
    "gender" TEXT,
    "birthDate" TIMESTAMP(3),
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "instagramId" TEXT,
    "lineId" TEXT,
    "firstVisitDate" TIMESTAMP(3),
    "lastVisitDate" TIMESTAMP(3),
    "visitCount" INTEGER NOT NULL DEFAULT 0,
    "totalSpent" DECIMAL(65,30) DEFAULT 0,
    "notes" TEXT,
    "segment" TEXT,
    "lifetimeValue" DECIMAL(65,30) DEFAULT 0,
    "riskScore" INTEGER DEFAULT 0,
    "preferredStaffId" TEXT,
    "profilePhoto" TEXT,
    "source" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#3B82F6',
    "type" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_tags" (
    "customerId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_tags_pkey" PRIMARY KEY ("customerId","tagId")
);

-- CreateTable
CREATE TABLE "message_threads" (
    "id" TEXT NOT NULL,
    "customerId" TEXT,
    "channel" TEXT NOT NULL,
    "channelThreadId" TEXT NOT NULL,
    "assignedStaffId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "aiAnalyzed" BOOLEAN NOT NULL DEFAULT false,
    "sentimentScore" DOUBLE PRECISION,
    "priorityLevel" INTEGER NOT NULL DEFAULT 3,
    "autoReplyEnabled" BOOLEAN NOT NULL DEFAULT true,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "message_threads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "thread_tags" (
    "threadId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "thread_tags_pkey" PRIMARY KEY ("threadId","tagId")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "senderId" TEXT,
    "senderType" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "mediaType" TEXT NOT NULL DEFAULT 'TEXT',
    "mediaUrl" TEXT,
    "externalId" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservations" (
    "id" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "menuContent" TEXT,
    "serviceContent" TEXT,
    "customerName" TEXT,
    "customerId" TEXT,
    "customerPhone" TEXT,
    "customerEmail" TEXT,
    "staffId" TEXT,
    "source" TEXT NOT NULL,
    "sourceId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'CONFIRMED',
    "notes" TEXT,
    "totalAmount" DECIMAL(65,30) DEFAULT 0,
    "paymentStatus" TEXT DEFAULT 'pending',
    "paymentId" TEXT,
    "estimatedDuration" INTEGER,
    "profitMargin" DECIMAL(65,30),
    "weatherImpact" TEXT,
    "sourceCampaign" TEXT,
    "reminderSent" BOOLEAN NOT NULL DEFAULT false,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "nextVisitDate" TIMESTAMP(3),
    "reminderSentAt" TIMESTAMP(3),
    "followUpSentAt" TIMESTAMP(3),
    "beforePhotos" TEXT,
    "afterPhotos" TEXT,
    "stylistNotes" TEXT,

    CONSTRAINT "reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "templates" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT,
    "createdById" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "description" TEXT,
    "staffId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auto_message_templates" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auto_message_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auto_message_logs" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT,
    "customerId" TEXT NOT NULL,
    "templateType" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "messageContent" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auto_message_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menus" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "categoryId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "popularity" INTEGER NOT NULL DEFAULT 0,
    "seasonality" TEXT,
    "ageGroup" TEXT,
    "genderTarget" TEXT,

    CONSTRAINT "menus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_history" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "menuId" TEXT NOT NULL,
    "visitDate" TIMESTAMP(3) NOT NULL,
    "satisfaction" INTEGER,
    "notes" TEXT,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "menu_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_recommendations" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "menuId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "reasoning" TEXT NOT NULL,
    "factors" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "staffId" TEXT,
    "customerId" TEXT,
    "metadata" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_metrics" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "metricKey" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prediction_data" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "predictionType" TEXT NOT NULL,
    "targetDate" TIMESTAMP(3) NOT NULL,
    "predictedValue" DOUBLE PRECISION NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "actualValue" DOUBLE PRECISION,
    "features" TEXT NOT NULL,
    "modelVersion" TEXT NOT NULL DEFAULT 'v1.0',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prediction_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_behaviors" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "lastVisitDate" TIMESTAMP(3),
    "visitFrequency" DOUBLE PRECISION,
    "averageSpending" DOUBLE PRECISION,
    "preferredTimeSlot" TEXT,
    "churnProbability" DOUBLE PRECISION,
    "lifetimeValue" DOUBLE PRECISION,
    "riskScore" DOUBLE PRECISION,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_behaviors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "userAgent" TEXT,
    "ipAddress" TEXT,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "login_history" (
    "id" TEXT NOT NULL,
    "staffId" TEXT,
    "tenantId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "failReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "security_events" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "staffId" TEXT,
    "eventType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" TEXT,
    "severity" TEXT NOT NULL DEFAULT 'INFO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "security_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_preferences" (
    "id" SERIAL NOT NULL,
    "customerId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "preferredStaff" TEXT,
    "preferredTime" TEXT,
    "preferredDay" TEXT,
    "communicationPref" TEXT NOT NULL DEFAULT 'LINE',
    "favoriteServices" TEXT,
    "avoidServices" TEXT,
    "notes" TEXT,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketing_campaigns" (
    "id" SERIAL NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "targetSegment" TEXT,
    "targetCustomerIds" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "messageContent" TEXT NOT NULL,
    "subject" TEXT,
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "openCount" INTEGER NOT NULL DEFAULT 0,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "responseCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketing_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_performance" (
    "id" SERIAL NOT NULL,
    "staffId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "totalReservations" INTEGER NOT NULL DEFAULT 0,
    "totalRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgServiceTime" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "customerSatisfaction" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "newCustomers" INTEGER NOT NULL DEFAULT 0,
    "repeatCustomers" INTEGER NOT NULL DEFAULT 0,
    "referrals" INTEGER NOT NULL DEFAULT 0,
    "utilizationRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "noShowRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cancelRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "skillRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "trainingHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "certifications" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_performance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "provider" TEXT NOT NULL,
    "providerPaymentId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'JPY',
    "status" TEXT NOT NULL,
    "description" TEXT,
    "paymentMethodId" TEXT NOT NULL,
    "failureReason" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "planType" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerSubscriptionId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "trialEnd" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "paymentMethodId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerInvoiceId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'JPY',
    "status" TEXT NOT NULL,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "invoiceUrl" TEXT,
    "invoicePdf" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refunds" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "providerRefundId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refunds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_events" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback" (
    "id" TEXT NOT NULL,
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
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quick_ratings" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "userId" TEXT,
    "userEmail" TEXT,
    "tenantId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quick_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beta_applications" (
    "id" TEXT NOT NULL,
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
    "reviewedAt" TIMESTAMP(3),
    "metadata" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "beta_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_flags" (
    "id" TEXT NOT NULL,
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
    "releaseDate" TIMESTAMP(3),
    "deprecationDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_feature_flags" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "featureFlagId" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "config" TEXT,
    "enabledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenant_feature_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_staff_profiles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "profilePhoto" TEXT,
    "skills" TEXT NOT NULL,
    "licenses" TEXT,
    "experience" INTEGER NOT NULL,
    "specialties" TEXT,
    "preferredAreas" TEXT NOT NULL,
    "maxDistance" INTEGER NOT NULL DEFAULT 20,
    "minHourlyRate" DOUBLE PRECISION NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "completedCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_staff_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_staff_availabilities" (
    "id" TEXT NOT NULL,
    "staffProfileId" TEXT NOT NULL,
    "availableFrom" TIMESTAMP(3) NOT NULL,
    "availableTo" TIMESTAMP(3) NOT NULL,
    "availableDays" TEXT NOT NULL,
    "availableHours" TEXT NOT NULL,
    "hourlyRate" DOUBLE PRECISION NOT NULL,
    "services" TEXT NOT NULL,
    "preferredAreas" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_staff_availabilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_staff_requests" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requiredSkills" TEXT NOT NULL,
    "workDate" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "breakTime" INTEGER NOT NULL DEFAULT 60,
    "hourlyRate" DOUBLE PRECISION NOT NULL,
    "transportationFee" DOUBLE PRECISION,
    "location" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "nearestStation" TEXT,
    "urgencyLevel" TEXT NOT NULL DEFAULT 'NORMAL',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "maxApplications" INTEGER NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_staff_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_chat_history" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userMessage" TEXT NOT NULL,
    "aiResponse" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_chat_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_chat_feedback" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "helpful" BOOLEAN NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_chat_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_staff_applications" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "staffProfileId" TEXT NOT NULL,
    "availabilityId" TEXT,
    "message" TEXT,
    "proposedRate" DOUBLE PRECISION,
    "canArrive" BOOLEAN NOT NULL DEFAULT true,
    "estimatedArrival" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "viewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_staff_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_staff_matches" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "supportStaffId" TEXT NOT NULL,
    "agreedRate" DOUBLE PRECISION NOT NULL,
    "agreedStartTime" TEXT NOT NULL,
    "agreedEndTime" TEXT NOT NULL,
    "transportationFee" DOUBLE PRECISION,
    "actualStartTime" TIMESTAMP(3),
    "actualEndTime" TIMESTAMP(3),
    "actualBreakTime" INTEGER,
    "staffRating" INTEGER,
    "tenantRating" INTEGER,
    "staffFeedback" TEXT,
    "tenantFeedback" TEXT,
    "status" TEXT NOT NULL DEFAULT 'CONFIRMED',
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "cancelReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_staff_matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_staff_notifications" (
    "id" TEXT NOT NULL,
    "staffProfileId" TEXT,
    "tenantId" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "actionUrl" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "support_staff_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salary_dashboard" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "baseSalary" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "commission" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "bonus" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "supportEarnings" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "deductions" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalGross" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalNet" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "regularHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "overtimeHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "supportHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalCustomers" INTEGER NOT NULL DEFAULT 0,
    "totalRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgServiceTime" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "customerRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "monthlyGoal" DOUBLE PRECISION,
    "goalProgress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "projectedTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salary_dashboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_salary_records" (
    "id" TEXT NOT NULL,
    "dashboardId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "hoursWorked" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "customersServed" INTEGER NOT NULL DEFAULT 0,
    "dailyRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dailyEarnings" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "supportHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "supportEarnings" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "customerRating" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_salary_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incentive_rules" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "conditions" TEXT NOT NULL,
    "rewardType" TEXT NOT NULL,
    "rewardValue" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "validFrom" TIMESTAMP(3),
    "validTo" TIMESTAMP(3),
    "targetStaffIds" TEXT,
    "targetRoles" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incentive_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_achievements" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "achievedAt" TIMESTAMP(3) NOT NULL,
    "achievedValue" DOUBLE PRECISION NOT NULL,
    "rewardAmount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'EARNED',
    "metadata" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "staff_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_metrics" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "metricDate" TIMESTAMP(3) NOT NULL,
    "dailyRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "monthlyRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "yearlyRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "targetRevenue" DOUBLE PRECISION,
    "newCustomers" INTEGER NOT NULL DEFAULT 0,
    "repeatCustomers" INTEGER NOT NULL DEFAULT 0,
    "lostCustomers" INTEGER NOT NULL DEFAULT 0,
    "avgCustomerValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "customerRetentionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgServiceTime" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "chairUtilization" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "staffProductivity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "inventoryCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "laborCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "overheadCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "profitMargin" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competitor_analysis" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "competitorName" TEXT NOT NULL,
    "distance" DOUBLE PRECISION NOT NULL,
    "location" TEXT NOT NULL,
    "avgMenuPrice" DOUBLE PRECISION NOT NULL,
    "pricePosition" TEXT NOT NULL,
    "services" TEXT NOT NULL,
    "uniqueServices" TEXT,
    "onlineRating" DOUBLE PRECISION,
    "reviewCount" INTEGER,
    "strengthPoints" TEXT,
    "weaknessPoints" TEXT,
    "threats" TEXT,
    "opportunities" TEXT,
    "lastAnalyzedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "competitor_analysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "strategic_actions" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "targetMetric" TEXT NOT NULL,
    "targetValue" DOUBLE PRECISION NOT NULL,
    "currentValue" DOUBLE PRECISION,
    "expectedImpact" DOUBLE PRECISION NOT NULL,
    "assignedTo" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "actualImpact" DOUBLE PRECISION,
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "strategic_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_insights" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "importance" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "analysisData" TEXT NOT NULL,
    "evidence" TEXT,
    "predictedValue" DOUBLE PRECISION,
    "predictedDate" TIMESTAMP(3),
    "suggestedActions" TEXT,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "dismissed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "business_insights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insight_action_links" (
    "insightId" TEXT NOT NULL,
    "actionId" TEXT NOT NULL,

    CONSTRAINT "insight_action_links_pkey" PRIMARY KEY ("insightId","actionId")
);

-- CreateTable
CREATE TABLE "business_goals" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "metric" TEXT NOT NULL,
    "targetValue" DOUBLE PRECISION NOT NULL,
    "currentValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "period" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "strategies" TEXT,
    "milestones" TEXT,
    "achievedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "management_reports" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "reportDate" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "metrics" TEXT NOT NULL,
    "insights" TEXT NOT NULL,
    "recommendations" TEXT NOT NULL,
    "aiAnalysis" TEXT,
    "riskAssessment" TEXT,
    "opportunities" TEXT,
    "recipients" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "management_reports_pkey" PRIMARY KEY ("id")
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
CREATE UNIQUE INDEX "prediction_data_tenantId_predictionType_targetDate_modelVer_key" ON "prediction_data"("tenantId", "predictionType", "targetDate", "modelVersion");

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
CREATE UNIQUE INDEX "payments_provider_providerPaymentId_key" ON "payments"("provider", "providerPaymentId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_tenantId_key" ON "subscriptions"("tenantId");

-- CreateIndex
CREATE INDEX "subscriptions_status_currentPeriodEnd_idx" ON "subscriptions"("status", "currentPeriodEnd");

-- CreateIndex
CREATE INDEX "subscriptions_provider_providerSubscriptionId_idx" ON "subscriptions"("provider", "providerSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_provider_providerSubscriptionId_key" ON "subscriptions"("provider", "providerSubscriptionId");

-- CreateIndex
CREATE INDEX "invoices_tenantId_status_idx" ON "invoices"("tenantId", "status");

-- CreateIndex
CREATE INDEX "invoices_subscriptionId_status_idx" ON "invoices"("subscriptionId", "status");

-- CreateIndex
CREATE INDEX "invoices_provider_providerInvoiceId_idx" ON "invoices"("provider", "providerInvoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_provider_providerInvoiceId_key" ON "invoices"("provider", "providerInvoiceId");

-- CreateIndex
CREATE INDEX "refunds_paymentId_idx" ON "refunds"("paymentId");

-- CreateIndex
CREATE INDEX "refunds_tenantId_idx" ON "refunds"("tenantId");

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

-- CreateIndex
CREATE UNIQUE INDEX "support_staff_profiles_email_key" ON "support_staff_profiles"("email");

-- CreateIndex
CREATE INDEX "support_staff_profiles_isActive_isVerified_idx" ON "support_staff_profiles"("isActive", "isVerified");

-- CreateIndex
CREATE INDEX "support_staff_availabilities_staffProfileId_isActive_idx" ON "support_staff_availabilities"("staffProfileId", "isActive");

-- CreateIndex
CREATE INDEX "support_staff_availabilities_availableFrom_availableTo_idx" ON "support_staff_availabilities"("availableFrom", "availableTo");

-- CreateIndex
CREATE INDEX "support_staff_requests_tenantId_status_idx" ON "support_staff_requests"("tenantId", "status");

-- CreateIndex
CREATE INDEX "support_staff_requests_status_workDate_idx" ON "support_staff_requests"("status", "workDate");

-- CreateIndex
CREATE INDEX "support_staff_requests_latitude_longitude_idx" ON "support_staff_requests"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "ai_chat_history_sessionId_idx" ON "ai_chat_history"("sessionId");

-- CreateIndex
CREATE INDEX "ai_chat_history_userId_idx" ON "ai_chat_history"("userId");

-- CreateIndex
CREATE INDEX "ai_chat_feedback_sessionId_idx" ON "ai_chat_feedback"("sessionId");

-- CreateIndex
CREATE INDEX "support_staff_applications_requestId_status_idx" ON "support_staff_applications"("requestId", "status");

-- CreateIndex
CREATE INDEX "support_staff_applications_staffProfileId_idx" ON "support_staff_applications"("staffProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "support_staff_applications_requestId_staffProfileId_key" ON "support_staff_applications"("requestId", "staffProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "support_staff_matches_requestId_key" ON "support_staff_matches"("requestId");

-- CreateIndex
CREATE UNIQUE INDEX "support_staff_matches_applicationId_key" ON "support_staff_matches"("applicationId");

-- CreateIndex
CREATE INDEX "support_staff_matches_status_idx" ON "support_staff_matches"("status");

-- CreateIndex
CREATE INDEX "support_staff_matches_supportStaffId_status_idx" ON "support_staff_matches"("supportStaffId", "status");

-- CreateIndex
CREATE INDEX "support_staff_notifications_staffProfileId_isRead_idx" ON "support_staff_notifications"("staffProfileId", "isRead");

-- CreateIndex
CREATE INDEX "support_staff_notifications_tenantId_isRead_idx" ON "support_staff_notifications"("tenantId", "isRead");

-- CreateIndex
CREATE INDEX "salary_dashboard_tenantId_year_month_idx" ON "salary_dashboard"("tenantId", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "salary_dashboard_staffId_year_month_key" ON "salary_dashboard"("staffId", "year", "month");

-- CreateIndex
CREATE INDEX "daily_salary_records_dashboardId_date_idx" ON "daily_salary_records"("dashboardId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "daily_salary_records_staffId_date_key" ON "daily_salary_records"("staffId", "date");

-- CreateIndex
CREATE INDEX "incentive_rules_tenantId_isActive_idx" ON "incentive_rules"("tenantId", "isActive");

-- CreateIndex
CREATE INDEX "incentive_rules_type_isActive_idx" ON "incentive_rules"("type", "isActive");

-- CreateIndex
CREATE INDEX "staff_achievements_staffId_achievedAt_idx" ON "staff_achievements"("staffId", "achievedAt");

-- CreateIndex
CREATE INDEX "staff_achievements_tenantId_achievedAt_idx" ON "staff_achievements"("tenantId", "achievedAt");

-- CreateIndex
CREATE INDEX "business_metrics_tenantId_metricDate_idx" ON "business_metrics"("tenantId", "metricDate");

-- CreateIndex
CREATE UNIQUE INDEX "business_metrics_tenantId_metricDate_key" ON "business_metrics"("tenantId", "metricDate");

-- CreateIndex
CREATE INDEX "competitor_analysis_tenantId_idx" ON "competitor_analysis"("tenantId");

-- CreateIndex
CREATE INDEX "strategic_actions_tenantId_status_idx" ON "strategic_actions"("tenantId", "status");

-- CreateIndex
CREATE INDEX "strategic_actions_tenantId_priority_idx" ON "strategic_actions"("tenantId", "priority");

-- CreateIndex
CREATE INDEX "business_insights_tenantId_type_dismissed_idx" ON "business_insights"("tenantId", "type", "dismissed");

-- CreateIndex
CREATE INDEX "business_insights_tenantId_importance_idx" ON "business_insights"("tenantId", "importance");

-- CreateIndex
CREATE INDEX "business_goals_tenantId_period_status_idx" ON "business_goals"("tenantId", "period", "status");

-- CreateIndex
CREATE INDEX "management_reports_tenantId_reportType_reportDate_idx" ON "management_reports"("tenantId", "reportType", "reportDate");

-- AddForeignKey
ALTER TABLE "tenant_settings" ADD CONSTRAINT "tenant_settings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "staff_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_preferredStaffId_fkey" FOREIGN KEY ("preferredStaffId") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_tags" ADD CONSTRAINT "customer_tags_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_tags" ADD CONSTRAINT "customer_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_threads" ADD CONSTRAINT "message_threads_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_threads" ADD CONSTRAINT "message_threads_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_threads" ADD CONSTRAINT "message_threads_assignedStaffId_fkey" FOREIGN KEY ("assignedStaffId") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thread_tags" ADD CONSTRAINT "thread_tags_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "message_threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thread_tags" ADD CONSTRAINT "thread_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "message_threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "templates" ADD CONSTRAINT "templates_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "templates" ADD CONSTRAINT "templates_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auto_message_templates" ADD CONSTRAINT "auto_message_templates_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auto_message_logs" ADD CONSTRAINT "auto_message_logs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auto_message_logs" ADD CONSTRAINT "auto_message_logs_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auto_message_logs" ADD CONSTRAINT "auto_message_logs_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "reservations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_categories" ADD CONSTRAINT "menu_categories_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menus" ADD CONSTRAINT "menus_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menus" ADD CONSTRAINT "menus_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "menu_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_history" ADD CONSTRAINT "menu_history_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_history" ADD CONSTRAINT "menu_history_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "menus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_history" ADD CONSTRAINT "menu_history_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_recommendations" ADD CONSTRAINT "menu_recommendations_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_recommendations" ADD CONSTRAINT "menu_recommendations_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "menus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_recommendations" ADD CONSTRAINT "menu_recommendations_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_metrics" ADD CONSTRAINT "analytics_metrics_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prediction_data" ADD CONSTRAINT "prediction_data_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_behaviors" ADD CONSTRAINT "customer_behaviors_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_behaviors" ADD CONSTRAINT "customer_behaviors_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "login_history" ADD CONSTRAINT "login_history_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "login_history" ADD CONSTRAINT "login_history_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "security_events" ADD CONSTRAINT "security_events_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "security_events" ADD CONSTRAINT "security_events_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_preferences" ADD CONSTRAINT "customer_preferences_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_preferences" ADD CONSTRAINT "customer_preferences_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketing_campaigns" ADD CONSTRAINT "marketing_campaigns_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_performance" ADD CONSTRAINT "staff_performance_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_performance" ADD CONSTRAINT "staff_performance_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quick_ratings" ADD CONSTRAINT "quick_ratings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_feature_flags" ADD CONSTRAINT "tenant_feature_flags_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_feature_flags" ADD CONSTRAINT "tenant_feature_flags_featureFlagId_fkey" FOREIGN KEY ("featureFlagId") REFERENCES "feature_flags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_staff_availabilities" ADD CONSTRAINT "support_staff_availabilities_staffProfileId_fkey" FOREIGN KEY ("staffProfileId") REFERENCES "support_staff_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_staff_requests" ADD CONSTRAINT "support_staff_requests_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_staff_requests" ADD CONSTRAINT "support_staff_requests_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_staff_applications" ADD CONSTRAINT "support_staff_applications_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "support_staff_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_staff_applications" ADD CONSTRAINT "support_staff_applications_staffProfileId_fkey" FOREIGN KEY ("staffProfileId") REFERENCES "support_staff_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_staff_applications" ADD CONSTRAINT "support_staff_applications_availabilityId_fkey" FOREIGN KEY ("availabilityId") REFERENCES "support_staff_availabilities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_staff_matches" ADD CONSTRAINT "support_staff_matches_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "support_staff_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_staff_matches" ADD CONSTRAINT "support_staff_matches_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "support_staff_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_staff_matches" ADD CONSTRAINT "support_staff_matches_supportStaffId_fkey" FOREIGN KEY ("supportStaffId") REFERENCES "support_staff_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salary_dashboard" ADD CONSTRAINT "salary_dashboard_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salary_dashboard" ADD CONSTRAINT "salary_dashboard_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_salary_records" ADD CONSTRAINT "daily_salary_records_dashboardId_fkey" FOREIGN KEY ("dashboardId") REFERENCES "salary_dashboard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_salary_records" ADD CONSTRAINT "daily_salary_records_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incentive_rules" ADD CONSTRAINT "incentive_rules_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_achievements" ADD CONSTRAINT "staff_achievements_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_achievements" ADD CONSTRAINT "staff_achievements_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "incentive_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_achievements" ADD CONSTRAINT "staff_achievements_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_metrics" ADD CONSTRAINT "business_metrics_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competitor_analysis" ADD CONSTRAINT "competitor_analysis_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "strategic_actions" ADD CONSTRAINT "strategic_actions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_insights" ADD CONSTRAINT "business_insights_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insight_action_links" ADD CONSTRAINT "insight_action_links_insightId_fkey" FOREIGN KEY ("insightId") REFERENCES "business_insights"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insight_action_links" ADD CONSTRAINT "insight_action_links_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "strategic_actions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_goals" ADD CONSTRAINT "business_goals_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "management_reports" ADD CONSTRAINT "management_reports_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
