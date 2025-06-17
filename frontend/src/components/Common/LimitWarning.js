import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useSubscription } from '../../contexts/SubscriptionContext';
import { AlertTriangle, TrendingUp, Users, MessageSquare, Download } from 'lucide-react';
const LimitWarning = ({ limitType, currentValue, warningThreshold = 0.8, className = '' }) => {
    const { limits, getRemainingLimit, isWithinLimit } = useSubscription();
    const limit = limits[limitType];
    const remaining = getRemainingLimit(limitType, currentValue);
    const withinLimit = isWithinLimit(limitType, currentValue);
    // 無制限の場合は何も表示しない
    if (typeof limit === 'number' && limit === -1) {
        return null;
    }
    // 制限内で警告閾値に達していない場合は何も表示しない
    if (withinLimit && remaining !== null && remaining > limit * (1 - warningThreshold)) {
        return null;
    }
    const getIcon = () => {
        switch (limitType) {
            case 'maxStaff':
                return _jsx(Users, { className: "w-4 h-4" });
            case 'maxCustomers':
                return _jsx(TrendingUp, { className: "w-4 h-4" });
            case 'maxAIRepliesPerMonth':
                return _jsx(MessageSquare, { className: "w-4 h-4" });
            case 'maxDataExport':
                return _jsx(Download, { className: "w-4 h-4" });
            default:
                return _jsx(AlertTriangle, { className: "w-4 h-4" });
        }
    };
    const getTitle = () => {
        switch (limitType) {
            case 'maxStaff':
                return 'スタッフ登録数';
            case 'maxCustomers':
                return '顧客登録数';
            case 'maxAIRepliesPerMonth':
                return 'AI返信使用数';
            case 'maxDataExport':
                return 'データエクスポート回数';
            default:
                return '利用制限';
        }
    };
    const getMessage = () => {
        if (!withinLimit) {
            switch (limitType) {
                case 'maxStaff':
                    return `スタッフ登録数が上限（${limit}名）に達しています。新しいスタッフを追加するにはプランのアップグレードが必要です。`;
                case 'maxCustomers':
                    return `顧客登録数が上限（${limit}件）に達しています。新しい顧客を追加するにはプランのアップグレードが必要です。`;
                case 'maxAIRepliesPerMonth':
                    return `AI返信の月間利用回数が上限（${limit}回）に達しています。追加利用するにはプランのアップグレードが必要です。`;
                case 'maxDataExport':
                    return `データエクスポートの月間利用回数が上限（${limit}回）に達しています。追加利用するにはプランのアップグレードが必要です。`;
                default:
                    return '利用上限に達しています。プランのアップグレードをご検討ください。';
            }
        }
        // 警告段階
        const usagePercentage = Math.round(((currentValue / limit) * 100));
        return `利用量が${usagePercentage}%に達しています。残り${remaining}回です。`;
    };
    const getColor = () => {
        if (!withinLimit) {
            return {
                bg: 'bg-red-50',
                border: 'border-red-200',
                text: 'text-red-800',
                icon: 'text-red-500'
            };
        }
        return {
            bg: 'bg-yellow-50',
            border: 'border-yellow-200',
            text: 'text-yellow-800',
            icon: 'text-yellow-500'
        };
    };
    const colors = getColor();
    return (_jsx("div", { className: `${colors.bg} ${colors.border} border rounded-lg p-3 ${className}`, children: _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx("div", { className: `${colors.icon} mt-0.5`, children: getIcon() }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("div", { className: `font-medium ${colors.text} text-sm`, children: getTitle() }), _jsx("div", { className: `${colors.text} text-xs mt-1`, children: getMessage() }), _jsxs("div", { className: "mt-2", children: [_jsxs("div", { className: "flex justify-between text-xs text-gray-600 mb-1", children: [_jsx("span", { children: currentValue }), _jsx("span", { children: limit === -1 ? '無制限' : limit })] }), limit !== -1 && (_jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: `h-2 rounded-full ${!withinLimit ? 'bg-red-500' : 'bg-yellow-500'}`, style: {
                                            width: `${Math.min(100, (currentValue / limit) * 100)}%`
                                        } }) }))] }), !withinLimit && (_jsx("div", { className: "mt-3", children: _jsx("button", { className: "text-xs bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors", children: "\u30D7\u30E9\u30F3\u3092\u30A2\u30C3\u30D7\u30B0\u30EC\u30FC\u30C9" }) }))] })] }) }));
};
export default LimitWarning;
