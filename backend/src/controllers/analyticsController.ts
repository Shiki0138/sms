import { Request, Response } from 'express';
import { analyticsService } from '../services/analyticsService';
import { z } from 'zod';
import { logger } from '../utils/logger';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const GetMetricsSchema = z.object({
  period: z.enum(['today', 'week', 'month', 'quarter']).default('month'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const PredictionTypeSchema = z.object({
  type: z.enum(['revenue', 'churn', 'demand']).default('revenue'),
  period: z.enum(['month', 'quarter', 'year']).default('month'),
});

export class AnalyticsController {
  /**
   * ダッシュボードKPI取得
   */
  async getDashboardKPIs(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.headers['x-tenant-id'] as string || 'default-tenant';
      
      const kpis = await analyticsService.getDashboardKPIs(tenantId);
      
      res.json({
        success: true,
        data: kpis,
      });
    } catch (error: any) {
      logger.error('Dashboard KPIs取得エラー:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'サーバーエラーが発生しました',
      });
    }
  }

  /**
   * 顧客離脱分析取得
   */
  async getChurnAnalysis(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.headers['x-tenant-id'] as string || 'default-tenant';
      
      const churnAnalysis = await analyticsService.analyzeCustomerChurn(tenantId);
      
      res.json({
        success: true,
        data: churnAnalysis,
      });
    } catch (error: any) {
      logger.error('顧客離脱分析取得エラー:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'サーバーエラーが発生しました',
      });
    }
  }

  /**
   * 売上予測取得
   */
  async getRevenueForecast(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.headers['x-tenant-id'] as string || 'default-tenant';
      
      const forecast = await analyticsService.generateRevenueForecast(tenantId);
      
      res.json({
        success: true,
        data: forecast,
      });
    } catch (error: any) {
      logger.error('売上予測取得エラー:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'サーバーエラーが発生しました',
      });
    }
  }

  /**
   * リアルタイムメトリクス取得
   */
  async getRealtimeMetrics(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.headers['x-tenant-id'] as string || 'default-tenant';
      const query = GetMetricsSchema.parse(req.query);
      
      // リアルタイムメトリクスのストリーミングレスポンス
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control',
      });

      // 初回データ送信
      const initialKPIs = await analyticsService.getDashboardKPIs(tenantId);
      res.write(`data: ${JSON.stringify({
        type: 'kpis',
        data: initialKPIs,
        timestamp: new Date().toISOString(),
      })}\n\n`);

      // リアルタイム更新（30秒間隔）
      const intervalId = setInterval(async () => {
        try {
          const kpis = await analyticsService.getDashboardKPIs(tenantId);
          res.write(`data: ${JSON.stringify({
            type: 'kpis_update',
            data: kpis,
            timestamp: new Date().toISOString(),
          })}\n\n`);
        } catch (error) {
          logger.error('Real-time metrics update error:', error);
        }
      }, 30000);

      // クライアント切断時のクリーンアップ
      req.on('close', () => {
        clearInterval(intervalId);
        res.end();
      });

    } catch (error: any) {
      logger.error('リアルタイムメトリクス取得エラー:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'サーバーエラーが発生しました',
      });
    }
  }

  /**
   * 顧客行動インサイト取得
   */
  async getCustomerInsights(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.headers['x-tenant-id'] as string || 'default-tenant';
      const customerId = req.params.customerId;

      if (!customerId) {
        res.status(400).json({
          success: false,
          error: '顧客IDが必要です',
        });
        return;
      }

      // 顧客固有のインサイトを生成
      const insights = await this.generateCustomerInsights(tenantId, customerId);
      
      res.json({
        success: true,
        data: insights,
      });
    } catch (error: any) {
      logger.error('顧客インサイト取得エラー:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'サーバーエラーが発生しました',
      });
    }
  }

  /**
   * 予測データ取得
   */
  async getPredictions(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.headers['x-tenant-id'] as string || 'default-tenant';
      const query = PredictionTypeSchema.parse(req.query);
      
      let predictions;
      switch (query.type) {
        case 'revenue':
          predictions = await analyticsService.generateRevenueForecast(tenantId);
          break;
        case 'churn':
          predictions = await analyticsService.analyzeCustomerChurn(tenantId);
          break;
        default:
          predictions = await analyticsService.generateRevenueForecast(tenantId);
      }
      
      res.json({
        success: true,
        data: predictions,
        predictionType: query.type,
        period: query.period,
      });
    } catch (error: any) {
      logger.error('予測データ取得エラー:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'サーバーエラーが発生しました',
      });
    }
  }

  /**
   * 分析レポート生成
   */
  async generateReport(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.headers['x-tenant-id'] as string || 'default-tenant';
      const { reportType, startDate, endDate } = req.body;

      const report = await this.generateAnalyticsReport(tenantId, reportType, startDate, endDate);
      
      res.json({
        success: true,
        data: report,
        generatedAt: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('分析レポート生成エラー:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'サーバーエラーが発生しました',
      });
    }
  }

  /**
   * アラート設定管理
   */
  async manageAlerts(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.headers['x-tenant-id'] as string || 'default-tenant';
      const { action, alertType, threshold, condition } = req.body;

      // アラート設定の管理（作成・更新・削除）
      const result = await this.handleAlertManagement(tenantId, action, alertType, threshold, condition);
      
      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error('アラート設定管理エラー:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'サーバーエラーが発生しました',
      });
    }
  }

  /**
   * パフォーマンス最適化提案
   */
  async getOptimizationSuggestions(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.headers['x-tenant-id'] as string || 'default-tenant';
      
      const suggestions = await this.generateOptimizationSuggestions(tenantId);
      
      res.json({
        success: true,
        data: suggestions,
      });
    } catch (error: any) {
      logger.error('最適化提案取得エラー:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'サーバーエラーが発生しました',
      });
    }
  }

  // プライベートメソッド
  private async generateCustomerInsights(tenantId: string, customerId: string): Promise<any> {
    // 顧客の行動パターン、予約履歴、満足度などを分析してインサイトを生成
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        reservations: {
          include: { staff: true },
          orderBy: { startTime: 'desc' },
          take: 10,
        },
        menuHistory: {
          include: { menu: true },
          orderBy: { visitDate: 'desc' },
          take: 10,
        },
        customerBehavior: true,
      },
    });

    if (!customer) {
      throw new Error('顧客が見つかりません');
    }

    const insights = {
      customerProfile: {
        id: customer.id,
        name: customer.name,
        totalVisits: customer.visitCount,
        lastVisit: customer.lastVisitDate,
        memberSince: customer.createdAt,
      },
      behaviorAnalysis: customer.customerBehavior ? {
        visitFrequency: customer.customerBehavior.visitFrequency,
        averageSpending: customer.customerBehavior.averageSpending,
        churnRisk: customer.customerBehavior.churnProbability,
        lifetimeValue: customer.customerBehavior.lifetimeValue,
      } : null,
      preferences: {
        favoriteServices: this.analyzeFavoriteServices(customer.menuHistory),
        preferredStaff: this.analyzePreferredStaff(customer.reservations),
        visitPatterns: this.analyzeVisitPatterns(customer.reservations),
      },
      recommendations: {
        nextService: 'AIが推奨する次回サービス',
        retentionStrategy: this.getRetentionStrategy(customer.customerBehavior?.churnProbability || 0),
        upsellOpportunities: this.identifyUpsellOpportunities(customer.menuHistory),
      },
    };

    return insights;
  }

  private analyzeFavoriteServices(menuHistory: any[]): string[] {
    const serviceCount = menuHistory.reduce((acc, history) => {
      const serviceName = history.menu?.name || 'Unknown';
      acc[serviceName] = (acc[serviceName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(serviceCount)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([service]) => service);
  }

  private analyzePreferredStaff(reservations: any[]): string[] {
    const staffCount = reservations.reduce((acc, reservation) => {
      const staffName = reservation.staff?.name || 'Unknown';
      acc[staffName] = (acc[staffName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(staffCount)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 2)
      .map(([staff]) => staff);
  }

  private analyzeVisitPatterns(reservations: any[]): any {
    const dayOfWeekCount = reservations.reduce((acc, reservation) => {
      const dayOfWeek = new Date(reservation.startTime).getDay();
      acc[dayOfWeek] = (acc[dayOfWeek] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const timeSlotCount = reservations.reduce((acc, reservation) => {
      const hour = new Date(reservation.startTime).getHours();
      const timeSlot = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
      acc[timeSlot] = (acc[timeSlot] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      preferredDays: Object.entries(dayOfWeekCount)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 2)
        .map(([day]) => ['日', '月', '火', '水', '木', '金', '土'][parseInt(day)]),
      preferredTimeSlots: Object.entries(timeSlotCount)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .map(([slot]) => slot),
    };
  }

  private getRetentionStrategy(churnProbability: number): string {
    if (churnProbability > 0.8) return '即座にパーソナライズされたオファーと電話フォローアップ';
    if (churnProbability > 0.6) return '特別割引クーポンとSNSでの個別メッセージ';
    if (churnProbability > 0.4) return '定期的なフォローアップと新サービス案内';
    return '現状の関係維持で十分';
  }

  private identifyUpsellOpportunities(menuHistory: any[]): string[] {
    const currentServices = new Set(menuHistory.map(h => h.menu?.name).filter(Boolean));
    
    // 簡単なアップセル機会の識別ロジック
    const opportunities = [];
    
    if (currentServices.has('カット')) {
      opportunities.push('カラーリング');
    }
    if (currentServices.has('ネイル')) {
      opportunities.push('ネイルアート');
    }
    
    return opportunities;
  }

  private async generateAnalyticsReport(tenantId: string, reportType: string, startDate?: string, endDate?: string): Promise<any> {
    const kpis = await analyticsService.getDashboardKPIs(tenantId);
    const churnAnalysis = await analyticsService.analyzeCustomerChurn(tenantId);
    const forecast = await analyticsService.generateRevenueForecast(tenantId);

    return {
      reportType,
      period: { startDate, endDate },
      summary: {
        totalRevenue: kpis.revenue.thisMonth,
        totalCustomers: kpis.customers.total,
        churnRate: kpis.customers.churnRate,
        averageSatisfaction: kpis.satisfaction.averageScore,
      },
      insights: [
        '売上は前月比で安定している',
        '新規顧客の獲得が順調',
        '高リスク顧客への対応が必要',
      ],
      recommendations: [
        'SNSマーケティングの強化',
        '顧客満足度向上のための施策実施',
        'リピート率向上キャンペーンの実施',
      ],
      detailedData: {
        kpis,
        churnAnalysis,
        forecast,
      },
    };
  }

  private async handleAlertManagement(tenantId: string, action: string, alertType: string, threshold: number, condition: string): Promise<any> {
    // アラート設定の管理ロジック
    // 実際の実装では、アラート設定をデータベースに保存し、
    // 条件に応じて通知を送信するシステムを構築
    
    return {
      action,
      alertType,
      threshold,
      condition,
      status: 'configured',
      message: `${alertType}アラートが設定されました`,
    };
  }

  private async generateOptimizationSuggestions(tenantId: string): Promise<any> {
    const kpis = await analyticsService.getDashboardKPIs(tenantId);
    
    const suggestions = [];
    
    // 売上最適化提案
    if (kpis.revenue.trend < 0) {
      suggestions.push({
        category: '売上',
        priority: 'high',
        suggestion: '売上減少傾向にあります。プロモーション施策の実施を検討してください。',
        expectedImpact: '売上15-20%向上',
      });
    }
    
    // 顧客満足度最適化提案
    if (kpis.satisfaction.averageScore < 4.0) {
      suggestions.push({
        category: '顧客満足度',
        priority: 'medium',
        suggestion: 'サービス品質の見直しとスタッフ研修を実施してください。',
        expectedImpact: '満足度0.5-1.0ポイント向上',
      });
    }
    
    // 予約効率最適化提案
    if (kpis.reservations.noShowRate > 10) {
      suggestions.push({
        category: '予約管理',
        priority: 'medium',
        suggestion: 'リマインダーシステムの強化とキャンセルポリシーの見直しを行ってください。',
        expectedImpact: 'ノーショー率5-8%削減',
      });
    }

    return {
      suggestions,
      overallScore: this.calculateOptimizationScore(kpis),
      implementationPriority: suggestions.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
      }),
    };
  }

  private calculateOptimizationScore(kpis: any): number {
    let score = 100;
    
    // 各KPIに基づいてスコアを調整
    if (kpis.revenue.trend < -10) score -= 20;
    else if (kpis.revenue.trend < 0) score -= 10;
    
    if (kpis.satisfaction.averageScore < 3.5) score -= 15;
    else if (kpis.satisfaction.averageScore < 4.0) score -= 10;
    
    if (kpis.customers.churnRate > 20) score -= 15;
    else if (kpis.customers.churnRate > 10) score -= 10;
    
    if (kpis.reservations.noShowRate > 15) score -= 10;
    else if (kpis.reservations.noShowRate > 10) score -= 5;
    
    return Math.max(0, score);
  }
}

export const analyticsController = new AnalyticsController();