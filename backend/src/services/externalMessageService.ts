import { PrismaClient } from '@prisma/client'
import LineService from './lineService'
import InstagramService from './instagramService'
import logger from '../utils/logger'

const prisma = new PrismaClient()

interface MessageData {
  channel: 'LINE' | 'INSTAGRAM'
  recipientId: string
  content: string
  mediaType?: 'TEXT' | 'IMAGE' | 'STICKER' | 'FILE'
  mediaUrl?: string
  tenantId: string
}

export class ExternalMessageService {
  private lineService: LineService
  private instagramService: InstagramService

  constructor() {
    this.lineService = new LineService()
    this.instagramService = new InstagramService()
  }

  /**
   * APIクレデンシャルを取得
   */
  private async getApiCredentials(tenantId: string, service: 'line' | 'instagram') {
    try {
      // まずSupabaseのapi_settingsテーブルから取得を試みる
      const apiSetting = await prisma.$queryRaw<any[]>`
        SELECT credentials 
        FROM api_settings 
        WHERE "tenantId" = ${tenantId} 
        AND service = ${service}
        LIMIT 1
      `
      
      if (apiSetting && apiSetting[0]?.credentials) {
        return apiSetting[0].credentials
      }
    } catch (error) {
      logger.warn('Failed to fetch API credentials from database', { error, tenantId, service })
    }

    // フォールバック：環境変数から取得
    if (service === 'line') {
      return {
        channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
        channelSecret: process.env.LINE_CHANNEL_SECRET,
      }
    } else if (service === 'instagram') {
      return {
        accessToken: process.env.INSTAGRAM_ACCESS_TOKEN,
        pageId: process.env.INSTAGRAM_PAGE_ID,
      }
    }

    return null
  }

  /**
   * 外部APIにメッセージを送信
   */
  async sendMessage(data: MessageData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      logger.info('Sending external message', { 
        channel: data.channel, 
        tenantId: data.tenantId,
        recipientId: data.recipientId.substring(0, 10) + '...' // プライバシー保護
      })

      if (data.channel === 'LINE') {
        return await this.sendLineMessage(data)
      } else if (data.channel === 'INSTAGRAM') {
        return await this.sendInstagramMessage(data)
      }

      return {
        success: false,
        error: 'Unsupported channel',
      }
    } catch (error: any) {
      logger.error('External message send failed', { error: error.message, data })
      return {
        success: false,
        error: error.message || 'Failed to send message',
      }
    }
  }

  /**
   * LINE経由でメッセージを送信
   */
  private async sendLineMessage(data: MessageData) {
    const credentials = await this.getApiCredentials(data.tenantId, 'line')
    
    if (!credentials?.channelAccessToken) {
      logger.warn('LINE credentials not found for tenant', { tenantId: data.tenantId })
      return {
        success: false,
        error: 'LINE API credentials not configured',
      }
    }

    // LineServiceを初期化
    this.lineService = new LineService(
      credentials.channelAccessToken,
      credentials.channelSecret
    )

    // メッセージを送信
    const result = await this.lineService.sendMessage(
      data.recipientId,
      data.content,
      data.mediaUrl
    )

    if (result.success) {
      logger.info('LINE message sent successfully', { 
        recipientId: data.recipientId.substring(0, 10) + '...',
        tenantId: data.tenantId 
      })
    }

    return result
  }

  /**
   * Instagram経由でメッセージを送信
   */
  private async sendInstagramMessage(data: MessageData) {
    const credentials = await this.getApiCredentials(data.tenantId, 'instagram')
    
    if (!credentials?.accessToken || !credentials?.pageId) {
      logger.warn('Instagram credentials not found for tenant', { tenantId: data.tenantId })
      return {
        success: false,
        error: 'Instagram API credentials not configured',
      }
    }

    // InstagramServiceを初期化
    this.instagramService = new InstagramService(
      credentials.accessToken,
      credentials.pageId
    )

    // メッセージを送信
    let result
    if (data.mediaUrl && data.mediaType === 'IMAGE') {
      result = await this.instagramService.sendMessage(
        data.recipientId,
        data.content,
        data.mediaUrl
      )
    } else {
      result = await this.instagramService.sendMessage(
        data.recipientId,
        data.content
      )
    }

    if (result.success) {
      logger.info('Instagram message sent successfully', { 
        recipientId: data.recipientId.substring(0, 10) + '...',
        tenantId: data.tenantId 
      })
    }

    return result
  }

  /**
   * メッセージ送信前の確認（オプション）
   */
  async validateBeforeSend(data: MessageData): Promise<{ valid: boolean; reason?: string }> {
    // 送信先の検証
    if (!data.recipientId) {
      return { valid: false, reason: 'Recipient ID is required' }
    }

    // コンテンツの検証
    if (!data.content && !data.mediaUrl) {
      return { valid: false, reason: 'Message content or media is required' }
    }

    // チャンネル固有の検証
    if (data.channel === 'INSTAGRAM') {
      // Instagram APIの制限チェック（24時間ルールなど）
      // 実際の実装では、最後のユーザーメッセージから24時間以内かチェック
    }

    return { valid: true }
  }
}

export default ExternalMessageService