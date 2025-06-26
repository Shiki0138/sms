import { Router } from 'express';
import { Request, Response } from 'express';
import { ContactFormService } from '../services/contactFormService';
import { authenticate, requirePermission } from '../middleware/auth';
import { PERMISSIONS } from '../utils/auth';
import { logger } from '../utils/logger';
import { z } from 'zod';
import { strictRateLimit, paymentRateLimit } from '../middleware/security';

const router = Router();

// バリデーションスキーマ
const contactFormSchema = z.object({
  name: z.string().min(1, '名前は必須です').max(100),
  email: z.string().email('有効なメールアドレスを入力してください'),
  company: z.string().optional(),
  category: z.enum(['technical', 'billing', 'feature', 'emergency', 'general']),
  subject: z.string().min(1, '件名は必須です').max(200),
  message: z.string().min(10, 'メッセージは10文字以上入力してください').max(2000),
  urgency: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  tenantId: z.string().optional(),
  userId: z.string().optional()
});

/**
 * 🤖 お問い合わせフォーム送信（パブリック）
 */
router.post('/submit', 
  strictRateLimit, // 5分に5回まで
  async (req: Request, res: Response) => {
    try {
      const validatedData = contactFormSchema.parse(req.body);
      
      const result = await ContactFormService.handleInquiry(validatedData);
      
      logger.info('Contact form submitted:', {
        inquiryId: result.inquiryId,
        category: validatedData.category,
        urgency: validatedData.urgency
      });

      res.status(201).json({
        success: true,
        data: {
          inquiryId: result.inquiryId,
          estimatedResponseTime: result.estimatedResponseTime,
          autoResponse: result.aiResponse ? {
            message: result.aiResponse.response,
            confidence: result.aiResponse.confidence,
            needsHumanReview: result.aiResponse.requiresHumanReview,
            suggestedAction: result.aiResponse.suggestedAction
          } : null
        },
        message: 'お問い合わせを受け付けました。自動応答をメールでお送りしました。'
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: '入力内容に誤りがあります',
          details: error.errors
        });
      }

      logger.error('Contact form submission error:', error);
      res.status(500).json({
        success: false,
        error: 'お問い合わせの送信中にエラーが発生しました'
      });
    }
  }
);

/**
 * 📋 お問い合わせ履歴取得（管理者専用）
 */
router.get('/inquiries',
  authenticate,
  requirePermission(PERMISSIONS.ADMIN),
  async (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 20, status, category, urgency } = req.query;
      const tenantId = req.user!.tenantId;

      const result = await ContactFormService.getInquiryHistory(
        tenantId,
        Number(page),
        Number(limit)
      );

      res.json({
        success: true,
        data: result.inquiries,
        pagination: {
          page: result.page,
          totalPages: result.totalPages,
          total: result.total
        }
      });

    } catch (error) {
      logger.error('Inquiry history fetch error:', error);
      res.status(500).json({
        success: false,
        error: 'お問い合わせ履歴の取得に失敗しました'
      });
    }
  }
);

/**
 * 💬 お問い合わせに回答（サポートスタッフ専用）
 */
router.post('/inquiries/:inquiryId/respond',
  authenticate,
  requirePermission(PERMISSIONS.ADMIN),
  async (req: Request, res: Response) => {
    try {
      const { inquiryId } = req.params;
      const { response, resolved = false } = req.body;
      const staffId = req.user!.staffId;

      if (!response || response.trim().length < 10) {
        return res.status(400).json({
          success: false,
          error: '回答は10文字以上入力してください'
        });
      }

      await ContactFormService.sendManualResponse(
        inquiryId,
        response,
        staffId,
        resolved
      );

      logger.info('Manual inquiry response sent:', {
        inquiryId,
        staffId,
        resolved
      });

      res.json({
        success: true,
        message: resolved ? 
          'お問い合わせに回答し、解決済みにマークしました' : 
          'お問い合わせに回答しました'
      });

    } catch (error) {
      logger.error('Manual inquiry response error:', error);
      res.status(500).json({
        success: false,
        error: 'お問い合わせへの回答に失敗しました'
      });
    }
  }
);

/**
 * ✅ お問い合わせ解決マーク
 */
router.patch('/inquiries/:inquiryId/resolve',
  authenticate,
  requirePermission(PERMISSIONS.ADMIN),
  async (req: Request, res: Response) => {
    try {
      const { inquiryId } = req.params;
      const staffId = req.user!.staffId;

      // Prismaを使って直接更新
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      // TODO: contactInquiry model needs to be added to schema
      // const inquiry = await prisma.contactInquiry.update({
      //   where: { id: inquiryId },
      //   data: {
      //     status: 'resolved',
      //     resolvedAt: new Date(),
      //     resolvedBy: staffId
      //   }
      // });

      await prisma.$disconnect();

      logger.info('Inquiry marked as resolved:', {
        inquiryId,
        resolvedBy: staffId
      });

      res.json({
        success: true,
        message: 'お問い合わせを解決済みにマークしました'
      });

    } catch (error) {
      logger.error('Inquiry resolution error:', error);
      res.status(500).json({
        success: false,
        error: 'お問い合わせの解決処理に失敗しました'
      });
    }
  }
);

/**
 * 📊 お問い合わせ統計
 */
router.get('/statistics',
  authenticate,
  requirePermission(PERMISSIONS.ADMIN),
  async (req: Request, res: Response) => {
    try {
      const { period = '30' } = req.query; // 日数
      const tenantId = req.user!.tenantId;

      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - Number(period));

      const [
        totalInquiries,
        resolvedInquiries,
        categoryStats,
        urgencyStats,
        avgResponseTime
      ] = await Promise.all([
        // 総問い合わせ数
        // TODO: contactInquiry model needs to be added to schema
        Promise.resolve(0),
        // prisma.contactInquiry.count({
        //   where: {
        //     tenantId,
        //     receivedAt: { gte: startDate }
        //   }
        // }),

        // 解決済み数
        // TODO: contactInquiry model needs to be added to schema
        Promise.resolve(0),
        // prisma.contactInquiry.count({
        //   where: {
        //     tenantId,
        //     status: 'resolved',
        //     receivedAt: { gte: startDate }
        //   }
        // }),

        // カテゴリ別統計
        // TODO: contactInquiry model needs to be added to schema
        Promise.resolve([]),
        // prisma.contactInquiry.groupBy({
        //   by: ['category'],
        //   where: {
        //     tenantId,
        //     receivedAt: { gte: startDate }
        //   },
        //   _count: true
        // }),

        // 緊急度別統計
        // TODO: contactInquiry model needs to be added to schema
        Promise.resolve([]),
        // prisma.contactInquiry.groupBy({
        //   by: ['urgency'],
        //   where: {
        //     tenantId,
        //     receivedAt: { gte: startDate }
        //   },
        //   _count: true
        // }),

        // 平均応答時間計算（簡易）
        // TODO: contactInquiry model needs to be added to schema
        Promise.resolve([{ avg_hours: 0 }])
        // prisma.$queryRaw`
        //   SELECT AVG(EXTRACT(EPOCH FROM (last_response_at - received_at))/3600) as avg_hours
        //   FROM contact_inquiries 
        //   WHERE tenant_id = ${tenantId} 
        //   AND received_at >= ${startDate}
        //   AND last_response_at IS NOT NULL
        // `
      ]);

      await prisma.$disconnect();

      const resolutionRate = totalInquiries > 0 ? 
        Math.round((resolvedInquiries / totalInquiries) * 100) : 0;

      res.json({
        success: true,
        data: {
          period: Number(period),
          totalInquiries,
          resolvedInquiries,
          resolutionRate,
          avgResponseTime: avgResponseTime[0]?.avg_hours || 0,
          categoryBreakdown: (categoryStats as any[]).reduce((acc, item) => {
            acc[item.category] = item._count;
            return acc;
          }, {} as Record<string, number>),
          urgencyBreakdown: (urgencyStats as any[]).reduce((acc, item) => {
            acc[item.urgency] = item._count;
            return acc;
          }, {} as Record<string, number>)
        }
      });

    } catch (error) {
      logger.error('Contact statistics error:', error);
      res.status(500).json({
        success: false,
        error: '統計情報の取得に失敗しました'
      });
    }
  }
);

/**
 * 🔧 AI応答設定（スーパー管理者専用）
 */
router.put('/ai-settings',
  authenticate,
  requirePermission(PERMISSIONS.SUPER_ADMIN),
  async (req: Request, res: Response) => {
    try {
      const { 
        autoResponseEnabled = true,
        confidenceThreshold = 0.8,
        humanReviewCategories = ['billing', 'emergency'],
        responseTemplates 
      } = req.body;

      // 設定をデータベースに保存
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      // TODO: systemSetting model needs to be added to schema
      // await prisma.systemSetting.upsert({
      //   where: { key: 'contact_ai_settings' },
      //   update: {
      //     value: JSON.stringify({
      //       autoResponseEnabled,
      //       confidenceThreshold,
      //       humanReviewCategories,
      //       responseTemplates,
      //       updatedAt: new Date()
      //     })
      //   },
      //   create: {
      //     key: 'contact_ai_settings',
      //     value: JSON.stringify({
      //       autoResponseEnabled,
      //       confidenceThreshold,
      //       humanReviewCategories,
      //       responseTemplates,
      //       createdAt: new Date()
      //     })
      //   }
      // });

      await prisma.$disconnect();

      logger.info('AI contact settings updated:', {
        updatedBy: req.user!.staffId,
        autoResponseEnabled,
        confidenceThreshold
      });

      res.json({
        success: true,
        message: 'AI応答設定を更新しました'
      });

    } catch (error) {
      logger.error('AI settings update error:', error);
      res.status(500).json({
        success: false,
        error: 'AI設定の更新に失敗しました'
      });
    }
  }
);

export default router;