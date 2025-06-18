import { Request, Response, Router } from 'express';
import { prisma } from '../database';
import { logger } from '../utils/logger';

const router = Router();

/**
 * Comprehensive health check endpoint
 */
router.get('/', async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: Math.floor(process.uptime()),
    checks: {
      database: { status: 'unknown', responseTime: 0 },
      memory: { status: 'unknown', usage: {} },
      disk: { status: 'unknown' }
    },
    metrics: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: Date.now()
    }
  };

  // Database health check
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbResponseTime = Date.now() - dbStart;
    
    health.checks.database = {
      status: 'ok',
      responseTime: dbResponseTime
    };
  } catch (error) {
    logger.error('Database health check failed:', error);
    health.checks.database = {
      status: 'error',
      responseTime: 0,
      error: error instanceof Error ? error.message : 'Unknown database error'
    };
  }

  // Memory health check
  const memoryUsage = process.memoryUsage();
  const totalMemory = memoryUsage.heapTotal + memoryUsage.external + memoryUsage.arrayBuffers;
  const memoryUsagePercent = (totalMemory / (1024 * 1024 * 1024)) * 100; // Convert to GB
  
  health.checks.memory = {
    status: memoryUsagePercent > 80 ? 'warning' : 'ok',
    usage: {
      rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
      external: Math.round(memoryUsage.external / 1024 / 1024), // MB
      percent: Math.round(memoryUsagePercent)
    }
  };

  // Overall health determination
  const hasErrors = Object.values(health.checks).some(check => check.status === 'error');
  const hasWarnings = Object.values(health.checks).some(check => check.status === 'warning');
  
  if (hasErrors) {
    health.status = 'unhealthy';
  } else if (hasWarnings) {
    health.status = 'degraded';
  }

  // Response time
  const responseTime = Date.now() - startTime;
  health.metrics.responseTime = responseTime;

  // HTTP status based on health
  const httpStatus = health.status === 'healthy' ? 200 : 
                    health.status === 'degraded' ? 200 : 503;

  res.status(httpStatus).json(health);
});

/**
 * Basic liveness probe (for K8s/Cloud Run)
 */
router.get('/live', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'alive', 
    timestamp: new Date().toISOString() 
  });
});

/**
 * Readiness probe (for K8s/Cloud Run)
 */
router.get('/ready', async (req: Request, res: Response) => {
  try {
    // Quick database check
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ 
      status: 'ready', 
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    logger.error('Readiness check failed:', error);
    res.status(503).json({ 
      status: 'not_ready', 
      error: error instanceof Error ? error.message : 'Service not ready',
      timestamp: new Date().toISOString() 
    });
  }
});

/**
 * Metrics endpoint for monitoring
 */
router.get('/metrics', (req: Request, res: Response) => {
  const memoryUsage = process.memoryUsage();
  
  const metrics = {
    // Application uptime in seconds
    salon_uptime_seconds: Math.floor(process.uptime()),
    
    // Memory usage in bytes
    salon_memory_rss_bytes: memoryUsage.rss,
    salon_memory_heap_total_bytes: memoryUsage.heapTotal,
    salon_memory_heap_used_bytes: memoryUsage.heapUsed,
    salon_memory_external_bytes: memoryUsage.external,
    
    // Current timestamp
    salon_timestamp_seconds: Math.floor(Date.now() / 1000)
  };

  // Prometheus format
  let prometheusMetrics = '';
  Object.entries(metrics).forEach(([key, value]) => {
    if (typeof value === 'string' && value.startsWith('#')) {
      prometheusMetrics += value + '\n';
    } else {
      prometheusMetrics += `${key} ${value}\n`;
    }
  });

  res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
  res.send(prometheusMetrics);
});

export default router;