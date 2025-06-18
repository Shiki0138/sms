import { PrismaClient } from '@prisma/client';
import { FeatureFlagService } from '../src/services/featureFlagService';

const prisma = new PrismaClient();

async function setupFeatureFlags() {
  console.log('🚀 Starting feature flags setup...');
  
  try {
    // 1. 初期フィーチャーフラグを作成
    console.log('📋 Creating initial feature flags...');
    await FeatureFlagService.setupInitialFeatureFlags();
    console.log('✅ Initial feature flags created');

    // 2. 本番環境向け設定を適用
    console.log('🔧 Applying production settings...');
    await FeatureFlagService.setupProductionFlags();
    console.log('✅ Production settings applied');

    // 3. 設定結果を確認
    console.log('📊 Verifying setup...');
    const allFlags = await FeatureFlagService.getAllFeatureFlags();
    console.log(`✅ Total feature flags: ${allFlags.length}`);
    
    const enabledFlags = allFlags.filter(f => f.isEnabled);
    console.log(`✅ Enabled feature flags: ${enabledFlags.length}`);
    
    const betaFlags = allFlags.filter(f => f.category === 'beta');
    console.log(`✅ Beta feature flags: ${betaFlags.length}`);
    
    const premiumFlags = allFlags.filter(f => {
      const plans = f.enabledPlans ? JSON.parse(f.enabledPlans) : [];
      return plans.includes('premium_ai');
    });
    console.log(`✅ Premium feature flags: ${premiumFlags.length}`);

    // 4. 段階的リリース状況を表示
    console.log('\n📈 Rollout Status:');
    const rolloutFlags = allFlags.filter(f => f.rolloutPercentage > 0 && f.rolloutPercentage < 100);
    rolloutFlags.forEach(flag => {
      console.log(`  - ${flag.name}: ${flag.rolloutPercentage}%`);
    });

    console.log('\n🎉 Feature flags setup completed successfully!');
    
    // 5. 管理者向けの情報
    console.log('\n📝 Next Steps:');
    console.log('1. Access admin dashboard to manage feature flags');
    console.log('2. Monitor rollout progress and user feedback');
    console.log('3. Gradually increase rollout percentages for stable features');
    console.log('4. Use beta features for early adopters');
    
  } catch (error) {
    console.error('❌ Error setting up feature flags:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function validateDependencies() {
  console.log('🔍 Validating dependencies...');
  
  // データベース接続確認
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }

  // 必要なテーブルが存在するか確認
  try {
    await prisma.featureFlag.findFirst();
    console.log('✅ FeatureFlag table exists');
  } catch (error) {
    console.error('❌ FeatureFlag table not found. Run prisma migrate deploy first.');
    return false;
  }

  return true;
}

async function main() {
  console.log('🎯 Salon Management System - Feature Flags Setup');
  console.log('================================================\n');

  const isValid = await validateDependencies();
  if (!isValid) {
    console.log('\n❌ Dependency validation failed. Please fix the issues above.');
    process.exit(1);
  }

  await setupFeatureFlags();
}

// スクリプト実行
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });
}

export { setupFeatureFlags, validateDependencies };