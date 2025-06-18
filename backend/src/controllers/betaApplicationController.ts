import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { createError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

/**
 * Submit beta application
 */
export const submitBetaApplication = async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      phone,
      salonName,
      salonType,
      numberOfStylists,
      currentSoftware,
      painPoints,
      expectations,
      availableHours,
      referralSource,
      submittedAt
    } = req.body;

    // Check if email already exists
    const existingApplication = await prisma.betaApplication.findUnique({
      where: { email }
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'このメールアドレスは既に登録されています。'
      });
    }

    // Create beta application record
    const application = await prisma.betaApplication.create({
      data: {
        name,
        email,
        phone,
        salonName,
        salonType,
        numberOfStylists,
        currentSoftware,
        painPoints,
        expectations,
        availableHours,
        referralSource,
        status: 'pending',
        submittedAt: submittedAt ? new Date(submittedAt) : new Date(),
        metadata: JSON.stringify({
          userAgent: req.headers['user-agent'] || '',
          ipAddress: req.ip || '',
          timestamp: new Date().toISOString()
        })
      }
    });

    // Send notification to admin (placeholder)
    await sendAdminNotification(application);

    logger.info('Beta application submitted', { 
      applicationId: application.id, 
      email, 
      salonName 
    });

    res.status(201).json({
      success: true,
      data: {
        id: application.id,
        email: application.email,
        status: application.status
      },
      message: 'ベータテスト申し込みを受け付けました。'
    });
  } catch (error) {
    logger.error('Failed to submit beta application', error);
    throw createError('申し込みの送信に失敗しました。', 500);
  }
};

/**
 * Send confirmation email
 */
export const sendConfirmationEmail = async (req: Request, res: Response) => {
  try {
    const { email, name } = req.body;

    // Find the application
    const application = await prisma.betaApplication.findUnique({
      where: { email }
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: '申し込み情報が見つかりません。'
      });
    }

    // Send confirmation email (placeholder - implement with actual email service)
    await sendConfirmationEmailToUser(application);

    logger.info('Confirmation email sent', { email, applicationId: application.id });

    res.status(200).json({
      success: true,
      message: '確認メールを送信しました。'
    });
  } catch (error) {
    logger.error('Failed to send confirmation email', error);
    throw createError('確認メールの送信に失敗しました。', 500);
  }
};

/**
 * Get all beta applications (admin only)
 */
export const getBetaApplications = async (req: Request, res: Response) => {
  try {
    const {
      status,
      salonType,
      page = 1,
      limit = 20,
      sortBy = 'submittedAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (status) where.status = status;
    if (salonType) where.salonType = salonType;

    const [applications, total] = await Promise.all([
      prisma.betaApplication.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { [sortBy as string]: sortOrder },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          salonName: true,
          salonType: true,
          numberOfStylists: true,
          status: true,
          submittedAt: true,
          reviewedAt: true,
          reviewNotes: true,
          painPoints: true,
          expectations: true,
          availableHours: true,
          referralSource: true
        }
      }),
      prisma.betaApplication.count({ where })
    ]);

    res.status(200).json({
      success: true,
      data: applications,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    logger.error('Failed to get beta applications', error);
    throw createError('申し込み一覧の取得に失敗しました。', 500);
  }
};

/**
 * Update beta application status
 */
export const updateApplicationStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, reviewNotes } = req.body;

    const application = await prisma.betaApplication.update({
      where: { id },
      data: {
        status,
        reviewNotes,
        reviewedAt: new Date(),
        updatedAt: new Date()
      }
    });

    // Send status update email to applicant
    if (status === 'approved') {
      await sendApprovalEmail(application);
    } else if (status === 'rejected') {
      await sendRejectionEmail(application);
    }

    logger.info('Beta application status updated', { 
      applicationId: id, 
      status, 
      email: application.email 
    });

    res.status(200).json({
      success: true,
      data: application,
      message: 'ステータスを更新しました。'
    });
  } catch (error) {
    logger.error('Failed to update application status', error);
    throw createError('ステータスの更新に失敗しました。', 500);
  }
};

/**
 * Get beta application statistics
 */
export const getBetaApplicationStats = async (req: Request, res: Response) => {
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

    const [
      totalApplications,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      applicationsByType,
      applicationsBySource
    ] = await Promise.all([
      prisma.betaApplication.count({
        where: { submittedAt: { gte: startDate } }
      }),
      prisma.betaApplication.count({
        where: { 
          status: 'pending',
          submittedAt: { gte: startDate }
        }
      }),
      prisma.betaApplication.count({
        where: { 
          status: 'approved',
          submittedAt: { gte: startDate }
        }
      }),
      prisma.betaApplication.count({
        where: { 
          status: 'rejected',
          submittedAt: { gte: startDate }
        }
      }),
      prisma.betaApplication.groupBy({
        by: ['salonType'],
        _count: { id: true },
        where: { submittedAt: { gte: startDate } }
      }),
      prisma.betaApplication.groupBy({
        by: ['referralSource'],
        _count: { id: true },
        where: { 
          submittedAt: { gte: startDate },
          referralSource: { not: null }
        }
      })
    ]);

    const stats = {
      totalApplications,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      approvalRate: totalApplications > 0 
        ? Math.round((approvedApplications / totalApplications) * 100) 
        : 0,
      applicationsByType: applicationsByType.map(item => ({
        salonType: item.salonType,
        count: item._count.id
      })),
      applicationsBySource: applicationsBySource.map(item => ({
        source: item.referralSource,
        count: item._count.id
      }))
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Failed to get beta application stats', error);
    throw createError('統計情報の取得に失敗しました。', 500);
  }
};

// Helper functions
async function sendAdminNotification(application: any) {
  // TODO: Implement admin notification (email, Slack, etc.)
  logger.info('Admin notification sent for new beta application', { 
    applicationId: application.id 
  });
}

async function sendConfirmationEmailToUser(application: any) {
  // TODO: Implement email service integration
  logger.info('Confirmation email sent to user', { 
    email: application.email,
    applicationId: application.id 
  });
}

async function sendApprovalEmail(application: any) {
  // TODO: Implement approval email with test account details
  logger.info('Approval email sent', { 
    email: application.email,
    applicationId: application.id 
  });
}

async function sendRejectionEmail(application: any) {
  // TODO: Implement rejection email
  logger.info('Rejection email sent', { 
    email: application.email,
    applicationId: application.id 
  });
}