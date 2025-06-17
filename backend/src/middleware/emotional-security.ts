/**
 * 🛡️ 感動セキュリティシステム
 * 「美容室スタッフが『このシステムなら絶対安心！』と心から信頼できる最高レベルのセキュリティ」
 */

import { Request, Response, NextFunction } from 'express'
import rateLimit from 'express-rate-limit'
import { logger } from '../utils/logger'
import emotionalCache from '../utils/emotional-cache'

// 美容室業務に配慮したセキュリティ設定
const SECURITY_CONFIG = {
  rateLimit: {
    // 通常業務では余裕をもって、緊急時にブロックしない設計
    standard: { windowMs: 15 * 60 * 1000, max: 200 }, // 15分で200リクエスト
    auth: { windowMs: 15 * 60 * 1000, max: 10 },      // 認証は15分で10回
    sensitive: { windowMs: 5 * 60 * 1000, max: 20 },  // 機密操作は5分で20回
  },
  security: {
    maxLoginAttempts: 5,           // ログイン試行回数
    lockoutDuration: 15 * 60 * 1000, // 15分ロックアウト
    suspiciousThreshold: 3,        // 怪しい行動の閾値
    sessionTimeout: 24 * 60 * 60 * 1000 // 24時間セッション
  },
  whitelist: {
    ips: ['127.0.0.1', '::1'],     // 本番環境では適切に設定
    userAgents: ['Salon-Management-App']
  }
}

interface SecurityEvent {
  type: 'RATE_LIMIT' | 'SUSPICIOUS_LOGIN' | 'BLOCKED_IP' | 'UNUSUAL_ACTIVITY'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  ip: string
  userAgent?: string
  details: any
  timestamp: Date
}

class EmotionalSecurityService {
  private suspiciousIPs: Map<string, number> = new Map()
  private blockedIPs: Set<string> = new Set()
  private loginAttempts: Map<string, { count: number, lastAttempt: Date }> = new Map()
  private securityEvents: SecurityEvent[] = []

  /**
   * 🛡️ 美容室業務に優しいレート制限
   */
  createEmotionalRateLimit(type: 'standard' | 'auth' | 'sensitive' = 'standard') {
    const config = SECURITY_CONFIG.rateLimit[type]
    
    return rateLimit({
      windowMs: config.windowMs,
      max: config.max,
      message: (req: Request) => ({
        success: false,
        error: 'Rate limit exceeded',
        message: '🚨 少し早すぎるアクセスを検出しました',
        userMessage: '美容室の皆様の安全のため、少しお待ちください。通常業務への影響はありません。',
        retryAfter: Math.ceil(config.windowMs / 1000 / 60),
        supportMessage: 'ご不便をおかけして申し訳ございません。緊急の場合はシステム管理者にお声かけください。'
      }),
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req: Request, res: Response) => {
        const event: SecurityEvent = {
          type: 'RATE_LIMIT',
          severity: 'MEDIUM',
          ip: req.ip || 'unknown',
          userAgent: req.get('User-Agent'),
          details: { 
            path: req.path, 
            method: req.method,
            limitType: type,
            message: '美容室業務中の過度なアクセスを制限しました'
          },
          timestamp: new Date()
        }
        
        this.logSecurityEvent(event)
        res.status(429).json(event.details)
      },
      keyGenerator: (req: Request) => {
        // IP + User Agent での識別（より精密な制御）
        return `${req.ip}-${req.get('User-Agent') || 'unknown'}`
      }
    })
  }

  /**
   * 💝 美容室スタッフを守る不正アクセス検知
   */
  suspiciousActivityDetection = (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || 'unknown'
    const userAgent = req.get('User-Agent') || ''
    
    // 💫 怪しい行動パターンの検出
    const suspiciousPatterns = [
      // SQL インジェクション試行
      /(\bor\b|\band\b).*=.*('|")/i.test(req.url),
      // XSS 試行
      /<script|javascript:|on\w+=/i.test(req.url),
      // ディレクトリトラバーサル
      /\.\.\//.test(req.url),
      // 一般的な攻撃パス
      /\/(admin|wp-admin|phpmyadmin|cpanel)/i.test(req.url),
      // ボットからの疑わしいアクセス
      /bot|crawler|spider|scraper/i.test(userAgent) && !req.path.startsWith('/api'),
    ]

    const isSuspicious = suspiciousPatterns.some(pattern => pattern)

    if (isSuspicious) {
      const currentCount = this.suspiciousIPs.get(ip) || 0
      this.suspiciousIPs.set(ip, currentCount + 1)

      const event: SecurityEvent = {
        type: 'SUSPICIOUS_LOGIN',
        severity: currentCount >= SECURITY_CONFIG.security.suspiciousThreshold ? 'HIGH' : 'MEDIUM',
        ip,
        userAgent,
        details: {
          path: req.path,
          method: req.method,
          suspiciousPattern: suspiciousPatterns.findIndex(p => p),
          message: '美容室システムへの不正アクセス試行を検出しました'
        },
        timestamp: new Date()
      }

      this.logSecurityEvent(event)

      // 閾値を超えた場合はIPをブロック
      if (currentCount >= SECURITY_CONFIG.security.suspiciousThreshold) {
        this.blockedIPs.add(ip)
        
        logger.warn('🚨 IPアドレスをブロックしました - 美容室システムを保護', {
          ip,
          userAgent,
          attempts: currentCount,
          userMessage: '不正アクセスからシステムを守りました'
        })

        return res.status(403).json({
          success: false,
          error: 'Access denied',
          message: '🛡️ セキュリティシステムが作動しました',
          userMessage: '美容室システムの安全のため、このアクセスをブロックしました。',
          supportMessage: '正当なアクセスの場合は、システム管理者にお声かけください。'
        })
      }
    }

    return next()
  }

  /**
   * 🔒 美容室の大切なデータを守るIP制限
   */
  ipBlockingMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || 'unknown'

    // ブロックされたIPの確認
    if (this.blockedIPs.has(ip)) {
      const event: SecurityEvent = {
        type: 'BLOCKED_IP',
        severity: 'HIGH',
        ip,
        userAgent: req.get('User-Agent'),
        details: {
          path: req.path,
          method: req.method,
          message: 'ブロック済みIPからのアクセス試行'
        },
        timestamp: new Date()
      }

      this.logSecurityEvent(event)

      return res.status(403).json({
        success: false,
        error: 'IP blocked',
        message: '🚫 このIPアドレスはブロックされています',
        userMessage: '美容室システムの安全確保のため、アクセスを制限しています。',
        supportMessage: 'アクセス制限の解除については、システム管理者にお問い合わせください。'
      })
    }

    return next()
  }

  /**
   * 🌟 美容室スタッフへの心温まるログイン保護
   */
  loginProtection = (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || 'unknown'
    const attemptKey = `${ip}-${req.body.email || 'unknown'}`

    const attempts = this.loginAttempts.get(attemptKey)
    const now = new Date()

    if (attempts) {
      // ロックアウト期間中かチェック
      const timeSinceLastAttempt = now.getTime() - attempts.lastAttempt.getTime()
      
      if (attempts.count >= SECURITY_CONFIG.security.maxLoginAttempts) {
        if (timeSinceLastAttempt < SECURITY_CONFIG.security.lockoutDuration) {
          const remainingTime = Math.ceil((SECURITY_CONFIG.security.lockoutDuration - timeSinceLastAttempt) / 1000 / 60)
          
          return res.status(429).json({
            success: false,
            error: 'Account temporarily locked',
            message: '🔒 アカウントが一時的にロックされています',
            userMessage: `美容室の皆様のセキュリティのため、${remainingTime}分後に再度お試しください。`,
            remainingMinutes: remainingTime,
            supportMessage: '緊急の場合は、システム管理者にお声かけください。'
          })
        } else {
          // ロックアウト期間終了、カウントリセット
          this.loginAttempts.delete(attemptKey)
        }
      }
    }

    // ログイン試行後に呼び出される関数を req に追加
    req.recordLoginAttempt = (success: boolean) => {
      if (success) {
        // 成功時はカウントをクリア
        this.loginAttempts.delete(attemptKey)
        logger.info('✨ 美容室スタッフのログイン成功', {
          ip,
          email: req.body.email,
          userMessage: 'システムへの安全なアクセスが確認されました'
        })
      } else {
        // 失敗時はカウントを増加
        const currentAttempts = this.loginAttempts.get(attemptKey)
        const newCount = currentAttempts ? currentAttempts.count + 1 : 1
        
        this.loginAttempts.set(attemptKey, {
          count: newCount,
          lastAttempt: now
        })

        const remainingAttempts = SECURITY_CONFIG.security.maxLoginAttempts - newCount

        logger.warn('⚠️ ログイン試行失敗', {
          ip,
          email: req.body.email,
          attempts: newCount,
          remainingAttempts: Math.max(0, remainingAttempts),
          userMessage: remainingAttempts > 0 
            ? `あと${remainingAttempts}回試行できます` 
            : 'アカウントがロックされます'
        })
      }
    }

    return next()
  }

  /**
   * 📊 美容室スタッフ向けセキュリティレポート
   */
  async getSecurityReport(): Promise<any> {
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // 過去24時間のイベント
    const recentEvents = this.securityEvents.filter(e => e.timestamp > oneDayAgo)
    const weeklyEvents = this.securityEvents.filter(e => e.timestamp > oneWeekAgo)

    // 脅威レベル分析
    const threatLevel = this.calculateThreatLevel(recentEvents)

    return {
      status: '🛡️ 美容室システムセキュリティ状況',
      threatLevel: {
        current: threatLevel,
        message: this.getThreatLevelMessage(threatLevel),
        color: this.getThreatLevelColor(threatLevel)
      },
      metrics: {
        dailyStats: {
          totalEvents: recentEvents.length,
          rateLimitEvents: recentEvents.filter(e => e.type === 'RATE_LIMIT').length,
          suspiciousActivities: recentEvents.filter(e => e.type === 'SUSPICIOUS_LOGIN').length,
          blockedAttempts: recentEvents.filter(e => e.type === 'BLOCKED_IP').length
        },
        weeklyStats: {
          totalEvents: weeklyEvents.length,
          uniqueThreats: new Set(weeklyEvents.map(e => e.ip)).size,
          averageDaily: Math.round(weeklyEvents.length / 7)
        }
      },
      protection: {
        blockedIPs: this.blockedIPs.size,
        suspiciousIPs: this.suspiciousIPs.size,
        activeLoginProtections: this.loginAttempts.size,
        message: `${this.blockedIPs.size}個のIPをブロック中。美容室システムを安全に保護しています。`
      },
      recommendations: this.generateSecurityRecommendations(recentEvents),
      userMessage: '💝 美容室の皆様の大切なデータとプライバシーを全力で守っています',
      lastUpdated: now.toISOString()
    }
  }

  /**
   * 🔍 脅威レベル計算
   */
  private calculateThreatLevel(events: SecurityEvent[]): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const criticalEvents = events.filter(e => e.severity === 'CRITICAL').length
    const highEvents = events.filter(e => e.severity === 'HIGH').length
    const mediumEvents = events.filter(e => e.severity === 'MEDIUM').length

    if (criticalEvents > 0) return 'CRITICAL'
    if (highEvents > 2) return 'HIGH'
    if (mediumEvents > 5 || highEvents > 0) return 'MEDIUM'
    return 'LOW'
  }

  /**
   * 💬 脅威レベル別メッセージ
   */
  private getThreatLevelMessage(level: string): string {
    switch (level) {
      case 'CRITICAL':
        return '🚨 緊急: システム管理者への連絡が必要です'
      case 'HIGH':
        return '⚠️ 注意: セキュリティ強化が推奨されます'
      case 'MEDIUM':
        return '👀 監視中: 通常より多くの脅威を検出'
      case 'LOW':
      default:
        return '✅ 安全: システムは正常に保護されています'
    }
  }

  /**
   * 🎨 脅威レベル別カラーコード
   */
  private getThreatLevelColor(level: string): string {
    switch (level) {
      case 'CRITICAL': return '#dc2626'  // red-600
      case 'HIGH': return '#ea580c'      // orange-600
      case 'MEDIUM': return '#ca8a04'    // yellow-600
      case 'LOW': 
      default: return '#16a34a'          // green-600
    }
  }

  /**
   * 💡 セキュリティ推奨事項生成
   */
  private generateSecurityRecommendations(events: SecurityEvent[]): string[] {
    const recommendations: string[] = []

    if (events.length === 0) {
      recommendations.push('✨ セキュリティ状況は良好です。美容室業務に集中できます')
    }

    if (events.filter(e => e.type === 'RATE_LIMIT').length > 5) {
      recommendations.push('📊 アクセス頻度が高めです。業務効率化のため、操作を見直すことをお勧めします')
    }

    if (events.filter(e => e.type === 'SUSPICIOUS_LOGIN').length > 0) {
      recommendations.push('🔒 不審なアクセスを検出しました。パスワードの確認をお勧めします')
    }

    if (this.blockedIPs.size > 0) {
      recommendations.push('🛡️ 複数の不正IPをブロック中です。システムは安全に保護されています')
    }

    recommendations.push('💝 定期的なパスワード変更で、さらに安全な美容室システムを維持できます')

    return recommendations
  }

  /**
   * 📝 セキュリティイベントログ
   */
  private logSecurityEvent(event: SecurityEvent): void {
    this.securityEvents.push(event)

    // メモリ効率化のため、古いイベントは削除
    if (this.securityEvents.length > 1000) {
      this.securityEvents = this.securityEvents.slice(-500)
    }

    // 重要度に応じてログレベル調整
    const logMessage = `🛡️ セキュリティイベント検出: ${event.type}`
    const logData = {
      ...event,
      userFriendlyMessage: this.getUserFriendlyMessage(event),
      actionTaken: this.getActionTaken(event)
    }

    if (event.severity === 'CRITICAL') {
      logger.error(logMessage, logData)
    } else if (event.severity === 'HIGH') {
      logger.warn(logMessage, logData)
    } else {
      logger.info(logMessage, logData)
    }
  }

  /**
   * 💬 ユーザーフレンドリーなメッセージ生成
   */
  private getUserFriendlyMessage(event: SecurityEvent): string {
    switch (event.type) {
      case 'RATE_LIMIT':
        return '美容室業務の安全のため、アクセス頻度を制限しました'
      case 'SUSPICIOUS_LOGIN':
        return '不審なアクセスパターンを検出し、システムを保護しました'
      case 'BLOCKED_IP':
        return '危険なIPアドレスからのアクセスをブロックしました'
      case 'UNUSUAL_ACTIVITY':
        return '通常と異なる活動を検出し、監視を強化しました'
      default:
        return 'セキュリティシステムが正常に動作しています'
    }
  }

  /**
   * 🛠️ 実行されたアクション
   */
  private getActionTaken(event: SecurityEvent): string {
    switch (event.type) {
      case 'RATE_LIMIT':
        return 'アクセス頻度制限を適用'
      case 'SUSPICIOUS_LOGIN':
        return 'IPアドレスを監視リストに追加'
      case 'BLOCKED_IP':
        return 'IPアドレスを完全ブロック'
      case 'UNUSUAL_ACTIVITY':
        return '追加監視を開始'
      default:
        return '標準セキュリティ対応'
    }
  }

  /**
   * 🌙 美容室終業時のセキュリティクリーンアップ
   */
  async endOfDaySecurityCleanup(): Promise<void> {
    // 古いセキュリティイベントのクリーンアップ
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    this.securityEvents = this.securityEvents.filter(e => e.timestamp > oneDayAgo)

    // 一時的なブロックの解除判定
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    for (const [key, attempt] of this.loginAttempts.entries()) {
      if (attempt.lastAttempt < oneHourAgo) {
        this.loginAttempts.delete(key)
      }
    }

    logger.info('🌙 美容室セキュリティ終業クリーンアップ完了', {
      clearedEvents: this.securityEvents.length,
      activeBlocks: this.blockedIPs.size,
      message: '今日も一日、システムを安全に保護しました'
    })
  }
}

// 美容室専用感動セキュリティサービス
export const emotionalSecurity = new EmotionalSecurityService()

// 型定義は types/auth.ts で統一管理

export default emotionalSecurity