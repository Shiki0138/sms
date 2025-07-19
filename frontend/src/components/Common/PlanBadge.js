import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useSubscription } from '../../contexts/SubscriptionContext';
import { Shield, Zap, Crown, ChevronRight } from 'lucide-react';
import { PLAN_NAMES } from '../../types/subscription';
const PlanBadge = ({ showUpgradeButton = true, variant = 'compact', onUpgradeClick }) => {
    const { currentPlan, subscriptionInfo } = useSubscription();
    const getPlanIcon = () => {
        switch (currentPlan) {
            case 'light':
                return _jsx(Shield, { className: "w-4 h-4" });
            case 'standard':
                return _jsx(Zap, { className: "w-4 h-4" });
            case 'premium_ai':
                return _jsx(Crown, { className: "w-4 h-4" });
        }
    };
    const getPlanColor = () => {
        switch (currentPlan) {
            case 'light':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'standard':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'premium_ai':
                return 'bg-purple-100 text-purple-800 border-purple-200';
        }
    };
    const getUpgradeText = () => {
        switch (currentPlan) {
            case 'light':
                return 'AI機能・分析機能を利用する';
            case 'standard':
                return '無制限機能を利用する';
            default:
                return null;
        }
    };
    if (variant === 'compact') {
        return (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs("div", { className: `flex items-center space-x-1 px-2 py-1 rounded-lg border ${getPlanColor()}`, children: [getPlanIcon(), _jsx("span", { className: "text-xs font-medium", children: PLAN_NAMES[currentPlan] })] }), showUpgradeButton && currentPlan !== 'premium_ai' && (_jsxs("button", { onClick: onUpgradeClick, className: "flex items-center space-x-1 px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors", children: [_jsx("span", { children: "\u30A2\u30C3\u30D7\u30B0\u30EC\u30FC\u30C9" }), _jsx(ChevronRight, { className: "w-3 h-3" })] }))] }));
    }
    return (_jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-4", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex items-start space-x-3", children: [_jsx("div", { className: `p-2 rounded-lg ${getPlanColor()}`, children: getPlanIcon() }), _jsxs("div", { children: [_jsx("h3", { className: "font-medium text-gray-900", children: PLAN_NAMES[currentPlan] }), _jsxs("p", { className: "text-sm text-gray-600 mt-1", children: [currentPlan === 'light' && 'スタッフ3名、顧客500名まで', currentPlan === 'standard' && 'スタッフ10名、顧客2,000名、AI機能付き', currentPlan === 'premium_ai' && '無制限利用、全機能アクセス可能'] })] })] }), showUpgradeButton && currentPlan !== 'premium_ai' && (_jsx("button", { onClick: onUpgradeClick, className: "bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors", children: "\u30A2\u30C3\u30D7\u30B0\u30EC\u30FC\u30C9" }))] }), currentPlan !== 'premium_ai' && getUpgradeText() && (_jsx("div", { className: "mt-3 p-3 bg-blue-50 rounded-lg", children: _jsxs("p", { className: "text-sm text-blue-700", children: [_jsx("strong", { children: "\uD83D\uDCA1 \u30D2\u30F3\u30C8:" }), " ", getUpgradeText()] }) }))] }));
};
export default PlanBadge;
