/**
 * 🌍 環境管理ユーティリティ
 * 本番環境でのテスト フェーズ表示管理
 */

export interface EnvironmentConfig {
  isDevelopment: boolean
  isProduction: boolean
  isTestingPhase: boolean
  isDemoMode?: boolean
  demoExpiryDays?: number
  enableLineMessaging: boolean
  enableInstagramDM: boolean
  enableSMSSending: boolean
  enableEmailBulkSend: boolean
  enableExternalIntegrations: boolean
  enableAIAnalytics: boolean
  showProductionWarnings: boolean
  restrictExternalAPIs: boolean
  enablePayments: boolean
  enableAnalyticsExport: boolean
  enablePDFReports: boolean
  enablePushNotifications: boolean
  enableCSVImport: boolean
  debugMode: boolean
  logLevel: 'debug' | 'info' | 'warn' | 'error'
  apiBaseURL: string
}

/**
 * 環境設定を取得
 */
export const getEnvironmentConfig = (): EnvironmentConfig => {
  const isDevelopment = import.meta.env.VITE_APP_ENV === 'development'
  const isProduction = import.meta.env.VITE_APP_ENV === 'production'
  const isTestingPhase = import.meta.env.VITE_TESTING_PHASE === 'true'

  return {
    isDevelopment,
    isProduction,
    isTestingPhase,
    isDemoMode: import.meta.env.VITE_IS_DEMO_MODE === 'true',
    demoExpiryDays: import.meta.env.VITE_DEMO_EXPIRY_DAYS ? parseInt(import.meta.env.VITE_DEMO_EXPIRY_DAYS) : undefined,
    enableLineMessaging: import.meta.env.VITE_ENABLE_LINE_MESSAGING === 'true',
    enableInstagramDM: import.meta.env.VITE_ENABLE_INSTAGRAM_DM === 'true',
    enableSMSSending: import.meta.env.VITE_ENABLE_SMS_SENDING === 'true',
    enableEmailBulkSend: import.meta.env.VITE_ENABLE_EMAIL_BULK_SEND === 'true',
    enableExternalIntegrations: import.meta.env.VITE_ENABLE_EXTERNAL_INTEGRATIONS === 'true',
    enableAIAnalytics: import.meta.env.VITE_ENABLE_AI_ANALYTICS === 'true',
    showProductionWarnings: import.meta.env.VITE_SHOW_PRODUCTION_WARNINGS === 'true',
    restrictExternalAPIs: import.meta.env.VITE_RESTRICT_EXTERNAL_APIS === 'true',
    enablePayments: import.meta.env.VITE_ENABLE_PAYMENTS === 'true',
    enableAnalyticsExport: import.meta.env.VITE_ENABLE_ANALYTICS_EXPORT === 'true',
    enablePDFReports: import.meta.env.VITE_ENABLE_PDF_REPORTS === 'true',
    enablePushNotifications: import.meta.env.VITE_ENABLE_PUSH_NOTIFICATIONS === 'true',
    enableCSVImport: import.meta.env.VITE_ENABLE_CSV_IMPORT === 'true',
    debugMode: import.meta.env.VITE_DEBUG_MODE === 'true',
    logLevel: (import.meta.env.VITE_LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') || 'info',
    apiBaseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
  }
}

/**
 * 特定機能が有効かチェック
 */
export const isFeatureEnabled = (feature: keyof EnvironmentConfig): boolean => {
  const config = getEnvironmentConfig()
  return Boolean(config[feature])
}

/**
 * 外部送信機能が利用可能かチェック
 */
export const canSendExternalMessage = (type: 'line' | 'instagram' | 'sms' | 'email'): boolean => {
  const config = getEnvironmentConfig()
  
  switch (type) {
    case 'line':
      return config.enableLineMessaging
    case 'instagram':
      return config.enableInstagramDM
    case 'sms':
      return config.enableSMSSending
    case 'email':
      return config.enableEmailBulkSend
    default:
      return false
  }
}

/**
 * 機能制限メッセージを取得
 */
export const getRestrictionMessage = (feature: string): string => {
  const config = getEnvironmentConfig()
  
  if (!config.isProduction) {
    const devMessages: Record<string, string> = {
      line: 'LINE メッセージ送信は本番環境でのみ利用可能です',
      instagram: 'Instagram DM送信は本番環境でのみ利用可能です',
      sms: 'SMS送信は本番環境でのみ利用可能です',
      email: 'メール一斉配信は本番環境でのみ利用可能です',
      payment: '決済機能は本番環境でのみ利用可能です',
      analytics_export: 'データエクスポートは本番環境でのみ利用可能です',
      pdf_reports: 'PDFレポート生成は本番環境でのみ利用可能です',
      push_notifications: 'プッシュ通知は本番環境でのみ利用可能です'
    }
    return devMessages[feature] || 'この機能は本番環境でのみ利用可能です'
  }

  return ''
}

/**
 * 環境情報をログ出力
 */
export const logEnvironmentInfo = (): void => {
  const config = getEnvironmentConfig()
  
  if (config.debugMode) {
    console.group('🌍 Environment Configuration')
    console.log('Environment:', config.isDevelopment ? 'Development' : 'Production')
    console.log('API Base URL:', config.apiBaseURL)
    console.log('External Features:', {
      line: config.enableLineMessaging,
      instagram: config.enableInstagramDM,
      sms: config.enableSMSSending,
      email: config.enableEmailBulkSend
    })
    console.log('Production Warnings:', config.showProductionWarnings)
    console.groupEnd()
  }
}

// 環境情報を起動時にログ出力
if (typeof window !== 'undefined') {
  logEnvironmentInfo()
}