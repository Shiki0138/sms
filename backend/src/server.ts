import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';

// Database
import { connectDatabase, disconnectDatabase } from './database';

// Services
import { SchedulerService } from './services/schedulerService';

// Routes
import simpleRoutes from './routes/simple';
// import importRoutes from './routes/import';
import autoMessageRoutes from './routes/autoMessages';

// Middleware
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 4002;

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
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
app.use(limiter);

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
    app.listen(port, () => {
      logger.info(`🚀 Server is running on port ${port}`);
      logger.info(`📋 Health check: http://localhost:${port}/health`);
      logger.info(`📖 API docs: http://localhost:${port}${apiPrefix}/docs`);
      logger.info(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`💾 Database: SQLite (Connected)`);
      logger.info(`⏰ Scheduler: Auto-message service started`);
      logger.info(`\\n✨ 統合メッセージ管理システム - Production Mode`);
      logger.info(`   LINE & Instagram DM 一元管理システム`);
      logger.info(`   自動リマインダー・フォローアップメッセージ機能付き`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;