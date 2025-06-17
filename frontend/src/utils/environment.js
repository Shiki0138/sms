/**
 * 🌍 環境管理ユーティリティ
 * 開発/本番環境での機能制限を管理
 */
/**
 * 環境設定を取得
 */
export const getEnvironmentConfig = () => {
    const isDevelopment = import.meta.env.VITE_APP_ENV === 'development';
    const isProduction = import.meta.env.VITE_APP_ENV === 'production';
    return {
        isDevelopment,
        isProduction,
        enableLineMessaging: import.meta.env.VITE_ENABLE_LINE_MESSAGING === 'true',
        enableInstagramDM: import.meta.env.VITE_ENABLE_INSTAGRAM_DM === 'true',
        enableSMSSending: import.meta.env.VITE_ENABLE_SMS_SENDING === 'true',
        enableEmailBulkSend: import.meta.env.VITE_ENABLE_EMAIL_BULK_SEND === 'true',
        enableExternalIntegrations: import.meta.env.VITE_ENABLE_EXTERNAL_INTEGRATIONS === 'true',
        showProductionWarnings: import.meta.env.VITE_SHOW_PRODUCTION_WARNINGS === 'true',
        restrictExternalAPIs: import.meta.env.VITE_RESTRICT_EXTERNAL_APIS === 'true',
        enablePayments: import.meta.env.VITE_ENABLE_PAYMENTS === 'true',
        enableAnalyticsExport: import.meta.env.VITE_ENABLE_ANALYTICS_EXPORT === 'true',
        enablePDFReports: import.meta.env.VITE_ENABLE_PDF_REPORTS === 'true',
        enablePushNotifications: import.meta.env.VITE_ENABLE_PUSH_NOTIFICATIONS === 'true',
        debugMode: import.meta.env.VITE_DEBUG_MODE === 'true',
        logLevel: import.meta.env.VITE_LOG_LEVEL || 'info',
        apiBaseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
    };
};
/**
 * 特定機能が有効かチェック
 */
export const isFeatureEnabled = (feature) => {
    const config = getEnvironmentConfig();
    return Boolean(config[feature]);
};
/**
 * 外部送信機能が利用可能かチェック
 */
export const canSendExternalMessage = (type) => {
    const config = getEnvironmentConfig();
    switch (type) {
        case 'line':
            return config.enableLineMessaging;
        case 'instagram':
            return config.enableInstagramDM;
        case 'sms':
            return config.enableSMSSending;
        case 'email':
            return config.enableEmailBulkSend;
        default:
            return false;
    }
};
/**
 * 開発環境での制限メッセージを取得
 */
export const getRestrictionMessage = (feature) => {
    const config = getEnvironmentConfig();
    if (config.isProduction) {
        return '';
    }
    const messages = {
        line: 'LINE メッセージ送信は本番環境でのみ利用可能です',
        instagram: 'Instagram DM送信は本番環境でのみ利用可能です',
        sms: 'SMS送信は本番環境でのみ利用可能です',
        email: 'メール一斉配信は本番環境でのみ利用可能です',
        payment: '決済機能は本番環境でのみ利用可能です',
        analytics_export: 'データエクスポートは本番環境でのみ利用可能です',
        pdf_reports: 'PDFレポート生成は本番環境でのみ利用可能です',
        push_notifications: 'プッシュ通知は本番環境でのみ利用可能です'
    };
    return messages[feature] || 'この機能は本番環境でのみ利用可能です';
};
/**
 * 環境情報をログ出力
 */
export const logEnvironmentInfo = () => {
    const config = getEnvironmentConfig();
    if (config.debugMode) {
        console.group('🌍 Environment Configuration');
        console.log('Environment:', config.isDevelopment ? 'Development' : 'Production');
        console.log('API Base URL:', config.apiBaseURL);
        console.log('External Features:', {
            line: config.enableLineMessaging,
            instagram: config.enableInstagramDM,
            sms: config.enableSMSSending,
            email: config.enableEmailBulkSend
        });
        console.log('Production Warnings:', config.showProductionWarnings);
        console.groupEnd();
    }
};
// 環境情報を起動時にログ出力
if (typeof window !== 'undefined') {
    logEnvironmentInfo();
}
