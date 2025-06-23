import { Response } from 'express';
import { AuthenticatedRequest } from '../types/auth';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { createError, asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { PERMISSIONS } from '../utils/auth';
import BroadcastService from '../services/broadcastService';

const prisma = new PrismaClient();

// Validation schemas
const sendMessageSchema = z.object({
  threadId: z.string().min(1, 'Thread ID is required'),
  content: z.string().min(1, 'Message content is required'),
  mediaType: z.enum(['TEXT', 'IMAGE', 'STICKER', 'FILE']).optional().default('TEXT'),
  mediaUrl: z.string().url().optional(),
});

const createThreadSchema = z.object({
  customerId: z.string().optional(),
  channel: z.enum(['INSTAGRAM', 'LINE']),
  channelThreadId: z.string().min(1, 'Channel thread ID is required'),
});

const updateThreadSchema = z.object({
  assignedStaffId: z.string().optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'CLOSED']).optional(),
  tags: z.array(z.string()).optional(),
});

const threadQuerySchema = z.object({
  page: z.string().optional().transform((str) => str ? parseInt(str) : 1),
  limit: z.string().optional().transform((str) => str ? parseInt(str) : 20),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'CLOSED']).optional(),
  channel: z.enum(['INSTAGRAM', 'LINE']).optional(),
  assignedStaffId: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt']).optional().default('updatedAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// Broadcast schemas
const createSegmentSchema = z.object({
  name: z.string().min(1, 'Segment name is required'),
  description: z.string().optional(),
  criteria: z.object({
    rfm: z.object({
      recency: z.object({
        min: z.number().optional(),
        max: z.number().optional(),
      }).optional(),
      frequency: z.object({
        min: z.number().optional(),
        max: z.number().optional(),
      }).optional(),
      monetary: z.object({
        min: z.number().optional(),
        max: z.number().optional(),
      }).optional(),
    }).optional(),
    demographics: z.object({
      ageRange: z.object({
        min: z.number().optional(),
        max: z.number().optional(),
      }).optional(),
      gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
      location: z.array(z.string()).optional(),
    }).optional(),
    behavioral: z.object({
      visitInterval: z.object({
        min: z.number().optional(),
        max: z.number().optional(),
      }).optional(),
      preferredMenus: z.array(z.string()).optional(),
      riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
    }).optional(),
    tags: z.array(z.string()).optional(),
  }),
});

const createBroadcastSchema = z.object({
  name: z.string().min(1, 'Campaign name is required'),
  template: z.string().min(1, 'Message template is required'),
  segmentCriteria: z.array(createSegmentSchema.shape.criteria),
  channels: z.array(z.enum(['LINE', 'INSTAGRAM', 'EMAIL'])).min(1, 'At least one channel is required'),
  scheduledAt: z.string().optional().transform((str) => str ? new Date(str) : undefined),
  abTest: z.object({
    enabled: z.boolean(),
    variants: z.array(z.object({
      name: z.string(),
      content: z.string(),
      percentage: z.number().min(0).max(100),
    })),
  }).optional(),
});

const segmentQuerySchema = z.object({
  page: z.string().optional().transform((str) => str ? parseInt(str) : 1),
  limit: z.string().optional().transform((str) => str ? parseInt(str) : 20),
});

/**
 * Get all message threads with pagination and filtering
 */
export const getThreads = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { page, limit, status, channel, assignedStaffId, search, sortBy, sortOrder } = 
    threadQuerySchema.parse(req.query);
  const tenantId = req.user!.tenantId;

  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = { tenantId };

  if (status) {
    where.status = status;
  }

  if (channel) {
    where.channel = channel;
  }

  if (assignedStaffId) {
    where.assignedStaffId = assignedStaffId;
  }

  if (search) {
    where.OR = [
      {
        customer: {
          name: { contains: search, mode: 'insensitive' },
        },
      },
      {
        messages: {
          some: {
            content: { contains: search, mode: 'insensitive' },
          },
        },
      },
    ];
  }

  // Get threads with pagination
  const [threads, total] = await Promise.all([
    prisma.messageThread.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            instagramId: true,
            lineId: true,
          },
        },
        assignedStaff: {
          select: {
            id: true,
            name: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            content: true,
            senderType: true,
            mediaType: true,
            createdAt: true,
          },
        },
        threadTags: {
          include: {
            tag: true,
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
    }),
    prisma.messageThread.count({ where }),
  ]);

  // Format response
  const formattedThreads = threads.map((thread) => ({
    ...thread,
    lastMessage: thread.messages[0] || null,
    messageCount: thread._count.messages,
    tags: thread.threadTags.map((tt) => tt.tag),
    messages: undefined,
    threadTags: undefined,
    _count: undefined,
  }));

  res.status(200).json({
    threads: formattedThreads,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

/**
 * Get thread by ID with messages
 */
export const getThreadById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const tenantId = req.user!.tenantId;
  const { page = 1, limit = 50 } = req.query;

  const thread = await prisma.messageThread.findFirst({
    where: { id, tenantId },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          instagramId: true,
          lineId: true,
          phone: true,
          email: true,
        },
      },
      assignedStaff: {
        select: {
          id: true,
          name: true,
        },
      },
      threadTags: {
        include: {
          tag: true,
        },
      },
    },
  });

  if (!thread) {
    throw createError('Thread not found', 404);
  }

  // Get messages with pagination
  const skip = (Number(page) - 1) * Number(limit);
  const [messages, messageCount] = await Promise.all([
    prisma.message.findMany({
      where: { threadId: id },
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    prisma.message.count({ where: { threadId: id } }),
  ]);

  const formattedThread = {
    ...thread,
    tags: thread.threadTags.map((tt) => tt.tag),
    threadTags: undefined,
    messages: {
      data: messages,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: messageCount,
        totalPages: Math.ceil(messageCount / Number(limit)),
      },
    },
  };

  res.status(200).json({ thread: formattedThread });
});

/**
 * Create new message thread
 */
export const createThread = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const data = createThreadSchema.parse(req.body);
  const tenantId = req.user!.tenantId;

  // Check if thread already exists
  const existingThread = await prisma.messageThread.findFirst({
    where: {
      channel: data.channel,
      channelThreadId: data.channelThreadId,
      tenantId,
    },
  });

  if (existingThread) {
    throw createError('Thread already exists for this channel and ID', 409);
  }

  // Verify customer exists if provided
  if (data.customerId) {
    const customer = await prisma.customer.findFirst({
      where: { id: data.customerId, tenantId },
    });

    if (!customer) {
      throw createError('Customer not found', 404);
    }
  }

  const thread = await prisma.messageThread.create({
    data: {
      ...data,
      tenantId,
      status: 'OPEN',
    },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          instagramId: true,
          lineId: true,
        },
      },
    },
  });

  // Log audit event
  await prisma.auditLog.create({
    data: {
      action: 'THREAD_CREATED',
      entityType: 'MessageThread',
      entityId: thread.id,
      description: `Message thread created for ${thread.channel}`,
      staffId: req.user!.userId,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      tenantId,
    },
  });

  logger.info(`Message thread created: ${thread.id}`, {
    threadId: thread.id,
    channel: thread.channel,
    tenantId,
    createdBy: req.user!.userId,
  });

  res.status(201).json({ 
    message: 'Thread created successfully',
    thread,
  });
});

/**
 * Update thread (assign staff, change status, add tags)
 */
export const updateThread = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const data = updateThreadSchema.parse(req.body);
  const tenantId = req.user!.tenantId;
  const { tags, ...threadData } = data;

  // Check if thread exists
  const existingThread = await prisma.messageThread.findFirst({
    where: { id, tenantId },
  });

  if (!existingThread) {
    throw createError('Thread not found', 404);
  }

  // Verify assigned staff exists if provided
  if (data.assignedStaffId) {
    const staff = await prisma.staff.findFirst({
      where: { id: data.assignedStaffId, tenantId },
    });

    if (!staff) {
      throw createError('Staff member not found', 404);
    }
  }

  // Update thread
  const thread = await prisma.messageThread.update({
    where: { id },
    data: threadData,
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          instagramId: true,
          lineId: true,
        },
      },
      assignedStaff: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // Update tags if provided
  if (tags !== undefined) {
    // Remove existing tags
    await prisma.threadTag.deleteMany({
      where: { threadId: id },
    });

    // Add new tags
    if (tags.length > 0) {
      for (const tagId of tags) {
        try {
          await prisma.threadTag.create({
            data: {
              threadId: id,
              tagId,
            },
          });
        } catch (error) {
          logger.warn(`Failed to assign tag ${tagId} to thread ${id}`);
        }
      }
    }
  }

  // Log audit event
  await prisma.auditLog.create({
    data: {
      action: 'THREAD_UPDATED',
      entityType: 'MessageThread',
      entityId: thread.id,
      description: `Thread updated: status=${thread.status}, assigned=${thread.assignedStaffId}`,
      staffId: req.user!.userId,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      tenantId,
    },
  });

  logger.info(`Thread updated: ${thread.id}`, {
    threadId: thread.id,
    tenantId,
    updatedBy: req.user!.userId,
  });

  res.status(200).json({ 
    message: 'Thread updated successfully',
    thread,
  });
});

/**
 * Send message to thread
 */
export const sendMessage = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const data = sendMessageSchema.parse(req.body);
  const tenantId = req.user!.tenantId;

  // Check if thread exists and belongs to tenant
  const thread = await prisma.messageThread.findFirst({
    where: { id: data.threadId, tenantId },
    include: {
      customer: true,
    },
  });

  if (!thread) {
    throw createError('Thread not found', 404);
  }

  // Create message record
  const message = await prisma.message.create({
    data: {
      threadId: data.threadId,
      senderId: req.user!.userId,
      senderType: 'STAFF',
      content: data.content,
      mediaType: data.mediaType,
      mediaUrl: data.mediaUrl,
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // Update thread timestamp
  await prisma.messageThread.update({
    where: { id: data.threadId },
    data: { updatedAt: new Date() },
  });

  // TODO: Send actual message via external API (Instagram/LINE)
  // This would be implemented in a separate service
  logger.info(`Message queued for external sending`, {
    messageId: message.id,
    threadId: data.threadId,
    channel: thread.channel,
    tenantId,
  });

  // Log audit event
  await prisma.auditLog.create({
    data: {
      action: 'MESSAGE_SENT',
      entityType: 'Message',
      entityId: message.id,
      description: `Message sent to ${thread.channel} thread`,
      staffId: req.user!.userId,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      tenantId,
    },
  });

  res.status(201).json({ 
    message: 'Message sent successfully',
    data: message,
  });
});

/**
 * Mark messages as read
 */
export const markMessagesAsRead = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { threadId } = req.params;
  const tenantId = req.user!.tenantId;

  // Verify thread exists and belongs to tenant
  const thread = await prisma.messageThread.findFirst({
    where: { id: threadId, tenantId },
  });

  if (!thread) {
    throw createError('Thread not found', 404);
  }

  // Mark all unread messages as read
  const result = await prisma.message.updateMany({
    where: {
      threadId,
      isRead: false,
      senderType: 'CUSTOMER', // Only mark customer messages as read
    },
    data: {
      isRead: true,
    },
  });

  logger.info(`Marked ${result.count} messages as read in thread ${threadId}`, {
    threadId,
    tenantId,
    staffId: req.user!.userId,
  });

  res.status(200).json({ 
    message: 'Messages marked as read',
    count: result.count,
  });
});

/**
 * Get thread statistics
 */
export const getThreadStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.user!.tenantId;

  const [
    totalThreads,
    openThreads,
    inProgressThreads,
    unreadMessages,
    todayMessages,
  ] = await Promise.all([
    prisma.messageThread.count({ where: { tenantId } }),
    
    prisma.messageThread.count({ 
      where: { tenantId, status: 'OPEN' } 
    }),
    
    prisma.messageThread.count({ 
      where: { tenantId, status: 'IN_PROGRESS' } 
    }),
    
    prisma.message.count({
      where: {
        thread: { tenantId },
        isRead: false,
        senderType: 'CUSTOMER',
      },
    }),
    
    prisma.message.count({
      where: {
        thread: { tenantId },
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
  ]);

  const stats = {
    totalThreads,
    openThreads,
    inProgressThreads,
    closedThreads: totalThreads - openThreads - inProgressThreads,
    unreadMessages,
    todayMessages,
  };

  res.status(200).json({ stats });
});

// Broadcast functionality

/**
 * Perform RFM analysis for customer segmentation
 */
export const performRFMAnalysis = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.user!.tenantId;
  const broadcastService = new BroadcastService(tenantId);

  try {
    const rfmAnalysis = await broadcastService.performRFMAnalysis();

    // Group by segments for summary
    const segmentSummary: { [segment: string]: { count: number; customers: any[] } } = {};
    
    for (const analysis of rfmAnalysis) {
      if (!segmentSummary[analysis.segment]) {
        segmentSummary[analysis.segment] = { count: 0, customers: [] };
      }
      segmentSummary[analysis.segment].count++;
      segmentSummary[analysis.segment].customers.push({
        customerId: analysis.customerId,
        rfmScore: analysis.rfmScore,
        recency: analysis.recency,
        frequency: analysis.frequency,
        monetary: analysis.monetary,
      });
    }

    // Log audit event
    await prisma.auditLog.create({
      data: {
        action: 'RFM_ANALYSIS_PERFORMED',
        entityType: 'CustomerSegmentation',
        description: `RFM analysis completed for ${rfmAnalysis.length} customers`,
        staffId: req.user!.userId,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        tenantId,
      },
    });

    logger.info('RFM analysis completed', {
      tenantId,
      customersAnalyzed: rfmAnalysis.length,
      segments: Object.keys(segmentSummary).length,
    });

    res.status(200).json({
      message: 'RFM analysis completed',
      analysis: {
        totalCustomers: rfmAnalysis.length,
        segments: segmentSummary,
        detailedResults: rfmAnalysis,
      },
    });

  } catch (error) {
    logger.error('RFM analysis failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      tenantId,
    });
    throw createError('Failed to perform RFM analysis', 500);
  }
});

/**
 * Create customer segment
 */
export const createSegment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const data = createSegmentSchema.parse(req.body);
  const tenantId = req.user!.tenantId;
  const broadcastService = new BroadcastService(tenantId);

  try {
    const segment = await broadcastService.createSegment(
      data.name,
      data.description || '',
      data.criteria
    );

    // Log audit event
    await prisma.auditLog.create({
      data: {
        action: 'CUSTOMER_SEGMENT_CREATED',
        entityType: 'CustomerSegment',
        entityId: segment.id,
        description: `Customer segment created: ${segment.name} (${segment.customerCount} customers)`,
        staffId: req.user!.userId,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        tenantId,
      },
    });

    logger.info('Customer segment created', {
      tenantId,
      segmentId: segment.id,
      customerCount: segment.customerCount,
    });

    res.status(201).json({
      message: 'Customer segment created successfully',
      segment,
    });

  } catch (error) {
    logger.error('Failed to create customer segment', {
      error: error instanceof Error ? error.message : 'Unknown error',
      tenantId,
    });
    throw createError('Failed to create customer segment', 500);
  }
});

/**
 * Get customers in a segment
 */
export const getSegmentCustomers = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const requestData = createSegmentSchema.shape.criteria.parse(req.body);
  const { page, limit } = segmentQuerySchema.parse(req.query);
  const tenantId = req.user!.tenantId;
  const broadcastService = new BroadcastService(tenantId);

  try {
    const customers = await broadcastService.getSegmentCustomers(requestData);
    
    // Apply pagination
    const skip = (page - 1) * limit;
    const paginatedCustomers = customers.slice(skip, skip + limit);

    res.status(200).json({
      customers: paginatedCustomers,
      pagination: {
        page,
        limit,
        total: customers.length,
        totalPages: Math.ceil(customers.length / limit),
      },
    });

  } catch (error) {
    logger.error('Failed to get segment customers', {
      error: error instanceof Error ? error.message : 'Unknown error',
      tenantId,
    });
    throw createError('Failed to get segment customers', 500);
  }
});

/**
 * Create and send broadcast campaign
 */
export const createBroadcastCampaign = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const data = createBroadcastSchema.parse(req.body);
  const tenantId = req.user!.tenantId;
  const broadcastService = new BroadcastService(tenantId);

  try {
    // Validate A/B test percentages add up to 100
    if (data.abTest?.enabled && data.abTest.variants.length > 0) {
      const totalPercentage = data.abTest.variants.reduce((sum, variant) => sum + variant.percentage, 0);
      if (Math.abs(totalPercentage - 100) > 0.01) {
        throw createError('A/B test variant percentages must sum to 100%', 400);
      }
    }

    const campaign = await broadcastService.createBroadcastCampaign(
      data.name,
      data.template,
      data.segmentCriteria,
      data.channels,
      data.scheduledAt,
      data.abTest
    );

    // Log audit event
    await prisma.auditLog.create({
      data: {
        action: 'BROADCAST_CAMPAIGN_CREATED',
        entityType: 'BroadcastCampaign',
        entityId: campaign.id,
        description: `Broadcast campaign created: ${campaign.name} (${campaign.analytics.totalRecipients} recipients)`,
        staffId: req.user!.userId,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        tenantId,
      },
    });

    logger.info('Broadcast campaign created', {
      tenantId,
      campaignId: campaign.id,
      recipients: campaign.analytics.totalRecipients,
      channels: campaign.channels,
    });

    res.status(201).json({
      message: 'Broadcast campaign created successfully',
      campaign,
    });

  } catch (error) {
    logger.error('Failed to create broadcast campaign', {
      error: error instanceof Error ? error.message : 'Unknown error',
      tenantId,
    });
    
    if (error instanceof z.ZodError) {
      throw createError('Invalid campaign data', 400);
    }
    
    throw createError('Failed to create broadcast campaign', 500);
  }
});

/**
 * Get broadcast campaign analytics
 */
export const getBroadcastAnalytics = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { campaignId } = req.params;
  const tenantId = req.user!.tenantId;
  const broadcastService = new BroadcastService(tenantId);

  try {
    const analytics = await broadcastService.getBroadcastAnalytics(campaignId);

    res.status(200).json({
      message: 'Broadcast analytics retrieved successfully',
      analytics,
    });

  } catch (error) {
    logger.error('Failed to get broadcast analytics', {
      error: error instanceof Error ? error.message : 'Unknown error',
      tenantId,
      campaignId,
    });
    throw createError('Failed to get broadcast analytics', 500);
  }
});

/**
 * Get broadcast campaigns list
 */
export const getBroadcastCampaigns = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { page = 1, limit = 20 } = req.query;
  const tenantId = req.user!.tenantId;

  try {
    // Get campaigns from audit logs
    const campaigns = await prisma.auditLog.findMany({
      where: {
        tenantId,
        action: 'BROADCAST_CAMPAIGN_CREATED',
        entityType: 'BroadcastCampaign',
      },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      include: {
        staff: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const total = await prisma.auditLog.count({
      where: {
        tenantId,
        action: 'BROADCAST_CAMPAIGN_CREATED',
        entityType: 'BroadcastCampaign',
      },
    });

    const formattedCampaigns = campaigns.map((log) => {
      let metadata = {};
      try {
        metadata = JSON.parse(log.ipAddress || '{}');
      } catch (e) {
        // ignore parse errors
      }

      return {
        id: log.entityId,
        name: log.description?.replace('Broadcast campaign created: ', '').split(' (')[0],
        status: 'COMPLETED', // Would need to track status separately
        createdAt: log.createdAt,
        createdBy: log.staff?.name,
        ...metadata,
      };
    });

    res.status(200).json({
      campaigns: formattedCampaigns,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });

  } catch (error) {
    logger.error('Failed to get broadcast campaigns', {
      error: error instanceof Error ? error.message : 'Unknown error',
      tenantId,
    });
    throw createError('Failed to get broadcast campaigns', 500);
  }
});

/**
 * Test message personalization
 */
export const testPersonalization = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { template, customerId } = z.object({
    template: z.string().min(1, 'Template is required'),
    customerId: z.string().min(1, 'Customer ID is required'),
  }).parse(req.body);
  
  const tenantId = req.user!.tenantId;
  const broadcastService = new BroadcastService(tenantId);

  try {
    // Get customer data
    const customer = await prisma.customer.findFirst({
      where: { id: customerId, tenantId },
      include: {
        reservations: {
          where: { status: 'COMPLETED' },
          orderBy: { startTime: 'desc' },
          take: 3,
        },
        menuHistory: {
          include: { menu: true },
          orderBy: { visitDate: 'desc' },
          take: 3,
        },
      },
    });

    if (!customer) {
      throw createError('Customer not found', 404);
    }

    const personalizedMessage = await broadcastService.personalizeMessage(template, customer);

    res.status(200).json({
      message: 'Message personalization test completed',
      originalTemplate: template,
      personalizedContent: personalizedMessage.content,
      variables: personalizedMessage.variables,
    });

  } catch (error) {
    logger.error('Failed to test message personalization', {
      error: error instanceof Error ? error.message : 'Unknown error',
      tenantId,
      customerId,
    });
    throw createError('Failed to test message personalization', 500);
  }
});
