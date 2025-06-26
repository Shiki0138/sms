// 決済関連の型定義

export type PaymentProvider = 'stripe' | 'square' | 'paypal' | 'payjp';

export type PaymentStatus = 
  | 'pending'      // 支払い待ち
  | 'processing'   // 処理中
  | 'succeeded'    // 成功
  | 'failed'       // 失敗
  | 'canceled'     // キャンセル
  | 'refunded';    // 返金済み

export type SubscriptionStatus = 
  | 'active'       // 有効
  | 'past_due'     // 支払い遅延
  | 'canceled'     // キャンセル済み
  | 'unpaid'       // 未払い
  | 'trialing';    // トライアル中

export interface PaymentMethod {
  id: string;
  provider: PaymentProvider;
  type: 'card' | 'bank_transfer' | 'digital_wallet';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  createdAt: Date;
}

export interface Payment {
  id: string;
  tenantId: string;
  subscriptionId?: string;
  provider: PaymentProvider;
  providerPaymentId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  description: string;
  paymentMethodId: string;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
  id: string;
  tenantId: string;
  planType: string;
  provider: PaymentProvider;
  providerSubscriptionId: string;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEnd?: Date;
  paymentMethodId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  tenantId: string;
  subscriptionId: string;
  provider: PaymentProvider;
  providerInvoiceId: string;
  amount: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  periodStart: Date;
  periodEnd: Date;
  dueDate: Date | null;
  paidAt?: Date | null;
  invoiceUrl?: string | null;
  invoicePdf?: string | null;
  createdAt: Date;
}

// 決済プロバイダー設定
export interface PaymentProviderConfig {
  stripe?: {
    publicKey: string;
    secretKey: string;
    webhookSecret: string;
  };
  square?: {
    applicationId: string;
    accessToken: string;
    webhookSignatureKey: string;
    environment: 'sandbox' | 'production';
  };
  paypal?: {
    clientId: string;
    clientSecret: string;
    webhookId: string;
  };
  payjp?: {
    publicKey: string;
    secretKey: string;
  };
}

// 決済要求
export interface PaymentRequest {
  amount: number;
  currency: string;
  description: string;
  paymentMethodId?: string;
  customerId?: string;
  metadata?: Record<string, string>;
}

// サブスクリプション作成要求
export interface SubscriptionRequest {
  planId: string;
  paymentMethodId: string;
  customerId?: string;
  trialPeriodDays?: number;
  metadata?: Record<string, string>;
}

// 決済結果
export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  errorMessage?: string;
  requiresAction?: boolean;
  clientSecret?: string;
  errorCode?: string;
  amount?: number;
  message?: string;
}

// Webhook イベント
export interface WebhookEvent {
  id: string;
  provider: PaymentProvider;
  eventType: string;
  data: any;
  processed: boolean;
  createdAt: Date;
}