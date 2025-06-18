import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Users, Calendar, Star, AlertTriangle, RefreshCw, Download, Target, BarChart3, Zap, Clock, CheckCircle } from 'lucide-react';
import { analyticsAPI, handleAnalyticsError } from './AnalyticsAPI';
import PremiumAnalyticsDashboard from './PremiumAnalyticsDashboard';
import RealtimeMetrics from './RealtimeMetrics';
const IntegratedAnalyticsDashboard = ({ tenantId, customers, reservations, showRealtimeMetrics = true }) => {
    const [state, setState] = useState({
        kpis: null,
        churnAnalysis: null,
        revenueForecast: null,
        predictiveInsights: null,
        customAnalytics: null,
        isLoading: {
            kpis: true,
            churn: true,
            forecast: true,
            insights: true,
            custom: false
        },
        errors: {
            kpis: null,
            churn: null,
            forecast: null,
            insights: null,
            custom: null
        },
        lastUpdate: null
    });
    const [refreshInterval, setRefreshInterval] = useState(300000); // 5分
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [selectedMetrics, setSelectedMetrics] = useState([
        'revenue', 'customers', 'churn', 'forecast'
    ]);
    // データ読み込み関数
    const loadAnalyticsData = useCallback(async (forceRefresh = false) => {
        const currentTime = new Date();
        // 最後の更新から5分以内の場合はスキップ（forceRefreshでない限り）
        if (!forceRefresh && state.lastUpdate &&
            (currentTime.getTime() - state.lastUpdate.getTime()) < 300000) {
            return;
        }
        setState(prev => ({
            ...prev,
            isLoading: {
                kpis: true,
                churn: true,
                forecast: true,
                insights: true,
                custom: false
            },
            errors: {
                kpis: null,
                churn: null,
                forecast: null,
                insights: null,
                custom: null
            }
        }));
        // 並列でデータを取得
        const promises = [
            analyticsAPI.getDashboardKPIs(tenantId),
            analyticsAPI.getChurnAnalysis(tenantId),
            analyticsAPI.getRevenueForecast(tenantId),
            analyticsAPI.getPredictiveInsights(tenantId)
        ];
        try {
            const [kpisResult, churnResult, forecastResult, insightsResult] = await Promise.allSettled(promises);
            setState(prev => ({
                ...prev,
                kpis: kpisResult.status === 'fulfilled' && kpisResult.value.success
                    ? kpisResult.value.data
                    : prev.kpis,
                churnAnalysis: churnResult.status === 'fulfilled' && churnResult.value.success
                    ? churnResult.value.data
                    : prev.churnAnalysis,
                revenueForecast: forecastResult.status === 'fulfilled' && forecastResult.value.success
                    ? forecastResult.value.data
                    : prev.revenueForecast,
                predictiveInsights: insightsResult.status === 'fulfilled' && insightsResult.value.success
                    ? insightsResult.value.data
                    : prev.predictiveInsights,
                isLoading: {
                    kpis: false,
                    churn: false,
                    forecast: false,
                    insights: false,
                    custom: false
                },
                errors: {
                    kpis: kpisResult.status === 'rejected' || (kpisResult.status === 'fulfilled' && !kpisResult.value.success)
                        ? handleAnalyticsError(kpisResult.status === 'rejected' ? kpisResult.reason : kpisResult.value.error || '')
                        : null,
                    churn: churnResult.status === 'rejected' || (churnResult.status === 'fulfilled' && !churnResult.value.success)
                        ? handleAnalyticsError(churnResult.status === 'rejected' ? churnResult.reason : churnResult.value.error || '')
                        : null,
                    forecast: forecastResult.status === 'rejected' || (forecastResult.status === 'fulfilled' && !forecastResult.value.success)
                        ? handleAnalyticsError(forecastResult.status === 'rejected' ? forecastResult.reason : forecastResult.value.error || '')
                        : null,
                    insights: insightsResult.status === 'rejected' || (insightsResult.status === 'fulfilled' && !insightsResult.value.success)
                        ? handleAnalyticsError(insightsResult.status === 'rejected' ? insightsResult.reason : insightsResult.value.error || '')
                        : null,
                    custom: null
                },
                lastUpdate: currentTime
            }));
        }
        catch (error) {
            console.error('Analytics data loading failed:', error);
        }
    }, [tenantId, state.lastUpdate]);
    // 初期データ読み込み
    useEffect(() => {
        loadAnalyticsData(true);
    }, [tenantId]);
    // 自動更新
    useEffect(() => {
        if (!autoRefresh)
            return;
        const interval = setInterval(() => {
            loadAnalyticsData();
        }, refreshInterval);
        return () => clearInterval(interval);
    }, [autoRefresh, refreshInterval, loadAnalyticsData]);
    // カスタムレポート生成
    const generateCustomReport = async (reportType) => {
        try {
            const result = await analyticsAPI.generateCustomReport(tenantId, {
                type: reportType,
                metrics: selectedMetrics,
                dateRange: {
                    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30日前
                    end: new Date()
                }
            });
            if (result.success) {
                // レポート生成成功の通知
                alert(`${reportType.toUpperCase()}レポートの生成を開始しました。完了後にダウンロードリンクをお送りします。`);
            }
            else {
                throw new Error(result.error || 'レポート生成に失敗しました');
            }
        }
        catch (error) {
            alert(handleAnalyticsError(error instanceof Error ? error.message : 'Unknown error'));
        }
    };
    // エラー表示コンポーネント
    const ErrorDisplay = ({ error, onRetry }) => (_jsxs("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(AlertTriangle, { className: "w-5 h-5 text-red-500 mr-2" }), _jsx("span", { className: "text-red-700 text-sm", children: error })] }), _jsx("button", { onClick: onRetry, className: "text-red-600 hover:text-red-800 text-sm font-medium", children: "\u518D\u8A66\u884C" })] }));
    // KPIカード表示
    const KPICard = ({ title, value, trend, icon, color, isLoading }) => (_jsxs("div", { className: "bg-white rounded-lg p-6 border border-gray-200", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: title }), isLoading ? (_jsx("div", { className: "h-8 bg-gray-200 rounded animate-pulse mt-2" })) : (_jsx("p", { className: "text-2xl font-bold text-gray-900 mt-2", children: value }))] }), _jsx("div", { className: `p-3 rounded-full ${color}`, children: icon })] }), trend !== undefined && !isLoading && (_jsxs("div", { className: "mt-4 flex items-center", children: [trend > 0 ? (_jsx(TrendingUp, { className: "w-4 h-4 text-green-500 mr-1" })) : (_jsx(TrendingDown, { className: "w-4 h-4 text-red-500 mr-1" })), _jsxs("span", { className: `text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`, children: [Math.abs(trend).toFixed(1), "%"] }), _jsx("span", { className: "text-sm text-gray-500 ml-1", children: "\u524D\u6708\u6BD4" })] }))] }));
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-3xl font-bold text-gray-900 flex items-center", children: [_jsx(BarChart3, { className: "w-8 h-8 mr-3 text-blue-600" }), "\u7D71\u5408\u5206\u6790\u30C0\u30C3\u30B7\u30E5\u30DC\u30FC\u30C9"] }), _jsx("p", { className: "text-gray-600 mt-1", children: "\u53F2\u4E0A\u6700\u9AD8\u30AF\u30AA\u30EA\u30C6\u30A3\u306E\u5206\u6790\u30B7\u30B9\u30C6\u30E0 - \u30EA\u30A2\u30EB\u30BF\u30A4\u30E0\u76E3\u8996\u30FB\u4E88\u6E2C\u5206\u6790\u30FBAI\u6D1E\u5BDF" })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [state.lastUpdate && (_jsxs("div", { className: "text-sm text-gray-500 flex items-center", children: [_jsx(Clock, { className: "w-4 h-4 mr-1" }), "\u6700\u7D42\u66F4\u65B0: ", state.lastUpdate.toLocaleTimeString('ja-JP')] })), _jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: autoRefresh, onChange: (e) => setAutoRefresh(e.target.checked), className: "h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" }), _jsx("span", { className: "ml-2 text-sm text-gray-700", children: "\u81EA\u52D5\u66F4\u65B0" })] }), _jsxs("button", { onClick: () => loadAnalyticsData(true), disabled: Object.values(state.isLoading).some(loading => loading), className: "flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50", children: [_jsx(RefreshCw, { className: `w-4 h-4 mr-1 ${Object.values(state.isLoading).some(loading => loading) ? 'animate-spin' : ''}` }), "\u66F4\u65B0"] }), _jsxs("div", { className: "relative group", children: [_jsxs("button", { className: "flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700", children: [_jsx(Download, { className: "w-4 h-4 mr-1" }), "\u30EC\u30DD\u30FC\u30C8"] }), _jsx("div", { className: "absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all", children: _jsxs("div", { className: "py-1", children: [_jsx("button", { onClick: () => generateCustomReport('pdf'), className: "block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100", children: "PDF\u30EC\u30DD\u30FC\u30C8" }), _jsx("button", { onClick: () => generateCustomReport('excel'), className: "block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100", children: "Excel\u30EC\u30DD\u30FC\u30C8" }), _jsx("button", { onClick: () => generateCustomReport('csv'), className: "block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100", children: "CSV\u30A8\u30AF\u30B9\u30DD\u30FC\u30C8" })] }) })] })] })] }), showRealtimeMetrics && (_jsxs("div", { className: "bg-white rounded-lg p-6 border border-gray-200", children: [_jsxs("h2", { className: "text-xl font-semibold text-gray-900 mb-4 flex items-center", children: [_jsx(Zap, { className: "w-5 h-5 mr-2 text-yellow-500" }), "\u30EA\u30A2\u30EB\u30BF\u30A4\u30E0\u76E3\u8996\u30B7\u30B9\u30C6\u30E0"] }), _jsx(RealtimeMetrics, { tenantId: tenantId })] })), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: [_jsx(KPICard, { title: "\u4ECA\u65E5\u306E\u58F2\u4E0A", value: state.kpis ? `¥${state.kpis.revenue.today.toLocaleString()}` : '---', trend: state.kpis?.revenue.trend, icon: _jsx(DollarSign, { className: "w-6 h-6 text-white" }), color: "bg-green-500", isLoading: state.isLoading.kpis }), _jsx(KPICard, { title: "\u7DCF\u9867\u5BA2\u6570", value: state.kpis?.customers.total || '---', trend: ((state.kpis?.customers.newThisMonth || 0) / (state.kpis?.customers.total || 1)) * 100, icon: _jsx(Users, { className: "w-6 h-6 text-white" }), color: "bg-blue-500", isLoading: state.isLoading.kpis }), _jsx(KPICard, { title: "\u4ECA\u65E5\u306E\u4E88\u7D04", value: state.kpis?.reservations.todayCount || '---', icon: _jsx(Calendar, { className: "w-6 h-6 text-white" }), color: "bg-purple-500", isLoading: state.isLoading.kpis }), _jsx(KPICard, { title: "\u9867\u5BA2\u6E80\u8DB3\u5EA6", value: state.kpis ? `${state.kpis.satisfaction.averageScore.toFixed(1)}` : '---', trend: state.kpis?.satisfaction.trend, icon: _jsx(Star, { className: "w-6 h-6 text-white" }), color: "bg-yellow-500", isLoading: state.isLoading.kpis })] }), Object.entries(state.errors).map(([key, error]) => error && (_jsx(ErrorDisplay, { error: error, onRetry: () => loadAnalyticsData(true) }, key))), _jsxs("div", { className: "bg-white rounded-lg p-6 border border-gray-200", children: [_jsxs("h2", { className: "text-xl font-semibold text-gray-900 mb-4 flex items-center", children: [_jsx(Target, { className: "w-5 h-5 mr-2 text-blue-600" }), "AI\u99C6\u52D5\u30D7\u30EC\u30DF\u30A2\u30E0\u5206\u6790\u30B7\u30B9\u30C6\u30E0"] }), _jsx(PremiumAnalyticsDashboard, { customers: customers, reservations: reservations, analytics: {
                            kpis: state.kpis,
                            churnAnalysis: state.churnAnalysis,
                            revenueForecast: state.revenueForecast,
                            predictiveInsights: state.predictiveInsights
                        } })] }), state.churnAnalysis && (_jsxs("div", { className: "bg-white rounded-lg p-6 border border-gray-200", children: [_jsxs("h2", { className: "text-xl font-semibold text-gray-900 mb-4 flex items-center", children: [_jsx(AlertTriangle, { className: "w-5 h-5 mr-2 text-red-500" }), "\u30C1\u30E3\u30FC\u30F3\u5206\u6790\u30FB\u9867\u5BA2\u30EA\u30B9\u30AF\u7BA1\u7406"] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-3", children: "\u9AD8\u30EA\u30B9\u30AF\u9867\u5BA2 (TOP 5)" }), _jsx("div", { className: "space-y-3", children: state.churnAnalysis.highRiskCustomers.slice(0, 5).map((customer, index) => (_jsxs("div", { className: "flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium text-gray-900", children: customer.customerName }), _jsxs("div", { className: "text-sm text-gray-600", children: ["\u6700\u7D42\u6765\u5E97: ", new Date(customer.lastVisit).toLocaleDateString('ja-JP')] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "text-lg font-bold text-red-600", children: [(customer.churnProbability * 100).toFixed(0), "%"] }), _jsx("div", { className: "text-xs text-gray-500", children: "\u96E2\u8131\u30EA\u30B9\u30AF" })] })] }, customer.customerId))) })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-3", children: "\u4E3B\u8981\u30C1\u30E3\u30FC\u30F3\u8981\u56E0" }), _jsx("div", { className: "space-y-3", children: state.churnAnalysis.churnFactors.map((factor, index) => (_jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-50 rounded-lg", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium text-gray-900", children: factor.factor }), _jsx("div", { className: "text-sm text-gray-600", children: factor.description })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "text-lg font-bold text-gray-900", children: [(factor.impact * 100).toFixed(0), "%"] }), _jsx("div", { className: "text-xs text-gray-500", children: "\u5F71\u97FF\u5EA6" })] })] }, index))) })] })] })] })), state.revenueForecast && (_jsxs("div", { className: "bg-white rounded-lg p-6 border border-gray-200", children: [_jsxs("h2", { className: "text-xl font-semibold text-gray-900 mb-4 flex items-center", children: [_jsx(TrendingUp, { className: "w-5 h-5 mr-2 text-green-500" }), "\u58F2\u4E0A\u4E88\u6E2C\u30FB\u5C06\u6765\u5C55\u671B"] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200", children: [_jsx("h3", { className: "text-lg font-medium text-green-900 mb-3", children: "\u6765\u6708\u58F2\u4E0A\u4E88\u6E2C" }), _jsxs("div", { className: "text-3xl font-bold text-green-900 mb-2", children: ["\u00A5", state.revenueForecast.nextMonth.predicted.toLocaleString()] }), _jsxs("div", { className: "text-sm text-green-700 mb-3", children: ["\u4FE1\u983C\u5EA6: ", (state.revenueForecast.nextMonth.confidence * 100).toFixed(0), "%"] }), _jsxs("div", { className: "space-y-1", children: [_jsx("div", { className: "text-sm font-medium text-green-800", children: "\u4E3B\u8981\u8981\u56E0:" }), state.revenueForecast.nextMonth.factors.map((factor, index) => (_jsxs("div", { className: "text-sm text-green-700", children: ["\u2022 ", factor] }, index)))] })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-3", children: "\u56DB\u534A\u671F\u4E88\u6E2C\u30C8\u30EC\u30F3\u30C9" }), _jsx("div", { className: "space-y-3", children: state.revenueForecast.quarterlyTrend.map((month, index) => (_jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-50 rounded-lg", children: [_jsx("div", { className: "font-medium text-gray-900", children: month.month }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "text-lg font-bold text-gray-900", children: ["\u00A5", month.predicted.toLocaleString()] }), month.historical > 0 && (_jsxs("div", { className: "text-sm text-gray-600", children: ["\u524D\u5E74: \u00A5", month.historical.toLocaleString()] }))] })] }, index))) })] })] })] })), _jsx("div", { className: "bg-gray-50 rounded-lg p-4 border border-gray-200", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(CheckCircle, { className: "w-5 h-5 text-green-500 mr-2" }), _jsx("span", { className: "text-sm font-medium text-gray-700", children: "\u7D71\u5408\u5206\u6790\u30B7\u30B9\u30C6\u30E0\u7A3C\u50CD\u4E2D" })] }), _jsxs("div", { className: "text-xs text-gray-500", children: ["\u6B21\u56DE\u81EA\u52D5\u66F4\u65B0: ", autoRefresh ? '5分後' : '手動のみ'] })] }) })] }));
};
export default IntegratedAnalyticsDashboard;
