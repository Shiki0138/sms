import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { createError, asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { PERMISSIONS } from '../utils/auth';

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

/**
 * Get all message threads with pagination and filtering
 */
export const getThreads = asyncHandler(async (req: Request, res: Response) => {
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
export const getThreadById = asyncHandler(async (req: Request, res: Response) => {
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
export const createThread = asyncHandler(async (req: Request, res: Response) => {
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
export const updateThread = asyncHandler(async (req: Request, res: Response) => {
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
export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
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
export const markMessagesAsRead = asyncHandler(async (req: Request, res: Response) => {
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
export const getThreadStats = asyncHandler(async (req: Request, res: Response) => {
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