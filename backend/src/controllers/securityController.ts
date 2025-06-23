import { Response } from 'express';
import { AuthenticatedRequest } from '../types/auth';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { SecurityService } from '../utils/security';
import { JWTService } from '../utils/jwt';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

const GetSecurityLogsSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  eventType: z.string().optional(),
  severity: z.enum(['INFO', 'WARNING', 'CRITICAL']).optional(),
  staffId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const UnlockAccountSchema = z.object({
  staffId: z.string().min(1, 'スタッフIDが必要です'),
});

export class SecurityController {
  /**
   * セキュリティイベントログ取得
   */
  async getSecurityLogs(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const tenantId = req.user?.tenantId || req.headers['x-tenant-id'] as string;
      const query = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        eventType: req.query.eventType as string,
        severity: req.query.severity as string,
        staffId: req.query.staffId as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
      };

      const validatedQuery = GetSecurityLogsSchema.parse(query);
      const { page, limit, eventType, severity, staffId, startDate, endDate } = validatedQuery;

      const offset = (page - 1) * limit;

      // フィルター条件構築
      const where: any = { tenantId };

      if (eventType) where.eventType = eventType;
      if (severity) where.severity = severity;
      if (staffId) where.staffId = staffId;

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
      }

      const [events, total] = await Promise.all([
        prisma.securityEvent.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: offset,
          take: limit,
          include: {
            staff: {
              select: { id: true, name: true, email: true },
            },
          },
        }),
        prisma.securityEvent.count({ where }),
      ]);

      res.json({
        success: true,
        data: {
          events: events.map(event => ({
            id: event.id,
            eventType: event.eventType,
            description: event.description,
            severity: event.severity,
            ipAddress: event.ipAddress,
            userAgent: event.userAgent,
            metadata: event.metadata ? JSON.parse(event.metadata) : null,
            createdAt: event.createdAt,
            staff: event.staff,
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
      logger.error('Get security logs error:', error);
      
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
        error: 'セキュリティログ取得中にエラーが発生しました',
      });
    }
  }

  /**
   * ログイン履歴取得
   */
  async getLoginHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const tenantId = req.user?.tenantId || req.headers['x-tenant-id'] as string;
      const query = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        staffId: req.query.staffId as string,
        success: req.query.success === 'true' ? true : req.query.success === 'false' ? false : undefined,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
      };

      const offset = (query.page - 1) * query.limit;

      // フィルター条件構築
      const where: any = { tenantId };

      if (query.staffId) where.staffId = query.staffId;
      if (query.success !== undefined) where.success = query.success;

      if (query.startDate || query.endDate) {
        where.createdAt = {};
        if (query.startDate) where.createdAt.gte = new Date(query.startDate);
        if (query.endDate) where.createdAt.lte = new Date(query.endDate);
      }

      const [loginHistory, total] = await Promise.all([
        prisma.loginHistory.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: offset,
          take: query.limit,
          include: {
            staff: {
              select: { id: true, name: true, email: true },
            },
          },
        }),
        prisma.loginHistory.count({ where }),
      ]);

      res.json({
        success: true,
        data: {
          loginHistory,
          pagination: {
            page: query.page,
            limit: query.limit,
            total,
            totalPages: Math.ceil(total / query.limit),
            hasNext: query.page * query.limit < total,
            hasPrev: query.page > 1,
          },
        },
      });

    } catch (error: any) {
      logger.error('Get login history error:', error);
      res.status(500).json({
        success: false,
        error: 'ログイン履歴取得中にエラーが発生しました',
      });
    }
  }

  /**
   * セキュリティ統計取得
   */
  async getSecurityStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const tenantId = req.user?.tenantId || req.headers['x-tenant-id'] as string;
      const days = parseInt(req.query.days as string) || 30;

      const stats = await SecurityService.getSecurityStats(tenantId, days);

      res.json({
        success: true,
        data: stats,
      });

    } catch (error: any) {
      logger.error('Get security stats error:', error);
      res.status(500).json({
        success: false,
        error: 'セキュリティ統計取得中にエラーが発生しました',
      });
    }
  }

  /**
   * アクティブセッション一覧取得
   */
  async getActiveSessions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const tenantId = req.user?.tenantId || req.headers['x-tenant-id'] as string;

      // アクティブなリフレッシュトークン取得
      const sessions = await prisma.refreshToken.findMany({
        where: {
          isRevoked: false,
          expiresAt: { gt: new Date() },
          staff: { tenantId },
        },
        include: {
          staff: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json({
        success: true,
        data: {
          sessions: sessions.map(session => ({
            id: session.id,
            staff: session.staff,
            ipAddress: session.ipAddress,
            userAgent: session.userAgent,
            createdAt: session.createdAt,
            expiresAt: session.expiresAt,
          })),
        },
      });

    } catch (error: any) {
      logger.error('Get active sessions error:', error);
      res.status(500).json({
        success: false,
        error: 'アクティブセッション取得中にエラーが発生しました',
      });
    }
  }

  /**
   * セッション終了
   */
  async terminateSession(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const user = req.user;

      // セッション情報取得
      const session = await prisma.refreshToken.findUnique({
        where: { id: sessionId },
        include: {
          staff: {
            select: { tenantId: true },
          },
        },
      });

      if (!session) {
        res.status(404).json({
          success: false,
          error: 'セッションが見つかりません',
        });
        return;
      }

      // テナント権限チェック
      if (session.staff.tenantId !== user?.tenantId) {
        res.status(403).json({
          success: false,
          error: 'このセッションを終了する権限がありません',
        });
        return;
      }

      // セッション終了
      await prisma.refreshToken.update({
        where: { id: sessionId },
        data: { isRevoked: true },
      });

      res.json({
        success: true,
        message: 'セッションを終了しました',
      });

    } catch (error: any) {
      logger.error('Terminate session error:', error);
      res.status(500).json({
        success: false,
        error: 'セッション終了中にエラーが発生しました',
      });
    }
  }

  /**
   * アカウントロック解除
   */
  async unlockAccount(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { staffId } = UnlockAccountSchema.parse(req.body);
      const user = req.user;

      // スタッフ情報取得
      const staff = await prisma.staff.findUnique({
        where: { id: staffId },
        select: { tenantId: true, name: true, email: true, lockedUntil: true },
      });

      if (!staff) {
        res.status(404).json({
          success: false,
          error: 'スタッフが見つかりません',
        });
        return;
      }

      // テナント権限チェック
      if (staff.tenantId !== user?.tenantId) {
        res.status(403).json({
          success: false,
          error: 'このアカウントのロックを解除する権限がありません',
        });
        return;
      }

      // ロック状態チェック
      if (!staff.lockedUntil || staff.lockedUntil <= new Date()) {
        res.status(400).json({
          success: false,
          error: 'このアカウントはロックされていません',
        });
        return;
      }

      // ロック解除
      const success = await SecurityService.unlockAccount(staffId);

      if (success) {
        res.json({
          success: true,
          message: `${staff.name}のアカウントロックを解除しました`,
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'アカウントロック解除に失敗しました',
        });
      }

    } catch (error: any) {
      logger.error('Unlock account error:', error);
      
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
        error: 'アカウントロック解除中にエラーが発生しました',
      });
    }
  }

  /**
   * 2FA バックアップコード再生成
   */
  async regenerateBackupCodes(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user;

      const staff = await prisma.staff.findUnique({
        where: { id: user?.staffId },
        select: { twoFactorEnabled: true },
      });

      if (!staff) {
        res.status(404).json({
          success: false,
          error: 'ユーザーが見つかりません',
        });
        return;
      }

      if (!staff.twoFactorEnabled) {
        res.status(400).json({
          success: false,
          error: '2段階認証が有効でないため、バックアップコードを再生成できません',
        });
        return;
      }

      // 新しいバックアップコード生成
      const backupCodes = Array.from({ length: 10 }, () => 
        Math.random().toString(36).substr(2, 8).toUpperCase()
      );

      // データベース更新
      await prisma.staff.update({
        where: { id: user?.staffId },
        data: { backupCodes: JSON.stringify(backupCodes) },
      });

      res.json({
        success: true,
        message: 'バックアップコードを再生成しました',
        data: { backupCodes },
      });

    } catch (error: any) {
      logger.error('Regenerate backup codes error:', error);
      res.status(500).json({
        success: false,
        error: 'バックアップコード再生成中にエラーが発生しました',
      });
    }
  }

  /**
   * セキュリティレポート生成
   */
  async generateSecurityReport(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const tenantId = req.user?.tenantId || req.headers['x-tenant-id'] as string;
      const days = parseInt(req.query.days as string) || 30;

      const [
        stats,
        recentEvents,
        failedLogins,
        lockedAccounts,
      ] = await Promise.all([
        SecurityService.getSecurityStats(tenantId, days),
        prisma.securityEvent.findMany({
          where: {
            tenantId,
            severity: { in: ['WARNING', 'CRITICAL'] },
            createdAt: { gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) },
          },
          include: {
            staff: {
              select: { name: true, email: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        }),
        prisma.loginHistory.findMany({
          where: {
            tenantId,
            success: false,
            createdAt: { gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        }),
        prisma.staff.findMany({
          where: {
            tenantId,
            lockedUntil: { gt: new Date() },
          },
          select: {
            id: true,
            name: true,
            email: true,
            lockedUntil: true,
            loginAttempts: true,
          },
        }),
      ]);

      res.json({
        success: true,
        data: {
          reportPeriod: `${days}日間`,
          generatedAt: new Date().toISOString(),
          summary: stats,
          criticalEvents: recentEvents,
          recentFailedLogins: failedLogins,
          lockedAccounts,
          recommendations: this.generateSecurityRecommendations(stats, recentEvents),
        },
      });

    } catch (error: any) {
      logger.error('Generate security report error:', error);
      res.status(500).json({
        success: false,
        error: 'セキュリティレポート生成中にエラーが発生しました',
      });
    }
  }

  private generateSecurityRecommendations(stats: any, events: any[]): string[] {
    const recommendations: string[] = [];

    // 失敗率が高い場合
    if (parseFloat(stats.successRate) < 80) {
      recommendations.push('ログイン成功率が低下しています。パスワードポリシーの見直しを検討してください。');
    }

    // 疑わしいログインが多い場合
    if (stats.suspiciousLogins > 5) {
      recommendations.push('疑わしいログインが検出されています。2段階認証の有効化を推奨します。');
    }

    // ロックされたアカウントが多い場合
    if (stats.lockedAccounts > 3) {
      recommendations.push('複数のアカウントがロックされています。セキュリティ研修の実施を検討してください。');
    }

    // クリティカルイベントが多い場合
    const criticalEvents = events.filter(e => e.severity === 'CRITICAL');
    if (criticalEvents.length > 0) {
      recommendations.push('重大なセキュリティイベントが発生しています。詳細な調査を行ってください。');
    }

    if (recommendations.length === 0) {
      recommendations.push('現在、セキュリティ状況は良好です。');
    }

    return recommendations;
  }
}

export const securityController = new SecurityController();
