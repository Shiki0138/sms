import { Request, Response, NextFunction } from 'express';
import { JWTService, JWTPayload } from '../utils/jwt';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

// Request型を拡張してユーザー情報を追加
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
      tenantId?: string;
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
    req.user = payload;
    req.tenantId = payload.tenantId;
    next();

  } catch (error) {
    logger.error('Auth middleware error:', error);
    res.status(500).json({ 
      success: false,
      error: '認証処理中にエラーが発生しました' 
    });
  }
};

/**
 * 役割ベースの認可ミドルウェア
 */
export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user;
    
    if (!user) {
      res.status(401).json({ 
        success: false,
        error: '認証が必要です' 
      });
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      res.status(403).json({ 
        success: false,
        error: 'この操作を実行する権限がありません',
        required: allowedRoles,
        current: user.role,
      });
      return;
    }

    next();
  };
};

/**
 * テナント分離ミドルウェア
 */
export const requireTenant = (req: Request, res: Response, next: NextFunction): void => {
  const user = req.user;
  const headerTenantId = req.headers['x-tenant-id'] as string;
  
  if (!user) {
    res.status(401).json({ 
      success: false,
      error: '認証が必要です' 
    });
    return;
  }

  // ヘッダーのテナントIDとユーザーのテナントIDが一致するかチェック
  if (headerTenantId && headerTenantId !== user.tenantId) {
    res.status(403).json({ 
      success: false,
      error: 'テナントアクセスが拒否されました' 
    });
    return;
  }

  next();
};

/**
 * 管理者のみアクセス可能
 */
export const requireAdmin = requireRole('ADMIN');

/**
 * 管理者・マネージャーアクセス可能
 */
export const requireManager = requireRole('ADMIN', 'MANAGER');

/**
 * 全スタッフアクセス可能
 */
export const requireStaff = requireRole('ADMIN', 'MANAGER', 'STAFF');

/**
 * オプション認証（認証されていなくてもOK、されていれば情報を追加）
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      const payload = JWTService.verifyAccessToken(token);
      if (payload) {
        // スタッフの状態確認
        const staff = await prisma.staff.findUnique({
          where: { id: payload.staffId },
          select: { id: true, isActive: true },
        });

        if (staff && staff.isActive) {
          req.user = payload;
          req.tenantId = payload.tenantId;
        }
      }
    }

    next();
  } catch (error) {
    // エラーが発生してもオプション認証なので続行
    logger.warn('Optional auth error:', error);
    next();
  }
};

// 後方互換性のためのエイリアス
export const authenticate = authMiddleware;
export const authorize = requireRole;
export const ensureTenantAccess = requireTenant;
export const adminOnly = requireAdmin;
export const managerOrAdmin = requireManager;
export const staffOrHigher = requireStaff;