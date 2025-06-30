import { Request, Response, NextFunction } from 'express';
import { rateLimit } from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

const prisma = new PrismaClient();

// 本番環境セキュリティ設定
const SECURITY_CONFIG = {
  JWT_EXPIRY: process.env.NODE_ENV === 'production' ? '15m' : '1h',
  REFRESH_TOKEN_EXPIRY: '7d',
  PASSWORD_MIN_LENGTH: 8,
  FAILED_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 30 * 60 * 1000, // 30分
  SESSION_TIMEOUT: 15 * 60 * 1000, // 15分のアイドルタイムアウト
  ENCRYPTION_ALGORITHM: 'aes-256-gcm',
  HASH_ROUNDS: 12,
  TWO_FA_WINDOW: 1 // TOTP window (30秒 x 1 = 30秒の許容範囲)
};

// セキュリティイベントインターフェース
interface SecurityEvent {
  type: 'LOGIN_ATTEMPT' | 'FAILED_AUTH' | 'SUSPICIOUS_ACTIVITY' | 'API_ABUSE' | 'DATA_ACCESS' | 'SECURITY_VIOLATION';
  ip: string;
  userAgent: string;
  userId?: string;
  tenantId?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  details: Record<string, any>;
}

/**
 * データ暗号化サービス
 */
export class EncryptionService {
  private static getEncryptionKey(): Buffer {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
      throw new Error('ENCRYPTION_KEY environment variable is required');
    }
    return Buffer.from(key, 'hex');
  }

  // 個人情報暗号化
  static encrypt(text: string): string {
    try {
      const algorithm = SECURITY_CONFIG.ENCRYPTION_ALGORITHM;
      const key = this.getEncryptionKey();
      const iv = crypto.randomBytes(16);
      
      const cipher = crypto.createCipherGCM(algorithm, key, iv);
      
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const authTag = cipher.getAuthTag();
      
      return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    } catch (error) {
      logger.error('Encryption failed:', error);
      throw new Error('Data encryption failed');
    }
  }

  // 個人情報復号化
  static decrypt(encryptedData: string): string {
    try {
      const [ivHex, authTagHex, encrypted] = encryptedData.split(':');
      
      if (!ivHex || !authTagHex || !encrypted) {
        throw new Error('Invalid encrypted data format');
      }
      
      const algorithm = SECURITY_CONFIG.ENCRYPTION_ALGORITHM;
      const key = this.getEncryptionKey();
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      
      const decipher = crypto.createDecipherGCM(algorithm, key, iv);
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      logger.error('Decryption failed:', error);
      throw new Error('Data decryption failed');
    }
  }

  // パスワードハッシュ化（強化版）
  static async hashPassword(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, SECURITY_CONFIG.HASH_ROUNDS);
    } catch (error) {
      logger.error('Password hashing failed:', error);
      throw new Error('Password hashing failed');
    }
  }

  // パスワード検証
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      logger.error('Password verification failed:', error);
      return false;
    }
  }
}

/**
 * 二要素認証サービス
 */
export class TwoFactorAuthService {
  // 2FA秘密鍵生成
  static generateSecret(staffName: string, tenantName: string) {
    return speakeasy.generateSecret({
      name: `${staffName} (${tenantName})`,
      issuer: process.env.APP_NAME || 'Salon Management System',
      length: 32
    });
  }

  // QRコード生成
  static async generateQRCode(secret: string): Promise<string> {
    try {
      return await QRCode.toDataURL(secret);
    } catch (error) {
      logger.error('QR code generation failed:', error);
      throw new Error('QR code generation failed');
    }
  }

  // TOTP検証
  static verifyToken(token: string, secret: string): boolean {
    try {
      return speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window: SECURITY_CONFIG.TWO_FA_WINDOW
      });
    } catch (error) {
      logger.error('2FA token verification failed:', error);
      return false;
    }
  }

  // バックアップコード生成
  static generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 8; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
    }
    return codes;
  }

  // バックアップコード検証
  static async verifyBackupCode(code: string, hashedCodes: string[]): Promise<boolean> {
    try {
      for (const hashedCode of hashedCodes) {
        if (await bcrypt.compare(code, hashedCode)) {
          return true;
        }
      }
      return false;
    } catch (error) {
      logger.error('Backup code verification failed:', error);
      return false;
    }
  }
}

/**
 * JWT強化管理
 */
export class JWTService {
  private static getJWTSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters long');
    }
    return secret;
  }

  // アクセストークン生成
  static generateAccessToken(payload: any): string {
    return jwt.sign(
      {
        ...payload,
        type: 'access',
        iat: Math.floor(Date.now() / 1000)
      },
      this.getJWTSecret(),
      {
        expiresIn: '1h',
        issuer: process.env.APP_NAME || 'salon-system',
        audience: 'salon-staff'
      }
    );
  }

  // リフレッシュトークン生成
  static generateRefreshToken(payload: any): string {
    return jwt.sign(
      {
        ...payload,
        type: 'refresh',
        iat: Math.floor(Date.now() / 1000)
      },
      this.getJWTSecret(),
      {
        expiresIn: '7d',
        issuer: process.env.APP_NAME || 'salon-system',
        audience: 'salon-staff'
      }
    );
  }

  // トークン検証
  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.getJWTSecret(), {
        issuer: process.env.APP_NAME || 'salon-system',
        audience: 'salon-staff'
      });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
      } else {
        throw new Error('Token verification failed');
      }
    }
  }

  // トークンのブラックリスト管理
  static async blacklistToken(token: string): Promise<void> {
    try {
      const decoded = jwt.decode(token) as any;
      if (decoded && decoded.exp) {
        const expiresAt = new Date(decoded.exp * 1000);
        // Redisにブラックリストとして保存
        await this.addToBlacklist(token, expiresAt);
      }
    } catch (error) {
      logger.error('Token blacklist failed:', error);
    }
  }

  private static async addToBlacklist(token: string, expiresAt: Date): Promise<void> {
    // 実装: Redisやデータベースにブラックリストとして保存
    // TTLを設定してトークンの有効期限後に自動削除
  }
}

/**
 * パスワード強度チェック
 */
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  errors: string[];
  score: number;
} => {
  const errors: string[] = [];
  let score = 0;
  
  // 長さチェック
  if (password.length < SECURITY_CONFIG.PASSWORD_MIN_LENGTH) {
    errors.push(`パスワードは${SECURITY_CONFIG.PASSWORD_MIN_LENGTH}文字以上である必要があります`);
  } else {
    score += password.length >= 12 ? 2 : 1;
  }
  
  // 複雑さチェック
  if (!/[a-z]/.test(password)) {
    errors.push('小文字を含める必要があります');
  } else {
    score += 1;
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('大文字を含める必要があります');
  } else {
    score += 1;
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('数字を含める必要があります');
  } else {
    score += 1;
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('特殊文字を含める必要があります');
  } else {
    score += 1;
  }
  
  // 一般的なパスワードチェック
  const commonPasswords = [
    'password', '123456', 'qwerty', 'abc123', 'password123',
    'admin', 'salon', 'beauty', '111111', 'welcome'
  ];
  
  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    errors.push('一般的すぎるパスワードです');
    score -= 2;
  }
  
  return {
    isValid: errors.length === 0 && score >= 4,
    errors,
    score: Math.max(0, score)
  };
};

/**
 * セッション管理強化
 */
export const sessionSecurity = (req: Request, res: Response, next: NextFunction) => {
  const lastActivity = req.session?.lastActivity;
  const now = Date.now();
  
  if (lastActivity && (now - lastActivity) > SECURITY_CONFIG.SESSION_TIMEOUT) {
    // セッションタイムアウト
    req.session = null;
    
    logSecurityEvent({
      type: 'DATA_ACCESS',
      ip: getClientIP(req),
      userAgent: req.get('user-agent') || 'Unknown',
      severity: 'LOW',
      details: {
        event: 'session_timeout',
        lastActivity: new Date(lastActivity)
      }
    });
    
    return res.status(401).json({
      success: false,
      error: 'Session expired due to inactivity',
      code: 'SESSION_TIMEOUT'
    });
  }
  
  // セッション活動時刻更新
  if (req.session) {
    req.session.lastActivity = now;
  }
  
  next();
};

/**
 * 不正アクセス検知
 */
export const suspiciousActivityDetection = (req: Request, res: Response, next: NextFunction) => {
  const ip = getClientIP(req);
  const userAgent = req.get('user-agent') || 'Unknown';
  
  // 疑わしいパターンの検出
  const suspiciousPatterns = [
    /bot|crawler|spider|scraper/i,
    /injection|script|alert|eval/i,
    /union|select|drop|delete|insert/i,
    /<script[^>]*>.*?<\/script>/gi,
    /(?:\.\.\/|\.\.\\)/g,
    /(?:file|http|ftp|javascript):/i
  ];
  
  const requestContent = JSON.stringify({
    url: req.url,
    body: req.body,
    query: req.query,
    headers: req.headers
  });
  
  const isSuspicious = suspiciousPatterns.some(pattern => 
    pattern.test(requestContent) || pattern.test(userAgent)
  );
  
  if (isSuspicious) {
    logSecurityEvent({
      type: 'SUSPICIOUS_ACTIVITY',
      ip,
      userAgent,
      severity: 'HIGH',
      details: {
        suspiciousContent: requestContent,
        detectedPatterns: suspiciousPatterns.filter(p => p.test(requestContent))
      }
    });
    
    // 疑わしい活動を一時的にブロック
    return res.status(403).json({
      success: false,
      error: 'Request blocked due to suspicious activity'
    });
  }
  
  next();
};

/**
 * 本番環境セキュリティヘッダー
 */
export const productionSecurityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // 基本セキュリティヘッダー
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=()');
  
  // 本番環境ではHTTPS強制
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  // 強化されたCSP設定
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://js.stripe.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https://*.googleapis.com https://*.stripe.com",
    "connect-src 'self' https://api.stripe.com https://*.googleapis.com",
    "frame-src https://js.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'"
  ];
  
  res.setHeader('Content-Security-Policy', cspDirectives.join('; '));
  
  // サーバー情報の隠蔽
  res.removeHeader('X-Powered-By');
  res.setHeader('Server', 'Salon-Management-System');
  
  next();
};

/**
 * 本番環境向け制限強化
 */
export const productionRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  maxRequests: process.env.NODE_ENV === 'production' ? 50 : 100,
});

export const createRateLimit = (options: {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}) => {
  return rateLimit({
    windowMs: options.windowMs,
    limit: options.maxRequests,
    message: {
      success: false,
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(options.windowMs / 1000),
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: options.skipSuccessfulRequests,
    skipFailedRequests: options.skipFailedRequests,
    handler: (req: Request, res: Response) => {
      logSecurityEvent({
        type: 'API_ABUSE',
        ip: getClientIP(req),
        userAgent: req.get('user-agent') || 'Unknown',
        userId: req.user?.staffId,
        tenantId: req.user?.tenantId,
        severity: 'HIGH',
        details: {
          path: req.path,
          method: req.method,
          rateLimitExceeded: true,
        },
      });
      
      res.status(429).json({
        success: false,
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil(options.windowMs / 1000),
      });
    },
  });
};

/**
 * セキュリティイベントログ
 */
export const logSecurityEvent = async (event: SecurityEvent) => {
  try {
    // データベースに保存
    await prisma.securityEvent.create({
      data: {
        eventType: event.type,
        ipAddress: event.ip,
        userAgent: event.userAgent,
        userId: event.userId,
        tenantId: event.tenantId,
        severity: event.severity,
        details: event.details,
        createdAt: new Date()
      }
    });

    // 重要度に応じてログ出力
    const logMessage = `Security Event: ${event.type} - ${event.severity}`;
    const logData = {
      ...event,
      timestamp: new Date().toISOString()
    };

    switch (event.severity) {
      case 'CRITICAL':
        logger.error(logMessage, logData);
        break;
      case 'HIGH':
        logger.warn(logMessage, logData);
        break;
      case 'MEDIUM':
        logger.info(logMessage, logData);
        break;
      case 'LOW':
        logger.debug(logMessage, logData);
        break;
    }

    // 本番環境では外部監視システムに通知
    if (process.env.NODE_ENV === 'production' && event.severity === 'CRITICAL') {
      // 実装: 外部アラートシステムへの通知
    }

  } catch (error) {
    logger.error('Failed to log security event:', error);
  }
};

/**
 * IPアドレス取得
 */
export const getClientIP = (req: Request): string => {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    (req.headers['x-real-ip'] as string) ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.ip ||
    'unknown'
  );
};

/**
 * セキュリティ監査ログ
 */
export const securityAuditLog = (
  action: string,
  resource: string,
  resourceId?: string
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    logSecurityEvent({
      type: 'DATA_ACCESS',
      ip: getClientIP(req),
      userAgent: req.get('user-agent') || 'Unknown',
      userId: req.user?.staffId,
      tenantId: req.user?.tenantId,
      severity: 'LOW',
      details: {
        action,
        resource,
        resourceId,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
      }
    });
    
    next();
  };
};

export { SECURITY_CONFIG };