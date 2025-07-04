import { 
  PaymentProvider, 
  PaymentRequest, 
  PaymentResult, 
  SubscriptionRequest,
  PaymentMethod,
  Subscription,
  Invoice
} from '../types/payment';
import { StripePaymentProvider } from './payments/stripeProvider';
import { SquarePaymentProvider } from './payments/squareProvider';
import { PayPalPaymentProvider } from './payments/paypalProvider';
import { PayjpPaymentProvider } from './payments/payjpProvider';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

let prisma: PrismaClient;

// テスト環境では外部から注入可能にする
if (process.env.NODE_ENV === 'test' && (global as any).prisma) {
  prisma = (global as any).prisma;
} else {
  prisma = new PrismaClient();
}

// 決済プロバイダーインターface
export interface IPaymentProvider {
  createPayment(request: PaymentRequest): Promise<PaymentResult>;
  createSubscription(request: SubscriptionRequest): Promise<PaymentResult>;
  cancelSubscription(subscriptionId: string): Promise<boolean>;
  updateSubscription(subscriptionId: string, planId: string): Promise<boolean>;
  retrievePaymentMethods(customerId: string): Promise<PaymentMethod[]>;
  createPaymentMethod(customerId: string, paymentData: any): Promise<PaymentMethod>;
  handleWebhook(payload: string, signature: string): Promise<void>;
}

export class PaymentService {
  private providers: Map<PaymentProvider, IPaymentProvider> = new Map();
  private prisma: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient || prisma;
    this.initializeProviders();
  }

  private initializeProviders() {
    // 環境変数から各プロバイダーの設定を読み込み
    if (process.env.STRIPE_SECRET_KEY) {
      this.providers.set('stripe', new StripePaymentProvider());
    }
    
    if (process.env.SQUARE_ACCESS_TOKEN) {
      this.providers.set('square', new SquarePaymentProvider());
    }
    
    if (process.env.PAYPAL_CLIENT_SECRET) {
      this.providers.set('paypal', new PayPalPaymentProvider());
    }
    
    if (process.env.PAYJP_SECRET_KEY) {
      this.providers.set('payjp', new PayjpPaymentProvider());
    }
  }

  /**
   * テナントの決済プロバイダーを取得
   */
  async getTenantPaymentProvider(tenantId: string): Promise<PaymentProvider> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        settings: {
          where: { key: 'payment_provider' }
        }
      }
    });

    const setting = tenant?.settings[0];
    return (setting?.value as PaymentProvider) || 'stripe'; // デフォルトはStripe
  }

  /**
   * 支払いを作成
   */
  async createPayment(
    tenantId: string, 
    request: PaymentRequest
  ): Promise<PaymentResult> {
    try {
      const providerType = await this.getTenantPaymentProvider(tenantId);
      const provider = this.providers.get(providerType);
      
      if (!provider) {
        throw new Error(`Payment provider ${providerType} not configured`);
      }

      const result = await provider.createPayment(request);
      
      if (result.success && result.paymentId) {
        // データベースに支払い記録を保存
        await this.prisma.payment.create({
          data: {
            tenantId,
            provider: providerType,
            providerPaymentId: result.paymentId,
            amount: request.amount,
            currency: request.currency,
            status: 'processing',
            description: request.description,
            paymentMethodId: request.paymentMethodId || '',
          }
        });
      }

      return result;
    } catch (error) {
      logger.error('Payment creation failed:', error);
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * サブスクリプションを作成
   */
  async createSubscription(
    tenantId: string,
    request: SubscriptionRequest
  ): Promise<PaymentResult> {
    try {
      const providerType = await this.getTenantPaymentProvider(tenantId);
      const provider = this.providers.get(providerType);
      
      if (!provider) {
        throw new Error(`Payment provider ${providerType} not configured`);
      }

      const result = await provider.createSubscription(request);
      
      if (result.success) {
        // テナントのプランを更新
        await this.prisma.tenant.update({
          where: { id: tenantId },
          data: { plan: request.planId }
        });

        // サブスクリプション記録を保存
        if (result.paymentId) {
          await this.prisma.subscription.create({
            data: {
              tenantId,
              planType: request.planId,
              provider: providerType,
              providerSubscriptionId: result.paymentId,
              status: 'active',
              currentPeriodStart: new Date(),
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30日後
              cancelAtPeriodEnd: false,
              paymentMethodId: request.paymentMethodId,
            }
          });
        }
      }

      return result;
    } catch (error) {
      logger.error('Subscription creation failed:', error);
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * サブスクリプションをキャンセル
   */
  async cancelSubscription(tenantId: string): Promise<boolean> {
    try {
      const subscription = await this.prisma.subscription.findFirst({
        where: { 
          tenantId,
          status: 'active'
        }
      });

      if (!subscription) {
        throw new Error('Active subscription not found');
      }

      const provider = this.providers.get(subscription.provider);
      if (!provider) {
        throw new Error(`Payment provider ${subscription.provider} not configured`);
      }

      const success = await provider.cancelSubscription(subscription.providerSubscriptionId);
      
      if (success) {
        await this.prisma.subscription.update({
          where: { id: subscription.id },
          data: { 
            status: 'canceled',
            cancelAtPeriodEnd: true
          }
        });
      }

      return success;
    } catch (error) {
      logger.error('Subscription cancellation failed:', error);
      return false;
    }
  }

  /**
   * プランを変更（アップグレード/ダウングレード）
   */
  async changePlan(tenantId: string, newPlanId: string): Promise<boolean> {
    try {
      const subscription = await this.prisma.subscription.findFirst({
        where: { 
          tenantId,
          status: 'active'
        }
      });

      if (!subscription) {
        // 新規サブスクリプション作成が必要
        return false;
      }

      const provider = this.providers.get(subscription.provider);
      if (!provider) {
        throw new Error(`Payment provider ${subscription.provider} not configured`);
      }

      const success = await provider.updateSubscription(
        subscription.providerSubscriptionId, 
        newPlanId
      );
      
      if (success) {
        await Promise.all([
          prisma.tenant.update({
            where: { id: tenantId },
            data: { plan: newPlanId }
          }),
          prisma.subscription.update({
            where: { id: subscription.id },
            data: { planType: newPlanId }
          })
        ]);
      }

      return success;
    } catch (error) {
      logger.error('Plan change failed:', error);
      return false;
    }
  }

  /**
   * 支払い方法を取得
   */
  async getPaymentMethods(tenantId: string): Promise<PaymentMethod[]> {
    try {
      const providerType = await this.getTenantPaymentProvider(tenantId);
      const provider = this.providers.get(providerType);
      
      if (!provider) {
        return [];
      }

      return await provider.retrievePaymentMethods(tenantId);
    } catch (error) {
      logger.error('Failed to retrieve payment methods:', error);
      return [];
    }
  }

  /**
   * Webhookを処理
   */
  async handleWebhook(
    provider: PaymentProvider,
    payload: string,
    signature: string
  ): Promise<void> {
    try {
      const providerInstance = this.providers.get(provider);
      if (!providerInstance) {
        throw new Error(`Payment provider ${provider} not configured`);
      }

      await providerInstance.handleWebhook(payload, signature);
    } catch (error) {
      logger.error(`Webhook handling failed for ${provider}:`, error);
      throw error;
    }
  }

  /**
   * 請求書を取得
   */
  async getInvoices(tenantId: string): Promise<any[]> {
    try {
      const invoices = await this.prisma.invoice.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' }
      });
      
      // Map Prisma Invoice to the expected Invoice interface
      return invoices.map(invoice => ({
        ...invoice,
        provider: 'stripe' as PaymentProvider, // Default provider
        providerInvoiceId: invoice.invoiceNumber,
        currency: 'JPY',
        periodStart: invoice.issuedAt,
        periodEnd: invoice.dueDate || invoice.issuedAt,
        invoiceUrl: invoice.pdfUrl,
        invoicePdf: invoice.pdfUrl
      }));
    } catch (error) {
      logger.error('Failed to retrieve invoices:', error);
      return [];
    }
  }
}

export const paymentService = new PaymentService();