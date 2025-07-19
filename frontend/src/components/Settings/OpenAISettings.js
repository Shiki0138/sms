import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Bot, Eye, EyeOff, Save, Shield, AlertCircle, CheckCircle, Zap, BarChart3 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
const OpenAISettings = () => {
    const { hasPermission, user } = useAuth();
    const [openaiSettings, setOpenaiSettings] = useState({
        apiKey: '',
        model: 'gpt-4',
        maxTokens: 1000,
        temperature: 0.7,
        isActive: false,
        lastUsed: null,
        usageCount: 0,
        monthlyLimit: 10000,
        estimatedCosts: 0
    });
    const [showApiKey, setShowApiKey] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [testResult, setTestResult] = useState(null);
    // 管理者権限チェック
    const isAdmin = user?.role === 'admin';
    useEffect(() => {
        if (isAdmin) {
            loadOpenAISettings();
        }
        else {
            setIsLoading(false);
        }
    }, [isAdmin]);
    const loadOpenAISettings = async () => {
        setIsLoading(true);
        try {
            // 実際の本番環境ではAPIからデータを取得
            // デモ環境では初期値を使用
            console.log('OpenAI設定を読み込みました');
        }
        catch (error) {
            console.error('OpenAI settings load error:', error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const saveSettings = async () => {
        setIsSaving(true);
        try {
            // 実際の本番環境ではAPIに送信
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log('OpenAI設定を保存:', openaiSettings);
            alert('OpenAI設定を保存しました');
        }
        catch (error) {
            console.error('Save error:', error);
            alert('保存に失敗しました');
        }
        finally {
            setIsSaving(false);
        }
    };
    const testConnection = async () => {
        if (!openaiSettings.apiKey) {
            setTestResult({ success: false, message: 'APIキーが設定されていません' });
            return;
        }
        try {
            // デモ用のテスト
            await new Promise(resolve => setTimeout(resolve, 2000));
            setTestResult({ success: true, message: 'OpenAI APIとの接続に成功しました' });
        }
        catch (error) {
            setTestResult({ success: false, message: 'OpenAI APIとの接続に失敗しました' });
        }
    };
    const updateSettings = (key, value) => {
        setOpenaiSettings(prev => ({ ...prev, [key]: value }));
    };
    // 管理者以外はアクセス拒否
    if (!isAdmin) {
        return (_jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-8 text-center", children: [_jsx("div", { className: "mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4", children: _jsx(Shield, { className: "h-8 w-8 text-red-600" }) }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "\u7BA1\u7406\u8005\u9650\u5B9A\u6A5F\u80FD" }), _jsx("p", { className: "text-gray-600 mb-4", children: "OpenAI\u8A2D\u5B9A\u306F\u7BA1\u7406\u8005\u306E\u307F\u304C\u30A2\u30AF\u30BB\u30B9\u3067\u304D\u307E\u3059" }), _jsxs("div", { className: "text-sm text-gray-500", children: ["\u73FE\u5728\u306E\u30ED\u30FC\u30EB: ", _jsx("span", { className: "font-medium", children: user?.role })] })] }));
    }
    if (isLoading) {
        return (_jsxs("div", { className: "flex items-center justify-center py-8", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" }), _jsx("span", { className: "ml-2 text-gray-600", children: "\u8AAD\u307F\u8FBC\u307F\u4E2D..." })] }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("h3", { className: "text-lg font-medium text-gray-900 flex items-center", children: [_jsx(Bot, { className: "w-5 h-5 mr-2" }), "OpenAI\u8A2D\u5B9A"] }), _jsx("p", { className: "text-sm text-gray-600", children: "AI\u8FD4\u4FE1\u6A5F\u80FD\u306E\u305F\u3081\u306EOpenAI API\u8A2D\u5B9A" })] }), _jsxs("button", { onClick: saveSettings, disabled: isSaving, className: "flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors", children: [isSaving ? (_jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white" })) : (_jsx(Save, { className: "w-4 h-4" })), _jsx("span", { children: "\u8A2D\u5B9A\u3092\u4FDD\u5B58" })] })] }), _jsxs("div", { className: "bg-white p-6 rounded-lg border border-gray-200", children: [_jsx("h4", { className: "text-md font-medium text-gray-900 mb-4", children: "\u57FA\u672C\u8A2D\u5B9A" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: ["OpenAI API\u30AD\u30FC ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsxs("div", { className: "relative", children: [_jsx("input", { type: showApiKey ? 'text' : 'password', value: openaiSettings.apiKey, onChange: (e) => updateSettings('apiKey', e.target.value), className: "w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "sk-..." }), _jsx("button", { type: "button", onClick: () => setShowApiKey(!showApiKey), className: "absolute inset-y-0 right-0 pr-3 flex items-center", children: showApiKey ? (_jsx(EyeOff, { className: "h-4 w-4 text-gray-400" })) : (_jsx(Eye, { className: "h-4 w-4 text-gray-400" })) })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "AI\u30E2\u30C7\u30EB" }), _jsxs("select", { value: openaiSettings.model, onChange: (e) => updateSettings('model', e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: "gpt-4", children: "GPT-4 (\u9AD8\u7CBE\u5EA6\u30FB\u9AD8\u30B3\u30B9\u30C8)" }), _jsx("option", { value: "gpt-3.5-turbo", children: "GPT-3.5 Turbo (\u6A19\u6E96\u30FB\u4F4E\u30B3\u30B9\u30C8)" })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "\u6700\u5927\u30C8\u30FC\u30AF\u30F3\u6570" }), _jsx("input", { type: "number", min: "100", max: "4000", value: openaiSettings.maxTokens, onChange: (e) => updateSettings('maxTokens', parseInt(e.target.value)), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Temperature (\u5275\u9020\u6027)" }), _jsx("input", { type: "number", min: "0", max: "2", step: "0.1", value: openaiSettings.temperature, onChange: (e) => updateSettings('temperature', parseFloat(e.target.value)), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" })] })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("input", { type: "checkbox", id: "openai-active", checked: openaiSettings.isActive, onChange: (e) => updateSettings('isActive', e.target.checked), className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500" }), _jsx("label", { htmlFor: "openai-active", className: "text-sm font-medium text-gray-700", children: "AI\u8FD4\u4FE1\u6A5F\u80FD\u3092\u6709\u52B9\u306B\u3059\u308B" })] })] })] }), _jsxs("div", { className: "bg-white p-6 rounded-lg border border-gray-200", children: [_jsx("h4", { className: "text-md font-medium text-gray-900 mb-4", children: "\u63A5\u7D9A\u30C6\u30B9\u30C8" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("button", { onClick: testConnection, disabled: !openaiSettings.apiKey, className: "flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors", children: [_jsx(Zap, { className: "w-4 h-4" }), _jsx("span", { children: "\u63A5\u7D9A\u30C6\u30B9\u30C8" })] }), testResult && (_jsxs("div", { className: `flex items-center space-x-2 p-3 rounded-lg ${testResult.success
                                    ? 'bg-green-50 border border-green-200 text-green-700'
                                    : 'bg-red-50 border border-red-200 text-red-700'}`, children: [testResult.success ? (_jsx(CheckCircle, { className: "w-5 h-5" })) : (_jsx(AlertCircle, { className: "w-5 h-5" })), _jsx("span", { className: "text-sm", children: testResult.message })] }))] })] }), _jsxs("div", { className: "bg-white p-6 rounded-lg border border-gray-200", children: [_jsxs("h4", { className: "text-md font-medium text-gray-900 mb-4 flex items-center", children: [_jsx(BarChart3, { className: "w-4 h-4 mr-2" }), "\u4F7F\u7528\u72B6\u6CC1"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "text-center p-4 bg-blue-50 rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold text-blue-600", children: openaiSettings.usageCount }), _jsx("div", { className: "text-sm text-blue-600", children: "\u4ECA\u6708\u306E\u4F7F\u7528\u56DE\u6570" })] }), _jsxs("div", { className: "text-center p-4 bg-green-50 rounded-lg", children: [_jsxs("div", { className: "text-2xl font-bold text-green-600", children: ["$", openaiSettings.estimatedCosts.toFixed(2)] }), _jsx("div", { className: "text-sm text-green-600", children: "\u63A8\u5B9A\u8CBB\u7528" })] }), _jsxs("div", { className: "text-center p-4 bg-yellow-50 rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold text-yellow-600", children: openaiSettings.monthlyLimit }), _jsx("div", { className: "text-sm text-yellow-600", children: "\u6708\u9593\u4E0A\u9650" })] })] }), openaiSettings.lastUsed && (_jsxs("div", { className: "mt-4 text-sm text-gray-600", children: ["\u6700\u7D42\u4F7F\u7528: ", new Date(openaiSettings.lastUsed).toLocaleString('ja-JP')] }))] }), _jsx("div", { className: "bg-yellow-50 p-4 rounded-lg border border-yellow-200", children: _jsxs("div", { className: "flex items-start space-x-2", children: [_jsx(AlertCircle, { className: "w-5 h-5 text-yellow-600 mt-0.5" }), _jsxs("div", { children: [_jsx("h5", { className: "text-sm font-medium text-yellow-900 mb-1", children: "\u91CD\u8981\u306A\u6CE8\u610F\u4E8B\u9805" }), _jsxs("ul", { className: "text-xs text-yellow-800 space-y-1", children: [_jsx("li", { children: "\u2022 OpenAI API\u30AD\u30FC\u306F\u6A5F\u5BC6\u60C5\u5831\u3067\u3059\u3002\u9069\u5207\u306B\u7BA1\u7406\u3057\u3066\u304F\u3060\u3055\u3044" }), _jsx("li", { children: "\u2022 GPT-4\u306F\u9AD8\u7CBE\u5EA6\u3067\u3059\u304C\u3001GPT-3.5 Turbo\u3088\u308A\u7D0410\u500D\u306E\u30B3\u30B9\u30C8\u304C\u304B\u304B\u308A\u307E\u3059" }), _jsx("li", { children: "\u2022 \u6708\u9593\u4F7F\u7528\u91CF\u3092\u76E3\u8996\u3057\u3001\u30B3\u30B9\u30C8\u3092\u30B3\u30F3\u30C8\u30ED\u30FC\u30EB\u3057\u3066\u304F\u3060\u3055\u3044" }), _jsx("li", { children: "\u2022 AI\u8FD4\u4FE1\u306F\u53C2\u8003\u3068\u3057\u3066\u751F\u6210\u3055\u308C\u307E\u3059\u3002\u9001\u4FE1\u524D\u306B\u5FC5\u305A\u5185\u5BB9\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044" }), _jsx("li", { children: "\u2022 \u3053\u306E\u8A2D\u5B9A\u306F\u7BA1\u7406\u8005\u306E\u307F\u304C\u30A2\u30AF\u30BB\u30B9\u3067\u304D\u307E\u3059" })] })] })] }) })] }));
};
export default OpenAISettings;
