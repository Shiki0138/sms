import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import Redis from 'redis';

const prisma = new PrismaClient();

// Performance monitoring interfaces
export interface PerformanceMetrics {
  timestamp: Date;
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  memoryUsage: number;
  cpuUsage: number;
  dbQueryCount: number;
  dbQueryTime: number;
  cacheHitRate: number;
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  metrics: {
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    cpu: {
      usage: number;
    };
    database: {
      connectionCount: number;
      averageQueryTime: number;
      slowQueries: number;
    };
    cache: {
      hitRate: number;
      memoryUsage: number;
    };
    responseTime: {
      average: number;
      p95: number;
      p99: number;
    };
  };
  alerts: string[];
}

export class PerformanceService {
  private metrics: PerformanceMetrics[] = [];
  private redisClient: any;

  constructor() {
    // Initialize Redis for caching
    if (process.env.REDIS_URL) {
      this.redisClient = Redis.createClient({
        url: process.env.REDIS_URL,
      });
      this.redisClient.connect().catch((error: any) => {
        logger.error('Failed to connect to Redis:', error);
      });
    }
  }

  /**
   * Record performance metrics for an API request
   */
  recordMetrics(metrics: Omit<PerformanceMetrics, 'timestamp'>): void {
    const fullMetrics: PerformanceMetrics = {
      ...metrics,
      timestamp: new Date(),
    };

    this.metrics.push(fullMetrics);

    // Keep only last 1000 metrics in memory
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    // Log slow requests
    if (metrics.responseTime > 5000) { // 5 seconds
      logger.warn('Slow API request detected:', {
        endpoint: metrics.endpoint,
        method: metrics.method,
        responseTime: metrics.responseTime,
        dbQueryTime: metrics.dbQueryTime,
        dbQueryCount: metrics.dbQueryCount,
      });
    }

    // Alert on very slow requests
    if (metrics.responseTime > 10000) { // 10 seconds
      this.alertSlowRequest(fullMetrics);
    }
  }

  /**
   * Get current system health status
   */
  async getSystemHealth(): Promise<SystemHealth> {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    // Database metrics
    const dbMetrics = await this.getDatabaseMetrics();
    
    // Cache metrics
    const cacheMetrics = await this.getCacheMetrics();
    
    // Response time metrics
    const responseMetrics = this.getResponseTimeMetrics();
    
    const health: SystemHealth = {
      status: 'healthy',
      metrics: {
        memory: {
          used: memoryUsage.heapUsed,
          total: memoryUsage.heapTotal,
          percentage: (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100,
        },
        cpu: {
          usage: (cpuUsage.user + cpuUsage.system) / 1000000, // Convert to milliseconds
        },
        database: dbMetrics,
        cache: cacheMetrics,
        responseTime: responseMetrics,
      },
      alerts: [],
    };

    // Determine health status and generate alerts
    if (health.metrics.memory.percentage > 90) {
      health.status = 'critical';
      health.alerts.push('High memory usage detected');
    } else if (health.metrics.memory.percentage > 80) {
      health.status = 'warning';
      health.alerts.push('Memory usage is elevated');
    }

    if (health.metrics.responseTime.p95 > 3000) {
      health.status = health.status === 'critical' ? 'critical' : 'warning';
      health.alerts.push('Slow response times detected');
    }

    if (health.metrics.database.averageQueryTime > 1000) {
      health.status = health.status === 'critical' ? 'critical' : 'warning';
      health.alerts.push('Slow database queries detected');
    }

    if (health.metrics.cache.hitRate < 80) {
      health.alerts.push('Low cache hit rate');
    }

    return health;
  }

  /**
   * Optimize database queries
   */
  async optimizeDatabase(): Promise<{
    slowQueries: any[];
    recommendations: string[];
  }> {
    // Get slow queries from the last hour
    const slowQueries = await this.getSlowQueries();
    
    const recommendations: string[] = [];

    // Analyze query patterns
    const queryPatterns = this.analyzeQueryPatterns();
    
    if (queryPatterns.missingIndexes.length > 0) {
      recommendations.push(`Consider adding indexes for: ${queryPatterns.missingIndexes.join(', ')}`);
    }

    if (queryPatterns.inefficientQueries.length > 0) {
      recommendations.push('Optimize N+1 query problems detected');
    }

    if (queryPatterns.largeResultSets > 0) {
      recommendations.push('Implement pagination for large result sets');
    }

    return {
      slowQueries,
      recommendations,
    };
  }

  /**
   * Implement caching strategies
   */
  async cacheData(key: string, data: any, ttl: number = 3600): Promise<void> {
    if (!this.redisClient) return;

    try {
      await this.redisClient.setEx(key, ttl, JSON.stringify(data));
    } catch (error) {
      logger.error('Cache set error:', error);
    }
  }

  async getCachedData(key: string): Promise<any | null> {
    if (!this.redisClient) return null;

    try {
      const data = await this.redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  async invalidateCache(pattern: string): Promise<void> {
    if (!this.redisClient) return;

    try {
      const keys = await this.redisClient.keys(pattern);
      if (keys.length > 0) {
        await this.redisClient.del(keys);
      }
    } catch (error) {
      logger.error('Cache invalidation error:', error);
    }
  }

  /**
   * Database connection pooling optimization
   */
  async optimizeConnectionPool(): Promise<void> {
    // Monitor active connections
    const activeConnections = await this.getDatabaseConnectionCount();
    
    if (activeConnections > 50) {
      logger.warn(`High database connection count: ${activeConnections}`);
      
      // Implement connection pooling adjustments
      await this.adjustConnectionPool(activeConnections);
    }
  }

  /**
   * Memory optimization
   */
  optimizeMemory(): void {
    const memoryUsage = process.memoryUsage();
    const usagePercentage = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;

    if (usagePercentage > 85) {
      logger.warn('High memory usage detected, triggering garbage collection');
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      // Clear old metrics
      this.metrics = this.metrics.slice(-500);
    }
  }

  /**
   * Response compression optimization
   */
  shouldCompress(contentType: string, size: number): boolean {
    const compressibleTypes = [
      'application/json',
      'text/html',
      'text/css',
      'text/javascript',
      'application/javascript',
    ];

    return compressibleTypes.includes(contentType) && size > 1024; // 1KB
  }

  /**
   * API response optimization
   */
  optimizeApiResponse(data: any, fields?: string[]): any {
    if (!data) return data;

    // Field selection
    if (fields && Array.isArray(data)) {
      return data.map(item => this.selectFields(item, fields));
    } else if (fields && typeof data === 'object') {
      return this.selectFields(data, fields);
    }

    // Remove null/undefined values
    return this.removeNullValues(data);
  }

  /**
   * Generate performance report
   */
  generatePerformanceReport(): {
    summary: {
      totalRequests: number;
      averageResponseTime: number;
      slowestEndpoints: Array<{endpoint: string; averageTime: number}>;
      errorRate: number;
    };
    trends: {
      responseTime: number[];
      memoryUsage: number[];
      dbQueries: number[];
    };
    recommendations: string[];
  } {
    const recentMetrics = this.metrics.slice(-100); // Last 100 requests
    
    const summary = {
      totalRequests: recentMetrics.length,
      averageResponseTime: recentMetrics.reduce((sum, m) => sum + m.responseTime, 0) / recentMetrics.length,
      slowestEndpoints: this.getSlowestEndpoints(recentMetrics),
      errorRate: recentMetrics.filter(m => m.statusCode >= 400).length / recentMetrics.length * 100,
    };

    const trends = {
      responseTime: recentMetrics.map(m => m.responseTime),
      memoryUsage: recentMetrics.map(m => m.memoryUsage),
      dbQueries: recentMetrics.map(m => m.dbQueryTime),
    };

    const recommendations = this.generatePerformanceRecommendations(summary, trends);

    return {
      summary,
      trends,
      recommendations,
    };
  }

  // Private helper methods
  private async getDatabaseMetrics(): Promise<{
    connectionCount: number;
    averageQueryTime: number;
    slowQueries: number;
  }> {
    try {
      // Get database statistics
      const recentMetrics = this.metrics.slice(-50);
      const dbQueryTimes = recentMetrics.map(m => m.dbQueryTime).filter(t => t > 0);
      
      return {
        connectionCount: await this.getDatabaseConnectionCount(),
        averageQueryTime: dbQueryTimes.length > 0 
          ? dbQueryTimes.reduce((sum, time) => sum + time, 0) / dbQueryTimes.length 
          : 0,
        slowQueries: dbQueryTimes.filter(time => time > 1000).length,
      };
    } catch (error) {
      logger.error('Error getting database metrics:', error);
      return {
        connectionCount: 0,
        averageQueryTime: 0,
        slowQueries: 0,
      };
    }
  }

  private async getCacheMetrics(): Promise<{
    hitRate: number;
    memoryUsage: number;
  }> {
    if (!this.redisClient) {
      return { hitRate: 0, memoryUsage: 0 };
    }

    try {
      const info = await this.redisClient.info('stats');
      const lines = info.split('\r\n');
      
      let hits = 0;
      let misses = 0;
      
      for (const line of lines) {
        if (line.startsWith('keyspace_hits:')) {
          hits = parseInt(line.split(':')[1]);
        } else if (line.startsWith('keyspace_misses:')) {
          misses = parseInt(line.split(':')[1]);
        }
      }

      const hitRate = (hits + misses) > 0 ? (hits / (hits + misses)) * 100 : 0;

      return {
        hitRate,
        memoryUsage: 0, // TODO: Get actual Redis memory usage
      };
    } catch (error) {
      logger.error('Error getting cache metrics:', error);
      return { hitRate: 0, memoryUsage: 0 };
    }
  }

  private getResponseTimeMetrics(): {
    average: number;
    p95: number;
    p99: number;
  } {
    const recentMetrics = this.metrics.slice(-100);
    const responseTimes = recentMetrics.map(m => m.responseTime).sort((a, b) => a - b);

    if (responseTimes.length === 0) {
      return { average: 0, p95: 0, p99: 0 };
    }

    const average = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
    const p95Index = Math.floor(responseTimes.length * 0.95);
    const p99Index = Math.floor(responseTimes.length * 0.99);

    return {
      average,
      p95: responseTimes[p95Index] || 0,
      p99: responseTimes[p99Index] || 0,
    };
  }

  private async getSlowQueries(): Promise<any[]> {
    // This would integrate with database query logging
    // For now, return mock data
    return [];
  }

  private analyzeQueryPatterns(): {
    missingIndexes: string[];
    inefficientQueries: string[];
    largeResultSets: number;
  } {
    // Analyze recent metrics for query patterns
    const recentMetrics = this.metrics.slice(-100);
    
    return {
      missingIndexes: [], // TODO: Implement index analysis
      inefficientQueries: [], // TODO: Implement N+1 detection
      largeResultSets: recentMetrics.filter(m => m.dbQueryCount > 10).length,
    };
  }

  private async getDatabaseConnectionCount(): Promise<number> {
    try {
      // Get active connections from Prisma
      return 10; // Mock value - would need Prisma pool stats
    } catch (error) {
      return 0;
    }
  }

  private async adjustConnectionPool(currentConnections: number): Promise<void> {
    // Implement connection pool adjustments
    logger.info(`Adjusting connection pool for ${currentConnections} connections`);
  }

  private selectFields(obj: any, fields: string[]): any {
    const result: any = {};
    for (const field of fields) {
      if (obj.hasOwnProperty(field)) {
        result[field] = obj[field];
      }
    }
    return result;
  }

  private removeNullValues(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(item => this.removeNullValues(item));
    } else if (obj && typeof obj === 'object') {
      const result: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (value !== null && value !== undefined) {
          result[key] = this.removeNullValues(value);
        }
      }
      return result;
    }
    return obj;
  }

  private getSlowestEndpoints(metrics: PerformanceMetrics[]): Array<{endpoint: string; averageTime: number}> {
    const endpointTimes: Record<string, number[]> = {};
    
    for (const metric of metrics) {
      const key = `${metric.method} ${metric.endpoint}`;
      if (!endpointTimes[key]) {
        endpointTimes[key] = [];
      }
      endpointTimes[key].push(metric.responseTime);
    }

    return Object.entries(endpointTimes)
      .map(([endpoint, times]) => ({
        endpoint,
        averageTime: times.reduce((sum, time) => sum + time, 0) / times.length,
      }))
      .sort((a, b) => b.averageTime - a.averageTime)
      .slice(0, 5);
  }

  private generatePerformanceRecommendations(summary: any, trends: any): string[] {
    const recommendations: string[] = [];

    if (summary.averageResponseTime > 1000) {
      recommendations.push('Average response time is high - consider caching frequently accessed data');
    }

    if (summary.errorRate > 5) {
      recommendations.push('Error rate is elevated - review error handling and input validation');
    }

    const memoryTrend = this.calculateTrend(trends.memoryUsage);
    if (memoryTrend > 10) {
      recommendations.push('Memory usage is trending upward - check for memory leaks');
    }

    const dbTrend = this.calculateTrend(trends.dbQueries);
    if (dbTrend > 10) {
      recommendations.push('Database query time is increasing - optimize queries and add indexes');
    }

    return recommendations;
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    
    const first = values.slice(0, values.length / 2).reduce((sum, v) => sum + v, 0) / (values.length / 2);
    const second = values.slice(values.length / 2).reduce((sum, v) => sum + v, 0) / (values.length / 2);
    
    return ((second - first) / first) * 100;
  }

  private async alertSlowRequest(metrics: PerformanceMetrics): Promise<void> {
    try {
      // Send alert notification
      logger.error('Very slow request detected:', {
        endpoint: metrics.endpoint,
        responseTime: metrics.responseTime,
        timestamp: metrics.timestamp,
      });

      // Could integrate with notification service here
    } catch (error) {
      logger.error('Failed to send slow request alert:', error);
    }
  }
}

export const performanceService = new PerformanceService();