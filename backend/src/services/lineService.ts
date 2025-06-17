import axios from 'axios';
import { logger } from '../utils/logger';

interface LineMessage {
  to: string;
  messages: Array<{
    type: 'text';
    text: string;
  }>;
}

export class LineService {
  private accessToken: string;
  private apiUrl = 'https://api.line.me/v2/bot/message';

  constructor() {
    this.accessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN || '';
    
    if (!this.accessToken) {
      logger.warn('LINE_CHANNEL_ACCESS_TOKEN is not set. LINE messaging will be disabled.');
    }
  }

  /**
   * LINEメッセージ送信
   */
  async sendMessage(lineUserId: string, message: string): Promise<boolean> {
    if (!this.accessToken) {
      logger.error('LINE access token is not configured');
      return false;
    }

    try {
      const lineMessage: LineMessage = {
        to: lineUserId,
        messages: [
          {
            type: 'text',
            text: message
          }
        ]
      };

      const response = await axios.post(
        `${this.apiUrl}/push`,
        lineMessage,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10秒タイムアウト
        }
      );

      if (response.status === 200) {
        logger.info(`LINE message sent successfully to ${lineUserId}`);
        return true;
      } else {
        logger.error(`LINE API responded with status ${response.status}:`, response.data);
        return false;
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const errorData = error.response?.data;
        
        switch (status) {
          case 400:
            logger.error('LINE API: Bad Request - Invalid message format or user ID');
            break;
          case 401:
            logger.error('LINE API: Unauthorized - Invalid access token');
            break;
          case 403:
            logger.error('LINE API: Forbidden - User has blocked the bot or invalid permissions');
            break;
          case 429:
            logger.error('LINE API: Rate limit exceeded');
            break;
          case 500:
            logger.error('LINE API: Internal server error');
            break;
          default:
            logger.error(`LINE API error (${status}):`, errorData);
        }
      } else {
        logger.error('Failed to send LINE message:', error);
      }
      return false;
    }
  }

  /**
   * 複数ユーザーにメッセージ送信（マルチキャスト）
   */
  async sendMulticastMessage(lineUserIds: string[], message: string): Promise<{ 
    successCount: number; 
    failureCount: number; 
  }> {
    if (!this.accessToken) {
      logger.error('LINE access token is not configured');
      return { successCount: 0, failureCount: lineUserIds.length };
    }

    if (lineUserIds.length === 0) {
      return { successCount: 0, failureCount: 0 };
    }

    // LINEのマルチキャスト制限: 最大500ユーザー
    const maxBatchSize = 500;
    let successCount = 0;
    let failureCount = 0;

    try {
      for (let i = 0; i < lineUserIds.length; i += maxBatchSize) {
        const batch = lineUserIds.slice(i, i + maxBatchSize);
        
        const multicastMessage = {
          to: batch,
          messages: [
            {
              type: 'text',
              text: message
            }
          ]
        };

        try {
          const response = await axios.post(
            `${this.apiUrl}/multicast`,
            multicastMessage,
            {
              headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json'
              },
              timeout: 30000 // 30秒タイムアウト（バッチ処理）
            }
          );

          if (response.status === 200) {
            successCount += batch.length;
            logger.info(`LINE multicast sent successfully to ${batch.length} users`);
          } else {
            failureCount += batch.length;
            logger.error(`LINE multicast failed for batch of ${batch.length} users:`, response.data);
          }
        } catch (batchError) {
          failureCount += batch.length;
          logger.error(`LINE multicast batch error:`, batchError);
        }

        // レート制限対策：バッチ間で少し待機
        if (i + maxBatchSize < lineUserIds.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    } catch (error) {
      logger.error('LINE multicast error:', error);
      failureCount = lineUserIds.length;
    }

    return { successCount, failureCount };
  }

  /**
   * LINE Messaging API接続テスト
   */
  async testConnection(): Promise<boolean> {
    if (!this.accessToken) {
      logger.error('LINE access token is not configured');
      return false;
    }

    try {
      // Channel情報を取得してテスト
      const response = await axios.get('https://api.line.me/v2/bot/info', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        },
        timeout: 5000
      });

      if (response.status === 200) {
        logger.info('LINE API connection test successful:', response.data);
        return true;
      } else {
        logger.error('LINE API connection test failed:', response.status);
        return false;
      }
    } catch (error) {
      logger.error('LINE API connection test error:', error);
      return false;
    }
  }

  /**
   * リッチメニュー設定（オプション機能）
   */
  async setRichMenu(richMenuId: string, lineUserId: string): Promise<boolean> {
    if (!this.accessToken) {
      logger.error('LINE access token is not configured');
      return false;
    }

    try {
      const response = await axios.post(
        `https://api.line.me/v2/bot/user/${lineUserId}/richmenu/${richMenuId}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          },
          timeout: 5000
        }
      );

      return response.status === 200;
    } catch (error) {
      logger.error('Failed to set LINE rich menu:', error);
      return false;
    }
  }

  /**
   * ユーザープロフィール取得
   */
  async getUserProfile(lineUserId: string): Promise<{
    displayName?: string;
    pictureUrl?: string;
    statusMessage?: string;
  } | null> {
    if (!this.accessToken) {
      logger.error('LINE access token is not configured');
      return null;
    }

    try {
      const response = await axios.get(
        `https://api.line.me/v2/bot/profile/${lineUserId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          },
          timeout: 5000
        }
      );

      if (response.status === 200) {
        return response.data;
      } else {
        logger.error('Failed to get LINE user profile:', response.status);
        return null;
      }
    } catch (error) {
      logger.error('LINE user profile error:', error);
      return null;
    }
  }
}