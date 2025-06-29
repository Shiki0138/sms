import axios from 'axios';
import crypto from 'crypto';
import { logger } from '../utils/logger';

export interface ExternalMessage {
  id: string;
  senderId: string;
  content: string;
  mediaType: 'TEXT' | 'IMAGE' | 'STICKER' | 'FILE';
  mediaUrl?: string;
  timestamp: Date;
}

export interface SendMessageRequest {
  recipientId: string;
  content: string;
  mediaType?: 'TEXT' | 'IMAGE' | 'STICKER' | 'FILE';
  mediaUrl?: string;
}

/**
 * Instagram Graph API Service
 */
export class InstagramApiService {
  private accessToken: string;
  private apiVersion: string;

  constructor(accessToken: string, apiVersion: string = 'v17.0') {
    this.accessToken = accessToken;
    this.apiVersion = apiVersion;
  }

  /**
   * Send message via Instagram API
   */
  async sendMessage(request: SendMessageRequest): Promise<string> {
    try {
      const url = `https://graph.facebook.com/${this.apiVersion}/me/messages`;
      
      const payload: any = {
        recipient: {
          id: request.recipientId,
        },
        message: {},
      };

      // Handle different message types
      switch (request.mediaType) {
        case 'IMAGE':
          if (!request.mediaUrl) {
            throw new Error('Media URL is required for image messages');
          }
          payload.message.attachment = {
            type: 'image',
            payload: {
              url: request.mediaUrl,
            },
          };
          break;
        
        case 'TEXT':
        default:
          payload.message.text = request.content;
          break;
      }

      const response = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      logger.info('Instagram message sent successfully', {
        messageId: response.data.message_id,
        recipientId: request.recipientId,
      });

      return response.data.message_id;
    } catch (error) {
      logger.error('Failed to send Instagram message', {
        error: error instanceof Error ? error.message : 'Unknown error',
        recipientId: request.recipientId,
      });
      throw error;
    }
  }

  /**
   * Get user profile information
   */
  async getUserProfile(userId: string): Promise<any> {
    try {
      const url = `https://graph.facebook.com/${this.apiVersion}/${userId}`;
      
      const response = await axios.get(url, {
        params: {
          fields: 'name,profile_pic',
          access_token: this.accessToken,
        },
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to get Instagram user profile', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
      });
      throw error;
    }
  }

  /**
   * Verify webhook signature
   */
  static verifyWebhookSignature(signature: string, body: string, appSecret: string): boolean {
    // crypto is now imported at the top
    const expectedSignature = crypto
      .createHmac('sha256', appSecret)
      .update(body)
      .digest('hex');
    
    return signature === `sha256=${expectedSignature}`;
  }
}

/**
 * LINE Messaging API Service
 */
export class LineApiService {
  private channelAccessToken: string;
  private channelSecret: string;

  constructor(channelAccessToken: string, channelSecret: string) {
    this.channelAccessToken = channelAccessToken;
    this.channelSecret = channelSecret;
  }

  /**
   * Send reply message
   */
  async replyMessage(replyToken: string, messages: any[]): Promise<void> {
    try {
      const url = 'https://api.line.me/v2/bot/message/reply';
      
      const payload = {
        replyToken,
        messages,
      };

      await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${this.channelAccessToken}`,
          'Content-Type': 'application/json',
        },
      });

      logger.info('LINE reply message sent successfully', {
        replyToken,
        messageCount: messages.length,
      });
    } catch (error) {
      logger.error('Failed to send LINE reply message', {
        error: error instanceof Error ? error.message : 'Unknown error',
        replyToken,
      });
      throw error;
    }
  }

  /**
   * Send push message
   */
  async pushMessage(userId: string, messages: any[]): Promise<void> {
    try {
      const url = 'https://api.line.me/v2/bot/message/push';
      
      const payload = {
        to: userId,
        messages,
      };

      await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${this.channelAccessToken}`,
          'Content-Type': 'application/json',
        },
      });

      logger.info('LINE push message sent successfully', {
        userId,
        messageCount: messages.length,
      });
    } catch (error) {
      logger.error('Failed to send LINE push message', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
      });
      throw error;
    }
  }

  /**
   * Send message (auto-detect reply or push)
   */
  async sendMessage(request: SendMessageRequest, replyToken?: string): Promise<void> {
    const messages: any[] = [];

    // Build message object based on type
    switch (request.mediaType) {
      case 'IMAGE':
        if (!request.mediaUrl) {
          throw new Error('Media URL is required for image messages');
        }
        messages.push({
          type: 'image',
          originalContentUrl: request.mediaUrl,
          previewImageUrl: request.mediaUrl,
        });
        break;
      
      case 'TEXT':
      default:
        messages.push({
          type: 'text',
          text: request.content,
        });
        break;
    }

    // Use reply if token is available, otherwise use push
    if (replyToken) {
      await this.replyMessage(replyToken, messages);
    } else {
      await this.pushMessage(request.recipientId, messages);
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId: string): Promise<any> {
    try {
      const url = `https://api.line.me/v2/bot/profile/${userId}`;
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${this.channelAccessToken}`,
        },
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to get LINE user profile', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
      });
      throw error;
    }
  }

  /**
   * Verify webhook signature
   */
  static verifyWebhookSignature(signature: string, body: string, channelSecret: string): boolean {
    // crypto is now imported at the top
    const expectedSignature = crypto
      .createHmac('sha256', channelSecret)
      .update(body)
      .digest('base64');
    
    return signature === expectedSignature;
  }
}

/**
 * Message Service Factory
 */
export class MessageServiceFactory {
  private instagramServices: Map<string, InstagramApiService> = new Map();
  private lineServices: Map<string, LineApiService> = new Map();

  /**
   * Get Instagram service for tenant
   */
  getInstagramService(tenantId: string): InstagramApiService {
    if (!this.instagramServices.has(tenantId)) {
      // TODO: Load from tenant settings
      const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN || '';
      const service = new InstagramApiService(accessToken);
      this.instagramServices.set(tenantId, service);
    }
    
    return this.instagramServices.get(tenantId)!;
  }

  /**
   * Get LINE service for tenant
   */
  getLineService(tenantId: string): LineApiService {
    if (!this.lineServices.has(tenantId)) {
      // TODO: Load from tenant settings
      const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN || '';
      const channelSecret = process.env.LINE_CHANNEL_SECRET || '';
      const service = new LineApiService(channelAccessToken, channelSecret);
      this.lineServices.set(tenantId, service);
    }
    
    return this.lineServices.get(tenantId)!;
  }

  /**
   * Send message through appropriate service
   */
  async sendMessage(
    tenantId: string,
    channel: 'INSTAGRAM' | 'LINE',
    request: SendMessageRequest,
    replyToken?: string
  ): Promise<string | void> {
    try {
      switch (channel) {
        case 'INSTAGRAM':
          const instagramService = this.getInstagramService(tenantId);
          return await instagramService.sendMessage(request);
        
        case 'LINE':
          const lineService = this.getLineService(tenantId);
          await lineService.sendMessage(request, replyToken);
          return;
        
        default:
          throw new Error(`Unsupported channel: ${channel}`);
      }
    } catch (error) {
      logger.error('Failed to send message through external service', {
        tenantId,
        channel,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
}

// Singleton instance
export const messageServiceFactory = new MessageServiceFactory();