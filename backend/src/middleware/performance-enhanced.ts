/**
 * 🚀 感動するAPIパフォーマンス監視・最適化ミドルウェア
 * 「スタッフが『このシステム、魔法のように早い！』と感動する体験を提供」
 */

import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger'

// パフォーマンスメトリクス収集
interface PerformanceMetrics {
  startTime: number
  endTime: number
  duration: number
  route: string
  method: string
  statusCode: number
  memoryUsage: NodeJS.MemoryUsage
  userAgent?: string
  ip?: string
}

// 感動体験のための応答時間目標
const PERFORMANCE_TARGETS = {
  LIGHTNING: 50,     // ⚡ 電光石火 - 瞬間レスポンス
  EXCELLENT: 100,    // ✨ 素晴らしい - 快適体験
  GOOD: 200,         // 👍 良好 - 満足体験
  WARNING: 500,      // ⚠️  警告 - 改善必要
  CRITICAL: 1000     // 🚨 危険 - 緊急対応
}

class PerformanceTracker {
  private metrics: PerformanceMetrics[] = []
  private slowQueries: Array<{ route: string; duration: number; timestamp: Date }> = []

  // 美容室スタッフへの心温まるパフォーマンスメッセージ
  private getPerformanceMessage(duration: number): string {
    if (duration <= PERFORMANCE_TARGETS.LIGHTNING) {
      return '⚡ 電光石火！スタッフの皆様に最高の体験をお届け'
    } else if (duration <= PERFORMANCE_TARGETS.EXCELLENT) {
      return '✨ 素晴らしい応答速度！お客様対応に集中できます'
    } else if (duration <= PERFORMANCE_TARGETS.GOOD) {
      return '👍 快適な動作でスムーズな業務をサポート'
    } else if (duration <= PERFORMANCE_TARGETS.WARNING) {
      return '⚠️  少し時間がかかりました。最適化を検討します'
    } else {
      return '🚨 応答が遅れています。緊急改善でスタッフをサポート'
    }
  }

  // パフォーマンス品質レベル判定
  public getQualityLevel(duration: number): 'LIGHTNING' | 'EXCELLENT' | 'GOOD' | 'WARNING' | 'CRITICAL' {
    if (duration <= PERFORMANCE_TARGETS.LIGHTNING) return 'LIGHTNING'
    if (duration <= PERFORMANCE_TARGETS.EXCELLENT) return 'EXCELLENT'
    if (duration <= PERFORMANCE_TARGETS.GOOD) return 'GOOD'
    if (duration <= PERFORMANCE_TARGETS.WARNING) return 'WARNING'
    return 'CRITICAL'
  }

  // メトリクス記録（美容室業務に配慮した詳細ログ）
  recordMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric)
    
    const qualityLevel = this.getQualityLevel(metric.duration)
    const message = this.getPerformanceMessage(metric.duration)

    // 美容室スタッフへの温かいログメッセージ
    const logData = {
      timestamp: new Date().toISOString(),
      route: metric.route,
      method: metric.method,
      duration: `${metric.duration}ms`,
      qualityLevel,
      message,
      statusCode: metric.statusCode,
      memoryUsage: {
        used: `${Math.round(metric.memoryUsage.heapUsed / 1024 / 1024 * 100) / 100}MB`,
        total: `${Math.round(metric.memoryUsage.heapTotal / 1024 / 1024 * 100) / 100}MB`
      },
      userExperience: qualityLevel === 'LIGHTNING' || qualityLevel === 'EXCELLENT' ? '😊 快適' : '🔧 改善中'
    }

    // 品質レベルに応じたログレベル
    if (qualityLevel === 'CRITICAL') {
      logger.error('🚨 緊急パフォーマンス警告', logData)
      this.alertSlowResponse(metric)
    } else if (qualityLevel === 'WARNING') {
      logger.warn('⚠️ パフォーマンス注意', logData)
    } else {
      logger.info('✨ パフォーマンス良好', logData)
    }

    // メトリクス保持数制限（メモリ効率化）
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-500)
    }
  }

  // 遅いレスポンスのアラート（美容室業務への影響を最小化）
  private alertSlowResponse(metric: PerformanceMetrics): void {
    this.slowQueries.push({
      route: metric.route,
      duration: metric.duration,
      timestamp: new Date()
    })

    // 美容室スタッフへの配慮あるアラートメッセージ
    const alertMessage = `
🚨 美容室システム改善通知 🚨
ルート: ${metric.route} 
応答時間: ${metric.duration}ms
お忙しい中申し訳ございません。
システムを最適化してより快適な体験をお届けします。
    `.trim()

    logger.error(alertMessage)
    
    // 連続する遅いクエリの検出
    const recentSlowQueries = this.slowQueries.filter(
      q => Date.now() - q.timestamp.getTime() < 60000 // 過去1分
    )
    
    if (recentSlowQueries.length >= 3) {
      logger.error('🚨 連続パフォーマンス問題検出 - 緊急最適化を開始します')
    }
  }

  // 美容室業務時間を考慮した統計レポート
  getPerformanceReport(): any {
    if (this.metrics.length === 0) return null

    const durations = this.metrics.map(m => m.duration)
    const routes = this.metrics.reduce((acc, m) => {
      acc[m.route] = acc[m.route] || []
      acc[m.route].push(m.duration)
      return acc
    }, {} as Record<string, number[]>)

    return {
      summary: {
        totalRequests: this.metrics.length,
        averageResponseTime: Math.round(durations.reduce((a, b) => a + b, 0) / durations.length),
        p95ResponseTime: this.calculatePercentile(durations, 95),
        lightningResponses: durations.filter(d => d <= PERFORMANCE_TARGETS.LIGHTNING).length,
        excellentResponses: durations.filter(d => d <= PERFORMANCE_TARGETS.EXCELLENT).length,
        userSatisfaction: Math.round((durations.filter(d => d <= PERFORMANCE_TARGETS.GOOD).length / durations.length) * 100)
      },
      routePerformance: Object.entries(routes).map(([route, times]) => ({
        route,
        avgResponseTime: Math.round(times.reduce((a, b) => a + b, 0) / times.length),
        requestCount: times.length,
        qualityRating: this.getRouteQualityRating(times)
      })),
      userExperience: {
        message: durations.filter(d => d <= PERFORMANCE_TARGETS.EXCELLENT).length > durations.length * 0.8 
          ? '✨ 美容室スタッフの皆様に最高の体験を提供中'
          : '🔧 より良い体験のためシステムを最適化中',
        satisfactionLevel: durations.filter(d => d <= PERFORMANCE_TARGETS.GOOD).length / durations.length
      }
    }
  }

  private calculatePercentile(values: number[], percentile: number): number {
    const sorted = values.sort((a, b) => a - b)
    const index = Math.ceil(sorted.length * (percentile / 100)) - 1
    return sorted[index] || 0
  }

  private getRouteQualityRating(times: number[]): string {
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length
    if (avgTime <= PERFORMANCE_TARGETS.LIGHTNING) return '⚡ 電光石火'
    if (avgTime <= PERFORMANCE_TARGETS.EXCELLENT) return '✨ 素晴らしい'
    if (avgTime <= PERFORMANCE_TARGETS.GOOD) return '👍 良好'
    if (avgTime <= PERFORMANCE_TARGETS.WARNING) return '⚠️ 改善必要'
    return '🚨 緊急対応'
  }
}

// グローバルパフォーマンストラッカー
const performanceTracker = new PerformanceTracker()

// 美容室スタッフに感動を届けるパフォーマンス監視ミドルウェア
export const enhancedPerformanceMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now()
  const startMemory = process.memoryUsage()

  // 美容室業務に優しいヘッダー設定
  res.setHeader('X-Salon-System', '💫 Beauty Management System')
  res.setHeader('X-Performance-Goal', '⚡ Lightning Fast Experience')

  // レスポンス完了時の処理
  res.on('finish', () => {
    const endTime = Date.now()
    const duration = endTime - startTime
    const endMemory = process.memoryUsage()

    const metric: PerformanceMetrics = {
      startTime,
      endTime,
      duration,
      route: req.route?.path || req.path,
      method: req.method,
      statusCode: res.statusCode,
      memoryUsage: endMemory,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    }

    performanceTracker.recordMetric(metric)

    // 美容室スタッフへの応答時間フィードバック
    res.setHeader('X-Response-Time', `${duration}ms`)
    res.setHeader('X-Performance-Quality', performanceTracker.getQualityLevel(duration))
    res.setHeader('X-User-Experience', duration <= PERFORMANCE_TARGETS.EXCELLENT ? '😊 快適' : '🔧 最適化中')
  })

  next()
}

// 美容室運営に役立つパフォーマンスレポート API
export const getPerformanceReport = () => {
  return performanceTracker.getPerformanceReport()
}

// システム健全性チェック（美容室業務の安心感向上）
export const systemHealthCheck = () => {
  const memUsage = process.memoryUsage()
  const uptime = process.uptime()
  
  return {
    status: '✅ システム正常稼働中',
    uptime: {
      seconds: Math.floor(uptime),
      formatted: `${Math.floor(uptime / 3600)}時間${Math.floor((uptime % 3600) / 60)}分`
    },
    memory: {
      used: `${Math.round(memUsage.heapUsed / 1024 / 1024 * 100) / 100}MB`,
      total: `${Math.round(memUsage.heapTotal / 1024 / 1024 * 100) / 100}MB`,
      usage: `${Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100)}%`,
      status: memUsage.heapUsed / memUsage.heapTotal < 0.8 ? '✅ 良好' : '⚠️ 注意'
    },
    performance: performanceTracker.getPerformanceReport(),
    message: '💫 美容室の皆様の素晴らしい業務をシステムが全力でサポート中'
  }
}

export default enhancedPerformanceMiddleware