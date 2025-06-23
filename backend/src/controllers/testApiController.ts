import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// テスト環境API設定管理
export const getApiSettings = async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params

    // テストモード確認
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
        message: 'テストモード以外では利用できません'
      })
    }

    const apiSettings = await prisma.tenantSetting.findMany({
      where: {
        tenantId: tenantId,
        key: {
          in: [
            'line_api_enabled',
            'line_channel_id',
            'line_channel_secret',
            'instagram_api_enabled',
            'instagram_app_id',
            'instagram_app_secret',
            'external_api_safety_mode',
            'api_log_enabled'
          ]
        }
      }
    })

    // デフォルト値設定
    const defaultSettings = {
      line_api_enabled: 'false',
      line_channel_id: '',
      line_channel_secret: '***masked***',
      instagram_api_enabled: 'false',
      instagram_app_id: '',
      instagram_app_secret: '***masked***',
      external_api_safety_mode: 'true',
      api_log_enabled: 'true'
    }

    const settings = apiSettings.reduce((acc, setting) => {
      (acc as any)[setting.key] = setting.value
      return acc
    }, defaultSettings as any)

    res.json({
      success: true,
      data: {
        settings: settings,
        testMode: true,
        safetyWarning: 'テスト環境では外部API送信は無効化されています'
      }
    })

  } catch (error) {
    console.error('API設定取得エラー:', error)
    res.status(500).json({
      success: false,
      message: 'API設定の取得に失敗しました',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// API設定更新（テスト環境用）
export const updateApiSettings = async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params
    const { settings } = req.body

    // テストモード確認
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
        message: 'テストモード以外では設定変更できません'
      })
    }

    // セキュリティ制限：外部送信は強制的に無効
    const secureSettings = {
      ...settings,
      external_api_safety_mode: 'true', // 強制的にセーフティモード有効
      line_api_enabled: 'false', // 外部送信無効
      instagram_api_enabled: 'false', // 外部送信無効
      api_log_enabled: 'true' // ログは有効
    }

    // 設定を個別に更新/作成
    const updatePromises = Object.entries(secureSettings).map(([key, value]) =>
      prisma.tenantSetting.upsert({
        where: {
          tenantId_key: {
            tenantId: tenantId,
            key: key
          }
        },
        update: {
          value: String(value)
        },
        create: {
          tenantId: tenantId,
          key: key,
          value: String(value)
        }
      })
    )

    await Promise.all(updatePromises)

    // セキュリティログ記録
    await logApiSettingChange(tenantId, 'API設定更新', {
      updatedKeys: Object.keys(secureSettings),
      safetyMode: true,
      testMode: true
    })

    res.json({
      success: true,
      message: 'API設定を更新しました（テスト環境セーフティモード）',
      data: {
        settings: secureSettings,
        securityNote: '外部API送信は安全のため無効化されています'
      }
    })

  } catch (error) {
    console.error('API設定更新エラー:', error)
    res.status(500).json({
      success: false,
      message: 'API設定の更新に失敗しました',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// テスト用API呼び出しシミュレーション
export const simulateApiCall = async (req: Request, res: Response) => {
  try {
    const { tenantId, apiType, action, data } = req.body

    // テストモード確認
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
        message: 'テストモード以外では利用できません'
      })
    }

    // 実際の外部API呼び出しは行わず、ログのみ記録
    const simulationResult = {
      apiType: apiType,
      action: action,
      timestamp: new Date().toISOString(),
      status: 'simulated',
      message: `${apiType} ${action} - テスト環境では実際の送信は行われません`,
      requestData: data,
      responseData: {
        success: true,
        message: 'シミュレーション成功',
        simulatedResponse: generateMockResponse(apiType, action)
      }
    }

    // 内部ログに記録
    await logApiCall(tenantId, simulationResult)

    res.json({
      success: true,
      message: 'API呼び出しをシミュレートしました',
      data: simulationResult
    })

  } catch (error) {
    console.error('APIシミュレーションエラー:', error)
    res.status(500).json({
      success: false,
      message: 'APIシミュレーションに失敗しました',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// API呼び出しログ取得
export const getApiLogs = async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params
    const { limit = 50, offset = 0 } = req.query

    const logs = await prisma.tenantSetting.findMany({
      where: {
        tenantId: tenantId,
        key: {
          startsWith: 'api_log_'
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: Number(limit),
      skip: Number(offset)
    })

    const parsedLogs = logs.map(log => ({
      id: log.id,
      timestamp: log.createdAt,
      data: JSON.parse(log.value)
    }))

    res.json({
      success: true,
      data: {
        logs: parsedLogs,
        total: logs.length,
        testMode: true
      }
    })

  } catch (error) {
    console.error('APIログ取得エラー:', error)
    res.status(500).json({
      success: false,
      message: 'APIログの取得に失敗しました',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// 内部ログ記録関数
async function logApiCall(tenantId: string, logData: any) {
  try {
    const logKey = `api_log_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
    
    await prisma.tenantSetting.create({
      data: {
        tenantId: tenantId,
        key: logKey,
        value: JSON.stringify(logData)
      }
    })
  } catch (error) {
    console.error('APIログ記録エラー:', error)
  }
}

// API設定変更ログ記録
async function logApiSettingChange(tenantId: string, action: string, details: any) {
  try {
    const logKey = `security_log_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
    
    await prisma.tenantSetting.create({
      data: {
        tenantId: tenantId,
        key: logKey,
        value: JSON.stringify({
          action: action,
          details: details,
          timestamp: new Date().toISOString(),
          type: 'api_settings'
        })
      }
    })
  } catch (error) {
    console.error('セキュリティログ記録エラー:', error)
  }
}

// モックレスポンス生成
function generateMockResponse(apiType: string, action: string) {
  switch (apiType) {
    case 'line':
      return {
        userId: 'mock_user_123',
        messageId: 'mock_msg_456',
        status: 'delivered',
        timestamp: new Date().toISOString()
      }
    case 'instagram':
      return {
        postId: 'mock_post_789',
        mediaId: 'mock_media_012',
        status: 'published',
        timestamp: new Date().toISOString()
      }
    default:
      return {
        status: 'success',
        message: 'Mock response generated',
        timestamp: new Date().toISOString()
      }
  }
}