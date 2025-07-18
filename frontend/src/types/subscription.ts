// サブスクリプションプラン関連の型定義（バックエンドと統一）

export type SubscriptionPlan = 'light' | 'standard' | 'premium_ai'

export interface PlanLimits {
  maxStaff: number
  maxCustomers: number
  maxAIRepliesPerMonth: number
  maxDataExport: number // 月間エクスポート回数
  analyticsRetentionDays: number // 分析データ保持期間
  supportLevel: 'email' | 'priority_email' | 'phone_24h'
}

export interface PlanFeatures {
  // 基本機能
  reservationManagement: boolean
  customerManagement: boolean
  messageManagement: boolean
  calendarView: boolean
  basicReporting: boolean
  
  // AI機能
  aiReplyGeneration: boolean
  aiAnalytics: boolean
  
  // 分析機能
  customerAnalytics: boolean
  revenueAnalytics: boolean
  performanceAnalytics: boolean
  advancedReporting: boolean
  
  // 外部連携
  lineIntegration: boolean
  instagramIntegration: boolean
  
  // エクスポート機能
  csvExport: boolean
  pdfExport: boolean
  
  // 管理機能
  userManagement: boolean
  systemSettings: boolean
  backupSettings: boolean
  notificationSettings: boolean
  
  // カスタマイズ
  customReports: boolean
  apiAccess: boolean
}

export interface SubscriptionInfo {
  plan: SubscriptionPlan
  limits: PlanLimits
  features: PlanFeatures
  currentUsage: {
    staffCount: number
    customerCount: number
    aiRepliesThisMonth: number
    dataExportsThisMonth: number
  }
  billingCycle: 'monthly' | 'yearly'
  nextBillingDate: string
  isActive: boolean
  isTrialPeriod: boolean
  trialEndsAt?: string
}

// プラン別設定（バックエンドと統一）
export const PLAN_CONFIGS: Record<SubscriptionPlan, { limits: PlanLimits; features: PlanFeatures }> = {
  light: {
    limits: {
      maxStaff: 3,
      maxCustomers: 500,
      maxAIRepliesPerMonth: 50, // AI機能月50回まで
      maxDataExport: 3, // 基本エクスポートのみ
      analyticsRetentionDays: 30,
      supportLevel: 'email'
    },
    features: {
      // 基本機能のみ
      reservationManagement: true,
      customerManagement: true,
      messageManagement: true,
      calendarView: true,
      basicReporting: true,
      
      // AI機能制限付き
      aiReplyGeneration: true,  // AI返信機能（月50回まで）
      aiAnalytics: false,
      
      // 分析機能制限
      customerAnalytics: false,
      revenueAnalytics: false,
      performanceAnalytics: false,
      advancedReporting: false,
      
      // 外部連携追加
      lineIntegration: true,     // LINE連携可能
      instagramIntegration: true, // Instagram DM連携可能
      
      // エクスポート機能制限
      csvExport: true,  // 基本CSVエクスポートのみ
      pdfExport: false,
      
      // 管理機能制限
      userManagement: false,
      systemSettings: false,
      backupSettings: false,
      notificationSettings: true,
      
      // カスタマイズなし
      customReports: false,
      apiAccess: false
    }
  },
  
  standard: {
    limits: {
      maxStaff: 10,
      maxCustomers: 2000,
      maxAIRepliesPerMonth: 200,
      maxDataExport: 20,
      analyticsRetentionDays: 90,
      supportLevel: 'priority_email'
    },
    features: {
      // 全基本機能
      reservationManagement: true,
      customerManagement: true,
      messageManagement: true,
      calendarView: true,
      basicReporting: true,
      
      // AI機能制限付き
      aiReplyGeneration: true,  // 基本AI返信
      aiAnalytics: false,       // 高度AI分析はなし
      
      // 分析機能あり
      customerAnalytics: true,
      revenueAnalytics: true,
      performanceAnalytics: true,
      advancedReporting: false, // 高度レポートはプレミアムのみ
      
      // 外部連携制限
      lineIntegration: true,
      instagramIntegration: true, // 基本連携は可能
      
      // エクスポート機能制限付き
      csvExport: true,
      pdfExport: true,
      
      // 管理機能制限
      userManagement: true,
      systemSettings: true,  // 基本設定は可能
      backupSettings: true,
      notificationSettings: true,
      
      // カスタマイズ制限
      customReports: false,  // カスタムレポートはプレミアムのみ
      apiAccess: false       // API アクセスはプレミアムのみ
    }
  },
  
  premium_ai: {
    limits: {
      maxStaff: -1, // 無制限
      maxCustomers: -1, // 無制限
      maxAIRepliesPerMonth: -1, // 無制限
      maxDataExport: -1, // 無制限
      analyticsRetentionDays: 365,
      supportLevel: 'phone_24h'
    },
    features: {
      // 全機能フルアクセス
      reservationManagement: true,
      customerManagement: true,
      messageManagement: true,
      calendarView: true,
      basicReporting: true,
      
      // AI機能フル
      aiReplyGeneration: true,
      aiAnalytics: true,      // 高度AI分析機能
      
      // 分析機能フル
      customerAnalytics: true,
      revenueAnalytics: true,
      performanceAnalytics: true,
      advancedReporting: true, // 高度レポート機能
      
      // 外部連携フル
      lineIntegration: true,
      instagramIntegration: true,
      
      // エクスポート機能フル
      csvExport: true,
      pdfExport: true,
      
      // 管理機能フル
      userManagement: true,
      systemSettings: true,
      backupSettings: true,
      notificationSettings: true,
      
      // カスタマイズフル
      customReports: true,    // カスタムレポート機能
      apiAccess: true         // フルAPI アクセス
    }
  }
}

// プラン表示名（バックエンドと統一）
export const PLAN_NAMES: Record<SubscriptionPlan, string> = {
  light: 'ライトプラン',
  standard: 'スタンダードプラン',
  premium_ai: 'AIプレミアムプラン'
}

// プラン料金情報の型定義
export interface PlanPricing {
  setup: number
  originalSetup: number
  monthly: number
  originalMonthly: number
  annual: number
}

// プラン料金情報（バックエンドと統一）
export const PLAN_PRICING: Record<SubscriptionPlan, PlanPricing> = {
  light: {
    setup: 29800,        // 元: 128000
    originalSetup: 128000,
    monthly: 9800,       // 元: 29800
    originalMonthly: 29800,
    annual: 107800       // 11ヶ月分
  },
  standard: {
    setup: 28000,        // 元: 128000
    originalSetup: 128000,
    monthly: 29800,      // 元: 49800
    originalMonthly: 49800,
    annual: 327800       // 11ヶ月分
  },
  premium_ai: {
    setup: 98000,        // 元: 198000
    originalSetup: 198000,
    monthly: 59800,      // 元: 79800
    originalMonthly: 79800,
    annual: 657800       // 11ヶ月分
  }
}