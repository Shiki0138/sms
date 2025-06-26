import { Response } from 'express';
import { AuthenticatedRequest } from '../types/auth';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { createError, asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { PERMISSIONS } from '../utils/auth';
import { createGoogleCalendarService } from '../services/googleCalendarService';
import SmartBookingService from '../services/smartBookingService';

const prisma = new PrismaClient();

// Validation schemas
const createReservationSchema = z.object({
  startTime: z.string().transform((str) => new Date(str)),
  endTime: z.string().optional().transform((str) => str ? new Date(str) : undefined),
  menuContent: z.string().optional(),
  customerName: z.string().optional(),
  customerId: z.string().optional(),
  customerPhone: z.string().optional(),
  customerEmail: z.string().email().optional().or(z.literal('')),
  staffId: z.string().optional(),
  source: z.enum(['HOTPEPPER', 'GOOGLE_CALENDAR', 'PHONE', 'WALK_IN', 'MANUAL']),
  sourceId: z.string().optional(),
  status: z.enum(['TENTATIVE', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional().default('CONFIRMED'),
  notes: z.string().optional(),
});

// More flexible update schema with better date handling
const updateReservationSchema = z.object({
  startTime: z.string().optional().transform((str) => {
    if (!str) return undefined;
    const date = new Date(str);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid startTime format: ${str}`);
    }
    return date;
  }),
  endTime: z.string().optional().transform((str) => {
    if (!str) return undefined;
    const date = new Date(str);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid endTime format: ${str}`);
    }
    return date;
  }),
  menuContent: z.string().optional(),
  customerName: z.string().optional(),
  customerId: z.string().optional(),
  customerPhone: z.string().optional(),
  customerEmail: z.string().email().optional().or(z.literal('')),
  staffId: z.string().optional(),
  source: z.enum(['HOTPEPPER', 'GOOGLE_CALENDAR', 'PHONE', 'WALK_IN', 'MANUAL']).optional(),
  sourceId: z.string().optional(),
  status: z.enum(['TENTATIVE', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
  notes: z.string().optional(),
  nextVisitDate: z.string().optional().transform((str) => {
    if (!str) return undefined;
    const date = new Date(str);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid nextVisitDate format: ${str}`);
    }
    return date;
  }),
});

const reservationQuerySchema = z.object({
  startDate: z.string().optional().transform((str) => str ? new Date(str) : undefined),
  endDate: z.string().optional().transform((str) => str ? new Date(str) : undefined),
  staffId: z.string().optional(),
  source: z.enum(['HOTPEPPER', 'GOOGLE_CALENDAR', 'PHONE', 'WALK_IN', 'MANUAL']).optional(),
  status: z.enum(['TENTATIVE', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
  page: z.string().optional().transform((str) => str ? parseInt(str) : 1),
  limit: z.string().optional().transform((str) => str ? parseInt(str) : 50),
});

const hotpepperImportSchema = z.object({
  csvData: z.string().min(1, 'CSV data is required'),
});

const googleCalendarSyncSchema = z.object({
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().transform((str) => new Date(str)),
  calendarId: z.string().optional().default('primary'),
});

// Smart booking schemas
const optimizeBookingSchema = z.object({
  menuContent: z.string(),
  estimatedDuration: z.number().min(15).max(480), // 15 minutes to 8 hours
  preferredDate: z.string().transform((str) => new Date(str)),
  preferredTimeRange: z.object({
    start: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/), // HH:MM format
    end: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  }).optional(),
  customerId: z.string().optional(),
  customerPriority: z.enum(['VIP', 'REGULAR', 'NEW']).default('REGULAR'),
  flexibility: z.number().min(0).max(1).default(0.5),
});

const smartBookSchema = z.object({
  startTime: z.string().transform((str) => new Date(str)),
  endTime: z.string().transform((str) => new Date(str)),
  menuContent: z.string(),
  customerId: z.string().optional(),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  customerEmail: z.string().email().optional().or(z.literal('')),
  staffId: z.string(),
  useOptimization: z.boolean().default(true),
  notes: z.string().optional(),
});

const availabilityQuerySchema = z.object({
  date: z.string().transform((str) => new Date(str)),
});

const demandPredictionSchema = z.object({
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().transform((str) => new Date(str)),
});

const noShowPredictionSchema = z.object({
  customerId: z.string(),
  reservationDate: z.string().transform((str) => new Date(str)),
});

/**
 * Get reservations with filtering
 */
export const getReservations = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { startDate, endDate, staffId, source, status, page, limit } = 
    reservationQuerySchema.parse(req.query);
  const tenantId = req.user!.tenantId;

  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = { tenantId };

  if (startDate || endDate) {
    where.startTime = {};
    if (startDate) where.startTime.gte = startDate;
    if (endDate) where.startTime.lte = endDate;
  }

  if (staffId) {
    where.staffId = staffId;
  }

  if (source) {
    where.source = source;
  }

  if (status) {
    where.status = status;
  }

  const [reservations, total] = await Promise.all([
    prisma.reservation.findMany({
      where,
      skip,
      take: limit,
      orderBy: { startTime: 'asc' },
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
    }),
    prisma.reservation.count({ where }),
  ]);

  res.status(200).json({
    reservations,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

/**
 * Get reservation by ID
 */
export const getReservationById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const tenantId = req.user!.tenantId;

  const reservation = await prisma.reservation.findFirst({
    where: { id, tenantId },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          visitCount: true,
          lastVisitDate: true,
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

  if (!reservation) {
    throw createError('Reservation not found', 404);
  }

  res.status(200).json({ reservation });
});

/**
 * Create new reservation
 */
export const createReservation = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const data = createReservationSchema.parse(req.body);
  const tenantId = req.user!.tenantId;

  // Verify customer exists if provided
  if (data.customerId) {
    const customer = await prisma.customer.findFirst({
      where: { id: data.customerId, tenantId },
    });

    if (!customer) {
      throw createError('Customer not found', 404);
    }
  }

  // Verify staff exists if provided
  if (data.staffId) {
    const staff = await prisma.staff.findFirst({
      where: { id: data.staffId, tenantId },
    });

    if (!staff) {
      throw createError('Staff member not found', 404);
    }
  }

  // Check for conflicts if creating a confirmed reservation
  if (data.status === 'CONFIRMED' && data.staffId) {
    const conflictingReservations = await prisma.reservation.findMany({
      where: {
        staffId: data.staffId,
        tenantId,
        status: { in: ['CONFIRMED', 'TENTATIVE'] },
        OR: [
          {
            AND: [
              { startTime: { lte: data.startTime } },
              { endTime: { gte: data.startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lte: data.endTime } },
              { endTime: { gte: data.endTime } },
            ],
          },
        ],
      },
    });

    if (conflictingReservations.length > 0) {
      logger.warn(`Potential scheduling conflict detected`, {
        staffId: data.staffId,
        startTime: data.startTime,
        endTime: data.endTime,
        conflicts: conflictingReservations.map(r => ({ id: r.id, startTime: r.startTime, endTime: r.endTime })),
      });
      
      // Return warning but still create the reservation
      res.status(201).json({
        message: 'Reservation created with potential scheduling conflict',
        warning: 'This reservation may conflict with existing bookings',
        conflicts: conflictingReservations,
      });
    }
  }

  const reservation = await prisma.reservation.create({
    data: {
      ...data,
      tenantId,
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
      action: 'RESERVATION_CREATED',
      entityType: 'Reservation',
      entityId: reservation.id,
      description: `Reservation created: ${data.customerName || 'Unknown'} - ${data.menuContent}`,
      staffId: req.user!.userId,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      tenantId,
    },
  });

  logger.info(`Reservation created: ${reservation.id}`, {
    reservationId: reservation.id,
    tenantId,
    createdBy: req.user!.userId,
  });

  res.status(201).json({ 
    message: 'Reservation created successfully',
    reservation,
  });
});

/**
 * Update reservation
 */
export const updateReservation = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  
  // Log incoming request for debugging
  logger.info(`Updating reservation ${id}`, {
    reservationId: id,
    requestBody: req.body,
    tenantId: req.user!.tenantId,
  });

  try {
    const data = updateReservationSchema.parse(req.body);
    const tenantId = req.user!.tenantId;

    // Check if reservation exists
    const existingReservation = await prisma.reservation.findFirst({
      where: { id, tenantId },
    });

    if (!existingReservation) {
      throw createError('Reservation not found', 404);
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

    // Verify staff exists if provided
    if (data.staffId) {
      const staff = await prisma.staff.findFirst({
        where: { id: data.staffId, tenantId },
      });

      if (!staff) {
        throw createError('Staff member not found', 404);
      }
    }

    const reservation = await prisma.reservation.update({
      where: { id },
      data,
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

    // Update customer visit info if reservation is completed
    if (data.status === 'COMPLETED' && reservation.customerId) {
      await prisma.customer.update({
        where: { id: reservation.customerId },
        data: {
          lastVisitDate: reservation.startTime,
          visitCount: { increment: 1 },
        },
      });
    }

    // Log audit event
    await prisma.auditLog.create({
      data: {
        action: 'RESERVATION_UPDATED',
        entityType: 'Reservation',
        entityId: reservation.id,
        description: `Reservation updated: status=${reservation.status}`,
        staffId: req.user!.userId,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        tenantId,
      },
    });

    logger.info(`Reservation updated: ${reservation.id}`, {
      reservationId: reservation.id,
      tenantId,
      updatedBy: req.user!.userId,
    });

    res.status(200).json({ 
      message: 'Reservation updated successfully',
      reservation,
    });

  } catch (parseError) {
    logger.error(`Reservation update parse error for ${id}`, {
      reservationId: id,
      error: parseError,
      requestBody: req.body,
    });
    throw createError(`Validation error: ${parseError instanceof Error ? parseError.message : 'Invalid data format'}`, 400);
  }
});

/**
 * Delete reservation
 */
export const deleteReservation = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const tenantId = req.user!.tenantId;

  const reservation = await prisma.reservation.findFirst({
    where: { id, tenantId },
  });

  if (!reservation) {
    throw createError('Reservation not found', 404);
  }

  await prisma.reservation.delete({
    where: { id },
  });

  // Log audit event
  await prisma.auditLog.create({
    data: {
      action: 'RESERVATION_DELETED',
      entityType: 'Reservation',
      entityId: id,
      description: `Reservation deleted: ${reservation.customerName}`,
      staffId: req.user!.userId,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      tenantId,
    },
  });

  logger.info(`Reservation deleted: ${id}`, {
    reservationId: id,
    tenantId,
    deletedBy: req.user!.userId,
  });

  res.status(200).json({ message: 'Reservation deleted successfully' });
});

/**
 * Import Hot Pepper reservations from CSV
 */
export const importHotpepperReservations = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { csvData } = hotpepperImportSchema.parse(req.body);
  const tenantId = req.user!.tenantId;

  const rows = csvData.split('\n').filter(row => row.trim());
  const headers = rows[0].split(',').map(h => h.trim());
  
  const importResults = {
    total: 0,
    imported: 0,
    skipped: 0,
    errors: [] as string[],
  };

  // Process each row (skip header)
  for (let i = 1; i < rows.length; i++) {
    const values = rows[i].split(',').map(v => v.trim());
    importResults.total++;

    try {
      // Expected CSV format: 予約日,予約時間,メニュー,顧客名,電話番号,メールアドレス,担当者,ステータス
      const [dateStr, timeStr, menu, customerName, phone, email, staffName, statusStr] = values;

      if (!dateStr || !timeStr || !customerName) {
        importResults.skipped++;
        continue;
      }

      // Parse date and time
      const startTime = new Date(`${dateStr} ${timeStr}`);
      if (isNaN(startTime.getTime())) {
        importResults.errors.push(`Row ${i + 1}: Invalid date/time format`);
        continue;
      }

      // Find or create customer
      let customer = null;
      if (phone || email) {
        customer = await prisma.customer.findFirst({
          where: {
            tenantId,
            OR: [
              phone ? { phone } : {},
              email ? { email } : {},
            ].filter(obj => Object.keys(obj).length > 0),
          },
        });

        if (!customer) {
          customer = await prisma.customer.create({
            data: {
              name: customerName,
              phone: phone || undefined,
              email: email || undefined,
              tenantId,
              visitCount: 0,
            },
          });
        }
      }

      // Find staff by name
      let staff = null;
      if (staffName) {
        staff = await prisma.staff.findFirst({
          where: {
            name: { contains: staffName },
            tenantId,
          },
        });
      }

      // Check if reservation already exists
      const existingReservation = await prisma.reservation.findFirst({
        where: {
          startTime,
          customerName,
          tenantId,
          source: 'HOTPEPPER',
        },
      });

      if (existingReservation) {
        importResults.skipped++;
        continue;
      }

      // Create reservation
      await prisma.reservation.create({
        data: {
          startTime,
          menuContent: menu,
          customerName,
          customerId: customer?.id,
          customerPhone: phone || undefined,
          customerEmail: email || undefined,
          staffId: staff?.id,
          source: 'HOTPEPPER',
          status: statusStr === 'キャンセル' ? 'CANCELLED' : 'CONFIRMED',
          tenantId,
        },
      });

      importResults.imported++;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      importResults.errors.push(`Row ${i + 1}: ${errorMessage}`);
    }
  }

  // Log audit event
  await prisma.auditLog.create({
    data: {
      action: 'HOTPEPPER_IMPORT',
      entityType: 'Reservation',
      description: `Hot Pepper CSV import: ${importResults.imported} imported, ${importResults.skipped} skipped`,
      staffId: req.user!.userId,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      tenantId,
    },
  });

  logger.info(`Hot Pepper import completed`, {
    ...importResults,
    tenantId,
    importedBy: req.user!.userId,
  });

  res.status(200).json({
    message: 'Import completed',
    results: importResults,
  });
});

/**
 * Get reservation statistics
 */
export const getReservationStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.user!.tenantId;
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [
    todayReservations,
    monthReservations,
    confirmedReservations,
    completedReservations,
    cancelledReservations,
  ] = await Promise.all([
    prisma.reservation.count({
      where: {
        tenantId,
        startTime: { gte: startOfToday },
      },
    }),
    
    prisma.reservation.count({
      where: {
        tenantId,
        startTime: { gte: startOfMonth },
      },
    }),
    
    prisma.reservation.count({
      where: {
        tenantId,
        status: 'CONFIRMED',
        startTime: { gte: startOfToday },
      },
    }),
    
    prisma.reservation.count({
      where: {
        tenantId,
        status: 'COMPLETED',
        startTime: { gte: startOfMonth },
      },
    }),
    
    prisma.reservation.count({
      where: {
        tenantId,
        status: 'CANCELLED',
        startTime: { gte: startOfMonth },
      },
    }),
  ]);

  const stats = {
    todayReservations,
    monthReservations,
    confirmedReservations,
    completedReservations,
    cancelledReservations,
    cancellationRate: monthReservations > 0 
      ? Math.round((cancelledReservations / monthReservations) * 100) 
      : 0,
  };

  res.status(200).json({ stats });
});

/**
 * Sync Google Calendar events to reservations
 */
export const syncGoogleCalendar = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { startDate, endDate, calendarId } = googleCalendarSyncSchema.parse(req.body);
  const tenantId = req.user!.tenantId;

  // Create Google Calendar service
  const calendarService = await createGoogleCalendarService(tenantId);
  
  if (!calendarService) {
    throw createError('Google Calendar integration not configured', 400);
  }

  try {
    const syncResults = await calendarService.syncEventsToDatabase(
      calendarId,
      startDate,
      endDate
    );

    // Log audit event
    await prisma.auditLog.create({
      data: {
        action: 'GOOGLE_CALENDAR_SYNC',
        entityType: 'Reservation',
        description: `Google Calendar sync: ${syncResults.imported} imported, ${syncResults.updated} updated`,
        staffId: req.user!.userId,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        tenantId,
      },
    });

    logger.info('Google Calendar sync completed', {
      ...syncResults,
      tenantId,
      syncedBy: req.user!.userId,
    });

    res.status(200).json({
      message: 'Google Calendar sync completed',
      results: syncResults,
    });

  } catch (error) {
    logger.error('Google Calendar sync failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      tenantId,
      startDate,
      endDate,
    });

    throw createError('Failed to sync Google Calendar', 500);
  }
});

/**
 * Optimize booking suggestions using smart booking algorithm
 */
export const optimizeBooking = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const data = optimizeBookingSchema.parse(req.body);
  const tenantId = req.user!.tenantId;

  const smartBookingService = new SmartBookingService(tenantId);
  
  try {
    const bookingRequest: any = {
      menuContent: data.menuContent,
      estimatedDuration: data.estimatedDuration,
      preferredDate: data.preferredDate,
      customerId: data.customerId,
      customerPriority: data.customerPriority,
      flexibility: data.flexibility,
    };
    
    if (data.preferredTimeRange) {
      bookingRequest.preferredTimeRange = data.preferredTimeRange;
    }
    
    const suggestions = await smartBookingService.optimizeBooking(bookingRequest);

    logger.info('Booking optimization completed', {
      tenantId,
      suggestionsCount: suggestions.length,
      requestedBy: req.user!.userId,
    });

    res.status(200).json({
      message: 'Booking optimization completed',
      suggestions,
      metadata: {
        requestedDate: data.preferredDate.toISOString(),
        menuContent: data.menuContent,
        estimatedDuration: data.estimatedDuration,
      },
    });

  } catch (error) {
    logger.error('Booking optimization failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      tenantId,
      data,
    });
    throw createError('Failed to optimize booking', 500);
  }
});

/**
 * Get availability analysis for a specific date
 */
export const getAvailabilityAnalysis = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { date } = availabilityQuerySchema.parse({ date: req.params.date });
  const tenantId = req.user!.tenantId;

  const smartBookingService = new SmartBookingService(tenantId);
  
  try {
    const analysis = await smartBookingService.getAvailabilityAnalysis(date);

    res.status(200).json({
      message: 'Availability analysis completed',
      date: date.toISOString(),
      analysis,
    });

  } catch (error) {
    logger.error('Availability analysis failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      tenantId,
      date,
    });
    throw createError('Failed to analyze availability', 500);
  }
});

/**
 * Create smart booking with optimization
 */
export const createSmartBooking = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const data = smartBookSchema.parse(req.body);
  const tenantId = req.user!.tenantId;

  // Verify customer exists if provided
  if (data.customerId) {
    const customer = await prisma.customer.findFirst({
      where: { id: data.customerId, tenantId },
    });

    if (!customer) {
      throw createError('Customer not found', 404);
    }
  }

  // Verify staff exists
  const staff = await prisma.staff.findFirst({
    where: { id: data.staffId, tenantId },
  });

  if (!staff) {
    throw createError('Staff member not found', 404);
  }

  // Check for conflicts
  const conflictingReservations = await prisma.reservation.findMany({
    where: {
      staffId: data.staffId,
      tenantId,
      status: { in: ['CONFIRMED', 'TENTATIVE'] },
      OR: [
        {
          AND: [
            { startTime: { lte: data.startTime } },
            { endTime: { gte: data.startTime } },
          ],
        },
        {
          AND: [
            { startTime: { lte: data.endTime } },
            { endTime: { gte: data.endTime } },
          ],
        },
      ],
    },
  });

  if (conflictingReservations.length > 0) {
    throw createError('Time slot conflicts with existing reservation', 409);
  }

  // Predict no-show if customer ID is provided
  let noShowPrediction = null;
  if (data.customerId && data.useOptimization) {
    const smartBookingService = new SmartBookingService(tenantId);
    try {
      noShowPrediction = await smartBookingService.predictNoShow(
        data.customerId,
        data.startTime
      );
    } catch (error) {
      logger.warn('No-show prediction failed, continuing with booking', {
        error: error instanceof Error ? error.message : 'Unknown error',
        customerId: data.customerId,
      });
    }
  }

  const reservation = await prisma.reservation.create({
    data: {
      startTime: data.startTime,
      endTime: data.endTime,
      menuContent: data.menuContent,
      customerName: data.customerName,
      customerId: data.customerId,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail,
      staffId: data.staffId,
      source: 'MANUAL',
      status: 'CONFIRMED',
      notes: data.notes,
      tenantId,
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
      action: 'SMART_RESERVATION_CREATED',
      entityType: 'Reservation',
      entityId: reservation.id,
      description: `Smart reservation created: ${data.customerName || reservation.customer?.name || 'Unknown'} - ${data.menuContent}`,
      staffId: req.user!.userId,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      tenantId,
    },
  });

  logger.info(`Smart reservation created: ${reservation.id}`, {
    reservationId: reservation.id,
    tenantId,
    createdBy: req.user!.userId,
    noShowPrediction: noShowPrediction?.probability,
  });

  res.status(201).json({
    message: 'Smart reservation created successfully',
    reservation,
    predictions: noShowPrediction ? {
      noShowProbability: noShowPrediction.probability,
      recommendations: noShowPrediction.recommendations,
    } : null,
  });
});

/**
 * Get demand predictions for a date range
 */
export const getDemandPredictions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { startDate, endDate } = demandPredictionSchema.parse(req.query);
  const tenantId = req.user!.tenantId;

  // Validate date range
  const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  if (daysDiff > 30) {
    throw createError('Date range cannot exceed 30 days', 400);
  }

  const smartBookingService = new SmartBookingService(tenantId);
  
  try {
    const predictions = await smartBookingService.predictDemand(startDate, endDate);

    res.status(200).json({
      message: 'Demand prediction completed',
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        days: daysDiff,
      },
      predictions,
    });

  } catch (error) {
    logger.error('Demand prediction failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      tenantId,
      startDate,
      endDate,
    });
    throw createError('Failed to predict demand', 500);
  }
});

/**
 * Predict no-show probability for a customer
 */
export const predictNoShow = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { customerId, reservationDate } = noShowPredictionSchema.parse(req.body);
  const tenantId = req.user!.tenantId;

  // Verify customer exists
  const customer = await prisma.customer.findFirst({
    where: { id: customerId, tenantId },
  });

  if (!customer) {
    throw createError('Customer not found', 404);
  }

  const smartBookingService = new SmartBookingService(tenantId);
  
  try {
    const prediction = await smartBookingService.predictNoShow(customerId, reservationDate);

    res.status(200).json({
      message: 'No-show prediction completed',
      customer: {
        id: customer.id,
        name: customer.name,
        visitCount: customer.visitCount,
      },
      prediction,
    });

  } catch (error) {
    logger.error('No-show prediction failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      tenantId,
      customerId,
      reservationDate,
    });
    throw createError('Failed to predict no-show', 500);
  }
});
