import Stripe from 'stripe';
import { 
  PaymentRequest, 
  PaymentResult, 
  SubscriptionRequest, 
  PaymentMethod 
} from '../../types/payment';
import { IPaymentProvider } from '../paymentService';
import { logger } from '../../utils/logger';

export class StripePaymentProvider implements IPaymentProvider {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16'
    });
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(request.amount),
        currency: request.currency.toLowerCase(),
        description: request.description,
        payment_method: request.paymentMethodId,
        confirm: true,
        customer: request.customerId,
        metadata: request.metadata || {},
        return_url: `${process.env.FRONTEND_URL}/payment/return`
      });

      if (paymentIntent.status === 'succeeded') {
        logger.info('Stripe payment succeeded:', paymentIntent.id);
        return {
          success: true,
          paymentId: paymentIntent.id
        };
      } else if (paymentIntent.status === 'requires_action') {
        return {
          success: false,
          requiresAction: true,
          clientSecret: paymentIntent.client_secret!,
          paymentId: paymentIntent.id
        };
      } else {
        throw new Error(`Payment failed with status: ${paymentIntent.status}`);
      }
    } catch (error: any) {
      logger.error('Stripe payment error:', error);
      return {
        success: false,
        errorMessage: error.message || 'Stripe payment failed'
      };
    }
  }

  async createSubscription(request: SubscriptionRequest): Promise<PaymentResult> {
    try {
      // 価格IDをプランIDから取得
      const priceId = this.mapPlanToStripePriceId(request.planId);
      
      const subscription = await this.stripe.subscriptions.create({
        customer: request.customerId || await this.createCustomer(),
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        default_payment_method: request.paymentMethodId,
        trial_period_days: request.trialPeriodDays,
        metadata: request.metadata || {},
        expand: ['latest_invoice.payment_intent']
      });

      const invoice = subscription.latest_invoice as Stripe.Invoice;
      const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;

      if (paymentIntent.status === 'succeeded') {
        logger.info('Stripe subscription created:', subscription.id);
        return {
          success: true,
          paymentId: subscription.id
        };
      } else if (paymentIntent.status === 'requires_action') {
        return {
          success: false,
          requiresAction: true,
          clientSecret: paymentIntent.client_secret!,
          paymentId: subscription.id
        };
      } else {
        throw new Error(`Subscription failed with status: ${paymentIntent.status}`);
      }
    } catch (error: any) {
      logger.error('Stripe subscription error:', error);
      return {
        success: false,
        errorMessage: error.message || 'Stripe subscription failed'
      };
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<boolean> {
    try {
      const subscription = await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true
      });
      
      logger.info('Stripe subscription canceled:', subscription.id);
      return true;
    } catch (error) {
      logger.error('Stripe subscription cancellation error:', error);
      return false;
    }
  }

  async updateSubscription(subscriptionId: string, planId: string): Promise<boolean> {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
      const newPriceId = this.mapPlanToStripePriceId(planId);
      
      await this.stripe.subscriptions.update(subscriptionId, {
        items: [{
          id: subscription.items.data[0].id,
          price: newPriceId
        }],
        proration_behavior: 'always_invoice'
      });
      
      logger.info('Stripe subscription updated:', subscriptionId);
      return true;
    } catch (error) {
      logger.error('Stripe subscription update error:', error);
      return false;
    }
  }

  async retrievePaymentMethods(customerId: string): Promise<PaymentMethod[]> {
    try {
      const paymentMethods = await this.stripe.paymentMethods.list({
        customer: customerId,
        type: 'card'
      });

      return paymentMethods.data.map(pm => ({
        id: pm.id,
        provider: 'stripe' as const,
        type: 'card' as const,
        last4: pm.card?.last4,
        brand: pm.card?.brand,
        expiryMonth: pm.card?.exp_month,
        expiryYear: pm.card?.exp_year,
        isDefault: false, // 別途デフォルト決済方法を取得する必要がある
        createdAt: new Date(pm.created * 1000)
      }));
    } catch (error) {
      logger.error('Stripe payment methods retrieval error:', error);
      return [];
    }
  }

  async createPaymentMethod(customerId: string, paymentData: any): Promise<PaymentMethod> {
    try {
      const paymentMethod = await this.stripe.paymentMethods.create({
        type: 'card',
        card: paymentData.card
      });

      await this.stripe.paymentMethods.attach(paymentMethod.id, {
        customer: customerId
      });

      return {
        id: paymentMethod.id,
        provider: 'stripe' as const,
        type: 'card' as const,
        last4: paymentMethod.card?.last4,
        brand: paymentMethod.card?.brand,
        expiryMonth: paymentMethod.card?.exp_month,
        expiryYear: paymentMethod.card?.exp_year,
        isDefault: false,
        createdAt: new Date()
      };
    } catch (error) {
      logger.error('Stripe payment method creation error:', error);
      throw error;
    }
  }

  async handleWebhook(payload: string, signature: string): Promise<void> {
    try {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
      const event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
      
      logger.info('Stripe webhook received:', {
        eventType: event.type,
        eventId: event.id
      });

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;
        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;
        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
          break;
        default:
          logger.info(`Unhandled Stripe webhook event: ${event.type}`);
      }
    } catch (error) {
      logger.error('Stripe webhook handling error:', error);
      throw error;
    }
  }

  private mapPlanToStripePriceId(planId: string): string {
    const priceMapping: Record<string, string> = {
      'light': process.env.STRIPE_LIGHT_PRICE_ID || 'price_light',
      'standard': process.env.STRIPE_STANDARD_PRICE_ID || 'price_standard', 
      'premium_ai': process.env.STRIPE_PREMIUM_PRICE_ID || 'price_premium'
    };
    
    return priceMapping[planId] || priceMapping['light'];
  }

  private async createCustomer(): Promise<string> {
    const customer = await this.stripe.customers.create({
      description: 'Salon management system customer'
    });
    return customer.id;
  }

  private async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    logger.info('Processing successful payment:', paymentIntent.id);
    // データベースの支払い状態を更新
  }

  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    logger.info('Processing failed payment:', paymentIntent.id);
    // データベースの支払い状態を更新
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    logger.info('Processing subscription update:', subscription.id);
    // データベースのサブスクリプション状態を更新
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    logger.info('Processing subscription deletion:', subscription.id);
    // データベースのサブスクリプション状態を更新
  }

  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    logger.info('Processing successful invoice payment:', invoice.id);
    // 請求書の状態を更新
  }

  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    logger.info('Processing failed invoice payment:', invoice.id);
    // 請求書の状態を更新、リトライ設定など
  }
}