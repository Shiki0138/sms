import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { PLAN_NAMES, PLAN_PRICING } from '../../types/subscription';
import PaymentForm from '../Payment/PaymentForm';
import FeatureComparison from './FeatureComparison';
import { Shield, Zap, Crown, Check, X, TrendingUp, Users, Brain, BarChart3, MessageSquare, Download, Sparkles, Clock, CreditCard, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
const UpgradePlan = () => {
    const { currentPlan, upgradePlan, subscriptionInfo } = useSubscription();
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [showDetailedComparison, setShowDetailedComparison] = useState(false);
    const plans = ['light', 'standard', 'premium_ai'];
    const getPlanIcon = (plan) => {
        switch (plan) {
            case 'light':
                return _jsx(Shield, { className: "w-8 h-8" });
            case 'standard':
                return _jsx(Zap, { className: "w-8 h-8" });
            case 'premium_ai':
                return _jsx(Crown, { className: "w-8 h-8" });
        }
    };
    const getPlanColor = (plan) => {
        switch (plan) {
            case 'light':
                return 'text-green-600 bg-green-100';
            case 'standard':
                return 'text-orange-600 bg-orange-100';
            case 'premium_ai':
                return 'text-purple-600 bg-purple-100';
        }
    };
    const getFeatureIcon = (feature) => {
        const icons = {
            staff: _jsx(Users, { className: "w-4 h-4" }),
            customers: _jsx(Users, { className: "w-4 h-4" }),
            ai: _jsx(Brain, { className: "w-4 h-4" }),
            analytics: _jsx(BarChart3, { className: "w-4 h-4" }),
            messaging: _jsx(MessageSquare, { className: "w-4 h-4" }),
            export: _jsx(Download, { className: "w-4 h-4" }),
            realtime: _jsx(Clock, { className: "w-4 h-4" }),
            premium: _jsx(Sparkles, { className: "w-4 h-4" })
        };
        return icons[feature] || null;
    };
    const planFeatures = {
        light: [
            { icon: 'staff', text: 'スタッフ3名まで', included: true },
            { icon: 'customers', text: '顧客500名まで', included: true },
            { icon: 'messaging', text: '基本メッセージ管理', included: true },
            { icon: 'export', text: 'CSVエクスポート（月3回）', included: true },
            { icon: 'ai', text: 'AI機能', included: false },
            { icon: 'analytics', text: '高度な分析', included: false },
            { icon: 'realtime', text: 'リアルタイムダッシュボード', included: false }
        ],
        standard: [
            { icon: 'staff', text: 'スタッフ10名まで', included: true },
            { icon: 'customers', text: '顧客2,000名まで', included: true },
            { icon: 'ai', text: 'AI返信機能（月200回）', included: true },
            { icon: 'analytics', text: '顧客分析・売上分析', included: true },
            { icon: 'messaging', text: 'LINE/Instagram連携', included: true },
            { icon: 'export', text: '無制限エクスポート', included: true },
            { icon: 'realtime', text: 'リアルタイムダッシュボード', included: false }
        ],
        premium_ai: [
            { icon: 'staff', text: '無制限スタッフ', included: true },
            { icon: 'customers', text: '無制限顧客', included: true },
            { icon: 'ai', text: '無制限AI機能', included: true },
            { icon: 'analytics', text: '高度AI分析・予測', included: true },
            { icon: 'messaging', text: '全チャネル統合', included: true },
            { icon: 'export', text: '無制限エクスポート', included: true },
            { icon: 'realtime', text: 'リアルタイムダッシュボード', included: true },
            { icon: 'premium', text: '優先サポート・API アクセス', included: true }
        ]
    };
    const handleUpgrade = async () => {
        if (!selectedPlan || selectedPlan === currentPlan)
            return;
        setIsProcessing(true);
        try {
            // 実際の実装では、ここで決済処理を行う
            await new Promise(resolve => setTimeout(resolve, 2000));
            const success = await upgradePlan(selectedPlan);
            if (success) {
                // 成功通知
                alert(`${PLAN_NAMES[selectedPlan]}へのアップグレードが完了しました！`);
                setSelectedPlan(null);
                setShowPaymentForm(false);
            }
        }
        catch (error) {
            console.error('アップグレードエラー:', error);
            alert('アップグレードに失敗しました。もう一度お試しください。');
        }
        finally {
            setIsProcessing(false);
        }
    };
    const calculateSavings = (plan) => {
        if (plan === 'standard' && currentPlan === 'light') {
            return {
                aiCost: 200 * 500, // AI返信200回分の価値
                analyticsCost: 50000, // 分析ツールの価値
                total: 150000
            };
        }
        if (plan === 'premium_ai') {
            return {
                aiCost: -1, // 無制限
                analyticsCost: 200000, // 高度分析の価値
                total: 500000
            };
        }
        return null;
    };
    const handlePaymentSuccess = () => {
        setShowPaymentForm(false);
        setSelectedPlan(null);
        // アップグレード成功の通知
        alert(`${PLAN_NAMES[selectedPlan]}へのアップグレードが完了しました！`);
    };
    const handlePaymentCancel = () => {
        setShowPaymentForm(false);
    };
    // 決済フォーム表示時
    if (showPaymentForm && selectedPlan) {
        return (_jsx(PaymentForm, { selectedPlan: selectedPlan, onSuccess: handlePaymentSuccess, onCancel: handlePaymentCancel }));
    }
    return (_jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6 mb-6", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900 mb-2", children: "\u30D7\u30E9\u30F3\u3092\u30A2\u30C3\u30D7\u30B0\u30EC\u30FC\u30C9" }), _jsx("p", { className: "text-gray-600", children: "\u30D3\u30B8\u30CD\u30B9\u306E\u6210\u9577\u306B\u5408\u308F\u305B\u3066\u3001\u3088\u308A\u9AD8\u5EA6\u306A\u6A5F\u80FD\u3092\u3054\u5229\u7528\u3044\u305F\u3060\u3051\u307E\u3059" })] }), _jsx("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: `p-2 rounded-lg ${getPlanColor(currentPlan)}`, children: getPlanIcon(currentPlan) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-blue-700", children: "\u73FE\u5728\u306E\u30D7\u30E9\u30F3" }), _jsx("p", { className: "font-semibold text-blue-900", children: PLAN_NAMES[currentPlan] })] })] }), _jsxs("div", { className: "text-right", children: [PLAN_PRICING[currentPlan].originalPrice && (_jsxs("p", { className: "text-sm text-blue-600 line-through", children: ["\u00A5", PLAN_PRICING[currentPlan].originalPrice.toLocaleString()] })), _jsxs("p", { className: "text-2xl font-bold text-blue-900", children: ["\u00A5", PLAN_PRICING[currentPlan].monthly.toLocaleString()] }), _jsx("p", { className: "text-sm text-blue-700", children: "/ \u6708" })] })] }) }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6 mb-8", children: plans.map((plan) => {
                    const isCurrentPlan = plan === currentPlan;
                    const isDowngrade = plans.indexOf(plan) < plans.indexOf(currentPlan);
                    const isSelected = plan === selectedPlan;
                    return (_jsxs("div", { className: `relative bg-white rounded-lg border-2 transition-all ${isSelected
                            ? 'border-blue-500 shadow-xl'
                            : isCurrentPlan
                                ? 'border-gray-300'
                                : 'border-gray-200 hover:border-gray-300'} ${isDowngrade ? 'opacity-50' : ''}`, children: [plan === 'standard' && (_jsx("div", { className: "absolute -top-4 left-1/2 transform -translate-x-1/2", children: _jsx("span", { className: "bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium", children: "\u4EBA\u6C17No.1" }) })), _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "text-center mb-6", children: [_jsx("div", { className: `inline-flex p-3 rounded-lg mb-3 ${getPlanColor(plan)}`, children: getPlanIcon(plan) }), _jsx("h3", { className: "text-xl font-bold text-gray-900", children: PLAN_NAMES[plan] }), _jsxs("p", { className: "text-sm text-gray-600 mt-1", children: [plan === 'light' && '基本機能で始める', plan === 'standard' && '成長ビジネスに最適', plan === 'premium_ai' && 'エンタープライズ向け'] })] }), _jsxs("div", { className: "text-center mb-6", children: [PLAN_PRICING[plan].originalPrice && (_jsxs("div", { className: "text-lg text-gray-500 line-through mb-1", children: ["\u00A5", PLAN_PRICING[plan].originalPrice.toLocaleString()] })), _jsxs("div", { className: "text-3xl font-bold text-red-600", children: ["\u00A5", PLAN_PRICING[plan].monthly.toLocaleString()] }), _jsx("div", { className: "text-sm text-gray-600", children: "/ \u6708" }), PLAN_PRICING[plan].originalPrice && (_jsxs("div", { className: "mt-1 inline-flex items-center bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium", children: [Math.round((1 - PLAN_PRICING[plan].monthly / PLAN_PRICING[plan].originalPrice) * 100), "% OFF"] })), !isCurrentPlan && !isDowngrade && (_jsxs("div", { className: "mt-2 text-sm text-green-600 font-medium", children: ["\u521D\u671F\u8CBB\u7528: \u00A5", PLAN_PRICING[plan].setup.toLocaleString()] }))] }), _jsx("div", { className: "space-y-3 mb-6", children: planFeatures[plan].map((feature, index) => (_jsxs("div", { className: "flex items-start space-x-2", children: [_jsx("div", { className: `mt-0.5 ${feature.included ? 'text-green-500' : 'text-gray-400'}`, children: feature.included ? (_jsx(Check, { className: "w-4 h-4" })) : (_jsx(X, { className: "w-4 h-4" })) }), _jsxs("div", { className: "flex items-center space-x-1 flex-1", children: [_jsx("span", { className: "text-gray-400", children: getFeatureIcon(feature.icon) }), _jsx("span", { className: `text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400'}`, children: feature.text })] })] }, index))) }), isCurrentPlan ? (_jsx("button", { disabled: true, className: "w-full py-2 px-4 bg-gray-100 text-gray-500 rounded-lg font-medium cursor-not-allowed", children: "\u73FE\u5728\u306E\u30D7\u30E9\u30F3" })) : isDowngrade ? (_jsx("button", { disabled: true, className: "w-full py-2 px-4 bg-gray-100 text-gray-500 rounded-lg font-medium cursor-not-allowed", children: "\u30C0\u30A6\u30F3\u30B0\u30EC\u30FC\u30C9\u4E0D\u53EF" })) : (_jsx("button", { onClick: () => setSelectedPlan(plan), className: `w-full py-2 px-4 rounded-lg font-medium transition-colors ${isSelected
                                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`, children: isSelected ? '選択中' : 'このプランを選択' }))] })] }, plan));
                }) }), _jsx("div", { className: "mb-8", children: _jsxs("button", { onClick: () => setShowDetailedComparison(!showDetailedComparison), className: "w-full bg-white rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Sparkles, { className: "w-5 h-5 text-yellow-500" }), _jsx("span", { className: "font-medium text-gray-900", children: "\u5168\u6A5F\u80FD\u306E\u8A73\u7D30\u6BD4\u8F03\u3092\u898B\u308B" }), _jsx("span", { className: "text-sm text-gray-500", children: "\uFF08\u5404\u30D7\u30E9\u30F3\u3067\u5229\u7528\u53EF\u80FD\u306A\u6A5F\u80FD\u3092\u78BA\u8A8D\uFF09" })] }), showDetailedComparison ? (_jsx(ChevronUp, { className: "w-5 h-5 text-gray-400" })) : (_jsx(ChevronDown, { className: "w-5 h-5 text-gray-400" }))] }) }), showDetailedComparison && (_jsx("div", { className: "mb-8", children: _jsx(FeatureComparison, { currentPlan: currentPlan }) })), selectedPlan && selectedPlan !== currentPlan && (_jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6 mb-6", children: [_jsxs("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: [PLAN_NAMES[selectedPlan], "\u306B\u30A2\u30C3\u30D7\u30B0\u30EC\u30FC\u30C9\u3059\u308B\u7406\u7531"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-6", children: [_jsxs("div", { className: "bg-blue-50 rounded-lg p-4", children: [_jsx(TrendingUp, { className: "w-6 h-6 text-blue-600 mb-2" }), _jsx("h4", { className: "font-medium text-gray-900 mb-1", children: "\u58F2\u4E0A\u5411\u4E0A" }), _jsxs("p", { className: "text-sm text-gray-600", children: [selectedPlan === 'standard' && 'AI機能で顧客対応を効率化し、売上20%向上', selectedPlan === 'premium_ai' && '高度分析で売上を最大50%向上'] })] }), _jsxs("div", { className: "bg-green-50 rounded-lg p-4", children: [_jsx(Clock, { className: "w-6 h-6 text-green-600 mb-2" }), _jsx("h4", { className: "font-medium text-gray-900 mb-1", children: "\u6642\u9593\u524A\u6E1B" }), _jsxs("p", { className: "text-sm text-gray-600", children: [selectedPlan === 'standard' && '業務時間を月40時間削減', selectedPlan === 'premium_ai' && '業務時間を月100時間以上削減'] })] }), _jsxs("div", { className: "bg-purple-50 rounded-lg p-4", children: [_jsx(Sparkles, { className: "w-6 h-6 text-purple-600 mb-2" }), _jsx("h4", { className: "font-medium text-gray-900 mb-1", children: "\u9867\u5BA2\u6E80\u8DB3\u5EA6" }), _jsxs("p", { className: "text-sm text-gray-600", children: [selectedPlan === 'standard' && '顧客満足度15%向上', selectedPlan === 'premium_ai' && '顧客満足度30%以上向上'] })] })] }), calculateSavings(selectedPlan) && (_jsxs("div", { className: "bg-gray-50 rounded-lg p-4", children: [_jsx("h4", { className: "font-medium text-gray-900 mb-2", children: "\u671F\u5F85\u3055\u308C\u308BROI" }), _jsxs("p", { className: "text-sm text-gray-600 mb-2", children: [selectedPlan === 'standard' &&
                                        '月額費用の5倍以上の価値を提供。AI機能と分析機能により、売上向上と業務効率化を実現。', selectedPlan === 'premium_ai' &&
                                        '月額費用の10倍以上の価値を提供。無制限のAI機能と高度な分析により、ビジネスを大きく成長させます。'] }), _jsx("div", { className: "text-2xl font-bold text-green-600", children: calculateSavings(selectedPlan).total === -1
                                    ? '無限の価値'
                                    : `月間 ¥${calculateSavings(selectedPlan).total.toLocaleString()} 相当の価値` })] }))] })), selectedPlan && selectedPlan !== currentPlan && (_jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "\u30A2\u30C3\u30D7\u30B0\u30EC\u30FC\u30C9\u306E\u78BA\u8A8D" }), _jsxs("p", { className: "text-sm text-gray-600 mt-1", children: [PLAN_NAMES[currentPlan], " \u2192 ", PLAN_NAMES[selectedPlan]] })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-sm text-gray-600", children: "\u6708\u984D\u6599\u91D1\u306E\u5DEE\u984D" }), _jsxs("p", { className: "text-2xl font-bold text-gray-900", children: ["+\u00A5", (PLAN_PRICING[selectedPlan].monthly - PLAN_PRICING[currentPlan].monthly).toLocaleString()] })] })] }), _jsxs("button", { onClick: () => setShowPaymentForm(true), className: "w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2", children: [_jsx(CreditCard, { className: "w-5 h-5" }), _jsx("span", { children: "\u6C7A\u6E08\u60C5\u5831\u3092\u5165\u529B\u3057\u3066\u30A2\u30C3\u30D7\u30B0\u30EC\u30FC\u30C9" }), _jsx(ArrowRight, { className: "w-5 h-5" })] })] }))] }));
};
export default UpgradePlan;
