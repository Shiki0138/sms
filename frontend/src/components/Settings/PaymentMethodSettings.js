import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { CreditCard, Plus, Check, X, AlertCircle, Loader2, Settings, Shield } from 'lucide-react';
const PaymentMethodSettings = () => {
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [providers, setProviders] = useState([]);
    const [currentProvider, setCurrentProvider] = useState('');
    const [loading, setLoading] = useState(true);
    const [showAddMethod, setShowAddMethod] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    useEffect(() => {
        loadPaymentData();
    }, []);
    const loadPaymentData = async () => {
        try {
            setLoading(true);
            const [methodsRes, settingsRes] = await Promise.all([
                fetch('/api/v1/payments/payment-methods'),
                fetch('/api/v1/payments/provider-settings')
            ]);
            if (methodsRes.ok) {
                const methods = await methodsRes.json();
                setPaymentMethods(methods);
            }
            if (settingsRes.ok) {
                const settings = await settingsRes.json();
                setCurrentProvider(settings.provider);
                setProviders(settings.availableProviders);
            }
        }
        catch (error) {
            console.error('Failed to load payment data:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleProviderChange = async (newProvider) => {
        try {
            setIsUpdating(true);
            const response = await fetch('/api/v1/payments/provider-settings', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ provider: newProvider })
            });
            if (response.ok) {
                setCurrentProvider(newProvider);
                // プロバイダー変更後は支払い方法を再読み込み
                await loadPaymentData();
            }
            else {
                throw new Error('Failed to update provider');
            }
        }
        catch (error) {
            console.error('Failed to update provider:', error);
            alert('決済プロバイダーの変更に失敗しました');
        }
        finally {
            setIsUpdating(false);
        }
    };
    const getCardBrandIcon = (brand) => {
        switch (brand?.toLowerCase()) {
            case 'visa':
                return '💳';
            case 'mastercard':
                return '💳';
            case 'jcb':
                return '💳';
            case 'amex':
                return '💳';
            default:
                return '💳';
        }
    };
    const getProviderIcon = (provider) => {
        switch (provider) {
            case 'stripe':
                return '💙';
            case 'square':
                return '🟫';
            case 'paypal':
                return '🌐';
            case 'payjp':
                return '🇯🇵';
            default:
                return '💳';
        }
    };
    if (loading) {
        return (_jsxs("div", { className: "flex items-center justify-center p-8", children: [_jsx(Loader2, { className: "w-8 h-8 animate-spin text-blue-600" }), _jsx("span", { className: "ml-2 text-gray-600", children: "\u8AAD\u307F\u8FBC\u307F\u4E2D..." })] }));
    }
    return (_jsxs("div", { className: "max-w-4xl mx-auto space-y-6", children: [_jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [_jsx("h2", { className: "text-xl font-bold text-gray-900 mb-2", children: "\u6C7A\u6E08\u8A2D\u5B9A" }), _jsx("p", { className: "text-gray-600", children: "\u30B5\u30D6\u30B9\u30AF\u30EA\u30D7\u30B7\u30E7\u30F3\u306E\u6C7A\u6E08\u65B9\u6CD5\u3068\u6C7A\u6E08\u30D7\u30ED\u30D0\u30A4\u30C0\u30FC\u3092\u7BA1\u7406\u3057\u307E\u3059" })] }), _jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-4", children: [_jsx(Settings, { className: "w-5 h-5 text-gray-600" }), _jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "\u6C7A\u6E08\u30D7\u30ED\u30D0\u30A4\u30C0\u30FC" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: providers.map((provider) => (_jsx("div", { className: `border-2 rounded-lg p-4 cursor-pointer transition-all ${currentProvider === provider.id
                                ? 'border-blue-500 bg-blue-50'
                                : provider.available
                                    ? 'border-gray-200 hover:border-gray-300'
                                    : 'border-gray-100 bg-gray-50'} ${!provider.available ? 'opacity-50 cursor-not-allowed' : ''}`, onClick: () => {
                                if (provider.available && !isUpdating) {
                                    handleProviderChange(provider.id);
                                }
                            }, children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("span", { className: "text-2xl", children: getProviderIcon(provider.id) }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-gray-900", children: provider.name }), _jsx("p", { className: "text-sm text-gray-600", children: provider.available ? '利用可能' : '設定が必要' })] })] }), currentProvider === provider.id && (_jsx(Check, { className: "w-5 h-5 text-blue-600" }))] }) }, provider.id))) }), isUpdating && (_jsxs("div", { className: "mt-4 flex items-center space-x-2 text-sm text-blue-600", children: [_jsx(Loader2, { className: "w-4 h-4 animate-spin" }), _jsx("span", { children: "\u30D7\u30ED\u30D0\u30A4\u30C0\u30FC\u3092\u5909\u66F4\u4E2D..." })] }))] }), _jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(CreditCard, { className: "w-5 h-5 text-gray-600" }), _jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "\u767B\u9332\u6E08\u307F\u6C7A\u6E08\u65B9\u6CD5" })] }), _jsxs("button", { onClick: () => setShowAddMethod(true), className: "flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors", children: [_jsx(Plus, { className: "w-4 h-4" }), _jsx("span", { children: "\u8FFD\u52A0" })] })] }), paymentMethods.length === 0 ? (_jsxs("div", { className: "text-center py-8", children: [_jsx(CreditCard, { className: "w-12 h-12 text-gray-400 mx-auto mb-4" }), _jsx("p", { className: "text-gray-600 mb-4", children: "\u767B\u9332\u6E08\u307F\u306E\u6C7A\u6E08\u65B9\u6CD5\u304C\u3042\u308A\u307E\u305B\u3093" }), _jsx("button", { onClick: () => setShowAddMethod(true), className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors", children: "\u6700\u521D\u306E\u6C7A\u6E08\u65B9\u6CD5\u3092\u8FFD\u52A0" })] })) : (_jsx("div", { className: "space-y-3", children: paymentMethods.map((method) => (_jsxs("div", { className: "flex items-center justify-between p-4 border border-gray-200 rounded-lg", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("span", { className: "text-2xl", children: getCardBrandIcon(method.brand) }), _jsxs("div", { children: [_jsxs("p", { className: "font-medium text-gray-900", children: [method.brand?.toUpperCase(), " \u2022\u2022\u2022\u2022 ", method.last4] }), _jsxs("p", { className: "text-sm text-gray-600", children: ["\u6709\u52B9\u671F\u9650: ", method.expiryMonth, "/", method.expiryYear] })] }), method.isDefault && (_jsx("span", { className: "px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full", children: "\u30C7\u30D5\u30A9\u30EB\u30C8" }))] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs("span", { className: "text-xs text-gray-500", children: [getProviderIcon(method.provider), " ", method.provider] }), _jsx("button", { className: "text-red-600 hover:text-red-700 transition-colors", children: _jsx(X, { className: "w-4 h-4" }) })] })] }, method.id))) }))] }), _jsx("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4", children: _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx(Shield, { className: "w-5 h-5 text-blue-600 mt-0.5" }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-blue-900 mb-1", children: "\u30BB\u30AD\u30E5\u30EA\u30C6\u30A3\u306B\u3064\u3044\u3066" }), _jsx("p", { className: "text-sm text-blue-800", children: "\u6C7A\u6E08\u60C5\u5831\u306F\u696D\u754C\u6A19\u6E96\u306E\u30BB\u30AD\u30E5\u30EA\u30C6\u30A3\u3067\u4FDD\u8B77\u3055\u308C\u3066\u3044\u307E\u3059\u3002 \u30AB\u30FC\u30C9\u60C5\u5831\u306F\u6C7A\u6E08\u30D7\u30ED\u30D0\u30A4\u30C0\u30FC\u306B\u3088\u3063\u3066\u5B89\u5168\u306B\u7BA1\u7406\u3055\u308C\u3001 \u5F53\u30B7\u30B9\u30C6\u30E0\u306B\u306F\u4FDD\u5B58\u3055\u308C\u307E\u305B\u3093\u3002" })] })] }) }), showAddMethod && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50", children: _jsxs("div", { className: "bg-white rounded-lg max-w-md w-full p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "\u6C7A\u6E08\u65B9\u6CD5\u3092\u8FFD\u52A0" }), _jsx("button", { onClick: () => setShowAddMethod(false), className: "text-gray-400 hover:text-gray-600", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsx("div", { className: "bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4", children: _jsxs("div", { className: "flex items-start space-x-2", children: [_jsx(AlertCircle, { className: "w-5 h-5 text-yellow-600 mt-0.5" }), _jsx("div", { children: _jsxs("p", { className: "text-sm text-yellow-800", children: [_jsx("strong", { children: "\u30C7\u30E2\u74B0\u5883:" }), " \u5B9F\u969B\u306E\u6C7A\u6E08\u65B9\u6CD5\u306E\u8FFD\u52A0\u6A5F\u80FD\u306F\u672C\u756A\u74B0\u5883\u3067\u306E\u307F\u5229\u7528\u53EF\u80FD\u3067\u3059\u3002 \u73FE\u5728\u306F\u30C7\u30E2\u30C7\u30FC\u30BF\u304C\u8868\u793A\u3055\u308C\u3066\u3044\u307E\u3059\u3002"] }) })] }) }), _jsx("button", { onClick: () => setShowAddMethod(false), className: "w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors", children: "\u9589\u3058\u308B" })] }) }))] }));
};
export default PaymentMethodSettings;
