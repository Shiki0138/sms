import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { CreditCard, MapPin, Smartphone, Check, Plus, Trash2, Edit, Star, Shield } from 'lucide-react';
const PaymentMethodSelector = ({ customerId, selectedMethodId, onMethodSelect, onAddNewMethod, showAddNew = true, allowMultiple = false }) => {
    const [savedMethods, setSavedMethods] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingMethod, setEditingMethod] = useState(null);
    const [newNickname, setNewNickname] = useState('');
    useEffect(() => {
        loadSavedMethods();
    }, [customerId]);
    const loadSavedMethods = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch(`/api/v1/customers/${customerId}/payment-methods`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) {
                if (response.status === 404) {
                    setSavedMethods([]);
                    return;
                }
                throw new Error('保存済み決済方法の取得に失敗しました');
            }
            const data = await response.json();
            setSavedMethods(data.paymentMethods || []);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : '決済方法の取得に失敗しました');
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleMethodSelect = (method) => {
        if (allowMultiple) {
            // 複数選択の場合の処理（将来拡張用）
            onMethodSelect(method?.id || null, method);
        }
        else {
            onMethodSelect(method?.id || null, method);
        }
    };
    const handleSetDefault = async (methodId) => {
        try {
            const response = await fetch(`/api/v1/payments/methods/${methodId}/set-default`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) {
                throw new Error('デフォルト設定に失敗しました');
            }
            // ローカル状態を更新
            setSavedMethods(prev => prev.map(method => ({
                ...method,
                isDefault: method.id === methodId
            })));
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'デフォルト設定に失敗しました');
        }
    };
    const handleDeleteMethod = async (methodId) => {
        if (!confirm('この決済方法を削除しますか？'))
            return;
        try {
            const response = await fetch(`/api/v1/payments/methods/${methodId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) {
                throw new Error('決済方法の削除に失敗しました');
            }
            setSavedMethods(prev => prev.filter(method => method.id !== methodId));
            // 削除したものが選択されていた場合はクリア
            if (selectedMethodId === methodId) {
                onMethodSelect(null, null);
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : '決済方法の削除に失敗しました');
        }
    };
    const handleUpdateNickname = async (methodId) => {
        try {
            const response = await fetch(`/api/v1/payments/methods/${methodId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    nickname: newNickname.trim()
                })
            });
            if (!response.ok) {
                throw new Error('ニックネームの更新に失敗しました');
            }
            setSavedMethods(prev => prev.map(method => method.id === methodId
                ? { ...method, nickname: newNickname.trim() }
                : method));
            setEditingMethod(null);
            setNewNickname('');
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'ニックネームの更新に失敗しました');
        }
    };
    const getMethodIcon = (type, brand) => {
        switch (type) {
            case 'card':
                return _jsx(CreditCard, { className: "w-6 h-6" });
            case 'konbini':
                return _jsx(MapPin, { className: "w-6 h-6" });
            case 'bank_transfer':
                return _jsx(Smartphone, { className: "w-6 h-6" });
            default:
                return _jsx(CreditCard, { className: "w-6 h-6" });
        }
    };
    const getMethodLabel = (method) => {
        switch (method.type) {
            case 'card':
                return `${method.brand?.toUpperCase()} •••• ${method.last4}`;
            case 'konbini':
                return 'コンビニ決済';
            case 'bank_transfer':
                return '銀行振込';
            default:
                return '不明な決済方法';
        }
    };
    const getMethodDescription = (method) => {
        switch (method.type) {
            case 'card':
                return `有効期限: ${method.expiryMonth?.toString().padStart(2, '0')}/${method.expiryYear?.toString().slice(-2)}`;
            case 'konbini':
                return 'セブンイレブン、ファミリーマート、ローソン等';
            case 'bank_transfer':
                return '銀行振込での後払い';
            default:
                return '';
        }
    };
    if (isLoading) {
        return (_jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "text-lg font-semibold text-gray-900", children: "\u6C7A\u6E08\u65B9\u6CD5\u3092\u9078\u629E" }), _jsx("div", { className: "space-y-3", children: [1, 2, 3].map(i => (_jsx("div", { className: "animate-pulse", children: _jsx("div", { className: "bg-gray-200 rounded-lg p-4 h-16" }) }, i))) })] }));
    }
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "\u6C7A\u6E08\u65B9\u6CD5\u3092\u9078\u629E" }), _jsxs("div", { className: "flex items-center text-sm text-gray-500", children: [_jsx(Shield, { className: "w-4 h-4 mr-1" }), "SSL\u6697\u53F7\u5316\u4FDD\u8B77"] })] }), error && (_jsx("div", { className: "bg-red-50 border border-red-200 rounded-md p-3", children: _jsx("p", { className: "text-sm text-red-600", children: error }) })), _jsxs("div", { className: "space-y-3", children: [savedMethods.map((method) => (_jsxs("div", { className: `border-2 rounded-lg p-4 cursor-pointer transition-all ${selectedMethodId === method.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'}`, onClick: () => handleMethodSelect(method), children: [_jsx("div", { className: "flex items-center justify-between", children: _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: `text-gray-600 ${selectedMethodId === method.id ? 'text-blue-600' : ''}`, children: getMethodIcon(method.type, method.brand) }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "font-medium text-gray-900", children: method.nickname || getMethodLabel(method) }), method.isDefault && (_jsxs("div", { className: "flex items-center bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs", children: [_jsx(Star, { className: "w-3 h-3 mr-1" }), "\u30C7\u30D5\u30A9\u30EB\u30C8"] }))] }), _jsx("div", { className: "text-sm text-gray-500", children: method.nickname ? getMethodLabel(method) : getMethodDescription(method) }), method.nickname && (_jsx("div", { className: "text-xs text-gray-400", children: getMethodDescription(method) }))] }), selectedMethodId === method.id && (_jsx(Check, { className: "w-5 h-5 text-blue-600" }))] }) }), selectedMethodId === method.id && (_jsx("div", { className: "mt-3 pt-3 border-t border-gray-200 flex items-center space-x-2", children: editingMethod === method.id ? (_jsxs("div", { className: "flex items-center space-x-2 flex-1", children: [_jsx("input", { type: "text", value: newNickname, onChange: (e) => setNewNickname(e.target.value), placeholder: "\u30CB\u30C3\u30AF\u30CD\u30FC\u30E0\u3092\u5165\u529B", className: "flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500", maxLength: 20 }), _jsx("button", { onClick: () => handleUpdateNickname(method.id), className: "px-2 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700", children: "\u4FDD\u5B58" }), _jsx("button", { onClick: () => {
                                                setEditingMethod(null);
                                                setNewNickname('');
                                            }, className: "px-2 py-1 text-sm bg-gray-300 text-gray-700 rounded hover:bg-gray-400", children: "\u30AD\u30E3\u30F3\u30BB\u30EB" })] })) : (_jsxs(_Fragment, { children: [_jsxs("button", { onClick: (e) => {
                                                e.stopPropagation();
                                                setEditingMethod(method.id);
                                                setNewNickname(method.nickname || '');
                                            }, className: "flex items-center px-2 py-1 text-sm text-gray-600 hover:text-gray-800", children: [_jsx(Edit, { className: "w-4 h-4 mr-1" }), "\u30CB\u30C3\u30AF\u30CD\u30FC\u30E0\u7DE8\u96C6"] }), !method.isDefault && (_jsxs("button", { onClick: (e) => {
                                                e.stopPropagation();
                                                handleSetDefault(method.id);
                                            }, className: "flex items-center px-2 py-1 text-sm text-blue-600 hover:text-blue-800", children: [_jsx(Star, { className: "w-4 h-4 mr-1" }), "\u30C7\u30D5\u30A9\u30EB\u30C8\u306B\u8A2D\u5B9A"] })), _jsxs("button", { onClick: (e) => {
                                                e.stopPropagation();
                                                handleDeleteMethod(method.id);
                                            }, className: "flex items-center px-2 py-1 text-sm text-red-600 hover:text-red-800", children: [_jsx(Trash2, { className: "w-4 h-4 mr-1" }), "\u524A\u9664"] })] })) }))] }, method.id))), showAddNew && (_jsxs("button", { onClick: () => {
                            onMethodSelect(null, null);
                            onAddNewMethod();
                        }, className: `w-full border-2 border-dashed rounded-lg p-4 text-center transition-all ${selectedMethodId === null
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:border-gray-400 text-gray-600'}`, children: [_jsxs("div", { className: "flex items-center justify-center space-x-2", children: [_jsx(Plus, { className: "w-5 h-5" }), _jsx("span", { className: "font-medium", children: "\u65B0\u3057\u3044\u6C7A\u6E08\u65B9\u6CD5\u3092\u8FFD\u52A0" })] }), _jsx("div", { className: "text-sm mt-1 opacity-75", children: "\u30AF\u30EC\u30B8\u30C3\u30C8\u30AB\u30FC\u30C9\u3001\u30B3\u30F3\u30D3\u30CB\u6C7A\u6E08\u3001\u9280\u884C\u632F\u8FBC" })] })), savedMethods.length === 0 && !showAddNew && (_jsxs("div", { className: "text-center py-8 text-gray-500", children: [_jsx(CreditCard, { className: "w-12 h-12 mx-auto mb-4 text-gray-300" }), _jsx("div", { className: "text-lg font-medium mb-2", children: "\u4FDD\u5B58\u6E08\u307F\u6C7A\u6E08\u65B9\u6CD5\u304C\u3042\u308A\u307E\u305B\u3093" }), _jsx("div", { className: "text-sm", children: "\u65B0\u3057\u3044\u6C7A\u6E08\u65B9\u6CD5\u3092\u8FFD\u52A0\u3057\u3066\u304A\u652F\u6255\u3044\u304F\u3060\u3055\u3044" })] }))] }), _jsx("div", { className: "bg-gray-50 rounded-lg p-3", children: _jsxs("div", { className: "flex items-start space-x-2", children: [_jsx(Shield, { className: "w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" }), _jsxs("div", { className: "text-sm text-gray-600", children: [_jsx("div", { className: "font-medium text-gray-900 mb-1", children: "\u30BB\u30AD\u30E5\u30EA\u30C6\u30A3\u306B\u3064\u3044\u3066" }), _jsxs("ul", { className: "space-y-1 text-xs", children: [_jsx("li", { children: "\u2022 \u30AB\u30FC\u30C9\u60C5\u5831\u306F\u5F53\u793E\u30B5\u30FC\u30D0\u30FC\u306B\u4FDD\u5B58\u3055\u308C\u307E\u305B\u3093" }), _jsx("li", { children: "\u2022 Stripe\u793E\u306E\u56FD\u969B\u30BB\u30AD\u30E5\u30EA\u30C6\u30A3\u57FA\u6E96\uFF08PCI DSS Level 1\uFF09\u6E96\u62E0" }), _jsx("li", { children: "\u2022 \u5168\u3066\u306E\u901A\u4FE1\u306FSSL\u6697\u53F7\u5316\u306B\u3088\u308A\u4FDD\u8B77\u3055\u308C\u3066\u3044\u307E\u3059" }), _jsx("li", { children: "\u2022 \u30CB\u30C3\u30AF\u30CD\u30FC\u30E0\u306E\u307F\u5F53\u793E\u3067\u4FDD\u5B58\u3055\u308C\u3001\u6C7A\u6E08\u6642\u306E\u8B58\u5225\u306B\u4F7F\u7528\u3055\u308C\u307E\u3059" })] })] })] }) })] }));
};
export default PaymentMethodSelector;
