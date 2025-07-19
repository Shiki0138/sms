import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Bell, Mail, MessageCircle, Calendar, Clock, TestTube2, Settings, Save } from 'lucide-react';
// カード コンポーネント
const Card = ({ children, className = '' }) => (_jsx("div", { className: `bg-white rounded-xl shadow-lg border border-gray-200 ${className}`, children: children }));
const CardHeader = ({ children }) => (_jsx("div", { className: "px-6 py-4 border-b border-gray-200", children: children }));
const CardContent = ({ children, className = '' }) => (_jsx("div", { className: `px-6 py-4 ${className}`, children: children }));
// スイッチ コンポーネント
const Switch = ({ checked, onChange, className = '' }) => (_jsx("button", { type: "button", role: "switch", "aria-checked": checked, onClick: () => onChange(!checked), className: `
      relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent 
      transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
      ${checked ? 'bg-indigo-600' : 'bg-gray-200'}
      ${className}
    `, children: _jsx("span", { className: `
        pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
        transition duration-200 ease-in-out
        ${checked ? 'translate-x-5' : 'translate-x-0'}
      ` }) }));
// ボタン コンポーネント
const Button = ({ children, onClick, variant = 'default', size = 'default', className = '', loading = false, disabled = false }) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    const variantClasses = {
        default: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
        outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-indigo-500',
        destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
    };
    const sizeClasses = {
        default: 'px-4 py-2 text-sm',
        sm: 'px-3 py-1.5 text-xs',
        lg: 'px-6 py-3 text-base'
    };
    return (_jsxs("button", { type: "button", onClick: onClick, disabled: disabled || loading, className: `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`, children: [loading && (_jsxs("svg", { className: "animate-spin -ml-1 mr-2 h-4 w-4", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })] })), children] }));
};
export const ReminderSettings = () => {
    const [settings, setSettings] = useState({
        emailEnabled: true,
        lineEnabled: true,
        weekBeforeEnabled: true,
        threeDaysBeforeEnabled: true,
        followUpEnabled: true,
        emailTemplates: {
            weekBefore: '{customerName}様、{reservationDate}のご予約確認です。1週間前のリマインドをお送りします。',
            threeDays: '{customerName}様、{reservationDate}のご予約まで3日となりました。お待ちしております。',
            followUp: '{customerName}様、いつもありがとうございます。お元気でしょうか？特別なご提案をお送りします。'
        }
    });
    const [loading, setLoading] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    useEffect(() => {
        fetchReminderSettings();
    }, []);
    const fetchReminderSettings = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/v1/settings/reminders');
            if (response.ok) {
                const data = await response.json();
                setSettings(data);
            }
        }
        catch (error) {
            console.error('Failed to fetch reminder settings:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const saveSettings = async () => {
        setSaveLoading(true);
        try {
            const response = await fetch('/api/v1/settings/reminders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(settings),
            });
            if (response.ok) {
                alert('リマインド設定を保存しました');
            }
            else {
                throw new Error('Failed to save settings');
            }
        }
        catch (error) {
            console.error('Failed to save reminder settings:', error);
            alert('保存に失敗しました');
        }
        finally {
            setSaveLoading(false);
        }
    };
    const testReminder = async (type) => {
        try {
            const response = await fetch(`/api/v1/reminders/test/${type}`, {
                method: 'POST'
            });
            if (response.ok) {
                alert('テストメールを送信しました');
            }
            else {
                throw new Error('Failed to send test reminder');
            }
        }
        catch (error) {
            console.error('Failed to send test reminder:', error);
            alert('テスト送信に失敗しました');
        }
    };
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center p-8", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" }) }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center space-x-3 mb-6", children: [_jsx("div", { className: "p-2 bg-indigo-100 rounded-lg", children: _jsx(Bell, { className: "h-6 w-6 text-indigo-600" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "\u81EA\u52D5\u30EA\u30DE\u30A4\u30F3\u30C9\u8A2D\u5B9A" }), _jsx("p", { className: "text-gray-600", children: "\u4E88\u7D04\u306E\u30EA\u30DE\u30A4\u30F3\u30C9\u3068\u30D5\u30A9\u30ED\u30FC\u30A2\u30C3\u30D7\u30E1\u30C3\u30BB\u30FC\u30B8\u3092\u81EA\u52D5\u9001\u4FE1\u3057\u307E\u3059" })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Settings, { className: "h-5 w-5 text-gray-600" }), _jsx("h3", { className: "text-lg font-semibold", children: "\u57FA\u672C\u8A2D\u5B9A" })] }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: "\u30E1\u30FC\u30EB\u30FBLINE\u3067\u306E\u81EA\u52D5\u30EA\u30DE\u30A4\u30F3\u30C9\u6A5F\u80FD\u3092\u8A2D\u5B9A\u3057\u307E\u3059" })] }), _jsx(CardContent, { className: "space-y-4", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "flex items-center justify-between p-4 bg-gray-50 rounded-lg", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(Mail, { className: "h-5 w-5 text-blue-600" }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-900", children: "\u30E1\u30FC\u30EB\u30EA\u30DE\u30A4\u30F3\u30C9" }), _jsx("p", { className: "text-xs text-gray-500", children: "\u30E1\u30FC\u30EB\u3067\u306E\u81EA\u52D5\u9001\u4FE1" })] })] }), _jsx(Switch, { checked: settings.emailEnabled, onChange: (checked) => setSettings(prev => ({ ...prev, emailEnabled: checked })) })] }), _jsxs("div", { className: "flex items-center justify-between p-4 bg-gray-50 rounded-lg", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(MessageCircle, { className: "h-5 w-5 text-green-600" }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-900", children: "LINE\u30EA\u30DE\u30A4\u30F3\u30C9" }), _jsx("p", { className: "text-xs text-gray-500", children: "LINE\u3067\u306E\u81EA\u52D5\u9001\u4FE1" })] })] }), _jsx(Switch, { checked: settings.lineEnabled, onChange: (checked) => setSettings(prev => ({ ...prev, lineEnabled: checked })) })] })] }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Clock, { className: "h-5 w-5 text-gray-600" }), _jsx("h3", { className: "text-lg font-semibold", children: "\u9001\u4FE1\u30BF\u30A4\u30DF\u30F3\u30B0\u8A2D\u5B9A" })] }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: "\u3044\u3064\u30EA\u30DE\u30A4\u30F3\u30C9\u30E1\u30C3\u30BB\u30FC\u30B8\u3092\u9001\u4FE1\u3059\u308B\u304B\u3092\u8A2D\u5B9A\u3057\u307E\u3059" })] }), _jsx(CardContent, { className: "space-y-4", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between p-4 border border-gray-200 rounded-lg", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(Calendar, { className: "h-5 w-5 text-purple-600" }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-900", children: "1\u9031\u9593\u524D\u30EA\u30DE\u30A4\u30F3\u30C9" }), _jsx("p", { className: "text-xs text-gray-500", children: "\u4E88\u7D04\u65E5\u306E7\u65E5\u524D\u306B\u81EA\u52D5\u9001\u4FE1" })] })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(Switch, { checked: settings.weekBeforeEnabled, onChange: (checked) => setSettings(prev => ({ ...prev, weekBeforeEnabled: checked })) }), _jsxs(Button, { size: "sm", variant: "outline", onClick: () => testReminder('week'), className: "flex items-center space-x-1", children: [_jsx(TestTube2, { className: "h-3 w-3" }), _jsx("span", { children: "\u30C6\u30B9\u30C8\u9001\u4FE1" })] })] })] }), _jsxs("div", { className: "flex items-center justify-between p-4 border border-gray-200 rounded-lg", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(Calendar, { className: "h-5 w-5 text-orange-600" }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-900", children: "3\u65E5\u524D\u30EA\u30DE\u30A4\u30F3\u30C9" }), _jsx("p", { className: "text-xs text-gray-500", children: "\u4E88\u7D04\u65E5\u306E3\u65E5\u524D\u306B\u81EA\u52D5\u9001\u4FE1" })] })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(Switch, { checked: settings.threeDaysBeforeEnabled, onChange: (checked) => setSettings(prev => ({ ...prev, threeDaysBeforeEnabled: checked })) }), _jsxs(Button, { size: "sm", variant: "outline", onClick: () => testReminder('3days'), className: "flex items-center space-x-1", children: [_jsx(TestTube2, { className: "h-3 w-3" }), _jsx("span", { children: "\u30C6\u30B9\u30C8\u9001\u4FE1" })] })] })] }), _jsxs("div", { className: "flex items-center justify-between p-4 border border-gray-200 rounded-lg", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(MessageCircle, { className: "h-5 w-5 text-indigo-600" }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-900", children: "\u30D5\u30A9\u30ED\u30FC\u30A2\u30C3\u30D7\u30E1\u30C3\u30BB\u30FC\u30B8" }), _jsx("p", { className: "text-xs text-gray-500", children: "\u9577\u671F\u672A\u6765\u5E97\u306E\u304A\u5BA2\u69D8\u3078\u306E\u6848\u5185" })] })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(Switch, { checked: settings.followUpEnabled, onChange: (checked) => setSettings(prev => ({ ...prev, followUpEnabled: checked })) }), _jsxs(Button, { size: "sm", variant: "outline", onClick: () => testReminder('followup'), className: "flex items-center space-x-1", children: [_jsx(TestTube2, { className: "h-3 w-3" }), _jsx("span", { children: "\u30C6\u30B9\u30C8\u9001\u4FE1" })] })] })] })] }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Mail, { className: "h-5 w-5 text-gray-600" }), _jsx("h3", { className: "text-lg font-semibold", children: "\u30E1\u30C3\u30BB\u30FC\u30B8\u30C6\u30F3\u30D7\u30EC\u30FC\u30C8" })] }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: "\u81EA\u52D5\u9001\u4FE1\u3055\u308C\u308B\u30E1\u30C3\u30BB\u30FC\u30B8\u306E\u5185\u5BB9\u3092\u7DE8\u96C6\u3067\u304D\u307E\u3059" })] }), _jsx(CardContent, { className: "space-y-4", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "1\u9031\u9593\u524D\u30E1\u30C3\u30BB\u30FC\u30B8" }), _jsx("textarea", { value: settings.emailTemplates?.weekBefore || '', onChange: (e) => setSettings(prev => ({
                                                ...prev,
                                                emailTemplates: { ...prev.emailTemplates, weekBefore: e.target.value }
                                            })), rows: 3, className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500", placeholder: "1\u9031\u9593\u524D\u306E\u30EA\u30DE\u30A4\u30F3\u30C9\u30E1\u30C3\u30BB\u30FC\u30B8" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "3\u65E5\u524D\u30E1\u30C3\u30BB\u30FC\u30B8" }), _jsx("textarea", { value: settings.emailTemplates?.threeDays || '', onChange: (e) => setSettings(prev => ({
                                                ...prev,
                                                emailTemplates: { ...prev.emailTemplates, threeDays: e.target.value }
                                            })), rows: 3, className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500", placeholder: "3\u65E5\u524D\u306E\u30EA\u30DE\u30A4\u30F3\u30C9\u30E1\u30C3\u30BB\u30FC\u30B8" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "\u30D5\u30A9\u30ED\u30FC\u30A2\u30C3\u30D7\u30E1\u30C3\u30BB\u30FC\u30B8" }), _jsx("textarea", { value: settings.emailTemplates?.followUp || '', onChange: (e) => setSettings(prev => ({
                                                ...prev,
                                                emailTemplates: { ...prev.emailTemplates, followUp: e.target.value }
                                            })), rows: 3, className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500", placeholder: "\u30D5\u30A9\u30ED\u30FC\u30A2\u30C3\u30D7\u30E1\u30C3\u30BB\u30FC\u30B8" })] }), _jsxs("div", { className: "text-xs text-gray-500 bg-gray-50 p-3 rounded-lg", children: [_jsx("p", { className: "font-medium mb-1", children: "\u5229\u7528\u53EF\u80FD\u306A\u5909\u6570:" }), _jsxs("ul", { className: "space-y-1", children: [_jsxs("li", { children: [_jsx("code", { children: '{customerName}' }), " - \u304A\u5BA2\u69D8\u306E\u304A\u540D\u524D"] }), _jsxs("li", { children: [_jsx("code", { children: '{reservationDate}' }), " - \u4E88\u7D04\u65E5"] }), _jsxs("li", { children: [_jsx("code", { children: '{reservationTime}' }), " - \u4E88\u7D04\u6642\u9593"] }), _jsxs("li", { children: [_jsx("code", { children: '{menuContent}' }), " - \u4E88\u7D04\u30E1\u30CB\u30E5\u30FC"] })] })] })] }) })] }), _jsx("div", { className: "flex justify-end pt-4", children: _jsxs(Button, { onClick: saveSettings, loading: saveLoading, className: "flex items-center space-x-2", children: [_jsx(Save, { className: "h-4 w-4" }), _jsx("span", { children: "\u8A2D\u5B9A\u3092\u4FDD\u5B58" })] }) })] }));
};
