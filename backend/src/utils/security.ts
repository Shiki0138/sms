import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

const prisma = new PrismaClient();

export interface SecurityEventType {
  LOGIN_SUCCESS: 'LOGIN_SUCCESS';
  LOGIN_FAILED: 'LOGIN_FAILED';
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED';
  ACCOUNT_UNLOCKED: 'ACCOUNT_UNLOCKED';
  PASSWORD_CHANGED: 'PASSWORD_CHANGED';
  PASSWORD_RESET_REQUESTED: 'PASSWORD_RESET_REQUESTED';
  PASSWORD_RESET_COMPLETED: 'PASSWORD_RESET_COMPLETED';
  TWO_FA_ENABLED: 'TWO_FA_ENABLED';
  TWO_FA_DISABLED: 'TWO_FA_DISABLED';
  TWO_FA_BACKUP_USED: 'TWO_FA_BACKUP_USED';
  INVALID_2FA_ATTEMPT: 'INVALID_2FA_ATTEMPT';
  SUSPICIOUS_LOGIN: 'SUSPICIOUS_LOGIN';
  TOKEN_REFRESH: 'TOKEN_REFRESH';
  LOGOUT: 'LOGOUT';
}

export const SECURITY_EVENTS: SecurityEventType = {
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILED: 'LOGIN_FAILED',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  ACCOUNT_UNLOCKED: 'ACCOUNT_UNLOCKED',
  PASSWORD_CHANGED: 'PASSWORD_CHANGED',
  PASSWORD_RESET_REQUESTED: 'PASSWORD_RESET_REQUESTED',
  PASSWORD_RESET_COMPLETED: 'PASSWORD_RESET_COMPLETED',
  TWO_FA_ENABLED: 'TWO_FA_ENABLED',
  TWO_FA_DISABLED: 'TWO_FA_DISABLED',
  TWO_FA_BACKUP_USED: 'TWO_FA_BACKUP_USED',
  INVALID_2FA_ATTEMPT: 'INVALID_2FA_ATTEMPT',
  SUSPICIOUS_LOGIN: 'SUSPICIOUS_LOGIN',
  TOKEN_REFRESH: 'TOKEN_REFRESH',
  LOGOUT: 'LOGOUT',
};

export class SecurityService {
  private static readonly SALT_ROUNDS = 12;
  private static readonly MAX_LOGIN_ATTEMPTS = 5;
  private static readonly LOCK_TIME = 30 * 60 * 1000; // 30分
  private static readonly PASSWORD_MIN_LENGTH = 8;

  /**
   * パスワードハッシュ化
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  /**
   * パスワード検証
   */
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * パスワード強度チェック
   */
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
    score: number;
  } {
    const errors: string[] = [];
    let score = 0;

    // 最小長チェック
    if (password.length < this.PASSWORD_MIN_LENGTH) {
      errors.push(`パスワードは${this.PASSWORD_MIN_LENGTH}文字以上である必要があります`);
    } else {
      score += 1;
    }

    // 大文字チェック
    if (!/[A-Z]/.test(password)) {
      errors.push('大文字を含む必要があります');
    } else {
      score += 1;
    }

    // 小文字チェック
    if (!/[a-z]/.test(password)) {
      errors.push('小文字を含む必要があります');
    } else {
      score += 1;
    }

    // 数字チェック
    if (!/\d/.test(password)) {
      errors.push('数字を含む必要があります');
    } else {
      score += 1;
    }

    // 特殊文字チェック
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('特殊文字を含む必要があります');
    } else {
      score += 1;
    }

    // 連続文字チェック
    if (/(.)\1{2,}/.test(password)) {
      errors.push('3文字以上の連続した文字は使用できません');
      score -= 1;
    }

    return {
      isValid: errors.length === 0,
      errors,
      score: Math.max(0, score),
    };
  }

  /**
   * ログイン試行回数チェック・更新
   */
  static async checkAndUpdateLoginAttempts(
    staffId: string,
    success: boolean
  ): Promise<{ isLocked: boolean; attemptsRemaining: number }> {
    const staff = await prisma.staff.findUnique({
      where: { id: staffId },
      select: { loginAttempts: true, lockedUntil: true },
    });

    if (!staff) {
      throw new Error('スタッフが見つかりません');
    }

    // ロック期間中かチェック
    if (staff.lockedUntil && staff.lockedUntil > new Date()) {
      return {
        isLocked: true,
        attemptsRemaining: 0,
      };
    }

    if (success) {
      // ログイン成功時：試行回数とロックをリセット
      await prisma.staff.update({
        where: { id: staffId },
        data: {
          loginAttempts: 0,
          lockedUntil: null,
          lastLoginAt: new Date(),
        },
      });

      return {
        isLocked: false,
        attemptsRemaining: this.MAX_LOGIN_ATTEMPTS,
      };
    } else {
      // ログイン失敗時：試行回数を増加
      const newAttempts = staff.loginAttempts + 1;
      const shouldLock = newAttempts >= this.MAX_LOGIN_ATTEMPTS;

      await prisma.staff.update({
        where: { id: staffId },
        data: {
          loginAttempts: newAttempts,
          lockedUntil: shouldLock ? new Date(Date.now() + this.LOCK_TIME) : null,
        },
      });

      if (shouldLock) {
        await this.logSecurityEvent(
          staff.id,
          SECURITY_EVENTS.ACCOUNT_LOCKED,
          'アカウントが一時的にロックされました',
          'CRITICAL'
        );
      }

      return {
        isLocked: shouldLock,
        attemptsRemaining: Math.max(0, this.MAX_LOGIN_ATTEMPTS - newAttempts),
      };
    }
  }

  /**
   * アカウントロック解除
   */
  static async unlockAccount(staffId: string): Promise<boolean> {
    try {
      await prisma.staff.update({
        where: { id: staffId },
        data: {
          loginAttempts: 0,
          lockedUntil: null,
        },
      });

      await this.logSecurityEvent(
        staffId,
        SECURITY_EVENTS.ACCOUNT_UNLOCKED,
        'アカウントロックが解除されました',
        'INFO'
      );

      return true;
    } catch (error) {
      logger.error('Failed to unlock account:', error);
      return false;
    }
  }

  /**
   * セキュリティイベントログ記録
   */
  static async logSecurityEvent(
    staffId: string,
    eventType: string,
    description: string,
    severity: 'INFO' | 'WARNING' | 'CRITICAL' = 'INFO',
    metadata?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      // スタッフ情報取得
      const staff = await prisma.staff.findUnique({
        where: { id: staffId },
        select: { tenantId: true },
      });

      if (!staff) {
        logger.error('Staff not found for security event:', { staffId, eventType });
        return;
      }

      await prisma.securityEvent.create({
        data: {
          tenantId: staff.tenantId,
          staffId,
          eventType,
          description,
          severity,
          metadata: metadata ? JSON.stringify(metadata) : null,
          ipAddress,
          userAgent,
        },
      });
    } catch (error) {
      logger.error('Failed to log security event:', error);
    }
  }

  /**
   * ログイン履歴記録
   */
  static async logLoginAttempt(
    email: string,
    success: boolean,
    staffId?: string,
    tenantId?: string,
    failReason?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      // スタッフ情報から tenantId を取得（未提供の場合）
      if (!tenantId && staffId) {
        const staff = await prisma.staff.findUnique({
          where: { id: staffId },
          select: { tenantId: true },
        });
        tenantId = staff?.tenantId;
      }

      // メールアドレスから tenantId を推測（失敗時）
      if (!tenantId && !success) {
        const staff = await prisma.staff.findUnique({
          where: { email },
          select: { tenantId: true },
        });
        tenantId = staff?.tenantId || 'unknown';
      }

      await prisma.loginHistory.create({
        data: {
          staffId,
          tenantId: tenantId || 'unknown',
          email,
          success,
          failReason,
          ipAddress,
          userAgent,
        },
      });
    } catch (error) {
      logger.error('Failed to log login attempt:', error);
    }
  }

  /**
   * 疑わしいログイン検出
   */
  static async detectSuspiciousLogin(
    staffId: string,
    ipAddress: string,
    userAgent: string
  ): Promise<boolean> {
    try {
      // 過去30日の正常なログイン履歴を確認
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentLogins = await prisma.loginHistory.findMany({
        where: {
          staffId,
          success: true,
          createdAt: { gte: thirtyDaysAgo },
        },
        select: {
          ipAddress: true,
          userAgent: true,
        },
      });

      // 新しいデバイス/IPアドレスかチェック
      const knownIPs = new Set(recentLogins.map(login => login.ipAddress).filter(Boolean));
      const knownUserAgents = new Set(recentLogins.map(login => login.userAgent).filter(Boolean));

      const isNewIP = ipAddress && !knownIPs.has(ipAddress);
      const isNewDevice = userAgent && !knownUserAgents.has(userAgent);

      const isSuspicious = isNewIP || isNewDevice;

      if (isSuspicious) {
        await this.logSecurityEvent(
          staffId,
          SECURITY_EVENTS.SUSPICIOUS_LOGIN,
          '新しいデバイスまたはIPアドレスからのログインを検出',
          'WARNING',
          { newIP: isNewIP, newDevice: isNewDevice },
          ipAddress,
          userAgent
        );
      }

      return isSuspicious;
    } catch (error) {
      logger.error('Failed to detect suspicious login:', error);
      return false;
    }
  }

  /**
   * IPアドレス取得（プロキシ対応）
   */
  static getClientIP(req: any): string {
    return (
      req.headers['x-forwarded-for']?.split(',')[0] ||
      req.headers['x-real-ip'] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      req.ip ||
      'unknown'
    );
  }

  /**
   * セキュリティヘッダー設定
   */
  static getSecurityHeaders(): Record<string, string> {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    };
  }

  /**
   * 安全なランダム文字列生成
   */
  static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * セキュリティ統計取得
   */
  static async getSecurityStats(tenantId: string, days: number = 30): Promise<any> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [
      totalLogins,
      failedLogins,
      lockedAccounts,
      securityEvents,
      suspiciousLogins,
    ] = await Promise.all([
      prisma.loginHistory.count({
        where: { tenantId, createdAt: { gte: since } },
      }),
      prisma.loginHistory.count({
        where: { tenantId, success: false, createdAt: { gte: since } },
      }),
      prisma.staff.count({
        where: { tenantId, lockedUntil: { gt: new Date() } },
      }),
      prisma.securityEvent.count({
        where: { tenantId, createdAt: { gte: since } },
      }),
      prisma.securityEvent.count({
        where: {
          tenantId,
          eventType: SECURITY_EVENTS.SUSPICIOUS_LOGIN,
          createdAt: { gte: since },
        },
      }),
    ]);

    return {
      totalLogins,
      failedLogins,
      successRate: totalLogins > 0 ? ((totalLogins - failedLogins) / totalLogins * 100).toFixed(2) : '100.00',
      lockedAccounts,
      securityEvents,
      suspiciousLogins,
      period: `${days}日間`,
    };
  }
}

export default SecurityService;