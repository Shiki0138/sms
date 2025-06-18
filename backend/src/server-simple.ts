import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import session from 'express-session';
import { rateLimit } from 'express-rate-limit';
import { createServer } from 'http';

// Database
import { connectDatabase, disconnectDatabase } from './database';

// Services
import { SchedulerService } from './services/schedulerService';

// Routes
import simpleRoutes from './routes/simple';
import customersRouter from './routes/customers';
import messagesRouter from './routes/messages';
import reservationsRouter from './routes/reservations';
import { analyticsRouter } from './routes/analytics';

// Middleware
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);
const port = process.env.PORT || 4002;

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:4003', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-super-secret-session-key-change-this-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 15 * 60 * 1000 // 15分
  }
}));
app.use(limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || 'v1',
    message: 'Salon Management API - Simple Test Mode',
    database: 'Connected'
  });
});

// API Routes
const apiPrefix = `/api/${process.env.API_VERSION || 'v1'}`;

// Simple routes (no authentication required for testing)
app.use(apiPrefix, simpleRoutes);

// Test API endpoints
app.use(`${apiPrefix}/customers`, customersRouter);
app.use(`${apiPrefix}/messages`, messagesRouter);
app.use(`${apiPrefix}/reservations`, reservationsRouter);
app.use(`${apiPrefix}/analytics`, analyticsRouter);

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

    // Start HTTP server
    httpServer.listen(port, () => {
      logger.info(`🚀 Server is running on port ${port}`);
      logger.info(`📋 Health check: http://localhost:${port}/health`);
      logger.info(`📖 API docs: http://localhost:${port}${apiPrefix}/docs`);
      logger.info(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`💾 Database: SQLite (Connected)`);
      logger.info(`⏰ Scheduler: Auto-message service started`);
      logger.info(`\\n✨ 統合メッセージ管理システム - Simple Test Mode`);
      logger.info(`   LINE & Instagram DM 一元管理システム`);
      logger.info(`   基本機能テスト環境`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;