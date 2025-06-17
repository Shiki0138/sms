import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Download, FileText, Table, AlertTriangle, Check } from 'lucide-react';
import { isFeatureEnabled, getEnvironmentConfig } from '../../utils/environment';
import ProductionWarningModal from '../Common/ProductionWarningModal';
const AnalyticsExport = () => {
    const [exportConfig, setExportConfig] = useState({
        format: 'excel',
        dateRange: 'month',
        includeCustomers: true,
        includeReservations: true,
        includeRevenue: true,
        includeAnalytics: false
    });
    const [isExporting, setIsExporting] = useState(false);
    const [isWarningOpen, setIsWarningOpen] = useState(false);
    const [currentFeature, setCurrentFeature] = useState('');
    const config = getEnvironmentConfig();
    const handleExport = async () => {
        // 環境制限チェック
        if (exportConfig.format === 'pdf' && !isFeatureEnabled('enablePDFReports')) {
            setCurrentFeature('pdf_reports');
            setIsWarningOpen(true);
            return;
        }
        if (!isFeatureEnabled('enableAnalyticsExport')) {
            setCurrentFeature('analytics_export');
            setIsWarningOpen(true);
            return;
        }
        setIsExporting(true);
        try {
            // 本番環境での実際のエクスポート処理
            if (config.isProduction) {
                await performExport();
            }
            else {
                // 開発環境では制限メッセージを表示
                setCurrentFeature('analytics_export');
                setIsWarningOpen(true);
            }
        }
        catch (error) {
            console.error('Export error:', error);
            alert('エクスポートに失敗しました');
        }
        finally {
            setIsExporting(false);
        }
    };
    const performExport = async () => {
        const exportData = {
            ...exportConfig,
            timestamp: new Date().toISOString()
        };
        const response = await fetch(`${config.apiBaseURL}/api/analytics/export`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(exportData)
        });
        if (!response.ok) {
            throw new Error('データエクスポートに失敗しました');
        }
        // ファイルダウンロード処理
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `salon-analytics-${new Date().toISOString().slice(0, 10)}.${exportConfig.format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        alert('データエクスポートが完了しました');
    };
    const getFormatIcon = (format) => {
        switch (format) {
            case 'csv':
                return _jsx(Table, { className: "w-4 h-4" });
            case 'excel':
                return _jsx(FileText, { className: "w-4 h-4" });
            case 'pdf':
                return _jsx(FileText, { className: "w-4 h-4" });
            default:
                return _jsx(Download, { className: "w-4 h-4" });
        }
    };
    return (_jsxs("div", { className: "bg-white rounded-lg p-6 border border-gray-200", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium text-gray-900", children: "\u30C7\u30FC\u30BF\u30A8\u30AF\u30B9\u30DD\u30FC\u30C8" }), _jsx("p", { className: "text-sm text-gray-600", children: "\u5206\u6790\u30C7\u30FC\u30BF\u3092\u69D8\u3005\u306A\u5F62\u5F0F\u3067\u30A8\u30AF\u30B9\u30DD\u30FC\u30C8\u3067\u304D\u307E\u3059" })] }), _jsx(Download, { className: "w-6 h-6 text-blue-600" })] }), config.isDevelopment && (_jsx("div", { className: "bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6", children: _jsxs("div", { className: "flex items-center", children: [_jsx(AlertTriangle, { className: "w-5 h-5 text-yellow-600 mr-2" }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-yellow-800", children: "\u958B\u767A\u74B0\u5883\u3067\u306E\u5236\u9650" }), _jsx("p", { className: "text-sm text-yellow-700 mt-1", children: "\u30C7\u30FC\u30BF\u30A8\u30AF\u30B9\u30DD\u30FC\u30C8\u6A5F\u80FD\u306F\u672C\u756A\u74B0\u5883\u3067\u306E\u307F\u5229\u7528\u53EF\u80FD\u3067\u3059\u3002" })] })] }) })), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-3", children: "\u30A8\u30AF\u30B9\u30DD\u30FC\u30C8\u5F62\u5F0F" }), _jsx("div", { className: "grid grid-cols-3 gap-3", children: [
                                    { key: 'csv', label: 'CSV', description: 'テーブル形式' },
                                    { key: 'excel', label: 'Excel', description: 'スプレッドシート' },
                                    { key: 'pdf', label: 'PDF', description: 'レポート形式' }
                                ].map((format) => (_jsxs("button", { onClick: () => setExportConfig(prev => ({ ...prev, format: format.key })), className: `p-3 border rounded-lg text-left transition-colors ${exportConfig.format === format.key
                                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                                        : 'border-gray-200 hover:border-gray-300'}`, children: [_jsxs("div", { className: "flex items-center space-x-2 mb-1", children: [getFormatIcon(format.key), _jsx("span", { className: "font-medium", children: format.label })] }), _jsx("div", { className: "text-xs text-gray-600", children: format.description })] }, format.key))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-3", children: "\u5BFE\u8C61\u671F\u9593" }), _jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: [
                                    { key: 'week', label: '過去1週間' },
                                    { key: 'month', label: '過去1ヶ月' },
                                    { key: 'quarter', label: '過去3ヶ月' },
                                    { key: 'year', label: '過去1年' }
                                ].map((range) => (_jsx("button", { onClick: () => setExportConfig(prev => ({ ...prev, dateRange: range.key })), className: `p-2 border rounded text-sm transition-colors ${exportConfig.dateRange === range.key
                                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                                        : 'border-gray-200 hover:border-gray-300'}`, children: range.label }, range.key))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-3", children: "\u30A8\u30AF\u30B9\u30DD\u30FC\u30C8\u5185\u5BB9" }), _jsx("div", { className: "space-y-3", children: [
                                    { key: 'includeCustomers', label: '顧客データ', description: '顧客リスト、来店履歴' },
                                    { key: 'includeReservations', label: '予約データ', description: '予約情報、キャンセル履歴' },
                                    { key: 'includeRevenue', label: '売上データ', description: '日別・月別売上、サービス別収益' },
                                    { key: 'includeAnalytics', label: '分析データ', description: '顧客分析、トレンドデータ' }
                                ].map((item) => (_jsxs("label", { className: "flex items-start space-x-3", children: [_jsx("input", { type: "checkbox", checked: exportConfig[item.key], onChange: (e) => setExportConfig(prev => ({
                                                ...prev,
                                                [item.key]: e.target.checked
                                            })), className: "mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500" }), _jsxs("div", { children: [_jsx("div", { className: "font-medium text-gray-900", children: item.label }), _jsx("div", { className: "text-sm text-gray-600", children: item.description })] })] }, item.key))) })] }), _jsx("div", { className: "pt-4 border-t border-gray-200", children: _jsx("button", { onClick: handleExport, disabled: isExporting, className: "w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed", children: isExporting ? (_jsxs("div", { className: "flex items-center justify-center space-x-2", children: [_jsx("div", { className: "animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" }), _jsx("span", { children: "\u30A8\u30AF\u30B9\u30DD\u30FC\u30C8\u4E2D..." })] })) : (_jsxs("div", { className: "flex items-center justify-center space-x-2", children: [_jsx(Download, { className: "w-4 h-4" }), _jsx("span", { children: "\u30C7\u30FC\u30BF\u3092\u30A8\u30AF\u30B9\u30DD\u30FC\u30C8" })] })) }) }), _jsx("div", { className: "bg-gray-50 rounded-lg p-4", children: _jsxs("div", { className: "flex items-start space-x-2", children: [_jsx(Check, { className: "w-5 h-5 text-green-600 mt-0.5" }), _jsxs("div", { children: [_jsx("h5", { className: "text-sm font-medium text-gray-900 mb-1", children: "\u30A8\u30AF\u30B9\u30DD\u30FC\u30C8\u306B\u3064\u3044\u3066" }), _jsxs("ul", { className: "text-xs text-gray-600 space-y-1", children: [_jsx("li", { children: "\u2022 \u30A8\u30AF\u30B9\u30DD\u30FC\u30C8\u3057\u305F\u30C7\u30FC\u30BF\u306F\u500B\u4EBA\u60C5\u5831\u3092\u542B\u307F\u307E\u3059" }), _jsx("li", { children: "\u2022 \u30C7\u30FC\u30BF\u306E\u53D6\u308A\u6271\u3044\u306B\u306F\u5341\u5206\u6CE8\u610F\u3057\u3066\u304F\u3060\u3055\u3044" }), _jsx("li", { children: "\u2022 \u5927\u91CF\u30C7\u30FC\u30BF\u306E\u5834\u5408\u3001\u51E6\u7406\u306B\u6642\u9593\u304C\u304B\u304B\u308B\u5834\u5408\u304C\u3042\u308A\u307E\u3059" }), _jsx("li", { children: "\u2022 PDF\u30EC\u30DD\u30FC\u30C8\u306F\u5206\u6790\u7D50\u679C\u3092\u8996\u899A\u7684\u306B\u8868\u793A\u3057\u307E\u3059" })] })] })] }) })] }), _jsx(ProductionWarningModal, { isOpen: isWarningOpen, onClose: () => setIsWarningOpen(false), feature: currentFeature, type: "warning", showDetails: true })] }));
};
export default AnalyticsExport;
