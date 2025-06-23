import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, XCircle, RefreshCw, MessageSquare, Instagram, Smartphone, Database } from 'lucide-react';
const TestApiSettings = ({ tenantId }) => {
    const [settings, setSettings] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showSecrets, setShowSecrets] = useState(false);
    const [simulationData, setSimulationData] = useState({
        apiType: 'line',
        action: 'send_message',
        data: { message: 'テストメッセージ', recipient: 'test_user' }
    });
    // API設定取得
    const loadApiSettings = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/test/api-settings/${tenantId}`);
            const result = await response.json();
            if (result.success) {
                setSettings(result.data.settings);
            }
        }
        catch (error) {
            console.error('API設定取得エラー:', error);
        }
        setLoading(false);
    };
    // API設定更新
    const updateApiSettings = async (newSettings) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/test/api-settings/${tenantId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    settings: { ...settings, ...newSettings }
                })
            });
            const result = await response.json();
            if (result.success) {
                setSettings(result.data.settings);
                alert('API設定を更新しました（セーフティモード有効）');
            }
            else {
                alert(`エラー: ${result.message}`);
            }
        }
        catch (error) {
            console.error('API設定更新エラー:', error);
            alert('API設定の更新に失敗しました');
        }
        setLoading(false);
    };
    // APIシミュレーション実行
    const simulateApiCall = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/test/api-simulate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tenantId: tenantId,
                    ...simulationData
                })
            });
            const result = await response.json();
            if (result.success) {
                alert(`APIシミュレーション成功!\n\nタイプ: ${result.data.apiType}\nアクション: ${result.data.action}\nステータス: ${result.data.status}`);
                await loadApiLogs();
            }
            else {
                alert(`エラー: ${result.message}`);
            }
        }
        catch (error) {
            console.error('APIシミュレーションエラー:', error);
            alert('APIシミュレーションに失敗しました');
        }
        setLoading(false);
    };
    // APIログ取得
    const loadApiLogs = async () => {
        try {
            const response = await fetch(`/api/test/api-logs/${tenantId}?limit=20`);
            const result = await response.json();
            if (result.success) {
                setLogs(result.data.logs);
            }
        }
        catch (error) {
            console.error('APIログ取得エラー:', error);
        }
    };
    useEffect(() => {
        if (tenantId) {
            loadApiSettings();
            loadApiLogs();
        }
    }, [tenantId]);
    if (!settings) {
        return (_jsxs("div", { className: "flex items-center justify-center p-8", children: [_jsx(RefreshCw, { className: "w-6 h-6 animate-spin text-blue-600" }), _jsx("span", { className: "ml-2", children: "\u8A2D\u5B9A\u3092\u8AAD\u307F\u8FBC\u307F\u4E2D..." })] }));
    }
    return (_jsxs("div", { className: "max-w-4xl mx-auto p-6 space-y-6", children: [_jsxs("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Lock, { className: "w-5 h-5 text-red-600" }), _jsx("h2", { className: "text-lg font-bold text-red-800", children: "\u30BB\u30FC\u30D5\u30C6\u30A3\u30E2\u30FC\u30C9\u6709\u52B9" })] }), _jsx("p", { className: "text-red-700 mt-2", children: "\u30C6\u30B9\u30C8\u74B0\u5883\u3067\u306F\u5916\u90E8API\u9001\u4FE1\u306F\u5B8C\u5168\u306B\u7121\u52B9\u5316\u3055\u308C\u3066\u3044\u307E\u3059\u3002\u8A2D\u5B9A\u5909\u66F4\u3084\u30B7\u30DF\u30E5\u30EC\u30FC\u30B7\u30E7\u30F3\u306F\u5185\u90E8\u30ED\u30B0\u306E\u307F\u306B\u8A18\u9332\u3055\u308C\u307E\u3059\u3002" })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-4", children: [_jsx(MessageSquare, { className: "w-6 h-6 text-green-600" }), _jsx("h3", { className: "text-lg font-semibold", children: "LINE Business API\u8A2D\u5B9A" }), _jsxs("div", { className: "flex items-center space-x-1", children: [_jsx(XCircle, { className: "w-4 h-4 text-red-500" }), _jsx("span", { className: "text-sm text-red-600", children: "\u7121\u52B9\u5316" })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Channel ID" }), _jsx("input", { type: "text", value: settings.line_channel_id, onChange: (e) => updateApiSettings({ line_channel_id: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-md", placeholder: "LINE Channel ID" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Channel Secret" }), _jsxs("div", { className: "relative", children: [_jsx("input", { type: showSecrets ? "text" : "password", value: settings.line_channel_secret, onChange: (e) => updateApiSettings({ line_channel_secret: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-md pr-10", placeholder: "LINE Channel Secret" }), _jsx("button", { onClick: () => setShowSecrets(!showSecrets), className: "absolute right-2 top-2 p-1 text-gray-400 hover:text-gray-600", children: showSecrets ? _jsx(EyeOff, { className: "w-4 h-4" }) : _jsx(Eye, { className: "w-4 h-4" }) })] })] })] })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-4", children: [_jsx(Instagram, { className: "w-6 h-6 text-pink-600" }), _jsx("h3", { className: "text-lg font-semibold", children: "Instagram Graph API\u8A2D\u5B9A" }), _jsxs("div", { className: "flex items-center space-x-1", children: [_jsx(XCircle, { className: "w-4 h-4 text-red-500" }), _jsx("span", { className: "text-sm text-red-600", children: "\u7121\u52B9\u5316" })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "App ID" }), _jsx("input", { type: "text", value: settings.instagram_app_id, onChange: (e) => updateApiSettings({ instagram_app_id: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-md", placeholder: "Instagram App ID" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "App Secret" }), _jsxs("div", { className: "relative", children: [_jsx("input", { type: showSecrets ? "text" : "password", value: settings.instagram_app_secret, onChange: (e) => updateApiSettings({ instagram_app_secret: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-md pr-10", placeholder: "Instagram App Secret" }), _jsx("button", { onClick: () => setShowSecrets(!showSecrets), className: "absolute right-2 top-2 p-1 text-gray-400 hover:text-gray-600", children: showSecrets ? _jsx(EyeOff, { className: "w-4 h-4" }) : _jsx(Eye, { className: "w-4 h-4" }) })] })] })] })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-4", children: [_jsx(Smartphone, { className: "w-6 h-6 text-blue-600" }), _jsx("h3", { className: "text-lg font-semibold", children: "API\u30B7\u30DF\u30E5\u30EC\u30FC\u30B7\u30E7\u30F3" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "API\u7A2E\u985E" }), _jsxs("select", { value: simulationData.apiType, onChange: (e) => setSimulationData({ ...simulationData, apiType: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-md", children: [_jsx("option", { value: "line", children: "LINE API" }), _jsx("option", { value: "instagram", children: "Instagram API" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u30A2\u30AF\u30B7\u30E7\u30F3" }), _jsxs("select", { value: simulationData.action, onChange: (e) => setSimulationData({ ...simulationData, action: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-md", children: [_jsx("option", { value: "send_message", children: "\u30E1\u30C3\u30BB\u30FC\u30B8\u9001\u4FE1" }), _jsx("option", { value: "get_profile", children: "\u30D7\u30ED\u30D5\u30A3\u30FC\u30EB\u53D6\u5F97" }), _jsx("option", { value: "upload_media", children: "\u30E1\u30C7\u30A3\u30A2\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9" })] })] }), _jsx("div", { children: _jsx("button", { onClick: simulateApiCall, disabled: loading, className: "mt-6 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50", children: "\u30B7\u30DF\u30E5\u30EC\u30FC\u30B7\u30E7\u30F3\u5B9F\u884C" }) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u30C6\u30B9\u30C8\u30C7\u30FC\u30BF (JSON)" }), _jsx("textarea", { value: JSON.stringify(simulationData.data, null, 2), onChange: (e) => {
                                    try {
                                        const data = JSON.parse(e.target.value);
                                        setSimulationData({ ...simulationData, data });
                                    }
                                    catch (error) {
                                        // JSONパースエラーは無視
                                    }
                                }, className: "w-full px-3 py-2 border border-gray-300 rounded-md h-24", placeholder: "\u30B7\u30DF\u30E5\u30EC\u30FC\u30B7\u30E7\u30F3\u7528\u306E\u30C6\u30B9\u30C8\u30C7\u30FC\u30BF" })] })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Database, { className: "w-6 h-6 text-purple-600" }), _jsx("h3", { className: "text-lg font-semibold", children: "API\u30ED\u30B0\u5C65\u6B74" })] }), _jsx("button", { onClick: loadApiLogs, disabled: loading, className: "bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 disabled:opacity-50", children: "\u66F4\u65B0" })] }), _jsx("div", { className: "space-y-3 max-h-60 overflow-y-auto", children: logs.length === 0 ? (_jsx("p", { className: "text-gray-500 text-center py-4", children: "\u30ED\u30B0\u304C\u3042\u308A\u307E\u305B\u3093" })) : (logs.map((log) => (_jsxs("div", { className: "bg-gray-50 rounded p-3 text-sm", children: [_jsxs("div", { className: "flex justify-between items-center mb-2", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: "font-medium", children: log.data.apiType }), _jsx("span", { className: "text-gray-500", children: "\u2192" }), _jsx("span", { children: log.data.action })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: `px-2 py-1 rounded text-xs ${log.data.status === 'simulated' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`, children: log.data.status }), _jsx("span", { className: "text-gray-500 text-xs", children: new Date(log.timestamp).toLocaleString() })] })] }), _jsx("p", { className: "text-gray-600", children: log.data.message })] }, log.id)))) })] }), loading && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white rounded-lg p-6 flex items-center space-x-3", children: [_jsx(RefreshCw, { className: "w-6 h-6 animate-spin text-blue-600" }), _jsx("span", { children: "\u51E6\u7406\u4E2D..." })] }) }))] }));
};
export default TestApiSettings;
