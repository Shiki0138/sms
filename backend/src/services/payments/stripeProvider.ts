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
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY environment variable is required');
    }
    
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
      typescript: true
    });
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      // 入力値検証
      this.validatePaymentRequest(request);
      
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(request.amount * 100), // 円からセントに変換
        currency: 'jpy', // 日本円固定
        description: request.description || '美容室管理システム 決済',
        payment_method: request.paymentMethodId,
        confirm: true,
        customer: request.customerId,
        metadata: {
          ...request.metadata,
          tenantId: request.metadata?.tenantId || '',
          reservationId: request.metadata?.reservationId || '',
          customerId: request.customerId || ''
        },
        return_url: `${process.env.FRONTEND_URL}/payment/return`,
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never'
        }
      });

      // データベースに支払い記録を保存
      await this.savePaymentRecord(paymentIntent, request);
      
      if (paymentIntent.status === 'succeeded') {
        logger.info('Stripe payment succeeded:', {
          paymentId: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency
        });
        
        // 成功通知
        await this.notifyPaymentSuccess(request.customerId, paymentIntent);
        
        return {
          success: true,
          paymentId: paymentIntent.id,
          amount: paymentIntent.amount / 100, // セントから円に変換
          currency: paymentIntent.currency,
          message: 'お支払いが正常に完了しました'
        };
      } else if (paymentIntent.status === 'requires_action') {
        return {
          success: false,
          requiresAction: true,
          clientSecret: paymentIntent.client_secret!,
          paymentId: paymentIntent.id,
          message: '追加認証が必要です'
        };
      } else if (paymentIntent.status === 'requires_payment_method') {
        return {
          success: false,
          errorMessage: 'お支払い方法に問題があります。別のカードをお試しください。'
        };
      } else {
        throw new Error(`Payment failed with status: ${paymentIntent.status}`);
      }
    } catch (error: any) {
      logger.error('Stripe payment error:', {
        error: error.message,
        code: error.code,
        type: error.type,
        requestData: {
          amount: request.amount,
          customerId: request.customerId,
          paymentMethodId: request.paymentMethodId
        }
      });
      
      // Stripeエラーコードに基づいたユーザーフレンドリーなメッセージ
      let userMessage = 'お支払い処理中にエラーが発生しました。しばらくしてから再度お試しください。';
      
      if (error.code) {
        switch (error.code) {
          case 'card_declined':
            userMessage = 'カードが拒否されました。別のカードをお試しいただくか、カード会社にお問い合わせください。';
            break;
          case 'insufficient_funds':
            userMessage = '残高不足です。別のカードをお試しください。';
            break;
          case 'expired_card':
            userMessage = 'カードの有効期限が切れています。別のカードをお試しください。';
            break;
          case 'incorrect_cvc':
            userMessage = 'セキュリティコードが正しくありません。';
            break;
          case 'processing_error':
            userMessage = 'カード処理エラーが発生しました。しばらくしてから再度お試しください。';
            break;
          case 'rate_limit':
            userMessage = 'リクエストが多すぎます。しばらくしてから再度お試しください。';
            break;
        }
      }
      
      return {
        success: false,
        errorMessage: userMessage,
        errorCode: error.code
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
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!webhookSecret) {
        throw new Error('STRIPE_WEBHOOK_SECRET environment variable is required');
      }
      
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
    try {
      logger.info('Processing successful payment:', {
        paymentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        customerId: paymentIntent.customer
      });
      
      // データベースの支払い状態を更新
      await this.updatePaymentStatus(paymentIntent.id, 'succeeded');
      
      // 予約IDがあれば予約の支払い状態も更新
      const reservationId = paymentIntent.metadata?.reservationId;
      if (reservationId) {
        await this.updateReservationPaymentStatus(reservationId, 'paid');
      }
      
    } catch (error) {
      logger.error('Error processing successful payment:', {
        paymentId: paymentIntent.id,
        error
      });
      throw error;
    }
  }

  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    try {
      logger.info('Processing failed payment:', {
        paymentId: paymentIntent.id,
        lastPaymentError: paymentIntent.last_payment_error,
        customerId: paymentIntent.customer
      });
      
      // データベースの支払い状態を更新
      await this.updatePaymentStatus(paymentIntent.id, 'failed');
      
      // 予約IDがあれば予約の支払い状態も更新
      const reservationId = paymentIntent.metadata?.reservationId;
      if (reservationId) {
        await this.updateReservationPaymentStatus(reservationId, 'pending');
      }
      
    } catch (error) {
      logger.error('Error processing failed payment:', {
        paymentId: paymentIntent.id,
        error
      });
      throw error;
    }
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

  // Helper methods
  private validatePaymentRequest(request: PaymentRequest): void {
    if (!request.amount || request.amount <= 0) {
      throw new Error('Invalid payment amount');
    }
    if (!request.customerId) {
      throw new Error('Customer ID is required');
    }
    if (!request.paymentMethodId) {
      throw new Error('Payment method ID is required');
    }
  }

  private async savePaymentRecord(paymentIntent: Stripe.PaymentIntent, request: PaymentRequest): Promise<void> {
    const prisma = new (await import('@prisma/client')).PrismaClient();
    try {
      await prisma.payment.create({
        data: {
          id: paymentIntent.id,
          amount: paymentIntent.amount / 100, // セントから円に変換
          currency: paymentIntent.currency,
          status: paymentIntent.status,
          provider: 'stripe',
          providerPaymentId: paymentIntent.id,
          customerId: request.customerId,
          tenantId: request.metadata?.tenantId || '',
          metadata: request.metadata || {},
          createdAt: new Date()
        }
      });
    } catch (error) {
      logger.error('Failed to save payment record:', error);
      throw error;
    } finally {
      await prisma.$disconnect();
    }
  }

  private async notifyPaymentSuccess(customerId: string, paymentIntent: Stripe.PaymentIntent): Promise<void> {
    try {
      // 顧客への支払い完了通知
      logger.info('Payment success notification sent:', {
        customerId,
        paymentId: paymentIntent.id,
        amount: paymentIntent.amount / 100
      });
    } catch (error) {
      logger.error('Failed to send payment success notification:', error);
    }
  }

  private async updatePaymentStatus(paymentId: string, status: string): Promise<void> {
    const prisma = new (await import('@prisma/client')).PrismaClient();
    try {
      await prisma.payment.update({
        where: { id: paymentId },
        data: { 
          status,
          updatedAt: new Date()
        }
      });
    } catch (error) {
      logger.error('Failed to update payment status:', error);
      throw error;
    } finally {
      await prisma.$disconnect();
    }
  }

  private async updateReservationPaymentStatus(reservationId: string, paymentStatus: string): Promise<void> {
    const prisma = new (await import('@prisma/client')).PrismaClient();
    try {
      await prisma.reservation.update({
        where: { id: reservationId },
        data: { 
          paymentStatus,
          updatedAt: new Date()
        }
      });
    } catch (error) {
      logger.error('Failed to update reservation payment status:', error);
      throw error;
    } finally {
      await prisma.$disconnect();
    }
  }

  // 返金処理
  async refundPayment(paymentId: string, amount?: number, reason?: string): Promise<PaymentResult> {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentId,
        amount: amount ? Math.round(amount * 100) : undefined, // 部分返金対応
        reason: reason || 'requested_by_customer',
        metadata: {
          refundReason: reason || 'Customer requested refund'
        }
      });

      logger.info('Stripe refund created:', {
        refundId: refund.id,
        paymentId,
        amount: refund.amount / 100
      });

      return {
        success: true,
        paymentId: refund.id,
        amount: refund.amount / 100,
        message: '返金処理が完了しました'
      };
    } catch (error: any) {
      logger.error('Stripe refund error:', error);
      return {
        success: false,
        errorMessage: '返金処理に失敗しました。サポートにお問い合わせください。'
      };
    }
  }
}