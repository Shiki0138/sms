// サブスクリプションプラン関連の型定義（バックエンドと統一）
// プラン別設定（バックエンドと統一）
export const PLAN_CONFIGS = {
    light: {
        limits: {
            maxStaff: 3,
            maxCustomers: 500,
            maxAIRepliesPerMonth: 0, // AI機能なし
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
            // AI機能なし
            aiReplyGeneration: false,
            aiAnalytics: false,
            // 分析機能制限
            customerAnalytics: false,
            revenueAnalytics: false,
            performanceAnalytics: false,
            advancedReporting: false,
            // 外部連携なし
            lineIntegration: false,
            instagramIntegration: false,
            // エクスポート機能制限
            csvExport: true, // 基本CSVエクスポートのみ
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
            aiReplyGeneration: true, // 基本AI返信
            aiAnalytics: false, // 高度AI分析はなし
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
            systemSettings: true, // 基本設定は可能
            backupSettings: true,
            notificationSettings: true,
            // カスタマイズ制限
            customReports: false, // カスタムレポートはプレミアムのみ
            apiAccess: false // API アクセスはプレミアムのみ
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
            aiAnalytics: true, // 高度AI分析機能
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
            customReports: true, // カスタムレポート機能
            apiAccess: true // フルAPI アクセス
        }
    }
};
// プラン表示名（バックエンドと統一）
export const PLAN_NAMES = {
    light: 'ライトプラン',
    standard: 'スタンダードプラン',
    premium_ai: 'AIプレミアムプラン'
};
// プラン料金情報（バックエンドと統一）
export const PLAN_PRICING = {
    light: {
        setup: 128000,
        monthly: 9800,
        originalPrice: 29800, // 元の定価
        annual: 327800 // 1ヶ月分割引
    },
    standard: {
        setup: 128000,
        monthly: 29800,
        originalPrice: 49800, // 元の定価
        annual: 547800 // 1ヶ月分割引
    },
    premium_ai: {
        setup: 198000,
        monthly: 79800,
        originalPrice: 99800, // 元の定価
        annual: 877800 // 1ヶ月分割引
    }
};
