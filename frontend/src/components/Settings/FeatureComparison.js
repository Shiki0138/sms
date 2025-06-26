import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Check, X, Sparkles } from 'lucide-react';
import { PLAN_CONFIGS } from '../../types/subscription';
const FeatureComparison = ({ currentPlan, compact = false }) => {
    // プラン設定から動的に機能情報を生成
    const features = [
        // 基本機能
        {
            category: '顧客管理',
            name: '顧客登録・編集',
            light: PLAN_CONFIGS.light.limits.maxCustomers === -1 ? '無制限' : `${PLAN_CONFIGS.light.limits.maxCustomers}名まで`,
            standard: PLAN_CONFIGS.standard.limits.maxCustomers === -1 ? '無制限' : `${PLAN_CONFIGS.standard.limits.maxCustomers.toLocaleString()}名まで`,
            premium_ai: '無制限'
        },
        { category: '顧客管理', name: '顧客写真管理', light: false, standard: true, premium_ai: true },
        { category: '顧客管理', name: '顧客セグメント分析', light: PLAN_CONFIGS.light.features.customerAnalytics, standard: PLAN_CONFIGS.standard.features.customerAnalytics, premium_ai: PLAN_CONFIGS.premium_ai.features.customerAnalytics },
        {
            category: 'スタッフ管理',
            name: 'スタッフ登録',
            light: `${PLAN_CONFIGS.light.limits.maxStaff}名まで`,
            standard: `${PLAN_CONFIGS.standard.limits.maxStaff}名まで`,
            premium_ai: '無制限'
        },
        { category: 'スタッフ管理', name: 'シフト管理', light: '基本', standard: '詳細', premium_ai: 'AI最適化' },
        { category: 'スタッフ管理', name: '権限管理', light: PLAN_CONFIGS.light.features.userManagement, standard: PLAN_CONFIGS.standard.features.userManagement, premium_ai: PLAN_CONFIGS.premium_ai.features.userManagement },
        // 予約管理
        { category: '予約管理', name: 'ドラッグ&ドロップ', light: true, standard: true, premium_ai: true },
        { category: '予約管理', name: '繰り返し予約', light: true, standard: true, premium_ai: true },
        { category: '予約管理', name: '予約リマインダー', light: '手動', standard: '自動', premium_ai: 'AI最適化' },
        { category: '予約管理', name: '空き時間検索', light: false, standard: true, premium_ai: 'AI提案' },
        // メッセージ機能
        { category: 'メッセージ', name: 'LINE連携 ✅', light: true, standard: true, premium_ai: true },
        { category: 'メッセージ', name: 'Instagram連携 ✅', light: true, standard: true, premium_ai: true },
        { category: 'メッセージ', name: '一括送信', light: '月10件', standard: '月500件', premium_ai: '無制限' },
        { category: 'メッセージ', name: 'AI自動返信', light: PLAN_CONFIGS.light.features.aiReplyGeneration, standard: '月200回', premium_ai: '無制限' },
        // AI機能
        { category: 'AI機能', name: '感情分析', light: false, standard: '基本', premium_ai: '高度' },
        { category: 'AI機能', name: '顧客行動予測', light: false, standard: false, premium_ai: true },
        { category: 'AI機能', name: '売上予測', light: false, standard: false, premium_ai: true },
        { category: 'AI機能', name: 'リスク顧客検知', light: false, standard: false, premium_ai: true },
        { category: 'AI機能', name: '最適メニュー提案', light: false, standard: false, premium_ai: true },
        // 分析・レポート
        { category: '分析', name: '売上推移', light: '月次', standard: '日次', premium_ai: 'リアルタイム' },
        { category: '分析', name: '顧客分析', light: PLAN_CONFIGS.light.features.customerAnalytics, standard: PLAN_CONFIGS.standard.features.customerAnalytics, premium_ai: PLAN_CONFIGS.premium_ai.features.customerAnalytics },
        { category: '分析', name: 'RFM分析', light: false, standard: false, premium_ai: true },
        { category: '分析', name: 'LTV分析', light: false, standard: false, premium_ai: true },
        { category: '分析', name: 'エクスポート', light: 'CSV月3回', standard: '無制限', premium_ai: '全形式対応' },
        // 決済・その他
        { category: '決済', name: 'Stripe連携', light: false, standard: true, premium_ai: true },
        { category: '決済', name: '複数決済対応', light: false, standard: false, premium_ai: true },
        { category: 'セキュリティ', name: '2段階認証', light: true, standard: true, premium_ai: true },
        { category: 'セキュリティ', name: 'IPアドレス制限', light: true, standard: true, premium_ai: true },
        { category: 'カスタマイズ', name: 'API利用', light: PLAN_CONFIGS.light.features.apiAccess, standard: PLAN_CONFIGS.standard.features.apiAccess, premium_ai: PLAN_CONFIGS.premium_ai.features.apiAccess },
        { category: 'サポート', name: 'サポート', light: 'メール＋チャット', standard: 'メール＋チャット', premium_ai: 'LINE＋チャット' }
    ];
    // カテゴリごとにグループ化
    const groupedFeatures = features.reduce((acc, feature) => {
        if (!acc[feature.category]) {
            acc[feature.category] = [];
        }
        acc[feature.category].push(feature);
        return acc;
    }, {});
    const getFeatureValue = (feature, plan) => {
        const value = feature[plan];
        if (typeof value === 'boolean') {
            return value ? (_jsx(Check, { className: "w-5 h-5 text-green-500 mx-auto" })) : (_jsx(X, { className: "w-5 h-5 text-gray-300 mx-auto" }));
        }
        return _jsx("span", { className: "text-sm font-medium", children: value });
    };
    const getPlanHighlight = (plan) => {
        if (plan === currentPlan)
            return 'bg-blue-50 border-blue-500';
        if (plan === 'standard')
            return 'border-orange-200';
        return 'border-gray-200';
    };
    if (compact) {
        // コンパクト表示（主要機能のみ）
        const keyFeatures = features.filter(f => ['顧客登録・編集', 'スタッフ登録', 'LINE連携', 'AI自動返信', '売上推移', 'サポート'].includes(f.name));
        return (_jsx("div", { className: "bg-white rounded-lg border border-gray-200 overflow-hidden", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { children: _jsxs("tr", { className: "bg-gray-50", children: [_jsx("th", { className: "px-4 py-3 text-left text-sm font-medium text-gray-700", children: "\u4E3B\u8981\u6A5F\u80FD" }), _jsx("th", { className: "px-4 py-3 text-center text-sm font-medium text-gray-700", children: "\u30E9\u30A4\u30C8" }), _jsx("th", { className: "px-4 py-3 text-center text-sm font-medium text-gray-700", children: "\u30B9\u30BF\u30F3\u30C0\u30FC\u30C9" }), _jsx("th", { className: "px-4 py-3 text-center text-sm font-medium text-gray-700", children: "AI\u30D7\u30EC\u30DF\u30A2\u30E0" })] }) }), _jsx("tbody", { children: keyFeatures.map((feature, index) => (_jsxs("tr", { className: "border-t border-gray-100", children: [_jsx("td", { className: "px-4 py-3 text-sm text-gray-700", children: feature.name }), _jsx("td", { className: "px-4 py-3 text-center", children: getFeatureValue(feature, 'light') }), _jsx("td", { className: "px-4 py-3 text-center", children: getFeatureValue(feature, 'standard') }), _jsx("td", { className: "px-4 py-3 text-center", children: getFeatureValue(feature, 'premium_ai') })] }, index))) })] }) }));
    }
    // フル表示
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [_jsxs("h3", { className: "text-lg font-semibold text-gray-900 mb-4 flex items-center", children: [_jsx(Sparkles, { className: "w-5 h-5 mr-2 text-yellow-500" }), "\u6A5F\u80FD\u8A73\u7D30\u6BD4\u8F03\u8868"] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b-2 border-gray-200", children: [_jsx("th", { className: "px-4 py-3 text-left text-sm font-medium text-gray-700", children: "\u6A5F\u80FD\u30AB\u30C6\u30B4\u30EA" }), _jsx("th", { className: "px-4 py-3 text-left text-sm font-medium text-gray-700", children: "\u6A5F\u80FD\u540D" }), _jsxs("th", { className: `px-4 py-3 text-center text-sm font-medium ${currentPlan === 'light' ? 'text-blue-700 bg-blue-50' : 'text-gray-700'}`, children: ["\u30E9\u30A4\u30C8\u30D7\u30E9\u30F3", currentPlan === 'light' && _jsx("div", { className: "text-xs font-normal mt-1", children: "\u73FE\u5728\u306E\u30D7\u30E9\u30F3" })] }), _jsxs("th", { className: `px-4 py-3 text-center text-sm font-medium ${currentPlan === 'standard' ? 'text-blue-700 bg-blue-50' : 'text-gray-700'}`, children: ["\u30B9\u30BF\u30F3\u30C0\u30FC\u30C9\u30D7\u30E9\u30F3", currentPlan === 'standard' && _jsx("div", { className: "text-xs font-normal mt-1", children: "\u73FE\u5728\u306E\u30D7\u30E9\u30F3" })] }), _jsxs("th", { className: `px-4 py-3 text-center text-sm font-medium ${currentPlan === 'premium_ai' ? 'text-blue-700 bg-blue-50' : 'text-gray-700'}`, children: ["AI\u30D7\u30EC\u30DF\u30A2\u30E0\u30D7\u30E9\u30F3", currentPlan === 'premium_ai' && _jsx("div", { className: "text-xs font-normal mt-1", children: "\u73FE\u5728\u306E\u30D7\u30E9\u30F3" })] })] }) }), _jsx("tbody", { children: Object.entries(groupedFeatures).map(([category, categoryFeatures]) => (_jsx(React.Fragment, { children: categoryFeatures.map((feature, index) => (_jsxs("tr", { className: "border-t border-gray-100 hover:bg-gray-50", children: [_jsx("td", { className: "px-4 py-3 text-sm text-gray-600", children: index === 0 && (_jsx("span", { className: "font-medium", children: category })) }), _jsx("td", { className: "px-4 py-3 text-sm text-gray-700", children: feature.name }), _jsx("td", { className: `px-4 py-3 text-center ${currentPlan === 'light' ? 'bg-blue-50' : ''}`, children: getFeatureValue(feature, 'light') }), _jsx("td", { className: `px-4 py-3 text-center ${currentPlan === 'standard' ? 'bg-blue-50' : ''}`, children: getFeatureValue(feature, 'standard') }), _jsx("td", { className: `px-4 py-3 text-center ${currentPlan === 'premium_ai' ? 'bg-blue-50' : ''}`, children: getFeatureValue(feature, 'premium_ai') })] }, `${category}-${index}`))) }, category))) })] }) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: `p-4 rounded-lg border-2 ${getPlanHighlight('light')}`, children: [_jsx("h4", { className: "font-semibold text-gray-900 mb-2", children: "\u30E9\u30A4\u30C8\u30D7\u30E9\u30F3" }), _jsx("p", { className: "text-sm text-gray-600", children: "\u500B\u4EBA\u30B5\u30ED\u30F3\u5411\u3051\u306E\u57FA\u672C\u6A5F\u80FD" }), _jsxs("ul", { className: "mt-2 space-y-1 text-sm text-gray-600", children: [_jsx("li", { children: "\u2022 \u9867\u5BA2\u7BA1\u7406 500\u540D\u307E\u3067" }), _jsx("li", { children: "\u2022 \u30B9\u30BF\u30C3\u30D5 3\u540D\u307E\u3067" }), _jsx("li", { children: "\u2022 \u57FA\u672C\u7684\u306A\u4E88\u7D04\u7BA1\u7406" })] })] }), _jsxs("div", { className: `p-4 rounded-lg border-2 ${getPlanHighlight('standard')}`, children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("h4", { className: "font-semibold text-gray-900", children: "\u30B9\u30BF\u30F3\u30C0\u30FC\u30C9\u30D7\u30E9\u30F3" }), _jsx("span", { className: "text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full", children: "\u4EBA\u6C17No.1" })] }), _jsx("p", { className: "text-sm text-gray-600", children: "\u6210\u9577\u4E2D\u306E\u30B5\u30ED\u30F3\u306B\u6700\u9069" }), _jsxs("ul", { className: "mt-2 space-y-1 text-sm text-gray-600", children: [_jsx("li", { children: "\u2022 LINE/Instagram\u9023\u643A" }), _jsx("li", { children: "\u2022 AI\u81EA\u52D5\u8FD4\u4FE1\uFF08\u6708200\u56DE\uFF09" }), _jsx("li", { children: "\u2022 \u58F2\u4E0A\u30FB\u9867\u5BA2\u5206\u6790" })] })] }), _jsxs("div", { className: `p-4 rounded-lg border-2 ${getPlanHighlight('premium_ai')}`, children: [_jsx("h4", { className: "font-semibold text-gray-900 mb-2", children: "AI\u30D7\u30EC\u30DF\u30A2\u30E0\u30D7\u30E9\u30F3" }), _jsx("p", { className: "text-sm text-gray-600", children: "\u5927\u898F\u6A21\u30B5\u30ED\u30F3\u30FB\u591A\u5E97\u8217\u5BFE\u5FDC" }), _jsxs("ul", { className: "mt-2 space-y-1 text-sm text-gray-600", children: [_jsx("li", { children: "\u2022 \u5168\u6A5F\u80FD\u7121\u5236\u9650" }), _jsx("li", { children: "\u2022 \u9AD8\u5EA6\u306AAI\u5206\u6790\u30FB\u4E88\u6E2C" }), _jsx("li", { children: "\u2022 LINE\uFF0B\u30C1\u30E3\u30C3\u30C8\u30B5\u30DD\u30FC\u30C8\uFF0824\u6642\u9593\uFF09" })] })] })] })] }));
};
export default FeatureComparison;
