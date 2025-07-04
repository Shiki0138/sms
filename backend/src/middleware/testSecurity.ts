import { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// テスト環境セキュリティミドルウェア
export const testEnvironmentSecurity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // テスト環境での外部API送信を完全に無効化
    if (req.path.includes('/api/test/')) {
      // セーフティモードを強制的に有効にする
      req.body.safetyMode = true
      req.headers['x-test-mode'] = 'true'
      
      // 実際の外部送信を防ぐ
      const originalFetch = global.fetch
      global.fetch = async (url: string | URL | Request, init?: RequestInit) => {
        // 外部URLへのリクエストを検出
        const urlString = url.toString()
        if (urlString.includes('line.me') || 
            urlString.includes('instagram.com') || 
            urlString.includes('graph.facebook.com') ||
            urlString.includes('api.line.me')) {
          
          // ログに記録
          console.log(`[TEST-SECURITY] 外部API送信をブロック: ${urlString}`)
          
          // モックレスポンスを返す
          return Promise.resolve(new Response(JSON.stringify({
            success: true,
            message: 'テスト環境では実際の送信は行われません',
            timestamp: new Date().toISOString(),
            blocked_url: urlString
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }))
        }
        
        // 内部リクエストは通す
        return originalFetch(url, init)
      }
    }
    
    next()
  } catch (error) {
    console.error('テスト環境セキュリティエラー:', error)
    next()
  }
}

// テストモード確認ミドルウェア
export const verifyTestMode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId } = req.params

    if (tenantId) {
      const testMode = await prisma.tenantSetting.findUnique({
        where: {
          tenantId_key: {
            tenantId: tenantId,
            key: 'test_mode'
          }
        }
      })

      if (!testMode || testMode.value !== 'true') {
        return res.status(403).json({
          success: false,
          message: 'この操作はテストモード以外では実行できません'
        })
      }
    }

    next()
  } catch (error) {
    console.error('テストモード確認エラー:', error)
    res.status(500).json({
      success: false,
      message: 'テストモードの確認に失敗しました'
    })
  }
}

// API送信ログ記録
export const logApiAttempt = (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send

  res.send = function(data) {
    // テスト環境でのAPI呼び出しをログに記録
    if (req.headers['x-test-mode'] === 'true') {
      console.log(`[TEST-API-LOG] ${req.method} ${req.path}`, {
        timestamp: new Date().toISOString(),
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        body: req.body,
        response: data
      })
    }
    
    return originalSend.call(this, data)
  }

  next()
}