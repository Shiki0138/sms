import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Check, X, Settings, Eye, Lock } from 'lucide-react';
const ExternalSendRestriction = ({ isTestMode = true, onModeChange }) => {
    const [restrictions, setRestrictions] = useState([
        {
            id: 'line-send',
            name: 'LINE メッセージ送信',
            type: 'line',
            enabled: true,
            testModeOnly: true,
            maxSendsPerDay: 0, // テストモードでは実際に送信しない
            currentSends: 0,
            blockedSends: 5 // ブロックされた送信数
        },
        {
            id: 'instagram-send',
            name: 'Instagram メッセージ送信',
            type: 'instagram',
            enabled: true,
            testModeOnly: true,
            maxSendsPerDay: 0,
            currentSends: 0,
            blockedSends: 3
        },
        {
            id: 'email-send',
            name: 'メール送信',
            type: 'email',
            enabled: true,
            testModeOnly: true,
            maxSendsPerDay: 0,
            currentSends: 0,
            blockedSends: 2
        },
        {
            id: 'sms-send',
            name: 'SMS送信',
            type: 'sms',
            enabled: true,
            testModeOnly: true,
            maxSendsPerDay: 0,
            currentSends: 0,
            blockedSends: 1
        }
    ]);
    const [globalTestMode, setGlobalTestMode] = useState(isTestMode);
    const [showSettings, setShowSettings] = useState(false);
    useEffect(() => {
        if (onModeChange) {
            onModeChange(globalTestMode);
        }
    }, [globalTestMode, onModeChange]);
    const handleTestModeToggle = () => {
        const newTestMode = !globalTestMode;
        setGlobalTestMode(newTestMode);
        // テストモードONの場合、全ての外部送信を無効化
        if (newTestMode) {
            setRestrictions(prev => prev.map(r => ({
                ...r,
                testModeOnly: true,
                maxSendsPerDay: 0
            })));
        }
    };
    const handleRestrictionToggle = (id) => {
        setRestrictions(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
    };
    const updateDailyLimit = (id, limit) => {
        setRestrictions(prev => prev.map(r => r.id === id ? { ...r, maxSendsPerDay: limit } : r));
    };
    const getStatusIcon = (restriction) => {
        if (!restriction.enabled) {
            return _jsx(X, { className: "w-4 h-4 text-gray-400" });
        }
        if (restriction.testModeOnly || globalTestMode) {
            return _jsx(Eye, { className: "w-4 h-4 text-blue-500" });
        }
        if (restriction.currentSends >= restriction.maxSendsPerDay) {
            return _jsx(Lock, { className: "w-4 h-4 text-red-500" });
        }
        return _jsx(Check, { className: "w-4 h-4 text-green-500" });
    };
    const getStatusText = (restriction) => {
        if (!restriction.enabled) {
            return '無効';
        }
        if (restriction.testModeOnly || globalTestMode) {
            return 'テストモード（送信なし）';
        }
        if (restriction.currentSends >= restriction.maxSendsPerDay) {
            return '制限到達';
        }
        return `送信可能 (${restriction.maxSendsPerDay - restriction.currentSends}回)`;
    };
    const getStatusColor = (restriction) => {
        if (!restriction.enabled) {
            return 'text-gray-500';
        }
        if (restriction.testModeOnly || globalTestMode) {
            return 'text-blue-600';
        }
        if (restriction.currentSends >= restriction.maxSendsPerDay) {
            return 'text-red-600';
        }
        return 'text-green-600';
    };
    const totalBlockedSends = restrictions.reduce((sum, r) => sum + r.blockedSends, 0);
    return (_jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(Shield, { className: "w-6 h-6 text-blue-600" }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "\u5916\u90E8\u9001\u4FE1\u5236\u9650" }), _jsx("p", { className: "text-sm text-gray-500", children: "\u30C6\u30B9\u30C8\u30E6\u30FC\u30B6\u30FC\u4FDD\u8B77\u6A5F\u80FD" })] })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("button", { onClick: () => setShowSettings(!showSettings), className: "p-2 text-gray-400 hover:text-gray-600 transition-colors", children: _jsx(Settings, { className: "w-5 h-5" }) }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: "text-sm text-gray-600", children: "\u30C6\u30B9\u30C8\u30E2\u30FC\u30C9" }), _jsx("button", { onClick: handleTestModeToggle, className: `relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${globalTestMode ? 'bg-blue-600' : 'bg-gray-200'}`, children: _jsx("span", { className: `inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${globalTestMode ? 'translate-x-6' : 'translate-x-1'}` }) })] })] })] }), globalTestMode && (_jsx("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6", children: _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx(AlertTriangle, { className: "w-5 h-5 text-blue-600 mt-0.5" }), _jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-blue-800 mb-1", children: "\u30C6\u30B9\u30C8\u30E2\u30FC\u30C9\u304C\u6709\u52B9\u3067\u3059" }), _jsx("p", { className: "text-sm text-blue-700", children: "\u5B9F\u969B\u306E\u5916\u90E8\u9001\u4FE1\u306F\u884C\u308F\u308C\u307E\u305B\u3093\u3002\u30C6\u30B9\u30C8\u30E6\u30FC\u30B6\u30FC\u304C\u5B89\u5FC3\u3057\u3066\u30B7\u30B9\u30C6\u30E0\u3092\u304A\u8A66\u3057\u3044\u305F\u3060\u3051\u307E\u3059\u3002" })] })] }) })), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-6", children: [_jsx("div", { className: "bg-gray-50 rounded-lg p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "\u30D6\u30ED\u30C3\u30AF\u6E08\u307F\u9001\u4FE1" }), _jsx("p", { className: "text-2xl font-bold text-red-600", children: totalBlockedSends })] }), _jsx(Shield, { className: "w-8 h-8 text-red-500" })] }) }), _jsx("div", { className: "bg-gray-50 rounded-lg p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "\u4FDD\u8B77\u30EC\u30D9\u30EB" }), _jsx("p", { className: "text-2xl font-bold text-blue-600", children: globalTestMode ? '最大' : '標準' })] }), _jsx(Eye, { className: "w-8 h-8 text-blue-500" })] }) }), _jsx("div", { className: "bg-gray-50 rounded-lg p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "\u6709\u52B9\u306A\u5236\u9650" }), _jsx("p", { className: "text-2xl font-bold text-green-600", children: restrictions.filter(r => r.enabled).length })] }), _jsx(Check, { className: "w-8 h-8 text-green-500" })] }) })] }), _jsx("div", { className: "space-y-4", children: restrictions.map((restriction) => (_jsxs("div", { className: "border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [getStatusIcon(restriction), _jsx("h4", { className: "font-medium text-gray-900", children: restriction.name })] }), _jsx("span", { className: `text-sm ${getStatusColor(restriction)}`, children: getStatusText(restriction) })] }), _jsxs("div", { className: "flex items-center space-x-4", children: [restriction.blockedSends > 0 && (_jsxs("span", { className: "text-sm text-red-600 bg-red-50 px-2 py-1 rounded", children: [restriction.blockedSends, "\u56DE\u30D6\u30ED\u30C3\u30AF"] })), _jsx("button", { onClick: () => handleRestrictionToggle(restriction.id), className: `relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${restriction.enabled ? 'bg-green-600' : 'bg-gray-200'}`, children: _jsx("span", { className: `inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${restriction.enabled ? 'translate-x-5' : 'translate-x-1'}` }) })] })] }), showSettings && restriction.enabled && !globalTestMode && (_jsx("div", { className: "mt-4 pt-4 border-t border-gray-100", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "1\u65E5\u306E\u9001\u4FE1\u4E0A\u9650" }), _jsx("input", { type: "number", min: "0", max: "1000", value: restriction.maxSendsPerDay, onChange: (e) => updateDailyLimit(restriction.id, parseInt(e.target.value) || 0), className: "w-full px-3 py-2 border border-gray-300 rounded-md text-sm" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "\u672C\u65E5\u306E\u9001\u4FE1\u6570" }), _jsxs("div", { className: "px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm", children: [restriction.currentSends, " / ", restriction.maxSendsPerDay] })] })] }) }))] }, restriction.id))) }), _jsx("div", { className: "mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4", children: _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx(AlertTriangle, { className: "w-5 h-5 text-yellow-600 mt-0.5" }), _jsxs("div", { className: "text-sm text-yellow-800", children: [_jsx("h4", { className: "font-medium mb-1", children: "\u91CD\u8981\u306A\u6CE8\u610F\u4E8B\u9805" }), _jsxs("ul", { className: "list-disc list-inside space-y-1", children: [_jsx("li", { children: "\u30C6\u30B9\u30C8\u30E2\u30FC\u30C9\u3067\u306F\u5B9F\u969B\u306E\u5916\u90E8\u9001\u4FE1\u306F\u4E00\u5207\u884C\u308F\u308C\u307E\u305B\u3093" }), _jsx("li", { children: "\u672C\u756A\u904B\u7528\u6642\u306F\u5FC5\u305A\u30C6\u30B9\u30C8\u30E2\u30FC\u30C9\u3092\u7121\u52B9\u306B\u3057\u3066\u304F\u3060\u3055\u3044" }), _jsx("li", { children: "1\u65E5\u306E\u9001\u4FE1\u4E0A\u9650\u306B\u9054\u3057\u305F\u5834\u5408\u3001\u7FCC\u65E50\u6642\u306B\u30EA\u30BB\u30C3\u30C8\u3055\u308C\u307E\u3059" }), _jsx("li", { children: "\u5236\u9650\u8A2D\u5B9A\u306E\u5909\u66F4\u306F\u5373\u5EA7\u306B\u53CD\u6620\u3055\u308C\u307E\u3059" })] })] })] }) })] }));
};
export default ExternalSendRestriction;
