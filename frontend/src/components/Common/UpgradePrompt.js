import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { Sparkles, TrendingUp, Users, ArrowRight, X, Clock, BarChart3 } from 'lucide-react';
import { PLAN_NAMES, PLAN_PRICING } from '../../types/subscription';
const UpgradePrompt = ({ trigger, feature, onClose, onUpgrade, className = '' }) => {
    const { currentPlan, subscriptionInfo } = useSubscription();
    const navigate = useNavigate();
    const handleUpgrade = () => {
        if (onUpgrade) {
            onUpgrade();
        }
        else {
            navigate('/settings/upgrade');
        }
    };
    const getPromptContent = () => {
        switch (trigger) {
            case 'feature_locked':
                return {
                    title: '機能を利用するにはアップグレードが必要です',
                    description: `${feature}機能は${currentPlan === 'light' ? 'スタンダードプラン' : 'AIプレミアムプラン'}以上でご利用いただけます。`,
                    icon: _jsx(Sparkles, { className: "w-8 h-8 text-blue-600" }),
                    color: 'bg-blue-50 border-blue-200'
                };
            case 'usage_limit':
                return {
                    title: '使用量の上限に達しました',
                    description: '継続してご利用いただくために、プランのアップグレードをご検討ください。',
                    icon: _jsx(TrendingUp, { className: "w-8 h-8 text-orange-600" }),
                    color: 'bg-orange-50 border-orange-200'
                };
            case 'periodic_reminder':
                return {
                    title: 'ビジネスをさらに成長させませんか？',
                    description: 'より高度な機能で売上向上と業務効率化を実現できます。',
                    icon: _jsx(BarChart3, { className: "w-8 h-8 text-purple-600" }),
                    color: 'bg-purple-50 border-purple-200'
                };
            default:
                return {
                    title: 'プランをアップグレード',
                    description: 'より多くの機能をご利用いただけます。',
                    icon: _jsx(Sparkles, { className: "w-8 h-8 text-blue-600" }),
                    color: 'bg-blue-50 border-blue-200'
                };
        }
    };
    const getRecommendedPlan = () => {
        return currentPlan === 'light' ? 'standard' : 'premium_ai';
    };
    const getBenefits = () => {
        const recommendedPlan = getRecommendedPlan();
        if (recommendedPlan === 'standard') {
            return [
                { icon: _jsx(Users, { className: "w-4 h-4" }), text: 'スタッフ10名・顧客2,000名まで' },
                { icon: _jsx(Sparkles, { className: "w-4 h-4" }), text: 'AI返信機能（月200回）' },
                { icon: _jsx(BarChart3, { className: "w-4 h-4" }), text: '高度な分析・レポート機能' },
                { icon: _jsx(Clock, { className: "w-4 h-4" }), text: '業務時間40時間/月削減' }
            ];
        }
        else {
            return [
                { icon: _jsx(Users, { className: "w-4 h-4" }), text: '無制限のスタッフ・顧客登録' },
                { icon: _jsx(Sparkles, { className: "w-4 h-4" }), text: '無制限AI機能・高度分析' },
                { icon: _jsx(BarChart3, { className: "w-4 h-4" }), text: 'リアルタイムダッシュボード' },
                { icon: _jsx(Clock, { className: "w-4 h-4" }), text: '業務時間100時間/月以上削減' }
            ];
        }
    };
    const content = getPromptContent();
    const recommendedPlan = getRecommendedPlan();
    const benefits = getBenefits();
    return (_jsxs("div", { className: `rounded-lg border-2 ${content.color} p-6 ${className}`, children: [_jsxs("div", { className: "flex items-start justify-between mb-4", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [content.icon, _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-gray-900 text-lg", children: content.title }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: content.description })] })] }), onClose && (_jsx("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-600 transition-colors", children: _jsx(X, { className: "w-5 h-5" }) }))] }), _jsxs("div", { className: "bg-white rounded-lg p-4 mb-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("div", { children: [_jsxs("h4", { className: "font-medium text-gray-900", children: ["\u63A8\u5968: ", PLAN_NAMES[recommendedPlan]] }), _jsx("p", { className: "text-sm text-gray-600", children: recommendedPlan === 'standard' ? '成長ビジネスに最適' : 'エンタープライズ向け最高機能' })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "text-2xl font-bold text-gray-900", children: ["\u00A5", PLAN_PRICING[recommendedPlan].monthly.toLocaleString()] }), _jsx("div", { className: "text-sm text-gray-600", children: "/ \u6708" })] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-2 mb-4", children: benefits.map((benefit, index) => (_jsxs("div", { className: "flex items-center space-x-2 text-sm text-gray-700", children: [_jsx("span", { className: "text-green-600", children: benefit.icon }), _jsx("span", { children: benefit.text })] }, index))) })] }), _jsx("div", { className: "bg-green-50 rounded-lg p-3 mb-4", children: _jsxs("p", { className: "text-sm text-green-800", children: [_jsx("strong", { children: "\u6295\u8CC7\u5BFE\u52B9\u679C:" }), recommendedPlan === 'standard'
                            ? ' 月額費用の5倍以上の価値を提供（効率化により月15万円相当の価値創出）'
                            : ' 月額費用の10倍以上の価値を提供（効率化により月50万円以上の価値創出）'] }) }), _jsxs("div", { className: "flex space-x-3", children: [_jsxs("button", { onClick: handleUpgrade, className: "flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2", children: [_jsx("span", { children: "\u4ECA\u3059\u3050\u30A2\u30C3\u30D7\u30B0\u30EC\u30FC\u30C9" }), _jsx(ArrowRight, { className: "w-4 h-4" })] }), trigger !== 'usage_limit' && (_jsx("button", { onClick: onClose, className: "px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors", children: "\u5F8C\u3067" }))] })] }));
};
export default UpgradePrompt;
