import { PrismaClient } from '@prisma/client';
import { startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear, subYears } from 'date-fns';

const prisma = new PrismaClient();

export class BusinessAnalyticsService {
  /**
   * 日次経営指標を集計・保存
   */
  static async calculateDailyMetrics(tenantId: string, date: Date = new Date()) {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // 当日の予約データを取得
      const reservations = await prisma.reservation.findMany({
        where: {
          tenantId,
          startTime: { gte: startOfDay, lte: endOfDay },
          status: { in: ['COMPLETED', 'CONFIRMED'] }
        },
        include: { customer: true, staff: true }
      });

      // 売上計算
      const dailyRevenue = reservations.reduce((sum, r) => sum + (Number(r.totalAmount) || 0), 0);

      // 顧客分析
      const uniqueCustomers = new Set(reservations.map(r => r.customerId).filter(id => id));
      const newCustomers = await prisma.customer.count({
        where: {
          tenantId,
          createdAt: { gte: startOfDay, lte: endOfDay }
        }
      });

      // 効率指標
      const totalServiceTime = reservations.reduce((sum, r) => {
        if (r.startTime && r.endTime) {
          return sum + (r.endTime.getTime() - r.startTime.getTime()) / (1000 * 60); // 分単位
        }
        return sum + (r.estimatedDuration || 0);
      }, 0);

      const avgServiceTime = reservations.length > 0 ? totalServiceTime / reservations.length : 0;

      // スタッフ生産性
      const staffCount = await prisma.staff.count({
        where: { tenantId, isActive: true }
      });
      const staffProductivity = staffCount > 0 ? dailyRevenue / staffCount : 0;

      // 月次・年次の集計値を更新
      const monthlyRevenue = await this.calculateMonthlyRevenue(tenantId, date);
      const yearlyRevenue = await this.calculateYearlyRevenue(tenantId, date);

      // BusinessMetricsを作成または更新
      const metrics = await prisma.businessMetrics.upsert({
        where: {
          tenantId_metricDate: {
            tenantId,
            metricDate: startOfDay
          }
        },
        update: {
          dailyRevenue,
          monthlyRevenue,
          yearlyRevenue,
          newCustomers,
          avgServiceTime,
          staffProductivity,
          updatedAt: new Date()
        },
        create: {
          tenantId,
          metricDate: startOfDay,
          dailyRevenue,
          monthlyRevenue,
          yearlyRevenue,
          newCustomers,
          avgServiceTime,
          staffProductivity
        }
      });

      return metrics;

    } catch (error) {
      console.error('Error calculating daily metrics:', error);
      throw error;
    }
  }

  /**
   * 月次売上計算
   */
  static async calculateMonthlyRevenue(tenantId: string, date: Date) {
    const start = startOfMonth(date);
    const end = endOfMonth(date);

    const result = await prisma.reservation.aggregate({
      where: {
        tenantId,
        startTime: { gte: start, lte: end },
        status: { in: ['COMPLETED'] }
      },
      _sum: { totalAmount: true }
    });

    return Number(result._sum.totalAmount) || 0;
  }

  /**
   * 年次売上計算
   */
  static async calculateYearlyRevenue(tenantId: string, date: Date) {
    const start = startOfYear(date);
    const end = endOfYear(date);

    const result = await prisma.reservation.aggregate({
      where: {
        tenantId,
        startTime: { gte: start, lte: end },
        status: { in: ['COMPLETED'] }
      },
      _sum: { totalAmount: true }
    });

    return Number(result._sum.totalAmount) || 0;
  }

  /**
   * 顧客保持率の計算
   */
  static async calculateRetentionRate(tenantId: string) {
    const currentMonth = new Date();
    const lastMonth = subMonths(currentMonth, 1);
    const twoMonthsAgo = subMonths(currentMonth, 2);

    // 2ヶ月前の顧客
    const customersFromTwoMonthsAgo = await prisma.reservation.findMany({
      where: {
        tenantId,
        startTime: {
          gte: startOfMonth(twoMonthsAgo),
          lte: endOfMonth(twoMonthsAgo)
        },
        status: 'COMPLETED'
      },
      select: { customerId: true },
      distinct: ['customerId']
    });

    const customerIdsFromTwoMonthsAgo = customersFromTwoMonthsAgo
      .map(r => r.customerId)
      .filter(id => id);

    if (customerIdsFromTwoMonthsAgo.length === 0) return 0;

    // 先月も来店した顧客
    const retainedCustomers = await prisma.reservation.findMany({
      where: {
        tenantId,
        customerId: { in: customerIdsFromTwoMonthsAgo },
        startTime: {
          gte: startOfMonth(lastMonth),
          lte: endOfMonth(lastMonth)
        },
        status: 'COMPLETED'
      },
      select: { customerId: true },
      distinct: ['customerId']
    });

    const retentionRate = (retainedCustomers.length / customerIdsFromTwoMonthsAgo.length) * 100;
    return Math.round(retentionRate * 10) / 10;
  }

  /**
   * 競合分析データの生成（サンプル）
   */
  static async analyzeCompetitors(tenantId: string) {
    // 実際の実装では外部APIや手動入力データを使用
    const sampleCompetitors = [
      {
        competitorName: '美容室A',
        distance: 0.5,
        location: '同じ商店街',
        avgMenuPrice: 5500,
        pricePosition: 'SIMILAR',
        services: JSON.stringify(['カット', 'カラー', 'パーマ', 'トリートメント']),
        uniqueServices: JSON.stringify(['ヘッドスパ']),
        onlineRating: 4.2,
        reviewCount: 128,
        strengthPoints: JSON.stringify(['立地が良い', 'スタッフが多い']),
        weaknessPoints: JSON.stringify(['予約が取りにくい', '価格が高め']),
        threats: JSON.stringify(['大手チェーンの参入']),
        opportunities: JSON.stringify(['差別化サービスの提供'])
      },
      {
        competitorName: '美容室B',
        distance: 1.2,
        location: '隣駅',
        avgMenuPrice: 4000,
        pricePosition: 'LOWER',
        services: JSON.stringify(['カット', 'カラー']),
        onlineRating: 3.8,
        reviewCount: 56
      }
    ];

    for (const competitor of sampleCompetitors) {
      await prisma.competitorAnalysis.create({
        data: {
          tenantId,
          ...competitor,
          lastAnalyzedAt: new Date()
        }
      });
    }
  }

  /**
   * AIインサイトの生成
   */
  static async generateBusinessInsights(tenantId: string) {
    try {
      // 過去30日間のデータを分析
      const thirtyDaysAgo = subMonths(new Date(), 1);
      
      const metrics = await prisma.businessMetrics.findMany({
        where: {
          tenantId,
          metricDate: { gte: thirtyDaysAgo }
        },
        orderBy: { metricDate: 'desc' }
      });

      const insights: any[] = [];

      // 売上トレンド分析
      if (metrics.length >= 7) {
        const lastWeekRevenue = metrics.slice(0, 7).reduce((sum, m) => sum + m.dailyRevenue, 0);
        const previousWeekRevenue = metrics.slice(7, 14).reduce((sum, m) => sum + m.dailyRevenue, 0);
        
        if (previousWeekRevenue > 0) {
          const changePercent = ((lastWeekRevenue - previousWeekRevenue) / previousWeekRevenue) * 100;
          
          if (Math.abs(changePercent) > 10) {
            insights.push({
              type: 'TREND',
              category: 'REVENUE',
              title: changePercent > 0 ? '売上が急上昇中' : '売上に注意が必要',
              description: `先週の売上は前週比${Math.abs(changePercent).toFixed(1)}%${changePercent > 0 ? '増加' : '減少'}しました`,
              importance: Math.abs(changePercent) > 20 ? 'HIGH' : 'MEDIUM',
              confidence: 0.85,
              analysisData: JSON.stringify({
                lastWeekRevenue,
                previousWeekRevenue,
                changePercent
              }),
              suggestedActions: JSON.stringify(
                changePercent > 0 
                  ? ['好調な要因を分析して維持', 'スタッフのモチベーション向上施策']
                  : ['プロモーション強化', '顧客フォローアップの実施', 'サービス品質の見直し']
              ),
              validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7日間有効
            });
          }
        }
      }

      // 新規顧客獲得分析
      const newCustomerTrend = metrics.slice(0, 7).map(m => m.newCustomers);
      const avgNewCustomers = newCustomerTrend.reduce((sum, n) => sum + n, 0) / newCustomerTrend.length;
      
      if (avgNewCustomers < 1) {
        insights.push({
          type: 'ANOMALY',
          category: 'CUSTOMER',
          title: '新規顧客獲得に課題',
          description: '直近1週間の新規顧客数が低迷しています',
          importance: 'HIGH',
          confidence: 0.9,
          analysisData: JSON.stringify({ avgNewCustomers, trend: newCustomerTrend }),
          suggestedActions: JSON.stringify([
            '新規顧客向けキャンペーンの実施',
            'SNSマーケティングの強化',
            '紹介制度の導入'
          ]),
          validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        });
      }

      // インサイトを保存
      for (const insight of insights) {
        await prisma.businessInsight.create({
          data: {
            tenantId,
            ...insight
          }
        });
      }

      return insights;

    } catch (error) {
      console.error('Error generating insights:', error);
      throw error;
    }
  }

  /**
   * 経営レポートの生成
   */
  static async generateManagementReport(
    tenantId: string, 
    reportType: 'DAILY' | 'WEEKLY' | 'MONTHLY' = 'MONTHLY'
  ) {
    try {
      const reportDate = new Date();
      let startDate: Date;
      let title: string;

      switch (reportType) {
        case 'DAILY':
          startDate = new Date(reportDate);
          startDate.setHours(0, 0, 0, 0);
          title = `日次経営レポート - ${reportDate.toLocaleDateString('ja-JP')}`;
          break;
        case 'WEEKLY':
          startDate = new Date(reportDate);
          startDate.setDate(startDate.getDate() - 7);
          title = `週次経営レポート - ${startDate.toLocaleDateString('ja-JP')} 〜 ${reportDate.toLocaleDateString('ja-JP')}`;
          break;
        case 'MONTHLY':
          startDate = startOfMonth(reportDate);
          title = `月次経営レポート - ${reportDate.getFullYear()}年${reportDate.getMonth() + 1}月`;
          break;
      }

      // 期間中のメトリクス集計
      const metrics = await prisma.businessMetrics.findMany({
        where: {
          tenantId,
          metricDate: { gte: startDate, lte: reportDate }
        }
      });

      const totalRevenue = metrics.reduce((sum, m) => sum + m.dailyRevenue, 0);
      const avgDailyRevenue = metrics.length > 0 ? totalRevenue / metrics.length : 0;
      const totalNewCustomers = metrics.reduce((sum, m) => sum + m.newCustomers, 0);

      // 前期間との比較
      const previousStartDate = new Date(startDate);
      if (reportType === 'MONTHLY') {
        previousStartDate.setMonth(previousStartDate.getMonth() - 1);
      } else {
        previousStartDate.setDate(previousStartDate.getDate() - (reportDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      }

      const previousMetrics = await prisma.businessMetrics.findMany({
        where: {
          tenantId,
          metricDate: { gte: previousStartDate, lt: startDate }
        }
      });

      const previousRevenue = previousMetrics.reduce((sum, m) => sum + m.dailyRevenue, 0);
      const revenueGrowth = previousRevenue > 0 
        ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
        : 0;

      // アクティブなインサイト取得
      const activeInsights = await prisma.businessInsight.findMany({
        where: {
          tenantId,
          dismissed: false,
          validUntil: { gte: new Date() }
        },
        orderBy: { importance: 'asc' },
        take: 5
      });

      // レポート作成
      const report = await prisma.managementReport.create({
        data: {
          tenantId,
          reportType,
          reportDate,
          title,
          summary: `期間売上: ¥${totalRevenue.toLocaleString()}, 前期比: ${revenueGrowth > 0 ? '+' : ''}${revenueGrowth.toFixed(1)}%, 新規顧客: ${totalNewCustomers}名`,
          metrics: JSON.stringify({
            totalRevenue,
            avgDailyRevenue,
            totalNewCustomers,
            revenueGrowth,
            periodDays: metrics.length
          }),
          insights: JSON.stringify(
            activeInsights.map(i => ({
              title: i.title,
              description: i.description,
              importance: i.importance
            }))
          ),
          recommendations: JSON.stringify([
            revenueGrowth < 0 ? '売上改善策の実施が急務です' : '好調を維持するための施策を継続してください',
            totalNewCustomers < 10 ? '新規顧客獲得の強化が必要です' : '新規顧客の定着化に注力しましょう',
            '競合分析を定期的に実施してください'
          ])
        }
      });

      return report;

    } catch (error) {
      console.error('Error generating management report:', error);
      throw error;
    }
  }

  /**
   * 戦略的アクションの提案
   */
  static async suggestStrategicActions(tenantId: string) {
    try {
      const insights = await prisma.businessInsight.findMany({
        where: {
          tenantId,
          dismissed: false,
          validUntil: { gte: new Date() },
          importance: { in: ['CRITICAL', 'HIGH'] }
        }
      });

      const actions: any[] = [];

      for (const insight of insights) {
        if (insight.suggestedActions) {
          const suggestedActions = JSON.parse(insight.suggestedActions);
          
          for (const [index, action] of suggestedActions.entries()) {
            actions.push({
              title: action,
              description: `${insight.title}への対応策`,
              category: insight.category,
              priority: insight.importance === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
              targetMetric: insight.category === 'REVENUE' ? 'revenue' : 'customer_count',
              targetValue: 10, // 10%改善目標
              expectedImpact: 5 + index * 2, // 期待効果
              startDate: new Date(),
              dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30日後
              linkedInsightId: insight.id
            });
          }
        }
      }

      // アクションを保存
      for (const action of actions) {
        const { linkedInsightId, ...actionData } = action;
        
        const createdAction = await prisma.strategicAction.create({
          data: {
            tenantId,
            ...actionData
          }
        });

        // インサイトとのリンクを作成
        if (linkedInsightId) {
          await prisma.insightActionLink.create({
            data: {
              insightId: linkedInsightId,
              actionId: createdAction.id
            }
          });
        }
      }

      return actions;

    } catch (error) {
      console.error('Error suggesting strategic actions:', error);
      throw error;
    }
  }
}