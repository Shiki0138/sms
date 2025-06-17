// プラン定義の型
export type PlanType = 'light' | 'standard' | 'premium_ai';

// 機能カテゴリー
export type FeatureCategory = 
  | 'analytics'           // 分析機能
  | 'ai_features'         // AI機能
  | 'external_integrations' // 外部連携
  | 'export_functions'    // エクスポート機能
  | 'marketing_automation' // マーケティング自動化
  | 'advanced_reports'    // 高度レポート
  | 'real_time_dashboard' // リアルタイムダッシュボード
  | 'customer_segmentation' // 顧客セグメンテーション
  | 'bulk_operations'     // 一括操作
  | 'api_access'          // API アクセス
  | 'white_label'         // ホワイトラベル
  | 'priority_support';   // 優先サポート

// 使用量制限の型
export interface UsageLimits {
  maxStaff: number;           // 最大スタッフ数
  maxCustomers: number;       // 最大顧客数
  maxReservations: number;    // 月間最大予約数
  maxAIReplies: number;       // 月間AI返信回数
  maxExports: number;         // 月間エクスポート回数
  maxBulkMessages: number;    // 月間一括メッセージ数
  maxStorageGB: number;       // ストレージ上限(GB)
  maxAPICallsPerDay: number;  // 日次API呼び出し制限
}

// プラン設定
export interface PlanConfig {
  type: PlanType;
  name: string;
  displayName: string;
  price: number;              // 月額料金（円）
  description: string;
  features: FeatureCategory[];
  limits: UsageLimits;
  isPopular?: boolean;
  color: string;              // UI表示用カラー
}

// プラン制限エラーの型
export interface PlanRestrictionError {
  code: string;
  message: string;
  feature: FeatureCategory;
  currentPlan: PlanType;
  requiredPlan: PlanType;
  upgradeMessage: string;
}

// 使用量データの型
export interface UsageData {
  tenantId: string;
  month: string;              // YYYY-MM
  staffCount: number;
  customerCount: number;
  reservationCount: number;
  aiRepliesUsed: number;
  exportsUsed: number;
  bulkMessagesUsed: number;
  storageUsedGB: number;
  apiCallsToday: number;
  lastUpdated: Date;
}

// プラン設定定数
export const PLAN_CONFIGS: Record<PlanType, PlanConfig> = {
  light: {
    type: 'light',
    name: 'light',
    displayName: 'ライトプラン',
    price: 12000,
    description: '小規模サロン向けの基本機能パック。予約管理と顧客管理の基本機能のみ提供',
    color: '#10B981',
    features: [], // 基本機能のみ、追加機能なし
    limits: {
      maxStaff: 3,
      maxCustomers: 500,
      maxReservations: 300,
      maxAIReplies: 0,      // AI機能なし
      maxExports: 3,        // 基本的なエクスポートのみ
      maxBulkMessages: 0,   // 一括送信なし
      maxStorageGB: 1,
      maxAPICallsPerDay: 50 // 制限的なAPI使用
    }
  },
  standard: {
    type: 'standard', 
    name: 'standard',
    displayName: 'スタンダードプラン',
    price: 28000,
    description: '成長サロン向けの充実機能。分析・マーケティング・AI返信機能を含む',
    color: '#3B82F6',
    isPopular: true,
    features: [
      'analytics',              // 基本分析機能
      'marketing_automation',   // マーケティング自動化
      'customer_segmentation',  // 顧客セグメンテーション
      'bulk_operations',        // 一括操作
      'export_functions'        // エクスポート機能
    ],
    limits: {
      maxStaff: 10,
      maxCustomers: 2000,
      maxReservations: 1000,
      maxAIReplies: 200,      // 月200回のAI返信
      maxExports: 20,         // 月20回のエクスポート
      maxBulkMessages: 500,   // 月500件の一括送信
      maxStorageGB: 5,
      maxAPICallsPerDay: 500
    }
  },
  premium_ai: {
    type: 'premium_ai',
    name: 'premium_ai',
    displayName: 'AIプレミアムプラン',
    price: 55000,
    description: '大規模サロン向けの最高級AI機能。無制限のAI活用と高度な分析・外部連携',
    color: '#8B5CF6',
    features: [
      'analytics',              // 基本分析機能
      'ai_features',            // 高度AI機能（感情分析、予測など）
      'external_integrations',  // 外部API連携
      'export_functions',       // フルエクスポート機能
      'marketing_automation',   // 高度マーケティング自動化
      'advanced_reports',       // 高度レポート機能
      'real_time_dashboard',    // リアルタイムダッシュボード
      'customer_segmentation',  // 高度顧客セグメンテーション
      'bulk_operations',        // 無制限一括操作
      'api_access',             // フルAPI アクセス
      'white_label',            // ホワイトラベル機能
      'priority_support'        // 優先サポート
    ],
    limits: {
      maxStaff: -1,           // 無制限
      maxCustomers: -1,       // 無制限
      maxReservations: -1,    // 無制限
      maxAIReplies: -1,       // 無制限AI返信
      maxExports: -1,         // 無制限エクスポート
      maxBulkMessages: -1,    // 無制限一括送信
      maxStorageGB: 100,      // 100GB（実質無制限）
      maxAPICallsPerDay: -1   // 無制限API使用
    }
  }
};

// プラン比較用のヘルパー関数
export const isPlanHigherOrEqual = (userPlan: PlanType, requiredPlan: PlanType): boolean => {
  const hierarchy: PlanType[] = ['light', 'standard', 'premium_ai'];
  const userIndex = hierarchy.indexOf(userPlan);
  const requiredIndex = hierarchy.indexOf(requiredPlan);
  return userIndex >= requiredIndex;
};

// 機能の必要プラン判定
export const getRequiredPlanForFeature = (feature: FeatureCategory): PlanType => {
  for (const [planType, config] of Object.entries(PLAN_CONFIGS)) {
    if (config.features.includes(feature)) {
      return planType as PlanType;
    }
  }
  return 'premium_ai'; // デフォルトは最上位プラン
};