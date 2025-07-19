import { 
  PaymentRequest, 
  PaymentResult, 
  SubscriptionRequest, 
  PaymentMethod 
} from '../../types/payment';
import { IPaymentProvider } from '../paymentService';
// import { Client, Environment } from 'squareup';
import { logger } from '../../utils/logger';

export class SquarePaymentProvider implements IPaymentProvider {
  private client: any;

  constructor() {
    // Squareライブラリが利用できない場合のダミー実装
    this.client = null;
    logger.warn('Square payment provider initialized in demo mode');
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResult> {
    logger.warn('Square payment provider is disabled - returning demo response');
    return {
      success: false,
      errorCode: 'PROVIDER_DISABLED',
      message: 'Square payment provider is currently disabled'
    };
  }

  async refundPayment(paymentId: string, amount?: number, reason?: string): Promise<PaymentResult> {
    logger.warn('Square refund provider is disabled - returning demo response');
    return {
      success: false,
      errorCode: 'PROVIDER_DISABLED',
      message: 'Square refund provider is currently disabled'
    };
  }

  async createSubscription(request: SubscriptionRequest): Promise<PaymentResult> {
    logger.warn('Square subscription provider is disabled - returning demo response');
    return {
      success: false,
      errorCode: 'PROVIDER_DISABLED',
      message: 'Square subscription provider is currently disabled'
    };
  }

  async cancelSubscription(subscriptionId: string): Promise<boolean> {
    logger.warn('Square cancel subscription provider is disabled');
    return false;
  }

  async updateSubscription(subscriptionId: string, planId: string): Promise<boolean> {
    logger.warn('Square update subscription provider is disabled');
    return false;
  }

  async retrievePaymentMethods(customerId: string): Promise<PaymentMethod[]> {
    logger.warn('Square retrieve payment methods provider is disabled');
    return [];
  }

  async createPaymentMethod(customerId: string, paymentData: any): Promise<PaymentMethod> {
    logger.warn('Square create payment method provider is disabled');
    throw new Error('Square payment method creation is disabled');
  }

  async handleWebhook(payload: string, signature: string): Promise<void> {
    logger.warn('Square webhook handling is disabled');
  }
}