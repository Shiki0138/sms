import { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';
import { logger } from '../utils/logger';

// Redis接続設定
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  enableReadyCheck: false,
  maxRetriesPerRequest: 3,
  lazyConnect: true
});

// Redis接続状態の監視
redis.on('connect', () => {
  logger.info('💾 美容室キャッシュシステム接続開始');
});

redis.on('ready', () => {
  logger.info('✨ 美容室キャッシュシステム準備完了 - 高速レスポンス開始！');
});

redis.on('error', (err) => {
  logger.error('🚨 美容室キャッシュシステムエラー:', err);
});

redis.on('close', () => {
  logger.warn('⚠️ 美容室キャッシュシステム接続終了');
});

export interface CacheOptions {
  duration?: number; // キャッシュ期間（秒）
  keyPrefix?: string; // キープレフィックス
  skipCache?: boolean; // キャッシュをスキップ
  varyBy?: string[]; // キャッシュキーのバリエーション
}

/**
 * 🚀 美容室スタッフが感動する超高速キャッシュミドルウェア
 * 顧客分析、予約検索、メッセージ取得を瞬間表示
 */
export const cacheMiddleware = (options: CacheOptions = {}) => {
  const {
    duration = 300, // デフォルト5分
    keyPrefix = 'salon',
    skipCache = false,
    varyBy = ['tenantId']
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    // キャッシュスキップ条件
    if (skipCache || req.method !== 'GET') {
      return next();
    }

    try {
      // キャッシュキー生成
      const cacheKey = generateCacheKey(req, keyPrefix, varyBy);
      
      // キャッシュから取得試行
      const cached = await redis.get(cacheKey);
      
      if (cached) {
        // 🎯 キャッシュヒット - 美容室スタッフに瞬間レスポンス！
        logger.info(`⚡ キャッシュヒット: ${cacheKey} - 瞬間レスポンス提供！`);
        
        const data = JSON.parse(cached);
        return res.json({
          ...data,
          _cached: true,
          _cacheHit: new Date().toISOString()
        });
      }

      // キャッシュミス - レスポンスをキャッシュに保存
      const originalJson = res.json;
      res.json = function(data: any) {
        // 成功レスポンスのみキャッシュ
        if (res.statusCode >= 200 && res.statusCode < 300) {
          redis.setex(cacheKey, duration, JSON.stringify(data))
            .then(() => {
              logger.info(`💾 キャッシュ保存: ${cacheKey} (${duration}秒)`);
            })
            .catch((err) => {
              logger.error('キャッシュ保存エラー:', err);
            });
        }
        
        return originalJson.call(this, {
          ...data,
          _cached: false,
          _cacheSaved: new Date().toISOString()
        });
      };

      next();
    } catch (error) {
      // キャッシュエラーでもサービス継続
      logger.error('キャッシュミドルウェアエラー:', error);
      next();
    }
  };
};

/**
 * 美容室業務に特化したキャッシュキー生成
 */
function generateCacheKey(req: Request, prefix: string, varyBy: string[]): string {
  const baseKey = `${prefix}:${req.route?.path || req.path}`;
  
  const variations = varyBy.map(key => {
    const value = req.query[key] || req.params[key] || req.headers[key];
    return `${key}:${value}`;
  }).join(':');
  
  return `${baseKey}:${variations}`;
}

/**
 * 🗂️ 美容室業務別キャッシュ戦略
 */
export const SalonCacheStrategies = {
  // 顧客一覧 - 15分キャッシュ（頻繁に参照、あまり変更されない）
  customerList: cacheMiddleware({
    duration: 900, // 15分
    keyPrefix: 'customers',
    varyBy: ['tenantId', 'page', 'limit', 'search']
  }),

  // 分析データ - 1時間キャッシュ（重い処理、リアルタイム性は重要でない）
  analytics: cacheMiddleware({
    duration: 3600, // 1時間
    keyPrefix: 'analytics',
    varyBy: ['tenantId', 'period', 'segment']
  }),

  // 予約カレンダー - 5分キャッシュ（リアルタイム性重要）
  reservations: cacheMiddleware({
    duration: 300, // 5分
    keyPrefix: 'reservations',
    varyBy: ['tenantId', 'date', 'staffId']
  }),

  // メッセージ一覧 - 2分キャッシュ（最新性重要）
  messages: cacheMiddleware({
    duration: 120, // 2分
    keyPrefix: 'messages',
    varyBy: ['tenantId', 'status', 'channel']
  }),

  // スタッフパフォーマンス - 6時間キャッシュ（日次更新）
  staffPerformance: cacheMiddleware({
    duration: 21600, // 6時間
    keyPrefix: 'staff-performance',
    varyBy: ['tenantId', 'month']
  }),

  // 顧客プリファレンス - 30分キャッシュ
  customerPreferences: cacheMiddleware({
    duration: 1800, // 30分
    keyPrefix: 'preferences',
    varyBy: ['tenantId', 'customerId']
  })
};

/**
 * 🧹 美容室終業時のキャッシュクリーンアップ
 */
export const endOfDayCacheCleanup = async (tenantId: string) => {
  try {
    logger.info(`🌙 ${tenantId} - 一日の終わりのキャッシュクリーンアップ開始`);
    
    const patterns = [
      `salon:*:tenantId:${tenantId}*`,
      `customers:*:tenantId:${tenantId}*`,
      `messages:*:tenantId:${tenantId}*`,
      `reservations:*:tenantId:${tenantId}*`
    ];

    let totalDeleted = 0;
    
    for (const pattern of patterns) {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        const deleted = await redis.del(...keys);
        totalDeleted += deleted;
        logger.info(`  ✨ ${pattern}: ${deleted}件削除`);
      }
    }

    logger.info(`🎉 キャッシュクリーンアップ完了: 合計${totalDeleted}件削除`);
    
    return {
      success: true,
      deletedCount: totalDeleted,
      message: '今日も一日お疲れ様でした！キャッシュをクリーンアップしました'
    };
  } catch (error) {
    logger.error('キャッシュクリーンアップエラー:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * 🔥 緊急時のキャッシュパージ
 */
export const emergencyCachePurge = async (tenantId?: string) => {
  try {
    logger.warn('🚨 緊急キャッシュパージ実行');
    
    if (tenantId) {
      // 特定テナントのキャッシュのみ削除
      const pattern = `*tenantId:${tenantId}*`;
      const keys = await redis.keys(pattern);
      
      if (keys.length > 0) {
        await redis.del(...keys);
        logger.info(`⚡ テナント${tenantId}のキャッシュ${keys.length}件を緊急削除`);
      }
    } else {
      // 全キャッシュ削除
      await redis.flushdb();
      logger.warn('🔥 全キャッシュを緊急削除しました');
    }

    return { success: true, message: '緊急キャッシュパージ完了' };
  } catch (error) {
    logger.error('緊急キャッシュパージエラー:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

/**
 * 📊 キャッシュ統計情報
 */
export const getCacheStats = async () => {
  try {
    const info = await redis.info('memory');
    const stats = await redis.info('stats');
    
    return {
      memory: {
        used: extractInfoValue(info, 'used_memory_human'),
        peak: extractInfoValue(info, 'used_memory_peak_human'),
        rss: extractInfoValue(info, 'used_memory_rss_human')
      },
      stats: {
        totalCommands: extractInfoValue(stats, 'total_commands_processed'),
        hitRate: calculateHitRate(stats),
        keyspace: await redis.dbsize()
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logger.error('キャッシュ統計取得エラー:', error);
    return null;
  }
};

// ヘルパー関数
function extractInfoValue(info: string, key: string): string {
  const match = info.match(new RegExp(`${key}:(.+)`));
  return match ? match[1].trim() : 'N/A';
}

function calculateHitRate(stats: string): string {
  const hits = extractInfoValue(stats, 'keyspace_hits');
  const misses = extractInfoValue(stats, 'keyspace_misses');
  
  if (hits === 'N/A' || misses === 'N/A') return 'N/A';
  
  const totalRequests = parseInt(hits) + parseInt(misses);
  if (totalRequests === 0) return '0%';
  
  const hitRate = (parseInt(hits) / totalRequests) * 100;
  return `${hitRate.toFixed(2)}%`;
}

export { redis };
export default SalonCacheStrategies;