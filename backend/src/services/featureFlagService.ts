import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface FeatureFlagConfig {
  key: string;
  name: string;
  description?: string;
  category: 'core' | 'enhancement' | 'experimental' | 'beta';
  dependencies?: string[];
  config?: any;
  releaseDate?: Date;
}

export class FeatureFlagService {
  /**
   * 新機能の定義
   */
  static readonly FEATURES: Record<string, FeatureFlagConfig> = {
    // === ベータテスト機能 ===
    
    // ベータテスター申請
    BETA_APPLICATION: {
      key: 'beta_application',
      name: 'ベータテスター申請機能',
      description: '新機能のベータテストへの申請と管理',
      category: 'beta',
    },
    
    // ベータ専用ダッシュボード
    BETA_DASHBOARD: {
      key: 'beta_dashboard',
      name: 'ベータテスト専用ダッシュボード',
      description: 'ベータテスターのための機能テストと評価画面',
      category: 'beta',
    },
    
    // フィードバック収集
    BETA_FEEDBACK: {
      key: 'beta_feedback',
      name: 'ベータフィードバック収集',
      description: 'ベータテスターからのフィードバック収集システム',
      category: 'beta',
    },
    
    // === プレミアム機能 ===
    
    // 高度AI分析
    PREMIUM_AI_ANALYTICS: {
      key: 'premium_ai_analytics',
      name: '高度AI分析',
      description: '顧客行動予測、売上最適化、パーソナライズされたマーケティング提案',
      category: 'enhancement',
      dependencies: ['premium_ai_plan'],
      config: {
        features: ['behavior_prediction', 'revenue_optimization', 'personalized_marketing']
      }
    },
    
    // リアルタイム分析
    REALTIME_ANALYTICS: {
      key: 'realtime_analytics',
      name: 'リアルタイム分析ダッシュボード',
      description: 'リアルタイムでの売上、予約、顧客動向分析',
      category: 'enhancement',
      dependencies: ['standard_plan'],
    },
    
    // カスタムレポート
    CUSTOM_REPORTS: {
      key: 'custom_reports',
      name: 'カスタムレポート作成',
      description: '店舗独自のレポートをカスタマイズして作成',
      category: 'enhancement',
      dependencies: ['premium_ai_plan'],
    },
    
    // API アクセス
    API_ACCESS: {
      key: 'api_access',
      name: 'API アクセス',
      description: '外部システムとの連携用API',
      category: 'enhancement',
      dependencies: ['premium_ai_plan'],
    },
    
    // === 段階的リリース機能 ===
    
    // 初回セットアップウィザード
    SETUP_WIZARD: {
      key: 'setup_wizard',
      name: '初回セットアップウィザード',
      description: '美容室の基本情報を簡単に設定できるステップバイステップのウィザード',
      category: 'enhancement',
    },
    
    // ダッシュボードカスタマイズ
    DASHBOARD_CUSTOMIZE: {
      key: 'dashboard_customize',
      name: 'ダッシュボードカスタマイズ',
      description: '各オーナーが自分の見たい情報を優先的に表示できるカスタマイズ機能',
      category: 'enhancement',
    },
    
    // モバイル専用ビュー
    MOBILE_VIEW: {
      key: 'mobile_view',
      name: 'モバイル専用ビュー',
      description: 'スマートフォンでの利用に最適化された専用UI',
      category: 'enhancement',
    },
    
    // LINE連携
    LINE_INTEGRATION: {
      key: 'line_integration',
      name: 'LINE連携機能',
      description: '予約確認・リマインダーをLINEで送信、顧客からのLINE予約受付',
      category: 'enhancement',
      dependencies: ['standard_plan'],
      config: {
        features: ['reminder', 'booking', 'staff_notification']
      }
    },
    
    // Instagram連携
    INSTAGRAM_INTEGRATION: {
      key: 'instagram_integration',
      name: 'Instagram連携機能',
      description: 'Instagramでの予約受付と投稿管理',
      category: 'enhancement',
      dependencies: ['standard_plan'],
    },
    
    // 売上予測AI
    SALES_PREDICTION_AI: {
      key: 'sales_prediction_ai',
      name: '売上予測AI',
      description: '過去のデータから月次・週次の売上を予測',
      category: 'experimental',
      dependencies: ['premium_ai_plan']
    },
    
    // 顧客カルテテンプレート
    CUSTOMER_TEMPLATE: {
      key: 'customer_template',
      name: '顧客カルテテンプレート',
      description: '美容室でよく使われる情報のテンプレート',
      category: 'enhancement',
    },
    
    // スタッフ間情報共有
    STAFF_SHARING: {
      key: 'staff_sharing',
      name: 'スタッフ間情報共有機能',
      description: '顧客の好みや注意事項をスタッフ間で簡単に共有',
      category: 'enhancement',
    },
    
    // 簡易POS連携
    POS_INTEGRATION: {
      key: 'pos_integration',
      name: '簡易POS連携',
      description: 'レジシステムとの基本的な連携',
      category: 'experimental',
    },
    
    // 自動保存機能
    AUTO_SAVE: {
      key: 'auto_save',
      name: '自動保存機能',
      description: 'フォーム入力内容の自動保存',
      category: 'enhancement',
    },
    
    // 高度な検索とフィルタ
    ADVANCED_SEARCH: {
      key: 'advanced_search',
      name: '高度な検索とフィルタ',
      description: '顧客、予約、売上データの高度な検索機能',
      category: 'enhancement',
      dependencies: ['standard_plan'],
    },
    
    // CSV/PDFエクスポート
    DATA_EXPORT: {
      key: 'data_export',
      name: 'データエクスポート',
      description: 'CSV・PDF形式でのデータエクスポート機能',
      category: 'enhancement',
      dependencies: ['standard_plan'],
    },
  };

  /**
   * 特定のテナントで機能が有効かチェック
   */
  static async isFeatureEnabled(tenantId: string, featureKey: string): Promise<boolean> {
    // まずグローバル設定を確認
    const globalFlag = await prisma.featureFlag.findUnique({
      where: { key: featureKey },
      include: {
        tenantFlags: {
          where: { tenantId }
        }
      }
    });

    if (!globalFlag) {
      return false;
    }

    // テナント固有の設定があればそれを優先
    if (globalFlag.tenantFlags.length > 0) {
      return globalFlag.tenantFlags[0].isEnabled;
    }

    // グローバル設定を確認
    if (!globalFlag.isEnabled) {
      return false;
    }

    // 特定のテナントIDで有効化されているか
    if (globalFlag.enabledTenants) {
      const enabledTenants = JSON.parse(globalFlag.enabledTenants);
      if (enabledTenants.length > 0 && !enabledTenants.includes(tenantId)) {
        return false;
      }
    }

    // プランベースの有効化を確認
    if (globalFlag.enabledPlans) {
      const enabledPlans = JSON.parse(globalFlag.enabledPlans);
      if (enabledPlans.length > 0) {
        const tenant = await prisma.tenant.findUnique({
          where: { id: tenantId },
          select: { plan: true }
        });
        if (!tenant || !enabledPlans.includes(tenant.plan)) {
          return false;
        }
      }
    }

    // ロールアウト率を確認
    if (globalFlag.rolloutPercentage < 100) {
      // 簡易的なハッシュベースのロールアウト
      const hash = tenantId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return (hash % 100) < globalFlag.rolloutPercentage;
    }

    return true;
  }

  /**
   * テナントで有効な機能一覧を取得
   */
  static async getEnabledFeatures(tenantId: string): Promise<string[]> {
    const allFeatures = await prisma.featureFlag.findMany({
      include: {
        tenantFlags: {
          where: { tenantId }
        }
      }
    });

    const enabledFeatures: string[] = [];

    for (const feature of allFeatures) {
      if (await this.isFeatureEnabled(tenantId, feature.key)) {
        enabledFeatures.push(feature.key);
      }
    }

    return enabledFeatures;
  }

  /**
   * 管理者用：全フィーチャーフラグを取得
   */
  static async getAllFeatureFlags() {
    return prisma.featureFlag.findMany({
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    });
  }

  /**
   * 管理者用：フィーチャーフラグを作成
   */
  static async createFeatureFlag(data: {
    key: string;
    name: string;
    description?: string;
    category: string;
    isEnabled?: boolean;
    rolloutPercentage?: number;
    enabledTenants?: string[];
    enabledPlans?: string[];
    config?: any;
    dependencies?: string[];
    releaseDate?: Date;
  }) {
    return prisma.featureFlag.create({
      data: {
        ...data,
        config: data.config ? JSON.stringify(data.config) : null,
        enabledTenants: data.enabledTenants ? JSON.stringify(data.enabledTenants) : null,
        enabledPlans: data.enabledPlans ? JSON.stringify(data.enabledPlans) : null,
        dependencies: data.dependencies ? JSON.stringify(data.dependencies) : null,
      }
    });
  }

  /**
   * 管理者用：フィーチャーフラグを更新
   */
  static async updateFeatureFlag(id: string, data: {
    isEnabled?: boolean;
    rolloutPercentage?: number;
    enabledTenants?: string[];
    enabledPlans?: string[];
    config?: any;
    releaseDate?: Date;
    deprecationDate?: Date;
  }) {
    return prisma.featureFlag.update({
      where: { id },
      data: {
        ...data,
        config: data.config ? JSON.stringify(data.config) : undefined,
        enabledTenants: data.enabledTenants ? JSON.stringify(data.enabledTenants) : undefined,
        enabledPlans: data.enabledPlans ? JSON.stringify(data.enabledPlans) : undefined,
      }
    });
  }

  /**
   * 管理者用：特定テナントの機能を有効/無効化
   */
  static async setTenantFeatureFlag(
    tenantId: string,
    featureFlagId: string,
    isEnabled: boolean,
    config?: any
  ) {
    return prisma.tenantFeatureFlag.upsert({
      where: {
        tenantId_featureFlagId: {
          tenantId,
          featureFlagId
        }
      },
      update: {
        isEnabled,
        config: config ? JSON.stringify(config) : null,
      },
      create: {
        tenantId,
        featureFlagId,
        isEnabled,
        config: config ? JSON.stringify(config) : null,
      }
    });
  }

  /**
   * 初期フィーチャーフラグをセットアップ
   */
  static async setupInitialFeatureFlags() {
    for (const [key, config] of Object.entries(this.FEATURES)) {
      await prisma.featureFlag.upsert({
        where: { key: config.key },
        update: {},
        create: {
          key: config.key,
          name: config.name,
          description: config.description || '',
          category: config.category,
          dependencies: config.dependencies ? JSON.stringify(config.dependencies) : null,
          config: config.config ? JSON.stringify(config.config) : null,
          isEnabled: false,
          rolloutPercentage: 0,
          enabledTenants: null,
          enabledPlans: null,
        }
      });
    }
  }

  /**
   * 本番環境向け初期設定 - 段階的リリース用設定
   */
  static async setupProductionFlags() {
    const productionSettings = {
      // ベータテスト機能 - ベータテスター限定で有効化
      beta_application: { isEnabled: true, rolloutPercentage: 100, enabledPlans: ['light', 'standard', 'premium_ai'] },
      beta_dashboard: { isEnabled: true, rolloutPercentage: 100, enabledPlans: ['light', 'standard', 'premium_ai'] },
      beta_feedback: { isEnabled: true, rolloutPercentage: 100, enabledPlans: ['light', 'standard', 'premium_ai'] },

      // 基本機能 - 全プランで段階的リリース
      setup_wizard: { isEnabled: true, rolloutPercentage: 100, enabledPlans: ['light', 'standard', 'premium_ai'] },
      dashboard_customize: { isEnabled: true, rolloutPercentage: 50, enabledPlans: ['light', 'standard', 'premium_ai'] },
      mobile_view: { isEnabled: true, rolloutPercentage: 75, enabledPlans: ['light', 'standard', 'premium_ai'] },
      customer_template: { isEnabled: true, rolloutPercentage: 100, enabledPlans: ['light', 'standard', 'premium_ai'] },
      staff_sharing: { isEnabled: true, rolloutPercentage: 80, enabledPlans: ['light', 'standard', 'premium_ai'] },
      auto_save: { isEnabled: true, rolloutPercentage: 100, enabledPlans: ['light', 'standard', 'premium_ai'] },

      // スタンダードプラン以上の機能
      line_integration: { isEnabled: true, rolloutPercentage: 25, enabledPlans: ['standard', 'premium_ai'] },
      instagram_integration: { isEnabled: true, rolloutPercentage: 25, enabledPlans: ['standard', 'premium_ai'] },
      realtime_analytics: { isEnabled: true, rolloutPercentage: 50, enabledPlans: ['standard', 'premium_ai'] },
      advanced_search: { isEnabled: true, rolloutPercentage: 75, enabledPlans: ['standard', 'premium_ai'] },
      data_export: { isEnabled: true, rolloutPercentage: 100, enabledPlans: ['standard', 'premium_ai'] },

      // プレミアムプラン限定機能
      premium_ai_analytics: { isEnabled: true, rolloutPercentage: 50, enabledPlans: ['premium_ai'] },
      custom_reports: { isEnabled: true, rolloutPercentage: 75, enabledPlans: ['premium_ai'] },
      api_access: { isEnabled: true, rolloutPercentage: 25, enabledPlans: ['premium_ai'] },

      // 実験的機能 - 小規模テスト
      sales_prediction_ai: { isEnabled: true, rolloutPercentage: 10, enabledPlans: ['premium_ai'] },
      pos_integration: { isEnabled: true, rolloutPercentage: 5, enabledPlans: ['standard', 'premium_ai'] },
    };

    for (const [featureKey, settings] of Object.entries(productionSettings)) {
      await prisma.featureFlag.updateMany({
        where: { key: featureKey },
        data: {
          isEnabled: settings.isEnabled,
          rolloutPercentage: settings.rolloutPercentage,
          enabledPlans: JSON.stringify(settings.enabledPlans),
        }
      });
    }
  }

  /**
   * 【緊急】本番環境向け完全設定 - 即座に本番利用可能な状態
   */
  static async setupProductionProductionFlags() {
    console.log('🚀 本番環境フィーチャーフラグ設定開始...');
    
    const productionSettings = {
      // ベータテスト機能 - 制限付きで有効（申請制）
      beta_application: { isEnabled: true, rolloutPercentage: 15, enabledPlans: ['light', 'standard', 'premium_ai'] },
      beta_dashboard: { isEnabled: true, rolloutPercentage: 15, enabledPlans: ['light', 'standard', 'premium_ai'] },
      beta_feedback: { isEnabled: true, rolloutPercentage: 20, enabledPlans: ['light', 'standard', 'premium_ai'] },

      // 基本システム機能 - 本番モード（全て有効）
      setup_wizard: { isEnabled: true, rolloutPercentage: 100, enabledPlans: ['light', 'standard', 'premium_ai'] },
      dashboard_customize: { isEnabled: true, rolloutPercentage: 100, enabledPlans: ['light', 'standard', 'premium_ai'] },
      mobile_view: { isEnabled: true, rolloutPercentage: 100, enabledPlans: ['light', 'standard', 'premium_ai'] },
      customer_template: { isEnabled: true, rolloutPercentage: 100, enabledPlans: ['light', 'standard', 'premium_ai'] },
      staff_sharing: { isEnabled: true, rolloutPercentage: 100, enabledPlans: ['light', 'standard', 'premium_ai'] },
      auto_save: { isEnabled: true, rolloutPercentage: 100, enabledPlans: ['light', 'standard', 'premium_ai'] },

      // スタンダードプラン機能 - 有効
      line_integration: { isEnabled: true, rolloutPercentage: 100, enabledPlans: ['standard', 'premium_ai'] },
      instagram_integration: { isEnabled: true, rolloutPercentage: 100, enabledPlans: ['standard', 'premium_ai'] },
      realtime_analytics: { isEnabled: true, rolloutPercentage: 100, enabledPlans: ['standard', 'premium_ai'] },
      advanced_search: { isEnabled: true, rolloutPercentage: 100, enabledPlans: ['standard', 'premium_ai'] },
      data_export: { isEnabled: true, rolloutPercentage: 100, enabledPlans: ['standard', 'premium_ai'] },

      // プレミアム機能 - 完全有効
      premium_ai_analytics: { isEnabled: true, rolloutPercentage: 100, enabledPlans: ['premium_ai'] },
      custom_reports: { isEnabled: true, rolloutPercentage: 100, enabledPlans: ['premium_ai'] },
      api_access: { isEnabled: true, rolloutPercentage: 100, enabledPlans: ['premium_ai'] },

      // 実験的機能 - 慎重に展開
      sales_prediction_ai: { isEnabled: true, rolloutPercentage: 30, enabledPlans: ['premium_ai'] },
      pos_integration: { isEnabled: true, rolloutPercentage: 25, enabledPlans: ['standard', 'premium_ai'] },
    };

    let successCount = 0;
    let errorCount = 0;
    const results = [];

    for (const [featureKey, settings] of Object.entries(productionSettings)) {
      try {
        const result = await prisma.featureFlag.updateMany({
          where: { key: featureKey },
          data: {
            isEnabled: settings.isEnabled,
            rolloutPercentage: settings.rolloutPercentage,
            enabledPlans: JSON.stringify(settings.enabledPlans),
            updatedAt: new Date(),
          }
        });
        
        if (result.count > 0) {
          successCount++;
          results.push(`✅ ${featureKey}: ${settings.rolloutPercentage}% (${settings.enabledPlans.join(', ')})`);
        } else {
          results.push(`⚠️ ${featureKey}: 機能が見つかりません`);
        }
      } catch (error) {
        errorCount++;
        results.push(`❌ ${featureKey}: 設定失敗 - ${error}`);
        console.error(`Failed to update feature flag ${featureKey}:`, error);
      }
    }

    console.log(`✅ 本番環境設定完了: ${successCount}機能成功, ${errorCount}機能失敗`);
    return {
      success: errorCount === 0,
      successCount,
      errorCount,
      results
    };
  }

  /**
   * ベータテスト機能を特定のテナントで有効化
   */
  static async enableBetaFeaturesForTenant(tenantId: string) {
    const betaFeatures = ['beta_application', 'beta_dashboard', 'beta_feedback'];
    
    for (const featureKey of betaFeatures) {
      const featureFlag = await prisma.featureFlag.findUnique({
        where: { key: featureKey }
      });
      
      if (featureFlag) {
        await this.setTenantFeatureFlag(tenantId, featureFlag.id, true);
      }
    }
  }

  /**
   * 段階的リリース - 特定の機能の展開率を更新
   */
  static async updateRolloutPercentage(featureKey: string, percentage: number) {
    if (percentage < 0 || percentage > 100) {
      throw new Error('Rollout percentage must be between 0 and 100');
    }

    return prisma.featureFlag.updateMany({
      where: { key: featureKey },
      data: { rolloutPercentage: percentage }
    });
  }

  /**
   * 緊急時機能無効化
   */
  static async emergencyDisableFeature(featureKey: string) {
    return prisma.featureFlag.updateMany({
      where: { key: featureKey },
      data: { 
        isEnabled: false,
        rolloutPercentage: 0 
      }
    });
  }

  /**
   * テナントの機能設定を取得（管理画面用）
   */
  static async getTenantFeatureSettings(tenantId: string) {
    const allFeatures = await this.getAllFeatureFlags();
    const enabledFeatures = await this.getEnabledFeatures(tenantId);
    
    return allFeatures.map(feature => ({
      ...feature,
      isEnabledForTenant: enabledFeatures.includes(feature.key),
      config: feature.config ? JSON.parse(feature.config) : null,
    }));
  }
}