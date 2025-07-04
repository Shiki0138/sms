import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { getNotificationService } from './notificationService';
import SecurityConfig from '../config/security';

const prisma = new PrismaClient();

export interface SecurityAlert {
  id: string;
  type: 'BREACH_ATTEMPT' | 'SUSPICIOUS_ACTIVITY' | 'POLICY_VIOLATION' | 'SYSTEM_COMPROMISE';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  source: string;
  evidence: Record<string, any>;
  timestamp: Date;
  resolved: boolean;
}

export interface ThreatIndicator {
  ip: string;
  userAgent: string;
  patterns: string[];
  riskScore: number;
  firstSeen: Date;
  lastSeen: Date;
  attempts: number;
}

export class SecurityService {
  private threatIndicators: Map<string, ThreatIndicator> = new Map();
  private alertHistory: SecurityAlert[] = [];

  /**
   * Enhanced password security validation
   */
  async validatePasswordSecurity(password: string, userId?: string): Promise<{
    isValid: boolean;
    errors: string[];
    strength: 'WEAK' | 'MEDIUM' | 'STRONG' | 'VERY_STRONG';
  }> {
    const errors: string[] = [];
    const config = SecurityConfig.auth.password;

    // Length check
    if (password.length < config.minLength) {
      errors.push(`パスワードは${config.minLength}文字以上である必要があります`);
    }

    // Complexity checks
    if (config.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('大文字を含める必要があります');
    }
    if (config.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('小文字を含める必要があります');
    }
    if (config.requireNumbers && !/\d/.test(password)) {
      errors.push('数字を含める必要があります');
    }
    if (config.requireSpecialChars && !/[^a-zA-Z0-9]/.test(password)) {
      errors.push('特殊文字を含める必要があります');
    }

    // Check for common patterns
    const commonPatterns = ['password', '12345', 'qwerty', 'admin'];
    if (commonPatterns.some(pattern => password.toLowerCase().includes(pattern))) {
      errors.push('一般的なパスワードパターンは使用できません');
    }

    // Check password history if userId provided
    if (userId && config.preventReuse) {
      // Skip password history check as the model doesn't exist
      // This would normally check against previous passwords
    }

    // Calculate strength
    let strengthScore = 0;
    if (password.length >= 12) strengthScore += 2;
    else if (password.length >= 8) strengthScore++;
    if (/[A-Z]/.test(password)) strengthScore++;
    if (/[a-z]/.test(password)) strengthScore++;
    if (/\d/.test(password)) strengthScore++;
    if (/[^a-zA-Z0-9]/.test(password)) strengthScore++;

    const strength = strengthScore >= 6 ? 'VERY_STRONG' :
                    strengthScore >= 4 ? 'STRONG' :
                    strengthScore >= 3 ? 'MEDIUM' : 'WEAK';

    return {
      isValid: errors.length === 0,
      errors,
      strength
    };
  }

  /**
   * Track and handle failed login attempts
   */
  async handleFailedLogin(staffId: string): Promise<{
    isLocked: boolean;
    remainingAttempts: number;
    lockoutDuration?: number;
  }> {
    const config = SecurityConfig.auth.lockout;

    // Get staff record
    const staff = await prisma.staff.findUnique({
      where: { id: staffId },
    });

    if (!staff) {
      throw new Error('Staff not found');
    }

    // Check if already locked
    if (staff.lockedUntil && staff.lockedUntil > new Date()) {
      const remainingTime = Math.ceil((staff.lockedUntil.getTime() - Date.now()) / 1000);
      return {
        isLocked: true,
        remainingAttempts: 0,
        lockoutDuration: remainingTime
      };
    }

    // Increment failed attempts
    const newAttempts = (staff.loginAttempts || 0) + 1;
    const isLocked = newAttempts >= config.maxAttempts;
    const lockedUntil = isLocked ? new Date(Date.now() + config.lockoutDuration * 1000) : null;

    await prisma.staff.update({
      where: { id: staffId },
      data: {
        loginAttempts: newAttempts,
        lockedUntil,
      },
    });

    // Create security event
    await this.createSecurityEvent(staff.tenantId, {
      type: 'FAILED_LOGIN',
      staffId,
      severity: newAttempts >= 3 ? 'MEDIUM' : 'LOW',
      description: `Failed login attempt ${newAttempts}/${config.maxAttempts}`,
      metadata: { attempts: newAttempts, isLocked }
    });

    return {
      isLocked,
      remainingAttempts: Math.max(0, config.maxAttempts - newAttempts),
      lockoutDuration: isLocked ? config.lockoutDuration : undefined
    };
  }

  /**
   * Clear failed login attempts after successful login
   */
  async clearFailedAttempts(staffId: string): Promise<void> {
    await prisma.staff.update({
      where: { id: staffId },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
      },
    });
  }

  /**
   * Verify two-factor authentication token
   */
  async verifyTwoFactorToken(staffId: string, token: string): Promise<boolean> {
    const staff = await prisma.staff.findUnique({
      where: { id: staffId },
      select: { twoFactorSecret: true }
    });

    if (!staff?.twoFactorSecret) {
      return false;
    }

    // Here you would normally use a library like speakeasy to verify TOTP
    // For now, this is a placeholder
    return true;
  }

  /**
   * Generate backup codes for 2FA
   */
  async generateBackupCodes(staffId: string): Promise<string[]> {
    const codes = Array.from({ length: 10 }, () => 
      crypto.randomBytes(4).toString('hex').toUpperCase()
    );

    const hashedCodes = codes.map(code => bcrypt.hashSync(code, 10));

    await prisma.staff.update({
      where: { id: staffId },
      data: {
        backupCodes: JSON.stringify(hashedCodes)
      }
    });

    return codes;
  }

  /**
   * Create security event
   */
  private async createSecurityEvent(tenantId: string, event: {
    type: string;
    staffId?: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    description: string;
    metadata?: any;
  }): Promise<void> {
    try {
      await prisma.securityEvent.create({
        data: {
          tenantId,
          staffId: event.staffId,
          type: event.type,
          description: event.description,
        }
      });

      // Log critical events
      if (event.severity === 'CRITICAL' || event.severity === 'HIGH') {
        logger.error('Security Event', { ...event, tenantId });
      }
    } catch (error) {
      logger.error('Failed to create security event', { error, event });
    }
  }

  /**
   * Monitor for suspicious activity
   */
  async detectSuspiciousActivity(request: {
    ip: string;
    userAgent: string;
    staffId?: string;
    action: string;
  }): Promise<boolean> {
    const key = `${request.ip}:${request.userAgent}`;
    const now = new Date();
    
    let indicator = this.threatIndicators.get(key);
    if (!indicator) {
      indicator = {
        ip: request.ip,
        userAgent: request.userAgent,
        patterns: [],
        riskScore: 0,
        firstSeen: now,
        lastSeen: now,
        attempts: 0
      };
      this.threatIndicators.set(key, indicator);
    }

    indicator.lastSeen = now;
    indicator.attempts++;
    indicator.patterns.push(request.action);

    // Calculate risk score
    const timeDiff = now.getTime() - indicator.firstSeen.getTime();
    const rate = indicator.attempts / (timeDiff / 1000 / 60); // attempts per minute

    if (rate > 10) indicator.riskScore = 80;
    else if (rate > 5) indicator.riskScore = 50;
    else if (rate > 2) indicator.riskScore = 30;
    else indicator.riskScore = 10;

    // Check for suspicious patterns
    const suspiciousPatterns = ['password_reset', 'login_failed', 'unauthorized'];
    const suspiciousCount = indicator.patterns.filter(p => 
      suspiciousPatterns.some(sp => p.includes(sp))
    ).length;

    if (suspiciousCount > 5) {
      indicator.riskScore = Math.min(100, indicator.riskScore + 20);
    }

    return indicator.riskScore > 70;
  }

  /**
   * Create security alert
   */
  async createAlert(alert: Omit<SecurityAlert, 'id' | 'timestamp' | 'resolved'>): Promise<void> {
    const newAlert: SecurityAlert = {
      ...alert,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      resolved: false
    };

    this.alertHistory.push(newAlert);

    // Notify admins for high severity alerts
    if (alert.severity === 'CRITICAL' || alert.severity === 'HIGH') {
      logger.error('Security Alert', alert);
      // Here you would send notifications to admins
    }
  }

  /**
   * Get active security alerts
   */
  getActiveAlerts(): SecurityAlert[] {
    return this.alertHistory.filter(alert => !alert.resolved);
  }

  /**
   * Resolve security alert
   */
  resolveAlert(alertId: string): void {
    const alert = this.alertHistory.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
    }
  }

  /**
   * Audit log helper
   */
  async createAuditLog(data: {
    tenantId: string;
    staffId: string;
    action: string;
    resource: string;
    resourceId?: string;
    metadata?: any;
  }): Promise<void> {
    await prisma.auditLog.create({
      data: {
        tenantId: data.tenantId,
        staffId: data.staffId,
        action: data.action,
        resource: data.resource,
        resourceId: data.resourceId,
        metadata: data.metadata || {},
      }
    });
  }

  /**
   * Get login history for a staff member
   */
  async getLoginHistory(staffId: string, limit: number = 10): Promise<any[]> {
    const loginHistory = await prisma.loginHistory.findMany({
      where: { staffId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    return loginHistory;
  }

  /**
   * Clean up old security data
   */
  async cleanupOldData(): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90); // 90 days retention

    // Clean old login history
    await prisma.loginHistory.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate
        }
      }
    });

    // Clean old security events
    await prisma.securityEvent.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate
        }
      }
    });

    // Clean threat indicators from memory
    const now = Date.now();
    for (const [key, indicator] of this.threatIndicators.entries()) {
      if (now - indicator.lastSeen.getTime() > 24 * 60 * 60 * 1000) { // 24 hours
        this.threatIndicators.delete(key);
      }
    }
  }
}

export const securityService = new SecurityService();