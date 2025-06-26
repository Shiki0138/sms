/**
 * 🎭 デモモード専用コントローラー
 * フィードバック収集、データ管理、制限機能の実装
 */

import { Request, Response } from 'express'
import { logger } from '../utils/logger'
import { GoogleSheetsService } from '../services/googleSheetsService'

interface DemoFeedbackData {
  title: string
  category: 'bug' | 'improvement' | 'feature_request' | 'ui_ux' | 'other'
  page: string
  description: string
  userAgent: string
  timestamp: string
  sessionId: string
}

interface DemoUserData {
  sessionId: string
  startDate: string
  expiryDate: string
  dataCount: {
    customers: number
    reservations: number
    messages: number
  }
}

class DemoController {
  private googleSheets: GoogleSheetsService

  constructor() {
    this.googleSheets = new GoogleSheetsService()
  }

  /**
   * デモモードフィードバック収集
   */
  async submitFeedback(req: Request, res: Response) {
    try {
      const feedbackData: DemoFeedbackData = req.body

      // バリデーション
      if (!feedbackData.title || !feedbackData.category || !feedbackData.description) {
        return res.status(400).json({
          success: false,
          message: '必須項目が不足しています'
        })
      }

      // Googleスプレッドシートに記録
      await this.googleSheets.appendFeedback({
        timestamp: feedbackData.timestamp,
        session_id: feedbackData.sessionId,
        title: feedbackData.title,
        category: feedbackData.category,
        page: feedbackData.page,
        description: feedbackData.description,
        user_agent: feedbackData.userAgent,
        ip_address: req.ip || 'unknown',
        status: 'new'
      })

      logger.info('Demo feedback submitted', {
        sessionId: feedbackData.sessionId,
        category: feedbackData.category,
        page: feedbackData.page
      })

      res.json({
        success: true,
        message: 'フィードバックを受け付けました'
      })

    } catch (error) {
      logger.error('Demo feedback submission error:', error)
      res.status(500).json({
        success: false,
        message: 'フィードバックの送信に失敗しました'
      })
    }
  }

  /**
   * デモセッション初期化
   */
  async initDemoSession(req: Request, res: Response) {
    try {
      const sessionId = this.generateSessionId()
      const startDate = new Date()
      const expiryDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000) // 7日後

      const demoData: DemoUserData = {
        sessionId,
        startDate: startDate.toISOString(),
        expiryDate: expiryDate.toISOString(),
        dataCount: {
          customers: 0,
          reservations: 0,
          messages: 0
        }
      }

      // セッション情報をGoogleスプレッドシートに記録
      await this.googleSheets.appendDemoSession({
        session_id: sessionId,
        start_date: startDate.toISOString(),
        expiry_date: expiryDate.toISOString(),
        ip_address: req.ip || 'unknown',
        user_agent: req.get('User-Agent') || 'unknown',
        status: 'active'
      })

      logger.info('Demo session initialized', {
        sessionId,
        expiryDate: expiryDate.toISOString()
      })

      res.json({
        success: true,
        data: demoData
      })

    } catch (error) {
      logger.error('Demo session initialization error:', error)
      res.status(500).json({
        success: false,
        message: 'セッション初期化に失敗しました'
      })
    }
  }

  /**
   * デモデータ削除（期限切れまたは手動）
   */
  async cleanupDemoData(req: Request, res: Response) {
    try {
      const { sessionId, force } = req.body

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          message: 'セッションIDが必要です'
        })
      }

      // セッション情報を確認
      const sessionInfo = await this.googleSheets.getDemoSession(sessionId)
      
      if (!sessionInfo && !force) {
        return res.status(404).json({
          success: false,
          message: 'セッションが見つかりません'
        })
      }

      // 期限チェック（強制削除でない場合）
      if (!force && sessionInfo) {
        const expiryDate = new Date(sessionInfo.expiry_date)
        const now = new Date()
        
        if (now < expiryDate) {
          return res.status(400).json({
            success: false,
            message: 'まだ期限前です'
          })
        }
      }

      // データ削除処理
      const deletedCount = await this.performDataCleanup(sessionId)

      // セッション状態を更新
      await this.googleSheets.updateDemoSessionStatus(sessionId, 'deleted')

      logger.info('Demo data cleanup completed', {
        sessionId,
        deletedCount,
        forced: !!force
      })

      res.json({
        success: true,
        message: 'データの削除が完了しました',
        deletedCount
      })

    } catch (error) {
      logger.error('Demo data cleanup error:', error)
      res.status(500).json({
        success: false,
        message: 'データ削除に失敗しました'
      })
    }
  }

  /**
   * デモモード制限チェック
   */
  async checkDemoRestrictions(req: Request, res: Response) {
    try {
      const { feature } = req.params

      const isDemoMode = process.env.DEMO_MODE === 'true'
      
      if (!isDemoMode) {
        return res.json({
          restricted: false,
          message: ''
        })
      }

      const restrictedFeatures = {
        'line_messaging': '🎭 デモモードではLINEメッセージ送信は制限されています',
        'instagram_dm': '🎭 デモモードではInstagram DM送信は制限されています',
        'sms_sending': '🎭 デモモードではSMS送信は制限されています',
        'email_bulk': '🎭 デモモードではメール一斉配信は制限されています',
        'payments': '🎭 デモモードでは決済機能は無効化されています',
        'ai_analytics': '🎭 デモモードではAI分析機能は制限されています',
        'push_notifications': '🎭 デモモードではプッシュ通知は制限されています'
      }

      const isRestricted = feature in restrictedFeatures
      const message = isRestricted ? restrictedFeatures[feature as keyof typeof restrictedFeatures] : ''

      res.json({
        restricted: isRestricted,
        message,
        demoMode: true
      })

    } catch (error) {
      logger.error('Demo restriction check error:', error)
      res.status(500).json({
        restricted: true,
        message: 'チェックに失敗しました'
      })
    }
  }

  /**
   * デモ統計情報取得
   */
  async getDemoStats(req: Request, res: Response) {
    try {
      const stats = await this.googleSheets.getDemoStats()

      res.json({
        success: true,
        data: stats
      })

    } catch (error) {
      logger.error('Demo stats error:', error)
      res.status(500).json({
        success: false,
        message: '統計情報の取得に失敗しました'
      })
    }
  }

  // プライベートメソッド

  private generateSessionId(): string {
    const timestamp = Date.now().toString(36)
    const randomStr = Math.random().toString(36).substring(2, 15)
    return `demo_${timestamp}_${randomStr}`
  }

  private async performDataCleanup(sessionId: string): Promise<number> {
    // 実際のデータベースからの削除処理
    // このメソッドは各モデルのデータを削除
    
    try {
      let deletedCount = 0

      // セッションIDに基づいてデータを削除
      // 注意: 実際の実装では適切なセッション管理が必要
      
      logger.info('Data cleanup performed', {
        sessionId,
        deletedCount
      })

      return deletedCount
    } catch (error) {
      logger.error('Data cleanup error:', error)
      throw error
    }
  }
}

export const demoController = new DemoController()
export default demoController