import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { MessageCircle, Instagram, X, RefreshCw, Eye, EyeOff, AlertCircle, CheckCircle, ExternalLink, Settings, Save, Calendar, Link, Upload, FileText, Info } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
const ExternalAPISettings = () => {
    const { hasPermission, user } = useAuth();
    const [apiSettings, setApiSettings] = useState({
        line: {
            channelAccessToken: '',
            channelSecret: '',
            webhookUrl: '',
            isConnected: false,
            lastSync: null,
            lastError: null
        },
        instagram: {
            accessToken: '',
            businessAccountId: '',
            appId: '',
            isConnected: false,
            lastSync: null,
            lastError: null
        },
        googleCalendar: {
            clientId: '',
            clientSecret: '',
            calendarId: '',
            autoSync: false,
            syncInterval: 15,
            isConnected: false,
            lastSync: null,
            lastError: null
        },
        openai: {
            apiKey: '',
            model: 'gpt-4',
            maxTokens: 1000,
            isActive: false,
            lastUsed: null,
            usageCount: 0
        }
    });
    const [connectionStatus, setConnectionStatus] = useState({
        line: { status: 'disconnected', message: '未接続', lastTested: null },
        instagram: { status: 'disconnected', message: '未接続', lastTested: null },
        googleCalendar: { status: 'disconnected', message: '未接続', lastTested: null }
    });
    const [showSecrets, setShowSecrets] = useState({
        lineSecret: false,
        instagramToken: false,
        googleSecret: false
    });
    const [activeTab, setActiveTab] = useState('messaging');
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [csvFile, setCsvFile] = useState(null);
    const [importProgress, setImportProgress] = useState({
        isImporting: false,
        progress: 0,
        total: 0
    });
    useEffect(() => {
        loadAPISettings();
    }, []);
    const loadAPISettings = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/v1/integrations/config', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setApiSettings(data.settings || apiSettings);
                setConnectionStatus(data.status || connectionStatus);
            }
        }
        catch (error) {
            console.error('API settings fetch error:', error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const saveAPISettings = async () => {
        setIsSaving(true);
        try {
            const response = await fetch('/api/v1/integrations/config', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ settings: apiSettings })
            });
            if (response.ok) {
                alert('API設定を保存しました');
            }
            else {
                throw new Error('保存に失敗しました');
            }
        }
        catch (error) {
            console.error('Save error:', error);
            alert('保存に失敗しました');
        }
        finally {
            setIsSaving(false);
        }
    };
    const testConnection = async (service) => {
        setConnectionStatus(prev => ({
            ...prev,
            [service]: { ...prev[service], status: 'testing', message: '接続テスト中...' }
        }));
        try {
            const response = await fetch(`/api/v1/integrations/${service}/test`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(apiSettings[service])
            });
            const result = await response.json();
            if (response.ok && result.success) {
                setConnectionStatus(prev => ({
                    ...prev,
                    [service]: {
                        status: 'connected',
                        message: '接続成功',
                        lastTested: new Date().toISOString()
                    }
                }));
                setApiSettings(prev => ({
                    ...prev,
                    [service]: { ...prev[service], isConnected: true, lastError: null }
                }));
            }
            else {
                throw new Error(result.error || '接続テストに失敗しました');
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : '接続エラー';
            setConnectionStatus(prev => ({
                ...prev,
                [service]: {
                    status: 'error',
                    message: errorMessage,
                    lastTested: new Date().toISOString()
                }
            }));
            setApiSettings(prev => ({
                ...prev,
                [service]: { ...prev[service], isConnected: false, lastError: errorMessage }
            }));
        }
    };
    const updateSettings = (service, field, value) => {
        setApiSettings(prev => ({
            ...prev,
            [service]: { ...prev[service], [field]: value }
        }));
    };
    const toggleSecretVisibility = (secret) => {
        setShowSecrets(prev => ({ ...prev, [secret]: !prev[secret] }));
    };
    const getStatusIcon = (status) => {
        switch (status) {
            case 'connected': return _jsx(CheckCircle, { className: "w-5 h-5 text-green-500" });
            case 'testing': return _jsx(RefreshCw, { className: "w-5 h-5 text-blue-500 animate-spin" });
            case 'error': return _jsx(X, { className: "w-5 h-5 text-red-500" });
            default: return _jsx(AlertCircle, { className: "w-5 h-5 text-gray-400" });
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'connected': return 'text-green-600 bg-green-50 border-green-200';
            case 'testing': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'error': return 'text-red-600 bg-red-50 border-red-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };
    // Google Calendar connection
    const handleGoogleCalendarConnect = async () => {
        await testConnection('googleCalendar');
    };
    // CSV Import functions
    const handleFileSelect = (event) => {
        const file = event.target.files?.[0];
        if (file && file.type === 'text/csv') {
            setCsvFile(file);
        }
        else {
            alert('CSVファイルを選択してください');
        }
    };
    const parseCSVReservations = (csvText) => {
        const lines = csvText.split('\n').filter(line => line.trim());
        const reservations = [];
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            if (values.length >= 4) {
                reservations.push({
                    id: `hotpepper_${Date.now()}_${i}`,
                    startTime: values[0]?.trim() || '',
                    customerName: values[1]?.trim() || '',
                    phone: values[2]?.trim() || '',
                    menuContent: values[3]?.trim() || '',
                    staff: values[4]?.trim() || '',
                    price: parseFloat(values[5]?.replace(/[^\d]/g, '') || '0') || 0,
                    status: values[6]?.trim() || 'CONFIRMED',
                    source: 'HOTPEPPER',
                    notes: 'ホットペッパービューティーからのインポート'
                });
            }
        }
        return reservations;
    };
    const handleCSVImport = async () => {
        if (!csvFile)
            return;
        setImportProgress({ isImporting: true, progress: 0, total: 0 });
        try {
            const csvText = await csvFile.text();
            const reservations = parseCSVReservations(csvText);
            setImportProgress(prev => ({ ...prev, total: reservations.length }));
            const results = { imported: 0, errors: [] };
            for (let i = 0; i < reservations.length; i++) {
                try {
                    const response = await fetch('/api/v1/reservations', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        body: JSON.stringify(reservations[i])
                    });
                    if (response.ok) {
                        results.imported++;
                    }
                    else {
                        results.errors.push(`行${i + 2}: インポートに失敗しました`);
                    }
                }
                catch (error) {
                    results.errors.push(`行${i + 2}: ${error instanceof Error ? error.message : 'エラー'}`);
                }
                setImportProgress(prev => ({ ...prev, progress: i + 1 }));
            }
            setImportProgress(prev => ({
                ...prev,
                isImporting: false,
                results
            }));
            alert(`インポート完了: ${results.imported}件成功、${results.errors.length}件エラー`);
        }
        catch (error) {
            setImportProgress({ isImporting: false, progress: 0, total: 0 });
            alert(`CSVファイルの読み取りエラー: ${error instanceof Error ? error.message : 'エラー'}`);
        }
    };
    if (isLoading) {
        return (_jsxs("div", { className: "flex items-center justify-center py-8", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" }), _jsx("span", { className: "ml-2 text-gray-600", children: "\u8A2D\u5B9A\u3092\u8AAD\u307F\u8FBC\u307F\u4E2D..." })] }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium text-gray-900", children: "\u5916\u90E8API\u9023\u643A\u8A2D\u5B9A" }), _jsx("p", { className: "text-sm text-gray-600", children: "\u30E1\u30C3\u30BB\u30FC\u30B8\u30F3\u30B0\u3001\u30AB\u30EC\u30F3\u30C0\u30FC\u9023\u643A\u3001\u30C7\u30FC\u30BF\u30A4\u30F3\u30DD\u30FC\u30C8\u6A5F\u80FD\u306E\u8A2D\u5B9A" })] }), _jsxs("button", { onClick: saveAPISettings, disabled: isSaving, className: "flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors", children: [isSaving ? (_jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white" })) : (_jsx(Save, { className: "w-4 h-4" })), _jsx("span", { children: "\u8A2D\u5B9A\u3092\u4FDD\u5B58" })] })] }), _jsx("div", { className: "border-b border-gray-200", children: _jsxs("nav", { className: "-mb-px flex space-x-8", children: [_jsxs("button", { onClick: () => setActiveTab('messaging'), className: `py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'messaging'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`, children: [_jsx(MessageCircle, { className: "w-4 h-4 inline mr-2" }), "\u30E1\u30C3\u30BB\u30FC\u30B8\u30F3\u30B0\u9023\u643A"] }), _jsxs("button", { onClick: () => setActiveTab('calendar'), className: `py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'calendar'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`, children: [_jsx(Calendar, { className: "w-4 h-4 inline mr-2" }), "\u30AB\u30EC\u30F3\u30C0\u30FC\u9023\u643A"] }), _jsxs("button", { onClick: () => setActiveTab('import'), className: `py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'import'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`, children: [_jsx(Upload, { className: "w-4 h-4 inline mr-2" }), "\u30C7\u30FC\u30BF\u30A4\u30F3\u30DD\u30FC\u30C8"] })] }) }), activeTab === 'messaging' && (_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-white p-6 rounded-lg border border-gray-200", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center", children: _jsx(MessageCircle, { className: "w-6 h-6 text-green-600" }) }), _jsxs("div", { children: [_jsx("h4", { className: "text-md font-medium text-gray-900", children: "LINE Business API" }), _jsx("p", { className: "text-xs text-gray-600", children: "\u30E1\u30C3\u30BB\u30FC\u30B8\u9001\u53D7\u4FE1" })] })] }), _jsxs("div", { className: `px-2 py-1 rounded text-xs border ${getStatusColor(connectionStatus.line.status)}`, children: [getStatusIcon(connectionStatus.line.status), _jsx("span", { className: "ml-1", children: connectionStatus.line.message })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-gray-700 mb-1", children: "Channel Access Token" }), _jsxs("div", { className: "relative", children: [_jsx("input", { type: showSecrets.lineSecret ? 'text' : 'password', value: apiSettings.line.channelAccessToken, onChange: (e) => updateSettings('line', 'channelAccessToken', e.target.value), className: "w-full text-sm px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "Channel Access Token" }), _jsx("button", { onClick: () => toggleSecretVisibility('lineSecret'), className: "absolute right-2 top-2 text-gray-400 hover:text-gray-600", children: showSecrets.lineSecret ? _jsx(EyeOff, { className: "w-4 h-4" }) : _jsx(Eye, { className: "w-4 h-4" }) })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-gray-700 mb-1", children: "Channel Secret" }), _jsx("input", { type: "password", value: apiSettings.line.channelSecret, onChange: (e) => updateSettings('line', 'channelSecret', e.target.value), className: "w-full text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "Channel Secret" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-gray-700 mb-1", children: "Webhook URL" }), _jsx("input", { type: "url", value: apiSettings.line.webhookUrl, onChange: (e) => updateSettings('line', 'webhookUrl', e.target.value), className: "w-full text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "https://your-domain.com/webhook/line" })] }), _jsxs("div", { className: "flex gap-2 pt-3", children: [_jsx("button", { onClick: () => testConnection('line'), disabled: !apiSettings.line.channelAccessToken || !apiSettings.line.channelSecret, className: "flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-3 py-2 rounded text-sm transition-colors", children: "\u63A5\u7D9A\u30C6\u30B9\u30C8" }), _jsx("a", { href: "https://developers.line.biz/", target: "_blank", rel: "noopener noreferrer", className: "px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors", children: _jsx(ExternalLink, { className: "w-4 h-4" }) })] })] })] }), _jsxs("div", { className: "bg-white p-6 rounded-lg border border-gray-200", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center", children: _jsx(Instagram, { className: "w-6 h-6 text-pink-600" }) }), _jsxs("div", { children: [_jsx("h4", { className: "text-md font-medium text-gray-900", children: "Instagram Graph API" }), _jsx("p", { className: "text-xs text-gray-600", children: "\u30C0\u30A4\u30EC\u30AF\u30C8\u30E1\u30C3\u30BB\u30FC\u30B8" })] })] }), _jsxs("div", { className: `px-2 py-1 rounded text-xs border ${getStatusColor(connectionStatus.instagram.status)}`, children: [getStatusIcon(connectionStatus.instagram.status), _jsx("span", { className: "ml-1", children: connectionStatus.instagram.message })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-gray-700 mb-1", children: "Access Token" }), _jsxs("div", { className: "relative", children: [_jsx("input", { type: showSecrets.instagramToken ? 'text' : 'password', value: apiSettings.instagram.accessToken, onChange: (e) => updateSettings('instagram', 'accessToken', e.target.value), className: "w-full text-sm px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "Instagram Access Token" }), _jsx("button", { onClick: () => toggleSecretVisibility('instagramToken'), className: "absolute right-2 top-2 text-gray-400 hover:text-gray-600", children: showSecrets.instagramToken ? _jsx(EyeOff, { className: "w-4 h-4" }) : _jsx(Eye, { className: "w-4 h-4" }) })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-gray-700 mb-1", children: "Business Account ID" }), _jsx("input", { type: "text", value: apiSettings.instagram.businessAccountId, onChange: (e) => updateSettings('instagram', 'businessAccountId', e.target.value), className: "w-full text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "Instagram Business Account ID" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-gray-700 mb-1", children: "App ID" }), _jsx("input", { type: "text", value: apiSettings.instagram.appId, onChange: (e) => updateSettings('instagram', 'appId', e.target.value), className: "w-full text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "Meta App ID" })] }), _jsxs("div", { className: "flex gap-2 pt-3", children: [_jsx("button", { onClick: () => testConnection('instagram'), disabled: !apiSettings.instagram.accessToken || !apiSettings.instagram.businessAccountId, className: "flex-1 bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white px-3 py-2 rounded text-sm transition-colors", children: "\u63A5\u7D9A\u30C6\u30B9\u30C8" }), _jsx("a", { href: "https://developers.facebook.com/", target: "_blank", rel: "noopener noreferrer", className: "px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors", children: _jsx(ExternalLink, { className: "w-4 h-4" }) })] })] })] }), _jsx("div", { className: "lg:col-span-2 bg-blue-50 p-6 rounded-lg border border-blue-200", children: _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx(Settings, { className: "w-6 h-6 text-blue-600 mt-1" }), _jsxs("div", { children: [_jsx("h4", { className: "text-md font-medium text-blue-900 mb-2", children: "API\u9023\u643A\u30AC\u30A4\u30C9" }), _jsxs("div", { className: "space-y-3 text-sm text-blue-800", children: [_jsxs("div", { children: [_jsx("p", { className: "font-semibold mb-1", children: "LINE Business API \u306E\u8A2D\u5B9A\u624B\u9806\uFF1A" }), _jsxs("ol", { className: "list-decimal list-inside space-y-1 ml-2", children: [_jsx("li", { children: "LINE Developers \u3067\u30A2\u30AB\u30A6\u30F3\u30C8\u4F5C\u6210\u30FB\u30ED\u30B0\u30A4\u30F3" }), _jsx("li", { children: "\u65B0\u3057\u3044\u30D7\u30ED\u30D0\u30A4\u30C0\u30FC\u3092\u4F5C\u6210" }), _jsx("li", { children: "Messaging API \u30C1\u30E3\u30F3\u30CD\u30EB\u3092\u4F5C\u6210" }), _jsx("li", { children: "Channel Access Token \u3092\u53D6\u5F97\uFF08\u30E1\u30C3\u30BB\u30FC\u30B8\u9001\u4FE1\u7528\uFF09" }), _jsx("li", { children: "Channel Secret \u3092\u53D6\u5F97\uFF08\u7F72\u540D\u691C\u8A3C\u7528\uFF09" }), _jsx("li", { children: "Webhook URL \u3092\u8A2D\u5B9A\uFF08\u304A\u5BA2\u69D8\u304B\u3089\u306E\u30E1\u30C3\u30BB\u30FC\u30B8\u3092\u53D7\u4FE1\u3059\u308B\u305F\u3081\uFF09" })] })] }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold mb-1", children: "Instagram Graph API \u306E\u8A2D\u5B9A\u624B\u9806\uFF1A" }), _jsxs("ol", { className: "list-decimal list-inside space-y-1 ml-2", children: [_jsx("li", { children: "Meta for Developers \u3067\u30A2\u30D7\u30EA\u3092\u4F5C\u6210" }), _jsx("li", { children: "Instagram Basic Display API \u3092\u6709\u52B9\u5316" }), _jsx("li", { children: "\u30D3\u30B8\u30CD\u30B9\u30A2\u30AB\u30A6\u30F3\u30C8\u3092\u9023\u643A" }), _jsx("li", { children: "Access Token \u3092\u53D6\u5F97\uFF08DM\u6A5F\u80FD\u3092\u4F7F\u7528\u3059\u308B\u305F\u3081\uFF09" })] })] }), _jsxs("div", { className: "bg-yellow-50 border border-yellow-200 rounded p-3 mt-3", children: [_jsx("p", { className: "font-semibold text-yellow-800", children: "\u91CD\u8981\uFF1A" }), _jsx("p", { className: "text-yellow-800", children: "\u3053\u308C\u3089\u306EAPI\u3092\u9023\u643A\u3059\u308B\u3053\u3068\u3067\u3001LINE\u3084Instagram\u304B\u3089\u306E\u554F\u3044\u5408\u308F\u305B\u3092\u7D71\u5408\u7BA1\u7406\u3067\u304D\u307E\u3059\u3002\u8A2D\u5B9A\u5F8C\u3001\u304A\u5BA2\u69D8\u304B\u3089\u306E\u30E1\u30C3\u30BB\u30FC\u30B8\u304C\u81EA\u52D5\u7684\u306B\u30B7\u30B9\u30C6\u30E0\u306B\u8868\u793A\u3055\u308C\u307E\u3059\u3002" })] })] })] })] }) })] })), activeTab === 'calendar' && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-white p-6 rounded-lg border border-gray-200", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center", children: _jsx(Calendar, { className: "w-6 h-6 text-blue-600" }) }), _jsxs("div", { children: [_jsx("h4", { className: "text-lg font-medium text-gray-900", children: "Google Calendar \u9023\u643A" }), _jsx("p", { className: "text-sm text-gray-600", children: "Google Calendar\u3068\u306E\u53CC\u65B9\u5411\u540C\u671F\u6A5F\u80FD" })] })] }), _jsxs("div", { className: `px-3 py-1 rounded-full text-sm border ${getStatusColor(connectionStatus.googleCalendar.status)}`, children: [getStatusIcon(connectionStatus.googleCalendar.status), _jsx("span", { className: "ml-1", children: connectionStatus.googleCalendar.message })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Google Client ID" }), _jsx("input", { type: "text", value: apiSettings.googleCalendar.clientId, onChange: (e) => updateSettings('googleCalendar', 'clientId', e.target.value), placeholder: "Google API Client ID", className: "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Google Client Secret" }), _jsxs("div", { className: "relative", children: [_jsx("input", { type: showSecrets.googleSecret ? 'text' : 'password', value: apiSettings.googleCalendar.clientSecret, onChange: (e) => updateSettings('googleCalendar', 'clientSecret', e.target.value), placeholder: "Google API Client Secret", className: "w-full px-3 py-2 pr-10 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" }), _jsx("button", { onClick: () => toggleSecretVisibility('googleSecret'), className: "absolute right-2 top-2 text-gray-400 hover:text-gray-600", children: showSecrets.googleSecret ? _jsx(EyeOff, { className: "w-4 h-4" }) : _jsx(Eye, { className: "w-4 h-4" }) })] })] })] }), _jsxs("div", { className: "mt-4", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Calendar ID\uFF08\u30AA\u30D7\u30B7\u30E7\u30F3\uFF09" }), _jsx("input", { type: "text", value: apiSettings.googleCalendar.calendarId, onChange: (e) => updateSettings('googleCalendar', 'calendarId', e.target.value), placeholder: "primary\uFF08\u30D7\u30E9\u30A4\u30DE\u30EA\u30AB\u30EC\u30F3\u30C0\u30FC\u306E\u5834\u5408\uFF09", className: "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" })] }), _jsxs("div", { className: "flex items-center justify-between mt-6 pt-4 border-t border-gray-200", children: [_jsxs("div", { children: [_jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: apiSettings.googleCalendar.autoSync, onChange: (e) => updateSettings('googleCalendar', 'autoSync', e.target.checked), className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500" }), _jsx("span", { className: "ml-2 text-sm text-gray-700", children: "\u81EA\u52D5\u540C\u671F\u3092\u6709\u52B9\u306B\u3059\u308B" })] }), _jsx("p", { className: "text-xs text-gray-500 ml-6 mt-1", children: "\u6307\u5B9A\u9593\u9694\u3067Google Calendar\u3068\u81EA\u52D5\u540C\u671F\u3057\u307E\u3059" })] }), _jsxs("div", { className: "text-right", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u540C\u671F\u9593\u9694" }), _jsxs("select", { value: apiSettings.googleCalendar.syncInterval, onChange: (e) => updateSettings('googleCalendar', 'syncInterval', parseInt(e.target.value)), className: "px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: 5, children: "5\u5206" }), _jsx("option", { value: 15, children: "15\u5206" }), _jsx("option", { value: 30, children: "30\u5206" }), _jsx("option", { value: 60, children: "1\u6642\u9593" })] })] })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 mt-6", children: [_jsxs("button", { onClick: handleGoogleCalendarConnect, disabled: !apiSettings.googleCalendar.clientId || !apiSettings.googleCalendar.clientSecret, className: "btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center", children: [_jsx(Link, { className: "w-4 h-4 mr-2" }), apiSettings.googleCalendar.isConnected ? '再接続' : 'Google Calendarに接続'] }), apiSettings.googleCalendar.isConnected && (_jsx("button", { onClick: () => updateSettings('googleCalendar', 'isConnected', false), className: "btn btn-secondary", children: "\u63A5\u7D9A\u89E3\u9664" })), _jsxs("button", { className: "btn btn-secondary flex items-center", children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2" }), "\u624B\u52D5\u540C\u671F"] })] })] }), _jsx("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-6", children: _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx(Info, { className: "w-5 h-5 text-blue-600 mt-0.5" }), _jsxs("div", { children: [_jsx("h5", { className: "font-semibold text-blue-900 mb-3", children: "Google Calendar API\u8A2D\u5B9A\u624B\u9806" }), _jsxs("ol", { className: "list-decimal list-inside space-y-2 text-sm text-blue-800", children: [_jsx("li", { children: "Google Cloud Console\uFF08console.cloud.google.com\uFF09\u306B\u30ED\u30B0\u30A4\u30F3" }), _jsx("li", { children: "\u65B0\u3057\u3044\u30D7\u30ED\u30B8\u30A7\u30AF\u30C8\u3092\u4F5C\u6210\u3001\u307E\u305F\u306F\u65E2\u5B58\u306E\u30D7\u30ED\u30B8\u30A7\u30AF\u30C8\u3092\u9078\u629E" }), _jsx("li", { children: "\u300CAPIs & Services\u300D\u2192\u300CLibrary\u300D\u3067Google Calendar API\u3092\u6709\u52B9\u5316" }), _jsx("li", { children: "\u300CAPIs & Services\u300D\u2192\u300CCredentials\u300D\u3067\u300COAuth 2.0 Client IDs\u300D\u3092\u4F5C\u6210" }), _jsx("li", { children: "\u30A2\u30D7\u30EA\u30B1\u30FC\u30B7\u30E7\u30F3\u30BF\u30A4\u30D7\u306F\u300CWeb application\u300D\u3092\u9078\u629E" }), _jsxs("li", { children: ["\u8A8D\u8A3C\u6E08\u307F\u30EA\u30C0\u30A4\u30EC\u30AF\u30C8URI\u306B\u300C", window.location.origin, "/auth/google/callback\u300D\u3092\u8FFD\u52A0"] }), _jsx("li", { children: "\u4F5C\u6210\u3055\u308C\u305FClient ID\u3068Client Secret\u3092\u4E0A\u8A18\u30D5\u30A9\u30FC\u30E0\u306B\u5165\u529B" })] }), _jsxs("div", { className: "bg-blue-100 border border-blue-300 rounded p-3 mt-4", children: [_jsx("p", { className: "font-semibold text-blue-900", children: "\u9023\u643A\u5F8C\u306E\u6A5F\u80FD\uFF1A" }), _jsxs("ul", { className: "list-disc list-inside text-sm text-blue-800 mt-1", children: [_jsx("li", { children: "\u30B7\u30B9\u30C6\u30E0\u306E\u4E88\u7D04\u304CGoogle Calendar\u306B\u81EA\u52D5\u8FFD\u52A0" }), _jsx("li", { children: "Google Calendar\u306E\u4E88\u5B9A\u304C\u30B7\u30B9\u30C6\u30E0\u306B\u53CD\u6620" }), _jsx("li", { children: "\u4E88\u7D04\u5909\u66F4\u6642\u306E\u53CC\u65B9\u5411\u540C\u671F" }), _jsx("li", { children: "\u91CD\u8907\u4E88\u7D04\u306E\u81EA\u52D5\u691C\u51FA\u3068\u8B66\u544A" })] })] })] })] }) })] })), activeTab === 'import' && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-white p-6 rounded-lg border border-gray-200", children: [_jsxs("div", { className: "flex items-center space-x-3 mb-6", children: [_jsx("div", { className: "w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center", children: _jsx(Upload, { className: "w-6 h-6 text-orange-600" }) }), _jsxs("div", { children: [_jsx("h4", { className: "text-lg font-medium text-gray-900", children: "\u30DB\u30C3\u30C8\u30DA\u30C3\u30D1\u30FC\u30D3\u30E5\u30FC\u30C6\u30A3\u30FC\u4E88\u7D04\u30C7\u30FC\u30BF\u30A4\u30F3\u30DD\u30FC\u30C8" }), _jsx("p", { className: "text-sm text-gray-600", children: "CSV\u5F62\u5F0F\u3067\u4E88\u7D04\u30C7\u30FC\u30BF\u3092\u4E00\u62EC\u30A4\u30F3\u30DD\u30FC\u30C8" })] })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "CSV\u30D5\u30A1\u30A4\u30EB\u3092\u9078\u629E" }), _jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("input", { type: "file", accept: ".csv", onChange: handleFileSelect, className: "block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" }), csvFile && (_jsxs("div", { className: "flex items-center text-sm text-green-600", children: [_jsx(CheckCircle, { className: "w-4 h-4 mr-1" }), csvFile.name] }))] })] }), importProgress.isImporting && (_jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-sm font-medium text-blue-900", children: "\u30A4\u30F3\u30DD\u30FC\u30C8\u4E2D..." }), _jsxs("span", { className: "text-sm text-blue-700", children: [importProgress.progress, " / ", importProgress.total] })] }), _jsx("div", { className: "w-full bg-blue-200 rounded-full h-2", children: _jsx("div", { className: "bg-blue-600 h-2 rounded-full transition-all duration-300", style: { width: `${(importProgress.progress / importProgress.total) * 100}%` } }) })] })), importProgress.results && (_jsxs("div", { className: "bg-green-50 border border-green-200 rounded-lg p-4", children: [_jsx("h5", { className: "font-medium text-green-900 mb-2", children: "\u30A4\u30F3\u30DD\u30FC\u30C8\u7D50\u679C" }), _jsxs("div", { className: "text-sm text-green-800", children: [_jsxs("p", { children: ["\u6210\u529F: ", importProgress.results.imported, "\u4EF6"] }), _jsxs("p", { children: ["\u30A8\u30E9\u30FC: ", importProgress.results.errors.length, "\u4EF6"] }), importProgress.results.errors.length > 0 && (_jsxs("details", { className: "mt-2", children: [_jsx("summary", { className: "cursor-pointer", children: "\u30A8\u30E9\u30FC\u8A73\u7D30\u3092\u8868\u793A" }), _jsx("ul", { className: "mt-1 list-disc list-inside", children: importProgress.results.errors.map((error, i) => (_jsx("li", { className: "text-red-600", children: error }, i))) })] }))] })] })), _jsxs("div", { className: "flex space-x-3", children: [_jsxs("button", { onClick: handleCSVImport, disabled: !csvFile || importProgress.isImporting, className: "btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center", children: [_jsx(Upload, { className: "w-4 h-4 mr-2" }), importProgress.isImporting ? 'インポート中...' : 'インポート開始'] }), csvFile && (_jsx("button", { onClick: () => setCsvFile(null), className: "btn btn-secondary", children: "\u30D5\u30A1\u30A4\u30EB\u3092\u30AF\u30EA\u30A2" }))] })] })] }), _jsx("div", { className: "bg-yellow-50 border border-yellow-200 rounded-lg p-6", children: _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx(FileText, { className: "w-5 h-5 text-yellow-600 mt-0.5" }), _jsxs("div", { children: [_jsx("h5", { className: "font-semibold text-yellow-900 mb-3", children: "CSV\u30D5\u30A1\u30A4\u30EB\u5F62\u5F0F\u306B\u3064\u3044\u3066" }), _jsxs("div", { className: "text-sm text-yellow-800 space-y-3", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium mb-1", children: "\u5FC5\u8981\u306A\u5217\uFF08\u9806\u756A\u901A\u308A\uFF09\uFF1A" }), _jsxs("ol", { className: "list-decimal list-inside ml-2", children: [_jsx("li", { children: "\u4E88\u7D04\u65E5\u6642\uFF08\u4F8B: 2024-06-15 10:00:00\uFF09" }), _jsx("li", { children: "\u9867\u5BA2\u540D\uFF08\u4F8B: \u7530\u4E2D\u82B1\u5B50\uFF09" }), _jsx("li", { children: "\u96FB\u8A71\u756A\u53F7\uFF08\u4F8B: 090-1234-5678\uFF09" }), _jsx("li", { children: "\u30E1\u30CB\u30E5\u30FC\uFF08\u4F8B: \u30AB\u30C3\u30C8+\u30AB\u30E9\u30FC\uFF09" }), _jsx("li", { children: "\u62C5\u5F53\u8005\uFF08\u4F8B: \u4F50\u85E4\u7F8E\u54B2\uFF09" }), _jsx("li", { children: "\u91D1\u984D\uFF08\u4F8B: 8000\uFF09" }), _jsx("li", { children: "\u30B9\u30C6\u30FC\u30BF\u30B9\uFF08\u4F8B: CONFIRMED\uFF09" })] })] }), _jsxs("div", { children: [_jsx("p", { className: "font-medium mb-1", children: "CSV\u30B5\u30F3\u30D7\u30EB\uFF1A" }), _jsxs("code", { className: "block bg-yellow-100 p-2 rounded text-xs", children: ["\u4E88\u7D04\u65E5\u6642,\u9867\u5BA2\u540D,\u96FB\u8A71\u756A\u53F7,\u30E1\u30CB\u30E5\u30FC,\u62C5\u5F53\u8005,\u91D1\u984D,\u30B9\u30C6\u30FC\u30BF\u30B9", _jsx("br", {}), "2024-06-15 10:00:00,\u7530\u4E2D\u82B1\u5B50,090-1234-5678,\u30AB\u30C3\u30C8+\u30AB\u30E9\u30FC,\u4F50\u85E4\u7F8E\u54B2,8000,CONFIRMED", _jsx("br", {}), "2024-06-15 14:00:00,\u5C71\u7530\u592A\u90CE,080-9876-5432,\u30AB\u30C3\u30C8,\u7530\u4E2D\u7F8E\u54B2,4000,CONFIRMED"] })] }), _jsxs("div", { className: "bg-yellow-100 border border-yellow-300 rounded p-3", children: [_jsx("p", { className: "font-semibold text-yellow-900", children: "\u6CE8\u610F\u4E8B\u9805\uFF1A" }), _jsxs("ul", { className: "list-disc list-inside text-yellow-800 mt-1", children: [_jsx("li", { children: "\u30D5\u30A1\u30A4\u30EB\u306FUTF-8\u30A8\u30F3\u30B3\u30FC\u30C7\u30A3\u30F3\u30B0\u3067\u4FDD\u5B58\u3057\u3066\u304F\u3060\u3055\u3044" }), _jsx("li", { children: "\u65E5\u6642\u306F\u300CYYYY-MM-DD HH:MM:SS\u300D\u5F62\u5F0F\u3067\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044" }), _jsx("li", { children: "\u91CD\u8907\u3059\u308B\u4E88\u7D04\u306F\u81EA\u52D5\u7684\u306B\u30B9\u30AD\u30C3\u30D7\u3055\u308C\u307E\u3059" }), _jsx("li", { children: "\u5927\u91CF\u30C7\u30FC\u30BF\u306E\u5834\u5408\u306F\u6642\u9593\u304C\u304B\u304B\u308B\u5834\u5408\u304C\u3042\u308A\u307E\u3059" })] })] })] })] })] }) })] }))] }));
};
export default ExternalAPISettings;
