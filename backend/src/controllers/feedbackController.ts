import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { createError } from '../middleware/errorHandler';

// Extend Request interface to include user property
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    staffId: string;
    userId: string;
    email: string;
    name: string;
    tenantId: string;
    role: 'ADMIN' | 'MANAGER' | 'STAFF';
  };
}

const prisma = new PrismaClient();

/**
 * Create new feedback
 */
export const createFeedback = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      type,
      title,
      description,
      severity,
      category,
      screenshot,
      rating,
      userAgent,
      url,
      timestamp
    } = req.body;

    // For simple test mode, use demo values if user is not authenticated
    const userId = req.user?.id || 'demo-user-id';
    const userEmailAddress = req.user?.email || 'demo@salon.test';
    const userName = req.user?.name || 'Demo User';
    const tenantId = req.user?.tenantId || 'demo-tenant-id';

    // Create feedback record
    const feedback = await prisma.feedback.create({
      data: {
        type,
        title,
        description,
        severity,
        category,
        screenshot,
        rating,
        userAgent,
        url,
        userId,
        userEmail: userEmailAddress,
        userName,
        tenantId,
        status: 'open',
        metadata: JSON.stringify({
          timestamp,
          environment: process.env.NODE_ENV,
          version: process.env.APP_VERSION || '1.0.0'
        })
      }
    });

    // Send notification to admin
    await sendFeedbackNotification(feedback);

    logger.info('Feedback created', { feedbackId: feedback.id, type, userId });

    res.status(201).json({
      success: true,
      data: feedback,
      message: 'フィードバックを送信しました'
    });
  } catch (error) {
    logger.error('Failed to create feedback', error);
    throw createError('フィードバックの送信に失敗しました', 500);
  }
};

/**
 * Submit quick rating
 */
export const submitQuickRating = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { rating, timestamp } = req.body;
    const userId = req.user?.id || 'demo-user-id';
    const userEmailAddress = req.user?.email || 'demo@salon.test';
    const tenantId = req.user?.tenantId || 'demo-tenant-id';

    // Create quick rating record
    const quickRating = await prisma.quickRating.create({
      data: {
        rating,
        userId,
        userEmail: userEmailAddress,
        tenantId,
        createdAt: new Date(timestamp)
      }
    });

    logger.info('Quick rating submitted', { rating, userId });

    res.status(201).json({
      success: true,
      data: quickRating,
      message: '評価を送信しました'
    });
  } catch (error) {
    logger.error('Failed to submit quick rating', error);
    throw createError('評価の送信に失敗しました', 500);
  }
};

/**
 * Get all feedback (admin only)
 */
export const getFeedback = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      type,
      status,
      priority,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (type) where.type = type;
    if (status) where.status = status;
    if (priority) where.severity = priority;

    const [feedback, total] = await Promise.all([
      prisma.feedback.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { [sortBy as string]: sortOrder },
        include: {
          tenant: {
            select: { name: true }
          }
        }
      }),
      prisma.feedback.count({ where })
    ]);

    res.status(200).json({
      success: true,
      data: feedback,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    logger.error('Failed to get feedback', error);
    throw createError('フィードバックの取得に失敗しました', 500);
  }
};

/**
 * Get feedback statistics
 */
export const getFeedbackStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { timeframe = 'week' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (timeframe) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'all':
        startDate = new Date(0);
        break;
    }

    // Get feedback counts
    const [
      totalFeedback,
      bugReports,
      featureRequests,
      generalFeedback,
      openFeedback,
      resolvedFeedback
    ] = await Promise.all([
      prisma.feedback.count({
        where: { createdAt: { gte: startDate } }
      }),
      prisma.feedback.count({
        where: { type: 'bug', createdAt: { gte: startDate } }
      }),
      prisma.feedback.count({
        where: { type: 'feature', createdAt: { gte: startDate } }
      }),
      prisma.feedback.count({
        where: { type: 'general', createdAt: { gte: startDate } }
      }),
      prisma.feedback.count({
        where: { status: 'open', createdAt: { gte: startDate } }
      }),
      prisma.feedback.count({
        where: { status: 'resolved', createdAt: { gte: startDate } }
      })
    ]);

    // Get average rating
    const ratings = await prisma.quickRating.aggregate({
      _avg: { rating: true },
      where: { createdAt: { gte: startDate } }
    });

    // Get daily active users (beta testers)
    const dailyActiveUsers = await getDailyActiveUsers(startDate);

    // Get satisfaction scores over time
    const satisfactionScores = await getSatisfactionScores(startDate);

    const stats = {
      totalFeedback,
      bugReports,
      featureRequests,
      generalFeedback,
      openFeedback,
      resolvedFeedback,
      averageRating: ratings._avg.rating || 0,
      feedbackByType: [
        { type: 'bug', count: bugReports },
        { type: 'feature', count: featureRequests },
        { type: 'general', count: generalFeedback }
      ],
      dailyActiveUsers,
      satisfactionScores,
      resolutionRate: totalFeedback > 0 
        ? Math.round((resolvedFeedback / totalFeedback) * 100) 
        : 0
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Failed to get feedback stats', error);
    throw createError('統計情報の取得に失敗しました', 500);
  }
};

/**
 * Get recent feedback
 */
export const getRecentFeedback = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { limit = 10 } = req.query;

    const feedback = await prisma.feedback.findMany({
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        tenant: {
          select: { name: true }
        }
      }
    });

    res.status(200).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    logger.error('Failed to get recent feedback', error);
    throw createError('最新フィードバックの取得に失敗しました', 500);
  }
};

/**
 * Update feedback status
 */
export const updateFeedbackStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const feedback = await prisma.feedback.update({
      where: { id },
      data: {
        status,
        resolvedAt: status === 'resolved' ? new Date() : undefined,
        adminNotes: notes,
        updatedAt: new Date()
      }
    });

    logger.info('Feedback status updated', { feedbackId: id, status });

    res.status(200).json({
      success: true,
      data: feedback,
      message: 'ステータスを更新しました'
    });
  } catch (error) {
    logger.error('Failed to update feedback status', error);
    throw createError('ステータスの更新に失敗しました', 500);
  }
};

// Helper functions
async function sendFeedbackNotification(feedback: any) {
  // TODO: Implement notification to admin (email, Slack, etc.)
  logger.info('Feedback notification sent', { feedbackId: feedback.id });
}

async function getDailyActiveUsers(startDate: Date) {
  // TODO: Implement daily active users calculation
  return [];
}

async function getSatisfactionScores(startDate: Date) {
  // TODO: Implement satisfaction scores calculation
  return [];
}