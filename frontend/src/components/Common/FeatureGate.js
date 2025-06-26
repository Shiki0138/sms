import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { Lock, Crown, Zap } from 'lucide-react';
const FeatureGate = ({ feature, children, fallback, showUpgradePrompt = true }) => {
    const { hasFeature, currentPlan } = useSubscription();
    const navigate = useNavigate();
    if (hasFeature(feature)) {
        return _jsx(_Fragment, { children: children });
    }
    if (fallback) {
        return _jsx(_Fragment, { children: fallback });
    }
    if (!showUpgradePrompt) {
        return null;
    }
    const getUpgradeMessage = () => {
        switch (feature) {
            case 'aiReplyGeneration':
                return 'AI返信機能をご利用いただくには、スタンダードプラン以上へのアップグレードが必要です。';
            case 'customerAnalytics':
                return '顧客分析機能をご利用いただくには、スタンダードプラン以上へのアップグレードが必要です。';
            case 'lineIntegration':
                return 'LINE連携機能をご利用いただくには、スタンダードプラン以上へのアップグレードが必要です。';
            case 'instagramIntegration':
                return 'Instagram連携機能をご利用いただくには、スタンダードプラン以上へのアップグレードが必要です。';
            case 'csvExport':
                return 'CSVエクスポート機能をご利用いただくには、スタンダードプラン以上へのアップグレードが必要です。';
            case 'pdfExport':
                return 'PDFエクスポート機能をご利用いただくには、スタンダードプラン以上へのアップグレードが必要です。';
            case 'aiAnalytics':
                return '高度AI分析機能をご利用いただくには、AIプレミアムプランへのアップグレードが必要です。';
            case 'advancedReporting':
                return '高度なレポート機能をご利用いただくには、AIプレミアムプランへのアップグレードが必要です。';
            case 'userManagement':
                return 'ユーザー管理機能をご利用いただくには、スタンダードプラン以上へのアップグレードが必要です。';
            case 'systemSettings':
                return 'システム設定機能をご利用いただくには、スタンダードプラン以上へのアップグレードが必要です。';
            case 'customReports':
                return 'カスタムレポート機能をご利用いただくには、AIプレミアムプランへのアップグレードが必要です。';
            case 'apiAccess':
                return 'API アクセス機能をご利用いただくには、AIプレミアムプランへのアップグレードが必要です。';
            default:
                return 'この機能をご利用いただくには、プランのアップグレードが必要です。';
        }
    };
    const getRecommendedPlan = () => {
        switch (feature) {
            case 'aiReplyGeneration':
            case 'customerAnalytics':
            case 'lineIntegration':
            case 'instagramIntegration':
            case 'csvExport':
            case 'pdfExport':
            case 'userManagement':
            case 'systemSettings':
                return 'standard';
            case 'aiAnalytics':
            case 'advancedReporting':
            case 'customReports':
            case 'apiAccess':
                return 'premium_ai';
            default:
                return 'standard';
        }
    };
    const getPlanIcon = (plan) => {
        switch (plan) {
            case 'standard':
                return _jsx(Zap, { className: "w-5 h-5 text-orange-500" });
            case 'premium_ai':
                return _jsx(Crown, { className: "w-5 h-5 text-purple-500" });
            default:
                return _jsx(Lock, { className: "w-5 h-5 text-gray-500" });
        }
    };
    const getPlanName = (plan) => {
        switch (plan) {
            case 'standard':
                return 'スタンダードプラン';
            case 'premium_ai':
                return 'AIプレミアムプラン';
            default:
                return 'アップグレード';
        }
    };
    const recommendedPlan = getRecommendedPlan();
    return (_jsxs("div", { className: "bg-gray-50 border border-gray-200 rounded-lg p-6 text-center", children: [_jsx("div", { className: "flex justify-center mb-4", children: getPlanIcon(recommendedPlan) }), _jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "\u6A5F\u80FD\u5236\u9650" }), _jsx("p", { className: "text-gray-600 mb-4 text-sm", children: getUpgradeMessage() }), _jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-4 mb-4", children: [_jsxs("div", { className: "flex items-center justify-center space-x-2 mb-2", children: [getPlanIcon(recommendedPlan), _jsx("span", { className: "font-semibold text-gray-900", children: getPlanName(recommendedPlan) })] }), _jsxs("div", { className: "text-sm text-gray-600", children: [recommendedPlan === 'standard' && (_jsxs("div", { children: [_jsx("div", { className: "font-medium", children: "\u6708\u984D \u00A528,000" }), _jsx("div", { className: "text-xs text-gray-500 mt-1", children: "AI\u6A5F\u80FD\u30FB\u5206\u6790\u30FB\u30DE\u30FC\u30B1\u30C6\u30A3\u30F3\u30B0\u30FB\u5916\u90E8\u9023\u643A" })] })), recommendedPlan === 'premium_ai' && (_jsxs("div", { children: [_jsx("div", { className: "font-medium", children: "\u6708\u984D \u00A555,000" }), _jsx("div", { className: "text-xs text-gray-500 mt-1", children: "\u5168\u6A5F\u80FD\u30FB\u7121\u5236\u9650AI\u30FB\u9AD8\u5EA6\u5206\u6790\u30FB24\u6642\u9593\u30B5\u30DD\u30FC\u30C8" })] }))] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("button", { onClick: () => navigate('/settings/upgrade'), className: "w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium", children: "\u30D7\u30E9\u30F3\u3092\u30A2\u30C3\u30D7\u30B0\u30EC\u30FC\u30C9" }), _jsx("button", { onClick: () => navigate('/settings/upgrade'), className: "w-full text-blue-600 hover:text-blue-700 text-sm", children: "\u8A73\u7D30\u3092\u78BA\u8A8D\u3059\u308B" })] })] }));
};
export default FeatureGate;
