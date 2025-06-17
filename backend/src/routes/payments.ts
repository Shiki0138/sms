import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { paymentService } from '../services/paymentService';
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

// 単発支払い作成（初期費用など）
router.post('/payments', authenticateToken, async (req, res) => {
  try {
    const { amount, currency = 'JPY', description, paymentMethodId } = req.body;
    const tenantId = req.user!.tenantId;

    if (!amount || !description || !paymentMethodId) {
      return res.status(400).json({
        error: '必要な情報が不足しています'
      });
    }

    const result = await paymentService.createPayment(tenantId, {
      amount,
      currency,
      description,
      paymentMethodId,
      customerId: req.user!.id,
      metadata: {
        type: 'one_time_payment',
        userId: req.user!.id
      }
    });

    if (result.success) {
      res.json({
        success: true,
        paymentId: result.paymentId,
        requiresAction: result.requiresAction,
        clientSecret: result.clientSecret
      });
    } else {
      res.status(400).json({
        error: result.errorMessage || '支払いの作成に失敗しました'
      });
    }
  } catch (error) {
    logger.error('Payment creation error:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

// Webhook エンドポイント（各プロバイダー別）
router.post('/webhooks/:provider', async (req, res) => {
  try {
    const provider = req.params.provider as PaymentProvider;
    const signature = req.headers['stripe-signature'] || 
                     req.headers['x-square-signature'] || 
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

export default router;