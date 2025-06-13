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

    // Character requirements
    if (config.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('大文字を含む必要があります');
    }
    if (config.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('小文字を含む必要があります');
    }
    if (config.requireNumbers && !/\d/.test(password)) {
      errors.push('数字を含む必要があります');
    }
    if (config.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('特殊文字を含む必要があります');
    }

    // Repeating characters check
    const repeatingPattern = new RegExp(`(.)\\1{${config.maxRepeatingChars},}`, 'g');
    if (repeatingPattern.test(password)) {
      errors.push(`同じ文字を${config.maxRepeatingChars + 1}回以上連続で使用できません`);
    }

    // Common passwords check
    if (config.preventCommonPasswords && await this.isCommonPassword(password)) {
      errors.push('よく使用されるパスワードは使用できません');
    }

    // Password reuse check
    if (userId && config.preventPasswordReuse > 0) {
      const isReused = await this.isPasswordReused(userId, password, config.preventPasswordReuse);
      if (isReused) {
        errors.push(`過去${config.preventPasswordReuse}回のパスワードは使用できません`);
      }
    }

    // Calculate strength
    const strength = this.calculatePasswordStrength(password);

    return {
      isValid: errors.length === 0,
      errors,
      strength,
    };
  }

  /**
   * Account lockout management
   */
  async handleFailedLogin(staffId: string, ip: string): Promise<{
    isLocked: boolean;
    remainingAttempts: number;
    lockoutDuration?: number;
  }> {
    const config = SecurityConfig.auth.lockout;

    // Get or create account security record
    let accountSecurity = await prisma.accountSecurity.findUnique({
      where: { staffId },
    });

    if (!accountSecurity) {
      accountSecurity = await prisma.accountSecurity.create({
        data: {
          staffId,
          failedAttempts: 1,
          lastFailedAt: new Date(),
          isLocked: false,
        },
      });
    } else {
      // Check if lockout should be lifted
      if (accountSecurity.isLocked && accountSecurity.lockedUntil && new Date() > accountSecurity.lockedUntil) {
        await this.unlockAccount(staffId);
        accountSecurity.isLocked = false;
        accountSecurity.failedAttempts = 1;
      } else {
        accountSecurity.failedAttempts++;
      }

      // Update record
      await prisma.accountSecurity.update({
        where: { staffId },
        data: {
          failedAttempts: accountSecurity.failedAttempts,
          lastFailedAt: new Date(),
          lastFailedIp: ip,
        },
      });
    }

    // Check if account should be locked
    if (accountSecurity.failedAttempts >= config.maxFailedAttempts && !accountSecurity.isLocked) {
      await this.lockAccount(staffId, config.lockoutDuration);
      
      // Create security alert
      await this.createSecurityAlert({
        type: 'POLICY_VIOLATION',
        severity: 'HIGH',
        title: 'Account Locked Due to Failed Login Attempts',
        description: `Account ${staffId} locked after ${accountSecurity.failedAttempts} failed login attempts`,
        source: ip,
        evidence: {
          staffId,
          failedAttempts: accountSecurity.failedAttempts,
          ip,
        },
      });

      return {
        isLocked: true,
        remainingAttempts: 0,
        lockoutDuration: config.lockoutDuration,
      };
    }

    return {
      isLocked: accountSecurity.isLocked,
      remainingAttempts: Math.max(0, config.maxFailedAttempts - accountSecurity.failedAttempts),
    };
  }

  /**
   * Successful login handling
   */
  async handleSuccessfulLogin(staffId: string, ip: string, userAgent: string): Promise<void> {
    // Reset failed attempts
    await prisma.accountSecurity.upsert({
      where: { staffId },
      update: {
        failedAttempts: 0,
        lastSuccessfulAt: new Date(),
        lastSuccessfulIp: ip,
        isLocked: false,
        lockedUntil: null,
      },
      create: {
        staffId,
        failedAttempts: 0,
        lastSuccessfulAt: new Date(),
        lastSuccessfulIp: ip,
        isLocked: false,
      },
    });

    // Log successful login
    await this.logSecurityEvent({
      type: 'LOGIN_SUCCESS',
      staffId,
      ip,
      userAgent,
      severity: 'LOW',
      details: {
        loginTime: new Date(),
      },
    });

    // Check for suspicious login patterns
    await this.checkSuspiciousLoginPatterns(staffId, ip, userAgent);
  }

  /**
   * Threat detection and monitoring
   */
  async analyzeThreat(ip: string, userAgent: string, patterns: string[]): Promise<ThreatIndicator> {
    const key = `${ip}:${crypto.createHash('md5').update(userAgent).digest('hex')}`;
    
    let indicator = this.threatIndicators.get(key);
    if (!indicator) {
      indicator = {
        ip,
        userAgent,
        patterns,
        riskScore: 0,
        firstSeen: new Date(),
        lastSeen: new Date(),
        attempts: 1,
      };
    } else {
      indicator.lastSeen = new Date();
      indicator.attempts++;
      indicator.patterns = [...new Set([...indicator.patterns, ...patterns])];
    }

    // Calculate risk score
    indicator.riskScore = this.calculateRiskScore(indicator);

    this.threatIndicators.set(key, indicator);

    // Create alert if high risk
    if (indicator.riskScore >= 80) {
      await this.createSecurityAlert({
        type: 'SUSPICIOUS_ACTIVITY',
        severity: 'HIGH',
        title: 'High-Risk Threat Detected',
        description: `Suspicious activity detected from ${ip}`,
        source: ip,
        evidence: {
          riskScore: indicator.riskScore,
          patterns: indicator.patterns,
          attempts: indicator.attempts,
        },
      });
    }

    return indicator;
  }

  /**
   * Session security management
   */
  async validateSessionSecurity(sessionId: string, ip: string, userAgent: string): Promise<{
    isValid: boolean;
    reasons: string[];
  }> {
    const reasons: string[] = [];

    try {
      const session = await prisma.session.findUnique({
        where: { id: sessionId },
        include: { staff: true },
      });

      if (!session) {
        reasons.push('Session not found');
        return { isValid: false, reasons };
      }

      // Check expiration
      if (session.expiresAt < new Date()) {
        reasons.push('Session expired');
        await this.invalidateSession(sessionId);
        return { isValid: false, reasons };
      }

      // Check IP consistency (allow some flexibility for mobile users)
      if (session.ipAddress && session.ipAddress !== ip) {
        // Log potential session hijacking
        await this.logSecurityEvent({
          type: 'SUSPICIOUS_ACTIVITY',
          staffId: session.staffId,
          ip,
          userAgent,
          severity: 'MEDIUM',
          details: {
            originalIp: session.ipAddress,
            newIp: ip,
            sessionId,
          },
        });
        reasons.push('IP address mismatch');
      }

      // Check user agent consistency
      if (session.userAgent && session.userAgent !== userAgent) {
        await this.logSecurityEvent({
          type: 'SUSPICIOUS_ACTIVITY',
          staffId: session.staffId,
          ip,
          userAgent,
          severity: 'MEDIUM',
          details: {
            originalUserAgent: session.userAgent,
            newUserAgent: userAgent,
            sessionId,
          },
        });
        reasons.push('User agent mismatch');
      }

      // Check concurrent sessions
      const activeSessions = await prisma.session.count({
        where: {
          staffId: session.staffId,
          isActive: true,
          expiresAt: { gt: new Date() },
        },
      });

      if (activeSessions > SecurityConfig.session.maxConcurrentSessions) {
        reasons.push('Too many concurrent sessions');
        // Invalidate oldest sessions
        await this.enforceSessionLimit(session.staffId);
      }

      return {
        isValid: reasons.length === 0,
        reasons,
      };
    } catch (error) {
      logger.error('Session validation error:', error);
      return {
        isValid: false,
        reasons: ['Session validation failed'],
      };
    }
  }

  /**
   * Data access monitoring
   */
  async monitorDataAccess(
    staffId: string,
    operation: string,
    resourceType: string,
    resourceId?: string,
    sensitive: boolean = false
  ): Promise<void> {
    // Log the access
    await this.logSecurityEvent({
      type: 'DATA_ACCESS',
      staffId,
      ip: 'internal',
      userAgent: 'system',
      severity: sensitive ? 'MEDIUM' : 'LOW',
      details: {
        operation,
        resourceType,
        resourceId,
        sensitive,
        timestamp: new Date(),
      },
    });

    // Check for suspicious patterns
    const recentAccess = await prisma.securityLog.count({
      where: {
        staffId,
        type: 'DATA_ACCESS',
        timestamp: {
          gte: new Date(Date.now() - 60 * 60 * 1000), // Last hour
        },
      },
    });

    if (recentAccess > SecurityConfig.audit.alertThresholds.dataExports) {
      await this.createSecurityAlert({
        type: 'SUSPICIOUS_ACTIVITY',
        severity: 'MEDIUM',
        title: 'Unusual Data Access Pattern',
        description: `Staff member ${staffId} has accessed ${recentAccess} resources in the last hour`,
        source: 'system',
        evidence: {
          staffId,
          accessCount: recentAccess,
          timeWindow: '1 hour',
        },
      });
    }
  }

  /**
   * Security report generation
   */
  async generateSecurityReport(tenantId: string, startDate: Date, endDate: Date): Promise<{
    summary: {
      totalEvents: number;
      criticalAlerts: number;
      threatScore: number;
      trends: Record<string, number>;
    };
    events: any[];
    recommendations: string[];
  }> {
    const events = await prisma.securityLog.findMany({
      where: {
        tenantId,
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { timestamp: 'desc' },
    });

    const criticalAlerts = await prisma.securityAlert.count({
      where: {
        tenantId,
        severity: 'CRITICAL',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Calculate threat score
    const threatScore = this.calculateTenantThreatScore(events);

    // Generate trends
    const trends = this.analyzeTrends(events);

    // Generate recommendations
    const recommendations = this.generateRecommendations(events, threatScore);

    return {
      summary: {
        totalEvents: events.length,
        criticalAlerts,
        threatScore,
        trends,
      },
      events: events.slice(0, 100), // Limit to 100 most recent
      recommendations,
    };
  }

  // Private helper methods
  private async isCommonPassword(password: string): Promise<boolean> {
    const commonPasswords = [
      'password', '123456789', 'qwerty', 'abc123', 'password123',
      'admin', 'letmein', 'welcome', 'monkey', 'dragon'
    ];
    return commonPasswords.includes(password.toLowerCase());
  }

  private async isPasswordReused(staffId: string, password: string, count: number): Promise<boolean> {
    const passwordHistory = await prisma.passwordHistory.findMany({
      where: { staffId },
      orderBy: { createdAt: 'desc' },
      take: count,
    });

    for (const history of passwordHistory) {
      if (await bcrypt.compare(password, history.passwordHash)) {
        return true;
      }
    }

    return false;
  }

  private calculatePasswordStrength(password: string): 'WEAK' | 'MEDIUM' | 'STRONG' | 'VERY_STRONG' {
    let score = 0;

    // Length bonus
    score += Math.min(password.length * 2, 25);

    // Character variety
    if (/[a-z]/.test(password)) score += 5;
    if (/[A-Z]/.test(password)) score += 5;
    if (/\d/.test(password)) score += 5;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 10;

    // Patterns penalty
    if (/(.)\1{2,}/.test(password)) score -= 10;
    if (/123|abc|qwe/i.test(password)) score -= 10;

    if (score < 30) return 'WEAK';
    if (score < 60) return 'MEDIUM';
    if (score < 90) return 'STRONG';
    return 'VERY_STRONG';
  }

  private async lockAccount(staffId: string, duration: number): Promise<void> {
    const lockedUntil = new Date(Date.now() + duration);
    
    await prisma.accountSecurity.update({
      where: { staffId },
      data: {
        isLocked: true,
        lockedUntil,
        lockReason: 'Exceeded maximum failed login attempts',
      },
    });

    // Invalidate all sessions
    await prisma.session.updateMany({
      where: { staffId },
      data: { isActive: false },
    });
  }

  private async unlockAccount(staffId: string): Promise<void> {
    await prisma.accountSecurity.update({
      where: { staffId },
      data: {
        isLocked: false,
        lockedUntil: null,
        failedAttempts: 0,
        lockReason: null,
      },
    });
  }

  private calculateRiskScore(indicator: ThreatIndicator): number {
    let score = 0;

    // Base score from patterns
    score += indicator.patterns.length * 10;

    // Frequency multiplier
    const hoursActive = (indicator.lastSeen.getTime() - indicator.firstSeen.getTime()) / (1000 * 60 * 60);
    const frequency = indicator.attempts / Math.max(hoursActive, 1);
    score += Math.min(frequency * 5, 50);

    // Pattern severity
    for (const pattern of indicator.patterns) {
      if (pattern.includes('sql') || pattern.includes('script')) score += 20;
      if (pattern.includes('admin') || pattern.includes('system')) score += 15;
      if (pattern.includes('..')) score += 10;
    }

    return Math.min(score, 100);
  }

  private async checkSuspiciousLoginPatterns(staffId: string, ip: string, userAgent: string): Promise<void> {
    // Check for unusual time patterns
    const staff = await prisma.staff.findUnique({
      where: { id: staffId },
      include: { loginHistory: { take: 10, orderBy: { timestamp: 'desc' } } },
    });

    if (staff?.loginHistory && staff.loginHistory.length >= 5) {
      const currentHour = new Date().getHours();
      const usualHours = staff.loginHistory.map(login => login.timestamp.getHours());
      const averageHour = usualHours.reduce((sum, hour) => sum + hour, 0) / usualHours.length;
      
      if (Math.abs(currentHour - averageHour) > 6) {
        await this.createSecurityAlert({
          type: 'SUSPICIOUS_ACTIVITY',
          severity: 'MEDIUM',
          title: 'Unusual Login Time',
          description: `Staff member logged in at unusual time: ${currentHour}:00`,
          source: ip,
          evidence: {
            staffId,
            loginTime: currentHour,
            averageTime: averageHour,
          },
        });
      }
    }
  }

  private async invalidateSession(sessionId: string): Promise<void> {
    await prisma.session.update({
      where: { id: sessionId },
      data: { isActive: false },
    });
  }

  private async enforceSessionLimit(staffId: string): Promise<void> {
    const sessions = await prisma.session.findMany({
      where: {
        staffId,
        isActive: true,
        expiresAt: { gt: new Date() },
      },
      orderBy: { lastActivity: 'asc' },
    });

    const sessionsToInvalidate = sessions.slice(0, sessions.length - SecurityConfig.session.maxConcurrentSessions);
    
    for (const session of sessionsToInvalidate) {
      await this.invalidateSession(session.id);
    }
  }

  private calculateTenantThreatScore(events: any[]): number {
    // Implement threat scoring algorithm
    return Math.min(events.filter(e => e.severity === 'HIGH' || e.severity === 'CRITICAL').length * 10, 100);
  }

  private analyzeTrends(events: any[]): Record<string, number> {
    const trends: Record<string, number> = {};
    
    for (const event of events) {
      const type = event.type;
      trends[type] = (trends[type] || 0) + 1;
    }

    return trends;
  }

  private generateRecommendations(events: any[], threatScore: number): string[] {
    const recommendations: string[] = [];

    if (threatScore > 70) {
      recommendations.push('システムのセキュリティレビューを実施してください');
    }

    const failedLogins = events.filter(e => e.type === 'FAILED_AUTH').length;
    if (failedLogins > 50) {
      recommendations.push('パスワードポリシーの強化を検討してください');
    }

    return recommendations;
  }

  private async createSecurityAlert(alert: Omit<SecurityAlert, 'id' | 'timestamp' | 'resolved'>): Promise<void> {
    const securityAlert: SecurityAlert = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      resolved: false,
      ...alert,
    };

    this.alertHistory.push(securityAlert);

    // Store in database
    await prisma.securityAlert.create({
      data: {
        id: securityAlert.id,
        type: securityAlert.type,
        severity: securityAlert.severity,
        title: securityAlert.title,
        description: securityAlert.description,
        source: securityAlert.source,
        evidence: JSON.stringify(securityAlert.evidence),
        resolved: false,
      },
    });

    // Send notification for high-severity alerts
    if (securityAlert.severity === 'HIGH' || securityAlert.severity === 'CRITICAL') {
      try {
        const notificationService = getNotificationService();
        await notificationService.notifySystemAlert(
          'default-tenant',
          securityAlert.title,
          securityAlert.description,
          'URGENT'
        );
      } catch (error) {
        logger.error('Failed to send security alert notification:', error);
      }
    }

    logger.warn('Security Alert Created:', securityAlert);
  }

  private async logSecurityEvent(event: {
    type: string;
    staffId?: string;
    ip: string;
    userAgent: string;
    severity: string;
    details: Record<string, any>;
  }): Promise<void> {
    await prisma.securityLog.create({
      data: {
        type: event.type,
        staffId: event.staffId,
        ip: event.ip,
        userAgent: event.userAgent,
        severity: event.severity,
        details: JSON.stringify(event.details),
        timestamp: new Date(),
      },
    });
  }
}

export const securityService = new SecurityService();