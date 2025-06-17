import request from 'supertest';
import express from 'express';
import paymentsRouter from '../../../routes/payments';
import { authenticateToken } from '../../../middleware/auth';

// ミドルウェアとサービスをモック
jest.mock('../../../middleware/auth');
jest.mock('../../../services/paymentService');

const mockAuthenticateToken = authenticateToken as jest.MockedFunction<typeof authenticateToken>;

// PaymentServiceのモック
const mockPaymentService = {
  createSubscription: jest.fn(),
  createPayment: jest.fn(),
  cancelSubscription: jest.fn(),
  changePlan: jest.fn(),
  getPaymentMethods: jest.fn(),
  getInvoices: jest.fn(),
  handleWebhook: jest.fn()
};

jest.doMock('../../../services/paymentService', () => ({
  paymentService: mockPaymentService
}));

describe('Payments API Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    jest.clearAllMocks();
    
    app = express();
    app.use(express.json());
    
    // 認証ミドルウェアをモック（常に認証済みとして扱う）
    mockAuthenticateToken.mockImplementation((req: any, res: any, next: any) => {
      req.user = {
        id: 'test-user-id',
        tenantId: 'test-tenant-id',
        email: 'test@example.com'
      };
      next();
    });
    
    app.use('/api/v1/payments', paymentsRouter);
  });

  describe('POST /subscriptions', () => {
    it('正常にサブスクリプションを作成できる', async () => {
      const subscriptionData = {
        planId: 'standard',
        paymentMethodId: 'test-payment-method',
        trialPeriodDays: 14
      };

      mockPaymentService.createSubscription.mockResolvedValue({
        success: true,
        paymentId: 'test-subscription-id'
      });

      const response = await request(app)
        .post('/api/v1/payments/subscriptions')
        .send(subscriptionData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        subscriptionId: 'test-subscription-id',
        requiresAction: undefined,
        clientSecret: undefined
      });

      expect(mockPaymentService.createSubscription).toHaveBeenCalledWith(
        'test-tenant-id',
        {
          planId: 'standard',
          paymentMethodId: 'test-payment-method',
          trialPeriodDays: 14,
          metadata: {
            userId: 'test-user-id',
            createdFrom: 'web_app'
          }
        }
      );
    });

    it('必須フィールドが不足している場合はエラーを返す', async () => {
      const response = await request(app)
        .post('/api/v1/payments/subscriptions')
        .send({
          planId: 'standard'
          // paymentMethodIdが不足
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('プランIDと決済方法IDが必要です');
    });

    it('サブスクリプション作成が失敗した場合', async () => {
      const subscriptionData = {
        planId: 'standard',
        paymentMethodId: 'test-payment-method'
      };

      mockPaymentService.createSubscription.mockResolvedValue({
        success: false,
        errorMessage: 'Payment failed'
      });

      const response = await request(app)
        .post('/api/v1/payments/subscriptions')
        .send(subscriptionData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Payment failed');
    });

    it('決済にアクションが必要な場合', async () => {
      const subscriptionData = {
        planId: 'standard',
        paymentMethodId: 'test-payment-method'
      };

      mockPaymentService.createSubscription.mockResolvedValue({
        success: true,
        paymentId: 'test-subscription-id',
        requiresAction: true,
        clientSecret: 'test-client-secret'
      });

      const response = await request(app)
        .post('/api/v1/payments/subscriptions')
        .send(subscriptionData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        subscriptionId: 'test-subscription-id',
        requiresAction: true,
        clientSecret: 'test-client-secret'
      });
    });
  });

  describe('PATCH /subscriptions/plan', () => {
    it('正常にプランを変更できる', async () => {
      mockPaymentService.changePlan.mockResolvedValue(true);

      const response = await request(app)
        .patch('/api/v1/payments/subscriptions/plan')
        .send({ newPlanId: 'premium_ai' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
      expect(mockPaymentService.changePlan).toHaveBeenCalledWith(
        'test-tenant-id',
        'premium_ai'
      );
    });

    it('newPlanIdが不足している場合', async () => {
      const response = await request(app)
        .patch('/api/v1/payments/subscriptions/plan')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('新しいプランIDが必要です');
    });

    it('プラン変更が失敗した場合', async () => {
      mockPaymentService.changePlan.mockResolvedValue(false);

      const response = await request(app)
        .patch('/api/v1/payments/subscriptions/plan')
        .send({ newPlanId: 'premium_ai' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('プラン変更に失敗しました');
    });
  });

  describe('DELETE /subscriptions', () => {
    it('正常にサブスクリプションをキャンセルできる', async () => {
      mockPaymentService.cancelSubscription.mockResolvedValue(true);

      const response = await request(app)
        .delete('/api/v1/payments/subscriptions');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
      expect(mockPaymentService.cancelSubscription).toHaveBeenCalledWith('test-tenant-id');
    });

    it('キャンセルが失敗した場合', async () => {
      mockPaymentService.cancelSubscription.mockResolvedValue(false);

      const response = await request(app)
        .delete('/api/v1/payments/subscriptions');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('サブスクリプションのキャンセルに失敗しました');
    });
  });

  describe('GET /payment-methods', () => {
    it('支払い方法一覧を取得できる', async () => {
      const mockPaymentMethods = [
        {
          id: 'pm-1',
          provider: 'stripe',
          type: 'card',
          last4: '4242',
          brand: 'visa',
          isDefault: true
        }
      ];

      mockPaymentService.getPaymentMethods.mockResolvedValue(mockPaymentMethods);

      const response = await request(app)
        .get('/api/v1/payments/payment-methods');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockPaymentMethods);
      expect(mockPaymentService.getPaymentMethods).toHaveBeenCalledWith('test-tenant-id');
    });
  });

  describe('GET /invoices', () => {
    it('請求書一覧を取得できる', async () => {
      const mockInvoices = [
        {
          id: 'inv-1',
          amount: 28000,
          status: 'paid',
          periodStart: '2024-01-01',
          periodEnd: '2024-01-31'
        }
      ];

      mockPaymentService.getInvoices.mockResolvedValue(mockInvoices);

      const response = await request(app)
        .get('/api/v1/payments/invoices');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockInvoices);
      expect(mockPaymentService.getInvoices).toHaveBeenCalledWith('test-tenant-id');
    });
  });

  describe('POST /payments', () => {
    it('正常に単発支払いを作成できる', async () => {
      const paymentData = {
        amount: 5000,
        currency: 'JPY',
        description: '初期費用',
        paymentMethodId: 'test-payment-method'
      };

      mockPaymentService.createPayment.mockResolvedValue({
        success: true,
        paymentId: 'test-payment-id'
      });

      const response = await request(app)
        .post('/api/v1/payments/payments')
        .send(paymentData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        paymentId: 'test-payment-id',
        requiresAction: undefined,
        clientSecret: undefined
      });

      expect(mockPaymentService.createPayment).toHaveBeenCalledWith(
        'test-tenant-id',
        {
          amount: 5000,
          currency: 'JPY',
          description: '初期費用',
          paymentMethodId: 'test-payment-method',
          customerId: 'test-user-id',
          metadata: {
            type: 'one_time_payment',
            userId: 'test-user-id'
          }
        }
      );
    });

    it('必須フィールドが不足している場合', async () => {
      const response = await request(app)
        .post('/api/v1/payments/payments')
        .send({
          amount: 5000
          // description, paymentMethodIdが不足
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('必要な情報が不足しています');
    });
  });

  describe('POST /webhooks/:provider', () => {
    it('Stripeのwebhookを正常に処理できる', async () => {
      const webhookPayload = {
        id: 'evt_test',
        type: 'payment_intent.succeeded',
        data: { object: { id: 'pi_test' } }
      };

      mockPaymentService.handleWebhook.mockResolvedValue(undefined);

      const response = await request(app)
        .post('/api/v1/payments/webhooks/stripe')
        .set('stripe-signature', 'test-signature')
        .send(webhookPayload);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ received: true });
      expect(mockPaymentService.handleWebhook).toHaveBeenCalledWith(
        'stripe',
        JSON.stringify(webhookPayload),
        'test-signature'
      );
    });

    it('Squareのwebhookを正常に処理できる', async () => {
      const webhookPayload = {
        event_id: 'test-event',
        type: 'payment.updated'
      };

      mockPaymentService.handleWebhook.mockResolvedValue(undefined);

      const response = await request(app)
        .post('/api/v1/payments/webhooks/square')
        .set('x-square-signature', 'test-signature')
        .send(webhookPayload);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ received: true });
      expect(mockPaymentService.handleWebhook).toHaveBeenCalledWith(
        'square',
        JSON.stringify(webhookPayload),
        'test-signature'
      );
    });

    it('webhook処理でエラーが発生した場合', async () => {
      mockPaymentService.handleWebhook.mockRejectedValue(new Error('Webhook error'));

      const response = await request(app)
        .post('/api/v1/payments/webhooks/stripe')
        .set('stripe-signature', 'test-signature')
        .send({ test: 'data' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Webhook処理に失敗しました');
    });
  });

  describe('認証エラー', () => {
    it('認証されていない場合はエラーを返す', async () => {
      // 認証ミドルウェアを401エラーを返すようにモック
      mockAuthenticateToken.mockImplementation((req: any, res: any, next: any) => {
        res.status(401).json({ error: 'Unauthorized' });
      });

      const response = await request(app)
        .post('/api/v1/payments/subscriptions')
        .send({
          planId: 'standard',
          paymentMethodId: 'test-payment-method'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
    });
  });

  describe('サーバーエラー', () => {
    it('予期しないエラーが発生した場合', async () => {
      mockPaymentService.createSubscription.mockRejectedValue(new Error('Unexpected error'));

      const response = await request(app)
        .post('/api/v1/payments/subscriptions')
        .send({
          planId: 'standard',
          paymentMethodId: 'test-payment-method'
        });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('サーバーエラーが発生しました');
    });
  });
});