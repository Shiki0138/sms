import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { PLAN_NAMES, PLAN_PRICING } from '../../types/subscription';
import { Check, Crown, Zap, Shield, AlertTriangle, Calendar } from 'lucide-react';
const SubscriptionManagement = () => {
    const { subscriptionInfo, currentPlan, limits, features, upgradePlan } = useSubscription();
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(currentPlan);
    const [isUpgrading, setIsUpgrading] = useState(false);
    const getPlanIcon = (plan) => {
        switch (plan) {
            case 'light':
                return _jsx(Shield, { className: "w-6 h-6 text-green-500" });
            case 'standard':
                return _jsx(Zap, { className: "w-6 h-6 text-orange-500" });
            case 'premium_ai':
                return _jsx(Crown, { className: "w-6 h-6 text-purple-500" });
        }
    };
    const getUsageColor = (current, max) => {
        if (max === -1)
            return 'text-green-600';
        const percentage = (current / max) * 100;
        if (percentage >= 90)
            return 'text-red-600';
        if (percentage >= 70)
            return 'text-yellow-600';
        return 'text-green-600';
    };
    const handleUpgrade = async () => {
        if (selectedPlan === currentPlan)
            return;
        setIsUpgrading(true);
        try {
            const success = await upgradePlan(selectedPlan);
            if (success) {
                setShowUpgradeModal(false);
                // 成功通知
            }
        }
        catch (error) {
            console.error('アップグレードに失敗:', error);
        }
        finally {
            setIsUpgrading(false);
        }
    };
    if (!subscriptionInfo) {
        return _jsx("div", { children: "\u8AAD\u307F\u8FBC\u307F\u4E2D..." });
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [getPlanIcon(currentPlan), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900", children: PLAN_NAMES[currentPlan] }), _jsx("p", { className: "text-gray-600", children: "\u73FE\u5728\u306E\u3054\u5951\u7D04\u30D7\u30E9\u30F3" })] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "text-2xl font-bold text-gray-900", children: ["\u00A5", PLAN_PRICING[currentPlan].monthly.toLocaleString()] }), _jsx("div", { className: "text-sm text-gray-600", children: "/ \u6708" })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6", children: [_jsxs("div", { className: "bg-gray-50 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-sm font-medium text-gray-600", children: "\u30B9\u30BF\u30C3\u30D5" }), _jsxs("span", { className: `text-sm font-bold ${getUsageColor(subscriptionInfo.currentUsage.staffCount, limits.maxStaff)}`, children: [subscriptionInfo.currentUsage.staffCount, limits.maxStaff === -1 ? ' / 無制限' : ` / ${limits.maxStaff}`] })] }), limits.maxStaff !== -1 && (_jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: `h-2 rounded-full ${(subscriptionInfo.currentUsage.staffCount / limits.maxStaff) >= 0.9 ? 'bg-red-500' :
                                                (subscriptionInfo.currentUsage.staffCount / limits.maxStaff) >= 0.7 ? 'bg-yellow-500' : 'bg-green-500'}`, style: { width: `${Math.min(100, (subscriptionInfo.currentUsage.staffCount / limits.maxStaff) * 100)}%` } }) }))] }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-sm font-medium text-gray-600", children: "\u9867\u5BA2" }), _jsxs("span", { className: `text-sm font-bold ${getUsageColor(subscriptionInfo.currentUsage.customerCount, limits.maxCustomers)}`, children: [subscriptionInfo.currentUsage.customerCount, limits.maxCustomers === -1 ? ' / 無制限' : ` / ${limits.maxCustomers}`] })] }), limits.maxCustomers !== -1 && (_jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: `h-2 rounded-full ${(subscriptionInfo.currentUsage.customerCount / limits.maxCustomers) >= 0.9 ? 'bg-red-500' :
                                                (subscriptionInfo.currentUsage.customerCount / limits.maxCustomers) >= 0.7 ? 'bg-yellow-500' : 'bg-green-500'}`, style: { width: `${Math.min(100, (subscriptionInfo.currentUsage.customerCount / limits.maxCustomers) * 100)}%` } }) }))] }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-sm font-medium text-gray-600", children: "AI\u8FD4\u4FE1" }), _jsxs("span", { className: `text-sm font-bold ${getUsageColor(subscriptionInfo.currentUsage.aiRepliesThisMonth, limits.maxAIRepliesPerMonth)}`, children: [subscriptionInfo.currentUsage.aiRepliesThisMonth, limits.maxAIRepliesPerMonth === -1 ? ' / 無制限' : ` / ${limits.maxAIRepliesPerMonth}`] })] }), limits.maxAIRepliesPerMonth !== -1 && limits.maxAIRepliesPerMonth > 0 && (_jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: `h-2 rounded-full ${(subscriptionInfo.currentUsage.aiRepliesThisMonth / limits.maxAIRepliesPerMonth) >= 0.9 ? 'bg-red-500' :
                                                (subscriptionInfo.currentUsage.aiRepliesThisMonth / limits.maxAIRepliesPerMonth) >= 0.7 ? 'bg-yellow-500' : 'bg-green-500'}`, style: { width: `${Math.min(100, (subscriptionInfo.currentUsage.aiRepliesThisMonth / limits.maxAIRepliesPerMonth) * 100)}%` } }) }))] }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-sm font-medium text-gray-600", children: "\u30A8\u30AF\u30B9\u30DD\u30FC\u30C8" }), _jsxs("span", { className: `text-sm font-bold ${getUsageColor(subscriptionInfo.currentUsage.dataExportsThisMonth, limits.maxDataExport)}`, children: [subscriptionInfo.currentUsage.dataExportsThisMonth, limits.maxDataExport === -1 ? ' / 無制限' : ` / ${limits.maxDataExport}`] })] }), limits.maxDataExport !== -1 && limits.maxDataExport > 0 && (_jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: `h-2 rounded-full ${(subscriptionInfo.currentUsage.dataExportsThisMonth / limits.maxDataExport) >= 0.9 ? 'bg-red-500' :
                                                (subscriptionInfo.currentUsage.dataExportsThisMonth / limits.maxDataExport) >= 0.7 ? 'bg-yellow-500' : 'bg-green-500'}`, style: { width: `${Math.min(100, (subscriptionInfo.currentUsage.dataExportsThisMonth / limits.maxDataExport) * 100)}%` } }) }))] })] }), _jsx("div", { className: "border-t border-gray-200 pt-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Calendar, { className: "w-4 h-4 text-gray-500" }), _jsxs("span", { className: "text-sm text-gray-600", children: ["\u6B21\u56DE\u8ACB\u6C42\u65E5: ", new Date(subscriptionInfo.nextBillingDate).toLocaleDateString('ja-JP')] })] }), _jsxs("div", { className: "flex space-x-2", children: [_jsx("div", { className: "flex space-x-1 bg-gray-100 rounded-lg p-1", children: ['light', 'standard', 'premium_ai'].map((plan) => (_jsx("button", { onClick: () => upgradePlan(plan), className: `px-3 py-1 rounded-md text-xs font-medium transition-colors ${currentPlan === plan
                                                    ? 'bg-white text-gray-900 shadow-sm'
                                                    : 'text-gray-600 hover:text-gray-900'}`, children: plan === 'light' ? 'ライト' : plan === 'standard' ? 'スタンダード' : 'AI' }, plan))) }), _jsx("button", { onClick: () => setShowUpgradeModal(true), className: "bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors", children: "\u8A73\u7D30\u5909\u66F4" })] })] }) })] }), _jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "\u5229\u7528\u53EF\u80FD\u306A\u6A5F\u80FD" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: Object.entries(features).map(([feature, enabled]) => (_jsxs("div", { className: "flex items-center space-x-2", children: [enabled ? (_jsx(Check, { className: "w-4 h-4 text-green-500" })) : (_jsx(AlertTriangle, { className: "w-4 h-4 text-gray-400" })), _jsx("span", { className: `text-sm ${enabled ? 'text-gray-900' : 'text-gray-500'}`, children: getFeatureName(feature) })] }, feature))) })] }), showUpgradeModal && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-96 overflow-y-auto", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900 mb-6", children: "\u30D7\u30E9\u30F3\u5909\u66F4" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6 mb-6", children: ['light', 'standard', 'premium_ai'].map((plan) => (_jsxs("div", { className: `border rounded-lg p-4 cursor-pointer transition-all ${selectedPlan === plan
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'}`, onClick: () => setSelectedPlan(plan), children: [_jsxs("div", { className: "flex items-center space-x-2 mb-3", children: [getPlanIcon(plan), _jsx("h3", { className: "font-semibold text-gray-900", children: PLAN_NAMES[plan] })] }), _jsxs("div", { className: "text-2xl font-bold text-gray-900 mb-2", children: ["\u00A5", PLAN_PRICING[plan].monthly.toLocaleString()] }), _jsx("div", { className: "text-sm text-gray-600 mb-4", children: "/ \u6708" }), _jsxs("div", { className: "text-xs text-gray-600", children: ["\u521D\u671F\u8CBB\u7528: \u00A5", PLAN_PRICING[plan].setup.toLocaleString()] })] }, plan))) }), _jsxs("div", { className: "flex justify-end space-x-3", children: [_jsx("button", { onClick: () => setShowUpgradeModal(false), className: "px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors", children: "\u30AD\u30E3\u30F3\u30BB\u30EB" }), _jsx("button", { onClick: handleUpgrade, disabled: isUpgrading || selectedPlan === currentPlan, className: "bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed", children: isUpgrading ? '変更中...' : 'プランを変更' })] })] }) }))] }));
};
const getFeatureName = (feature) => {
    const featureNames = {
        reservationManagement: '予約管理',
        customerManagement: '顧客管理',
        messageManagement: 'メッセージ管理',
        calendarView: 'カレンダー表示',
        basicReporting: '基本レポート',
        aiReplyGeneration: 'AI返信生成',
        aiAnalytics: 'AI分析',
        customerAnalytics: '顧客分析',
        revenueAnalytics: '売上分析',
        performanceAnalytics: 'パフォーマンス分析',
        advancedReporting: '高度なレポート',
        lineIntegration: 'LINE連携',
        instagramIntegration: 'Instagram連携',
        csvExport: 'CSVエクスポート',
        pdfExport: 'PDFエクスポート',
        userManagement: 'ユーザー管理',
        systemSettings: 'システム設定',
        backupSettings: 'バックアップ設定',
        notificationSettings: '通知設定',
        customReports: 'カスタムレポート',
        apiAccess: 'API アクセス'
    };
    return featureNames[feature] || feature;
};
export default SubscriptionManagement;
