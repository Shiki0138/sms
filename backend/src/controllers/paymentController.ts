import { Response } from 'express';
import { AuthenticatedRequest } from '../types/auth';
import { paymentService } from '../services/paymentService';
import { logger } from '../utils/logger';
import { PrismaClient } from '@prisma/client';
import { PaymentProvider } from '../types/payment';

const prisma = new PrismaClient();

export class PaymentController {

  // PaymentIntent作成
  async createPaymentIntent(req: AuthenticatedRequest, res: Response) {
    try {
      const { amount, currency = 'jpy', customerId, reservationId, paymentMethod = 'card', metadata = {} } = req.body;
      const tenantId = req.user!.tenantId;

      if (!amount || amount <= 0) {
        return res.status(400).json({
          error: '有効な金額が必要です'
        });
      }

      // 決済リクエストを作成
      const paymentRequest = {
        amount,
        currency,
        customerId,
        paymentMethodId: paymentMethod,
        description: metadata.description || `予約ID: ${reservationId}`,
        metadata: {
          ...metadata,
          tenantId,
          reservationId,
          customerId
        }
      };

      // 決済サービスを使用して処理
      const result = await paymentService.createPayment(paymentRequest);

      if (result.success) {
        res.json({
          success: true,
          clientSecret: result.clientSecret,
          paymentId: result.paymentId,
          requiresAction: result.requiresAction || false
        });
      } else {
        res.status(400).json({
          error: result.errorMessage || '決済処理に失敗しました',
          errorCode: result.errorCode
        });
      }
    } catch (error) {
      logger.error('PaymentIntent creation error:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
  }


  // 返金処理
  async refundPayment(req: AuthenticatedRequest, res: Response) {
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

      // 返金可能な状態かチェック
      if (payment.status !== 'succeeded') {
        return res.status(400).json({ error: '返金可能な決済ではありません' });
      }

      // 部分返金の場合、金額チェック
      if (amount && amount > payment.amount) {
        return res.status(400).json({ error: '返金額が決済額を超えています' });
      }

      // 決済サービスを使用して返金処理
      const result = await paymentService.refundPayment(
        payment.providerPaymentId,
        amount,
        reason
      );

      if (result.success) {
        // 返金記録を保存
        await prisma.refund.create({
          data: {
            paymentId: payment.id,
            amount: result.amount || amount || payment.amount,
            reason,
            status: 'succeeded',
            providerRefundId: result.paymentId || '',
            tenantId
          }
        });

        // 元の決済の状態を更新
        if (!amount || amount === payment.amount) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: { status: 'refunded' }
          });
        } else {
          await prisma.payment.update({
            where: { id: payment.id },
            data: { status: 'partially_refunded' }
          });
        }

        res.json({
          success: true,
          refundId: result.paymentId,
          amount: result.amount
        });
      } else {
        res.status(400).json({
          error: result.errorMessage || '返金処理に失敗しました'
        });
      }
    } catch (error) {
      logger.error('Payment refund error:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
  }

  // Stripe Webhook処理
  async handleStripeWebhook(req: AuthenticatedRequest, res: Response) {
    try {
      const signature = req.headers['stripe-signature'] as string;
      
      if (!signature) {
        return res.status(400).json({ error: 'Missing stripe signature' });
      }

      // 決済サービスのStripeプロバイダーを取得してWebhook処理
      const stripeProvider = paymentService.getProvider('stripe');
      if (stripeProvider && 'handleWebhook' in stripeProvider) {
        await stripeProvider.handleWebhook(req.body, signature);
        res.json({ received: true });
      } else {
        res.status(400).json({ error: 'Stripe provider not configured' });
      }
    } catch (error: any) {
      logger.error('Stripe webhook error:', error);
      
      // Stripe署名検証エラーの場合は400を返す
      if (error.type === 'StripeSignatureVerificationError') {
        return res.status(400).json({ error: 'Invalid signature' });
      }
      
      res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
  }

  // 新規決済処理
  async createPayment(req: AuthenticatedRequest, res: Response) {
    try {
      const { amount, customerId, reservationId, paymentMethodId, description, metadata = {} } = req.body;
      const tenantId = req.user!.tenantId;

      if (!amount || amount <= 0) {
        return res.status(400).json({ error: '有効な金額が必要です' });
      }

      if (!customerId) {
        return res.status(400).json({ error: '顧客IDが必要です' });
      }

      if (!paymentMethodId) {
        return res.status(400).json({ error: '決済方法が必要です' });
      }

      // 決済リクエストを作成
      const paymentRequest = {
        amount,
        currency: 'jpy',
        customerId,
        paymentMethodId,
        description: description || `予約ID: ${reservationId}`,
        metadata: {
          ...metadata,
          tenantId,
          reservationId,
          customerId
        }
      };

      // 決済処理を実行
      const result = await paymentService.createPayment(paymentRequest);

      if (result.success) {
        // 決済成功時、予約の支払い状態を更新
        if (reservationId) {
          await prisma.reservation.update({
            where: { id: reservationId },
            data: { 
              paymentStatus: 'paid',
              paymentId: result.paymentId
            }
          });
        }

        res.json({
          success: true,
          paymentId: result.paymentId,
          amount: result.amount,
          message: result.message || '決済が完了しました'
        });
      } else {
        res.status(400).json({
          error: result.errorMessage || '決済処理に失敗しました',
          errorCode: result.errorCode,
          requiresAction: result.requiresAction,
          clientSecret: result.clientSecret
        });
      }
    } catch (error) {
      logger.error('Payment creation error:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
  }

  // 支払い状態確認
  async checkPaymentStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { paymentId } = req.params;
      const tenantId = req.user!.tenantId;
      
      // データベースから決済情報を取得
      const payment = await prisma.payment.findFirst({
        where: {
          OR: [
            { id: paymentId },
            { providerPaymentId: paymentId }
          ],
          tenantId
        },
      });

      if (!payment) {
        return res.status(404).json({ error: '決済情報が見つかりません' });
      }

      // 返金額の合計を計算
      const refunds = await prisma.refund.findMany({
        where: { paymentId: payment.id }
      });
      
      const totalRefunded = refunds.reduce((sum, refund) => {
        if (refund.status === 'succeeded') {
          return sum + refund.amount;
        }
        return sum;
      }, 0);

      res.json({
        success: true,
        paymentId: payment.id,
        providerPaymentId: payment.providerPaymentId,
        status: payment.status,
        amount: payment.amount,
        refundedAmount: totalRefunded,
        currency: payment.currency,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt
      });
    } catch (error) {
      logger.error('Payment status check error:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
  }

  // 現在のサブスクリプション情報を取得
  async getCurrentSubscription(req: AuthenticatedRequest, res: Response) {
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
  async getPaymentHistory(req: AuthenticatedRequest, res: Response) {
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
  async getUsageInfo(req: AuthenticatedRequest, res: Response) {
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
  async getAvailableFeatures(req: AuthenticatedRequest, res: Response) {
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
  async getProviderSettings(req: AuthenticatedRequest, res: Response) {
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
  async updateProviderSettings(req: AuthenticatedRequest, res: Response) {
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
