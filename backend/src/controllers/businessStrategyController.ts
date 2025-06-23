import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { BusinessAnalyticsService } from '../services/businessAnalyticsService';
import { checkFeatureFlag } from '../middleware/featureFlag';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { AuthenticatedRequest } from '../types/auth';

const prisma = new PrismaClient();

// 経営ダッシュボードの概要取得
export const getDashboardOverview = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.tenantId) {
      return res.status(401).json({ error: '認証が必要です' });
    }
    const tenantId = req.user.tenantId;
    const isEnabled = await checkFeatureFlag('premium_business_dashboard', tenantId);
    if (!isEnabled) {
      return res.status(403).json({ 
        error: 'プレミアム経営戦略ダッシュボードは現在利用できません',
        code: 'FEATURE_DISABLED'
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 本日の指標
    const todayMetrics = await prisma.businessMetrics.findUnique({
      where: {
        tenantId_metricDate: {
          tenantId,
          metricDate: today
        }
      }
    });

    // 本日のメトリクスがなければ計算
    if (!todayMetrics) {
      await BusinessAnalyticsService.calculateDailyMetrics(tenantId, today);
    }

    // 今月の集計
    const monthStart = startOfMonth(today);
    const monthMetrics = await prisma.businessMetrics.findMany({
      where: {
        tenantId,
        metricDate: { gte: monthStart, lte: today }
      }
    });

    // 先月同期間との比較
    const lastMonthStart = startOfMonth(subMonths(today, 1));
    const lastMonthEnd = new Date(lastMonthStart);
    lastMonthEnd.setDate(today.getDate());
    
    const lastMonthMetrics = await prisma.businessMetrics.findMany({
      where: {
        tenantId,
        metricDate: { gte: lastMonthStart, lte: lastMonthEnd }
      }
    });

    // 集計計算
    const currentMonthRevenue = monthMetrics.reduce((sum, m) => sum + m.dailyRevenue, 0);
    const lastMonthRevenue = lastMonthMetrics.reduce((sum, m) => sum + m.dailyRevenue, 0);
    const revenueGrowth = lastMonthRevenue > 0 
      ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : 0;

    // アクティブな目標
    const activeGoals = await prisma.businessGoal.findMany({
      where: {
        tenantId,
        status: 'ACTIVE',
        endDate: { gte: today }
      },
      orderBy: { endDate: 'asc' }
    });

    // 最新のインサイト
    const recentInsights = await prisma.businessInsight.findMany({
      where: {
        tenantId,
        dismissed: false,
        validUntil: { gte: today }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // 保持率計算
    const retentionRate = await BusinessAnalyticsService.calculateRetentionRate(tenantId);

    res.json({
      overview: {
        today: {
          revenue: todayMetrics?.dailyRevenue || 0,
          newCustomers: todayMetrics?.newCustomers || 0,
          avgServiceTime: todayMetrics?.avgServiceTime || 0
        },
        month: {
          revenue: currentMonthRevenue,
          revenueGrowth,
          daysElapsed: monthMetrics.length,
          avgDailyRevenue: monthMetrics.length > 0 ? currentMonthRevenue / monthMetrics.length : 0
        },
        customer: {
          retentionRate,
          totalNewCustomers: monthMetrics.reduce((sum, m) => sum + m.newCustomers, 0)
        },
        goals: activeGoals.map(g => ({
          id: g.id,
          name: g.name,
          progress: g.progress,
          daysRemaining: Math.ceil((g.endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        })),
        insights: recentInsights.map(i => ({
          id: i.id,
          type: i.type,
          title: i.title,
          importance: i.importance
        }))
      }
    });

  } catch (error) {
    console.error('Get dashboard overview error:', error);
    res.status(500).json({ 
      error: 'ダッシュボード情報の取得に失敗しました',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// 詳細な経営指標取得
export const getDetailedMetrics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.tenantId) {
      return res.status(401).json({ error: '認証が必要です' });
    }
    const tenantId = req.user.tenantId;
    const isEnabled = await checkFeatureFlag('premium_business_dashboard', tenantId);
    if (!isEnabled) {
      return res.status(403).json({ 
        error: 'プレミアム経営戦略ダッシュボードは現在利用できません',
        code: 'FEATURE_DISABLED'
      });
    }

    const { period = '30', startDate, endDate } = req.query;
    let start: Date, end: Date;

    if (startDate && endDate) {
      start = new Date(startDate as string);
      end = new Date(endDate as string);
    } else {
      end = new Date();
      start = new Date();
      start.setDate(start.getDate() - Number(period));
    }

    const metrics = await prisma.businessMetrics.findMany({
      where: {
        tenantId,
        metricDate: { gte: start, lte: end }
      },
      orderBy: { metricDate: 'asc' }
    });

    // 時系列データの整形
    const timeSeriesData = {
      dates: metrics.map(m => m.metricDate),
      revenue: metrics.map(m => m.dailyRevenue),
      newCustomers: metrics.map(m => m.newCustomers),
      avgServiceTime: metrics.map(m => m.avgServiceTime),
      staffProductivity: metrics.map(m => m.staffProductivity)
    };

    // 集計統計
    const statistics = {
      totalRevenue: metrics.reduce((sum, m) => sum + m.dailyRevenue, 0),
      avgDailyRevenue: metrics.length > 0 ? metrics.reduce((sum, m) => sum + m.dailyRevenue, 0) / metrics.length : 0,
      totalNewCustomers: metrics.reduce((sum, m) => sum + m.newCustomers, 0),
      avgNewCustomersPerDay: metrics.length > 0 ? metrics.reduce((sum, m) => sum + m.newCustomers, 0) / metrics.length : 0,
      avgServiceTime: metrics.length > 0 ? metrics.reduce((sum, m) => sum + m.avgServiceTime, 0) / metrics.length : 0
    };

    res.json({
      period: { start, end },
      timeSeriesData,
      statistics,
      dataPoints: metrics.length
    });

  } catch (error) {
    console.error('Get detailed metrics error:', error);
    res.status(500).json({ 
      error: '詳細指標の取得に失敗しました',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// ビジネスインサイト取得
export const getBusinessInsights = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.tenantId) {
      return res.status(401).json({ error: '認証が必要です' });
    }
    const tenantId = req.user.tenantId;
    const isEnabled = await checkFeatureFlag('premium_business_dashboard', tenantId);
    if (!isEnabled) {
      return res.status(403).json({ 
        error: 'プレミアム経営戦略ダッシュボードは現在利用できません',
        code: 'FEATURE_DISABLED'
      });
    }

    const { category, importance, includeDismissed = false } = req.query;

    const whereClause: any = {
      tenantId,
      validUntil: { gte: new Date() }
    };

    if (!includeDismissed) {
      whereClause.dismissed = false;
    }

    if (category) {
      whereClause.category = category as string;
    }

    if (importance) {
      whereClause.importance = importance as string;
    }

    const insights = await prisma.businessInsight.findMany({
      where: whereClause,
      include: {
        linkedActions: {
          include: {
            action: true
          }
        }
      },
      orderBy: [
        { importance: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    res.json({
      insights: insights.map(insight => ({
        ...insight,
        analysisData: insight.analysisData ? JSON.parse(insight.analysisData) : null,
        evidence: insight.evidence ? JSON.parse(insight.evidence) : null,
        suggestedActions: insight.suggestedActions ? JSON.parse(insight.suggestedActions) : null,
        linkedActions: insight.linkedActions.map(link => link.action)
      }))
    });

  } catch (error) {
    console.error('Get business insights error:', error);
    res.status(500).json({ 
      error: 'インサイトの取得に失敗しました',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// 競合分析データ取得
export const getCompetitorAnalysis = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.tenantId) {
      return res.status(401).json({ error: '認証が必要です' });
    }
    const tenantId = req.user.tenantId;
    const isEnabled = await checkFeatureFlag('premium_business_dashboard', tenantId);
    if (!isEnabled) {
      return res.status(403).json({ 
        error: 'プレミアム経営戦略ダッシュボードは現在利用できません',
        code: 'FEATURE_DISABLED'
      });
    }

    const competitors = await prisma.competitorAnalysis.findMany({
      where: { tenantId },
      orderBy: { distance: 'asc' }
    });

    // SWOT分析のサマリー
    const swotSummary: {
      strengths: string[];
      weaknesses: string[];
      opportunities: string[];
      threats: string[];
    } = {
      strengths: [],
      weaknesses: [],
      opportunities: [],
      threats: []
    };

    competitors.forEach(comp => {
      if (comp.strengthPoints) swotSummary.strengths.push(...(JSON.parse(comp.strengthPoints) as string[]));
      if (comp.weaknessPoints) swotSummary.weaknesses.push(...(JSON.parse(comp.weaknessPoints) as string[]));
      if (comp.opportunities) swotSummary.opportunities.push(...(JSON.parse(comp.opportunities) as string[]));
      if (comp.threats) swotSummary.threats.push(...(JSON.parse(comp.threats) as string[]));
    });

    res.json({
      competitors: competitors.map(comp => ({
        ...comp,
        services: comp.services ? JSON.parse(comp.services) as string[] : [],
        uniqueServices: comp.uniqueServices ? JSON.parse(comp.uniqueServices) as string[] : [],
        strengthPoints: comp.strengthPoints ? JSON.parse(comp.strengthPoints) as string[] : [],
        weaknessPoints: comp.weaknessPoints ? JSON.parse(comp.weaknessPoints) as string[] : [],
        threats: comp.threats ? JSON.parse(comp.threats) as string[] : [],
        opportunities: comp.opportunities ? JSON.parse(comp.opportunities) as string[] : []
      })),
      swotSummary,
      totalCompetitors: competitors.length
    });

  } catch (error) {
    console.error('Get competitor analysis error:', error);
    res.status(500).json({ 
      error: '競合分析データの取得に失敗しました',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// 戦略的アクション管理
export const getStrategicActions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.tenantId) {
      return res.status(401).json({ error: '認証が必要です' });
    }
    const tenantId = req.user.tenantId;
    const isEnabled = await checkFeatureFlag('premium_business_dashboard', tenantId);
    if (!isEnabled) {
      return res.status(403).json({ 
        error: 'プレミアム経営戦略ダッシュボードは現在利用できません',
        code: 'FEATURE_DISABLED'
      });
    }

    const { status = 'PLANNED,IN_PROGRESS', priority } = req.query;
    const statusArray = (status as string).split(',');

    const whereClause: any = {
      tenantId,
      status: { in: statusArray }
    };

    if (priority) {
      whereClause.priority = priority as string;
    }

    const actions = await prisma.strategicAction.findMany({
      where: whereClause,
      include: {
        insights: {
          include: {
            insight: true
          }
        }
      },
      orderBy: [
        { priority: 'asc' },
        { dueDate: 'asc' }
      ]
    });

    res.json({
      actions: actions.map(action => ({
        ...action,
        relatedInsights: action.insights.map(link => link.insight),
        daysRemaining: Math.ceil((action.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      }))
    });

  } catch (error) {
    console.error('Get strategic actions error:', error);
    res.status(500).json({ 
      error: '戦略的アクションの取得に失敗しました',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// アクションステータス更新
export const updateActionStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.tenantId) {
      return res.status(401).json({ error: '認証が必要です' });
    }
    const tenantId = req.user.tenantId;
    const isEnabled = await checkFeatureFlag('premium_business_dashboard', tenantId);
    if (!isEnabled) {
      return res.status(403).json({ 
        error: 'プレミアム経営戦略ダッシュボードは現在利用できません',
        code: 'FEATURE_DISABLED'
      });
    }

    const { actionId } = req.params;
    const { status, notes, actualImpact } = req.body;

    const updateData: any = { status };
    if (notes) updateData.notes = notes;
    if (actualImpact !== undefined) updateData.actualImpact = actualImpact;
    if (status === 'COMPLETED') updateData.completedAt = new Date();

    const action = await prisma.strategicAction.update({
      where: { id: actionId },
      data: updateData
    });

    res.json({
      message: 'アクションステータスを更新しました',
      action
    });

  } catch (error) {
    console.error('Update action status error:', error);
    res.status(500).json({ 
      error: 'アクションステータスの更新に失敗しました',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// 経営目標の設定
export const setBusinessGoal = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.tenantId) {
      return res.status(401).json({ error: '認証が必要です' });
    }
    const tenantId = req.user.tenantId;
    const isEnabled = await checkFeatureFlag('premium_business_dashboard', tenantId);
    if (!isEnabled) {
      return res.status(403).json({ 
        error: 'プレミアム経営戦略ダッシュボードは現在利用できません',
        code: 'FEATURE_DISABLED'
      });
    }

    const {
      name,
      description,
      metric,
      targetValue,
      period,
      startDate,
      endDate,
      strategies,
      milestones
    } = req.body;

    const goal = await prisma.businessGoal.create({
      data: {
        tenantId,
        name,
        description,
        metric,
        targetValue: parseFloat(targetValue),
        period,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        strategies: strategies ? JSON.stringify(strategies) : null,
        milestones: milestones ? JSON.stringify(milestones) : null
      }
    });

    res.status(201).json({
      message: '経営目標を設定しました',
      goal
    });

  } catch (error) {
    console.error('Set business goal error:', error);
    res.status(500).json({ 
      error: '経営目標の設定に失敗しました',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// AIによる新規インサイト生成
export const generateNewInsights = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.tenantId) {
      return res.status(401).json({ error: '認証が必要です' });
    }
    const tenantId = req.user.tenantId;
    const isEnabled = await checkFeatureFlag('premium_business_dashboard', tenantId);
    if (!isEnabled) {
      return res.status(403).json({ 
        error: 'プレミアム経営戦略ダッシュボードは現在利用できません',
        code: 'FEATURE_DISABLED'
      });
    }

    // AI分析を実行
    const insights = await BusinessAnalyticsService.generateBusinessInsights(tenantId);

    // 提案されるアクションも生成
    await BusinessAnalyticsService.suggestStrategicActions(tenantId);

    res.json({
      message: `${insights.length}個の新しいインサイトを生成しました`,
      insights
    });

  } catch (error) {
    console.error('Generate insights error:', error);
    res.status(500).json({ 
      error: 'インサイト生成に失敗しました',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// 経営レポート生成
export const generateManagementReport = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.tenantId) {
      return res.status(401).json({ error: '認証が必要です' });
    }
    const tenantId = req.user.tenantId;
    const isEnabled = await checkFeatureFlag('premium_business_dashboard', tenantId);
    if (!isEnabled) {
      return res.status(403).json({ 
        error: 'プレミアム経営戦略ダッシュボードは現在利用できません',
        code: 'FEATURE_DISABLED'
      });
    }

    const { reportType = 'MONTHLY' } = req.query;

    const report = await BusinessAnalyticsService.generateManagementReport(
      tenantId,
      reportType as 'DAILY' | 'WEEKLY' | 'MONTHLY'
    );

    res.json({
      message: 'レポートを生成しました',
      report: {
        ...report,
        metrics: JSON.parse(report.metrics) as any,
        insights: JSON.parse(report.insights) as any,
        recommendations: JSON.parse(report.recommendations) as any,
        aiAnalysis: report.aiAnalysis ? JSON.parse(report.aiAnalysis) as any : null
      }
    });

  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({ 
      error: 'レポート生成に失敗しました',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};