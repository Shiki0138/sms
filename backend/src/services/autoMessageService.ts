import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export interface MessageChannelInfo {
  channel: 'LINE' | 'INSTAGRAM' | 'EMAIL';
  contactInfo: string;
}

export class AutoMessageService {
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
    tenantId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      switch (channel.channel) {
        case 'LINE':
          // TODO: Implement LINE messaging
          logger.info(`LINE message would be sent to ${channel.contactInfo}: ${message}`);
          break;
          
        case 'INSTAGRAM':
          // TODO: Implement Instagram messaging
          logger.info(`Instagram message would be sent to ${channel.contactInfo}: ${message}`);
          break;
          
        case 'EMAIL':
          // TODO: Implement email sending
          logger.info(`Email would be sent to ${channel.contactInfo}: ${message}`);
          break;
      }
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Failed to send message via ${channel.channel}:`, error);
      return { success: false, error: errorMessage };
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
          reservation.tenantId
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
          reservation.tenantId
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
          reservation.tenantId
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
}