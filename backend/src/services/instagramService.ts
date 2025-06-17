import axios from 'axios';
import { logger } from '../utils/logger';

interface InstagramMessage {
  recipient: {
    id: string;
  };
  message: {
    text: string;
  };
  messaging_type: 'RESPONSE' | 'UPDATE' | 'MESSAGE_TAG';
  tag?: string;
}

export class InstagramService {
  private accessToken: string;
  private pageId: string;
  private apiVersion = 'v18.0';
  private apiUrl: string;

  constructor() {
    this.accessToken = process.env.INSTAGRAM_ACCESS_TOKEN || '';
    this.pageId = process.env.INSTAGRAM_PAGE_ID || '';
    this.apiUrl = `https://graph.facebook.com/${this.apiVersion}`;
    
    if (!this.accessToken || !this.pageId) {
      logger.warn('Instagram credentials are not fully configured. Instagram messaging will be disabled.');
    }
  }

  /**
   * Instagramメッセージ送信
   */
  async sendMessage(instagramUserId: string, message: string): Promise<boolean> {
    if (!this.accessToken || !this.pageId) {
      logger.error('Instagram credentials are not configured');
      return false;
    }

    try {
      // Instagram Messaging APIには24時間ルールがあるため、
      // 最近の会話があるかチェックしてから送信タイプを決定
      const messagingType = await this.getMessagingType(instagramUserId);
      
      const instagramMessage: InstagramMessage = {
        recipient: {
          id: instagramUserId
        },
        message: {
          text: message
        },
        messaging_type: messagingType
      };

      // MESSAGE_TAGの場合は適切なタグを設定
      if (messagingType === 'MESSAGE_TAG') {
        instagramMessage.tag = 'CONFIRMED_EVENT_UPDATE'; // 予約確認に適したタグ
      }

      const response = await axios.post(
        `${this.apiUrl}/${this.pageId}/messages`,
        instagramMessage,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          params: {
            access_token: this.accessToken
          },
          timeout: 10000
        }
      );

      if (response.data && response.data.message_id) {
        logger.info(`Instagram message sent successfully to ${instagramUserId}: ${response.data.message_id}`);
        return true;
      } else {
        logger.error('Instagram API responded without message_id:', response.data);
        return false;
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const errorData = error.response?.data;
        
        switch (status) {
          case 400:
            logger.error('Instagram API: Bad Request - Invalid message format or user ID');
            if (errorData?.error?.code === 10) {
              logger.error('Instagram API: Cannot send message outside 24-hour window without valid tag');
            }
            break;
          case 401:
            logger.error('Instagram API: Unauthorized - Invalid access token');
            break;
          case 403:
            logger.error('Instagram API: Forbidden - User has not interacted with the page or permissions issue');
            break;
          case 429:
            logger.error('Instagram API: Rate limit exceeded');
            break;
          case 500:
            logger.error('Instagram API: Internal server error');
            break;
          default:
            logger.error(`Instagram API error (${status}):`, errorData);
        }
      } else {
        logger.error('Failed to send Instagram message:', error);
      }
      return false;
    }
  }

  /**
   * 適切なmessaging_typeを判定
   */
  private async getMessagingType(instagramUserId: string): Promise<'RESPONSE' | 'UPDATE' | 'MESSAGE_TAG'> {
    try {
      // 最近の会話履歴をチェック（簡略化）
      const conversations = await this.getRecentConversations(instagramUserId);
      
      if (conversations && conversations.length > 0) {
        const lastMessage = conversations[0];
        const lastMessageTime = new Date(lastMessage.created_time);
        const now = new Date();
        const hoursDiff = (now.getTime() - lastMessageTime.getTime()) / (1000 * 60 * 60);
        
        // 24時間以内なら RESPONSE
        if (hoursDiff < 24) {
          return 'RESPONSE';
        }
      }
      
      // 24時間を超えている場合はMESSAGE_TAG（タグ付きメッセージ）
      return 'MESSAGE_TAG';
    } catch (error) {
      logger.warn('Could not determine messaging type, defaulting to MESSAGE_TAG:', error);
      return 'MESSAGE_TAG';
    }
  }

  /**
   * 最近の会話履歴を取得
   */
  private async getRecentConversations(instagramUserId: string): Promise<any[]> {
    try {
      const response = await axios.get(
        `${this.apiUrl}/${this.pageId}/conversations`,
        {
          params: {
            access_token: this.accessToken,
            user_id: instagramUserId,
            limit: 1
          },
          timeout: 5000
        }
      );

      return response.data.data || [];
    } catch (error) {
      logger.error('Failed to get Instagram conversations:', error);
      return [];
    }
  }

  /**
   * Instagram Graph API接続テスト
   */
  async testConnection(): Promise<boolean> {
    if (!this.accessToken || !this.pageId) {
      logger.error('Instagram credentials are not configured');
      return false;
    }

    try {
      // Page情報を取得してテスト
      const response = await axios.get(
        `${this.apiUrl}/${this.pageId}`,
        {
          params: {
            access_token: this.accessToken,
            fields: 'id,name,instagram_business_account'
          },
          timeout: 5000
        }
      );

      if (response.data && response.data.id) {
        logger.info('Instagram API connection test successful:', {
          pageId: response.data.id,
          pageName: response.data.name,
          hasInstagramAccount: !!response.data.instagram_business_account
        });
        return true;
      } else {
        logger.error('Instagram API connection test failed: No page data');
        return false;
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error('Instagram API connection test error:', {
          status: error.response?.status,
          data: error.response?.data
        });
      } else {
        logger.error('Instagram API connection test error:', error);
      }
      return false;
    }
  }

  /**
   * Webhook情報の取得（デバッグ用）
   */
  async getWebhookInfo(): Promise<any> {
    if (!this.accessToken || !this.pageId) {
      logger.error('Instagram credentials are not configured');
      return null;
    }

    try {
      const response = await axios.get(
        `${this.apiUrl}/${this.pageId}/subscribed_apps`,
        {
          params: {
            access_token: this.accessToken
          },
          timeout: 5000
        }
      );

      return response.data;
    } catch (error) {
      logger.error('Failed to get Instagram webhook info:', error);
      return null;
    }
  }

  /**
   * ユーザープロフィール取得
   */
  async getUserProfile(instagramUserId: string): Promise<{
    name?: string;
    profile_pic?: string;
  } | null> {
    if (!this.accessToken) {
      logger.error('Instagram access token is not configured');
      return null;
    }

    try {
      const response = await axios.get(
        `${this.apiUrl}/${instagramUserId}`,
        {
          params: {
            access_token: this.accessToken,
            fields: 'name,profile_pic'
          },
          timeout: 5000
        }
      );

      if (response.data) {
        return response.data;
      } else {
        logger.error('Failed to get Instagram user profile: No data');
        return null;
      }
    } catch (error) {
      logger.error('Instagram user profile error:', error);
      return null;
    }
  }

  /**
   * メッセージ配信可能かチェック
   */
  async canSendMessage(instagramUserId: string): Promise<boolean> {
    try {
      // 最近の会話があるかチェック
      const conversations = await this.getRecentConversations(instagramUserId);
      
      if (conversations && conversations.length > 0) {
        const lastMessage = conversations[0];
        const lastMessageTime = new Date(lastMessage.created_time);
        const now = new Date();
        const hoursDiff = (now.getTime() - lastMessageTime.getTime()) / (1000 * 60 * 60);
        
        // 24時間以内または適切なタグが使える場合
        return hoursDiff < 24 || this.canUseMessageTag();
      }
      
      return this.canUseMessageTag();
    } catch (error) {
      logger.error('Failed to check Instagram message eligibility:', error);
      return false;
    }
  }

  /**
   * MESSAGE_TAGが使用可能かチェック
   */
  private canUseMessageTag(): boolean {
    // 予約確認等のビジネス用途ではCONFIRMED_EVENT_UPDATEタグが使用可能
    // 実際の実装では、ビジネス認証状況や権限をチェック
    return true;
  }
}