import { logger } from '../utils/logger';
import { PrismaClient } from '@prisma/client';
import { redis } from '../middleware/caching';
import { performance } from 'perf_hooks';
import os from 'os';
import fs from 'fs/promises';

const prisma = new PrismaClient();

/**
 * 🏥 美容室システム総合監視サービス
 * リアルタイムシステム状態監視とアラート
 */
export class MonitoringService {
  private static healthChecks = new Map<string, HealthCheck>();
  private static performanceMetrics = new Map<string, PerformanceMetric>();

  /**
   * 📊 システム全体の健康状態チェック
   */
  static async getSystemHealth(): Promise<SystemHealthReport> {
    const startTime = performance.now();
    
    try {
      const [
        databaseHealth,
        redisHealth,
        systemResources,
        apiPerformance,
        errorRates
      ] = await Promise.allSettled([
        this.checkDatabaseHealth(),
        this.checkRedisHealth(),
        this.getSystemResources(),
        this.getAPIPerformance(),
        this.getErrorRates()
      ]);

      const responseTime = Math.round(performance.now() - startTime);
      
      const health: SystemHealthReport = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        responseTime,
        checks: {
          database: this.extractResult(databaseHealth),
          redis: this.extractResult(redisHealth),
          system: this.extractResult(systemResources),
          api: this.extractResult(apiPerformance),
          errors: this.extractResult(errorRates)
        },
        overall: {
          uptime: process.uptime(),
          version: process.env.npm_package_version || '1.0.0',
          environment: process.env.NODE_ENV || 'development'
        }
      };

      // 全体ステータス判定
      const failedChecks = Object.values(health.checks).filter(check => !check.healthy);
      if (failedChecks.length > 0) {
        health.status = failedChecks.length > 2 ? 'critical' : 'degraded';
      }

      logger.info('System health check completed:', {
        status: health.status,
        responseTime,
        failedChecks: failedChecks.length
      });

      return health;
    } catch (error) {
      logger.error('System health check failed:', error);
      return {
        status: 'critical',
        timestamp: new Date().toISOString(),
        responseTime: Math.round(performance.now() - startTime),
        checks: {},
        overall: {},
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 🗄️ データベース健康状態チェック
   */
  private static async checkDatabaseHealth(): Promise<HealthCheckResult> {
    const startTime = performance.now();
    
    try {
      // 基本接続テスト
      await prisma.$queryRaw`SELECT 1`;
      
      // レスポンス時間測定
      const queryStartTime = performance.now();
      await prisma.tenant.count();
      const queryTime = Math.round(performance.now() - queryStartTime);
      
      // 接続プール状態確認
      const poolStatus = await this.getDatabasePoolStatus();
      
      const responseTime = Math.round(performance.now() - startTime);
      
      return {
        healthy: queryTime < 1000, // 1秒以内
        responseTime,
        details: {
          queryTime,
          poolStatus,
          connectionString: process.env.DATABASE_URL ? 'configured' : 'missing'
        }
      };
    } catch (error) {
      return {
        healthy: false,
        responseTime: Math.round(performance.now() - startTime),
        error: error instanceof Error ? error.message : 'Database connection failed'
      };
    }
  }

  /**
   * 📦 Redis健康状態チェック
   */
  private static async checkRedisHealth(): Promise<HealthCheckResult> {
    const startTime = performance.now();
    
    try {
      // 基本接続テスト
      const testKey = 'health_check_' + Date.now();
      const testValue = 'ok';
      
      await redis.set(testKey, testValue, 'EX', 10);
      const retrieved = await redis.get(testKey);
      await redis.del(testKey);
      
      const responseTime = Math.round(performance.now() - startTime);
      
      // Redis統計情報取得
      const info = await redis.info('stats');
      const memory = await redis.info('memory');
      
      return {
        healthy: retrieved === testValue && responseTime < 100,
        responseTime,
        details: {
          connectionStatus: redis.status,
          memoryUsage: this.extractRedisInfo(memory, 'used_memory_human'),
          totalCommands: this.extractRedisInfo(info, 'total_commands_processed'),
          hitRate: this.calculateRedisHitRate(info)
        }
      };
    } catch (error) {
      return {
        healthy: false,
        responseTime: Math.round(performance.now() - startTime),
        error: error instanceof Error ? error.message : 'Redis connection failed'
      };
    }
  }

  /**
   * 💻 システムリソース監視
   */
  private static async getSystemResources(): Promise<HealthCheckResult> {
    try {
      const memoryUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();
      
      // システム情報
      const systemInfo = {
        platform: os.platform(),
        arch: os.arch(),
        nodeVersion: process.version,
        uptime: process.uptime(),
        loadAverage: os.loadavg(),
        totalMemory: os.totalmem(),
        freeMemory: os.freemem(),
        cpuCount: os.cpus().length
      };
      
      // メモリ使用率計算
      const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
      const systemMemoryUsagePercent = ((systemInfo.totalMemory - systemInfo.freeMemory) / systemInfo.totalMemory) * 100;
      
      const isHealthy = memoryUsagePercent < 80 && systemMemoryUsagePercent < 90;
      
      return {
        healthy: isHealthy,
        responseTime: 0,
        details: {
          process: {
            memoryUsage: {
              rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
              heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
              heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
              heapUsagePercent: Math.round(memoryUsagePercent)
            },
            cpuUsage: {
              user: cpuUsage.user / 1000, // ms to seconds
              system: cpuUsage.system / 1000
            }
          },
          system: {
            ...systemInfo,
            memoryUsagePercent: Math.round(systemMemoryUsagePercent),
            loadAverage1min: systemInfo.loadAverage[0]
          }
        }
      };
    } catch (error) {
      return {
        healthy: false,
        responseTime: 0,
        error: error instanceof Error ? error.message : 'System resource check failed'
      };
    }
  }

  /**
   * 🚀 API パフォーマンス監視
   */
  private static async getAPIPerformance(): Promise<HealthCheckResult> {
    try {
      // 過去1時間のパフォーマンスメトリクス取得
      const metrics = Array.from(this.performanceMetrics.values())
        .filter(metric => metric.timestamp > Date.now() - 3600000); // 1時間

      if (metrics.length === 0) {
        return {
          healthy: true,
          responseTime: 0,
          details: { message: 'No performance data available yet' }
        };
      }

      const avgResponseTime = metrics.reduce((sum, metric) => sum + metric.responseTime, 0) / metrics.length;
      const maxResponseTime = Math.max(...metrics.map(metric => metric.responseTime));
      const requestCount = metrics.length;
      
      // エンドポイント別統計
      const endpointStats = this.calculateEndpointStats(metrics);
      
      const isHealthy = avgResponseTime < 100 && maxResponseTime < 5000;
      
      return {
        healthy: isHealthy,
        responseTime: Math.round(avgResponseTime),
        details: {
          avgResponseTime: Math.round(avgResponseTime),
          maxResponseTime,
          requestCount,
          endpointStats: Object.fromEntries(
            Object.entries(endpointStats).slice(0, 10) // 上位10エンドポイント
          )
        }
      };
    } catch (error) {
      return {
        healthy: false,
        responseTime: 0,
        error: error instanceof Error ? error.message : 'API performance check failed'
      };
    }
  }

  /**
   * ❌ エラー率監視
   */
  private static async getErrorRates(): Promise<HealthCheckResult> {
    try {
      // 過去1時間のエラー統計を取得
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);

      const [totalRequests, errorCount] = await Promise.all([
        // 実際のメトリクス取得ロジックを実装
        this.getTotalRequestCount(oneHourAgo),
        this.getErrorCount(oneHourAgo)
      ]);

      const errorRate = totalRequests > 0 ? (errorCount / totalRequests) * 100 : 0;
      const isHealthy = errorRate < 1; // 1%未満

      return {
        healthy: isHealthy,
        responseTime: 0,
        details: {
          totalRequests,
          errorCount,
          errorRate: Math.round(errorRate * 100) / 100,
          period: '1 hour'
        }
      };
    } catch (error) {
      return {
        healthy: false,
        responseTime: 0,
        error: error instanceof Error ? error.message : 'Error rate check failed'
      };
    }
  }

  /**
   * 📈 パフォーマンスメトリクス記録
   */
  static recordPerformanceMetric(endpoint: string, responseTime: number, statusCode: number): void {
    const metric: PerformanceMetric = {
      endpoint,
      responseTime,
      statusCode,
      timestamp: Date.now()
    };

    const key = `${endpoint}_${Date.now()}`;
    this.performanceMetrics.set(key, metric);

    // 古いメトリクスのクリーンアップ（1時間以上前）
    const oneHourAgo = Date.now() - 3600000;
    for (const [key, metric] of this.performanceMetrics.entries()) {
      if (metric.timestamp < oneHourAgo) {
        this.performanceMetrics.delete(key);
      }
    }
  }

  /**
   * 🚨 アラート送信
   */
  static async sendAlert(severity: 'low' | 'medium' | 'high' | 'critical', message: string, details?: any): Promise<void> {
    try {
      const alert = {
        severity,
        message,
        details,
        timestamp: new Date().toISOString(),
        system: 'salon-management-system'
      };

      // ログ出力
      const logLevel = severity === 'critical' ? 'error' : severity === 'high' ? 'warn' : 'info';
      logger[logLevel]('System Alert:', alert);

      // 本番環境では外部アラートシステムに送信
      if (process.env.NODE_ENV === 'production') {
        await this.sendExternalAlert(alert);
      }

      // データベースにアラート履歴保存
      await prisma.systemAlert.create({
        data: {
          severity: severity.toUpperCase(),
          message,
          details: details ? JSON.stringify(details) : null,
          resolved: false,
          createdAt: new Date()
        }
      });

    } catch (error) {
      logger.error('Failed to send alert:', error);
    }
  }

  /**
   * 📊 システム統計ダッシュボード用データ
   */
  static async getSystemStatistics(): Promise<SystemStatistics> {
    try {
      const [health, recentAlerts, performanceData] = await Promise.all([
        this.getSystemHealth(),
        this.getRecentAlerts(),
        this.getPerformanceStatistics()
      ]);

      return {
        health,
        alerts: recentAlerts,
        performance: performanceData,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Failed to get system statistics:', error);
      throw error;
    }
  }

  // プライベートヘルパーメソッド
  private static extractResult(result: PromiseSettledResult<any>): HealthCheckResult {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      return {
        healthy: false,
        responseTime: 0,
        error: result.reason?.message || 'Unknown error'
      };
    }
  }

  private static async getDatabasePoolStatus(): Promise<any> {
    try {
      // PostgreSQL接続プール情報取得
      const result = await prisma.$queryRaw`
        SELECT 
          count(*) as active_connections,
          (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') as max_connections
        FROM pg_stat_activity 
        WHERE state = 'active'
      `;
      return result;
    } catch {
      return { error: 'Unable to fetch pool status' };
    }
  }

  private static extractRedisInfo(info: string, key: string): string {
    const match = info.match(new RegExp(`${key}:(.+)`));
    return match ? match[1].trim() : 'N/A';
  }

  private static calculateRedisHitRate(stats: string): string {
    const hits = this.extractRedisInfo(stats, 'keyspace_hits');
    const misses = this.extractRedisInfo(stats, 'keyspace_misses');
    
    if (hits === 'N/A' || misses === 'N/A') return 'N/A';
    
    const totalRequests = parseInt(hits) + parseInt(misses);
    if (totalRequests === 0) return '0%';
    
    const hitRate = (parseInt(hits) / totalRequests) * 100;
    return `${hitRate.toFixed(2)}%`;
  }

  private static calculateEndpointStats(metrics: PerformanceMetric[]): Record<string, any> {
    const stats: Record<string, any> = {};
    
    for (const metric of metrics) {
      if (!stats[metric.endpoint]) {
        stats[metric.endpoint] = {
          count: 0,
          totalTime: 0,
          maxTime: 0,
          errors: 0
        };
      }
      
      const stat = stats[metric.endpoint];
      stat.count++;
      stat.totalTime += metric.responseTime;
      stat.maxTime = Math.max(stat.maxTime, metric.responseTime);
      
      if (metric.statusCode >= 400) {
        stat.errors++;
      }
    }
    
    // 平均時間とエラー率を計算
    for (const endpoint in stats) {
      const stat = stats[endpoint];
      stat.avgTime = Math.round(stat.totalTime / stat.count);
      stat.errorRate = Math.round((stat.errors / stat.count) * 100);
    }
    
    return stats;
  }

  private static async getTotalRequestCount(since: Date): Promise<number> {
    // 実装: リクエストログやメトリクスから取得
    return 1000; // ダミー値
  }

  private static async getErrorCount(since: Date): Promise<number> {
    // 実装: エラーログから取得
    return 5; // ダミー値
  }

  private static async sendExternalAlert(alert: any): Promise<void> {
    // 実装: Slack、メール、PagerDutyなどへの通知
  }

  private static async getRecentAlerts(): Promise<any[]> {
    return await prisma.systemAlert.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24時間以内
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
  }

  private static async getPerformanceStatistics(): Promise<any> {
    const metrics = Array.from(this.performanceMetrics.values());
    
    return {
      totalRequests: metrics.length,
      avgResponseTime: metrics.reduce((sum, m) => sum + m.responseTime, 0) / metrics.length || 0,
      errorRate: (metrics.filter(m => m.statusCode >= 400).length / metrics.length) * 100 || 0
    };
  }
}

// 型定義
interface HealthCheck {
  name: string;
  lastCheck: Date;
  isHealthy: boolean;
  details?: any;
}

interface PerformanceMetric {
  endpoint: string;
  responseTime: number;
  statusCode: number;
  timestamp: number;
}

interface HealthCheckResult {
  healthy: boolean;
  responseTime: number;
  details?: any;
  error?: string;
}

interface SystemHealthReport {
  status: 'healthy' | 'degraded' | 'critical';
  timestamp: string;
  responseTime: number;
  checks: Record<string, HealthCheckResult>;
  overall: any;
  error?: string;
}

interface SystemStatistics {
  health: SystemHealthReport;
  alerts: any[];
  performance: any;
  timestamp: string;
}

export default MonitoringService;