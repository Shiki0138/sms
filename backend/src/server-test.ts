import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';

// Database
import { connectDatabase, disconnectDatabase } from './database';

// Routes - Simple routes only for testing
import simpleRoutes from './routes/simple';

// Middleware
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);
const port = process.env.PORT || 4002;

// Basic middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:4003', 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: 'v1',
    message: 'Salon Management API - Test Mode (No Scheduler)',
    database: 'Connected',
    uptime: process.uptime()
  });
});

// API Routes
const apiPrefix = `/api/v1`;
app.use(apiPrefix, simpleRoutes);

// Error handling middleware (should be last)
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Route not found',
    path: req.originalUrl 
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  await disconnectDatabase();
  process.exit(0);
});

// Start server with database connection
async function startServer() {
  try {
    // Connect to database
    const dbConnected = await connectDatabase();
    if (!dbConnected) {
      logger.error('Database connection failed');
      process.exit(1);
    }

    // Start HTTP server
    httpServer.listen(port, () => {
      logger.info(`🚀 Test Server is running on port ${port}`);
      logger.info(`📋 Health check: http://localhost:${port}/health`);
      logger.info(`📖 API: http://localhost:${port}${apiPrefix}/`);
      logger.info(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`💾 Database: SQLite (Connected)`);
      logger.info(`\\n✨ 美容室統合管理システム - Test Mode`);
      logger.info(`   ⚠️  Scheduler disabled for testing`);
      logger.info(`   🧪 Basic API functionality only`);
      
      // Test basic routes
      console.log('\\n📋 Available test endpoints:');
      console.log(`   GET  ${apiPrefix}/customers       - 顧客一覧`);
      console.log(`   POST ${apiPrefix}/customers       - 顧客作成`);
      console.log(`   GET  ${apiPrefix}/threads         - メッセージスレッド`);
      console.log(`   GET  ${apiPrefix}/reservations    - 予約一覧`);
      console.log(`   GET  ${apiPrefix}/tags            - タグ一覧`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;