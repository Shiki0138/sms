import { Request, Response } from 'express';
import { getNotificationService } from '../services/notificationService';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// バリデーションスキーマ
const SendNotificationSchema = z.object({
  type: z.enum(['NEW_MESSAGE', 'RESERVATION_CHANGE', 'URGENT_ALERT', 'SYSTEM_NOTIFICATION']),
  title: z.string().min(1, 'タイトルは必須です'),
  message: z.string().min(1, 'メッセージは必須です'),
  staffId: z.string().optional(),
  customerId: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
});

const GetNotificationsSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  staffId: z.string().optional(),
  isRead: z.boolean().optional(),
  type: z.string().optional(),
  priority: z.string().optional(),
});

export class NotificationController {
  /**
   * 通知送信
   */
  async sendNotification(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.headers['x-tenant-id'] as string || 'default-tenant';
      const validatedData = SendNotificationSchema.parse(req.body);
      
      const notificationService = getNotificationService();
      
      await notificationService.sendNotification({
        ...validatedData,
        tenantId,
      });
      
      res.status(201).json({
        success: true,
        message: '通知を送信しました',
      });
    } catch (error: any) {
      console.error('通知送信エラー:', error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'バリデーションエラー',
          details: error.errors,
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        error: error.message || 'サーバーエラーが発生しました',
      });
    }
  }

  /**
   * 通知履歴取得
   */
  async getNotifications(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.headers['x-tenant-id'] as string || 'default-tenant';
      const query = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        staffId: req.query.staffId as string,
        isRead: req.query.isRead === 'true' ? true : req.query.isRead === 'false' ? false : undefined,
        type: req.query.type as string,
        priority: req.query.priority as string,
      };
      
      const validatedQuery = GetNotificationsSchema.parse(query);
      const { page, limit, staffId, isRead, type, priority } = validatedQuery;
      
      const offset = (page - 1) * limit;
      
      const where: any = {
        tenantId,
        ...(staffId && { staffId }),
        ...(isRead !== undefined && { isRead }),
        ...(type && { type }),
        ...(priority && { priority }),
      };
      
      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: offset,
          take: limit,
          include: {
            staff: {
              select: { id: true, name: true },
            },
            customer: {
              select: { id: true, name: true },
            },
          },
        }),
        prisma.notification.count({ where }),
      ]);
      
      res.json({
        success: true,
        data: {
          notifications: notifications.map(notif => ({
            id: notif.id,
            type: notif.type,
            title: notif.title,
            message: notif.message,
            priority: notif.priority,
            isRead: notif.isRead,
            readAt: notif.readAt,
            createdAt: notif.createdAt,
            staff: notif.staff,
            customer: notif.customer,
            metadata: notif.metadata ? JSON.parse(notif.metadata) : null,
          })),
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrev: page > 1,
          },
        },
      });
    } catch (error: any) {
      console.error('通知履歴取得エラー:', error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'バリデーションエラー',
          details: error.errors,
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        error: error.message || 'サーバーエラーが発生しました',
      });
    }
  }

  /**
   * 未読通知数取得
   */
  async getUnreadCount(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.headers['x-tenant-id'] as string || 'default-tenant';
      const staffId = req.query.staffId as string;
      
      const where: any = {
        tenantId,
        isRead: false,
        ...(staffId && { staffId }),
      };
      
      const count = await prisma.notification.count({ where });
      
      res.json({
        success: true,
        data: { unreadCount: count },
      });
    } catch (error: any) {
      console.error('未読通知数取得エラー:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'サーバーエラーが発生しました',
      });
    }
  }

  /**
   * 通知既読処理
   */
  async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.headers['x-tenant-id'] as string || 'default-tenant';
      const { notificationId } = req.params;
      
      const notification = await prisma.notification.findFirst({
        where: { id: notificationId, tenantId },
      });
      
      if (!notification) {
        res.status(404).json({
          success: false,
          error: '通知が見つかりません',
        });
        return;
      }
      
      await prisma.notification.update({
        where: { id: notificationId },
        data: { 
          isRead: true,
          readAt: new Date(),
        },
      });
      
      res.json({
        success: true,
        message: '通知を既読にしました',
      });
    } catch (error: any) {
      console.error('通知既読処理エラー:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'サーバーエラーが発生しました',
      });
    }
  }

  /**
   * 一括既読処理
   */
  async markAllAsRead(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.headers['x-tenant-id'] as string || 'default-tenant';
      const staffId = req.body.staffId as string;
      
      const where: any = {
        tenantId,
        isRead: false,
        ...(staffId && { staffId }),
      };
      
      const result = await prisma.notification.updateMany({
        where,
        data: { 
          isRead: true,
          readAt: new Date(),
        },
      });
      
      res.json({
        success: true,
        message: `${result.count}件の通知を既読にしました`,
        data: { updatedCount: result.count },
      });
    } catch (error: any) {
      console.error('一括既読処理エラー:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'サーバーエラーが発生しました',
      });
    }
  }

  /**
   * 通知削除
   */
  async deleteNotification(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.headers['x-tenant-id'] as string || 'default-tenant';
      const { notificationId } = req.params;
      
      const notification = await prisma.notification.findFirst({
        where: { id: notificationId, tenantId },
      });
      
      if (!notification) {
        res.status(404).json({
          success: false,
          error: '通知が見つかりません',
        });
        return;
      }
      
      await prisma.notification.delete({
        where: { id: notificationId },
      });
      
      res.json({
        success: true,
        message: '通知を削除しました',
      });
    } catch (error: any) {
      console.error('通知削除エラー:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'サーバーエラーが発生しました',
      });
    }
  }

  /**
   * 接続状況取得（管理用）
   */
  async getConnectionStatus(req: Request, res: Response): Promise<void> {
    try {
      const notificationService = getNotificationService();
      const stats = notificationService.getConnectionStats();
      const connectedUsers = notificationService.getConnectedUsers();
      
      res.json({
        success: true,
        data: {
          stats: {
            totalConnections: stats.totalConnections,
            tenantConnections: Object.fromEntries(stats.tenantConnections),
            staffConnections: Object.fromEntries(stats.staffConnections),
          },
          connectedUsers: connectedUsers.map(user => ({
            socketId: user.socketId,
            tenantId: user.tenantId,
            staffId: user.staffId,
            role: user.role,
            connectedAt: user.connectedAt,
            lastActivity: user.lastActivity,
          })),
        },
      });
    } catch (error: any) {
      console.error('接続状況取得エラー:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'サーバーエラーが発生しました',
      });
    }
  }

  /**
   * 通知統計取得
   */
  async getNotificationStats(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.headers['x-tenant-id'] as string || 'default-tenant';
      const days = parseInt(req.query.days as string) || 7;
      
      const since = new Date();
      since.setDate(since.getDate() - days);
      
      const [typeStats, priorityStats, dailyStats] = await Promise.all([
        // タイプ別統計
        prisma.notification.groupBy({
          by: ['type'],
          where: { tenantId, createdAt: { gte: since } },
          _count: { id: true },
        }),
        
        // 優先度別統計
        prisma.notification.groupBy({
          by: ['priority'],
          where: { tenantId, createdAt: { gte: since } },
          _count: { id: true },
        }),
        
        // 日別統計
        prisma.$queryRaw`
          SELECT 
            DATE(createdAt) as date,
            COUNT(*) as count,
            SUM(CASE WHEN isRead = 1 THEN 1 ELSE 0 END) as readCount
          FROM notifications 
          WHERE tenantId = ${tenantId} 
            AND createdAt >= ${since}
          GROUP BY DATE(createdAt)
          ORDER BY date DESC
        ` as any,
      ]) as [any[], any[], any[]];
      
      res.json({
        success: true,
        data: {
          period: `${days}日間`,
          typeStats: typeStats.map(stat => ({
            type: stat.type,
            count: stat._count.id,
          })),
          priorityStats: priorityStats.map(stat => ({
            priority: stat.priority,
            count: stat._count.id,
          })),
          dailyStats: dailyStats.map(stat => ({
            date: stat.date,
            total: Number(stat.count),
            read: Number(stat.readCount),
            unread: Number(stat.count) - Number(stat.readCount),
          })),
        },
      });
    } catch (error: any) {
      console.error('通知統計取得エラー:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'サーバーエラーが発生しました',
      });
    }
  }
}

export const notificationController = new NotificationController();