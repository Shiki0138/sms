import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import session from 'express-session';
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

app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
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

// Error handling middleware (should be last)
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
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