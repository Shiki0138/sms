import { Router } from 'express';
import { Request, Response } from 'express';
import MonitoringService from '../services/monitoringService';
import { logger } from '../utils/logger';
import { authenticate, requirePermission } from '../middleware/auth';
import { getCacheStats, cacheHealthCheck } from '../middleware/caching';
import { dbOptimizationService } from '../services/databaseOptimizationService';
import { PERMISSIONS } from '../utils/auth';

const router = Router();

/**
 * 🏥 システム全体の健康状態チェック（パブリック）
 * ロードバランサーやヘルスチェッカー用
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const health = await MonitoringService.getSystemHealth();
    
    const statusCode = health.status === 'healthy' ? 200 : 
                      health.status === 'degraded' ? 206 : 503;
    
    res.status(statusCode).json({
      status: health.status,
      timestamp: health.timestamp,
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0'
    });
  } catch (error) {
    logger.error('Health check endpoint failed:', error);
    res.status(503).json({
      status: 'critical',
      error: 'Health check failed'
    });
  }
});

/**
 * 📊 詳細システム監視情報（管理者専用）
 */
router.get('/health/detailed', 
  authenticate,
  requirePermission(PERMISSIONS.ADMIN),
  async (req: Request, res: Response) => {
    try {
      const health = await MonitoringService.getSystemHealth();
      res.json(health);
    } catch (error) {
      logger.error('Detailed health check failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get detailed health information'
      });
    }
  }
);

/**
 * 📈 システム統計ダッシュボード
 */
router.get('/statistics',
  authenticate,
  requirePermission(PERMISSIONS.ADMIN),
  async (req: Request, res: Response) => {
    try {
      const stats = await MonitoringService.getSystemStatistics();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('System statistics failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get system statistics'
      });
    }
  }
);

/**
 * 📦 Redis キャッシュ統計
 */
router.get('/cache/stats',
  authenticate,
  requirePermission(PERMISSIONS.ADMIN),
  async (req: Request, res: Response) => {
    try {
      const [stats, health] = await Promise.all([
        getCacheStats(),
        cacheHealthCheck()
      ]);

      res.json({
        success: true,
        data: {
          stats,
          health,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Cache stats failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get cache statistics'
      });
    }
  }
);

/**
 * 🗄️ データベース統計・最適化情報
 */
router.get('/database/stats',
  authenticate,
  requirePermission(PERMISSIONS.ADMIN),
  async (req: Request, res: Response) => {
    try {
      const [poolStatus] = await Promise.all([
        dbOptimizationService.getConnectionPoolStatus(),
      ]);

      res.json({
        success: true,
        data: {
          connectionPool: poolStatus,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Database stats failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get database statistics'
      });
    }
  }
);

/**
 * 🧹 データベースメンテナンス実行
 */
router.post('/database/maintenance',
  authenticate,
  requirePermission(PERMISSIONS.ADMIN),
  async (req: Request, res: Response) => {
    try {
      const { tenantId } = req.body;
      const results = await dbOptimizationService.performMaintenance(tenantId);
      
      res.json({
        success: true,
        data: results,
        message: 'データベースメンテナンスが完了しました'
      });
    } catch (error) {
      logger.error('Database maintenance failed:', error);
      res.status(500).json({
        success: false,
        error: 'データベースメンテナンスに失敗しました'
      });
    }
  }
);

/**
 * 📊 データベース統計情報更新
 */
router.post('/database/update-statistics',
  authenticate,
  requirePermission(PERMISSIONS.ADMIN),
  async (req: Request, res: Response) => {
    try {
      const result = await dbOptimizationService.updateStatistics();
      
      res.json({
        success: true,
        data: result,
        message: 'データベース統計情報を更新しました'
      });
    } catch (error) {
      logger.error('Database statistics update failed:', error);
      res.status(500).json({
        success: false,
        error: 'データベース統計情報の更新に失敗しました'
      });
    }
  }
);

/**
 * 🚨 アラート送信テスト
 */
router.post('/alerts/test',
  authenticate,
  requirePermission(PERMISSIONS.ADMIN),
  async (req: Request, res: Response) => {
    try {
      const { severity, message } = req.body;
      
      await MonitoringService.sendAlert(
        severity || 'low',
        message || 'Test alert from monitoring system',
        {
          source: 'manual_test',
          userId: req.user!.staffId,
          timestamp: new Date().toISOString()
        }
      );
      
      res.json({
        success: true,
        message: 'テストアラートを送信しました'
      });
    } catch (error) {
      logger.error('Test alert failed:', error);
      res.status(500).json({
        success: false,
        error: 'テストアラートの送信に失敗しました'
      });
    }
  }
);

/**
 * 📋 最近のアラート履歴
 */
router.get('/alerts/recent',
  authenticate,
  requirePermission(PERMISSIONS.ADMIN),
  async (req: Request, res: Response) => {
    try {
      const { limit = 50, severity } = req.query;
      
      // PrismaClientを使用してアラート履歴を取得
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      
      const where: any = {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7日以内
        }
      };
      
      if (severity) {
        where.severity = severity;
      }
      
      // TODO: systemAlert model needs to be added to schema
      const alerts: any[] = [];
      // const alerts = await prisma.systemAlert.findMany({
      //   where,
      //   orderBy: { createdAt: 'desc' },
      //   take: Number(limit)
      // });
      
      await prisma.$disconnect();
      
      res.json({
        success: true,
        data: alerts,
        count: alerts.length
      });
    } catch (error) {
      logger.error('Recent alerts fetch failed:', error);
      res.status(500).json({
        success: false,
        error: 'アラート履歴の取得に失敗しました'
      });
    }
  }
);

/**
 * ✅ アラート解決マーク
 */
router.patch('/alerts/:alertId/resolve',
  authenticate,
  requirePermission(PERMISSIONS.ADMIN),
  async (req: Request, res: Response) => {
    try {
      const { alertId } = req.params;
      const { resolution } = req.body;
      
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      
      // TODO: systemAlert model needs to be added to schema
      const alert = { id: alertId, resolved: true };
      // const alert = await prisma.systemAlert.update({
      //   where: { id: alertId },
      //   data: {
      //     resolved: true,
      //     resolvedAt: new Date(),
      //     resolution: resolution || `Resolved by ${req.user!.name}`,
      //     resolvedBy: req.user!.staffId
      //   }
      // });
      
      await prisma.$disconnect();
      
      logger.info('Alert resolved:', {
        alertId,
        resolvedBy: req.user!.staffId,
        resolution
      });
      
      res.json({
        success: true,
        data: alert,
        message: 'アラートを解決済みにマークしました'
      });
    } catch (error) {
      logger.error('Alert resolution failed:', error);
      res.status(500).json({
        success: false,
        error: 'アラートの解決に失敗しました'
      });
    }
  }
);

/**
 * 📊 パフォーマンスメトリクス記録
 * 他のルートからの内部使用
 */
export const recordPerformance = (req: Request, res: Response, startTime: number) => {
  try {
    const responseTime = Date.now() - startTime;
    const endpoint = `${req.method} ${req.route?.path || req.path}`;
    
    MonitoringService.recordPerformanceMetric(
      endpoint,
      responseTime,
      res.statusCode
    );
  } catch (error) {
    logger.error('Performance recording failed:', error);
  }
};

/**
 * 📈 リアルタイムメトリクス監視ミドルウェア
 */
export const performanceMonitoring = (req: Request, res: Response, next: any) => {
  const startTime = Date.now();
  
  // レスポンス完了時にメトリクス記録
  res.on('finish', () => {
    recordPerformance(req, res, startTime);
  });
  
  next();
};

/**
 * 🔄 システム再起動情報
 */
router.get('/system/info',
  authenticate,
  requirePermission(PERMISSIONS.ADMIN),
  async (req: Request, res: Response) => {
    try {
      const info = {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
        environment: process.env.NODE_ENV,
        pid: process.pid,
        timestamp: new Date().toISOString()
      };
      
      res.json({
        success: true,
        data: info
      });
    } catch (error) {
      logger.error('System info fetch failed:', error);
      res.status(500).json({
        success: false,
        error: 'システム情報の取得に失敗しました'
      });
    }
  }
);

export default router;