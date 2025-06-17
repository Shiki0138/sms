/**
 * 🌍 環境制限ミドルウェア
 * API呼び出しの前に環境制限をチェック
 */
import { getEnvironmentConfig, isFeatureEnabled } from '../utils/environment';
/**
 * 制限対象のAPIエンドポイント
 */
const RESTRICTED_ENDPOINTS = {
    // 外部送信API
    '/api/messaging/line/send': { feature: 'enableLineMessaging', warningType: 'line' },
    '/api/messaging/instagram/send': { feature: 'enableInstagramDM', warningType: 'instagram' },
    '/api/messaging/sms/send': { feature: 'enableSMSSending', warningType: 'sms' },
    '/api/messaging/email/send': { feature: 'enableEmailBulkSend', warningType: 'email' },
    // 決済API
    '/api/payments/process': { feature: 'enablePayments', warningType: 'payment' },
    '/api/payments/refund': { feature: 'enablePayments', warningType: 'payment' },
    // エクスポートAPI
    '/api/analytics/export': { feature: 'enableAnalyticsExport', warningType: 'analytics_export' },
    '/api/reports/generate': { feature: 'enablePDFReports', warningType: 'pdf_reports' },
    // プッシュ通知API
    '/api/notifications/push': { feature: 'enablePushNotifications', warningType: 'push_notifications' },
    '/api/notifications/test': { feature: 'enablePushNotifications', warningType: 'push_notifications' }
};
/**
 * 環境制限チェックミドルウェア
 */
export const environmentMiddleware = async (request) => {
    const config = getEnvironmentConfig();
    // 制限対象エンドポイントかチェック
    const restriction = Object.entries(RESTRICTED_ENDPOINTS).find(([endpoint]) => request.url.includes(endpoint));
    if (restriction) {
        const [endpoint, { feature, warningType }] = restriction;
        // 機能が無効化されているかチェック
        if (!isFeatureEnabled(feature)) {
            // デバッグログ出力
            if (config.debugMode) {
                console.warn(`🚫 API call blocked by environment restriction`, {
                    endpoint,
                    feature,
                    environment: config.isDevelopment ? 'development' : 'production',
                    request: {
                        url: request.url,
                        method: request.method
                    }
                });
            }
            return {
                success: false,
                error: getRestrictionMessage(warningType),
                restrictedByEnvironment: true
            };
        }
    }
    // 制限がない場合は実際のAPI呼び出しを実行
    return await executeAPICall(request);
};
/**
 * 実際のAPI呼び出しを実行
 */
const executeAPICall = async (request) => {
    const config = getEnvironmentConfig();
    try {
        const response = await fetch(request.url, {
            method: request.method,
            headers: {
                'Content-Type': 'application/json',
                ...request.headers
            },
            body: request.body ? JSON.stringify(request.body) : undefined
        });
        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        // 成功ログ
        if (config.debugMode) {
            console.log(`✅ API call successful`, {
                url: request.url,
                method: request.method,
                status: response.status
            });
        }
        return {
            success: true,
            data
        };
    }
    catch (error) {
        console.error(`❌ API call failed`, {
            url: request.url,
            method: request.method,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        return {
            success: false,
            error: error instanceof Error ? error.message : 'API呼び出しに失敗しました'
        };
    }
};
/**
 * 制限メッセージを取得
 */
const getRestrictionMessage = (warningType) => {
    const messages = {
        line: 'LINE メッセージ送信は本番環境でのみ利用可能です',
        instagram: 'Instagram DM送信は本番環境でのみ利用可能です',
        sms: 'SMS送信は本番環境でのみ利用可能です',
        email: 'メール一斉配信は本番環境でのみ利用可能です',
        payment: '決済処理は本番環境でのみ利用可能です',
        analytics_export: 'データエクスポートは本番環境でのみ利用可能です',
        pdf_reports: 'PDFレポート生成は本番環境でのみ利用可能です',
        push_notifications: 'プッシュ通知は本番環境でのみ利用可能です'
    };
    return messages[warningType] || 'この機能は本番環境でのみ利用可能です';
};
/**
 * 環境制限付きfetch関数
 */
export const restrictedFetch = async (url, options = {}) => {
    const request = {
        url,
        method: options.method || 'GET',
        headers: options.headers,
        body: options.body
    };
    return await environmentMiddleware(request);
};
/**
 * 環境情報の検証
 */
export const validateEnvironment = () => {
    const config = getEnvironmentConfig();
    // 必須の環境変数チェック
    const requiredVars = ['VITE_APP_ENV', 'VITE_API_BASE_URL'];
    const missingVars = requiredVars.filter(varName => !import.meta.env[varName]);
    if (missingVars.length > 0) {
        console.error('❌ Missing required environment variables:', missingVars);
        return false;
    }
    // 環境設定の検証
    if (!config.isDevelopment && !config.isProduction) {
        console.error('❌ Invalid environment configuration');
        return false;
    }
    console.log('✅ Environment validation passed', {
        environment: config.isDevelopment ? 'development' : 'production',
        apiBaseURL: config.apiBaseURL
    });
    return true;
};
// 環境検証を起動時に実行
if (typeof window !== 'undefined') {
    validateEnvironment();
}
