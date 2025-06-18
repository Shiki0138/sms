import { Request, Response } from 'express';
import { FeatureFlagService } from '../services/featureFlagService';

export const featureFlagController = {
  /**
   * テナントで有効な機能一覧を取得
   */
  async getEnabledFeatures(req: Request, res: Response) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const enabledFeatures = await FeatureFlagService.getEnabledFeatures(tenantId);
      
      res.json({ 
        features: enabledFeatures,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error getting enabled features:', error);
      res.status(500).json({ error: 'Failed to get enabled features' });
    }
  },

  /**
   * 特定の機能が有効かチェック
   */
  async checkFeature(req: Request, res: Response) {
    try {
      const tenantId = req.user?.tenantId;
      const { featureKey } = req.params;
      
      if (!tenantId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const isEnabled = await FeatureFlagService.isFeatureEnabled(tenantId, featureKey);
      
      res.json({ 
        featureKey,
        isEnabled,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error checking feature:', error);
      res.status(500).json({ error: 'Failed to check feature' });
    }
  },

  /**
   * 管理者用：全フィーチャーフラグを取得
   */
  async getAllFeatureFlags(req: Request, res: Response) {
    try {
      // 管理者権限チェック
      if (!req.user?.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const featureFlags = await FeatureFlagService.getAllFeatureFlags();
      
      res.json({ 
        featureFlags,
        count: featureFlags.length,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error getting all feature flags:', error);
      res.status(500).json({ error: 'Failed to get feature flags' });
    }
  },

  /**
   * 管理者用：フィーチャーフラグを作成
   */
  async createFeatureFlag(req: Request, res: Response) {
    try {
      // 管理者権限チェック
      if (!req.user?.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const featureFlag = await FeatureFlagService.createFeatureFlag(req.body);
      
      res.status(201).json({ 
        featureFlag,
        message: 'Feature flag created successfully'
      });
    } catch (error) {
      console.error('Error creating feature flag:', error);
      res.status(500).json({ error: 'Failed to create feature flag' });
    }
  },

  /**
   * 管理者用：フィーチャーフラグを更新
   */
  async updateFeatureFlag(req: Request, res: Response) {
    try {
      // 管理者権限チェック
      if (!req.user?.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { id } = req.params;
      const featureFlag = await FeatureFlagService.updateFeatureFlag(id, req.body);
      
      res.json({ 
        featureFlag,
        message: 'Feature flag updated successfully'
      });
    } catch (error) {
      console.error('Error updating feature flag:', error);
      res.status(500).json({ error: 'Failed to update feature flag' });
    }
  },

  /**
   * 管理者用：特定テナントの機能を有効/無効化
   */
  async setTenantFeatureFlag(req: Request, res: Response) {
    try {
      // 管理者権限チェック
      if (!req.user?.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { tenantId, featureFlagId } = req.params;
      const { isEnabled, config } = req.body;

      const tenantFeatureFlag = await FeatureFlagService.setTenantFeatureFlag(
        tenantId,
        featureFlagId,
        isEnabled,
        config
      );
      
      res.json({ 
        tenantFeatureFlag,
        message: 'Tenant feature flag updated successfully'
      });
    } catch (error) {
      console.error('Error setting tenant feature flag:', error);
      res.status(500).json({ error: 'Failed to set tenant feature flag' });
    }
  },

  /**
   * 管理者用：テナントの機能設定を取得
   */
  async getTenantFeatureSettings(req: Request, res: Response) {
    try {
      // 管理者権限チェック
      if (!req.user?.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { tenantId } = req.params;
      const featureSettings = await FeatureFlagService.getTenantFeatureSettings(tenantId);
      
      res.json({ 
        tenantId,
        featureSettings,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error getting tenant feature settings:', error);
      res.status(500).json({ error: 'Failed to get tenant feature settings' });
    }
  },

  /**
   * 初期フィーチャーフラグをセットアップ（一度だけ実行）
   */
  async setupInitialFeatureFlags(req: Request, res: Response) {
    try {
      // 管理者権限チェック
      if (!req.user?.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      await FeatureFlagService.setupInitialFeatureFlags();
      
      res.json({ 
        message: 'Initial feature flags setup completed',
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error setting up initial feature flags:', error);
      res.status(500).json({ error: 'Failed to setup initial feature flags' });
    }
  },

  /**
   * 本番環境向け初期設定を実行
   */
  async setupProductionFlags(req: Request, res: Response) {
    try {
      // 管理者権限チェック
      if (!req.user?.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      // まず初期フラグを作成
      await FeatureFlagService.setupInitialFeatureFlags();
      // 次に本番向け設定を適用
      await FeatureFlagService.setupProductionFlags();
      
      res.json({ 
        message: 'Production feature flags setup completed',
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error setting up production feature flags:', error);
      res.status(500).json({ error: 'Failed to setup production feature flags' });
    }
  },

  /**
   * 【緊急】本番環境完全設定実行
   */
  async setupProductionProductionFlags(req: Request, res: Response) {
    try {
      // 管理者権限チェック
      if (!req.user?.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      console.log('🚨 緊急本番環境フィーチャーフラグ設定開始...');
      
      // まず初期フラグを作成
      await FeatureFlagService.setupInitialFeatureFlags();
      // 本番向け完全設定を適用
      const result = await FeatureFlagService.setupProductionProductionFlags();
      
      if (result.success) {
        console.log('✅ 本番環境設定完了');
        res.json({ 
          success: true,
          message: '本番環境フィーチャーフラグ設定完了',
          successCount: result.successCount,
          errorCount: result.errorCount,
          results: result.results,
          timestamp: new Date()
        });
      } else {
        console.log('⚠️ 本番環境設定に一部エラーあり');
        res.status(207).json({ 
          success: false,
          message: '本番環境設定完了（一部エラーあり）',
          successCount: result.successCount,
          errorCount: result.errorCount,
          results: result.results,
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error('❌ 本番環境設定失敗:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to setup production feature flags',
        details: error.message
      });
    }
  },

  /**
   * 段階的リリース - 展開率更新
   */
  async updateRolloutPercentage(req: Request, res: Response) {
    try {
      // 管理者権限チェック
      if (!req.user?.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { featureKey } = req.params;
      const { percentage } = req.body;

      await FeatureFlagService.updateRolloutPercentage(featureKey, percentage);
      
      res.json({ 
        message: `Rollout percentage updated for ${featureKey}`,
        featureKey,
        percentage,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error updating rollout percentage:', error);
      res.status(500).json({ error: 'Failed to update rollout percentage' });
    }
  },

  /**
   * ベータテスト機能を有効化
   */
  async enableBetaFeatures(req: Request, res: Response) {
    try {
      // 管理者権限チェック
      if (!req.user?.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { tenantId } = req.params;
      await FeatureFlagService.enableBetaFeaturesForTenant(tenantId);
      
      res.json({ 
        message: 'Beta features enabled for tenant',
        tenantId,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error enabling beta features:', error);
      res.status(500).json({ error: 'Failed to enable beta features' });
    }
  },

  /**
   * 緊急機能無効化
   */
  async emergencyDisableFeature(req: Request, res: Response) {
    try {
      // 管理者権限チェック
      if (!req.user?.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { featureKey } = req.params;
      await FeatureFlagService.emergencyDisableFeature(featureKey);
      
      res.json({ 
        message: `Feature ${featureKey} disabled for emergency`,
        featureKey,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error disabling feature:', error);
      res.status(500).json({ error: 'Failed to disable feature' });
    }
  }
};