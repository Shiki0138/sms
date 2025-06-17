import { Request, Response, NextFunction } from 'express';
import { PlanService } from '../services/planService';
import { FeatureCategory, PlanType } from '../types/plans';
import { logger } from '../utils/logger';

/**
 * プラン制限ミドルウェア
 * 特定の機能へのアクセスをプランに基づいて制限
 */
export const requireFeature = (feature: FeatureCategory) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = req.user?.tenantId;
      
      if (!tenantId) {
        res.status(401).json({
          success: false,
          error: '認証が必要です'
        });
        return;
      }

      const canAccess = await PlanService.canAccessFeature(tenantId, feature);
      
      if (!canAccess) {
        const planConfig = await PlanService.getTenantPlan(tenantId);
        const restrictionError = PlanService.createRestrictionError(
          feature,
          planConfig.type
        );

        logger.warn(`Feature access denied: ${feature} for tenant ${tenantId}`, {
          currentPlan: planConfig.type,
          requiredFeature: feature
        });

        res.status(403).json({
          success: false,
          error: restrictionError.message,
          code: restrictionError.code,
          details: {
            feature: restrictionError.feature,
            currentPlan: restrictionError.currentPlan,
            requiredPlan: restrictionError.requiredPlan,
            upgradeMessage: restrictionError.upgradeMessage,
            upgradeUrl: `/settings/subscription?upgrade=${restrictionError.requiredPlan}`
          }
        });
        return;
      }

      next();
    } catch (error) {
      logger.error('Plan restriction middleware error:', error);
      res.status(500).json({
        success: false,
        error: 'プラン制限の確認中にエラーが発生しました'
      });
    }
  };
};

/**
 * 使用量制限チェックミドルウェア
 */
export const checkUsageLimit = (limitType: 'staff' | 'customers' | 'reservations' | 'ai_replies') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = req.user?.tenantId;
      
      if (!tenantId) {
        res.status(401).json({
          success: false,
          error: '認証が必要です'
        });
        return;
      }

      const usage = await PlanService.getCurrentUsage(tenantId);
      const planConfig = await PlanService.getTenantPlan(tenantId);

      let canProceed = true;
      let errorMessage = '';

      switch (limitType) {
        case 'staff':
          canProceed = await PlanService.checkUsageLimit(
            tenantId, 
            'maxStaff', 
            usage.staffCount + 1 // 新規作成を想定して+1
          );
          if (!canProceed) {
            errorMessage = `スタッフ数の上限に達しています (${usage.staffCount}/${planConfig.limits.maxStaff})`;
          }
          break;

        case 'customers':
          canProceed = await PlanService.checkUsageLimit(
            tenantId,
            'maxCustomers',
            usage.customerCount + 1
          );
          if (!canProceed) {
            errorMessage = `顧客数の上限に達しています (${usage.customerCount}/${planConfig.limits.maxCustomers})`;
          }
          break;

        case 'reservations':
          canProceed = await PlanService.checkUsageLimit(
            tenantId,
            'maxReservations',
            usage.reservationCount + 1
          );
          if (!canProceed) {
            errorMessage = `今月の予約数上限に達しています (${usage.reservationCount}/${planConfig.limits.maxReservations})`;
          }
          break;

        case 'ai_replies':
          canProceed = await PlanService.checkUsageLimit(
            tenantId,
            'maxAIReplies',
            usage.aiRepliesUsed + 1
          );
          if (!canProceed) {
            errorMessage = `今月のAI返信数上限に達しています (${usage.aiRepliesUsed}/${planConfig.limits.maxAIReplies})`;
          }
          break;
      }

      if (!canProceed) {
        const usageLimitError = PlanService.createUsageLimitError(
          limitType === 'staff' ? 'maxStaff' :
          limitType === 'customers' ? 'maxCustomers' :
          limitType === 'reservations' ? 'maxReservations' :
          'maxAIReplies',
          limitType === 'staff' ? usage.staffCount :
          limitType === 'customers' ? usage.customerCount :
          limitType === 'reservations' ? usage.reservationCount :
          usage.aiRepliesUsed,
          limitType === 'staff' ? planConfig.limits.maxStaff :
          limitType === 'customers' ? planConfig.limits.maxCustomers :
          limitType === 'reservations' ? planConfig.limits.maxReservations :
          planConfig.limits.maxAIReplies,
          planConfig.type
        );

        logger.warn(`Usage limit exceeded: ${limitType} for tenant ${tenantId}`, {
          currentPlan: planConfig.type,
          usage: usage
        });

        res.status(403).json({
          success: false,
          error: errorMessage,
          code: usageLimitError.code,
          details: {
            limitType,
            currentPlan: planConfig.type,
            upgradeMessage: usageLimitError.upgradeMessage,
            upgradeUrl: `/settings/subscription?upgrade=${usageLimitError.requiredPlan}`,
            usage: {
              current: limitType === 'staff' ? usage.staffCount :
                      limitType === 'customers' ? usage.customerCount :
                      limitType === 'reservations' ? usage.reservationCount :
                      usage.aiRepliesUsed,
              limit: limitType === 'staff' ? planConfig.limits.maxStaff :
                     limitType === 'customers' ? planConfig.limits.maxCustomers :
                     limitType === 'reservations' ? planConfig.limits.maxReservations :
                     planConfig.limits.maxAIReplies
            }
          }
        });
        return;
      }

      next();
    } catch (error) {
      logger.error('Usage limit middleware error:', error);
      res.status(500).json({
        success: false,
        error: '使用量制限の確認中にエラーが発生しました'
      });
    }
  };
};

/**
 * プラン情報をレスポンスに追加するミドルウェア
 */
export const addPlanInfo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId;
    
    if (tenantId) {
      const [planConfig, usage] = await Promise.all([
        PlanService.getTenantPlan(tenantId),
        PlanService.getCurrentUsage(tenantId)
      ]);

      // レスポンスにプラン情報を追加
      res.locals.planInfo = {
        plan: planConfig,
        usage: usage,
        limits: planConfig.limits
      };
    }

    next();
  } catch (error) {
    logger.error('Add plan info middleware error:', error);
    // エラーでも処理を継続
    next();
  }
};

/**
 * 分析機能制限（スタンダード以上）
 */
export const requireAnalytics = requireFeature('analytics');

/**
 * AI機能制限（プレミアムAI）
 */
export const requireAI = requireFeature('ai_features');

/**
 * 外部連携制限（プレミアムAI）
 */
export const requireExternalIntegrations = requireFeature('external_integrations');

/**
 * エクスポート機能制限（スタンダード以上）
 */
export const requireExport = requireFeature('export_functions');

/**
 * マーケティング自動化制限（スタンダード以上）
 */
export const requireMarketing = requireFeature('marketing_automation');

/**
 * 高度レポート制限（プレミアムAI）
 */
export const requireAdvancedReports = requireFeature('advanced_reports');

/**
 * リアルタイムダッシュボード制限（プレミアムAI）
 */
export const requireRealTimeDashboard = requireFeature('real_time_dashboard');

/**
 * 顧客セグメンテーション制限（スタンダード以上）
 */
export const requireCustomerSegmentation = requireFeature('customer_segmentation');

/**
 * 一括操作制限（スタンダード以上）
 */
export const requireBulkOperations = requireFeature('bulk_operations');

/**
 * API アクセス制限（プレミアムAI）
 */
export const requireAPIAccess = requireFeature('api_access');

// 使用量制限ミドルウェア（エイリアス）
export const limitStaffCreation = checkUsageLimit('staff');
export const limitCustomerCreation = checkUsageLimit('customers');
export const limitReservationCreation = checkUsageLimit('reservations');
export const limitAIReplies = checkUsageLimit('ai_replies');