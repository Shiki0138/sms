import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { PaymentController } from '../controllers/paymentController';
import { logger } from '../utils/logger';

const router = express.Router();
const paymentController = new PaymentController();

// PaymentIntent作成エンドポイント
router.post('/create-intent', authenticateToken, async (req, res) => {
  await paymentController.createPaymentIntent(req, res);
});

// フォーム自動保存エンドポイント
router.post('/save-form', authenticateToken, async (req, res) => {
  try {
    const { customerId, reservationId, formData, encrypted } = req.body;
    const tenantId = req.user!.tenantId;

    res.json({
      success: true,
      message: 'フォームデータが保存されました'
    });
  } catch (error) {
    logger.error('Form save error:', error);
    res.status(500).json({ error: 'フォームデータの保存に失敗しました' });
  }
});

// 新規決済処理
router.post('/payments', authenticateToken, async (req, res) => {
  await paymentController.createPayment(req, res);
});

// 返金処理
router.post('/payments/:paymentId/refund', authenticateToken, async (req, res) => {
  await paymentController.refundPayment(req, res);
});

// 支払い状態確認
router.get('/payments/:paymentId', authenticateToken, async (req, res) => {
  await paymentController.checkPaymentStatus(req, res);
});

// 現在のサブスクリプション情報取得
router.get('/subscription', authenticateToken, async (req, res) => {
  await paymentController.getCurrentSubscription(req, res);
});

// 支払い履歴取得
router.get('/history', authenticateToken, async (req, res) => {
  await paymentController.getPaymentHistory(req, res);
});

// Stripe Webhook
router.post('/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  await paymentController.handleStripeWebhook(req, res);
});

export default router;