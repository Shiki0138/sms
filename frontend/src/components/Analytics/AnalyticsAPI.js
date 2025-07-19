/**
 * Analytics API Integration Service
 * 分析ダッシュボードとバックエンドAPIの統合
 */
class AnalyticsAPI {
    baseURL;
    token;
    constructor() {
        this.baseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
        this.token = localStorage.getItem('token');
    }
    async makeRequest(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`,
                    ...options.headers,
                },
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || `API Error: ${response.status}`);
            }
            return {
                success: true,
                data: data.data || data,
                message: data.message,
            };
        }
        catch (error) {
            return {
                success: false,
                data: {},
                error: error instanceof Error ? error.message : 'Unknown error occurred',
            };
        }
    }
    /**
     * ダッシュボードKPIデータを取得
     */
    async getDashboardKPIs(tenantId) {
        return this.makeRequest(`/analytics/dashboard/${tenantId}`);
    }
    /**
     * チャーン分析データを取得
     */
    async getChurnAnalysis(tenantId) {
        return this.makeRequest(`/analytics/churn/${tenantId}`);
    }
    /**
     * 売上予測データを取得
     */
    async getRevenueForecast(tenantId) {
        return this.makeRequest(`/analytics/revenue-forecast/${tenantId}`);
    }
    /**
     * 予測インサイトデータを取得
     */
    async getPredictiveInsights(tenantId) {
        return this.makeRequest(`/analytics/predictive-insights/${tenantId}`);
    }
    /**
     * カスタム期間での分析データを取得
     */
    async getCustomAnalytics(tenantId, startDate, endDate, metrics) {
        const params = new URLSearchParams({
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            metrics: metrics.join(','),
        });
        return this.makeRequest(`/analytics/custom/${tenantId}?${params}`);
    }
    /**
     * RFM分析データを取得
     */
    async getRFMAnalysis(tenantId) {
        return this.makeRequest(`/analytics/rfm/${tenantId}`);
    }
    /**
     * 顧客セグメント分析を取得
     */
    async getCustomerSegments(tenantId) {
        return this.makeRequest(`/analytics/customer-segments/${tenantId}`);
    }
    /**
     * スタッフパフォーマンス分析を取得
     */
    async getStaffPerformance(tenantId) {
        return this.makeRequest(`/analytics/staff-performance/${tenantId}`);
    }
    /**
     * 在庫最適化データを取得
     */
    async getInventoryOptimization(tenantId) {
        return this.makeRequest(`/analytics/inventory-optimization/${tenantId}`);
    }
    /**
     * 顧客満足度分析を取得
     */
    async getCustomerSatisfaction(tenantId) {
        return this.makeRequest(`/analytics/customer-satisfaction/${tenantId}`);
    }
    /**
     * マーケティング効果分析を取得
     */
    async getMarketingEffectiveness(tenantId) {
        return this.makeRequest(`/analytics/marketing-effectiveness/${tenantId}`);
    }
    /**
     * 競合他社比較データを取得
     */
    async getCompetitorAnalysis(tenantId) {
        return this.makeRequest(`/analytics/competitor-analysis/${tenantId}`);
    }
    /**
     * カスタムレポート生成
     */
    async generateCustomReport(tenantId, reportConfig) {
        return this.makeRequest(`/analytics/reports/${tenantId}/generate`, {
            method: 'POST',
            body: JSON.stringify(reportConfig),
        });
    }
    /**
     * レポートの進捗状況を確認
     */
    async getReportStatus(reportId) {
        return this.makeRequest(`/analytics/reports/${reportId}/status`);
    }
    /**
     * 分析データをエクスポート
     */
    async exportAnalyticsData(tenantId, exportConfig) {
        return this.makeRequest(`/analytics/export/${tenantId}`, {
            method: 'POST',
            body: JSON.stringify(exportConfig),
        });
    }
    /**
     * 分析設定を保存
     */
    async saveAnalyticsSettings(tenantId, settings) {
        return this.makeRequest(`/analytics/settings/${tenantId}`, {
            method: 'POST',
            body: JSON.stringify(settings),
        });
    }
    /**
     * 分析設定を取得
     */
    async getAnalyticsSettings(tenantId) {
        return this.makeRequest(`/analytics/settings/${tenantId}`);
    }
    /**
     * アラート設定
     */
    async setAnalyticsAlerts(tenantId, alerts) {
        return this.makeRequest(`/analytics/alerts/${tenantId}`, {
            method: 'POST',
            body: JSON.stringify({ alerts }),
        });
    }
    /**
     * データ品質レポートを取得
     */
    async getDataQualityReport(tenantId) {
        return this.makeRequest(`/analytics/data-quality/${tenantId}`);
    }
    /**
     * A/Bテスト結果を取得
     */
    async getABTestResults(tenantId) {
        return this.makeRequest(`/analytics/ab-tests/${tenantId}`);
    }
    /**
     * 機械学習モデルの予測を取得
     */
    async getMLPredictions(tenantId, modelType) {
        return this.makeRequest(`/analytics/ml-predictions/${tenantId}/${modelType}`);
    }
    /**
     * ベンチマーク分析データを取得
     */
    async getBenchmarkAnalysis(tenantId, industry) {
        const params = industry ? `?industry=${industry}` : '';
        return this.makeRequest(`/analytics/benchmark/${tenantId}${params}`);
    }
}
// Singleton instance
export const analyticsAPI = new AnalyticsAPI();
// Hook for React components
export const useAnalyticsAPI = () => {
    return analyticsAPI;
};
// Error handling helper
export const handleAnalyticsError = (error) => {
    console.error('Analytics API Error:', error);
    // Show user-friendly error messages
    const userFriendlyErrors = {
        'Network request failed': 'ネットワーク接続を確認してください',
        'Unauthorized': '認証が必要です。再ログインしてください',
        'Forbidden': 'このデータにアクセスする権限がありません',
        'Not Found': '要求されたデータが見つかりません',
        'Internal Server Error': 'サーバーエラーが発生しました。しばらく待ってから再試行してください',
    };
    return userFriendlyErrors[error] || '予期しないエラーが発生しました';
};
