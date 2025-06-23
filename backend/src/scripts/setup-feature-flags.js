const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupFeatureFlags() {
  try {
    console.log('🚀 Setting up feature flags...');

    // 応援美容師サービスのフィーチャーフラグ
    const supportBeauticianFlag = await prisma.featureFlag.upsert({
      where: { key: 'support_beautician_service' },
      update: {},
      create: {
        key: 'support_beautician_service',
        name: '応援美容師サービス',
        description: '美容師同士が助け合えるマッチングサービス。スキマ時間を活用して他店舗の応援に入ることができます。',
        category: 'enhancement',
        isEnabled: false, // デフォルトは無効
        rolloutPercentage: 0,
        config: JSON.stringify({
          maxSupportDistance: 15, // km
          defaultHourlyRate: 2000, // 円
          enableLocationTracking: true,
          autoMatchingEnabled: false
        })
      }
    });

    // 給料見える化システムのフィーチャーフラグ
    const salaryDashboardFlag = await prisma.featureFlag.upsert({
      where: { key: 'salary_transparency_dashboard' },
      update: {},
      create: {
        key: 'salary_transparency_dashboard',
        name: '給料見える化ダッシュボード',
        description: 'スタッフの給与情報を透明化し、目標設定とインセンティブ管理を行うシステム。',
        category: 'enhancement',
        isEnabled: false, // デフォルトは無効
        rolloutPercentage: 0,
        config: JSON.stringify({
          showRealtimeEarnings: true,
          enableGoalSetting: true,
          showPeerComparison: false, // 同僚比較は慎重に
          enableIncentiveTracking: true,
          autoCalculateProjection: true
        })
      }
    });

    // インセンティブシステムのフィーチャーフラグ
    const incentiveSystemFlag = await prisma.featureFlag.upsert({
      where: { key: 'incentive_system' },
      update: {},
      create: {
        key: 'incentive_system',
        name: 'インセンティブシステム',
        description: 'パフォーマンスベースのインセンティブとボーナス管理システム。',
        category: 'enhancement',
        isEnabled: false,
        rolloutPercentage: 0,
        dependencies: JSON.stringify(['salary_transparency_dashboard']),
        config: JSON.stringify({
          enableAutoCalculation: true,
          enableCustomRules: true,
          enableTeamIncentives: true
        })
      }
    });

    // 地域別マッチングのフィーチャーフラグ
    const locationMatchingFlag = await prisma.featureFlag.upsert({
      where: { key: 'location_based_matching' },
      update: {},
      create: {
        key: 'location_based_matching',
        name: '地域別マッチング',
        description: '位置情報を活用した応援美容師の効率的なマッチング機能。',
        category: 'experimental',
        isEnabled: false,
        rolloutPercentage: 0,
        dependencies: JSON.stringify(['support_beautician_service']),
        config: JSON.stringify({
          useGPSLocation: true,
          maxSearchRadius: 20,
          enableTransportationCost: true
        })
      }
    });

    console.log('✅ Feature flags created successfully:');
    console.log(`- ${supportBeauticianFlag.name} (${supportBeauticianFlag.key})`);
    console.log(`- ${salaryDashboardFlag.name} (${salaryDashboardFlag.key})`);
    console.log(`- ${incentiveSystemFlag.name} (${incentiveSystemFlag.key})`);
    console.log(`- ${locationMatchingFlag.name} (${locationMatchingFlag.key})`);

    // プレミアム経営戦略ダッシュボードのフィーチャーフラグ
    const premiumDashboardFlag = await prisma.featureFlag.upsert({
      where: { key: 'premium_business_dashboard' },
      update: {},
      create: {
        key: 'premium_business_dashboard',
        name: 'プレミアム経営戦略ダッシュボード',
        description: 'AI分析による経営指標、競合分析、戦略的アクションプランを提供する高度な経営支援ツール',
        category: 'core',
        isEnabled: false,
        rolloutPercentage: 0,
        enabledPlans: JSON.stringify(['premium_ai']), // プレミアムプランのみ
        config: JSON.stringify({
          enableAIInsights: true,
          insightGenerationInterval: 'daily',
          competitorAnalysisEnabled: true,
          reportAutoGeneration: true,
          maxHistoricalDataDays: 365
        })
      }
    });

    console.log(`- ${premiumDashboardFlag.name} (${premiumDashboardFlag.key})`);

    console.log('\n📋 管理者は以下の手順で機能を有効化できます:');
    console.log('1. 管理画面 > 設定 > フィーチャーフラグ');
    console.log('2. 有効化したい機能を選択してON/OFF切り替え');
    console.log('3. 特定のプランやテナントのみに適用も可能');

  } catch (error) {
    console.error('❌ Error setting up feature flags:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  setupFeatureFlags()
    .then(() => {
      console.log('🎉 Feature flags setup completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupFeatureFlags };