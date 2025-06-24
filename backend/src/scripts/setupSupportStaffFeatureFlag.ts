import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setupSupportStaffFeatureFlag() {
  try {
    // 応援スタッフプラットフォーム機能のフィーチャーフラグを作成
    const featureFlag = await prisma.featureFlag.upsert({
      where: { key: 'support_staff_platform' },
      update: {
        name: '応援スタッフプラットフォーム',
        description: '美容師の臨時勤務マッチングプラットフォーム機能',
        category: 'beta',
        isEnabled: true, // 有効化
        rolloutPercentage: 0,
        enabledPlans: JSON.stringify(['premium_ai']), // プレミアムプランのみ
        config: JSON.stringify({
          maxDistance: 30, // デフォルト検索距離（km）
          minHourlyRate: 1500, // 最低時給
          maxApplications: 20, // 最大応募数
          requireVerification: true // 本人確認必須
        })
      },
      create: {
        key: 'support_staff_platform',
        name: '応援スタッフプラットフォーム',
        description: '美容師の臨時勤務マッチングプラットフォーム機能',
        category: 'beta',
        isEnabled: true,
        rolloutPercentage: 0,
        enabledPlans: JSON.stringify(['premium_ai']),
        config: JSON.stringify({
          maxDistance: 30,
          minHourlyRate: 1500,
          maxApplications: 20,
          requireVerification: true
        })
      }
    });

    console.log('✅ 応援スタッフプラットフォーム機能のフィーチャーフラグを設定しました');
    console.log('  - key:', featureFlag.key);
    console.log('  - isEnabled:', featureFlag.isEnabled);
    console.log('  - category:', featureFlag.category);
    console.log('  - enabledPlans:', featureFlag.enabledPlans);

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupSupportStaffFeatureFlag();