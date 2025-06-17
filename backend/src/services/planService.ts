import { PrismaClient } from '@prisma/client';
import { 
  PlanType, 
  PlanConfig, 
  PLAN_CONFIGS, 
  UsageData, 
  UsageLimits,
  FeatureCategory,
  isPlanHigherOrEqual,
  getRequiredPlanForFeature,
  PlanRestrictionError
} from '../types/plans';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export class PlanService {
  /**
   * テナントのプラン情報取得
   */
  static async getTenantPlan(tenantId: string): Promise<PlanConfig> {
    try {
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { plan: true }
      });

      if (!tenant) {
        throw new Error('Tenant not found');
      }

      const planType = tenant.plan as PlanType;
      return PLAN_CONFIGS[planType] || PLAN_CONFIGS.light;
    } catch (error) {
      logger.error('Failed to get tenant plan:', error);
      return PLAN_CONFIGS.light; // デフォルトはライトプラン
    }
  }

  /**
   * プラン変更
   */
  static async changePlan(tenantId: string, newPlan: PlanType): Promise<boolean> {
    try {
      await prisma.tenant.update({
        where: { id: tenantId },
        data: { plan: newPlan }
      });

      logger.info(`Plan changed for tenant ${tenantId} to ${newPlan}`);
      return true;
    } catch (error) {
      logger.error('Failed to change plan:', error);
      return false;
    }
  }

  /**
   * 機能アクセス可能性チェック
   */
  static async canAccessFeature(
    tenantId: string, 
    feature: FeatureCategory
  ): Promise<boolean> {
    try {
      const planConfig = await this.getTenantPlan(tenantId);
      return planConfig.features.includes(feature);
    } catch (error) {
      logger.error('Failed to check feature access:', error);
      return false;
    }
  }

  /**
   * 使用量制限チェック
   */
  static async checkUsageLimit(
    tenantId: string,
    limitType: keyof UsageLimits,
    currentValue: number
  ): Promise<boolean> {
    try {
      const planConfig = await this.getTenantPlan(tenantId);
      const limit = planConfig.limits[limitType];
      
      // -1は無制限を意味する
      if (limit === -1) return true;
      
      return currentValue < limit;
    } catch (error) {
      logger.error('Failed to check usage limit:', error);
      return false;
    }
  }

  /**
   * 現在の使用量取得
   */
  static async getCurrentUsage(tenantId: string): Promise<UsageData> {
    try {
      const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM

      // 実際の使用量をデータベースから取得
      const [
        staffCount,
        customerCount,
        reservationCount,
        // 今月のリマインダー送信数（AI返信の代替）
        aiRepliesUsed,
        storageUsed
      ] = await Promise.all([
        prisma.staff.count({ where: { tenantId, isActive: true } }),
        prisma.customer.count({ where: { tenantId } }),
        this.getMonthlyReservationCount(tenantId),
        this.getMonthlyAIRepliesCount(tenantId),
        this.getStorageUsage(tenantId)
      ]);

      return {
        tenantId,
        month: currentMonth,
        staffCount,
        customerCount,
        reservationCount,
        aiRepliesUsed,
        exportsUsed: 0, // TODO: エクスポート履歴から取得
        bulkMessagesUsed: 0, // TODO: 一括メッセージ履歴から取得
        storageUsedGB: storageUsed,
        apiCallsToday: 0, // TODO: API使用量から取得
        lastUpdated: new Date()
      };
    } catch (error) {
      logger.error('Failed to get current usage:', error);
      throw error;
    }
  }

  /**
   * 今月の予約数取得
   */
  private static async getMonthlyReservationCount(tenantId: string): Promise<number> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    return await prisma.reservation.count({
      where: {
        tenantId,
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      }
    });
  }

  /**
   * 今月のAI返信数取得（自動メッセージ送信数で代替）
   */
  private static async getMonthlyAIRepliesCount(tenantId: string): Promise<number> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    return await prisma.autoMessageLog.count({
      where: {
        tenantId,
        status: 'SENT',
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      }
    });
  }

  /**
   * ストレージ使用量取得（GB）
   */
  private static async getStorageUsage(tenantId: string): Promise<number> {
    // TODO: 実際のファイルサイズの計算
    // 現在は顧客数ベースで推定
    const customerCount = await prisma.customer.count({ where: { tenantId } });
    return Math.round(customerCount * 0.001 * 100) / 100; // 1顧客あたり1MB想定
  }

  /**
   * プラン制限違反時のエラー作成
   */
  static createRestrictionError(
    feature: FeatureCategory,
    currentPlan: PlanType,
    requiredPlan?: PlanType
  ): PlanRestrictionError {
    const required = requiredPlan || getRequiredPlanForFeature(feature);
    const currentPlanConfig = PLAN_CONFIGS[currentPlan];
    const requiredPlanConfig = PLAN_CONFIGS[required];

    return {
      code: 'PLAN_RESTRICTION',
      message: `この機能は${requiredPlanConfig.displayName}以上で利用できます`,
      feature,
      currentPlan,
      requiredPlan: required,
      upgradeMessage: `現在のプラン: ${currentPlanConfig.displayName} → 必要なプラン: ${requiredPlanConfig.displayName}`
    };
  }

  /**
   * 使用量制限違反時のエラー作成
   */
  static createUsageLimitError(
    limitType: keyof UsageLimits,
    currentValue: number,
    limit: number,
    planType: PlanType
  ): PlanRestrictionError {
    const planConfig = PLAN_CONFIGS[planType];
    
    const limitNames: Record<keyof UsageLimits, string> = {
      maxStaff: 'スタッフ数',
      maxCustomers: '顧客数',
      maxReservations: '月間予約数',
      maxAIReplies: '月間AI返信数',
      maxExports: '月間エクスポート数',
      maxBulkMessages: '月間一括メッセージ数',
      maxStorageGB: 'ストレージ',
      maxAPICallsPerDay: '日次API呼び出し数'
    };

    return {
      code: 'USAGE_LIMIT_EXCEEDED',
      message: `${limitNames[limitType]}の上限に達しました（${currentValue}/${limit}）`,
      feature: 'bulk_operations', // 一般的な制限として
      currentPlan: planType,
      requiredPlan: 'premium_ai',
      upgradeMessage: `上位プランにアップグレードして制限を解除できます`
    };
  }

  /**
   * プラン比較情報取得
   */
  static getPlanComparison(): Record<string, PlanConfig> {
    return PLAN_CONFIGS;
  }

  /**
   * アップグレード推奨機能
   */
  static async getUpgradeRecommendations(tenantId: string): Promise<{
    shouldUpgrade: boolean;
    reasons: string[];
    recommendedPlan: PlanType;
    savings?: number;
  }> {
    try {
      const currentPlanConfig = await this.getTenantPlan(tenantId);
      const usage = await this.getCurrentUsage(tenantId);

      const reasons: string[] = [];
      let recommendedPlan: PlanType = currentPlanConfig.type;

      // 使用量チェック
      const limits = currentPlanConfig.limits;
      
      if (limits.maxStaff !== -1 && usage.staffCount >= limits.maxStaff * 0.8) {
        reasons.push(`スタッフ数が上限の80%に達しています (${usage.staffCount}/${limits.maxStaff})`);
      }

      if (limits.maxCustomers !== -1 && usage.customerCount >= limits.maxCustomers * 0.8) {
        reasons.push(`顧客数が上限の80%に達しています (${usage.customerCount}/${limits.maxCustomers})`);
      }

      if (limits.maxReservations !== -1 && usage.reservationCount >= limits.maxReservations * 0.8) {
        reasons.push(`月間予約数が上限の80%に達しています (${usage.reservationCount}/${limits.maxReservations})`);
      }

      // 推奨プラン決定
      if (reasons.length > 0) {
        if (currentPlanConfig.type === 'light') {
          recommendedPlan = 'standard';
        } else if (currentPlanConfig.type === 'standard') {
          recommendedPlan = 'premium_ai';
        }
      }

      return {
        shouldUpgrade: reasons.length > 0,
        reasons,
        recommendedPlan,
        savings: this.calculatePotentialSavings(usage, recommendedPlan)
      };
    } catch (error) {
      logger.error('Failed to get upgrade recommendations:', error);
      return {
        shouldUpgrade: false,
        reasons: [],
        recommendedPlan: 'light'
      };
    }
  }

  /**
   * アップグレードによる潜在的な節約計算
   */
  private static calculatePotentialSavings(
    usage: UsageData, 
    recommendedPlan: PlanType
  ): number {
    // 機能制限による業務効率の改善を金額換算
    let savings = 0;

    if (recommendedPlan === 'standard' || recommendedPlan === 'premium_ai') {
      // AI機能による時間短縮効果
      savings += usage.reservationCount * 50; // 1予約あたり50円の効率化
    }

    if (recommendedPlan === 'premium_ai') {
      // 高度分析による収益改善
      savings += usage.customerCount * 100; // 1顧客あたり100円の売上向上
    }

    return savings;
  }
}