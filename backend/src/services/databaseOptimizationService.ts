import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

export class DatabaseOptimizationService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'error' },
      ],
    });

    // クエリログの設定（開発環境のみ）
    if (process.env.NODE_ENV === 'development') {
      // Note: Query logging is configured via log option in PrismaClient constructor
      // Event-based query logging is no longer supported in newer Prisma versions
      logger.info('Database query logging enabled in development mode');
    }
  }

  /**
   * データベース接続プールの最適化設定
   */
  configureConnectionPool() {
    const poolSize = parseInt(process.env.DB_POOL_SIZE || '20');
    const connectionTimeout = parseInt(process.env.DB_CONNECTION_TIMEOUT || '10000');

    return {
      pool_size: poolSize,
      connection_timeout: connectionTimeout,
      pool_timeout: 20,
      pool_recycle: 3600, // 1時間でコネクションを再利用
    };
  }

  /**
   * 高頻度クエリの最適化済みメソッド
   */
  async getOptimizedCustomers(tenantId: string, options: {
    page?: number;
    limit?: number;
    search?: string;
    tags?: string[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const { page = 1, limit = 20, search, tags, sortBy = 'name', sortOrder = 'asc' } = options;
    const skip = (page - 1) * limit;

    // インデックスを活用した最適化クエリ
    const where: any = { 
      tenantId,
      isActive: true // 部分インデックスを活用
    };

    // 検索条件の最適化
    if (search) {
      // GINインデックスを活用した全文検索
      where.OR = [
        { name: { search: search, mode: 'insensitive' } },
        { nameKana: { search: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ];
    }

    // タグフィルターの最適化
    if (tags && tags.length > 0) {
      where.customerTags = {
        some: {
          tag: {
            name: { in: tags }
          }
        }
      };
    }

    // ソート最適化
    const orderBy: any = {};
    if (sortBy === 'lastVisitDate') {
      orderBy.lastVisitDate = { sort: sortOrder, nulls: 'last' };
    } else {
      orderBy[sortBy] = sortOrder;
    }

    try {
      const [customers, total] = await Promise.all([
        this.prisma.customer.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          select: {
            id: true,
            name: true,
            nameKana: true,
            email: true,
            phone: true,
            profilePhoto: true,
            visitCount: true,
            lastVisitDate: true,
            createdAt: true,
            customerTags: {
              select: {
                tag: {
                  select: {
                    id: true,
                    name: true,
                    color: true
                  }
                }
              }
            }
          }
        }),
        this.prisma.customer.count({ where })
      ]);

      return {
        customers: customers.map(customer => ({
          ...customer,
          tags: customer.customerTags.map(ct => ct.tag)
        })),
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          hasNext: skip + limit < total,
          hasPrev: page > 1,
          totalCount: total
        }
      };
    } catch (error) {
      logger.error('Optimized customer query failed:', error);
      throw error;
    }
  }

  /**
   * 予約カレンダー用の最適化クエリ
   */
  async getOptimizedReservations(tenantId: string, options: {
    startDate: Date;
    endDate: Date;
    staffId?: string;
    status?: string[];
  }) {
    const { startDate, endDate, staffId, status } = options;

    const where: any = {
      tenantId,
      startTime: {
        gte: startDate,
        lte: endDate
      }
    };

    if (staffId) {
      where.staffId = staffId;
    }

    if (status && status.length > 0) {
      where.status = { in: status };
    }

    try {
      return await this.prisma.reservation.findMany({
        where,
        orderBy: { startTime: 'asc' },
        select: {
          id: true,
          startTime: true,
          endTime: true,
          status: true,
          paymentStatus: true,
          totalAmount: true,
          customer: {
            select: {
              id: true,
              name: true,
              phone: true,
              profilePhoto: true
            }
          },
          staff: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });
    } catch (error) {
      logger.error('Optimized reservation query failed:', error);
      throw error;
    }
  }

  /**
   * メッセージスレッド用の最適化クエリ
   */
  async getOptimizedMessageThreads(tenantId: string, options: {
    page?: number;
    limit?: number;
    customerId?: string;
  }) {
    const { page = 1, limit = 20, customerId } = options;
    const skip = (page - 1) * limit;

    const where: any = { tenantId };
    if (customerId) {
      where.customerId = customerId;
    }

    try {
      return await this.prisma.messageThread.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          status: true,
          createdAt: true,
          customer: {
            select: {
              id: true,
              name: true,
              profilePhoto: true
            }
          },
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              content: true,
              mediaType: true,
              createdAt: true
            }
          }
        }
      });
    } catch (error) {
      logger.error('Optimized message thread query failed:', error);
      throw error;
    }
  }

  /**
   * 分析用の高速集計クエリ
   */
  async getAnalyticsData(tenantId: string, options: {
    startDate: Date;
    endDate: Date;
    metrics: string[];
  }) {
    const { startDate, endDate, metrics } = options;

    try {
      const results: any = {};

      // 並列実行で各種分析データを取得
      const promises = [];

      if (metrics.includes('revenue')) {
        promises.push(
          this.prisma.payment.aggregate({
            where: {
              tenantId,
              status: 'succeeded',
              createdAt: { gte: startDate, lte: endDate }
            },
            _sum: { amount: true },
            _count: true
          }).then(result => {
            results.revenue = {
              total: result._sum.amount || 0,
              count: result._count
            };
          })
        );
      }

      if (metrics.includes('customers')) {
        promises.push(
          this.prisma.customer.aggregate({
            where: {
              tenantId,
              createdAt: { gte: startDate, lte: endDate }
            },
            _count: true
          }).then(result => {
            results.newCustomers = result._count;
          })
        );
      }

      if (metrics.includes('reservations')) {
        promises.push(
          this.prisma.reservation.groupBy({
            by: ['status'],
            where: {
              tenantId,
              createdAt: { gte: startDate, lte: endDate }
            },
            _count: true
          }).then(result => {
            results.reservations = result.reduce((acc, item) => {
              acc[item.status] = item._count;
              return acc;
            }, {} as Record<string, number>);
          })
        );
      }

      await Promise.all(promises);
      return results;
    } catch (error) {
      logger.error('Analytics query failed:', error);
      throw error;
    }
  }

  /**
   * データベースクリーンアップ
   */
  async performMaintenance(tenantId?: string) {
    try {
      const maintenanceTasks = [];

      // 古い監査ログの削除（90日以上前）
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const auditLogWhere: any = {
        createdAt: { lt: ninetyDaysAgo }
      };
      if (tenantId) {
        auditLogWhere.tenantId = tenantId;
      }

      maintenanceTasks.push(
        this.prisma.auditLog.deleteMany({
          where: auditLogWhere
        })
      );

      // 古いセッショントークンの削除（30日以上前）
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      maintenanceTasks.push(
        this.prisma.refreshToken.deleteMany({
          where: {
            createdAt: { lt: thirtyDaysAgo }
          }
        })
      );

      // 未完了の古い予約の自動キャンセル（48時間後）
      const fortyEightHoursAgo = new Date();
      fortyEightHoursAgo.setHours(fortyEightHoursAgo.getHours() - 48);

      const reservationWhere: any = {
        status: 'TENTATIVE',
        createdAt: { lt: fortyEightHoursAgo }
      };
      if (tenantId) {
        reservationWhere.tenantId = tenantId;
      }

      maintenanceTasks.push(
        this.prisma.reservation.updateMany({
          where: reservationWhere,
          data: { status: 'CANCELLED' }
        })
      );

      const results = await Promise.all(maintenanceTasks);

      logger.info('Database maintenance completed:', {
        tenantId,
        deletedAuditLogs: results[0].count,
        deletedTokens: results[1].count,
        cancelledReservations: results[2].count
      });

      return {
        success: true,
        deletedAuditLogs: results[0].count,
        deletedTokens: results[1].count,
        cancelledReservations: results[2].count
      };
    } catch (error) {
      logger.error('Database maintenance failed:', error);
      throw error;
    }
  }

  /**
   * データベース統計情報の更新
   */
  async updateStatistics() {
    try {
      // PostgreSQL特有のANALYZEコマンドを実行
      await this.prisma.$executeRaw`ANALYZE`;
      
      logger.info('Database statistics updated successfully');
      return { success: true, message: 'Statistics updated' };
    } catch (error) {
      logger.error('Statistics update failed:', error);
      throw error;
    }
  }

  /**
   * 接続プールの状態確認
   */
  async getConnectionPoolStatus() {
    try {
      // コネクション数の確認
      const result = await this.prisma.$queryRaw<Array<{ active_connections: number; max_connections: number }>>`
        SELECT 
          count(*) as active_connections,
          setting::int as max_connections
        FROM pg_stat_activity 
        CROSS JOIN pg_settings 
        WHERE pg_settings.name = 'max_connections'
        GROUP BY setting
      `;

      return {
        activeConnections: result[0]?.active_connections || 0,
        maxConnections: result[0]?.max_connections || 0,
        utilizationRate: ((result[0]?.active_connections || 0) / (result[0]?.max_connections || 1)) * 100
      };
    } catch (error) {
      logger.error('Connection pool status check failed:', error);
      throw error;
    }
  }

  async disconnect() {
    await this.prisma.$disconnect();
  }
}

export const dbOptimizationService = new DatabaseOptimizationService();