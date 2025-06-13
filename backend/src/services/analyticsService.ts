import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { getNotificationService } from './notificationService';

const prisma = new PrismaClient();

export interface DashboardKPIs {
  revenue: {
    today: number;
    yesterday: number;
    thisMonth: number;
    lastMonth: number;
    trend: number; // percentage change
  };
  customers: {
    total: number;
    newToday: number;
    newThisMonth: number;
    activeLastMonth: number;
    churnRate: number;
  };
  reservations: {
    todayCount: number;
    upcomingCount: number;
    completionRate: number;
    noShowRate: number;
  };
  satisfaction: {
    averageScore: number;
    responseRate: number;
    trend: number;
  };
}

export interface ChurnAnalysis {
  highRiskCustomers: Array<{
    customerId: string;
    customerName: string;
    lastVisit: Date;
    churnProbability: number;
    recommendedAction: string;
  }>;
  churnFactors: Array<{
    factor: string;
    impact: number;
    description: string;
  }>;
}

export interface RevenueForecast {
  nextMonth: {
    predicted: number;
    confidence: number;
    factors: string[];
  };
  quarterlyTrend: Array<{
    month: string;
    predicted: number;
    historical: number;
  }>;
}

export class AnalyticsService {
  private notificationService: any = null;

  async getDashboardKPIs(tenantId: string): Promise<DashboardKPIs> {
    try {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

      // Revenue calculations
      const [todayRevenue, yesterdayRevenue, thisMonthRevenue, lastMonthRevenue] = await Promise.all([
        this.calculateDailyRevenue(tenantId, today),
        this.calculateDailyRevenue(tenantId, yesterday),
        this.calculatePeriodRevenue(tenantId, thisMonthStart, today),
        this.calculatePeriodRevenue(tenantId, lastMonthStart, lastMonthEnd),
      ]);

      // Customer statistics
      const [totalCustomers, newTodayCustomers, newThisMonthCustomers, activeLastMonthCustomers] = await Promise.all([
        prisma.customer.count({ where: { tenantId } }),
        prisma.customer.count({
          where: {
            tenantId,
            createdAt: {
              gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
            },
          },
        }),
        prisma.customer.count({
          where: {
            tenantId,
            createdAt: { gte: thisMonthStart },
          },
        }),
        prisma.customer.count({
          where: {
            tenantId,
            lastVisitDate: {
              gte: lastMonthStart,
              lte: lastMonthEnd,
            },
          },
        }),
      ]);

      // Reservation statistics
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayEnd = new Date(todayStart);
      todayEnd.setDate(todayEnd.getDate() + 1);

      const [todayReservations, upcomingReservations, completedReservations, noShowReservations] = await Promise.all([
        prisma.reservation.count({
          where: {
            tenantId,
            startTime: { gte: todayStart, lt: todayEnd },
          },
        }),
        prisma.reservation.count({
          where: {
            tenantId,
            startTime: { gte: today },
            status: { in: ['CONFIRMED', 'TENTATIVE'] },
          },
        }),
        prisma.reservation.count({
          where: {
            tenantId,
            status: 'COMPLETED',
            startTime: { gte: lastMonthStart },
          },
        }),
        prisma.reservation.count({
          where: {
            tenantId,
            status: 'NO_SHOW',
            startTime: { gte: lastMonthStart },
          },
        }),
      ]);

      // Satisfaction metrics
      const satisfactionData = await prisma.menuHistory.aggregate({
        where: {
          tenantId,
          satisfaction: { not: null },
          visitDate: { gte: lastMonthStart },
        },
        _avg: { satisfaction: true },
        _count: { satisfaction: true },
      });

      const totalLastMonthVisits = await prisma.menuHistory.count({
        where: {
          tenantId,
          visitDate: { gte: lastMonthStart },
        },
      });

      // Calculate churn rate
      const churnRate = activeLastMonthCustomers > 0 
        ? Math.max(0, (activeLastMonthCustomers - newThisMonthCustomers) / activeLastMonthCustomers) * 100
        : 0;

      // Calculate completion and no-show rates
      const totalRecentReservations = completedReservations + noShowReservations;
      const completionRate = totalRecentReservations > 0 
        ? (completedReservations / totalRecentReservations) * 100 
        : 100;
      const noShowRate = totalRecentReservations > 0 
        ? (noShowReservations / totalRecentReservations) * 100 
        : 0;

      // Calculate trends
      const revenueTrend = yesterdayRevenue > 0 
        ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 
        : 0;

      return {
        revenue: {
          today: todayRevenue,
          yesterday: yesterdayRevenue,
          thisMonth: thisMonthRevenue,
          lastMonth: lastMonthRevenue,
          trend: revenueTrend,
        },
        customers: {
          total: totalCustomers,
          newToday: newTodayCustomers,
          newThisMonth: newThisMonthCustomers,
          activeLastMonth: activeLastMonthCustomers,
          churnRate,
        },
        reservations: {
          todayCount: todayReservations,
          upcomingCount: upcomingReservations,
          completionRate,
          noShowRate,
        },
        satisfaction: {
          averageScore: satisfactionData._avg.satisfaction || 0,
          responseRate: totalLastMonthVisits > 0 
            ? (satisfactionData._count.satisfaction / totalLastMonthVisits) * 100 
            : 0,
          trend: 0, // TODO: Compare with previous period
        },
      };
    } catch (error) {
      logger.error('Dashboard KPIs calculation error:', error);
      throw error;
    }
  }

  async analyzeCustomerChurn(tenantId: string): Promise<ChurnAnalysis> {
    try {
      // Update customer behavior analysis
      await this.updateCustomerBehaviorAnalysis(tenantId);

      // Get high-risk customers
      const highRiskCustomers = await prisma.customerBehavior.findMany({
        where: {
          tenantId,
          churnProbability: { gte: 0.7 },
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              lastVisitDate: true,
            },
          },
        },
        orderBy: { churnProbability: 'desc' },
        take: 20,
      });

      return {
        highRiskCustomers: highRiskCustomers.map(behavior => ({
          customerId: behavior.customerId,
          customerName: behavior.customer.name || '名前不明',
          lastVisit: behavior.lastVisitDate || behavior.customer.lastVisitDate || new Date(),
          churnProbability: behavior.churnProbability || 0,
          recommendedAction: this.getRecommendedAction(behavior.churnProbability || 0),
        })),
        churnFactors: [
          {
            factor: '来店間隔',
            impact: 0.4,
            description: '前回来店から60日以上経過',
          },
          {
            factor: '満足度低下',
            impact: 0.3,
            description: '直近の満足度が3以下',
          },
          {
            factor: '予約キャンセル頻度',
            impact: 0.2,
            description: '連続でキャンセルまたは無断欠席',
          },
          {
            factor: 'メッセージ反応率',
            impact: 0.1,
            description: 'リマインダーやフォローアップへの反応低下',
          },
        ],
      };
    } catch (error) {
      logger.error('Customer churn analysis error:', error);
      throw error;
    }
  }

  async generateRevenueForecast(tenantId: string): Promise<RevenueForecast> {
    try {
      // Get historical revenue data
      const historicalData = await this.getHistoricalRevenueData(tenantId, 12);
      
      // Simple forecast algorithm (can be replaced with more sophisticated ML models)
      const nextMonthPrediction = this.predictNextMonthRevenue(historicalData);
      
      // Generate quarterly trend
      const quarterlyTrend = await this.generateQuarterlyTrend(tenantId, historicalData);

      // Store prediction in database
      await this.storePrediction(tenantId, 'revenue_forecast', nextMonthPrediction);

      return {
        nextMonth: nextMonthPrediction,
        quarterlyTrend,
      };
    } catch (error) {
      logger.error('Revenue forecast error:', error);
      throw error;
    }
  }

  async startRealtimeAnalytics(tenantId: string): Promise<void> {
    try {
      // Start real-time metric collection
      setInterval(async () => {
        await this.collectRealtimeMetrics(tenantId);
      }, 60000); // Every minute

      // Daily analytics aggregation
      setInterval(async () => {
        await this.aggregateDailyMetrics(tenantId);
      }, 24 * 60 * 60 * 1000); // Daily

      logger.info(`Real-time analytics started for tenant ${tenantId}`);
    } catch (error) {
      logger.error('Real-time analytics startup error:', error);
      throw error;
    }
  }

  private async calculateDailyRevenue(tenantId: string, date: Date): Promise<number> {
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const completedReservations = await prisma.reservation.findMany({
      where: {
        tenantId,
        status: 'COMPLETED',
        startTime: { gte: startOfDay, lt: endOfDay },
      },
      include: {
        customer: {
          include: {
            menuHistory: {
              where: {
                visitDate: { gte: startOfDay, lt: endOfDay },
              },
              include: { menu: true },
            },
          },
        },
      },
    });

    let totalRevenue = 0;
    for (const reservation of completedReservations) {
      if (reservation.customer?.menuHistory) {
        totalRevenue += reservation.customer.menuHistory.reduce(
          (sum: number, history: any) => sum + (history.menu?.price || 0),
          0
        );
      }
    }

    return totalRevenue;
  }

  private async calculatePeriodRevenue(tenantId: string, startDate: Date, endDate: Date): Promise<number> {
    const completedReservations = await prisma.reservation.findMany({
      where: {
        tenantId,
        status: 'COMPLETED',
        startTime: { gte: startDate, lte: endDate },
      },
      include: {
        customer: {
          include: {
            menuHistory: {
              where: {
                visitDate: { gte: startDate, lte: endDate },
              },
              include: { menu: true },
            },
          },
        },
      },
    });

    let totalRevenue = 0;
    for (const reservation of completedReservations) {
      if (reservation.customer?.menuHistory) {
        totalRevenue += reservation.customer.menuHistory.reduce(
          (sum: number, history: any) => sum + (history.menu?.price || 0),
          0
        );
      }
    }

    return totalRevenue;
  }

  private async updateCustomerBehaviorAnalysis(tenantId: string): Promise<void> {
    const customers = await prisma.customer.findMany({
      where: { tenantId },
      include: {
        reservations: {
          where: { status: { in: ['COMPLETED', 'NO_SHOW'] } },
          orderBy: { startTime: 'desc' },
        },
        menuHistory: {
          include: { menu: true },
          orderBy: { visitDate: 'desc' },
        },
      },
    });

    for (const customer of customers) {
      const behavior = await this.calculateCustomerBehavior(customer);
      
      await prisma.customerBehavior.upsert({
        where: { customerId: customer.id },
        update: behavior,
        create: {
          customerId: customer.id,
          tenantId,
          ...behavior,
        },
      });
    }
  }

  private async calculateCustomerBehavior(customer: any): Promise<any> {
    const now = new Date();
    const reservations = customer.reservations || [];
    const menuHistory = customer.menuHistory || [];

    // Calculate visit frequency
    let visitFrequency = null;
    if (reservations.length > 1) {
      const intervals = [];
      for (let i = 0; i < reservations.length - 1; i++) {
        const diff = Math.abs(
          new Date(reservations[i].startTime).getTime() - 
          new Date(reservations[i + 1].startTime).getTime()
        );
        intervals.push(diff / (1000 * 60 * 60 * 24)); // Convert to days
      }
      visitFrequency = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    }

    // Calculate average spending
    let averageSpending = null;
    if (menuHistory.length > 0) {
      const totalSpending = menuHistory.reduce((sum: number, history: any) => sum + (history.menu?.price || 0), 0);
      averageSpending = totalSpending / menuHistory.length;
    }

    // Calculate churn probability
    const daysSinceLastVisit = customer.lastVisitDate 
      ? Math.floor((now.getTime() - new Date(customer.lastVisitDate).getTime()) / (1000 * 60 * 60 * 24))
      : 999;
    
    let churnProbability = 0;
    if (daysSinceLastVisit > 90) churnProbability += 0.5;
    else if (daysSinceLastVisit > 60) churnProbability += 0.3;
    else if (daysSinceLastVisit > 30) churnProbability += 0.1;

    // Factor in satisfaction scores
    const recentSatisfaction = menuHistory
      .filter((h: any) => h.satisfaction !== null)
      .slice(0, 3)
      .map((h: any) => h.satisfaction || 0);
    
    if (recentSatisfaction.length > 0) {
      const avgSatisfaction = recentSatisfaction.reduce((sum: number, score: number) => sum + score, 0) / recentSatisfaction.length;
      if (avgSatisfaction < 3) churnProbability += 0.2;
      else if (avgSatisfaction < 4) churnProbability += 0.1;
    }

    churnProbability = Math.min(1, churnProbability);

    // Calculate lifetime value
    const lifetimeValue = averageSpending && visitFrequency 
      ? averageSpending * (365 / visitFrequency) * 2 // Assume 2-year lifetime
      : null;

    return {
      lastVisitDate: customer.lastVisitDate,
      visitFrequency,
      averageSpending,
      churnProbability,
      lifetimeValue,
      riskScore: churnProbability,
    };
  }

  private getRecommendedAction(churnProbability: number): string {
    if (churnProbability >= 0.8) return '即座にパーソナライズされたオファーを送信';
    if (churnProbability >= 0.7) return 'フォローアップメッセージと特別割引を提供';
    if (churnProbability >= 0.5) return '来店を促すリマインダーメッセージを送信';
    return '定期的なフォローアップで関係を維持';
  }

  private async getHistoricalRevenueData(tenantId: string, months: number): Promise<Array<{month: string, revenue: number}>> {
    const data = [];
    const now = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const revenue = await this.calculatePeriodRevenue(tenantId, monthStart, monthEnd);
      data.push({
        month: monthStart.toISOString().substring(0, 7),
        revenue,
      });
    }
    
    return data;
  }

  private predictNextMonthRevenue(historicalData: Array<{month: string, revenue: number}>): {predicted: number, confidence: number, factors: string[]} {
    if (historicalData.length < 3) {
      return {
        predicted: historicalData[historicalData.length - 1]?.revenue || 0,
        confidence: 0.3,
        factors: ['データ不足のため信頼度が低い'],
      };
    }

    // Simple trend analysis
    const revenues = historicalData.map(d => d.revenue);
    const recentTrend = revenues.slice(-3);
    const earlierTrend = revenues.slice(-6, -3);

    const recentAvg = recentTrend.reduce((sum, r) => sum + r, 0) / recentTrend.length;
    const earlierAvg = earlierTrend.length > 0 
      ? earlierTrend.reduce((sum, r) => sum + r, 0) / earlierTrend.length 
      : recentAvg;

    const trendMultiplier = earlierAvg > 0 ? recentAvg / earlierAvg : 1;
    const predicted = recentAvg * trendMultiplier;

    const factors = [];
    if (trendMultiplier > 1.1) factors.push('売上増加トレンド');
    else if (trendMultiplier < 0.9) factors.push('売上減少トレンド');
    else factors.push('安定した売上推移');

    return {
      predicted: Math.max(0, predicted),
      confidence: Math.min(0.85, 0.5 + (historicalData.length * 0.05)),
      factors,
    };
  }

  private async generateQuarterlyTrend(tenantId: string, historicalData: Array<{month: string, revenue: number}>): Promise<Array<{month: string, predicted: number, historical: number}>> {
    return historicalData.slice(-3).map(data => ({
      month: data.month,
      predicted: data.revenue * 1.05, // Simple 5% growth assumption
      historical: data.revenue,
    }));
  }

  private async storePrediction(tenantId: string, type: string, prediction: any): Promise<void> {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    await prisma.predictionData.upsert({
      where: {
        tenantId_predictionType_targetDate_modelVersion: {
          tenantId,
          predictionType: type,
          targetDate: nextMonth,
          modelVersion: 'v1.0',
        },
      },
      update: {
        predictedValue: prediction.predicted,
        confidence: prediction.confidence,
        features: JSON.stringify(prediction.factors),
      },
      create: {
        tenantId,
        predictionType: type,
        targetDate: nextMonth,
        predictedValue: prediction.predicted,
        confidence: prediction.confidence,
        features: JSON.stringify(prediction.factors),
      },
    });
  }

  private async collectRealtimeMetrics(tenantId: string): Promise<void> {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // Initialize notification service if needed
      if (!this.notificationService) {
        try {
          this.notificationService = getNotificationService();
        } catch {
          this.notificationService = { getConnectionStats: () => ({ totalConnections: 0 }) };
        }
      }

      // Collect key metrics
      const [activeConnections, todayReservations, unreadMessages] = await Promise.all([
        this.notificationService.getConnectionStats().totalConnections,
        prisma.reservation.count({
          where: {
            tenantId,
            startTime: { gte: today },
            status: { in: ['CONFIRMED', 'TENTATIVE'] },
          },
        }),
        prisma.notification.count({
          where: { tenantId, isRead: false },
        }),
      ]);

      // Store metrics
      await Promise.all([
        this.storeMetric(tenantId, 'active_connections', activeConnections, now),
        this.storeMetric(tenantId, 'today_reservations', todayReservations, now),
        this.storeMetric(tenantId, 'unread_messages', unreadMessages, now),
      ]);
    } catch (error) {
      logger.error('Real-time metrics collection error:', error);
    }
  }

  private async aggregateDailyMetrics(tenantId: string): Promise<void> {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const [dailyRevenue, newCustomers, completedReservations] = await Promise.all([
        this.calculateDailyRevenue(tenantId, yesterday),
        prisma.customer.count({
          where: {
            tenantId,
            createdAt: {
              gte: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()),
              lt: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate() + 1),
            },
          },
        }),
        prisma.reservation.count({
          where: {
            tenantId,
            status: 'COMPLETED',
            startTime: {
              gte: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()),
              lt: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate() + 1),
            },
          },
        }),
      ]);

      // Store daily aggregated metrics
      await Promise.all([
        this.storeMetric(tenantId, 'daily_revenue', dailyRevenue, yesterday),
        this.storeMetric(tenantId, 'daily_new_customers', newCustomers, yesterday),
        this.storeMetric(tenantId, 'daily_completed_reservations', completedReservations, yesterday),
      ]);

      logger.info(`Daily metrics aggregated for tenant ${tenantId}: Revenue: ${dailyRevenue}, New customers: ${newCustomers}`);
    } catch (error) {
      logger.error('Daily metrics aggregation error:', error);
    }
  }

  private async storeMetric(tenantId: string, metricKey: string, value: number, date: Date): Promise<void> {
    await prisma.analyticsMetric.upsert({
      where: {
        tenantId_metricKey_date: {
          tenantId,
          metricKey,
          date,
        },
      },
      update: { value },
      create: {
        tenantId,
        metricKey,
        value,
        date,
      },
    });
  }
}

export const analyticsService = new AnalyticsService();