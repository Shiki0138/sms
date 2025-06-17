import { SquarePaymentProvider } from '../../../../services/payments/squareProvider';
import { PaymentRequest, SubscriptionRequest } from '../../../../types/payment';

// Square SDKのモック
jest.mock('squareup', () => ({
  Client: jest.fn().mockImplementation(() => ({
    paymentsApi: {
      createPayment: jest.fn()
    },
    subscriptionsApi: {
      createSubscription: jest.fn(),
      cancelSubscription: jest.fn(),
      updateSubscription: jest.fn()
    },
    customersApi: {
      retrieveCustomer: jest.fn(),
      createCustomerCard: jest.fn()
    }
  })),
  Environment: {
    Production: 'production',
    Sandbox: 'sandbox'
  }
}));

describe('SquarePaymentProvider', () => {
  let squareProvider: SquarePaymentProvider;
  let mockClient: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // 環境変数をモック
    process.env.SQUARE_ACCESS_TOKEN = 'test-access-token';
    process.env.SQUARE_ENVIRONMENT = 'sandbox';
    process.env.SQUARE_LOCATION_ID = 'test-location-id';
    
    squareProvider = new SquarePaymentProvider();
    mockClient = (squareProvider as any).client;
  });

  afterEach(() => {
    delete process.env.SQUARE_ACCESS_TOKEN;
    delete process.env.SQUARE_ENVIRONMENT;
    delete process.env.SQUARE_LOCATION_ID;
  });

  describe('createPayment', () => {
    it('正常に支払いを作成できる', async () => {
      const paymentRequest: PaymentRequest = {
        amount: 1000,
        currency: 'JPY',
        description: 'Test payment',
        paymentMethodId: 'test-payment-method',
        customerId: 'test-customer'
      };

      // Squareの成功レスポンスをモック
      mockClient.paymentsApi.createPayment.mockResolvedValue({
        result: {
          payment: {
            id: 'square-payment-id',
            status: 'COMPLETED'
          }
        }
      });

      const result = await squareProvider.createPayment(paymentRequest);

      expect(result.success).toBe(true);
      expect(result.paymentId).toBe('square-payment-id');
      expect(mockClient.paymentsApi.createPayment).toHaveBeenCalledWith({
        sourceId: 'test-payment-method',
        amountMoney: {
          amount: BigInt(1000),
          currency: 'JPY'
        },
        note: 'Test payment',
        referenceId: expect.stringMatching(/^salon-\d+$/),
        idempotencyKey: expect.stringContaining('test-customer-')
      });
    });

    it('支払いが失敗した場合のエラーハンドリング', async () => {
      const paymentRequest: PaymentRequest = {
        amount: 1000,
        currency: 'JPY',
        description: 'Test payment',
        paymentMethodId: 'test-payment-method'
      };

      // Squareのエラーレスポンスをモック
      mockClient.paymentsApi.createPayment.mockRejectedValue(
        new Error('Payment declined')
      );

      const result = await squareProvider.createPayment(paymentRequest);

      expect(result.success).toBe(false);
      expect(result.errorMessage).toBe('Payment declined');
    });

    it('支払い結果が空の場合のエラーハンドリング', async () => {
      const paymentRequest: PaymentRequest = {
        amount: 1000,
        currency: 'JPY',
        description: 'Test payment',
        paymentMethodId: 'test-payment-method'
      };

      // 空の結果をモック
      mockClient.paymentsApi.createPayment.mockResolvedValue({
        result: {}
      });

      const result = await squareProvider.createPayment(paymentRequest);

      expect(result.success).toBe(false);
      expect(result.errorMessage).toBe('Payment creation failed');
    });
  });

  describe('createSubscription', () => {
    it('正常にサブスクリプションを作成できる', async () => {
      const subscriptionRequest: SubscriptionRequest = {
        planId: 'standard',
        paymentMethodId: 'test-card-id',
        customerId: 'test-customer'
      };

      mockClient.subscriptionsApi.createSubscription.mockResolvedValue({
        result: {
          subscription: {
            id: 'square-subscription-id',
            status: 'ACTIVE'
          }
        }
      });

      const result = await squareProvider.createSubscription(subscriptionRequest);

      expect(result.success).toBe(true);
      expect(result.paymentId).toBe('square-subscription-id');
      expect(mockClient.subscriptionsApi.createSubscription).toHaveBeenCalledWith({
        idempotencyKey: expect.stringMatching(/^sub-\d+$/),
        locationId: 'test-location-id',
        planId: expect.any(String), // プランマッピング後の値
        cardId: 'test-card-id',
        startDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
        timezone: 'Asia/Tokyo'
      });
    });

    it('サブスクリプション作成が失敗した場合', async () => {
      const subscriptionRequest: SubscriptionRequest = {
        planId: 'standard',
        paymentMethodId: 'test-card-id'
      };

      mockClient.subscriptionsApi.createSubscription.mockRejectedValue(
        new Error('Subscription creation failed')
      );

      const result = await squareProvider.createSubscription(subscriptionRequest);

      expect(result.success).toBe(false);
      expect(result.errorMessage).toBe('Subscription creation failed');
    });
  });

  describe('cancelSubscription', () => {
    it('正常にサブスクリプションをキャンセルできる', async () => {
      const subscriptionId = 'test-subscription-id';

      mockClient.subscriptionsApi.cancelSubscription.mockResolvedValue({
        result: {
          subscription: {
            status: 'CANCELED'
          }
        }
      });

      const result = await squareProvider.cancelSubscription(subscriptionId);

      expect(result).toBe(true);
      expect(mockClient.subscriptionsApi.cancelSubscription).toHaveBeenCalledWith(
        subscriptionId,
        {}
      );
    });

    it('キャンセルが失敗した場合', async () => {
      const subscriptionId = 'test-subscription-id';

      mockClient.subscriptionsApi.cancelSubscription.mockRejectedValue(
        new Error('Cancellation failed')
      );

      const result = await squareProvider.cancelSubscription(subscriptionId);

      expect(result).toBe(false);
    });
  });

  describe('updateSubscription', () => {
    it('正常にサブスクリプションを更新できる', async () => {
      const subscriptionId = 'test-subscription-id';
      const newPlanId = 'premium_ai';

      mockClient.subscriptionsApi.updateSubscription.mockResolvedValue({
        result: {
          subscription: {
            id: subscriptionId,
            status: 'ACTIVE'
          }
        }
      });

      const result = await squareProvider.updateSubscription(subscriptionId, newPlanId);

      expect(result).toBe(true);
      expect(mockClient.subscriptionsApi.updateSubscription).toHaveBeenCalledWith(
        subscriptionId,
        {
          subscription: {
            planId: expect.any(String) // マッピング後のプランID
          }
        }
      );
    });
  });

  describe('retrievePaymentMethods', () => {
    it('顧客の支払い方法を取得できる', async () => {
      const customerId = 'test-customer-id';

      mockClient.customersApi.retrieveCustomer.mockResolvedValue({
        result: {
          customer: {
            cards: [
              {
                id: 'card-1',
                last4: '4242',
                cardBrand: 'VISA',
                expMonth: '12',
                expYear: '2025'
              },
              {
                id: 'card-2',
                last4: '1234',
                cardBrand: 'MASTERCARD',
                expMonth: '6',
                expYear: '2026'
              }
            ]
          }
        }
      });

      const result = await squareProvider.retrievePaymentMethods(customerId);

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: 'card-1',
        provider: 'square',
        type: 'card',
        last4: '4242',
        brand: 'visa',
        expiryMonth: 12,
        expiryYear: 2025,
        isDefault: false
      });
    });

    it('顧客にカードがない場合は空配列を返す', async () => {
      const customerId = 'test-customer-id';

      mockClient.customersApi.retrieveCustomer.mockResolvedValue({
        result: {
          customer: {
            cards: null
          }
        }
      });

      const result = await squareProvider.retrievePaymentMethods(customerId);

      expect(result).toEqual([]);
    });

    it('顧客が見つからない場合のエラーハンドリング', async () => {
      const customerId = 'test-customer-id';

      mockClient.customersApi.retrieveCustomer.mockRejectedValue(
        new Error('Customer not found')
      );

      const result = await squareProvider.retrievePaymentMethods(customerId);

      expect(result).toEqual([]);
    });
  });

  describe('createPaymentMethod', () => {
    it('新しい支払い方法を作成できる', async () => {
      const customerId = 'test-customer-id';
      const paymentData = {
        nonce: 'card-nonce-123'
      };

      mockClient.customersApi.createCustomerCard.mockResolvedValue({
        result: {
          card: {
            id: 'new-card-id',
            last4: '5678',
            cardBrand: 'AMEX',
            expMonth: '9',
            expYear: '2027'
          }
        }
      });

      const result = await squareProvider.createPaymentMethod(customerId, paymentData);

      expect(result).toMatchObject({
        id: 'new-card-id',
        provider: 'square',
        type: 'card',
        last4: '5678',
        brand: 'amex',
        expiryMonth: 9,
        expiryYear: 2027,
        isDefault: false
      });

      expect(mockClient.customersApi.createCustomerCard).toHaveBeenCalledWith(
        customerId,
        { cardNonce: 'card-nonce-123' }
      );
    });
  });

  describe('handleWebhook', () => {
    it('正常にwebhookを処理できる', async () => {
      const payload = JSON.stringify({
        type: 'payment.updated',
        event_id: 'test-event-id',
        data: {
          id: 'payment-id',
          status: 'COMPLETED'
        }
      });
      const signature = 'test-signature';

      // handleWebhookは例外を投げないことを確認
      await expect(
        squareProvider.handleWebhook(payload, signature)
      ).resolves.not.toThrow();
    });

    it('無効なJSONの場合はエラーを投げる', async () => {
      const payload = 'invalid-json';
      const signature = 'test-signature';

      await expect(
        squareProvider.handleWebhook(payload, signature)
      ).rejects.toThrow();
    });
  });

  describe('プランマッピング', () => {
    it('プランIDを正しくSquareのプランIDにマッピングする', () => {
      // プライベートメソッドをテストするため、anyでキャスト
      const provider = squareProvider as any;
      
      expect(provider.mapPlanToSquarePlan('light')).toBe('light-plan-id');
      expect(provider.mapPlanToSquarePlan('standard')).toBe('standard-plan-id');
      expect(provider.mapPlanToSquarePlan('premium_ai')).toBe('premium-plan-id');
      expect(provider.mapPlanToSquarePlan('unknown')).toBe('light-plan-id'); // デフォルト
    });
  });
});