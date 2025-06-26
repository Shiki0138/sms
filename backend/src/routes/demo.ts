/**
 * 🎭 デモモード専用ルート
 * フィードバック収集、セッション管理、制限チェック
 */

import express from 'express'
import { demoController } from '../controllers/demoController'
import { logger } from '../utils/logger'

const router = express.Router()

/**
 * デモモードチェックミドルウェア
 */
const checkDemoMode = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const isDemoMode = process.env.DEMO_MODE === 'true'
  
  if (!isDemoMode) {
    return res.status(403).json({
      success: false,
      message: 'デモモード以外では利用できません'
    })
  }
  
  next()
}

/**
 * レート制限ミドルウェア（フィードバック用）
 */
const feedbackRateLimit = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const sessionId = req.body.sessionId
  const key = `feedback_rate_${sessionId || req.ip}`
  
  // 簡易レート制限（実装は必要に応じて強化）
  const lastSubmit = (req as any).session?.[key]
  const now = Date.now()
  
  if (lastSubmit && (now - lastSubmit) < 60000) { // 1分間に1回まで
    return res.status(429).json({
      success: false,
      message: 'フィードバックの送信間隔が短すぎます。1分後に再試行してください。'
    })
  }
  
  if (!(req as any).session) {
    (req as any).session = {}
  }
  (req as any).session[key] = now
  
  next()
}

// =============================================================================
// デモセッション管理
// =============================================================================

/**
 * POST /api/demo/session/init
 * デモセッション初期化
 */
router.post('/session/init', checkDemoMode, async (req, res) => {
  try {
    await demoController.initDemoSession(req, res)
  } catch (error) {
    logger.error('Demo session init route error:', error)
    res.status(500).json({
      success: false,
      message: 'セッション初期化でエラーが発生しました'
    })
  }
})

/**
 * POST /api/demo/session/cleanup
 * デモデータ削除
 */
router.post('/session/cleanup', checkDemoMode, async (req, res) => {
  try {
    await demoController.cleanupDemoData(req, res)
  } catch (error) {
    logger.error('Demo session cleanup route error:', error)
    res.status(500).json({
      success: false,
      message: 'データ削除でエラーが発生しました'
    })
  }
})

// =============================================================================
// フィードバック収集
// =============================================================================

/**
 * POST /api/demo/feedback
 * フィードバック送信
 */
router.post('/feedback', checkDemoMode, feedbackRateLimit, async (req, res) => {
  try {
    // リクエストボディのバリデーション
    const { title, category, description } = req.body
    
    if (!title || title.length > 200) {
      return res.status(400).json({
        success: false,
        message: 'タイトルは1-200文字で入力してください'
      })
    }
    
    if (!description || description.length > 2000) {
      return res.status(400).json({
        success: false,
        message: '説明は1-2000文字で入力してください'
      })
    }
    
    const validCategories = ['bug', 'improvement', 'feature_request', 'ui_ux', 'other']
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: '無効なカテゴリーです'
      })
    }

    await demoController.submitFeedback(req, res)
  } catch (error) {
    logger.error('Demo feedback route error:', error)
    res.status(500).json({
      success: false,
      message: 'フィードバック送信でエラーが発生しました'
    })
  }
})

// =============================================================================
// 機能制限チェック
// =============================================================================

/**
 * GET /api/demo/restrictions/:feature
 * 特定機能の制限状況をチェック
 */
router.get('/restrictions/:feature', async (req, res) => {
  try {
    await demoController.checkDemoRestrictions(req, res)
  } catch (error) {
    logger.error('Demo restrictions route error:', error)
    res.status(500).json({
      restricted: true,
      message: '制限チェックでエラーが発生しました'
    })
  }
})

/**
 * GET /api/demo/restrictions
 * 全制限事項の取得
 */
router.get('/restrictions', async (req, res) => {
  try {
    const isDemoMode = process.env.DEMO_MODE === 'true'
    
    const restrictions = {
      isDemoMode,
      restrictedFeatures: isDemoMode ? [
        {
          feature: 'line_messaging',
          name: 'LINEメッセージ送信',
          description: 'デモモードではLINE API呼び出しは制限されています'
        },
        {
          feature: 'instagram_dm',
          name: 'Instagram DM送信',
          description: 'デモモードではInstagram API呼び出しは制限されています'
        },
        {
          feature: 'sms_sending',
          name: 'SMS送信',
          description: 'デモモードではSMS送信は制限されています'
        },
        {
          feature: 'email_bulk',
          name: 'メール一斉配信',
          description: 'デモモードでは大量メール送信は制限されています'
        },
        {
          feature: 'payments',
          name: '決済機能',
          description: 'デモモードでは実際の決済は無効化されています'
        },
        {
          feature: 'ai_analytics',
          name: 'AI分析',
          description: 'デモモードでは高度なAI分析は制限されています'
        },
        {
          feature: 'push_notifications',
          name: 'プッシュ通知',
          description: 'デモモードではプッシュ通知は制限されています'
        }
      ] : [],
      allowedFeatures: [
        {
          feature: 'csv_import',
          name: 'CSVインポート',
          description: 'CSVデータの取り込みは利用可能です'
        },
        {
          feature: 'data_export',
          name: 'データエクスポート',
          description: 'CSVエクスポートは利用可能です'
        },
        {
          feature: 'basic_analytics',
          name: '基本分析',
          description: '基本的な分析機能は利用可能です'
        }
      ]
    }

    res.json({
      success: true,
      data: restrictions
    })

  } catch (error) {
    logger.error('Demo restrictions list route error:', error)
    res.status(500).json({
      success: false,
      message: '制限事項の取得でエラーが発生しました'
    })
  }
})

// =============================================================================
// 統計・管理
// =============================================================================

/**
 * GET /api/demo/stats
 * デモ統計情報取得（管理者用）
 */
router.get('/stats', async (req, res) => {
  try {
    // 簡易認証（実際の実装では適切な認証が必要）
    const adminKey = req.headers['x-admin-key']
    if (adminKey !== process.env.DEMO_ADMIN_KEY) {
      return res.status(401).json({
        success: false,
        message: '認証が必要です'
      })
    }

    await demoController.getDemoStats(req, res)
  } catch (error) {
    logger.error('Demo stats route error:', error)
    res.status(500).json({
      success: false,
      message: '統計情報の取得でエラーが発生しました'
    })
  }
})

/**
 * GET /api/demo/health
 * デモモードヘルスチェック
 */
router.get('/health', (req, res) => {
  const isDemoMode = process.env.DEMO_MODE === 'true'
  const hasGoogleSheetsConfig = !!process.env.GOOGLE_SHEETS_ID
  
  res.json({
    success: true,
    demoMode: isDemoMode,
    googleSheetsEnabled: hasGoogleSheetsConfig,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  })
})

// =============================================================================
// エラーハンドリング
// =============================================================================

/**
 * 404エラーハンドラー
 */
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'デモAPIエンドポイントが見つかりません'
  })
})

/**
 * エラーハンドラー
 */
router.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Demo route error:', error)
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'デモAPIでエラーが発生しました',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  })
})

export default router