import { 
  PaymentRequest, 
  PaymentResult, 
  SubscriptionRequest, 
  PaymentMethod 
} from '../../types/payment';
import { IPaymentProvider } from '../paymentService';
import { Client, Environment } from 'squareup';
import { logger } from '../../utils/logger';

export class SquarePaymentProvider implements IPaymentProvider {
  private client: Client;

  constructor() {
    this.client = new Client({
      accessToken: process.env.SQUARE_ACCESS_TOKEN!,
      environment: process.env.SQUARE_ENVIRONMENT === 'production' 
        ? Environment.Production 
        : Environment.Sandbox
    });
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      const { paymentsApi } = this.client;
      
      const requestBody = {
        sourceId: request.paymentMethodId || 'cnon:card-nonce-ok', // デモ用ナンス
        amountMoney: {
          amount: BigInt(Math.round(request.amount)),
          currency: request.currency.toUpperCase()
        },
        note: request.description,
        referenceId: `salon-${Date.now()}`,
        idempotencyKey: `${request.customerId}-${Date.now()}`
      };

      const response = await paymentsApi.createPayment(requestBody);
      
      if (response.result.payment) {
        logger.info('Square payment created:', response.result.payment.id);
        return {
          success: true,
          paymentId: response.result.payment.id!
        };
      } else {
        throw new Error('Payment creation failed');
      }
    } catch (error: any) {
      logger.error('Square payment error:', error);
      return {
        success: false,
        errorMessage: error.message || 'Square payment failed'
      };
    }
  }

  async createSubscription(request: SubscriptionRequest): Promise<PaymentResult> {
    try {
      const { subscriptionsApi } = this.client;
      
      // Square Subscriptions用の設定
      const requestBody = {
        idempotencyKey: `sub-${Date.now()}`,
        locationId: process.env.SQUARE_LOCATION_ID!,
        planId: this.mapPlanToSquarePlan(request.planId),
        cardId: request.paymentMethodId,
        startDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
        timezone: 'Asia/Tokyo'
      };

      const response = await subscriptionsApi.createSubscription(requestBody);
      
      if (response.result.subscription) {
        logger.info('Square subscription created:', response.result.subscription.id);
        return {
          success: true,
          paymentId: response.result.subscription.id!
        };
      } else {
        throw new Error('Subscription creation failed');
      }
    } catch (error: any) {
      logger.error('Square subscription error:', error);
      return {
        success: false,
        errorMessage: error.message || 'Square subscription failed'
      };
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<boolean> {
    try {
      const { subscriptionsApi } = this.client;
      
      const response = await subscriptionsApi.cancelSubscription(
        subscriptionId,
        {}
      );
      
      return response.result.subscription?.status === 'CANCELED';
    } catch (error) {
      logger.error('Square subscription cancellation error:', error);
      return false;
    }
  }

  async updateSubscription(subscriptionId: string, planId: string): Promise<boolean> {
    try {
      const { subscriptionsApi } = this.client;
      
      const requestBody = {
        subscription: {
          planId: this.mapPlanToSquarePlan(planId)
        }
      };

      const response = await subscriptionsApi.updateSubscription(
        subscriptionId,
        requestBody
      );
      
      return !!response.result.subscription;
    } catch (error) {
      logger.error('Square subscription update error:', error);
      return false;
    }
  }

  async retrievePaymentMethods(customerId: string): Promise<PaymentMethod[]> {
    try {
      const { customersApi } = this.client;
      
      const response = await customersApi.retrieveCustomer(customerId);
      const customer = response.result.customer;
      
      if (!customer?.cards) {
        return [];
      }

      return customer.cards.map(card => ({
        id: card.id!,
        provider: 'square' as const,
        type: 'card' as const,
        last4: card.last4,
        brand: card.cardBrand?.toLowerCase(),
        expiryMonth: card.expMonth ? parseInt(card.expMonth) : undefined,
        expiryYear: card.expYear ? parseInt(card.expYear) : undefined,
        isDefault: false, // Square doesn't have default card concept
        createdAt: new Date()
      }));
    } catch (error) {
      logger.error('Square payment methods retrieval error:', error);
      return [];
    }
  }

  async createPaymentMethod(customerId: string, paymentData: any): Promise<PaymentMethod> {
    try {
      const { customersApi } = this.client;
      
      const requestBody = {
        cardNonce: paymentData.nonce
      };

      const response = await customersApi.createCustomerCard(customerId, requestBody);
      const card = response.result.card!;
      
      return {
        id: card.id!,
        provider: 'square' as const,
        type: 'card' as const,
        last4: card.last4,
        brand: card.cardBrand?.toLowerCase(),
        expiryMonth: card.expMonth ? parseInt(card.expMonth) : undefined,
        expiryYear: card.expYear ? parseInt(card.expYear) : undefined,
        isDefault: false,
        createdAt: new Date()
      };
    } catch (error) {
      logger.error('Square payment method creation error:', error);
      throw error;
    }
  }

  async handleWebhook(payload: string, signature: string): Promise<void> {
    try {
      // Square Webhook署名検証
      const webhookSignatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY!;
      
      // 実際の実装では、Square SDK のWebhook検証機能を使用
      // const isValid = await this.verifyWebhookSignature(payload, signature, webhookSignatureKey);
      
      const event = JSON.parse(payload);
      
      logger.info('Square webhook received:', {
        eventType: event.type,
        eventId: event.event_id
      });

      // イベントタイプに応じた処理
      switch (event.type) {
        case 'payment.updated':
          await this.handlePaymentUpdated(event.data);
          break;
        case 'subscription.updated':
          await this.handleSubscriptionUpdated(event.data);
          break;
        case 'invoice.payment_made':
          await this.handleInvoicePaymentMade(event.data);
          break;
        default:
          logger.info(`Unhandled Square webhook event: ${event.type}`);
      }
    } catch (error) {
      logger.error('Square webhook handling error:', error);
      throw error;
    }
  }

  private mapPlanToSquarePlan(planId: string): string {
    // Square Catalogで設定したプランIDにマッピング
    const planMapping: Record<string, string> = {
      'light': process.env.SQUARE_LIGHT_PLAN_ID || 'light-plan-id',
      'standard': process.env.SQUARE_STANDARD_PLAN_ID || 'standard-plan-id',
      'premium_ai': process.env.SQUARE_PREMIUM_PLAN_ID || 'premium-plan-id'
    };
    
    return planMapping[planId] || planMapping['light'];
  }

  private async handlePaymentUpdated(data: any): Promise<void> {
    // 支払い状態の更新処理
    logger.info('Processing payment update:', data);
  }

  private async handleSubscriptionUpdated(data: any): Promise<void> {
    // サブスクリプション状態の更新処理
    logger.info('Processing subscription update:', data);
  }

  private async handleInvoicePaymentMade(data: any): Promise<void> {
    // 請求書支払い完了処理
    logger.info('Processing invoice payment:', data);
  }
}