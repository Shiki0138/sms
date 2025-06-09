import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { createError, asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { PERMISSIONS } from '../utils/auth';

const prisma = new PrismaClient();

// Validation schemas
const createCustomerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  nameKana: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  birthDate: z.string().optional().transform((str) => str ? new Date(str) : undefined),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  instagramId: z.string().optional(),
  lineId: z.string().optional(),
  firstVisitDate: z.string().optional().transform((str) => str ? new Date(str) : undefined),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

const updateCustomerSchema = createCustomerSchema.partial();

const customerQuerySchema = z.object({
  page: z.string().optional().transform((str) => str ? parseInt(str) : 1),
  limit: z.string().optional().transform((str) => str ? parseInt(str) : 20),
  search: z.string().optional(),
  tags: z.string().optional(),
  sortBy: z.enum(['name', 'lastVisitDate', 'visitCount', 'createdAt']).optional().default('name'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});

/**
 * Get all customers with pagination and filtering
 */
export const getCustomers = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, search, tags, sortBy, sortOrder } = customerQuerySchema.parse(req.query);
  const tenantId = req.user!.tenantId;

  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = { tenantId };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { nameKana: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (tags) {
    const tagIds = tags.split(',');
    where.customerTags = {
      some: {
        tagId: { in: tagIds },
      },
    };
  }

  // Get customers with pagination
  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        customerTags: {
          include: {
            tag: true,
          },
        },
        _count: {
          select: {
            reservations: true,
            threads: true,
          },
        },
      },
    }),
    prisma.customer.count({ where }),
  ]);

  // Format response
  const formattedCustomers = customers.map((customer) => ({
    ...customer,
    tags: customer.customerTags.map((ct) => ct.tag),
    customerTags: undefined,
    reservationCount: customer._count.reservations,
    threadCount: customer._count.threads,
    _count: undefined,
  }));

  res.status(200).json({
    customers: formattedCustomers,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

/**
 * Get customer by ID
 */
export const getCustomerById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const tenantId = req.user!.tenantId;

  const customer = await prisma.customer.findFirst({
    where: { id, tenantId },
    include: {
      customerTags: {
        include: {
          tag: true,
        },
      },
      reservations: {
        orderBy: { startTime: 'desc' },
        take: 10,
        include: {
          staff: {
            select: { id: true, name: true },
          },
        },
      },
      threads: {
        orderBy: { updatedAt: 'desc' },
        take: 5,
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      },
    },
  });

  if (!customer) {
    throw createError('Customer not found', 404);
  }

  // Calculate visit metrics
  const visitMetrics = {
    totalVisits: customer.visitCount,
    lastVisitDate: customer.lastVisitDate,
    firstVisitDate: customer.firstVisitDate,
    averageVisitInterval: null as number | null,
  };

  if (customer.reservations.length > 1) {
    const completedReservations = customer.reservations
      .filter(r => r.status === 'COMPLETED')
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    if (completedReservations.length > 1) {
      const intervals = [];
      for (let i = 1; i < completedReservations.length; i++) {
        const diff = completedReservations[i].startTime.getTime() - 
                    completedReservations[i - 1].startTime.getTime();
        intervals.push(diff / (1000 * 60 * 60 * 24)); // Convert to days
      }
      visitMetrics.averageVisitInterval = Math.round(
        intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length
      );
    }
  }

  const formattedCustomer = {
    ...customer,
    tags: customer.customerTags.map((ct) => ct.tag),
    customerTags: undefined,
    visitMetrics,
  };

  res.status(200).json({ customer: formattedCustomer });
});

/**
 * Create new customer
 */
export const createCustomer = asyncHandler(async (req: Request, res: Response) => {
  const data = createCustomerSchema.parse(req.body);
  const tenantId = req.user!.tenantId;
  const { tags, ...customerData } = data;

  // Check for duplicate email or social IDs
  if (data.email) {
    const existingByEmail = await prisma.customer.findFirst({
      where: { email: data.email, tenantId },
    });
    if (existingByEmail) {
      throw createError('Customer with this email already exists', 409);
    }
  }

  if (data.instagramId) {
    const existingByInstagram = await prisma.customer.findFirst({
      where: { instagramId: data.instagramId, tenantId },
    });
    if (existingByInstagram) {
      throw createError('Customer with this Instagram ID already exists', 409);
    }
  }

  if (data.lineId) {
    const existingByLine = await prisma.customer.findFirst({
      where: { lineId: data.lineId, tenantId },
    });
    if (existingByLine) {
      throw createError('Customer with this LINE ID already exists', 409);
    }
  }

  // Create customer
  const customer = await prisma.customer.create({
    data: {
      ...customerData,
      tenantId,
      visitCount: 0,
    },
    include: {
      customerTags: {
        include: {
          tag: true,
        },
      },
    },
  });

  // Add tags if provided
  if (tags && tags.length > 0) {
    for (const tagId of tags) {
      try {
        await prisma.customerTag.create({
          data: {
            customerId: customer.id,
            tagId,
          },
        });
      } catch (error) {
        // Tag might not exist or already assigned, continue
        logger.warn(`Failed to assign tag ${tagId} to customer ${customer.id}`);
      }
    }
  }

  // Log audit event
  await prisma.auditLog.create({
    data: {
      action: 'CUSTOMER_CREATED',
      entityType: 'Customer',
      entityId: customer.id,
      description: `Customer created: ${customer.name}`,
      staffId: req.user!.userId,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      tenantId,
    },
  });

  logger.info(`Customer created: ${customer.name}`, {
    customerId: customer.id,
    tenantId,
    createdBy: req.user!.userId,
  });

  res.status(201).json({ 
    message: 'Customer created successfully',
    customer: {
      ...customer,
      tags: customer.customerTags.map((ct) => ct.tag),
      customerTags: undefined,
    },
  });
});

/**
 * Update customer
 */
export const updateCustomer = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = updateCustomerSchema.parse(req.body);
  const tenantId = req.user!.tenantId;
  const { tags, ...customerData } = data;

  // Check if customer exists
  const existingCustomer = await prisma.customer.findFirst({
    where: { id, tenantId },
  });

  if (!existingCustomer) {
    throw createError('Customer not found', 404);
  }

  // Check for duplicate email or social IDs (excluding current customer)
  if (data.email) {
    const existingByEmail = await prisma.customer.findFirst({
      where: { 
        email: data.email, 
        tenantId,
        NOT: { id },
      },
    });
    if (existingByEmail) {
      throw createError('Another customer with this email already exists', 409);
    }
  }

  if (data.instagramId) {
    const existingByInstagram = await prisma.customer.findFirst({
      where: { 
        instagramId: data.instagramId, 
        tenantId,
        NOT: { id },
      },
    });
    if (existingByInstagram) {
      throw createError('Another customer with this Instagram ID already exists', 409);
    }
  }

  if (data.lineId) {
    const existingByLine = await prisma.customer.findFirst({
      where: { 
        lineId: data.lineId, 
        tenantId,
        NOT: { id },
      },
    });
    if (existingByLine) {
      throw createError('Another customer with this LINE ID already exists', 409);
    }
  }

  // Update customer
  const customer = await prisma.customer.update({
    where: { id },
    data: customerData,
    include: {
      customerTags: {
        include: {
          tag: true,
        },
      },
    },
  });

  // Update tags if provided
  if (tags !== undefined) {
    // Remove existing tags
    await prisma.customerTag.deleteMany({
      where: { customerId: id },
    });

    // Add new tags
    if (tags.length > 0) {
      for (const tagId of tags) {
        try {
          await prisma.customerTag.create({
            data: {
              customerId: id,
              tagId,
            },
          });
        } catch (error) {
          logger.warn(`Failed to assign tag ${tagId} to customer ${id}`);
        }
      }
    }
  }

  // Log audit event
  await prisma.auditLog.create({
    data: {
      action: 'CUSTOMER_UPDATED',
      entityType: 'Customer',
      entityId: customer.id,
      description: `Customer updated: ${customer.name}`,
      staffId: req.user!.userId,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      tenantId,
    },
  });

  logger.info(`Customer updated: ${customer.name}`, {
    customerId: customer.id,
    tenantId,
    updatedBy: req.user!.userId,
  });

  res.status(200).json({ 
    message: 'Customer updated successfully',
    customer: {
      ...customer,
      tags: customer.customerTags.map((ct) => ct.tag),
      customerTags: undefined,
    },
  });
});

/**
 * Delete customer
 */
export const deleteCustomer = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const tenantId = req.user!.tenantId;

  // Check if customer exists
  const customer = await prisma.customer.findFirst({
    where: { id, tenantId },
    include: {
      reservations: true,
      threads: true,
    },
  });

  if (!customer) {
    throw createError('Customer not found', 404);
  }

  // Check if customer has active reservations
  const activeReservations = customer.reservations.filter(
    r => r.status === 'CONFIRMED' || r.status === 'TENTATIVE'
  );

  if (activeReservations.length > 0) {
    throw createError('Cannot delete customer with active reservations', 400);
  }

  // Delete customer (this will cascade delete related data)
  await prisma.customer.delete({
    where: { id },
  });

  // Log audit event
  await prisma.auditLog.create({
    data: {
      action: 'CUSTOMER_DELETED',
      entityType: 'Customer',
      entityId: id,
      description: `Customer deleted: ${customer.name}`,
      staffId: req.user!.userId,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      tenantId,
    },
  });

  logger.info(`Customer deleted: ${customer.name}`, {
    customerId: id,
    tenantId,
    deletedBy: req.user!.userId,
  });

  res.status(200).json({ message: 'Customer deleted successfully' });
});

/**
 * Get customer statistics
 */
export const getCustomerStats = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.user!.tenantId;

  const [
    totalCustomers,
    newCustomersThisMonth,
    activeCustomers,
    averageVisitCount,
  ] = await Promise.all([
    prisma.customer.count({ where: { tenantId } }),
    
    prisma.customer.count({
      where: {
        tenantId,
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
    
    prisma.customer.count({
      where: {
        tenantId,
        lastVisitDate: {
          gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Last 90 days
        },
      },
    }),
    
    prisma.customer.aggregate({
      where: { tenantId },
      _avg: { visitCount: true },
    }),
  ]);

  const stats = {
    totalCustomers,
    newCustomersThisMonth,
    activeCustomers,
    averageVisitCount: Math.round(averageVisitCount._avg.visitCount || 0),
  };

  res.status(200).json({ stats });
});