import { Request, Response, NextFunction } from 'express';
import { JWTService, JWTPayload } from '../utils/jwt';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

// 型定義は types/auth.ts で統一管理

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      res.status(401).json({ 
        success: false,
        error: 'アクセストークンが必要です' 
      });
      return;
    }

    // JWT検証
    const payload = JWTService.verifyAccessToken(token);
    if (!payload) {
      res.status(401).json({ 
        success: false,
        error: '無効なアクセストークンです' 
      });
      return;
    }

    // スタッフの存在・状態確認
    const staff = await prisma.staff.findUnique({
      where: { id: payload.staffId },
      select: { 
        id: true, 
        isActive: true, 
        tenantId: true,
        role: true,
        name: true,
        email: true,
      },
    });

    if (!staff || !staff.isActive) {
      res.status(401).json({ 
        success: false,
        error: 'アクセスが拒否されました' 
      });
      return;
    }

    // リクエストにユーザー情報を追加
    req.user = {
      id: staff.id,
      staffId: staff.id,
      userId: staff.id,
      email: staff.email,
      name: staff.name,
      tenantId: staff.tenantId,
      role: staff.role as 'ADMIN' | 'MANAGER' | 'STAFF',
    };
    req.tenantId = staff.tenantId;

    next();
  } catch (error) {
    logger.error('認証エラー', error);
    res.status(401).json({ 
      success: false,
      error: '認証に失敗しました' 
    });
  }
};

// エイリアス（互換性のため）
export const authMiddleware = authenticate;
export const authenticateToken = authenticate;

// 権限チェックミドルウェア
export const requirePermission = (permission: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ 
          success: false,
          error: '認証が必要です' 
        });
        return;
      }

      // TODO: 実際の権限チェックロジックを実装
      // 現在は role ベースの簡易チェックのみ
      const hasPermission = req.user.role === 'ADMIN' || 
                          (req.user.role === 'MANAGER' && !permission.includes('ADMIN'));

      if (!hasPermission) {
        res.status(403).json({ 
          success: false,
          error: '権限が不足しています' 
        });
        return;
      }

      next();
    } catch (error) {
      logger.error('権限チェックエラー', error);
      res.status(500).json({ 
        success: false,
        error: '権限チェックに失敗しました' 
      });
    }
  };
};

// ロールベースのアクセス制御
export const requireRole = (roles: Array<'ADMIN' | 'MANAGER' | 'STAFF'>) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ 
          success: false,
          error: '認証が必要です' 
        });
        return;
      }

      if (!roles.includes(req.user.role)) {
        res.status(403).json({ 
          success: false,
          error: `このアクションには ${roles.join(' または ')} 権限が必要です` 
        });
        return;
      }

      next();
    } catch (error) {
      logger.error('ロールチェックエラー', error);
      res.status(500).json({ 
        success: false,
        error: 'ロールチェックに失敗しました' 
      });
    }
  };
};