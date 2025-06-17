import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { CreditCard, Lock, AlertCircle, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';
import { PLAN_NAMES, PLAN_PRICING } from '../../types/subscription';
const PaymentForm = ({ selectedPlan, onSuccess, onCancel }) => {
    const { currentPlan, upgradePlan } = useSubscription();
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('demo');
    // デモ用カード情報
    const [cardInfo, setCardInfo] = useState({
        number: '4242 4242 4242 4242',
        expiry: '12/25',
        cvc: '123',
        name: 'テスト ユーザー'
    });
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsProcessing(true);
        setError(null);
        try {
            // デモ環境での処理
            await new Promise(resolve => setTimeout(resolve, 2000));
            if (paymentMethod === 'demo') {
                // デモ用のプラン変更
                const success = await upgradePlan(selectedPlan);
                if (success) {
                    onSuccess();
                }
                else {
                    throw new Error('プランの変更に失敗しました');
                }
            }
            else {
                // 実際の決済処理（本番環境用）
                const response = await fetch('/api/v1/payments/subscriptions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        planId: selectedPlan,
                        paymentMethodId: 'demo-payment-method',
                        metadata: {
                            upgrade_from: currentPlan,
                            payment_flow: 'upgrade'
                        }
                    })
                });
                const result = await response.json();
                if (result.success) {
                    onSuccess();
                }
                else {
                    throw new Error(result.error || '決済処理に失敗しました');
                }
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
        }
        finally {
            setIsProcessing(false);
        }
    };
    const monthlyDifference = PLAN_PRICING[selectedPlan].monthly - PLAN_PRICING[currentPlan].monthly;
    const setupFee = PLAN_PRICING[selectedPlan].setup;
    return (_jsx("div", { className: "max-w-2xl mx-auto", children: _jsxs("div", { className: "bg-white rounded-lg border border-gray-200 shadow-lg", children: [_jsxs("div", { className: "border-b border-gray-200 p-6", children: [_jsxs("button", { onClick: onCancel, className: "flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-4", children: [_jsx(ArrowLeft, { className: "w-4 h-4" }), _jsx("span", { children: "\u623B\u308B" })] }), _jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-2", children: "\u6C7A\u6E08\u60C5\u5831\u5165\u529B" }), _jsxs("p", { className: "text-gray-600", children: [PLAN_NAMES[currentPlan], " \u2192 ", PLAN_NAMES[selectedPlan]] })] }), _jsxs("div", { className: "p-6 bg-gray-50", children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-4", children: "\u6599\u91D1\u8A73\u7D30" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-gray-600", children: "\u30D7\u30E9\u30F3\u5DEE\u984D\uFF08\u6708\u984D\uFF09" }), _jsxs("span", { className: "font-medium", children: ["\u00A5", monthlyDifference.toLocaleString()] })] }), setupFee > 0 && (_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-gray-600", children: "\u521D\u671F\u8CBB\u7528" }), _jsxs("span", { className: "font-medium", children: ["\u00A5", setupFee.toLocaleString()] })] })), _jsxs("div", { className: "border-t border-gray-200 pt-2 flex justify-between font-semibold", children: [_jsx("span", { children: "\u4ECA\u6708\u306E\u8ACB\u6C42\u984D" }), _jsxs("span", { children: ["\u00A5", (monthlyDifference + setupFee).toLocaleString()] })] })] })] }), _jsxs("div", { className: "p-6 border-b border-gray-200", children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-4", children: "\u6C7A\u6E08\u65B9\u6CD5" }), _jsxs("div", { className: "grid grid-cols-1 gap-3 mb-4", children: [_jsxs("label", { className: "flex items-center p-3 border-2 border-orange-500 bg-orange-50 rounded-lg cursor-pointer", children: [_jsx("input", { type: "radio", name: "paymentMethod", value: "demo", checked: paymentMethod === 'demo', onChange: (e) => setPaymentMethod(e.target.value), className: "mr-3" }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "font-medium text-orange-900", children: "\u30C7\u30E2\u6C7A\u6E08" }), _jsx("div", { className: "text-sm text-orange-700", children: "\u5B9F\u969B\u306E\u6C7A\u6E08\u306F\u767A\u751F\u3057\u307E\u305B\u3093\uFF08\u958B\u767A\u30FB\u30C6\u30B9\u30C8\u7528\uFF09" })] })] }), _jsxs("label", { className: "flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer opacity-50", children: [_jsx("input", { type: "radio", name: "paymentMethod", value: "stripe", checked: paymentMethod === 'stripe', onChange: (e) => setPaymentMethod(e.target.value), disabled: true, className: "mr-3" }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "font-medium text-gray-900", children: "\u30AF\u30EC\u30B8\u30C3\u30C8\u30AB\u30FC\u30C9\uFF08Stripe\uFF09" }), _jsx("div", { className: "text-sm text-gray-600", children: "\u672C\u756A\u74B0\u5883\u3067\u306E\u307F\u5229\u7528\u53EF\u80FD" })] })] }), _jsxs("label", { className: "flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer opacity-50", children: [_jsx("input", { type: "radio", name: "paymentMethod", value: "square", checked: paymentMethod === 'square', onChange: (e) => setPaymentMethod(e.target.value), disabled: true, className: "mr-3" }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "font-medium text-gray-900", children: "Square\u6C7A\u6E08" }), _jsx("div", { className: "text-sm text-gray-600", children: "\u672C\u756A\u74B0\u5883\u3067\u306E\u307F\u5229\u7528\u53EF\u80FD" })] })] })] })] }), paymentMethod === 'demo' && (_jsxs("div", { className: "p-6 border-b border-gray-200", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-4", children: [_jsx(CreditCard, { className: "w-5 h-5 text-gray-600" }), _jsx("h3", { className: "font-semibold text-gray-900", children: "\u30AB\u30FC\u30C9\u60C5\u5831\uFF08\u30C7\u30E2\uFF09" })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u30AB\u30FC\u30C9\u756A\u53F7" }), _jsx("input", { type: "text", value: cardInfo.number, onChange: (e) => setCardInfo({ ...cardInfo, number: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500", placeholder: "1234 5678 9012 3456", readOnly: true })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u6709\u52B9\u671F\u9650" }), _jsx("input", { type: "text", value: cardInfo.expiry, onChange: (e) => setCardInfo({ ...cardInfo, expiry: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500", placeholder: "MM/YY", readOnly: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "CVC" }), _jsx("input", { type: "text", value: cardInfo.cvc, onChange: (e) => setCardInfo({ ...cardInfo, cvc: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500", placeholder: "123", readOnly: true })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u30AB\u30FC\u30C9\u540D\u7FA9\u4EBA" }), _jsx("input", { type: "text", value: cardInfo.name, onChange: (e) => setCardInfo({ ...cardInfo, name: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500", placeholder: "TARO YAMADA", readOnly: true })] })] })] })), error && (_jsx("div", { className: "p-6 border-b border-gray-200", children: _jsxs("div", { className: "flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg", children: [_jsx(AlertCircle, { className: "w-5 h-5 text-red-600 mt-0.5" }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-red-900", children: "\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F" }), _jsx("p", { className: "text-sm text-red-800 mt-1", children: error })] })] }) })), _jsx("div", { className: "p-6 border-b border-gray-200", children: _jsxs("div", { className: "flex items-start space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg", children: [_jsx(Lock, { className: "w-5 h-5 text-green-600 mt-0.5" }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-green-900", children: "\u30BB\u30AD\u30E5\u30A2\u306A\u6C7A\u6E08" }), _jsx("p", { className: "text-sm text-green-800 mt-1", children: "\u6C7A\u6E08\u60C5\u5831\u306F256bit SSL\u6697\u53F7\u5316\u306B\u3088\u308A\u4FDD\u8B77\u3055\u308C\u3066\u3044\u307E\u3059\u3002 \u30AB\u30FC\u30C9\u60C5\u5831\u306F\u5F53\u30B7\u30B9\u30C6\u30E0\u306B\u306F\u4FDD\u5B58\u3055\u308C\u307E\u305B\u3093\u3002" })] })] }) }), _jsx("div", { className: "p-6", children: _jsxs("div", { className: "flex space-x-4", children: [_jsx("button", { onClick: onCancel, className: "flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors", disabled: isProcessing, children: "\u30AD\u30E3\u30F3\u30BB\u30EB" }), _jsx("button", { onClick: handleSubmit, className: "flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2", disabled: isProcessing, children: isProcessing ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-5 h-5 animate-spin" }), _jsx("span", { children: "\u51E6\u7406\u4E2D..." })] })) : (_jsxs(_Fragment, { children: [_jsx(CheckCircle, { className: "w-5 h-5" }), _jsxs("span", { children: ["\u00A5", (monthlyDifference + setupFee).toLocaleString(), " \u3067\u6C7A\u6E08\u78BA\u5B9A"] })] })) })] }) })] }) }));
};
export default PaymentForm;
