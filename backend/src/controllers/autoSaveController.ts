import { Request, Response } from 'express';
import { z } from 'zod';
import { createError, asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { AutoSaveService } from '../services/autoSaveService';

// Validation schemas
const saveDataSchema = z.object({
  dataType: z.enum(['customer', 'reservation', 'message', 'menu', 'settings']),
  entityId: z.string().optional(),
  data: z.any(),
  timestamp: z.string().transform((str) => new Date(str)),
});

const getDataSchema = z.object({
  dataType: z.string(),
  entityId: z.string().optional(),
});

/**
 * Save auto-save data
 */
export const saveAutoSaveData = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = saveDataSchema.parse(req.body);
  const tenantId = req.user!.tenantId;
  const userId = req.user!.userId;

  const autoSaveData = {
    tenantId,
    userId,
    dataType: validatedData.dataType,
    entityId: validatedData.entityId,
    data: validatedData.data,
    timestamp: validatedData.timestamp,
  };

  const savedId = await AutoSaveService.saveData(autoSaveData);

  res.status(200).json({
    success: true,
    message: 'Auto-save data saved successfully',
    id: savedId,
  });
});

/**
 * Get auto-save data
 */
export const getAutoSaveData = asyncHandler(async (req: Request, res: Response) => {
  const { dataType, entityId } = getDataSchema.parse(req.query);
  const tenantId = req.user!.tenantId;
  const userId = req.user!.userId;

  const data = await AutoSaveService.getData(tenantId, userId, dataType, entityId);

  if (!data) {
    return res.status(404).json({
      success: false,
      message: 'Auto-save data not found',
    });
  }

  res.status(200).json({
    success: true,
    data: {
      id: data.id,
      dataType: data.dataType,
      entityId: data.entityId,
      data: data.data,
      timestamp: data.timestamp,
      updatedAt: data.updatedAt,
    },
  });
});

/**
 * Get all user auto-save data
 */
export const getUserAutoSaveData = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user!.tenantId;
  const userId = req.user!.userId;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

  const dataList = await AutoSaveService.getUserData(tenantId, userId, limit);

  res.status(200).json({
    success: true,
    data: dataList.map(item => ({
      id: item.id,
      dataType: item.dataType,
      entityId: item.entityId,
      timestamp: item.timestamp,
      updatedAt: item.updatedAt,
      // データ本体はサイズが大きい可能性があるため、一覧では省略
    })),
    total: dataList.length,
  });
});

/**
 * Delete auto-save data
 */
export const deleteAutoSaveData = asyncHandler(async (req: Request, res: Response) => {
  const { dataType, entityId } = getDataSchema.parse(req.query);
  const tenantId = req.user!.tenantId;
  const userId = req.user!.userId;

  const success = await AutoSaveService.deleteData(tenantId, userId, dataType, entityId);

  if (!success) {
    throw createError('Failed to delete auto-save data', 500);
  }

  res.status(200).json({
    success: true,
    message: 'Auto-save data deleted successfully',
  });
});

/**
 * Get auto-save statistics (admin only)
 */
export const getAutoSaveStatistics = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user!.tenantId;
  
  // 管理者権限チェック
  if (req.user!.role !== 'ADMIN') {
    throw createError('Insufficient permissions', 403);
  }

  const statistics = await AutoSaveService.getStatistics(tenantId);

  res.status(200).json({
    success: true,
    statistics,
  });
});

/**
 * Restore data from auto-save
 */
export const restoreFromAutoSave = asyncHandler(async (req: Request, res: Response) => {
  const { dataType, entityId, targetId } = z.object({
    dataType: z.string(),
    entityId: z.string().optional(),
    targetId: z.string(), // 復元先のエンティティID
  }).parse(req.body);

  const tenantId = req.user!.tenantId;
  const userId = req.user!.userId;

  // 自動保存データを取得
  const autoSaveData = await AutoSaveService.getData(tenantId, userId, dataType, entityId);
  
  if (!autoSaveData) {
    throw createError('Auto-save data not found', 404);
  }

  // データタイプに応じて復元処理を実行
  let restoredEntity: any;

  switch (dataType) {
    case 'customer':
      restoredEntity = await restoreCustomerData(autoSaveData.data, targetId, tenantId);
      break;
    case 'reservation':
      restoredEntity = await restoreReservationData(autoSaveData.data, targetId, tenantId);
      break;
    case 'message':
      restoredEntity = await restoreMessageData(autoSaveData.data, targetId, tenantId);
      break;
    case 'menu':
      restoredEntity = await restoreMenuData(autoSaveData.data, targetId, tenantId);
      break;
    case 'settings':
      restoredEntity = await restoreSettingsData(autoSaveData.data, targetId, tenantId);
      break;
    default:
      throw createError('Unsupported data type for restoration', 400);
  }

  // 復元成功後、自動保存データを削除
  await AutoSaveService.deleteData(tenantId, userId, dataType, entityId);

  // ログ記録
  logger.info('Data restored from auto-save', {
    tenantId,
    userId,
    dataType,
    entityId,
    targetId,
    autoSaveId: autoSaveData.id,
  });

  res.status(200).json({
    success: true,
    message: 'Data restored successfully',
    restoredEntity,
  });
});

// 復元処理のヘルパー関数
async function restoreCustomerData(data: any, targetId: string, tenantId: string) {
  const { prisma } = require('../database');
  
  return await prisma.customer.update({
    where: { id: targetId, tenantId },
    data: {
      name: data.name,
      nameKana: data.nameKana,
      email: data.email,
      phone: data.phone,
      address: data.address,
      notes: data.notes,
      // その他の復元可能なフィールド
    },
  });
}

async function restoreReservationData(data: any, targetId: string, tenantId: string) {
  const { prisma } = require('../database');
  
  return await prisma.reservation.update({
    where: { id: targetId, tenantId },
    data: {
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
      notes: data.notes,
      status: data.status,
      // その他の復元可能なフィールド
    },
  });
}

async function restoreMessageData(data: any, targetId: string, tenantId: string) {
  const { prisma } = require('../database');
  
  return await prisma.message.update({
    where: { id: targetId, tenantId },
    data: {
      content: data.content,
      messageType: data.messageType,
      // その他の復元可能なフィールド
    },
  });
}

async function restoreMenuData(data: any, targetId: string, tenantId: string) {
  const { prisma } = require('../database');
  
  return await prisma.menu.update({
    where: { id: targetId, tenantId },
    data: {
      name: data.name,
      description: data.description,
      price: data.price,
      duration: data.duration,
      // その他の復元可能なフィールド
    },
  });
}

async function restoreSettingsData(data: any, targetId: string, tenantId: string) {
  const { prisma } = require('../database');
  
  // テナント設定の更新
  return await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      settings: data,
    },
  });
}