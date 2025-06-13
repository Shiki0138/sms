import { PrismaClient } from '@prisma/client';
import * as Bull from 'bull';
import * as Handlebars from 'handlebars';
import { logger } from '../utils/logger';
import { messageServiceFactory } from './externalApiService';

const prisma = new PrismaClient();

export interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  criteria: SegmentCriteria;
  customerCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SegmentCriteria {
  rfm?: {
    recency?: { min?: number; max?: number }; // days since last visit
    frequency?: { min?: number; max?: number }; // visit count
    monetary?: { min?: number; max?: number }; // total spent
  };
  demographics?: {
    ageRange?: { min?: number; max?: number };
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
    location?: string[];
  };
  behavioral?: {
    visitInterval?: { min?: number; max?: number }; // days between visits
    preferredMenus?: string[];
    riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH'; // churn risk
  };
  tags?: string[];
}

export interface RFMAnalysis {
  customerId: string;
  recency: number; // days since last visit
  frequency: number; // total visits
  monetary: number; // total amount spent
  recencyScore: number; // 1-5
  frequencyScore: number; // 1-5
  monetaryScore: number; // 1-5
  rfmScore: string; // combination like "555"
  segment: string; // Champions, Loyal Customers, etc.
}

export interface BroadcastTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  channels: ('LINE' | 'INSTAGRAM' | 'EMAIL')[];
  isActive: boolean;
  variables: string[]; // Available template variables
  createdAt: Date;
}

export interface BroadcastCampaign {
  id: string;
  name: string;
  templateId: string;
  segmentIds: string[];
  scheduledAt?: Date;
  status: 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'COMPLETED' | 'FAILED';
  channels: ('LINE' | 'INSTAGRAM' | 'EMAIL')[];
  abTest?: {
    enabled: boolean;
    variants: Array<{
      name: string;
      content: string;
      percentage: number;
    }>;
  };
  analytics: {
    totalRecipients: number;
    sentCount: number;
    deliveredCount: number;
    openedCount: number;
    clickedCount: number;
    failedCount: number;
  };
  createdAt: Date;
}

export interface PersonalizedMessage {
  customerId: string;
  customerName?: string;
  content: string;
  subject?: string;
  variables: { [key: string]: any };
  channels: ('LINE' | 'INSTAGRAM' | 'EMAIL')[];
}

export class BroadcastService {
  private tenantId: string;
  private messageQueue: Bull.Queue;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
    
    // Initialize Bull queue with Redis
    this.messageQueue = new Bull('broadcast-messages', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
      },
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: 'exponential',
      },
    });

    this.setupQueueProcessors();
  }

  /**
   * Perform RFM Analysis for customer segmentation
   */
  async performRFMAnalysis(): Promise<RFMAnalysis[]> {
    try {
      logger.info('Starting RFM analysis', { tenantId: this.tenantId });

      // Get all customers with their reservation data
      const customers = await prisma.customer.findMany({
        where: { tenantId: this.tenantId },
        include: {
          reservations: {
            where: { 
              status: 'COMPLETED',
              startTime: { gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) } // Last year
            },
            orderBy: { startTime: 'desc' }
          },
          menuHistory: {
            include: { menu: true }
          }
        }
      });

      const rfmAnalyses: RFMAnalysis[] = [];
      const today = new Date();

      for (const customer of customers) {
        const reservations = customer.reservations;
        
        if (reservations.length === 0) {
          continue; // Skip customers with no completed reservations
        }

        // Calculate Recency (days since last visit)
        const lastVisit = reservations[0].startTime;
        const recency = Math.floor((today.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24));

        // Calculate Frequency (number of visits)
        const frequency = reservations.length;

        // Calculate Monetary (total amount spent - using menu prices)
        let monetary = 0;
        for (const history of customer.menuHistory) {
          if (history.menu) {
            monetary += history.menu.price;
          }
        }
        // If no menu history, estimate from reservation count
        if (monetary === 0) {
          monetary = frequency * 5000; // Estimated average per visit
        }

        // Calculate RFM Scores (1-5 scale)
        const recencyScore = this.calculateRecencyScore(recency);
        const frequencyScore = this.calculateFrequencyScore(frequency);
        const monetaryScore = this.calculateMonetaryScore(monetary);

        const rfmScore = `${recencyScore}${frequencyScore}${monetaryScore}`;
        const segment = this.determineRFMSegment(recencyScore, frequencyScore, monetaryScore);

        rfmAnalyses.push({
          customerId: customer.id,
          recency,
          frequency,
          monetary,
          recencyScore,
          frequencyScore,
          monetaryScore,
          rfmScore,
          segment
        });
      }

      logger.info('RFM analysis completed', { 
        tenantId: this.tenantId, 
        customersAnalyzed: rfmAnalyses.length 
      });

      return rfmAnalyses;

    } catch (error) {
      logger.error('RFM analysis failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        tenantId: this.tenantId
      });
      throw error;
    }
  }

  /**
   * Create customer segment based on criteria
   */
  async createSegment(
    name: string,
    description: string,
    criteria: SegmentCriteria
  ): Promise<CustomerSegment> {
    try {
      // Build where clause based on criteria
      const whereClause = this.buildSegmentWhereClause(criteria);
      
      // Count customers matching criteria
      const customerCount = await prisma.customer.count({
        where: { ...whereClause, tenantId: this.tenantId }
      });

      // For now, store segment info in audit log as we don't have a dedicated segments table
      const segmentId = `segment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await prisma.auditLog.create({
        data: {
          action: 'SEGMENT_CREATED',
          entityType: 'CustomerSegment',
          entityId: segmentId,
          description: `Customer segment created: ${name}`,
          tenantId: this.tenantId,
          ipAddress: JSON.stringify({ criteria, customerCount }),
        }
      });

      const segment: CustomerSegment = {
        id: segmentId,
        name,
        description,
        criteria,
        customerCount,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      logger.info('Customer segment created', {
        tenantId: this.tenantId,
        segmentId,
        customerCount
      });

      return segment;

    } catch (error) {
      logger.error('Failed to create customer segment', {
        error: error instanceof Error ? error.message : 'Unknown error',
        tenantId: this.tenantId
      });
      throw error;
    }
  }

  /**
   * Get customers matching segment criteria
   */
  async getSegmentCustomers(criteria: SegmentCriteria): Promise<any[]> {
    try {
      const whereClause = this.buildSegmentWhereClause(criteria);
      
      const customers = await prisma.customer.findMany({
        where: { ...whereClause, tenantId: this.tenantId },
        include: {
          reservations: {
            where: { status: 'COMPLETED' },
            orderBy: { startTime: 'desc' },
            take: 5
          },
          menuHistory: {
            include: { menu: true },
            orderBy: { visitDate: 'desc' },
            take: 5
          },
          customerTags: {
            include: { tag: true }
          }
        }
      });

      return customers;

    } catch (error) {
      logger.error('Failed to get segment customers', {
        error: error instanceof Error ? error.message : 'Unknown error',
        tenantId: this.tenantId
      });
      throw error;
    }
  }

  /**
   * Create personalized broadcast campaign
   */
  async createBroadcastCampaign(
    name: string,
    templateContent: string,
    segmentCriteria: SegmentCriteria[],
    channels: ('LINE' | 'INSTAGRAM' | 'EMAIL')[],
    scheduledAt?: Date,
    abTest?: {
      enabled: boolean;
      variants: Array<{
        name: string;
        content: string;
        percentage: number;
      }>;
    }
  ): Promise<BroadcastCampaign> {
    try {
      // Get all customers from all segments
      let allCustomers: any[] = [];
      for (const criteria of segmentCriteria) {
        const segmentCustomers = await this.getSegmentCustomers(criteria);
        allCustomers = allCustomers.concat(segmentCustomers);
      }

      // Remove duplicates
      const uniqueCustomers = allCustomers.filter((customer, index, self) =>
        index === self.findIndex(c => c.id === customer.id)
      );

      const campaignId = `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create campaign record in audit log
      await prisma.auditLog.create({
        data: {
          action: 'BROADCAST_CAMPAIGN_CREATED',
          entityType: 'BroadcastCampaign',
          entityId: campaignId,
          description: `Broadcast campaign created: ${name}`,
          tenantId: this.tenantId,
          ipAddress: JSON.stringify({
            totalRecipients: uniqueCustomers.length,
            channels,
            scheduledAt,
            abTest
          }),
        }
      });

      const campaign: BroadcastCampaign = {
        id: campaignId,
        name,
        templateId: 'template_' + campaignId,
        segmentIds: segmentCriteria.map((_, i) => `segment_${i}`),
        scheduledAt,
        status: scheduledAt ? 'SCHEDULED' : 'DRAFT',
        channels,
        abTest,
        analytics: {
          totalRecipients: uniqueCustomers.length,
          sentCount: 0,
          deliveredCount: 0,
          openedCount: 0,
          clickedCount: 0,
          failedCount: 0
        },
        createdAt: new Date()
      };

      // Schedule messages if not immediate
      if (scheduledAt && scheduledAt > new Date()) {
        await this.scheduleBroadcast(campaign, templateContent, uniqueCustomers);
      } else {
        await this.sendBroadcast(campaign, templateContent, uniqueCustomers);
      }

      logger.info('Broadcast campaign created', {
        tenantId: this.tenantId,
        campaignId,
        recipients: uniqueCustomers.length
      });

      return campaign;

    } catch (error) {
      logger.error('Failed to create broadcast campaign', {
        error: error instanceof Error ? error.message : 'Unknown error',
        tenantId: this.tenantId
      });
      throw error;
    }
  }

  /**
   * Send personalized broadcast messages
   */
  async sendBroadcast(
    campaign: BroadcastCampaign,
    templateContent: string,
    customers: any[]
  ): Promise<void> {
    try {
      logger.info('Starting broadcast sending', {
        tenantId: this.tenantId,
        campaignId: campaign.id,
        customerCount: customers.length
      });

      for (const customer of customers) {
        // Determine which template variant to use (A/B testing)
        let content = templateContent;
        if (campaign.abTest?.enabled && campaign.abTest.variants.length > 0) {
          const variant = this.selectABTestVariant(campaign.abTest.variants);
          content = variant.content;
        }

        // Personalize message content
        const personalizedMessage = await this.personalizeMessage(content, customer);

        // Add to queue for each channel
        for (const channel of campaign.channels) {
          await this.messageQueue.add('send-broadcast-message', {
            tenantId: this.tenantId,
            campaignId: campaign.id,
            customerId: customer.id,
            channel,
            message: personalizedMessage,
            customerData: {
              name: customer.name,
              lineId: customer.lineId,
              instagramId: customer.instagramId,
              email: customer.email,
              phone: customer.phone
            }
          }, {
            delay: Math.random() * 5000, // Random delay up to 5 seconds to avoid rate limits
          });
        }
      }

      logger.info('Broadcast messages queued', {
        tenantId: this.tenantId,
        campaignId: campaign.id,
        totalMessages: customers.length * campaign.channels.length
      });

    } catch (error) {
      logger.error('Failed to send broadcast', {
        error: error instanceof Error ? error.message : 'Unknown error',
        tenantId: this.tenantId,
        campaignId: campaign.id
      });
      throw error;
    }
  }

  /**
   * Schedule broadcast for later sending
   */
  async scheduleBroadcast(
    campaign: BroadcastCampaign,
    templateContent: string,
    customers: any[]
  ): Promise<void> {
    if (!campaign.scheduledAt) {
      throw new Error('Scheduled time is required for scheduled broadcasts');
    }

    const delay = campaign.scheduledAt.getTime() - Date.now();
    
    await this.messageQueue.add('send-scheduled-broadcast', {
      tenantId: this.tenantId,
      campaignId: campaign.id,
      templateContent,
      customers: customers.map(c => ({
        id: c.id,
        name: c.name,
        lineId: c.lineId,
        instagramId: c.instagramId,
        email: c.email,
        phone: c.phone
      }))
    }, {
      delay: Math.max(delay, 0)
    });

    logger.info('Broadcast scheduled', {
      tenantId: this.tenantId,
      campaignId: campaign.id,
      scheduledAt: campaign.scheduledAt,
      customers: customers.length
    });
  }

  /**
   * Personalize message content using Handlebars
   */
  async personalizeMessage(template: string, customer: any): Promise<PersonalizedMessage> {
    try {
      // Get customer's recent data for personalization
      const recentReservations = await prisma.reservation.findMany({
        where: { customerId: customer.id, tenantId: this.tenantId },
        orderBy: { startTime: 'desc' },
        take: 3,
        include: { staff: true }
      });

      const recentMenus = await prisma.menuHistory.findMany({
        where: { customerId: customer.id, tenantId: this.tenantId },
        orderBy: { visitDate: 'desc' },
        take: 3,
        include: { menu: true }
      });

      // Prepare template variables
      const variables = {
        customer: {
          name: customer.name || '様',
          firstName: customer.name?.split(' ')[0] || '様',
          visitCount: customer.visitCount || 0,
          lastVisit: customer.lastVisitDate,
        },
        recent: {
          reservations: recentReservations.map(r => ({
            date: r.startTime,
            menu: r.menuContent,
            staff: r.staff?.name
          })),
          menus: recentMenus.map(m => ({
            name: m.menu?.name,
            date: m.visitDate,
            satisfaction: m.satisfaction
          }))
        },
        salon: {
          name: 'サロン', // Would come from tenant settings
          phone: '03-1234-5678', // Would come from tenant settings
        },
        today: new Date(),
        season: this.getCurrentSeason(),
        timeGreeting: this.getTimeGreeting()
      };

      // Compile and render template
      const compiledTemplate = Handlebars.compile(template);
      const content = compiledTemplate(variables);

      return {
        customerId: customer.id,
        customerName: customer.name,
        content,
        variables,
        channels: []
      };

    } catch (error) {
      logger.error('Failed to personalize message', {
        error: error instanceof Error ? error.message : 'Unknown error',
        tenantId: this.tenantId,
        customerId: customer.id
      });
      throw error;
    }
  }

  /**
   * Get broadcast analytics
   */
  async getBroadcastAnalytics(campaignId: string): Promise<any> {
    try {
      // Get campaign logs from audit log
      const campaignLogs = await prisma.auditLog.findMany({
        where: {
          tenantId: this.tenantId,
          entityType: 'BroadcastCampaign',
          entityId: campaignId
        },
        orderBy: { createdAt: 'desc' }
      });

      // Get message logs
      const messageLogs = await prisma.auditLog.findMany({
        where: {
          tenantId: this.tenantId,
          action: { contains: 'BROADCAST_MESSAGE' },
          description: { contains: campaignId }
        }
      });

      const analytics = {
        campaignId,
        totalMessages: messageLogs.length,
        sentCount: messageLogs.filter(log => log.action === 'BROADCAST_MESSAGE_SENT').length,
        failedCount: messageLogs.filter(log => log.action === 'BROADCAST_MESSAGE_FAILED').length,
        deliveryRate: 0,
        channelBreakdown: {},
        timeline: this.generateAnalyticsTimeline(messageLogs)
      };

      if (analytics.totalMessages > 0) {
        analytics.deliveryRate = (analytics.sentCount / analytics.totalMessages) * 100;
      }

      return analytics;

    } catch (error) {
      logger.error('Failed to get broadcast analytics', {
        error: error instanceof Error ? error.message : 'Unknown error',
        tenantId: this.tenantId,
        campaignId
      });
      throw error;
    }
  }

  // Private helper methods

  private setupQueueProcessors(): void {
    // Process individual broadcast messages
    this.messageQueue.process('send-broadcast-message', async (job) => {
      const { tenantId, campaignId, customerId, channel, message, customerData } = job.data;
      
      try {
        let recipientId = '';
        
        switch (channel) {
          case 'LINE':
            recipientId = customerData.lineId;
            break;
          case 'INSTAGRAM':
            recipientId = customerData.instagramId;
            break;
          case 'EMAIL':
            recipientId = customerData.email;
            break;
        }

        if (!recipientId) {
          throw new Error(`No ${channel} contact info for customer ${customerId}`);
        }

        // Send message through external API
        if (channel === 'LINE' || channel === 'INSTAGRAM') {
          await messageServiceFactory.sendMessage(
            tenantId,
            channel,
            {
              recipientId,
              content: message.content,
              mediaType: 'TEXT'
            }
          );
        }

        // Log success
        await prisma.auditLog.create({
          data: {
            action: 'BROADCAST_MESSAGE_SENT',
            entityType: 'BroadcastMessage',
            entityId: `${campaignId}_${customerId}`,
            description: `Broadcast message sent via ${channel} to ${customerData.name}`,
            tenantId
          }
        });

        logger.info('Broadcast message sent', {
          tenantId,
          campaignId,
          customerId,
          channel
        });

      } catch (error) {
        // Log failure
        await prisma.auditLog.create({
          data: {
            action: 'BROADCAST_MESSAGE_FAILED',
            entityType: 'BroadcastMessage',
            entityId: `${campaignId}_${customerId}`,
            description: `Broadcast message failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            tenantId
          }
        });

        logger.error('Broadcast message failed', {
          tenantId,
          campaignId,
          customerId,
          channel,
          error: error instanceof Error ? error.message : 'Unknown error'
        });

        throw error;
      }
    });

    // Process scheduled broadcasts
    this.messageQueue.process('send-scheduled-broadcast', async (job) => {
      const { tenantId, campaignId, templateContent, customers } = job.data;
      
      logger.info('Processing scheduled broadcast', {
        tenantId,
        campaignId,
        customerCount: customers.length
      });

      // Create campaign object and send broadcast
      const campaign: BroadcastCampaign = {
        id: campaignId,
        name: 'Scheduled Campaign',
        templateId: '',
        segmentIds: [],
        status: 'SENDING',
        channels: ['LINE'], // Would be passed in job data
        analytics: {
          totalRecipients: customers.length,
          sentCount: 0,
          deliveredCount: 0,
          openedCount: 0,
          clickedCount: 0,
          failedCount: 0
        },
        createdAt: new Date()
      };

      await this.sendBroadcast(campaign, templateContent, customers);
    });
  }

  private calculateRecencyScore(recency: number): number {
    if (recency <= 30) return 5;
    if (recency <= 60) return 4;
    if (recency <= 90) return 3;
    if (recency <= 180) return 2;
    return 1;
  }

  private calculateFrequencyScore(frequency: number): number {
    if (frequency >= 20) return 5;
    if (frequency >= 10) return 4;
    if (frequency >= 5) return 3;
    if (frequency >= 2) return 2;
    return 1;
  }

  private calculateMonetaryScore(monetary: number): number {
    if (monetary >= 100000) return 5; // 10万円以上
    if (monetary >= 50000) return 4;  // 5万円以上
    if (monetary >= 25000) return 3;  // 2.5万円以上
    if (monetary >= 10000) return 2;  // 1万円以上
    return 1;
  }

  private determineRFMSegment(recency: number, frequency: number, monetary: number): string {
    const score = `${recency}${frequency}${monetary}`;
    
    // Champions
    if (['555', '554', '544', '545', '454', '455', '445'].includes(score)) {
      return 'Champions';
    }
    // Loyal Customers
    if (['543', '444', '435', '355', '354', '345', '344', '335'].includes(score)) {
      return 'Loyal Customers';
    }
    // Potential Loyalists
    if (['512', '511', '422', '421', '412', '411'].includes(score)) {
      return 'Potential Loyalists';
    }
    // New Customers
    if (['512', '511', '422', '421', '412', '411', '311'].includes(score)) {
      return 'New Customers';
    }
    // Promising
    if (['333', '334', '343', '244', '343', '334', '343'].includes(score)) {
      return 'Promising';
    }
    // Need Attention
    if (['331', '321', '312', '231', '241', '251'].includes(score)) {
      return 'Need Attention';
    }
    // About to Sleep
    if (['155', '154', '144', '214', '215', '115', '114'].includes(score)) {
      return 'About to Sleep';
    }
    // At Risk
    if (['233', '234', '143', '244', '334', '343', '244'].includes(score)) {
      return 'At Risk';
    }
    // Cannot Lose Them
    if (['155', '154', '144', '214', '215', '115', '114'].includes(score)) {
      return 'Cannot Lose Them';
    }
    // Hibernating
    if (['111', '112', '121', '131', '141', '151'].includes(score)) {
      return 'Hibernating';
    }
    // Lost
    if (['112', '123', '132', '213', '312', '111'].includes(score)) {
      return 'Lost';
    }

    return 'Uncategorized';
  }

  private buildSegmentWhereClause(criteria: SegmentCriteria): any {
    const where: any = {};

    // RFM criteria (would need to be implemented with subqueries or pre-calculated values)
    if (criteria.rfm) {
      // This is simplified - in practice, you'd need to calculate RFM scores first
      if (criteria.rfm.frequency) {
        where.visitCount = {};
        if (criteria.rfm.frequency.min !== undefined) {
          where.visitCount.gte = criteria.rfm.frequency.min;
        }
        if (criteria.rfm.frequency.max !== undefined) {
          where.visitCount.lte = criteria.rfm.frequency.max;
        }
      }
    }

    // Demographics
    if (criteria.demographics) {
      if (criteria.demographics.gender) {
        where.gender = criteria.demographics.gender;
      }
      
      if (criteria.demographics.ageRange) {
        const now = new Date();
        const maxBirthDate = new Date(now.getFullYear() - (criteria.demographics.ageRange.min || 0), now.getMonth(), now.getDate());
        const minBirthDate = new Date(now.getFullYear() - (criteria.demographics.ageRange.max || 100), now.getMonth(), now.getDate());
        
        where.birthDate = {
          gte: minBirthDate,
          lte: maxBirthDate
        };
      }
    }

    // Tags
    if (criteria.tags && criteria.tags.length > 0) {
      where.customerTags = {
        some: {
          tag: {
            name: { in: criteria.tags }
          }
        }
      };
    }

    return where;
  }

  private selectABTestVariant(variants: Array<{ name: string; content: string; percentage: number }>): { name: string; content: string } {
    const random = Math.random() * 100;
    let cumulative = 0;
    
    for (const variant of variants) {
      cumulative += variant.percentage;
      if (random <= cumulative) {
        return variant;
      }
    }
    
    return variants[0]; // Fallback to first variant
  }

  private getCurrentSeason(): string {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return '春';
    if (month >= 5 && month <= 7) return '夏';
    if (month >= 8 && month <= 10) return '秋';
    return '冬';
  }

  private getTimeGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'おはようございます';
    if (hour < 18) return 'こんにちは';
    return 'こんばんは';
  }

  private generateAnalyticsTimeline(logs: any[]): any[] {
    const timeline: any[] = [];
    const dailyStats: { [date: string]: { sent: number; failed: number } } = {};

    for (const log of logs) {
      const date = log.createdAt.toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = { sent: 0, failed: 0 };
      }

      if (log.action === 'BROADCAST_MESSAGE_SENT') {
        dailyStats[date].sent++;
      } else if (log.action === 'BROADCAST_MESSAGE_FAILED') {
        dailyStats[date].failed++;
      }
    }

    for (const [date, stats] of Object.entries(dailyStats)) {
      timeline.push({
        date,
        sent: stats.sent,
        failed: stats.failed,
        total: stats.sent + stats.failed
      });
    }

    return timeline.sort((a, b) => a.date.localeCompare(b.date));
  }
}

export default BroadcastService;