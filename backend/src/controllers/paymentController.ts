import { Request, Response } from 'express';
import { paymentService } from '../services/paymentService';
import { logger } from '../utils/logger';
import { PrismaClient } from '@prisma/client';
import { PaymentProvider } from '../types/payment';

const prisma = new PrismaClient();

export class PaymentController {

  // PaymentIntent作成
  async createPaymentIntent(req: Request, res: Response) {
    try {
      const { amount, currency = 'jpy', customerId, reservationId, paymentMethod = 'card', metadata = {} } = req.body;
      const tenantId = req.user!.tenantId;

      if (!amount || amount <= 0) {
        return res.status(400).json({
          error: '有効な金額が必要です'
        });
      }

      // モック実装
      const mockClientSecret = `pi_mock_${Date.now()}_secret_mock`;
      const mockPaymentId = `pi_mock_${Date.now()}`;

      res.json({
        success: true,
        clientSecret: mockClientSecret,
        paymentId: mockPaymentId,
        requiresAction: false
      });
    } catch (error) {
      logger.error('PaymentIntent creation error:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
  }


  // 返金処理
  async refundPayment(req: Request, res: Response) {
    try {
      const { paymentId } = req.params;
      const { amount, reason = '顧客都合による返金' } = req.body;
      const tenantId = req.user!.tenantId;

      const payment = await prisma.payment.findFirst({
        where: {
          id: paymentId,
          tenantId
        }
      });

      if (!payment) {
        return res.status(404).json({ error: '決済情報が見つかりません' });
      }

      // Refund functionality would be implemented here
      const result = {
        success: true,
        refundId: 'mock_refund_id',
        amount: amount || payment.amount
      };

      if (result.success) {
        res.json({
          success: true,
          refundId: result.refundId,
          amount: result.amount
        });
      } else {
        res.status(400).json({
          error: '返金処理に失敗しました'
        });
      }
    } catch (error) {
      logger.error('Payment refund error:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
  }

  // Stripe Webhook処理
  async handleStripeWebhook(req: Request, res: Response) {
    try {
      // Webhook処理のモック
      logger.info('Stripe webhook received:', req.body);
      res.json({ received: true });
    } catch (error) {
      logger.error('Stripe webhook error:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
  }

  // 新規決済処理
  async createPayment(req: Request, res: Response) {
    try {
      res.json({
        success: true,
        message: 'Mock payment created'
      });
    } catch (error) {
      logger.error('Payment creation error:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
  }

  // 支払い状態確認
  async checkPaymentStatus(req: Request, res: Response) {
    try {
      const { paymentId } = req.params;
      res.json({
        success: true,
        paymentId,
        status: 'succeeded'
      });
    } catch (error) {
      logger.error('Payment status check error:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
  }

  // 現在のサブスクリプション情報を取得
  async getCurrentSubscription(req: Request, res: Response) {
    try {
      const tenantId = req.user!.tenantId;
      
      const subscription = await prisma.subscription.findUnique({
        where: { tenantId },
        include: {
          payments: {
            orderBy: { createdAt: 'desc' },
            take: 5
          },
          invoices: {
            orderBy: { createdAt: 'desc' },
            take: 10
          }
        }
      });

      if (!subscription) {
        return res.json({
          hasSubscription: false,
          plan: 'light', // デフォルトプラン
          status: 'inactive'
        });
      }

      res.json({
        hasSubscription: true,
        plan: subscription.planType,
        status: subscription.status,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        provider: subscription.provider,
        recentPayments: subscription.payments,
        recentInvoices: subscription.invoices
      });
    } catch (error) {
      logger.error('Get current subscription error:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
  }

  // 支払い履歴を取得
  async getPaymentHistory(req: Request, res: Response) {
    try {
      const tenantId = req.user!.tenantId;
      const { page = 1, limit = 20 } = req.query;
      
      const skip = (Number(page) - 1) * Number(limit);
      
      const [payments, total] = await Promise.all([
        prisma.payment.findMany({
          where: { tenantId },
          orderBy: { createdAt: 'desc' },
          skip,
          take: Number(limit),
          include: {
            subscription: {
              select: {
                planType: true
              }
            }
          }
        }),
        prisma.payment.count({
          where: { tenantId }
        })
      ]);

      res.json({
        payments,
        pagination: {
          current: Number(page),
          total: Math.ceil(total / Number(limit)),
          hasNext: skip + Number(limit) < total,
          hasPrev: Number(page) > 1
        }
      });
    } catch (error) {
      logger.error('Get payment history error:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
  }

  // 使用量情報を取得
  async getUsageInfo(req: Request, res: Response) {
    try {
      const tenantId = req.user!.tenantId;
      
      // テナントの現在のプランを取得
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { plan: true }
      });

      if (!tenant) {
        return res.status(404).json({ error: 'テナントが見つかりません' });
      }

      // 今月の使用量を計算
      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);
      
      const nextMonth = new Date(currentMonth);
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      const [
        staffCount,
        customerCount,
        reservationCount,
        messageCount,
        exportCount
      ] = await Promise.all([
        prisma.staff.count({ where: { tenantId } }),
        prisma.customer.count({ where: { tenantId } }),
        prisma.reservation.count({
          where: {
            tenantId,
            createdAt: {
              gte: currentMonth,
              lt: nextMonth
            }
          }
        }),
        prisma.messageThread.count({
          where: {
            tenantId,
            createdAt: {
              gte: currentMonth,
              lt: nextMonth
            }
          }
        }),
        // エクスポート回数の取得（今月分）
        0 // TODO: エクスポートログテーブルを作成後に実装
      ]);

      res.json({
        plan: tenant.plan,
        usage: {
          staff: staffCount,
          customers: customerCount,
          reservations: reservationCount,
          messages: messageCount,
          exports: exportCount
        },
        period: {
          start: currentMonth,
          end: nextMonth
        }
      });
    } catch (error) {
      logger.error('Get usage info error:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
  }

  // プランの利用可能な機能を取得
  async getAvailableFeatures(req: Request, res: Response) {
    try {
      const tenantId = req.user!.tenantId;
      
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { plan: true }
      });

      if (!tenant) {
        return res.status(404).json({ error: 'テナントが見つかりません' });
      }

      // プラン設定から機能を取得
      const { PLAN_CONFIGS } = await import('../types/plans');
      const planConfig = PLAN_CONFIGS[tenant.plan as keyof typeof PLAN_CONFIGS];

      if (!planConfig) {
        return res.status(400).json({ error: '無効なプランです' });
      }

      res.json({
        plan: tenant.plan,
        features: planConfig.features,
        limits: planConfig.limits,
        displayName: planConfig.displayName,
        description: planConfig.description
      });
    } catch (error) {
      logger.error('Get available features error:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
  }

  // 決済プロバイダー設定を取得
  async getProviderSettings(req: Request, res: Response) {
    try {
      const tenantId = req.user!.tenantId;
      
      const providerType = await paymentService.getTenantPaymentProvider(tenantId);
      
      res.json({
        provider: providerType,
        availableProviders: [
          { id: 'stripe', name: 'Stripe', available: !!process.env.STRIPE_SECRET_KEY },
          { id: 'square', name: 'Square', available: !!process.env.SQUARE_ACCESS_TOKEN },
          { id: 'paypal', name: 'PayPal', available: !!process.env.PAYPAL_CLIENT_SECRET },
          { id: 'payjp', name: 'PAY.JP', available: !!process.env.PAYJP_SECRET_KEY }
        ]
      });
    } catch (error) {
      logger.error('Get provider settings error:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
  }

  // 決済プロバイダーを変更
  async updateProviderSettings(req: Request, res: Response) {
    try {
      const tenantId = req.user!.tenantId;
      const { provider } = req.body;

      if (!['stripe', 'square', 'paypal', 'payjp'].includes(provider)) {
        return res.status(400).json({ error: '無効な決済プロバイダーです' });
      }

      // テナント設定を更新
      await prisma.tenantSetting.upsert({
        where: {
          tenantId_key: {
            tenantId,
            key: 'payment_provider'
          }
        },
        update: {
          value: provider
        },
        create: {
          tenantId,
          key: 'payment_provider',
          value: provider
        }
      });

      res.json({ success: true, provider });
    } catch (error) {
      logger.error('Update provider settings error:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
  }
}

export const paymentController = new PaymentController();