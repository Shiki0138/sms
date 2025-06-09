import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { createError, asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

// Validation schemas
const createTagSchema = z.object({
  name: z.string().min(1, 'Tag name is required'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
  type: z.enum(['CUSTOMER', 'THREAD']),
});

const updateTagSchema = createTagSchema.partial();

/**
 * Get all tags for a tenant
 */
export const getTags = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user!.tenantId;
  const { type } = req.query;

  const where: any = { tenantId };
  
  if (type && ['CUSTOMER', 'THREAD'].includes(type as string)) {
    where.type = type;
  }

  const tags = await prisma.tag.findMany({
    where,
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: {
          customerTags: true,
          threadTags: true,
        },
      },
    },
  });

  const formattedTags = tags.map((tag) => ({
    ...tag,
    usageCount: tag.type === 'CUSTOMER' ? tag._count.customerTags : tag._count.threadTags,
    _count: undefined,
  }));

  res.status(200).json({ tags: formattedTags });
});

/**
 * Get tag by ID
 */
export const getTagById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const tenantId = req.user!.tenantId;

  const tag = await prisma.tag.findFirst({
    where: { id, tenantId },
    include: {
      _count: {
        select: {
          customerTags: true,
          threadTags: true,
        },
      },
    },
  });

  if (!tag) {
    throw createError('Tag not found', 404);
  }

  const formattedTag = {
    ...tag,
    usageCount: tag.type === 'CUSTOMER' ? tag._count.customerTags : tag._count.threadTags,
    _count: undefined,
  };

  res.status(200).json({ tag: formattedTag });
});

/**
 * Create new tag
 */
export const createTag = asyncHandler(async (req: Request, res: Response) => {
  const data = createTagSchema.parse(req.body);
  const tenantId = req.user!.tenantId;

  // Check if tag with same name and type already exists
  const existingTag = await prisma.tag.findFirst({
    where: {
      name: data.name,
      type: data.type,
      tenantId,
    },
  });

  if (existingTag) {
    throw createError('Tag with this name and type already exists', 409);
  }

  const tag = await prisma.tag.create({
    data: {
      ...data,
      tenantId,
      color: data.color || '#3B82F6', // Default blue color
    },
  });

  // Log audit event
  await prisma.auditLog.create({
    data: {
      action: 'TAG_CREATED',
      entityType: 'Tag',
      entityId: tag.id,
      description: `Tag created: ${tag.name} (${tag.type})`,
      staffId: req.user!.userId,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      tenantId,
    },
  });

  logger.info(`Tag created: ${tag.name}`, {
    tagId: tag.id,
    tenantId,
    createdBy: req.user!.userId,
  });

  res.status(201).json({ 
    message: 'Tag created successfully',
    tag,
  });
});

/**
 * Update tag
 */
export const updateTag = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = updateTagSchema.parse(req.body);
  const tenantId = req.user!.tenantId;

  // Check if tag exists
  const existingTag = await prisma.tag.findFirst({
    where: { id, tenantId },
  });

  if (!existingTag) {
    throw createError('Tag not found', 404);
  }

  // Check for duplicate name and type (excluding current tag)
  if (data.name || data.type) {
    const duplicateTag = await prisma.tag.findFirst({
      where: {
        name: data.name || existingTag.name,
        type: data.type || existingTag.type,
        tenantId,
        NOT: { id },
      },
    });

    if (duplicateTag) {
      throw createError('Tag with this name and type already exists', 409);
    }
  }

  const tag = await prisma.tag.update({
    where: { id },
    data,
  });

  // Log audit event
  await prisma.auditLog.create({
    data: {
      action: 'TAG_UPDATED',
      entityType: 'Tag',
      entityId: tag.id,
      description: `Tag updated: ${tag.name}`,
      staffId: req.user!.userId,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      tenantId,
    },
  });

  logger.info(`Tag updated: ${tag.name}`, {
    tagId: tag.id,
    tenantId,
    updatedBy: req.user!.userId,
  });

  res.status(200).json({ 
    message: 'Tag updated successfully',
    tag,
  });
});

/**
 * Delete tag
 */
export const deleteTag = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const tenantId = req.user!.tenantId;

  // Check if tag exists
  const tag = await prisma.tag.findFirst({
    where: { id, tenantId },
    include: {
      _count: {
        select: {
          customerTags: true,
          threadTags: true,
        },
      },
    },
  });

  if (!tag) {
    throw createError('Tag not found', 404);
  }

  // Check if tag is in use
  const usageCount = tag.type === 'CUSTOMER' ? tag._count.customerTags : tag._count.threadTags;
  if (usageCount > 0) {
    throw createError('Cannot delete tag that is currently in use', 400);
  }

  await prisma.tag.delete({
    where: { id },
  });

  // Log audit event
  await prisma.auditLog.create({
    data: {
      action: 'TAG_DELETED',
      entityType: 'Tag',
      entityId: id,
      description: `Tag deleted: ${tag.name}`,
      staffId: req.user!.userId,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      tenantId,
    },
  });

  logger.info(`Tag deleted: ${tag.name}`, {
    tagId: id,
    tenantId,
    deletedBy: req.user!.userId,
  });

  res.status(200).json({ message: 'Tag deleted successfully' });
});

/**
 * Get popular tags
 */
export const getPopularTags = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user!.tenantId;
  const { type, limit = 10 } = req.query;

  const where: any = { tenantId };
  
  if (type && ['CUSTOMER', 'THREAD'].includes(type as string)) {
    where.type = type;
  }

  const tags = await prisma.tag.findMany({
    where,
    include: {
      _count: {
        select: {
          customerTags: true,
          threadTags: true,
        },
      },
    },
  });

  const sortedTags = tags
    .map((tag) => ({
      ...tag,
      usageCount: tag.type === 'CUSTOMER' ? tag._count.customerTags : tag._count.threadTags,
      _count: undefined,
    }))
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, Number(limit));

  res.status(200).json({ tags: sortedTags });
});