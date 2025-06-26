import { Server as SocketServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

// バリデーションスキーマ
const NotificationSchema = z.object({
  type: z.enum(['NEW_MESSAGE', 'RESERVATION_CHANGE', 'URGENT_ALERT', 'SYSTEM_NOTIFICATION']),
  title: z.string().min(1, 'タイトルは必須です'),
  message: z.string().min(1, 'メッセージは必須です'),
  tenantId: z.string().min(1, 'テナントIDは必須です'),
  staffId: z.string().optional(),
  customerId: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
});

const JoinRoomSchema = z.object({
  tenantId: z.string().min(1, 'テナントIDは必須です'),
  staffId: z.string().optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'STAFF']).optional(),
});

export interface NotificationData {
  id: string;
  type: 'NEW_MESSAGE' | 'RESERVATION_CHANGE' | 'URGENT_ALERT' | 'SYSTEM_NOTIFICATION';
  title: string;
  message: string;
  tenantId: string;
  staffId?: string;
  customerId?: string;
  metadata?: Record<string, any>;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  timestamp: string;
  isRead: boolean;
}

export interface ConnectedUser {
  socketId: string;
  tenantId: string;
  staffId?: string;
  role?: string;
  connectedAt: Date;
  lastActivity: Date;
}

export class NotificationService {
  private io: SocketServer;
  private connectedUsers: Map<string, ConnectedUser> = new Map();
  private userSockets: Map<string, Set<string>> = new Map(); // staffId -> Set<socketId>

  constructor(httpServer: HttpServer) {
    this.io = new SocketServer(httpServer, {
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? ['https://yourdomain.com'] 
          : ['http://localhost:4003', 'http://localhost:5173'],
        methods: ['GET', 'POST'],
        credentials: true,
      },
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    });

    this.setupEventHandlers();
    logger.info('🔔 NotificationService initialized');
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      logger.info(`New socket connection: ${socket.id}`);

      // 接続認証・ルーム参加
      socket.on('join_room', async (data: any) => {
        try {
          const validatedData = JoinRoomSchema.parse(data);
          await this.handleJoinRoom(socket, validatedData);
        } catch (error: any) {
          socket.emit('error', { 
            message: 'ルーム参加エラー', 
            error: error.message 
          });
          logger.error('Join room error:', error);
        }
      });

      // 通知既読処理
      socket.on('mark_notification_read', async (notificationId: string) => {
        try {
          await this.markNotificationAsRead(notificationId);
          socket.emit('notification_marked_read', { notificationId });
        } catch (error: any) {
          socket.emit('error', { 
            message: '既読処理エラー', 
            error: error.message 
          });
          logger.error('Mark notification read error:', error);
        }
      });

      // 接続状態確認
      socket.on('ping', () => {
        socket.emit('pong');
        this.updateUserActivity(socket.id);
      });

      // 切断処理
      socket.on('disconnect', (reason) => {
        this.handleDisconnection(socket.id, reason);
      });

      // エラーハンドリング
      socket.on('error', (error) => {
        logger.error(`Socket error for ${socket.id}:`, error);
      });
    });

    // 定期的な接続状態チェック
    setInterval(() => {
      this.cleanupInactiveConnections();
    }, 30000); // 30秒毎
  }

  private async handleJoinRoom(socket: Socket, data: z.infer<typeof JoinRoomSchema>): Promise<void> {
    const { tenantId, staffId, role } = data;

    // スタッフの存在確認（staffIdが提供された場合）
    if (staffId) {
      const staff = await prisma.staff.findFirst({
        where: { id: staffId, tenantId, isActive: true },
      });

      if (!staff) {
        throw new Error('無効なスタッフIDです');
      }
    }

    // ルームに参加
    const roomName = `tenant_${tenantId}`;
    await socket.join(roomName);

    if (staffId) {
      const staffRoomName = `staff_${staffId}`;
      await socket.join(staffRoomName);
    }

    // 接続ユーザー情報を保存
    const connectedUser: ConnectedUser = {
      socketId: socket.id,
      tenantId,
      staffId,
      role,
      connectedAt: new Date(),
      lastActivity: new Date(),
    };

    this.connectedUsers.set(socket.id, connectedUser);

    if (staffId) {
      if (!this.userSockets.has(staffId)) {
        this.userSockets.set(staffId, new Set());
      }
      this.userSockets.get(staffId)!.add(socket.id);
    }

    // 接続確認通知
    socket.emit('room_joined', {
      roomName,
      tenantId,
      staffId,
      timestamp: new Date().toISOString(),
    });

    // 未読通知を送信
    if (staffId) {
      const unreadNotifications = await this.getUnreadNotifications(tenantId, staffId);
      if (unreadNotifications.length > 0) {
        socket.emit('unread_notifications', unreadNotifications);
      }
    }

    logger.info(`Socket ${socket.id} joined room ${roomName} (staff: ${staffId})`);
  }

  private handleDisconnection(socketId: string, reason: string): void {
    const user = this.connectedUsers.get(socketId);
    if (user) {
      // ユーザーソケットマップから削除
      if (user.staffId) {
        const userSocketSet = this.userSockets.get(user.staffId);
        if (userSocketSet) {
          userSocketSet.delete(socketId);
          if (userSocketSet.size === 0) {
            this.userSockets.delete(user.staffId);
          }
        }
      }

      this.connectedUsers.delete(socketId);
      logger.info(`Socket ${socketId} disconnected (reason: ${reason}, staff: ${user.staffId})`);
    }
  }

  private updateUserActivity(socketId: string): void {
    const user = this.connectedUsers.get(socketId);
    if (user) {
      user.lastActivity = new Date();
    }
  }

  private cleanupInactiveConnections(): void {
    const now = new Date();
    const timeout = 5 * 60 * 1000; // 5分

    for (const [socketId, user] of this.connectedUsers.entries()) {
      if (now.getTime() - user.lastActivity.getTime() > timeout) {
        logger.info(`Cleaning up inactive connection: ${socketId}`);
        this.handleDisconnection(socketId, 'inactive');
        const socket = this.io.sockets.sockets.get(socketId);
        if (socket) {
          socket.disconnect(true);
        }
      }
    }
  }

  // 通知送信メソッド
  async sendNotification(notification: Omit<NotificationData, 'id' | 'timestamp' | 'isRead'>): Promise<void> {
    try {
      const validatedData = NotificationSchema.parse(notification);
      
      const notificationData: NotificationData = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: validatedData.type,
        title: validatedData.title,
        message: validatedData.message,
        tenantId: validatedData.tenantId,
        priority: validatedData.priority,
        staffId: validatedData.staffId,
        customerId: validatedData.customerId,
        metadata: validatedData.metadata,
        timestamp: new Date().toISOString(),
        isRead: false,
      };

      // データベースに保存
      await this.saveNotification(notificationData);

      // リアルタイム配信
      await this.broadcastNotification(notificationData);

      logger.info(`Notification sent: ${notificationData.type} to tenant ${notificationData.tenantId}`);
    } catch (error: any) {
      logger.error('Send notification error:', error);
      throw error;
    }
  }

  private async saveNotification(notification: NotificationData): Promise<void> {
    await prisma.notification.create({
      data: {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        tenantId: notification.tenantId,
        staffId: notification.staffId,
        customerId: notification.customerId,
        metadata: notification.metadata ? JSON.stringify(notification.metadata) : null,
        priority: notification.priority,
        isRead: false,
        createdAt: new Date(notification.timestamp),
      },
    });
  }

  private async broadcastNotification(notification: NotificationData): Promise<void> {
    const { tenantId, staffId } = notification;

    if (staffId) {
      // 特定スタッフに送信
      const staffSockets = this.userSockets.get(staffId);
      if (staffSockets && staffSockets.size > 0) {
        for (const socketId of staffSockets) {
          this.io.to(socketId).emit('new_notification', notification);
        }
      } else {
        logger.info(`Staff ${staffId} is offline, notification saved to database`);
      }
    } else {
      // テナント全体に送信
      this.io.to(`tenant_${tenantId}`).emit('new_notification', notification);
    }

    // 緊急通知の場合はプッシュ通知も送信
    if (notification.priority === 'URGENT') {
      await this.sendPushNotification(notification);
    }
  }

  private async sendPushNotification(notification: NotificationData): Promise<void> {
    // Service Worker Push通知実装
    // 実装時にはWebPush APIを使用
    logger.info(`Push notification would be sent: ${notification.title}`);
  }

  private async markNotificationAsRead(notificationId: string): Promise<void> {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { 
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  private async getUnreadNotifications(tenantId: string, staffId?: string): Promise<NotificationData[]> {
    const notifications = await prisma.notification.findMany({
      where: {
        tenantId,
        ...(staffId && { staffId }),
        isRead: false,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return notifications.map(notif => ({
      id: notif.id,
      type: notif.type as any,
      title: notif.title,
      message: notif.message,
      tenantId: notif.tenantId,
      staffId: notif.staffId || undefined,
      customerId: notif.customerId || undefined,
      metadata: notif.metadata ? JSON.parse(notif.metadata) : undefined,
      priority: notif.priority as any,
      timestamp: notif.createdAt.toISOString(),
      isRead: notif.isRead,
    }));
  }

  // 統計・管理メソッド
  getConnectedUsers(): ConnectedUser[] {
    return Array.from(this.connectedUsers.values());
  }

  getConnectionStats(): {
    totalConnections: number;
    tenantConnections: Map<string, number>;
    staffConnections: Map<string, number>;
  } {
    const tenantConnections = new Map<string, number>();
    const staffConnections = new Map<string, number>();

    for (const user of this.connectedUsers.values()) {
      // テナント別集計
      const tenantCount = tenantConnections.get(user.tenantId) || 0;
      tenantConnections.set(user.tenantId, tenantCount + 1);

      // スタッフ別集計
      if (user.staffId) {
        const staffCount = staffConnections.get(user.staffId) || 0;
        staffConnections.set(user.staffId, staffCount + 1);
      }
    }

    return {
      totalConnections: this.connectedUsers.size,
      tenantConnections,
      staffConnections,
    };
  }

  // メッセージ関連の通知トリガー
  async notifyNewMessage(tenantId: string, threadId: string, messageContent: string, customerId?: string): Promise<void> {
    await this.sendNotification({
      type: 'NEW_MESSAGE',
      title: '新しいメッセージ',
      message: messageContent.length > 50 ? 
        messageContent.substring(0, 50) + '...' : 
        messageContent,
      tenantId,
      customerId,
      metadata: { threadId },
      priority: 'HIGH',
    });
  }

  // 予約関連の通知トリガー
  async notifyReservationChange(
    tenantId: string, 
    reservationId: string, 
    changeType: 'CREATED' | 'UPDATED' | 'CANCELLED',
    customerId?: string,
    staffId?: string
  ): Promise<void> {
    const titles = {
      CREATED: '新しい予約',
      UPDATED: '予約変更',
      CANCELLED: '予約キャンセル',
    };

    await this.sendNotification({
      type: 'RESERVATION_CHANGE',
      title: titles[changeType],
      message: `予約が${changeType === 'CREATED' ? '作成' : changeType === 'UPDATED' ? '変更' : 'キャンセル'}されました`,
      tenantId,
      staffId,
      customerId,
      metadata: { reservationId, changeType },
      priority: changeType === 'CANCELLED' ? 'HIGH' : 'MEDIUM',
    });
  }

  // システム通知
  async notifySystemAlert(tenantId: string, title: string, message: string, priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' = 'MEDIUM'): Promise<void> {
    await this.sendNotification({
      type: 'SYSTEM_NOTIFICATION',
      title,
      message,
      tenantId,
      priority,
    });
  }
}

export let notificationService: NotificationService;

export function initializeNotificationService(httpServer: HttpServer): NotificationService {
  notificationService = new NotificationService(httpServer);
  return notificationService;
}

export function getNotificationService(): NotificationService {
  if (!notificationService) {
    throw new Error('NotificationService is not initialized');
  }
  return notificationService;
}