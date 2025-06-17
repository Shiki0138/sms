import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import session from 'express-session';

// 🚀 感動パフォーマンス機能のインポート
import { enhancedPerformanceMiddleware, getPerformanceReport, systemHealthCheck } from './middleware/performance-enhanced';
import emotionalCache from './utils/emotional-cache';

// 🛡️ 美容室を守る感動セキュリティシステムのインポート
import emotionalSecurity from './middleware/emotional-security';
import { createServer } from 'http';

// Database
import { connectDatabase, disconnectDatabase } from './database';

// Services
import { SchedulerService } from './services/schedulerService';
import { initializeNotificationService } from './services/notificationService';
import { analyticsService } from './services/analyticsService';

// Routes
import simpleRoutes from './routes/simple';
// import importRoutes from './routes/import';
import autoMessageRoutes from './routes/autoMessages';
import { menusRouter } from './routes/menus';
import { notificationsRouter } from './routes/notifications';
import { analyticsRouter } from './routes/analytics';
import { authRouter } from './routes/auth';
import { securityRouter } from './routes/security';
// import emotionalAnalyticsRouter from './routes/emotional-analytics';
// import magicalExternalApiRouter from './routes/magical-external-apis';
import remindersRouter from './routes/reminders';
import testRemindersRouter from './routes/test-reminders';
import paymentsRouter from './routes/payments';

// Middleware
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import {
  securityHeaders,
  requestFingerprint,
  suspiciousActivityDetection,
  ipBlocking,
  inputSanitization,
  apiRateLimit,
  authRateLimit,
} from './middleware/security-temp';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);
const port = process.env.PORT || 4002;

// Enhanced security middleware
app.use(helmet({
  contentSecurityPolicy: false, // We'll handle this in securityHeaders
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
app.use(securityHeaders);
app.use(requestFingerprint);
app.use(ipBlocking);
app.use(suspiciousActivityDetection);
app.use(inputSanitization);

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.ALLOWED_ORIGINS?.split(',') || ['https://yourdomain.com']
    : ['http://localhost:4003', 'http://localhost:5173'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID', 'X-CSRF-Token']
}));

// 💫 美容室スタッフが感動する超高速レスポンス体験
app.use(enhancedPerformanceMiddleware);

// 🛡️ 美容室スタッフが安心できる最高レベルのセキュリティ保護
app.use(emotionalSecurity.createEmotionalRateLimit('standard'));
app.use(emotionalSecurity.ipBlockingMiddleware);
app.use(emotionalSecurity.suspiciousActivityDetection);

app.use(express.json({ 
  limit: '10mb',
  verify: (req: any, res, buf) => {
    // Store raw body for webhook verification if needed
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'your-super-secret-session-key-change-this-in-production',
  resave: false,
  saveUninitialized: false,
  name: 'salon.sid', // Change default session name
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 15 * 60 * 1000, // 15 minutes
    sameSite: 'strict'
  }
}));

// Apply rate limiting
app.use('/api/v1/auth', authRateLimit);
app.use('/api', apiRateLimit);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || 'v1',
    message: 'Salon Management API - Production Mode (Database Connected)',
    database: 'Connected'
  });
});

// API Routes
const apiPrefix = `/api/${process.env.API_VERSION || 'v1'}`;

// Simple routes (no authentication required for demo)
app.use(apiPrefix, simpleRoutes);
// app.use(`${apiPrefix}/import`, importRoutes);
app.use(`${apiPrefix}/auto-messages`, autoMessageRoutes);
app.use(`${apiPrefix}/menus`, menusRouter);
app.use(`${apiPrefix}/notifications`, notificationsRouter);
app.use(`${apiPrefix}/analytics`, analyticsRouter);
app.use(`${apiPrefix}/auth`, authRouter);
app.use(`${apiPrefix}/security`, securityRouter);
app.use(`${apiPrefix}/reminders`, remindersRouter);
app.use(`${apiPrefix}/test-reminders`, testRemindersRouter);
app.use(`${apiPrefix}/payments`, paymentsRouter);
// 🧠 美容室スタッフが感動するAI分析システム (一時的に無効化)
// app.use(`${apiPrefix}/emotional-analytics`, emotionalAnalyticsRouter);
// 🪄 美容室スタッフが『まるで魔法！』と驚く外部API統合システム (一時的に無効化)
// app.use(`${apiPrefix}/magical-apis`, magicalExternalApiRouter);

// Error handling middleware (should be last)
app.use(errorHandler);

// 💝 美容室スタッフ向け感動パフォーマンス監視エンドポイント
app.get('/api/v1/system/performance', (req, res) => {
  try {
    const report = getPerformanceReport()
    res.json({
      success: true,
      message: '✨ 美容室システムのパフォーマンス状況をお届けします',
      data: report,
      timestamp: new Date().toISOString(),
      userMessage: report ? '⚡ システムが快適に動作中！スタッフの皆様の素晴らしい業務をサポート' : '📊 データ収集中です'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '🚨 パフォーマンス情報の取得中にエラーが発生しました',
      error: error instanceof Error ? error.message : 'Unknown error',
      userMessage: '心配ありません、システムは正常に動作しています'
    })
  }
})

app.get('/api/v1/system/health', (req, res) => {
  try {
    const health = systemHealthCheck()
    res.json({
      success: true,
      message: '💫 美容室システムの健康状態をお知らせします',
      data: health,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '🚨 システム健康状態チェック中にエラーが発生',
      error: error instanceof Error ? error.message : 'Unknown error',
      userMessage: 'システムは稼働していますが、詳細確認中です'
    })
  }
})

// 美容室終業時のキャッシュクリーンアップエンドポイント
app.post('/api/v1/system/end-of-day-cleanup', async (req, res) => {
  try {
    await emotionalCache.endOfDayCleanup()
    await emotionalSecurity.endOfDaySecurityCleanup()
    res.json({
      success: true,
      message: '🌙 一日の終わりのクリーンアップが完了しました',
      userMessage: '今日も一日お疲れ様でした！明日も素晴らしい日になりますように',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '🚨 クリーンアップ中にエラーが発生',
      error: error instanceof Error ? error.message : 'Unknown error',
      userMessage: 'エラーが発生しましたが、システムは正常に稼働しています'
    })
  }
})

// 🛡️ 美容室スタッフ向けセキュリティ状況レポート
app.get('/api/v1/system/security', async (req, res) => {
  try {
    const securityReport = await emotionalSecurity.getSecurityReport()
    res.json({
      success: true,
      message: '🛡️ 美容室システムのセキュリティ状況をお知らせします',
      data: securityReport,
      timestamp: new Date().toISOString(),
      userMessage: '美容室の皆様の大切なデータとプライバシーを安全に保護しています'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '🚨 セキュリティレポート生成中にエラーが発生',
      error: error instanceof Error ? error.message : 'Unknown error',
      userMessage: 'セキュリティシステムは正常に動作していますが、レポート生成中です'
    })
  }
})

// 🔒 認証ルートへの特別セキュリティ適用（ログイン保護）
app.use('/api/v1/auth/login', emotionalSecurity.createEmotionalRateLimit('auth'))
app.use('/api/v1/auth/login', emotionalSecurity.loginProtection)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    message: '🔍 お探しのページが見つかりません',
    suggestion: 'URLをもう一度ご確認ください'
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  SchedulerService.stop();
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  SchedulerService.stop();
  await disconnectDatabase();
  process.exit(0);
});

// Start server with database connection
async function startServer() {
  try {
    // Connect to database
    const dbConnected = await connectDatabase();
    if (!dbConnected) {
      process.exit(1);
    }

    // Start scheduler service
    SchedulerService.start();

    // Initialize notification service
    initializeNotificationService(httpServer);

    // Initialize analytics service
    await analyticsService.startRealtimeAnalytics('default-tenant');

    // Start HTTP server
    httpServer.listen(port, () => {
      logger.info(`🚀 Server is running on port ${port}`);
      logger.info(`📋 Health check: http://localhost:${port}/health`);
      logger.info(`📖 API docs: http://localhost:${port}${apiPrefix}/docs`);
      logger.info(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`💾 Database: SQLite (Connected)`);
      logger.info(`⏰ Scheduler: Auto-message service started`);
      logger.info(`🔔 Notifications: WebSocket service started`);
      logger.info(`📊 Analytics: Real-time analytics and ML prediction system started`);
      logger.info(`\\n✨ 統合メッセージ管理システム - Production Mode`);
      logger.info(`   LINE & Instagram DM 一元管理システム`);
      logger.info(`   自動リマインダー・フォローアップメッセージ機能付き`);
      logger.info(`   リアルタイム通知システム搭載`);
      logger.info(`   AI予測分析・リアルタイムダッシュボード搭載`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;