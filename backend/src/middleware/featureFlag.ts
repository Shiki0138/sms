import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// フィーチャーフラグをチェックする関数
export async function checkFeatureFlag(
  flagKey: string, 
  tenantId?: string, 
  planType?: string
): Promise<boolean> {
  try {
    // フィーチャーフラグの基本情報を取得
    const featureFlag = await prisma.featureFlag.findUnique({
      where: { key: flagKey }
    });

    if (!featureFlag) {
      console.warn(`Feature flag not found: ${flagKey}`);
      return false;
    }

    // グローバルに無効化されている場合
    if (!featureFlag.isEnabled) {
      return false;
    }

    // テナント固有の設定がある場合
    if (tenantId) {
      const tenantFlag = await prisma.tenantFeatureFlag.findUnique({
        where: {
          tenantId_featureFlagId: {
            tenantId,
            featureFlagId: featureFlag.id
          }
        }
      });

      if (tenantFlag) {
        return tenantFlag.isEnabled;
      }
    }

    // プラン制限の確認
    if (featureFlag.enabledPlans && planType) {
      const enabledPlans = JSON.parse(featureFlag.enabledPlans);
      if (!enabledPlans.includes(planType)) {
        return false;
      }
    }

    // 特定テナントのみ有効化の確認
    if (featureFlag.enabledTenants && tenantId) {
      const enabledTenants = JSON.parse(featureFlag.enabledTenants);
      if (!enabledTenants.includes(tenantId)) {
        return false;
      }
    }

    // ロールアウト率の確認（簡易実装）
    if (featureFlag.rolloutPercentage < 100) {
      const hash = hashString(tenantId || 'default');
      const percentage = hash % 100;
      if (percentage >= featureFlag.rolloutPercentage) {
        return false;
      }
    }

    return true;

  } catch (error) {
    console.error(`Error checking feature flag ${flagKey}:`, error);
    return false; // エラー時は安全側に倒す
  }
}

// テナント用フィーチャーフラグを有効化
export async function enableFeatureForTenant(
  flagKey: string, 
  tenantId: string, 
  config?: any
): Promise<boolean> {
  try {
    const featureFlag = await prisma.featureFlag.findUnique({
      where: { key: flagKey }
    });

    if (!featureFlag) {
      throw new Error(`Feature flag not found: ${flagKey}`);
    }

    await prisma.tenantFeatureFlag.upsert({
      where: {
        tenantId_featureFlagId: {
          tenantId,
          featureFlagId: featureFlag.id
        }
      },
      update: {
        isEnabled: true,
        config: config ? JSON.stringify(config) : null
      },
      create: {
        tenantId,
        featureFlagId: featureFlag.id,
        isEnabled: true,
        config: config ? JSON.stringify(config) : null
      }
    });

    return true;

  } catch (error) {
    console.error(`Error enabling feature flag ${flagKey} for tenant ${tenantId}:`, error);
    return false;
  }
}

// テナント用フィーチャーフラグを無効化
export async function disableFeatureForTenant(
  flagKey: string, 
  tenantId: string
): Promise<boolean> {
  try {
    const featureFlag = await prisma.featureFlag.findUnique({
      where: { key: flagKey }
    });

    if (!featureFlag) {
      throw new Error(`Feature flag not found: ${flagKey}`);
    }

    await prisma.tenantFeatureFlag.upsert({
      where: {
        tenantId_featureFlagId: {
          tenantId,
          featureFlagId: featureFlag.id
        }
      },
      update: {
        isEnabled: false
      },
      create: {
        tenantId,
        featureFlagId: featureFlag.id,
        isEnabled: false
      }
    });

    return true;

  } catch (error) {
    console.error(`Error disabling feature flag ${flagKey} for tenant ${tenantId}:`, error);
    return false;
  }
}

// 管理者用: 全てのフィーチャーフラグを取得
export async function getAllFeatureFlags(tenantId?: string) {
  try {
    const flags = await prisma.featureFlag.findMany({
      orderBy: { category: 'asc' }
    });

    return flags;

  } catch (error) {
    console.error('Error getting feature flags:', error);
    return [];
  }
}

// フィーチャーフラグの設定を取得
export async function getFeatureFlagConfig(flagKey: string, tenantId?: string) {
  try {
    const featureFlag = await prisma.featureFlag.findUnique({
      where: { key: flagKey }
    });

    if (!featureFlag) return null;

    // デフォルト設定を返す
    return featureFlag.config ? JSON.parse(featureFlag.config) : null;

  } catch (error) {
    console.error(`Error getting feature flag config for ${flagKey}:`, error);
    return null;
  }
}

// 簡易ハッシュ関数（ロールアウト率計算用）
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 32bit整数に変換
  }
  return Math.abs(hash);
}

// Express ミドルウェア：フィーチャーフラグチェック
export function requireFeatureFlag(flagKey: string) {
  return async (req: any, res: any, next: any) => {
    try {
      const isEnabled = await checkFeatureFlag(flagKey, req.tenantId, req.tenant?.plan);
      
      if (!isEnabled) {
        return res.status(403).json({
          error: `Feature '${flagKey}' is not enabled for this tenant`,
          code: 'FEATURE_DISABLED'
        });
      }

      next();
    } catch (error) {
      console.error(`Feature flag middleware error for ${flagKey}:`, error);
      res.status(500).json({
        error: 'Feature flag check failed',
        code: 'FEATURE_CHECK_ERROR'
      });
    }
  };
}