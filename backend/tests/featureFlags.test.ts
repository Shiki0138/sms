import { PrismaClient } from '@prisma/client';
import { FeatureFlagService } from '../src/services/featureFlagService';

const prisma = new PrismaClient();

describe('Feature Flags System', () => {
  beforeAll(async () => {
    // テスト用データベースのセットアップ
    await FeatureFlagService.setupInitialFeatureFlags();
  });

  afterAll(async () => {
    // クリーンアップ
    await prisma.featureFlag.deleteMany();
    await prisma.$disconnect();
  });

  describe('Basic Feature Flag Operations', () => {
    test('should create initial feature flags', async () => {
      const flags = await FeatureFlagService.getAllFeatureFlags();
      expect(flags.length).toBeGreaterThan(0);
      
      const betaFlags = flags.filter(f => f.category === 'beta');
      expect(betaFlags.length).toBeGreaterThanOrEqual(3);
    });

    test('should check feature availability for tenant', async () => {
      const testTenantId = 'test-tenant-001';
      
      // 無効な機能は false を返す
      const disabledFeature = await FeatureFlagService.isFeatureEnabled(testTenantId, 'nonexistent_feature');
      expect(disabledFeature).toBe(false);
    });
  });

  describe('Production Setup', () => {
    test('should apply production settings correctly', async () => {
      await FeatureFlagService.setupProductionFlags();
      
      const flags = await FeatureFlagService.getAllFeatureFlags();
      
      // ベータ機能が有効化されているか確認
      const betaApplication = flags.find(f => f.key === 'beta_application');
      expect(betaApplication?.isEnabled).toBe(true);
      expect(betaApplication?.rolloutPercentage).toBe(100);

      // セットアップウィザードが有効化されているか確認
      const setupWizard = flags.find(f => f.key === 'setup_wizard');
      expect(setupWizard?.isEnabled).toBe(true);
      expect(setupWizard?.rolloutPercentage).toBe(100);
    });

    test('should set correct plan restrictions', async () => {
      await FeatureFlagService.setupProductionFlags();
      
      const flags = await FeatureFlagService.getAllFeatureFlags();
      
      // プレミアム機能のプラン制限確認
      const premiumAI = flags.find(f => f.key === 'premium_ai_analytics');
      expect(premiumAI?.enabledPlans).toContain('premium_ai');
      
      // スタンダード機能のプラン制限確認
      const lineIntegration = flags.find(f => f.key === 'line_integration');
      const enabledPlans = lineIntegration?.enabledPlans ? JSON.parse(lineIntegration.enabledPlans) : [];
      expect(enabledPlans).toContain('standard');
      expect(enabledPlans).toContain('premium_ai');
    });
  });

  describe('Rollout Management', () => {
    test('should update rollout percentage', async () => {
      await FeatureFlagService.setupProductionFlags();
      
      // ロールアウト率を更新
      await FeatureFlagService.updateRolloutPercentage('dashboard_customize', 75);
      
      const flags = await FeatureFlagService.getAllFeatureFlags();
      const feature = flags.find(f => f.key === 'dashboard_customize');
      expect(feature?.rolloutPercentage).toBe(75);
    });

    test('should validate rollout percentage range', async () => {
      await expect(
        FeatureFlagService.updateRolloutPercentage('test_feature', -10)
      ).rejects.toThrow('Rollout percentage must be between 0 and 100');

      await expect(
        FeatureFlagService.updateRolloutPercentage('test_feature', 150)
      ).rejects.toThrow('Rollout percentage must be between 0 and 100');
    });
  });

  describe('Emergency Controls', () => {
    test('should emergency disable feature', async () => {
      await FeatureFlagService.setupProductionFlags();
      
      // 緊急無効化実行
      await FeatureFlagService.emergencyDisableFeature('line_integration');
      
      const flags = await FeatureFlagService.getAllFeatureFlags();
      const feature = flags.find(f => f.key === 'line_integration');
      expect(feature?.isEnabled).toBe(false);
      expect(feature?.rolloutPercentage).toBe(0);
    });
  });

  describe('Beta Features', () => {
    test('should enable beta features for specific tenant', async () => {
      const testTenantId = 'beta-test-tenant-001';
      
      // テナント作成
      await prisma.tenant.create({
        data: {
          id: testTenantId,
          name: 'Test Beta Tenant',
          plan: 'standard'
        }
      });

      // ベータ機能有効化
      await FeatureFlagService.enableBetaFeaturesForTenant(testTenantId);
      
      // 確認
      const betaFeatures = ['beta_application', 'beta_dashboard', 'beta_feedback'];
      for (const featureKey of betaFeatures) {
        const isEnabled = await FeatureFlagService.isFeatureEnabled(testTenantId, featureKey);
        expect(isEnabled).toBe(true);
      }

      // クリーンアップ
      await prisma.tenant.delete({ where: { id: testTenantId } });
    });
  });

  describe('Plan-based Access Control', () => {
    test('should respect plan-based restrictions', async () => {
      await FeatureFlagService.setupProductionFlags();
      
      const lightTenantId = 'light-plan-tenant';
      const premiumTenantId = 'premium-plan-tenant';
      
      // テナント作成
      await prisma.tenant.createMany({
        data: [
          { id: lightTenantId, name: 'Light Plan Tenant', plan: 'light' },
          { id: premiumTenantId, name: 'Premium Plan Tenant', plan: 'premium_ai' }
        ]
      });

      // ライトプランはプレミアム機能にアクセスできない
      const lightHasPremium = await FeatureFlagService.isFeatureEnabled(lightTenantId, 'premium_ai_analytics');
      expect(lightHasPremium).toBe(false);

      // プレミアムプランはプレミアム機能にアクセスできる
      const premiumHasPremium = await FeatureFlagService.isFeatureEnabled(premiumTenantId, 'premium_ai_analytics');
      expect(premiumHasPremium).toBe(true);

      // クリーンアップ
      await prisma.tenant.deleteMany({
        where: { id: { in: [lightTenantId, premiumTenantId] } }
      });
    });
  });
});