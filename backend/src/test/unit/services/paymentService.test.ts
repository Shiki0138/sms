import { PaymentService, IPaymentProvider } from '../../../services/paymentService';
import { PaymentRequest, PaymentResult, SubscriptionRequest, PaymentMethod } from '../../../types/payment';
import { PrismaClient } from '@prisma/client';

// モックプロバイダーの作成
class MockPaymentProvider implements IPaymentProvider {
  async createPayment(request: PaymentRequest): Promise<PaymentResult> {
    return {
      success: true,
      paymentId: 'test-payment-id'
    };
  }

  async createSubscription(request: SubscriptionRequest): Promise<PaymentResult> {
    return {
      success: true,
      paymentId: 'test-subscription-id'
    };
  }

  async cancelSubscription(subscriptionId: string): Promise<boolean> {
    return true;
  }

  async updateSubscription(subscriptionId: string, planId: string): Promise<boolean> {
    return true;
  }

  async retrievePaymentMethods(customerId: string): Promise<PaymentMethod[]> {
    return [
      {
        id: 'test-method-1',
        provider: 'stripe',
        type: 'card',
        last4: '4242',
        brand: 'visa',
        expiryMonth: 12,
        expiryYear: 2025,
        isDefault: true,
        createdAt: new Date()
      }
    ];
  }

  async createPaymentMethod(customerId: string, paymentData: any): Promise<PaymentMethod> {
    return {
      id: 'test-new-method',
      provider: 'stripe',
      type: 'card',
      last4: '1234',
      brand: 'mastercard',
      expiryMonth: 6,
      expiryYear: 2026,
      isDefault: false,
      createdAt: new Date()
    };
  }

  async handleWebhook(payload: string, signature: string): Promise<void> {
    // モックでは何もしない
  }
}

// Prismaクライアントのモック
const mockPrisma = {
  tenant: {
    findUnique: jest.fn(),
    update: jest.fn()
  },
  tenantSetting: {
    findMany: jest.fn()
  },
  payment: {
    create: jest.fn(),
    findMany: jest.fn()
  },
  subscription: {
    create: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn()
  },
  invoice: {
    findMany: jest.fn()
  }
};

// PrismaClientのモック
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma)
}));

describe('PaymentService', () => {
  let paymentService: PaymentService;
  let mockProvider: MockPaymentProvider;

  beforeEach(() => {
    jest.clearAllMocks();
    mockProvider = new MockPaymentProvider();
    
    // PaymentServiceのプライベートメソッドにアクセスするため、anyにキャスト
    paymentService = new PaymentService();
    (paymentService as any).providers = new Map([['stripe', mockProvider]]);
    
    // Prismaモックをグローバルに設定
    global.prisma = mockPrisma as any;
    (paymentService as any).prisma = mockPrisma;
  });

  describe('createPayment', () => {
    it('正常に支払いを作成できる', async () => {
      const tenantId = 'test-tenant-id';
      const paymentRequest: PaymentRequest = {
        amount: 1000,
        currency: 'JPY',
        description: 'Test payment',
        paymentMethodId: 'test-payment-method'
      };

      // テナントの決済プロバイダーを取得するモック
      mockPrisma.tenant.findUnique.mockResolvedValue({
        id: tenantId,
        settings: [{ key: 'payment_provider', value: 'stripe' }]
      });

      mockPrisma.payment.create.mockResolvedValue({
        id: 'created-payment-id'
      });

      const result = await paymentService.createPayment(tenantId, paymentRequest);

      expect(result.success).toBe(true);
      expect(result.paymentId).toBe('test-payment-id');
      expect(mockPrisma.payment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          tenantId,
          provider: 'stripe',
          providerPaymentId: 'test-payment-id',
          amount: 1000,
          currency: 'JPY',
          status: 'processing'
        })
      });
    });

    it('支払いプロバイダーが設定されていない場合のエラーハンドリング', async () => {
      const tenantId = 'test-tenant-id';
      const paymentRequest: PaymentRequest = {
        amount: 1000,
        currency: 'JPY',
        description: 'Test payment',
        paymentMethodId: 'test-payment-method'
      };

      // 無効なプロバイダーを返すモック
      mockPrisma.tenant.findUnique.mockResolvedValue({
        id: tenantId,
        settings: [{ key: 'payment_provider', value: 'invalid_provider' }]
      });

      const result = await paymentService.createPayment(tenantId, paymentRequest);

      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('not configured');
    });
  });

  describe('createSubscription', () => {
    it('正常にサブスクリプションを作成できる', async () => {
      const tenantId = 'test-tenant-id';
      const subscriptionRequest: SubscriptionRequest = {
        planId: 'standard',
        paymentMethodId: 'test-payment-method'
      };

      mockPrisma.tenant.findUnique.mockResolvedValue({
        id: tenantId,
        settings: [{ key: 'payment_provider', value: 'stripe' }]
      });

      mockPrisma.tenant.update.mockResolvedValue({});
      mockPrisma.subscription.create.mockResolvedValue({
        id: 'created-subscription-id'
      });

      const result = await paymentService.createSubscription(tenantId, subscriptionRequest);

      expect(result.success).toBe(true);
      expect(result.paymentId).toBe('test-subscription-id');
      
      // テナントのプランが更新されることを確認
      expect(mockPrisma.tenant.update).toHaveBeenCalledWith({
        where: { id: tenantId },
        data: { plan: 'standard' }
      });

      // サブスクリプションが作成されることを確認
      expect(mockPrisma.subscription.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          tenantId,
          planType: 'standard',
          provider: 'stripe',
          providerSubscriptionId: 'test-subscription-id',
          status: 'active'
        })
      });
    });
  });

  describe('cancelSubscription', () => {
    it('正常にサブスクリプションをキャンセルできる', async () => {
      const tenantId = 'test-tenant-id';
      
      // アクティブなサブスクリプションを見つけるモック
      mockPrisma.subscription.findFirst.mockResolvedValue({
        id: 'subscription-id',
        provider: 'stripe',
        providerSubscriptionId: 'provider-sub-id'
      });

      mockPrisma.subscription.update.mockResolvedValue({});

      const result = await paymentService.cancelSubscription(tenantId);

      expect(result).toBe(true);
      expect(mockPrisma.subscription.update).toHaveBeenCalledWith({
        where: { id: 'subscription-id' },
        data: {
          status: 'canceled',
          cancelAtPeriodEnd: true
        }
      });
    });

    it('アクティブなサブスクリプションが見つからない場合', async () => {
      const tenantId = 'test-tenant-id';
      
      mockPrisma.subscription.findFirst.mockResolvedValue(null);

      const result = await paymentService.cancelSubscription(tenantId);

      expect(result).toBe(false);
    });
  });

  describe('changePlan', () => {
    it('正常にプランを変更できる', async () => {
      const tenantId = 'test-tenant-id';
      const newPlanId = 'premium_ai';

      mockPrisma.subscription.findFirst.mockResolvedValue({
        id: 'subscription-id',
        provider: 'stripe',
        providerSubscriptionId: 'provider-sub-id'
      });

      mockPrisma.tenant.update.mockResolvedValue({});
      mockPrisma.subscription.update.mockResolvedValue({});

      const result = await paymentService.changePlan(tenantId, newPlanId);

      expect(result).toBe(true);
      expect(mockPrisma.tenant.update).toHaveBeenCalledWith({
        where: { id: tenantId },
        data: { plan: newPlanId }
      });
      expect(mockPrisma.subscription.update).toHaveBeenCalledWith({
        where: { id: 'subscription-id' },
        data: { planType: newPlanId }
      });
    });
  });

  describe('getPaymentMethods', () => {
    it('支払い方法一覧を取得できる', async () => {
      const tenantId = 'test-tenant-id';

      mockPrisma.tenant.findUnique.mockResolvedValue({
        id: tenantId,
        settings: [{ key: 'payment_provider', value: 'stripe' }]
      });

      const result = await paymentService.getPaymentMethods(tenantId);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'test-method-1',
        provider: 'stripe',
        type: 'card',
        last4: '4242',
        brand: 'visa'
      });
    });
  });

  describe('getTenantPaymentProvider', () => {
    it('テナントの決済プロバイダーを取得できる', async () => {
      const tenantId = 'test-tenant-id';

      mockPrisma.tenant.findUnique.mockResolvedValue({
        id: tenantId,
        settings: [{ key: 'payment_provider', value: 'square' }]
      });

      const result = await paymentService.getTenantPaymentProvider(tenantId);

      expect(result).toBe('square');
    });

    it('設定がない場合はデフォルトでstripeを返す', async () => {
      const tenantId = 'test-tenant-id';

      mockPrisma.tenant.findUnique.mockResolvedValue({
        id: tenantId,
        settings: []
      });

      const result = await paymentService.getTenantPaymentProvider(tenantId);

      expect(result).toBe('stripe');
    });
  });

  describe('エラーハンドリング', () => {
    it('データベースエラーが発生した場合の処理', async () => {
      const tenantId = 'test-tenant-id';
      const paymentRequest: PaymentRequest = {
        amount: 1000,
        currency: 'JPY',
        description: 'Test payment',
        paymentMethodId: 'test-payment-method'
      };

      mockPrisma.tenant.findUnique.mockRejectedValue(new Error('Database error'));

      const result = await paymentService.createPayment(tenantId, paymentRequest);

      expect(result.success).toBe(false);
      expect(result.errorMessage).toBe('Database error');
    });

    it('プロバイダーエラーが発生した場合の処理', async () => {
      const tenantId = 'test-tenant-id';
      const paymentRequest: PaymentRequest = {
        amount: 1000,
        currency: 'JPY',
        description: 'Test payment',
        paymentMethodId: 'test-payment-method'
      };

      // プロバイダーがエラーを返すモック
      const errorProvider = {
        ...mockProvider,
        createPayment: jest.fn().mockResolvedValue({
          success: false,
          errorMessage: 'Payment failed'
        })
      };

      (paymentService as any).providers.set('stripe', errorProvider);

      mockPrisma.tenant.findUnique.mockResolvedValue({
        id: tenantId,
        settings: [{ key: 'payment_provider', value: 'stripe' }]
      });

      const result = await paymentService.createPayment(tenantId, paymentRequest);

      expect(result.success).toBe(false);
      expect(result.errorMessage).toBe('Payment failed');
    });
  });
});