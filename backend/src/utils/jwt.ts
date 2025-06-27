import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { logger } from './logger';
import { JWTPayload } from '../types/auth';

export { JWTPayload };

const prisma = new PrismaClient();

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

const JWT_SECRET: string = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-this-in-production';
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '15m';
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';

export class JWTService {
  /**
   * アクセストークン生成
   */
  static generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    const jwtPayload = {
      ...payload,
      // Ensure all required fields are present
      staffId: payload.staffId,
      userId: payload.userId,
      email: payload.email,
      tenantId: payload.tenantId,
      role: payload.role
    };
    
    const options = {
      expiresIn: ACCESS_TOKEN_EXPIRY,
      issuer: 'salon-management-system',
      audience: 'salon-management-client',
    } as jwt.SignOptions;
    
    return jwt.sign(jwtPayload, JWT_SECRET, options);
  }

  /**
   * リフレッシュトークン生成・保存
   */
  static async generateRefreshToken(
    staffId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<string> {
    const token = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7日後

    await prisma.refreshToken.create({
      data: {
        token,
        staffId,
        expiresAt,
        ipAddress,
        userAgent,
      },
    });

    return token;
  }

  /**
   * トークンペア生成
   */
  static async generateTokenPair(
    staff: { id: string; tenantId: string; email: string; role: 'ADMIN' | 'MANAGER' | 'STAFF'; name?: string },
    ipAddress?: string,
    userAgent?: string
  ): Promise<TokenPair> {
    const accessToken = this.generateAccessToken({
      id: staff.id,
      staffId: staff.id,
      userId: staff.id,
      tenantId: staff.tenantId,
      email: staff.email,
      name: staff.name || staff.email,
      role: staff.role,
    });

    const refreshToken = await this.generateRefreshToken(
      staff.id,
      ipAddress,
      userAgent
    );

    return { accessToken, refreshToken };
  }

  /**
   * アクセストークン検証
   */
  static verifyAccessToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET, {
        issuer: 'salon-management-system',
        audience: 'salon-management-client',
      }) as JWTPayload;

      return decoded;
    } catch (error) {
      logger.error('Access token verification failed:', error);
      return null;
    }
  }

  /**
   * リフレッシュトークン検証・使用
   */
  static async verifyAndUseRefreshToken(token: string): Promise<{
    staff: { id: string; tenantId: string; email: string; role: 'ADMIN' | 'MANAGER' | 'STAFF' } | null;
    tokenRecord: any;
  }> {
    try {
      const tokenRecord = await prisma.refreshToken.findUnique({
        where: { token },
        include: {
          staff: {
            select: {
              id: true,
              tenantId: true,
              email: true,
              role: true,
              isActive: true,
            },
          },
        },
      });

      if (!tokenRecord) {
        return { staff: null, tokenRecord: null };
      }

      // トークンの有効性チェック
      if (tokenRecord.isRevoked || tokenRecord.expiresAt < new Date()) {
        await this.revokeRefreshToken(token);
        return { staff: null, tokenRecord: null };
      }

      // スタッフがアクティブかチェック
      if (!tokenRecord.staff.isActive) {
        await this.revokeRefreshToken(token);
        return { staff: null, tokenRecord: null };
      }

      return { 
        staff: {
          ...tokenRecord.staff,
          role: tokenRecord.staff.role as 'ADMIN' | 'STAFF' | 'MANAGER'
        }, 
        tokenRecord 
      };
    } catch (error) {
      logger.error('Refresh token verification failed:', error);
      return { staff: null, tokenRecord: null };
    }
  }

  /**
   * リフレッシュトークン取り消し
   */
  static async revokeRefreshToken(token: string): Promise<boolean> {
    try {
      await prisma.refreshToken.update({
        where: { token },
        data: { isRevoked: true },
      });
      return true;
    } catch (error) {
      logger.error('Failed to revoke refresh token:', error);
      return false;
    }
  }

  /**
   * スタッフの全リフレッシュトークンを取り消し
   */
  static async revokeAllRefreshTokens(staffId: string): Promise<boolean> {
    try {
      await prisma.refreshToken.updateMany({
        where: { staffId },
        data: { isRevoked: true },
      });
      return true;
    } catch (error) {
      logger.error('Failed to revoke all refresh tokens:', error);
      return false;
    }
  }

  /**
   * 期限切れトークンのクリーンアップ
   */
  static async cleanupExpiredTokens(): Promise<void> {
    try {
      const result = await prisma.refreshToken.deleteMany({
        where: {
          OR: [
            { expiresAt: { lt: new Date() } },
            { isRevoked: true },
          ],
        },
      });

      logger.info(`Cleaned up ${result.count} expired/revoked refresh tokens`);
    } catch (error) {
      logger.error('Failed to cleanup expired tokens:', error);
    }
  }

  /**
   * パスワードリセットトークン生成
   */
  static generatePasswordResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * 安全なランダム文字列生成（バックアップコード等）
   */
  static generateSecureCode(length: number = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * 2FAバックアップコード生成
   */
  static generate2FABackupCodes(count: number = 10): string[] {
    const codes = [];
    for (let i = 0; i < count; i++) {
      codes.push(this.generateSecureCode());
    }
    return codes;
  }
}

// 定期的なクリーンアップタスク（毎日実行）
setInterval(() => {
  JWTService.cleanupExpiredTokens();
}, 24 * 60 * 60 * 1000); // 24時間毎