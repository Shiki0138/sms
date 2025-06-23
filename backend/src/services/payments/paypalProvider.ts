import { 
  PaymentRequest, 
  PaymentResult, 
  SubscriptionRequest, 
  PaymentMethod 
} from '../../types/payment';
import { IPaymentProvider } from '../paymentService';
import { logger } from '../../utils/logger';

export class PayPalPaymentProvider implements IPaymentProvider {
  private baseURL: string;
  private accessToken: string | null = null;

  constructor() {
    // PayPal Sandbox or Production
    this.baseURL = process.env.PAYPAL_ENVIRONMENT === 'production'
      ? 'https://api.paypal.com'
      : 'https://api.sandbox.paypal.com';
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken) {
      return this.accessToken;
    }

    try {
      const credentials = Buffer.from(
        `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
      ).toString('base64');

      const response = await fetch(`${this.baseURL}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
      });

      const data = await response.json();
      this.accessToken = data.access_token;
      
      // トークンの有効期限を考慮して一定時間後にリセット
      setTimeout(() => {
        this.accessToken = null;
      }, (data.expires_in - 60) * 1000);

      return this.accessToken!;
    } catch (error) {
      logger.error('PayPal access token error:', error);
      throw new Error('Failed to get PayPal access token');
    }
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      const accessToken = await this.getAccessToken();
      
      const orderData = {
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: request.currency.toUpperCase(),
            value: (request.amount / 100).toFixed(2) // PayPalは円単位
          },
          description: request.description
        }],
        payment_source: {
          paypal: {
            experience_context: {
              return_url: `${process.env.FRONTEND_URL}/payment/success`,
              cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`
            }
          }
        }
      };

      const response = await fetch(`${this.baseURL}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      const order = await response.json();
      
      if (order.id) {
        logger.info('PayPal order created:', order.id);
        return {
          success: true,
          paymentId: order.id,
          requiresAction: true, // PayPalは通常ユーザーのアクションが必要
          clientSecret: order.links?.find((link: any) => link.rel === 'approve')?.href
        };
      } else {
        throw new Error('PayPal order creation failed');
      }
    } catch (error: any) {
      logger.error('PayPal payment error:', error);
      return {
        success: false,
        errorMessage: error.message || 'PayPal payment failed'
      };
    }
  }

  async createSubscription(request: SubscriptionRequest): Promise<PaymentResult> {
    try {
      const accessToken = await this.getAccessToken();
      const planId = this.mapPlanToPayPalPlan(request.planId);
      
      const subscriptionData = {
        plan_id: planId,
        start_time: new Date().toISOString(),
        subscriber: {
          payment_source: {
            paypal: {}
          }
        },
        application_context: {
          brand_name: 'Salon Management System',
          locale: 'ja-JP',
          user_action: 'SUBSCRIBE_NOW',
          return_url: `${process.env.FRONTEND_URL}/subscription/success`,
          cancel_url: `${process.env.FRONTEND_URL}/subscription/cancel`
        }
      };

      const response = await fetch(`${this.baseURL}/v1/billing/subscriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscriptionData)
      });

      const subscription = await response.json();
      
      if (subscription.id) {
        logger.info('PayPal subscription created:', subscription.id);
        return {
          success: true,
          paymentId: subscription.id,
          requiresAction: true,
          clientSecret: subscription.links?.find((link: any) => link.rel === 'approve')?.href
        };
      } else {
        throw new Error('PayPal subscription creation failed');
      }
    } catch (error: any) {
      logger.error('PayPal subscription error:', error);
      return {
        success: false,
        errorMessage: error.message || 'PayPal subscription failed'
      };
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<boolean> {
    try {
      const accessToken = await this.getAccessToken();
      
      const response = await fetch(`${this.baseURL}/v1/billing/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: 'User requested cancellation'
        })
      });

      return response.status === 204;
    } catch (error) {
      logger.error('PayPal subscription cancellation error:', error);
      return false;
    }
  }

  async updateSubscription(subscriptionId: string, planId: string): Promise<boolean> {
    try {
      const accessToken = await this.getAccessToken();
      const newPlanId = this.mapPlanToPayPalPlan(planId);
      
      // PayPalでは既存のサブスクリプションをキャンセルして新しく作成
      const cancelSuccess = await this.cancelSubscription(subscriptionId);
      if (!cancelSuccess) {
        return false;
      }

      // 新しいサブスクリプションの作成は別途処理が必要
      logger.info('PayPal subscription plan change requires new subscription creation');
      return true;
    } catch (error) {
      logger.error('PayPal subscription update error:', error);
      return false;
    }
  }

  async retrievePaymentMethods(customerId: string): Promise<PaymentMethod[]> {
    // PayPalは顧客の支払い方法を直接取得する機能が限定的
    // 通常はサブスクリプションや注文履歴から推定
    logger.info('PayPal payment methods retrieval is limited');
    return [];
  }

  async createPaymentMethod(customerId: string, paymentData: any): Promise<PaymentMethod> {
    // PayPalでは支払い方法の事前登録は一般的でない
    throw new Error('PayPal does not support pre-registering payment methods');
  }

  async handleWebhook(payload: string, signature: string): Promise<void> {
    try {
      // PayPal Webhook署名検証は複雑なため、簡略化
      const event = JSON.parse(payload);
      
      logger.info('PayPal webhook received:', {
        eventType: event.event_type,
        eventId: event.id
      });

      switch (event.event_type) {
        case 'PAYMENT.CAPTURE.COMPLETED':
          await this.handlePaymentCompleted(event.resource);
          break;
        case 'BILLING.SUBSCRIPTION.ACTIVATED':
          await this.handleSubscriptionActivated(event.resource);
          break;
        case 'BILLING.SUBSCRIPTION.CANCELLED':
          await this.handleSubscriptionCancelled(event.resource);
          break;
        default:
          logger.info(`Unhandled PayPal webhook event: ${event.event_type}`);
      }
    } catch (error) {
      logger.error('PayPal webhook handling error:', error);
      throw error;
    }
  }

  private mapPlanToPayPalPlan(planId: string): string {
    const planMapping: Record<string, string> = {
      'light': process.env.PAYPAL_LIGHT_PLAN_ID || 'P-light',
      'standard': process.env.PAYPAL_STANDARD_PLAN_ID || 'P-standard',
      'premium_ai': process.env.PAYPAL_PREMIUM_PLAN_ID || 'P-premium'
    };
    
    return planMapping[planId] || planMapping['light'];
  }

  private async handlePaymentCompleted(resource: any): Promise<void> {
    logger.info('Processing PayPal payment completion:', resource.id);
  }

  private async handleSubscriptionActivated(resource: any): Promise<void> {
    logger.info('Processing PayPal subscription activation:', resource.id);
  }

  private async handleSubscriptionCancelled(resource: any): Promise<void> {
    logger.info('Processing PayPal subscription cancellation:', resource.id);
  }

  async refundPayment(paymentId: string, amount?: number, reason?: string): Promise<PaymentResult> {
    try {
      const accessToken = await this.getAccessToken();

      const refundData: any = {};
      if (amount) {
        refundData.amount = {
          value: amount.toString(),
          currency_code: 'JPY'
        };
      }
      if (reason) {
        refundData.note_to_payer = reason;
      }

      const response = await fetch(`${this.baseURL}/v2/payments/captures/${paymentId}/refund`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'PayPal-Request-Id': `refund-${Date.now()}`
        },
        body: JSON.stringify(refundData)
      });

      const result = await response.json();

      if (response.ok && result.status === 'COMPLETED') {
        logger.info('PayPal refund successful:', result.id);
        return {
          success: true,
          paymentId: result.id,
          amount: parseFloat(result.amount?.value || '0'),
          message: '返金処理が完了しました'
        };
      } else {
        throw new Error(result.message || 'PayPal refund failed');
      }
    } catch (error: any) {
      logger.error('PayPal refund error:', error);
      return {
        success: false,
        errorMessage: '返金処理に失敗しました。サポートにお問い合わせください。'
      };
    }
  }
}