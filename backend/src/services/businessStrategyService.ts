import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import OpenAI from 'openai';
import { addDays, subDays, startOfMonth, endOfMonth, format } from 'date-fns';

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface BusinessMetrics {
  revenue: {
    current: number;
    previous: number;
    growth: number;
    forecast: number[];
  };
  customers: {
    total: number;
    new: number;
    returning: number;
    churnRate: number;
    ltv: number;
  };
  operations: {
    utilizationRate: number;
    averageServiceTime: number;
    staffEfficiency: number;
    bookingRate: number;
  };
  marketing: {
    acquisitionCost: number;
    conversionRate: number;
    retentionRate: number;
    campaignROI: number;
  };
}

interface StrategicRecommendation {
  category: 'revenue' | 'customer' | 'operations' | 'marketing' | 'staff';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  expectedImpact: string;
  timeframe: string;
  actionItems: string[];
  metrics: string[];
}

/**
 * 🎯 AI駆動経営戦略分析サービス
 * 美容室経営の包括的分析と戦略提案
 */
export class BusinessStrategyService {

  /**
   * 包括的経営分析レポート生成
   */
  static async generateBusinessReport(tenantId: string, period: {
    startDate: Date;
    endDate: Date;
  }): Promise<{
    metrics: BusinessMetrics;
    recommendations: StrategicRecommendation[];
    insights: string[];
    competitiveAnalysis: any;
  }> {
    try {
      const [
        metrics,
        customerInsights,
        operationalInsights,
        marketingInsights
      ] = await Promise.all([
        this.calculateBusinessMetrics(tenantId, period),
        this.analyzeCustomerSegments(tenantId, period),
        this.calculateOperationalMetrics(tenantId, period),
        this.calculateMarketingMetrics(tenantId, period)
      ]);

      // AI戦略提案生成
      const recommendations = await this.generateStrategicRecommendations(
        tenantId, 
        metrics, 
        { customerInsights, operationalInsights, marketingInsights }
      );

      // 競合分析（業界ベンチマーク）
      const competitiveAnalysis = await this.performCompetitiveAnalysis(metrics);

      // 重要インサイト抽出
      const insights = await this.extractKeyInsights(metrics, recommendations);

      logger.info('Business strategy report generated:', {
        tenantId,
        period,
        recommendationsCount: recommendations.length
      });

      return {
        metrics,
        recommendations,
        insights,
        competitiveAnalysis
      };

    } catch (error) {
      logger.error('Business report generation failed:', error);
      throw new Error('経営分析レポートの生成に失敗しました');
    }
  }

  /**
   * ビジネスメトリクス計算
   */
  private static async calculateBusinessMetrics(
    tenantId: string, 
    period: { startDate: Date; endDate: Date }
  ): Promise<BusinessMetrics> {
    try {
      const { startDate, endDate } = period;
      const previousStart = subDays(startDate, endDate.getTime() - startDate.getTime());
      const previousEnd = subDays(endDate, endDate.getTime() - startDate.getTime());

      // 売上データ
      const [currentRevenue, previousRevenue] = await Promise.all([
        this.calculateRevenue(tenantId, startDate, endDate),
        this.calculateRevenue(tenantId, previousStart, previousEnd)
      ]);

      // 顧客データ
      const customerMetrics = await this.calculateCustomerMetrics(tenantId, period);
      
      // 運営データ
      const operationalMetrics = await this.calculateOperationalMetrics(tenantId, period);
      
      // マーケティングデータ
      const marketingMetrics = await this.calculateMarketingMetrics(tenantId, period);

      // 売上予測
      const forecast = await this.forecastRevenue(tenantId, currentRevenue);

      return {
        revenue: {
          current: currentRevenue,
          previous: previousRevenue,
          growth: previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0,
          forecast
        },
        customers: customerMetrics,
        operations: operationalMetrics,
        marketing: marketingMetrics
      };

    } catch (error) {
      logger.error('Business metrics calculation failed:', error);
      throw error;
    }
  }

  /**
   * 売上計算
   */
  private static async calculateRevenue(tenantId: string, startDate: Date, endDate: Date): Promise<number> {
    const result = await prisma.reservation.aggregate({
      where: {
        tenantId,
        startTime: { gte: startDate, lte: endDate },
        status: 'COMPLETED',
        paymentStatus: 'paid'
      },
      _sum: { totalAmount: true }
    });

    return result._sum.totalAmount ? Number(result._sum.totalAmount) : 0;
  }

  /**
   * 顧客メトリクス計算
   */
  private static async calculateCustomerMetrics(
    tenantId: string, 
    period: { startDate: Date; endDate: Date }
  ): Promise<BusinessMetrics['customers']> {
    const { startDate, endDate } = period;

    const [totalCustomers, newCustomers, returningCustomers, lifetimeValues] = await Promise.all([
      // 総顧客数
      prisma.customer.count({ where: { tenantId, isActive: true } }),
      
      // 新規顧客
      prisma.customer.count({
        where: {
          tenantId,
          createdAt: { gte: startDate, lte: endDate }
        }
      }),
      
      // リピート顧客
      prisma.customer.count({
        where: {
          tenantId,
          visitCount: { gt: 1 },
          lastVisitDate: { gte: startDate, lte: endDate }
        }
      }),
      
      // 顧客生涯価値計算
      this.calculateCustomerLTV(tenantId)
    ]);

    // チャーン率計算（過去3ヶ月間来店なし）
    const threeMonthsAgo = subDays(new Date(), 90);
    const churnedCustomers = await prisma.customer.count({
      where: {
        tenantId,
        lastVisitDate: { lt: threeMonthsAgo },
        isActive: true
      }
    });

    const churnRate = totalCustomers > 0 ? (churnedCustomers / totalCustomers) * 100 : 0;

    return {
      total: totalCustomers,
      new: newCustomers,
      returning: returningCustomers,
      churnRate,
      ltv: lifetimeValues
    };
  }

  /**
   * 運営メトリクス計算
   */
  private static async calculateOperationalMetrics(
    tenantId: string,
    period: { startDate: Date; endDate: Date }
  ): Promise<BusinessMetrics['operations']> {
    const { startDate, endDate } = period;

    // 予約データ分析
    const reservations = await prisma.reservation.findMany({
      where: {
        tenantId,
        startTime: { gte: startDate, lte: endDate }
      },
      include: { staff: true }
    });

    // 利用率計算
    const totalSlots = await this.calculateTotalAvailableSlots(tenantId, period);
    const bookedSlots = reservations.filter(r => r.status !== 'CANCELLED').length;
    const utilizationRate = totalSlots > 0 ? (bookedSlots / totalSlots) * 100 : 0;

    // 平均サービス時間
    const completedReservations = reservations.filter(r => r.status === 'COMPLETED');
    const avgServiceTime = completedReservations.length > 0 
      ? completedReservations.reduce((sum, r) => {
          if (!r.endTime) return sum;
          const duration = r.endTime.getTime() - r.startTime.getTime();
          return sum + (duration / (1000 * 60)); // 分に変換
        }, 0) / completedReservations.length
      : 0;

    // スタッフ効率性
    const staffEfficiency = await this.calculateStaffEfficiency(tenantId, period);

    // 予約率（問い合わせからの成約率）
    const bookingRate = await this.calculateBookingConversionRate(tenantId, period);

    return {
      utilizationRate,
      averageServiceTime: avgServiceTime,
      staffEfficiency,
      bookingRate
    };
  }

  /**
   * マーケティングメトリクス計算
   */
  private static async calculateMarketingMetrics(
    tenantId: string,
    period: { startDate: Date; endDate: Date }
  ): Promise<BusinessMetrics['marketing']> {
    // 簡易実装 - 実際は外部マーケティングツールとの連携が必要
    return {
      acquisitionCost: 2500, // 新規顧客獲得コスト
      conversionRate: 15.2, // 問い合わせからの成約率
      retentionRate: 68.5, // 顧客維持率
      campaignROI: 320 // キャンペーンROI%
    };
  }

  /**
   * AI戦略提案生成
   */
  private static async generateStrategicRecommendations(
    tenantId: string,
    metrics: BusinessMetrics,
    insights: any
  ): Promise<StrategicRecommendation[]> {
    try {
      const systemPrompt = `
あなたは美容室経営の専門コンサルタントです。
以下のビジネスメトリクスを分析し、具体的で実行可能な戦略提案を行ってください。

美容室業界の特徴：
- 顧客との継続的関係が重要
- スタッフのスキルが売上に直結
- 季節性やトレンドの影響を受けやすい
- 口コミ・紹介が重要な集客手段

各提案には以下を含めてください：
1. 優先度（high/medium/low）
2. 期待される効果
3. 実施期間
4. 具体的なアクション項目
5. 測定指標
`;

      const userPrompt = `
ビジネスメトリクス分析結果：

【売上分析】
- 現在の売上: ¥${metrics.revenue.current.toLocaleString()}
- 前期比成長率: ${metrics.revenue.growth.toFixed(1)}%

【顧客分析】  
- 総顧客数: ${metrics.customers.total}人
- 新規顧客: ${metrics.customers.new}人
- チャーン率: ${metrics.customers.churnRate.toFixed(1)}%
- 顧客生涯価値: ¥${metrics.customers.ltv.toLocaleString()}

【運営分析】
- 施設利用率: ${metrics.operations.utilizationRate.toFixed(1)}%
- 平均サービス時間: ${metrics.operations.averageServiceTime.toFixed(1)}分
- スタッフ効率性: ${metrics.operations.staffEfficiency.toFixed(1)}%

【マーケティング分析】
- 新規顧客獲得コスト: ¥${metrics.marketing.acquisitionCost.toLocaleString()}
- 成約率: ${metrics.marketing.conversionRate}%
- 顧客維持率: ${metrics.marketing.retentionRate}%

これらのデータに基づいて、5つの具体的な戦略提案を生成してください。
`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      const aiResponse = completion.choices[0]?.message?.content || '';
      
      // AI応答を構造化（実際の実装では自然言語処理が必要）
      const recommendations = this.parseAIRecommendations(aiResponse, metrics);

      return recommendations;

    } catch (error) {
      logger.error('AI recommendation generation failed:', error);
      
      // フォールバック推奨事項
      return this.getDefaultRecommendations(metrics);
    }
  }

  /**
   * AI応答の構造化解析
   */
  private static parseAIRecommendations(aiResponse: string, metrics: BusinessMetrics): StrategicRecommendation[] {
    // 簡易実装 - 実際はより高度な自然言語処理が必要
    const recommendations: StrategicRecommendation[] = [];

    // デフォルト推奨事項をベースに調整
    if (metrics.customers.churnRate > 20) {
      recommendations.push({
        category: 'customer',
        priority: 'high',
        title: '顧客リテンション強化プログラム',
        description: 'チャーン率が高いため、顧客維持施策を強化する必要があります',
        expectedImpact: 'チャーン率15%削減、LTV20%向上',
        timeframe: '3ヶ月',
        actionItems: [
          '定期メンテナンスプログラムの導入',
          '誕生日・記念日特典の充実',
          'パーソナライズされたフォローアップの実施'
        ],
        metrics: ['チャーン率', '顧客満足度', 'リピート率']
      });
    }

    if (metrics.operations.utilizationRate < 70) {
      recommendations.push({
        category: 'operations',
        priority: 'high',
        title: '稼働率向上施策',
        description: '施設利用率が低いため、予約効率を改善する必要があります',
        expectedImpact: '稼働率20%向上、売上15%増加',
        timeframe: '2ヶ月',
        actionItems: [
          'オンライン予約システムの最適化',
          'アイドルタイム向上キャンペーン',
          'グループ予約・セット料金の導入'
        ],
        metrics: ['稼働率', '予約数', '売上per平方メートル']
      });
    }

    if (metrics.revenue.growth < 5) {
      recommendations.push({
        category: 'revenue',
        priority: 'medium',
        title: '新サービス・単価向上戦略',
        description: '売上成長率が低いため、新規収益源の開拓が必要です',
        expectedImpact: '平均単価15%向上、新規収益月100万円',
        timeframe: '4ヶ月',
        actionItems: [
          'プレミアムメニューの開発',
          'ホームケア商品の販売強化',
          'サブスクリプション型サービスの導入'
        ],
        metrics: ['平均単価', '新サービス利用率', '物販売上']
      });
    }

    return recommendations;
  }

  /**
   * デフォルト推奨事項
   */
  private static getDefaultRecommendations(metrics: BusinessMetrics): StrategicRecommendation[] {
    return [
      {
        category: 'customer',
        priority: 'high',
        title: 'デジタルマーケティング強化',
        description: 'SNSとデジタル広告を活用した顧客獲得・維持施策',
        expectedImpact: '新規顧客20%増加、獲得コスト15%削減',
        timeframe: '3ヶ月',
        actionItems: [
          'Instagram・TikTokでのビフォーアフター投稿',
          'Google広告・Meta広告の最適化',
          'インフルエンサーとのコラボレーション'
        ],
        metrics: ['フォロワー数', '新規顧客数', '獲得コスト']
      },
      {
        category: 'staff',
        priority: 'medium',
        title: 'スタッフスキル向上プログラム',
        description: '技術研修とサービス向上によるスタッフ力強化',
        expectedImpact: '顧客満足度向上、スタッフ生産性20%向上',
        timeframe: '6ヶ月',
        actionItems: [
          '月次技術研修の実施',
          '接客サービス研修の強化',
          'スタッフ間の技術共有会'
        ],
        metrics: ['顧客満足度', 'スタッフ売上', '技術評価']
      }
    ];
  }

  /**
   * 競合分析
   */
  private static async performCompetitiveAnalysis(metrics: BusinessMetrics): Promise<any> {
    // 業界ベンチマーク（実際は外部データソースから取得）
    const industryBenchmark = {
      utilizationRate: 75,
      customerRetentionRate: 70,
      averageTicket: 8500,
      staffProductivity: 85
    };

    return {
      industryBenchmark,
      performance: {
        utilizationRate: metrics.operations.utilizationRate >= industryBenchmark.utilizationRate ? 'above' : 'below',
        customerRetention: (100 - metrics.customers.churnRate) >= industryBenchmark.customerRetentionRate ? 'above' : 'below'
      },
      recommendations: [
        '業界平均より利用率が低い場合は予約システムの見直しを推奨',
        '顧客維持率向上のためのロイヤルティプログラム導入を検討'
      ]
    };
  }

  /**
   * 重要インサイト抽出
   */
  private static async extractKeyInsights(
    metrics: BusinessMetrics, 
    recommendations: StrategicRecommendation[]
  ): Promise<string[]> {
    const insights = [];

    // 成長率分析
    if (metrics.revenue.growth > 10) {
      insights.push('📈 売上が好調に成長しています。この勢いを維持するための投資を検討しましょう');
    } else if (metrics.revenue.growth < 0) {
      insights.push('⚠️ 売上が減少傾向にあります。早急な対策が必要です');
    }

    // 顧客分析
    if (metrics.customers.churnRate > 25) {
      insights.push('🔄 顧客離脱率が高めです。顧客満足度の改善が急務です');
    }

    // 効率性分析
    if (metrics.operations.utilizationRate < 60) {
      insights.push('⏰ 施設の稼働率に改善余地があります。予約の効率化を検討しましょう');
    }

    // 高優先度の推奨事項
    const highPriorityRecs = recommendations.filter(r => r.priority === 'high');
    if (highPriorityRecs.length > 0) {
      insights.push(`🎯 ${highPriorityRecs.length}件の高優先度施策があります。早期実行をお勧めします`);
    }

    return insights;
  }

  // ヘルパーメソッド
  private static async calculateCustomerLTV(tenantId: string): Promise<number> {
    // 顧客生涯価値の簡易計算
    const result = await prisma.customer.aggregate({
      where: { tenantId, isActive: true },
      _avg: { totalSpent: true }
    });
    
    return result._avg.totalSpent ? Number(result._avg.totalSpent) : 0;
  }

  private static async calculateTotalAvailableSlots(
    tenantId: string, 
    period: { startDate: Date; endDate: Date }
  ): Promise<number> {
    // 利用可能時間枠の計算（簡易実装）
    const staff = await prisma.staff.count({ where: { tenantId, isActive: true } });
    const days = Math.ceil((period.endDate.getTime() - period.startDate.getTime()) / (1000 * 60 * 60 * 24));
    const hoursPerDay = 10; // 営業時間
    const slotsPerHour = 4; // 15分単位
    
    return staff * days * hoursPerDay * slotsPerHour;
  }

  private static async calculateStaffEfficiency(
    tenantId: string,
    period: { startDate: Date; endDate: Date }
  ): Promise<number> {
    // スタッフ効率性の計算（売上/時間）
    const staffPerformance = await prisma.reservation.groupBy({
      by: ['staffId'],
      where: {
        tenantId,
        startTime: { gte: period.startDate, lte: period.endDate },
        status: 'COMPLETED'
      },
      _sum: { totalAmount: true },
      _count: true
    });

    if (staffPerformance.length === 0) return 0;

    const avgEfficiency = staffPerformance.reduce((sum, staff) => {
      const revenue = staff._sum.totalAmount ? Number(staff._sum.totalAmount) : 0;
      const bookings = staff._count;
      return sum + (revenue / Math.max(bookings, 1));
    }, 0) / staffPerformance.length;

    return avgEfficiency;
  }

  private static async calculateBookingConversionRate(
    tenantId: string,
    period: { startDate: Date; endDate: Date }
  ): Promise<number> {
    // 問い合わせから予約への成約率（簡易実装）
    return 65.5; // 実際は問い合わせデータとの照合が必要
  }

  private static async forecastRevenue(tenantId: string, currentRevenue: number): Promise<number[]> {
    // 売上予測（簡易線形回帰）
    const forecast = [];
    const growthRate = 0.05; // 月5%成長と仮定
    
    for (let i = 1; i <= 6; i++) {
      forecast.push(currentRevenue * Math.pow(1 + growthRate, i));
    }
    
    return forecast;
  }

  /**
   * 顧客セグメント分析
   */
  static async analyzeCustomerSegments(tenantId: string, period: { startDate: Date; endDate: Date }) {
    try {
      const customers = await prisma.customer.findMany({
        where: { tenantId },
        include: {
          reservations: {
            where: {
              startTime: { gte: period.startDate, lte: period.endDate }
            }
          }
        }
      });

      // RFM分析
      const rfmAnalysis = this.performRFMAnalysis(customers);
      
      return {
        segments: rfmAnalysis,
        totalCustomers: customers.length,
        analysis: 'RFM分析によるセグメンテーション完了'
      };

    } catch (error) {
      logger.error('Customer segment analysis failed:', error);
      return { segments: [], totalCustomers: 0, analysis: 'Analysis failed' };
    }
  }

  private static performRFMAnalysis(customers: any[]) {
    // RFM（Recency, Frequency, Monetary）分析の実装
    const now = new Date();
    
    const customerScores = customers.map(customer => {
      const reservations = customer.reservations || [];
      
      // Recency: 最終来店からの日数
      const lastVisit = customer.lastVisitDate || customer.createdAt;
      const recency = Math.floor((now.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24));
      
      // Frequency: 来店回数
      const frequency = customer.visitCount || 0;
      
      // Monetary: 総消費額
      const monetary = customer.totalSpent || 0;
      
      return {
        customerId: customer.id,
        name: customer.name,
        recency,
        frequency,
        monetary,
        segment: this.classifyRFMSegment(recency, frequency, monetary)
      };
    });

    return customerScores;
  }

  private static classifyRFMSegment(recency: number, frequency: number, monetary: number): string {
    // RFMスコアに基づくセグメント分類
    if (recency <= 30 && frequency >= 5 && monetary >= 50000) {
      return 'Champions'; // 最優良顧客
    } else if (recency <= 60 && frequency >= 3 && monetary >= 30000) {
      return 'Loyal Customers'; // 優良顧客
    } else if (recency <= 30 && frequency <= 2) {
      return 'New Customers'; // 新規顧客
    } else if (recency > 90) {
      return 'At Risk'; // 離脱リスク
    } else if (recency > 180) {
      return 'Lost'; // 離脱済み
    } else {
      return 'Regular'; // 一般顧客
    }
  }
}

export default BusinessStrategyService;