import { logger } from '../utils/logger';
import { prisma } from '../database';

interface AutoSaveData {
  tenantId: string;
  userId: string;
  dataType: 'customer' | 'reservation' | 'message' | 'menu' | 'settings';
  entityId?: string;
  data: any;
  timestamp: Date;
}

interface AutoSaveRecord {
  id: string;
  tenantId: string;
  userId: string;
  dataType: string;
  entityId?: string;
  data: any;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class AutoSaveService {
  private static readonly CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24時間
  private static readonly MAX_RECORDS_PER_USER = 50; // ユーザーあたりの最大レコード数

  /**
   * 自動保存データを保存
   */
  static async saveData(data: AutoSaveData): Promise<string> {
    try {
      // 重複チェック（同じdataType + entityIdの場合は更新）
      const existingRecord = await prisma.autoSave.findFirst({
        where: {
          tenantId: data.tenantId,
          userId: data.userId,
          dataType: data.dataType,
          entityId: data.entityId || null,
        },
      });

      let savedRecord: AutoSaveRecord;

      if (existingRecord) {
        // 既存レコードを更新
        savedRecord = await prisma.autoSave.update({
          where: { id: existingRecord.id },
          data: {
            data: data.data,
            timestamp: data.timestamp,
            updatedAt: new Date(),
          },
        });
      } else {
        // 新規レコードを作成
        savedRecord = await prisma.autoSave.create({
          data: {
            tenantId: data.tenantId,
            userId: data.userId,
            dataType: data.dataType,
            entityId: data.entityId,
            data: data.data,
            timestamp: data.timestamp,
          },
        });
      }

      // ユーザーごとのレコード数制限チェック
      await this.cleanupUserRecords(data.tenantId, data.userId);

      logger.info('Auto-save data saved', {
        autoSaveId: savedRecord.id,
        dataType: data.dataType,
        entityId: data.entityId,
        tenantId: data.tenantId,
        userId: data.userId,
      });

      return savedRecord.id;
    } catch (error) {
      logger.error('Failed to save auto-save data', {
        error: error instanceof Error ? error.message : 'Unknown error',
        data,
      });
      throw new Error('自動保存に失敗しました');
    }
  }

  /**
   * 自動保存データを取得
   */
  static async getData(
    tenantId: string,
    userId: string,
    dataType: string,
    entityId?: string
  ): Promise<AutoSaveRecord | null> {
    try {
      const record = await prisma.autoSave.findFirst({
        where: {
          tenantId,
          userId,
          dataType,
          entityId: entityId || null,
        },
        orderBy: { updatedAt: 'desc' },
      });

      return record;
    } catch (error) {
      logger.error('Failed to get auto-save data', {
        error: error instanceof Error ? error.message : 'Unknown error',
        tenantId,
        userId,
        dataType,
        entityId,
      });
      return null;
    }
  }

  /**
   * ユーザーの全自動保存データを取得
   */
  static async getUserData(
    tenantId: string,
    userId: string,
    limit = 20
  ): Promise<AutoSaveRecord[]> {
    try {
      const records = await prisma.autoSave.findMany({
        where: {
          tenantId,
          userId,
        },
        orderBy: { updatedAt: 'desc' },
        take: limit,
      });

      return records;
    } catch (error) {
      logger.error('Failed to get user auto-save data', {
        error: error instanceof Error ? error.message : 'Unknown error',
        tenantId,
        userId,
      });
      return [];
    }
  }

  /**
   * 自動保存データを削除
   */
  static async deleteData(
    tenantId: string,
    userId: string,
    dataType: string,
    entityId?: string
  ): Promise<boolean> {
    try {
      await prisma.autoSave.deleteMany({
        where: {
          tenantId,
          userId,
          dataType,
          entityId: entityId || null,
        },
      });

      logger.info('Auto-save data deleted', {
        tenantId,
        userId,
        dataType,
        entityId,
      });

      return true;
    } catch (error) {
      logger.error('Failed to delete auto-save data', {
        error: error instanceof Error ? error.message : 'Unknown error',
        tenantId,
        userId,
        dataType,
        entityId,
      });
      return false;
    }
  }

  /**
   * ユーザーのレコード数制限チェックとクリーンアップ
   */
  private static async cleanupUserRecords(tenantId: string, userId: string): Promise<void> {
    try {
      const recordCount = await prisma.autoSave.count({
        where: { tenantId, userId },
      });

      if (recordCount > this.MAX_RECORDS_PER_USER) {
        // 古いレコードを削除
        const recordsToDelete = await prisma.autoSave.findMany({
          where: { tenantId, userId },
          orderBy: { updatedAt: 'asc' },
          take: recordCount - this.MAX_RECORDS_PER_USER,
          select: { id: true },
        });

        if (recordsToDelete.length > 0) {
          await prisma.autoSave.deleteMany({
            where: {
              id: { in: recordsToDelete.map(r => r.id) },
            },
          });

          logger.info('Cleaned up old auto-save records', {
            tenantId,
            userId,
            deletedCount: recordsToDelete.length,
          });
        }
      }
    } catch (error) {
      logger.error('Failed to cleanup user records', {
        error: error instanceof Error ? error.message : 'Unknown error',
        tenantId,
        userId,
      });
    }
  }

  /**
   * 古い自動保存データの定期クリーンアップ
   */
  static async cleanupOldRecords(): Promise<void> {
    try {
      const cutoffDate = new Date(Date.now() - this.CLEANUP_INTERVAL);
      
      const result = await prisma.autoSave.deleteMany({
        where: {
          updatedAt: { lt: cutoffDate },
        },
      });

      logger.info('Cleaned up old auto-save records', {
        deletedCount: result.count,
        cutoffDate: cutoffDate.toISOString(),
      });
    } catch (error) {
      logger.error('Failed to cleanup old records', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * 統計情報を取得
   */
  static async getStatistics(tenantId: string): Promise<{
    totalRecords: number;
    recordsByType: { [key: string]: number };
    recordsByUser: { userId: string; count: number }[];
  }> {
    try {
      const [totalRecords, recordsByType, recordsByUser] = await Promise.all([
        // 総レコード数
        prisma.autoSave.count({ where: { tenantId } }),
        
        // タイプ別レコード数
        prisma.autoSave.groupBy({
          by: ['dataType'],
          where: { tenantId },
          _count: { dataType: true },
        }),
        
        // ユーザー別レコード数
        prisma.autoSave.groupBy({
          by: ['userId'],
          where: { tenantId },
          _count: { userId: true },
          orderBy: { _count: { userId: 'desc' } },
          take: 10,
        }),
      ]);

      return {
        totalRecords,
        recordsByType: recordsByType.reduce((acc, item) => {
          acc[item.dataType] = item._count.dataType;
          return acc;
        }, {} as { [key: string]: number }),
        recordsByUser: recordsByUser.map(item => ({
          userId: item.userId,
          count: item._count.userId,
        })),
      };
    } catch (error) {
      logger.error('Failed to get auto-save statistics', {
        error: error instanceof Error ? error.message : 'Unknown error',
        tenantId,
      });
      
      return {
        totalRecords: 0,
        recordsByType: {},
        recordsByUser: [],
      };
    }
  }
}

// 定期クリーンアップのスケジューラー
let cleanupInterval: NodeJS.Timeout | null = null;

export const startAutoSaveCleanup = (): void => {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
  }

  // 毎時クリーンアップを実行
  cleanupInterval = setInterval(() => {
    AutoSaveService.cleanupOldRecords().catch(error => {
      logger.error('Auto-save cleanup failed', { error });
    });
  }, 60 * 60 * 1000); // 1時間ごと

  logger.info('Auto-save cleanup scheduler started');
};

export const stopAutoSaveCleanup = (): void => {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
    logger.info('Auto-save cleanup scheduler stopped');
  }
};