import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { paymentService } from '../services/paymentService';
import { paymentController } from '../controllers/paymentController';
import { logger } from '../utils/logger';
import { PaymentProvider } from '../types/payment';

const router = express.Router();

// サブスクリプション作成
router.post('/subscriptions', authenticateToken, async (req, res) => {
  try {
    const { planId, paymentMethodId, trialPeriodDays } = req.body;
    const tenantId = req.user!.tenantId;

    if (!planId || !paymentMethodId) {
      return res.status(400).json({
        error: 'プランIDと決済方法IDが必要です'
      });
    }

    const result = await paymentService.createSubscription(tenantId, {
      planId,
      paymentMethodId,
      trialPeriodDays,
      metadata: {
        userId: req.user!.id,
        createdFrom: 'web_app'
      }
    });

    if (result.success) {
      res.json({
        success: true,
        subscriptionId: result.paymentId,
        requiresAction: result.requiresAction,
        clientSecret: result.clientSecret
      });
    } else {
      res.status(400).json({
        error: result.errorMessage || 'サブスクリプションの作成に失敗しました'
      });
    }
  } catch (error) {
    logger.error('Subscription creation error:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

// プラン変更
router.patch('/subscriptions/plan', authenticateToken, async (req, res) => {
  try {
    const { newPlanId } = req.body;
    const tenantId = req.user!.tenantId;

    if (!newPlanId) {
      return res.status(400).json({
        error: '新しいプランIDが必要です'
      });
    }

    const success = await paymentService.changePlan(tenantId, newPlanId);

    if (success) {
      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'プラン変更に失敗しました' });
    }
  } catch (error) {
    logger.error('Plan change error:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

// サブスクリプションキャンセル
router.delete('/subscriptions', authenticateToken, async (req, res) => {
  try {
    const tenantId = req.user!.tenantId;
    
    const success = await paymentService.cancelSubscription(tenantId);

    if (success) {
      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'サブスクリプションのキャンセルに失敗しました' });
    }
  } catch (error) {
    logger.error('Subscription cancellation error:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

// 支払い方法一覧取得
router.get('/payment-methods', authenticateToken, async (req, res) => {
  try {
    const tenantId = req.user!.tenantId;
    
    const paymentMethods = await paymentService.getPaymentMethods(tenantId);
    
    res.json(paymentMethods);
  } catch (error) {
    logger.error('Payment methods retrieval error:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

// 請求書一覧取得
router.get('/invoices', authenticateToken, async (req, res) => {
  try {
    const tenantId = req.user!.tenantId;
    
    const invoices = await paymentService.getInvoices(tenantId);
    
    res.json(invoices);
  } catch (error) {
    logger.error('Invoices retrieval error:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

// 新規決済処理（予約時決済、単発支払いなど）
router.post('/payments', authenticateToken, paymentController.createPayment.bind(paymentController));

// 返金処理
router.post('/payments/:paymentId/refund', authenticateToken, paymentController.refundPayment.bind(paymentController));

// 支払い状態確認
router.get('/payments/:paymentId', authenticateToken, paymentController.checkPaymentStatus.bind(paymentController));

// 現在のサブスクリプション情報取得
router.get('/subscription', authenticateToken, paymentController.getCurrentSubscription.bind(paymentController));

// 支払い履歴取得
router.get('/history', authenticateToken, paymentController.getPaymentHistory.bind(paymentController));

// 使用量情報取得
router.get('/usage', authenticateToken, paymentController.getUsageInfo.bind(paymentController));

// 利用可能な機能取得
router.get('/features', authenticateToken, paymentController.getAvailableFeatures.bind(paymentController));

// 決済プロバイダー設定
router.get('/provider', authenticateToken, paymentController.getProviderSettings.bind(paymentController));
router.put('/provider', authenticateToken, paymentController.updateProviderSettings.bind(paymentController));

// 予約時特化支払いエンドポイント
router.post('/reservations/:reservationId/payment', authenticateToken, async (req, res) => {
  try {
    const { amount, paymentMethodId, paymentType = 'full' } = req.body;
    const { reservationId } = req.params;
    const tenantId = req.user!.tenantId;

    // 予約の存在確認
    const prisma = new (await import('@prisma/client')).PrismaClient();
    const reservation = await prisma.reservation.findFirst({
      where: {
        id: reservationId,
        tenantId
      },
      include: {
        customer: true,
        menu: true
      }
    });

    if (!reservation) {
      return res.status(404).json({ error: '予約が見つかりません' });
    }

    if (reservation.paymentStatus === 'paid') {
      return res.status(400).json({ error: 'この予約は既に支払い済みです' });
    }

    // 金額検証（メニュー料金と一致するか）
    const menuPrice = reservation.menu?.price || 0;
    if (paymentType === 'full' && amount !== menuPrice) {
      return res.status(400).json({ error: '支払い金額がメニュー料金と一致しません' });
    }

    if (paymentType === 'deposit' && amount > menuPrice) {
      return res.status(400).json({ error: '前払い金額がメニュー料金を超えています' });
    }

    // PaymentControllerのメソッドを使用
    req.body.reservationId = reservationId;
    req.body.description = `${reservation.menu?.name || '美容室サービス'} - ${paymentType === 'full' ? '全額支払い' : '前払い'}`;
    
    await paymentController.createPayment(req, res);
    
    await prisma.$disconnect();
  } catch (error) {
    logger.error('Reservation payment error:', error);
    res.status(500).json({ error: '予約支払い処理中にエラーが発生しました' });
  }
});

// 予約キャンセル時返金処理
router.post('/reservations/:reservationId/cancel', authenticateToken, async (req, res) => {
  try {
    const { reservationId } = req.params;
    const { reason = 'お客様都合によるキャンセル' } = req.body;
    const tenantId = req.user!.tenantId;

    // 予約の存在確認と支払い情報取得
    const prisma = new (await import('@prisma/client')).PrismaClient();
    const reservation = await prisma.reservation.findFirst({
      where: {
        id: reservationId,
        tenantId
      }
    });

    if (!reservation) {
      return res.status(404).json({ error: '予約が見つかりません' });
    }

    if (reservation.paymentStatus !== 'paid' || !reservation.paymentId) {
      return res.status(400).json({ error: '返金対象の支払いがありません' });
    }

    // キャンセル時刻チェック（キャンセルポリシー適用）
    const now = new Date();
    const startTime = new Date(reservation.startTime);
    const hoursUntilStart = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    let refundAmount = reservation.totalAmount;
    let refundReason = reason;

    // キャンセル料金ポリシー適用
    if (hoursUntilStart < 24) {
      refundAmount = refundAmount * 0.5; // 24時間前は50%返金
      refundReason += ' (24時間前キャンセルのため50%返金)';
    } else if (hoursUntilStart < 48) {
      refundAmount = refundAmount * 0.8; // 48時間前は80%返金
      refundReason += ' (48時間前キャンセルのため80%返金)';
    }

    // 返金処理実行
    req.params.paymentId = reservation.paymentId;
    req.body.amount = refundAmount;
    req.body.reason = refundReason;

    await paymentController.refundPayment(req, res);
    
    // 予約状態をキャンセルに更新
    await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        status: 'cancelled',
        paymentStatus: 'refunded',
        updatedAt: new Date()
      }
    });
    
    await prisma.$disconnect();
  } catch (error) {
    logger.error('Reservation cancellation error:', error);
    res.status(500).json({ error: '予約キャンセル処理中にエラーが発生しました' });
  }
});

// Stripe Webhookエンドポイント
router.post('/webhooks/stripe', express.raw({ type: 'application/json' }), paymentController.handleStripeWebhook.bind(paymentController));

// 他のプロバイダーのWebhookエンドポイント（将来拡張用）
router.post('/webhooks/:provider', async (req, res) => {
  try {
    const provider = req.params.provider as PaymentProvider;
    
    if (provider === 'stripe') {
      // Stripeは専用エンドポイントを使用
      return res.status(400).json({ error: 'Use /webhooks/stripe endpoint for Stripe webhooks' });
    }
    
    const signature = req.headers['x-square-signature'] || 
                     req.headers['paypal-transmission-sig'] ||
                     req.headers['x-payjp-signature'] || '';
    
    const payload = req.body;

    await paymentService.handleWebhook(
      provider,
      typeof payload === 'string' ? payload : JSON.stringify(payload),
      signature as string
    );

    res.status(200).json({ received: true });
  } catch (error) {
    logger.error('Webhook handling error:', error);
    res.status(400).json({ error: 'Webhook処理に失敗しました' });
  }
});

// 決済システム統計情報
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const { startDate, endDate } = req.query;

    const prisma = new (await import('@prisma/client')).PrismaClient();
    
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    const [totalRevenue, paymentCount, refundAmount, successRate] = await Promise.all([
      // 総売上
      prisma.payment.aggregate({
        where: {
          tenantId,
          status: 'succeeded',
          createdAt: { gte: start, lte: end }
        },
        _sum: { amount: true }
      }),
      // 支払い回数
      prisma.payment.count({
        where: {
          tenantId,
          status: 'succeeded',
          createdAt: { gte: start, lte: end }
        }
      }),
      // 返金額
      prisma.payment.aggregate({
        where: {
          tenantId,
          status: 'refunded',
          createdAt: { gte: start, lte: end }
        },
        _sum: { amount: true }
      }),
      // 成功率計算用データ
      prisma.payment.groupBy({
        by: ['status'],
        where: {
          tenantId,
          createdAt: { gte: start, lte: end }
        },
        _count: true
      })
    ]);

    const totalAttempts = successRate.reduce((sum, group) => sum + group._count, 0);
    const successfulPayments = successRate.find(group => group.status === 'succeeded')?._count || 0;
    const calculatedSuccessRate = totalAttempts > 0 ? (successfulPayments / totalAttempts) * 100 : 0;

    await prisma.$disconnect();

    res.json({
      period: { start, end },
      totalRevenue: totalRevenue._sum.amount || 0,
      paymentCount,
      refundAmount: refundAmount._sum.amount || 0,
      successRate: Math.round(calculatedSuccessRate * 100) / 100,
      netRevenue: (totalRevenue._sum.amount || 0) - (refundAmount._sum.amount || 0)
    });
  } catch (error) {
    logger.error('Payment analytics error:', error);
    res.status(500).json({ error: '統計情報の取得に失敗しました' });
  }
});

export default router;