import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { EmailService } from './emailService';
import { LineService } from './lineService';
import { InstagramService } from './instagramService';

const prisma = new PrismaClient();

export interface MessageChannelInfo {
  channel: 'LINE' | 'INSTAGRAM' | 'EMAIL';
  contactInfo: string;
}

export class AutoMessageService {
  private static emailService = new EmailService();
  private static lineService = new LineService();
  private static instagramService = new InstagramService();
  /**
   * Get customer's preferred message channel based on availability
   */
  static getCustomerChannels(customer: any): MessageChannelInfo[] {
    const channels: MessageChannelInfo[] = [];
    
    // Priority order: LINE -> Instagram -> Email
    if (customer.lineId) {
      channels.push({ channel: 'LINE', contactInfo: customer.lineId });
    }
    if (customer.instagramId) {
      channels.push({ channel: 'INSTAGRAM', contactInfo: customer.instagramId });
    }
    if (customer.email) {
      channels.push({ channel: 'EMAIL', contactInfo: customer.email });
    }
    
    return channels;
  }

  /**
   * Check if reminder settings are enabled for tenant
   */
  static async isReminderEnabled(tenantId: string): Promise<boolean> {
    const setting = await prisma.tenantSetting.findUnique({
      where: {
        tenantId_key: {
          tenantId,
          key: 'auto_reminder_enabled'
        }
      }
    });
    
    return setting?.value === 'true';
  }

  /**
   * Check if follow-up settings are enabled for tenant
   */
  static async isFollowUpEnabled(tenantId: string): Promise<boolean> {
    const setting = await prisma.tenantSetting.findUnique({
      where: {
        tenantId_key: {
          tenantId,
          key: 'auto_followup_enabled'
        }
      }
    });
    
    return setting?.value === 'true';
  }

  /**
   * Get reservations that need 1-week reminder
   */
  static async getReservationsNeedingWeekReminder(): Promise<any[]> {
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
    
    const startOfDay = new Date(oneWeekFromNow);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(oneWeekFromNow);
    endOfDay.setHours(23, 59, 59, 999);

    return await prisma.reservation.findMany({
      where: {
        startTime: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: {
          in: ['CONFIRMED', 'TENTATIVE']
        },
        reminderSentAt: null,
        customer: {
          isNot: null
        }
      },
      include: {
        customer: true,
        tenant: true
      }
    });
  }

  /**
   * Get reservations that need 3-day reminder
   */
  static async getReservationsNeedingDayReminder(): Promise<any[]> {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    const startOfDay = new Date(threeDaysFromNow);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(threeDaysFromNow);
    endOfDay.setHours(23, 59, 59, 999);

    return await prisma.reservation.findMany({
      where: {
        startTime: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: {
          in: ['CONFIRMED', 'TENTATIVE']
        },
        reminderSentAt: null,
        customer: {
          isNot: null
        }
      },
      include: {
        customer: true,
        tenant: true
      }
    });
  }

  /**
   * Get customers that need follow-up message
   */
  static async getCustomersNeedingFollowUp(): Promise<any[]> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return await prisma.reservation.findMany({
      where: {
        status: 'COMPLETED',
        nextVisitDate: {
          lte: oneWeekAgo
        },
        followUpSentAt: null,
        customer: {
          isNot: null
        }
      },
      include: {
        customer: {
          include: {
            reservations: {
              where: {
                startTime: {
                  gte: new Date()
                },
                status: {
                  in: ['CONFIRMED', 'TENTATIVE']
                }
              }
            }
          }
        },
        tenant: true
      }
    });
  }

  /**
   * Get message template
   */
  static async getTemplate(tenantId: string, type: string): Promise<any> {
    return await prisma.autoMessageTemplate.findUnique({
      where: {
        tenantId_type: {
          tenantId,
          type
        }
      }
    });
  }

  /**
   * Replace template variables with actual data
   */
  static replaceTemplateVariables(
    template: string, 
    customer: any, 
    reservation?: any
  ): string {
    let message = template;
    
    // Customer variables
    message = message.replace(/\{customerName\}/g, customer.name || 'お客様');
    
    // Reservation variables
    if (reservation) {
      const startTime = new Date(reservation.startTime);
      message = message.replace(/\{reservationDate\}/g, startTime.toLocaleDateString('ja-JP'));
      message = message.replace(/\{reservationTime\}/g, startTime.toLocaleTimeString('ja-JP', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }));
      message = message.replace(/\{menuContent\}/g, reservation.menuContent || 'ご予約');
    }
    
    return message;
  }

  /**
   * Send message via appropriate channel
   */
  static async sendMessage(
    channel: MessageChannelInfo,
    message: string,
    customer: any,
    tenantId: string,
    templateType?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      switch (channel.channel) {
        case 'LINE':
          // 実際のLINE送信実装
          const lineSent = await this.lineService.sendMessage(channel.contactInfo, message);
          
          if (lineSent) {
            logger.info(`LINE reminder sent to ${channel.contactInfo}: ${message}`);
            return { success: true };
          } else {
            logger.error(`Failed to send LINE message to ${channel.contactInfo}`);
            return { success: false, error: 'LINE sending failed' };
          }
          
        case 'INSTAGRAM':
          // 実際のInstagram送信実装
          const instagramSent = await this.instagramService.sendMessage(channel.contactInfo, message);
          
          if (instagramSent) {
            logger.info(`Instagram reminder sent to ${channel.contactInfo}: ${message}`);
            return { success: true };
          } else {
            logger.error(`Failed to send Instagram message to ${channel.contactInfo}`);
            return { success: false, error: 'Instagram sending failed' };
          }
          
        case 'EMAIL':
          // 実際のメール送信実装
          const emailSent = await this.emailService.sendEmail({
            to: channel.contactInfo,
            subject: this.generateEmailSubject(templateType, customer, tenantId),
            text: message
          });
          
          if (emailSent) {
            logger.info(`Email reminder sent to ${channel.contactInfo}: ${message}`);
            return { success: true };
          } else {
            logger.error(`Failed to send email to ${channel.contactInfo}`);
            return { success: false, error: 'Email sending failed' };
          }
      }
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Failed to send message via ${channel.channel}:`, error);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Generate email subject based on template type
   */
  private static generateEmailSubject(
    templateType: string | undefined, 
    customer: any, 
    tenantId: string
  ): string {
    switch (templateType) {
      case 'REMINDER_1_WEEK':
        return `【予約確認】1週間前のリマインド - ${customer.name || 'お客様'}`;
      case 'REMINDER_3_DAYS':
        return `【予約確認】3日前のリマインド - ${customer.name || 'お客様'}`;
      case 'FOLLOWUP_VISIT':
        return `【美容室より】お元気ですか？特別なご提案があります`;
      default:
        return `【美容室システム】お知らせ`;
    }
  }

  /**
   * Log message sending attempt
   */
  static async logMessage(
    customerId: string,
    reservationId: string | null,
    templateType: string,
    channel: string,
    messageContent: string,
    status: 'SENT' | 'FAILED',
    tenantId: string,
    errorMessage?: string
  ): Promise<void> {
    await prisma.autoMessageLog.create({
      data: {
        customerId,
        reservationId,
        templateType,
        channel,
        messageContent,
        status,
        sentAt: status === 'SENT' ? new Date() : null,
        errorMessage,
        tenantId
      }
    });
  }

  /**
   * Mark reservation as reminder sent
   */
  static async markReminderSent(reservationId: string): Promise<void> {
    await prisma.reservation.update({
      where: { id: reservationId },
      data: { reminderSentAt: new Date() }
    });
  }

  /**
   * Mark reservation as follow-up sent
   */
  static async markFollowUpSent(reservationId: string): Promise<void> {
    await prisma.reservation.update({
      where: { id: reservationId },
      data: { followUpSentAt: new Date() }
    });
  }

  /**
   * Process reminder messages (1 week)
   */
  static async processWeekReminders(): Promise<void> {
    logger.info('Processing 1-week reminders...');
    
    const reservations = await this.getReservationsNeedingWeekReminder();
    
    for (const reservation of reservations) {
      if (!await this.isReminderEnabled(reservation.tenantId)) {
        continue;
      }

      const template = await this.getTemplate(reservation.tenantId, 'REMINDER_1_WEEK');
      if (!template || !template.isActive) {
        continue;
      }

      const channels = this.getCustomerChannels(reservation.customer);
      if (channels.length === 0) {
        logger.warn(`No contact methods for customer ${reservation.customer.id}`);
        continue;
      }

      const message = this.replaceTemplateVariables(
        template.content,
        reservation.customer,
        reservation
      );

      // Try each channel in priority order until one succeeds
      let sent = false;
      for (const channel of channels) {
        const result = await this.sendMessage(
          channel,
          message,
          reservation.customer,
          reservation.tenantId,
          'REMINDER_1_WEEK'
        );

        await this.logMessage(
          reservation.customer.id,
          reservation.id,
          'REMINDER_1_WEEK',
          channel.channel,
          message,
          result.success ? 'SENT' : 'FAILED',
          reservation.tenantId,
          result.error
        );

        if (result.success) {
          sent = true;
          break;
        }
      }

      if (sent) {
        await this.markReminderSent(reservation.id);
      }
    }
  }

  /**
   * Process reminder messages (3 days)
   */
  static async processDayReminders(): Promise<void> {
    logger.info('Processing 3-day reminders...');
    
    const reservations = await this.getReservationsNeedingDayReminder();
    
    for (const reservation of reservations) {
      if (!await this.isReminderEnabled(reservation.tenantId)) {
        continue;
      }

      const template = await this.getTemplate(reservation.tenantId, 'REMINDER_3_DAYS');
      if (!template || !template.isActive) {
        continue;
      }

      const channels = this.getCustomerChannels(reservation.customer);
      if (channels.length === 0) {
        logger.warn(`No contact methods for customer ${reservation.customer.id}`);
        continue;
      }

      const message = this.replaceTemplateVariables(
        template.content,
        reservation.customer,
        reservation
      );

      // Try each channel in priority order until one succeeds
      let sent = false;
      for (const channel of channels) {
        const result = await this.sendMessage(
          channel,
          message,
          reservation.customer,
          reservation.tenantId,
          'REMINDER_3_DAYS'
        );

        await this.logMessage(
          reservation.customer.id,
          reservation.id,
          'REMINDER_3_DAYS',
          channel.channel,
          message,
          result.success ? 'SENT' : 'FAILED',
          reservation.tenantId,
          result.error
        );

        if (result.success) {
          sent = true;
          break;
        }
      }

      if (sent) {
        await this.markReminderSent(reservation.id);
      }
    }
  }

  /**
   * Process follow-up messages
   */
  static async processFollowUpMessages(): Promise<void> {
    logger.info('Processing follow-up messages...');
    
    const reservations = await this.getCustomersNeedingFollowUp();
    
    for (const reservation of reservations) {
      if (!await this.isFollowUpEnabled(reservation.tenantId)) {
        continue;
      }

      // Skip if customer has future reservations
      if (reservation.customer.reservations && reservation.customer.reservations.length > 0) {
        logger.info(`Skipping follow-up for customer ${reservation.customer.id} - has future reservation`);
        continue;
      }

      const template = await this.getTemplate(reservation.tenantId, 'FOLLOWUP_VISIT');
      if (!template || !template.isActive) {
        continue;
      }

      const channels = this.getCustomerChannels(reservation.customer);
      if (channels.length === 0) {
        logger.warn(`No contact methods for customer ${reservation.customer.id}`);
        continue;
      }

      const message = this.replaceTemplateVariables(
        template.content,
        reservation.customer
      );

      // Try each channel in priority order until one succeeds
      let sent = false;
      for (const channel of channels) {
        const result = await this.sendMessage(
          channel,
          message,
          reservation.customer,
          reservation.tenantId,
          'FOLLOWUP_VISIT'
        );

        await this.logMessage(
          reservation.customer.id,
          reservation.id,
          'FOLLOWUP_VISIT',
          channel.channel,
          message,
          result.success ? 'SENT' : 'FAILED',
          reservation.tenantId,
          result.error
        );

        if (result.success) {
          sent = true;
          break;
        }
      }

      if (sent) {
        await this.markFollowUpSent(reservation.id);
      }
    }
  }

  /**
   * Run all auto-message processes
   */
  static async processAllMessages(): Promise<void> {
    try {
      await this.processWeekReminders();
      await this.processDayReminders();
      await this.processFollowUpMessages();
      
      logger.info('Auto-message processing completed');
    } catch (error) {
      logger.error('Error processing auto-messages:', error);
      throw error;
    }
  }

  /**
   * 優先順位制御のテスト用関数
   */
  static async testChannelPriority(
    customerId: string,
    message: string = 'テストメッセージ'
  ): Promise<{
    success: boolean;
    usedChannel?: string;
    availableChannels: string[];
    attempts: Array<{ channel: string; success: boolean; error?: string }>;
  }> {
    try {
      // 顧客情報を取得
      const customer = await prisma.customer.findUnique({
        where: { id: customerId }
      });

      if (!customer) {
        return {
          success: false,
          availableChannels: [],
          attempts: []
        };
      }

      // 利用可能なチャネルを取得（優先順位順）
      const channels = this.getCustomerChannels(customer);
      const availableChannels = channels.map(c => c.channel);
      const attempts: Array<{ channel: string; success: boolean; error?: string }> = [];

      logger.info(`Testing channel priority for customer ${customerId}:`, {
        availableChannels,
        customerInfo: {
          lineId: customer.lineId ? '***' : null,
          instagramId: customer.instagramId ? '***' : null,
          email: customer.email ? '***' : null
        }
      });

      // 優先順位に従って送信テスト
      for (const channel of channels) {
        logger.info(`Attempting ${channel.channel} to ${channel.contactInfo.substring(0, 10)}...`);
        
        const result = await this.sendMessage(
          channel,
          message,
          customer,
          customer.tenantId,
          'TEST_MESSAGE'
        );

        attempts.push({
          channel: channel.channel,
          success: result.success,
          error: result.error
        });

        if (result.success) {
          logger.info(`✓ Message sent successfully via ${channel.channel}`);
          return {
            success: true,
            usedChannel: channel.channel,
            availableChannels,
            attempts
          };
        } else {
          logger.warn(`✗ Failed to send via ${channel.channel}: ${result.error}`);
        }
      }

      // すべてのチャネルで失敗
      logger.error(`Failed to send message via all available channels for customer ${customerId}`);
      return {
        success: false,
        availableChannels,
        attempts
      };

    } catch (error) {
      logger.error('Error testing channel priority:', error);
      return {
        success: false,
        availableChannels: [],
        attempts: []
      };
    }
  }

  /**
   * 接続テスト用関数
   */
  static async testAllConnections(): Promise<{
    line: boolean;
    instagram: boolean;
    email: boolean;
  }> {
    const results = {
      line: false,
      instagram: false,
      email: false
    };

    try {
      // LINE接続テスト
      results.line = await this.lineService.testConnection();
      logger.info(`LINE connection test: ${results.line ? 'SUCCESS' : 'FAILED'}`);

      // Instagram接続テスト
      results.instagram = await this.instagramService.testConnection();
      logger.info(`Instagram connection test: ${results.instagram ? 'SUCCESS' : 'FAILED'}`);

      // Email接続テスト
      results.email = await this.emailService.testConnection();
      logger.info(`Email connection test: ${results.email ? 'SUCCESS' : 'FAILED'}`);

    } catch (error) {
      logger.error('Error testing connections:', error);
    }

    return results;
  }

  /**
   * 統計情報取得
   */
  static async getChannelStats(tenantId: string, days: number = 30): Promise<{
    totalSent: number;
    byChannel: Record<string, number>;
    successRate: number;
    recentActivity: any[];
  }> {
    try {
      const since = new Date();
      since.setDate(since.getDate() - days);

      const logs = await prisma.autoMessageLog.findMany({
        where: {
          tenantId,
          createdAt: {
            gte: since
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      const totalSent = logs.length;
      const successCount = logs.filter(log => log.status === 'SENT').length;
      const successRate = totalSent > 0 ? (successCount / totalSent) * 100 : 0;

      const byChannel: Record<string, number> = {
        LINE: 0,
        INSTAGRAM: 0,
        EMAIL: 0
      };

      logs.forEach(log => {
        if (byChannel.hasOwnProperty(log.channel)) {
          byChannel[log.channel]++;
        }
      });

      const recentActivity = logs.slice(0, 10).map(log => ({
        id: log.id,
        channel: log.channel,
        status: log.status,
        templateType: log.templateType,
        sentAt: log.sentAt,
        errorMessage: log.errorMessage
      }));

      return {
        totalSent,
        byChannel,
        successRate: Math.round(successRate * 100) / 100,
        recentActivity
      };

    } catch (error) {
      logger.error('Error getting channel stats:', error);
      return {
        totalSent: 0,
        byChannel: { LINE: 0, INSTAGRAM: 0, EMAIL: 0 },
        successRate: 0,
        recentActivity: []
      };
    }
  }
}