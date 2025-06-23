import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
// UIコンポーネントの代替実装
const Card = ({ children, className = '' }) => _jsx("div", { className: `bg-white rounded-lg shadow ${className}`, children: children });
const CardHeader = ({ children }) => _jsx("div", { className: "p-4 border-b", children: children });
const CardTitle = ({ children, className = '' }) => _jsx("h3", { className: `text-lg font-semibold ${className}`, children: children });
const CardContent = ({ children, className = '' }) => _jsx("div", { className: `p-4 ${className}`, children: children });
const Button = ({ children, onClick, disabled, className = '' }) => _jsx("button", { onClick: onClick, disabled: disabled, className: `px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 ${className}`, children: children });
const Badge = ({ children, className = '', variant }) => _jsx("span", { className: `inline-block px-2 py-1 text-xs rounded ${className}`, children: children });
const Alert = ({ children, className = '' }) => _jsx("div", { className: `p-4 rounded border ${className}`, children: children });
const AlertDescription = ({ children, className = '' }) => _jsx("p", { className: className, children: children });
const Switch = ({ checked, disabled, onCheckedChange, className = '' }) => _jsx("input", { type: "checkbox", checked: checked, disabled: disabled, onChange: (e) => onCheckedChange(e.target.checked), className: className });
import { Settings, AlertTriangle, CheckCircle } from 'lucide-react';
const FeatureFlagSettings = () => {
    const [flags, setFlags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);
    // フィーチャーフラグ一覧を取得
    useEffect(() => {
        fetchFlags();
    }, []);
    const fetchFlags = async () => {
        try {
            const response = await fetch('/api/v1/features/', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                const data = await response.json();
                setFlags(data.flags || []);
            }
            else {
                throw new Error('フィーチャーフラグの取得に失敗しました');
            }
        }
        catch (error) {
            setMessage({ type: 'error', text: error instanceof Error ? error.message : '不明なエラー' });
        }
        finally {
            setLoading(false);
        }
    };
    // フィーチャーフラグの有効/無効切り替え
    const toggleFeature = async (flagKey, enabled) => {
        try {
            const endpoint = enabled ? `/api/v1/features/admin/tenant/${getCurrentTenantId()}/enable` : `/api/v1/features/admin/tenant/${getCurrentTenantId()}/disable`;
            const response = await fetch(endpoint.replace('/enable', '').replace('/disable', '') + `/${flagKey}/${enabled ? 'enable' : 'disable'}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                setMessage({ type: 'success', text: `${enabled ? '有効化' : '無効化'}しました` });
                await fetchFlags(); // 再読み込み
            }
            else {
                throw new Error('設定の更新に失敗しました');
            }
        }
        catch (error) {
            setMessage({ type: 'error', text: error instanceof Error ? error.message : '不明なエラー' });
        }
    };
    const getCurrentTenantId = () => {
        // 実際の実装では認証情報からテナントIDを取得
        return localStorage.getItem('tenantId') || 'default';
    };
    const getCategoryColor = (category) => {
        switch (category) {
            case 'core': return 'bg-blue-100 text-blue-800';
            case 'enhancement': return 'bg-green-100 text-green-800';
            case 'experimental': return 'bg-yellow-100 text-yellow-800';
            case 'beta': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    const getCategoryDescription = (category) => {
        switch (category) {
            case 'core': return 'システムの基本機能';
            case 'enhancement': return '機能拡張・改善';
            case 'experimental': return '実験的機能（注意が必要）';
            case 'beta': return 'ベータ版機能';
            default: return '';
        }
    };
    if (loading) {
        return (_jsxs("div", { className: "flex items-center justify-center p-8", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" }), _jsx("span", { className: "ml-2", children: "\u8A2D\u5B9A\u3092\u8AAD\u307F\u8FBC\u3093\u3067\u3044\u307E\u3059..." })] }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Settings, { className: "h-6 w-6" }), _jsx("h1", { className: "text-2xl font-bold", children: "\u6A5F\u80FD\u8A2D\u5B9A" })] }), message && (_jsxs(Alert, { className: message.type === 'error' ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50', children: [message.type === 'error' ? (_jsx(AlertTriangle, { className: "h-4 w-4 text-red-600" })) : (_jsx(CheckCircle, { className: "h-4 w-4 text-green-600" })), _jsx(AlertDescription, { className: message.type === 'error' ? 'text-red-700' : 'text-green-700', children: message.text })] })), _jsx("div", { className: "grid gap-4", children: Object.entries(flags.reduce((acc, flag) => {
                    if (!acc[flag.category])
                        acc[flag.category] = [];
                    acc[flag.category].push(flag);
                    return acc;
                }, {})).map(([category, categoryFlags]) => (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(Badge, { className: getCategoryColor(category), children: category.toUpperCase() }), _jsx("span", { children: getCategoryDescription(category) })] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: categoryFlags.map((flag) => (_jsxs("div", { className: "flex items-center justify-between p-4 border rounded-lg", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-2", children: [_jsx("h3", { className: "font-semibold text-lg", children: flag.name }), !flag.isEnabled && (_jsx(Badge, { className: "bg-gray-100 text-gray-500", children: "\u30B0\u30ED\u30FC\u30D0\u30EB\u7121\u52B9" })), flag.rolloutPercentage < 100 && flag.isEnabled && (_jsxs(Badge, { className: "bg-orange-100 text-orange-600", children: ["\u6BB5\u968E\u30EA\u30EA\u30FC\u30B9 ", flag.rolloutPercentage, "%"] }))] }), flag.description && (_jsx("p", { className: "text-gray-600 mb-2", children: flag.description })), _jsxs("p", { className: "text-sm text-gray-500", children: ["\u30AD\u30FC: ", flag.key] })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsxs("div", { className: "text-right", children: [_jsx("div", { className: "text-sm font-medium", children: flag.isEnabledForTenant ? '有効' : '無効' }), flag.isEnabled ? (_jsx("div", { className: "text-xs text-green-600", children: "\u5229\u7528\u53EF\u80FD" })) : (_jsx("div", { className: "text-xs text-red-600", children: "\u30B0\u30ED\u30FC\u30D0\u30EB\u7121\u52B9" }))] }), _jsx(Switch, { checked: flag.isEnabledForTenant, disabled: !flag.isEnabled, onCheckedChange: (checked) => toggleFeature(flag.key, checked), className: "" })] })] }, flag.id))) }) })] }, category))) }), _jsxs(Card, { className: "bg-blue-50", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-blue-800", children: "\u6A5F\u80FD\u8A2D\u5B9A\u306B\u3064\u3044\u3066" }) }), _jsx(CardContent, { className: "text-blue-700", children: _jsxs("ul", { className: "space-y-2 text-sm", children: [_jsxs("li", { children: ["\u2022 ", _jsx("strong", { children: "\u5FDC\u63F4\u7F8E\u5BB9\u5E2B\u30B5\u30FC\u30D3\u30B9" }), ": \u7F8E\u5BB9\u5E2B\u540C\u58EB\u304C\u52A9\u3051\u5408\u3048\u308B\u30DE\u30C3\u30C1\u30F3\u30B0\u30B5\u30FC\u30D3\u30B9"] }), _jsxs("li", { children: ["\u2022 ", _jsx("strong", { children: "\u7D66\u6599\u898B\u3048\u308B\u5316\u30B7\u30B9\u30C6\u30E0" }), ": \u7D66\u4E0E\u306E\u900F\u660E\u6027\u3068\u30E2\u30C1\u30D9\u30FC\u30B7\u30E7\u30F3\u5411\u4E0A"] }), _jsxs("li", { children: ["\u2022 ", _jsx("strong", { children: "\u30A4\u30F3\u30BB\u30F3\u30C6\u30A3\u30D6\u30B7\u30B9\u30C6\u30E0" }), ": \u30D1\u30D5\u30A9\u30FC\u30DE\u30F3\u30B9\u30D9\u30FC\u30B9\u306E\u5831\u916C\u5236\u5EA6"] }), _jsx("li", { children: "\u2022 \u6A5F\u80FD\u3092\u6709\u52B9\u5316\u3059\u308B\u3068\u3001\u5BFE\u5FDC\u3059\u308B\u30E1\u30CB\u30E5\u30FC\u3068\u6A5F\u80FD\u304C\u5229\u7528\u53EF\u80FD\u306B\u306A\u308A\u307E\u3059" }), _jsx("li", { children: "\u2022 \u5B9F\u9A13\u7684\u6A5F\u80FD\u306F\u4E88\u671F\u3057\u306A\u3044\u52D5\u4F5C\u3092\u3059\u308B\u53EF\u80FD\u6027\u304C\u3042\u308A\u307E\u3059" })] }) })] })] }));
};
export default FeatureFlagSettings;
