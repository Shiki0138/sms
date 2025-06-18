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

  async cancelSubscription(subscriptionId: string): Promise<PaymentResult> {
    logger.warn('Square cancel subscription provider is disabled - returning demo response');
    return {
      success: false,
      errorCode: 'PROVIDER_DISABLED',
      message: 'Square cancel subscription provider is currently disabled'
    };
  }

  async createPaymentMethod(customerId: string, card: any): Promise<PaymentMethod | null> {
    logger.warn('Square create payment method provider is disabled');
    return null;
  }

  async getPaymentMethods(customerId: string): Promise<PaymentMethod[]> {
    logger.warn('Square get payment methods provider is disabled');
    return [];
  }
}