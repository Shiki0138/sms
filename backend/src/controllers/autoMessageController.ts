import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { createError, asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { AutoMessageService } from '../services/autoMessageService';

const prisma = new PrismaClient();

// Validation schemas
const templateSchema = z.object({
  type: z.enum(['REMINDER_1_WEEK', 'REMINDER_3_DAYS', 'FOLLOWUP_VISIT']),
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  isActive: z.boolean().optional().default(true),
});

const settingsSchema = z.object({
  autoReminderEnabled: z.boolean(),
  autoFollowUpEnabled: z.boolean(),
});

const nextVisitDateSchema = z.object({
  nextVisitDate: z.string().transform((str) => new Date(str)),
});

/**
 * Get all auto-message templates for tenant
 */
export const getTemplates = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = 'demo-tenant'; // Fixed for demo

  const templates = await prisma.autoMessageTemplate.findMany({
    where: { tenantId },
    orderBy: { type: 'asc' }
  });

  res.status(200).json({ templates });
});

/**
 * Get template by type
 */
export const getTemplateByType = asyncHandler(async (req: Request, res: Response) => {
  const { type } = req.params;
  const tenantId = 'demo-tenant'; // Fixed for demo

  if (!['REMINDER_1_WEEK', 'REMINDER_3_DAYS', 'FOLLOWUP_VISIT'].includes(type)) {
    throw createError('Invalid template type', 400);
  }

  const template = await prisma.autoMessageTemplate.findFirst({
    where: {
      tenantId,
      trigger: type
    }
  });

  if (!template) {
    throw createError('Template not found', 404);
  }

  res.status(200).json({ template });
});

/**
 * Create or update template
 */
export const upsertTemplate = asyncHandler(async (req: Request, res: Response) => {
  const data = templateSchema.parse(req.body);
  const tenantId = 'demo-tenant'; // Fixed for demo

  const template = await prisma.autoMessageTemplate.upsert({
    where: {
      tenantId_name: {
        tenantId,
        name: data.type || 'default'
      }
    },
    update: {
      content: data.content || '',
      isActive: data.isActive ?? true,
    },
    create: {
      tenantId,
      name: data.type || 'default',
      trigger: data.type || 'manual',
      content: data.content || '',
      isActive: data.isActive ?? true
    }
  });

  // Log audit event
  await prisma.auditLog.create({
    data: {
      action: 'TEMPLATE_UPDATED',
      entityType: 'AutoMessageTemplate',
      entityId: template.id,
      description: `Auto-message template updated: ${data.type}`,
      staffId: 'demo-staff', // Fixed for demo
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      tenantId,
    },
  });

  logger.info(`Template ${data.type} updated`, {
    templateId: template.id,
    tenantId,
    updatedBy: 'demo-staff', // Fixed for demo
  });

  res.status(200).json({ 
    message: 'Template saved successfully',
    template
  });
});

/**
 * Delete template
 */
export const deleteTemplate = asyncHandler(async (req: Request, res: Response) => {
  const { type } = req.params;
  const tenantId = 'demo-tenant'; // Fixed for demo

  if (!['REMINDER_1_WEEK', 'REMINDER_3_DAYS', 'FOLLOWUP_VISIT'].includes(type)) {
    throw createError('Invalid template type', 400);
  }

  const template = await prisma.autoMessageTemplate.findFirst({
    where: {
      tenantId,
      trigger: type
    }
  });

  if (!template) {
    throw createError('Template not found', 404);
  }

  await prisma.autoMessageTemplate.delete({
    where: {
      tenantId_type: {
        tenantId,
        type
      }
    }
  });

  // Log audit event
  await prisma.auditLog.create({
    data: {
      action: 'TEMPLATE_DELETED',
      entityType: 'AutoMessageTemplate',
      entityId: template.id,
      description: `Auto-message template deleted: ${type}`,
      staffId: 'demo-staff', // Fixed for demo
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      tenantId,
    },
  });

  logger.info(`Template ${type} deleted`, {
    templateId: template.id,
    tenantId,
    deletedBy: 'demo-staff', // Fixed for demo
  });

  res.status(200).json({ message: 'Template deleted successfully' });
});

/**
 * Get auto-message settings
 */
export const getSettings = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = 'demo-tenant'; // Fixed for demo

  const [reminderSetting, followUpSetting] = await Promise.all([
    prisma.tenantSetting.findUnique({
      where: {
        tenantId_key: {
          tenantId,
          key: 'auto_reminder_enabled'
        }
      }
    }),
    prisma.tenantSetting.findUnique({
      where: {
        tenantId_key: {
          tenantId,
          key: 'auto_followup_enabled'
        }
      }
    })
  ]);

  const settings = {
    autoReminderEnabled: reminderSetting?.value === 'true',
    autoFollowUpEnabled: followUpSetting?.value === 'true'
  };

  res.status(200).json({ settings });
});

/**
 * Update auto-message settings
 */
export const updateSettings = asyncHandler(async (req: Request, res: Response) => {
  const data = settingsSchema.parse(req.body);
  const tenantId = 'demo-tenant'; // Fixed for demo

  await Promise.all([
    prisma.tenantSetting.upsert({
      where: {
        tenantId_key: {
          tenantId,
          key: 'auto_reminder_enabled'
        }
      },
      update: {
        value: data.autoReminderEnabled.toString()
      },
      create: {
        tenantId,
        key: 'auto_reminder_enabled',
        value: data.autoReminderEnabled.toString()
      }
    }),
    prisma.tenantSetting.upsert({
      where: {
        tenantId_key: {
          tenantId,
          key: 'auto_followup_enabled'
        }
      },
      update: {
        value: data.autoFollowUpEnabled.toString()
      },
      create: {
        tenantId,
        key: 'auto_followup_enabled',
        value: data.autoFollowUpEnabled.toString()
      }
    })
  ]);

  // Log audit event
  await prisma.auditLog.create({
    data: {
      action: 'SETTINGS_UPDATED',
      entityType: 'TenantSetting',
      description: `Auto-message settings updated: reminder=${data.autoReminderEnabled}, followup=${data.autoFollowUpEnabled}`,
      staffId: 'demo-staff', // Fixed for demo
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      tenantId,
    },
  });

  logger.info('Auto-message settings updated', {
    tenantId,
    settings: data,
    updatedBy: 'demo-staff', // Fixed for demo
  });

  res.status(200).json({ 
    message: 'Settings updated successfully',
    settings: data
  });
});

/**
 * Update next visit date for reservation
 */
export const updateNextVisitDate = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = nextVisitDateSchema.parse(req.body);
  const tenantId = 'demo-tenant'; // Fixed for demo

  const reservation = await prisma.reservation.findFirst({
    where: { id, tenantId }
  });

  if (!reservation) {
    throw createError('Reservation not found', 404);
  }

  const updatedReservation = await prisma.reservation.update({
    where: { id },
    data: { 
      nextVisitDate: data.nextVisitDate,
      updatedAt: new Date()
    },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
        },
      },
      staff: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // Log audit event
  await prisma.auditLog.create({
    data: {
      action: 'NEXT_VISIT_DATE_UPDATED',
      entityType: 'Reservation',
      entityId: reservation.id,
      description: `Next visit date updated to ${data.nextVisitDate.toLocaleDateString('ja-JP')}`,
      staffId: 'demo-staff', // Fixed for demo
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      tenantId,
    },
  });

  logger.info(`Next visit date updated for reservation ${id}`, {
    reservationId: id,
    nextVisitDate: data.nextVisitDate,
    tenantId,
    updatedBy: 'demo-staff', // Fixed for demo
  });

  res.status(200).json({ 
    message: 'Next visit date updated successfully',
    reservation: updatedReservation
  });
});

/**
 * Get auto-message logs
 */
export const getMessageLogs = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = 'demo-tenant'; // Fixed for demo
  const { page = '1', limit = '50', type, status } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const where: any = { tenantId };

  if (type && ['REMINDER_1_WEEK', 'REMINDER_3_DAYS', 'FOLLOWUP_VISIT'].includes(type as string)) {
    where.templateType = type;
  }

  if (status && ['SENT', 'FAILED', 'SCHEDULED'].includes(status as string)) {
    where.status = status;
  }

  const [logs, total] = await Promise.all([
    prisma.autoMessageLog.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
          }
        },
        reservation: {
          select: {
            id: true,
            startTime: true,
            menuContent: true,
          }
        }
      }
    }),
    prisma.autoMessageLog.count({ where })
  ]);

  res.status(200).json({
    logs,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

/**
 * Manually trigger auto-message processing
 */
export const triggerAutoMessages = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = 'demo-tenant'; // Fixed for demo

  try {
    await AutoMessageService.processAllMessages();

    // Log audit event
    await prisma.auditLog.create({
      data: {
        action: 'AUTO_MESSAGE_TRIGGERED',
        entityType: 'System',
        description: 'Auto-message processing manually triggered',
        staffId: 'demo-staff', // Fixed for demo
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        tenantId,
      },
    });

    logger.info('Auto-message processing manually triggered', {
      tenantId,
      triggeredBy: 'demo-staff', // Fixed for demo
    });

    res.status(200).json({ 
      message: 'Auto-message processing completed successfully'
    });
  } catch (error) {
    logger.error('Manual auto-message processing failed:', error);
    throw createError('Failed to process auto-messages', 500);
  }
});

/**
 * Get default templates for initialization
 */
export const getDefaultTemplates = asyncHandler(async (req: Request, res: Response) => {
  const defaultTemplates = [
    {
      type: 'REMINDER_1_WEEK',
      title: '1週間前リマインダー',
      content: '{customerName}様\n\nいつもありがとうございます。\n{reservationDate} {reservationTime}からのご予約のリマインダーです。\n\nメニュー: {menuContent}\n\nご不明な点がございましたら、お気軽にお問い合わせください。\n\nお待ちしております。'
    },
    {
      type: 'REMINDER_3_DAYS',
      title: '3日前リマインダー',
      content: '{customerName}様\n\nご予約まであと3日となりました。\n{reservationDate} {reservationTime}からお待ちしております。\n\nメニュー: {menuContent}\n\n当日は少し早めにお越しいただけますと幸いです。\n\nお会いできることを楽しみにしております。'
    },
    {
      type: 'FOLLOWUP_VISIT',
      title: '来店促進メッセージ',
      content: '{customerName}様\n\nいつもご利用いただきありがとうございます。\n\n前回のご来店から時間が経ちましたが、お元気でお過ごしでしょうか？\n\n髪の調子はいかがですか？そろそろお手入れの時期かもしれませんね。\n\nご都合の良い時にぜひお越しください。お待ちしております。'
    }
  ];

  res.status(200).json({ templates: defaultTemplates });
});