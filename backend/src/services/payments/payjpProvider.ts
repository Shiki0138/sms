import { 
  PaymentRequest, 
  PaymentResult, 
  SubscriptionRequest, 
  PaymentMethod 
} from '../../types/payment';
import { IPaymentProvider } from '../paymentService';
import { logger } from '../../utils/logger';

export class PayjpPaymentProvider implements IPaymentProvider {
  private baseURL = 'https://api.pay.jp/v1';
  private secretKey: string;

  constructor() {
    this.secretKey = process.env.PAYJP_SECRET_KEY!;
  }

  private async makeRequest(endpoint: string, method: 'GET' | 'POST' | 'DELETE', data?: any): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;
    const credentials = Buffer.from(`${this.secretKey}:`).toString('base64');
    
    const headers: Record<string, string> = {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    let body: string | undefined;
    if (data && method !== 'GET') {
      body = new URLSearchParams(data).toString();
    }

    const response = await fetch(url, {
      method,
      headers,
      body
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error?.message || 'Pay.jp API error');
    }

    return result;
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      const chargeData = {
        amount: Math.round(request.amount),
        currency: request.currency.toLowerCase(),
        description: request.description,
        card: request.paymentMethodId || 'tok_test_visa', // デモ用トークン
        customer: request.customerId
      };

      const charge = await this.makeRequest('/charges', 'POST', chargeData);
      
      if (charge.paid) {
        logger.info('Pay.jp charge created:', charge.id);
        return {
          success: true,
          paymentId: charge.id
        };
      } else {
        throw new Error('Charge was not paid');
      }
    } catch (error: any) {
      logger.error('Pay.jp payment error:', error);
      return {
        success: false,
        errorMessage: error.message || 'Pay.jp payment failed'
      };
    }
  }

  async createSubscription(request: SubscriptionRequest): Promise<PaymentResult> {
    try {
      const planId = this.mapPlanToPayjpPlan(request.planId);
      
      const subscriptionData = {
        customer: request.customerId || (await this.createCustomer()),
        plan: planId,
        card: request.paymentMethodId,
        trial_end: request.trialPeriodDays 
          ? Math.floor((Date.now() + request.trialPeriodDays * 24 * 60 * 60 * 1000) / 1000)
          : undefined
      };

      const subscription = await this.makeRequest('/subscriptions', 'POST', subscriptionData);
      
      logger.info('Pay.jp subscription created:', subscription.id);
      return {
        success: true,
        paymentId: subscription.id
      };
    } catch (error: any) {
      logger.error('Pay.jp subscription error:', error);
      return {
        success: false,
        errorMessage: error.message || 'Pay.jp subscription failed'
      };
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<boolean> {
    try {
      await this.makeRequest(`/subscriptions/${subscriptionId}`, 'DELETE');
      logger.info('Pay.jp subscription canceled:', subscriptionId);
      return true;
    } catch (error) {
      logger.error('Pay.jp subscription cancellation error:', error);
      return false;
    }
  }

  async updateSubscription(subscriptionId: string, planId: string): Promise<boolean> {
    try {
      const newPlanId = this.mapPlanToPayjpPlan(planId);
      
      const updateData = {
        plan: newPlanId
      };

      await this.makeRequest(`/subscriptions/${subscriptionId}`, 'POST', updateData);
      logger.info('Pay.jp subscription updated:', subscriptionId);
      return true;
    } catch (error) {
      logger.error('Pay.jp subscription update error:', error);
      return false;
    }
  }

  async retrievePaymentMethods(customerId: string): Promise<PaymentMethod[]> {
    try {
      const customer = await this.makeRequest(`/customers/${customerId}`, 'GET');
      
      if (!customer.cards || !customer.cards.data) {
        return [];
      }

      return customer.cards.data.map((card: any) => ({
        id: card.id,
        provider: 'payjp' as const,
        type: 'card' as const,
        last4: card.last4,
        brand: card.brand,
        expiryMonth: card.exp_month,
        expiryYear: card.exp_year,
        isDefault: card.id === customer.default_card,
        createdAt: new Date(card.created * 1000)
      }));
    } catch (error) {
      logger.error('Pay.jp payment methods retrieval error:', error);
      return [];
    }
  }

  async createPaymentMethod(customerId: string, paymentData: any): Promise<PaymentMethod> {
    try {
      const cardData = {
        customer: customerId,
        card: paymentData.token
      };

      const card = await this.makeRequest('/cards', 'POST', cardData);
      
      return {
        id: card.id,
        provider: 'payjp' as const,
        type: 'card' as const,
        last4: card.last4,
        brand: card.brand,
        expiryMonth: card.exp_month,
        expiryYear: card.exp_year,
        isDefault: false,
        createdAt: new Date()
      };
    } catch (error) {
      logger.error('Pay.jp payment method creation error:', error);
      throw error;
    }
  }

  async handleWebhook(payload: string, signature: string): Promise<void> {
    try {
      const event = JSON.parse(payload);
      
      logger.info('Pay.jp webhook received:', {
        eventType: event.type,
        eventId: event.id
      });

      switch (event.type) {
        case 'charge.succeeded':
          await this.handleChargeSucceeded(event.data);
          break;
        case 'charge.failed':
          await this.handleChargeFailed(event.data);
          break;
        case 'subscription.created':
          await this.handleSubscriptionCreated(event.data);
          break;
        case 'subscription.updated':
          await this.handleSubscriptionUpdated(event.data);
          break;
        case 'subscription.deleted':
          await this.handleSubscriptionDeleted(event.data);
          break;
        default:
          logger.info(`Unhandled Pay.jp webhook event: ${event.type}`);
      }
    } catch (error) {
      logger.error('Pay.jp webhook handling error:', error);
      throw error;
    }
  }

  private mapPlanToPayjpPlan(planId: string): string {
    const planMapping: Record<string, string> = {
      'light': process.env.PAYJP_LIGHT_PLAN_ID || 'plan_light',
      'standard': process.env.PAYJP_STANDARD_PLAN_ID || 'plan_standard',
      'premium_ai': process.env.PAYJP_PREMIUM_PLAN_ID || 'plan_premium'
    };
    
    return planMapping[planId] || planMapping['light'];
  }

  private async createCustomer(): Promise<string> {
    const customer = await this.makeRequest('/customers', 'POST', {
      description: 'Salon management system customer'
    });
    return customer.id;
  }

  private async handleChargeSucceeded(data: any): Promise<void> {
    logger.info('Processing Pay.jp charge success:', data.id);
  }

  private async handleChargeFailed(data: any): Promise<void> {
    logger.info('Processing Pay.jp charge failure:', data.id);
  }

  private async handleSubscriptionCreated(data: any): Promise<void> {
    logger.info('Processing Pay.jp subscription creation:', data.id);
  }

  private async handleSubscriptionUpdated(data: any): Promise<void> {
    logger.info('Processing Pay.jp subscription update:', data.id);
  }

  private async handleSubscriptionDeleted(data: any): Promise<void> {
    logger.info('Processing Pay.jp subscription deletion:', data.id);
  }
}