import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Bell, BellOff, MessageCircle, Calendar, Clock, Mail, Smartphone, Save, Volume2, VolumeX, Settings } from 'lucide-react';
import { isFeatureEnabled, getEnvironmentConfig } from '../../utils/environment';
import ProductionWarningModal from '../Common/ProductionWarningModal';
const NotificationSettings = () => {
    const [settings, setSettings] = useState({
        newMessage: { enabled: true, email: true, push: true, sound: true, vibration: true },
        newReservation: { enabled: true, email: true, push: true, sound: true, vibration: false },
        reservationReminder: { enabled: true, email: true, push: true, sound: false, vibration: false },
        cancellation: { enabled: true, email: true, push: true, sound: true, vibration: true },
        dailySummary: { enabled: true, email: true, push: false, sound: false, vibration: false },
        weeklyReport: { enabled: true, email: true, push: false, sound: false, vibration: false },
        systemMaintenance: { enabled: true, email: true, push: true, sound: false, vibration: false }
    });
    const [generalSettings, setGeneralSettings] = useState({
        businessHours: { enabled: true, start: '09:00', end: '18:00' },
        quietHours: { enabled: true, start: '22:00', end: '07:00' },
        emailAddress: 'salon@example.com',
        pushEnabled: true
    });
    const [isSaving, setIsSaving] = useState(false);
    const [testNotification, setTestNotification] = useState(null);
    const [isWarningOpen, setIsWarningOpen] = useState(false);
    const [currentFeature, setCurrentFeature] = useState('');
    const config = getEnvironmentConfig();
    useEffect(() => {
        loadNotificationSettings();
    }, []);
    const loadNotificationSettings = async () => {
        try {
            // デモ用の初期設定
            console.log('通知設定を読み込みました');
        }
        catch (error) {
            console.error('Failed to load notification settings:', error);
        }
    };
    const saveSettings = async () => {
        setIsSaving(true);
        try {
            // デモ用の保存処理
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log('通知設定を保存:', { settings, generalSettings });
            alert('通知設定を保存しました');
        }
        catch (error) {
            console.error('Save error:', error);
            alert('保存に失敗しました');
        }
        finally {
            setIsSaving(false);
        }
    };
    const updateNotificationConfig = (key, config) => {
        setSettings(prev => ({
            ...prev,
            [key]: { ...prev[key], ...config }
        }));
    };
    const sendTestNotification = async (type) => {
        // プッシュ通知機能の環境制限チェック
        if (!isFeatureEnabled('enablePushNotifications')) {
            setCurrentFeature('push_notifications');
            setIsWarningOpen(true);
            return;
        }
        setTestNotification(type);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            alert(`${getNotificationLabel(type)}のテスト通知を送信しました`);
        }
        catch (error) {
            alert('テスト通知の送信に失敗しました');
        }
        finally {
            setTestNotification(null);
        }
    };
    const getNotificationLabel = (key) => {
        const labels = {
            newMessage: '新しいメッセージ',
            newReservation: '新規予約',
            reservationReminder: '予約リマインダー',
            cancellation: 'キャンセル通知',
            dailySummary: '日次サマリー',
            weeklyReport: '週次レポート',
            systemMaintenance: 'システムメンテナンス'
        };
        return labels[key] || key;
    };
    const getNotificationIcon = (key) => {
        const icons = {
            newMessage: _jsx(MessageCircle, { className: "w-5 h-5" }),
            newReservation: _jsx(Calendar, { className: "w-5 h-5" }),
            reservationReminder: _jsx(Clock, { className: "w-5 h-5" }),
            cancellation: _jsx(BellOff, { className: "w-5 h-5" }),
            dailySummary: _jsx(Mail, { className: "w-5 h-5" }),
            weeklyReport: _jsx(Mail, { className: "w-5 h-5" }),
            systemMaintenance: _jsx(Settings, { className: "w-5 h-5" })
        };
        return icons[key] || _jsx(Bell, { className: "w-5 h-5" });
    };
    const getNotificationDescription = (key) => {
        const descriptions = {
            newMessage: 'LINEやInstagramから新しいメッセージが届いた時',
            newReservation: '新しい予約が入った時',
            reservationReminder: '予約の1時間前と24時間前',
            cancellation: '予約がキャンセルされた時',
            dailySummary: '毎日の営業終了後に当日の集計',
            weeklyReport: '毎週月曜日に前週の分析レポート',
            systemMaintenance: 'システムの更新やメンテナンス情報'
        };
        return descriptions[key] || '';
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium text-gray-900", children: "\u901A\u77E5\u8A2D\u5B9A" }), _jsx("p", { className: "text-sm text-gray-600", children: "\u65B0\u3057\u3044\u30E1\u30C3\u30BB\u30FC\u30B8\u3084\u4E88\u7D04\u306E\u901A\u77E5\u3092\u7BA1\u7406\u3057\u307E\u3059" })] }), _jsxs("button", { onClick: saveSettings, disabled: isSaving, className: "flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors", children: [isSaving ? (_jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white" })) : (_jsx(Save, { className: "w-4 h-4" })), _jsx("span", { children: "\u8A2D\u5B9A\u3092\u4FDD\u5B58" })] })] }), _jsxs("div", { className: "bg-white p-6 rounded-lg border border-gray-200", children: [_jsx("h4", { className: "text-md font-medium text-gray-900 mb-4", children: "\u5168\u822C\u8A2D\u5B9A" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "\u901A\u77E5\u7528\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9" }), _jsx("input", { type: "email", value: generalSettings.emailAddress, onChange: (e) => setGeneralSettings(prev => ({ ...prev, emailAddress: e.target.value })), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "salon@example.com" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsxs("label", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", checked: generalSettings.businessHours.enabled, onChange: (e) => setGeneralSettings(prev => ({
                                                            ...prev,
                                                            businessHours: { ...prev.businessHours, enabled: e.target.checked }
                                                        })), className: "rounded" }), _jsx("span", { className: "text-sm font-medium text-gray-700", children: "\u55B6\u696D\u6642\u9593\u5185\u306E\u307F\u901A\u77E5" })] }), generalSettings.businessHours.enabled && (_jsxs("div", { className: "mt-2 flex items-center space-x-2", children: [_jsx("input", { type: "time", value: generalSettings.businessHours.start, onChange: (e) => setGeneralSettings(prev => ({
                                                            ...prev,
                                                            businessHours: { ...prev.businessHours, start: e.target.value }
                                                        })), className: "px-2 py-1 border border-gray-300 rounded text-sm" }), _jsx("span", { className: "text-sm text-gray-500", children: "\u301C" }), _jsx("input", { type: "time", value: generalSettings.businessHours.end, onChange: (e) => setGeneralSettings(prev => ({
                                                            ...prev,
                                                            businessHours: { ...prev.businessHours, end: e.target.value }
                                                        })), className: "px-2 py-1 border border-gray-300 rounded text-sm" })] }))] }), _jsxs("div", { children: [_jsxs("label", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", checked: generalSettings.quietHours.enabled, onChange: (e) => setGeneralSettings(prev => ({
                                                            ...prev,
                                                            quietHours: { ...prev.quietHours, enabled: e.target.checked }
                                                        })), className: "rounded" }), _jsx("span", { className: "text-sm font-medium text-gray-700", children: "\u304A\u3084\u3059\u307F\u6642\u9593\u8A2D\u5B9A" })] }), generalSettings.quietHours.enabled && (_jsxs("div", { className: "mt-2 flex items-center space-x-2", children: [_jsx("input", { type: "time", value: generalSettings.quietHours.start, onChange: (e) => setGeneralSettings(prev => ({
                                                            ...prev,
                                                            quietHours: { ...prev.quietHours, start: e.target.value }
                                                        })), className: "px-2 py-1 border border-gray-300 rounded text-sm" }), _jsx("span", { className: "text-sm text-gray-500", children: "\u301C" }), _jsx("input", { type: "time", value: generalSettings.quietHours.end, onChange: (e) => setGeneralSettings(prev => ({
                                                            ...prev,
                                                            quietHours: { ...prev.quietHours, end: e.target.value }
                                                        })), className: "px-2 py-1 border border-gray-300 rounded text-sm" })] }))] })] })] })] }), _jsxs("div", { className: "bg-white p-6 rounded-lg border border-gray-200", children: [_jsx("h4", { className: "text-md font-medium text-gray-900 mb-4", children: "\u901A\u77E5\u7A2E\u5225\u8A2D\u5B9A" }), _jsx("div", { className: "space-y-4", children: Object.entries(settings).map(([key, config]) => (_jsxs("div", { className: "border border-gray-200 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "text-blue-600", children: getNotificationIcon(key) }), _jsxs("div", { children: [_jsx("h5", { className: "text-sm font-medium text-gray-900", children: getNotificationLabel(key) }), _jsx("p", { className: "text-xs text-gray-500", children: getNotificationDescription(key) })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("button", { onClick: () => sendTestNotification(key), disabled: testNotification === key || !config.enabled, className: "text-xs bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 px-2 py-1 rounded transition-colors", children: testNotification === key ? 'テスト中...' : 'テスト' }), _jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: config.enabled, onChange: (e) => updateNotificationConfig(key, { enabled: e.target.checked }), className: "rounded" }), _jsx("span", { className: "ml-2 text-sm text-gray-700", children: "\u6709\u52B9" })] })] })] }), config.enabled && (_jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3 ml-8", children: [_jsxs("label", { className: "flex items-center text-sm", children: [_jsx("input", { type: "checkbox", checked: config.email, onChange: (e) => updateNotificationConfig(key, { email: e.target.checked }), className: "rounded mr-2" }), _jsx(Mail, { className: "w-4 h-4 mr-1" }), "\u30E1\u30FC\u30EB"] }), _jsxs("label", { className: "flex items-center text-sm", children: [_jsx("input", { type: "checkbox", checked: config.push, onChange: (e) => updateNotificationConfig(key, { push: e.target.checked }), className: "rounded mr-2" }), _jsx(Smartphone, { className: "w-4 h-4 mr-1" }), "\u30D7\u30C3\u30B7\u30E5"] }), _jsxs("label", { className: "flex items-center text-sm", children: [_jsx("input", { type: "checkbox", checked: config.sound, onChange: (e) => updateNotificationConfig(key, { sound: e.target.checked }), className: "rounded mr-2" }), config.sound ? _jsx(Volume2, { className: "w-4 h-4 mr-1" }) : _jsx(VolumeX, { className: "w-4 h-4 mr-1" }), "\u97F3"] }), config.vibration !== undefined && (_jsxs("label", { className: "flex items-center text-sm", children: [_jsx("input", { type: "checkbox", checked: config.vibration, onChange: (e) => updateNotificationConfig(key, { vibration: e.target.checked }), className: "rounded mr-2" }), _jsx(Smartphone, { className: "w-4 h-4 mr-1" }), "\u30D0\u30A4\u30D6"] }))] }))] }, key))) })] }), _jsx("div", { className: "bg-blue-50 p-4 rounded-lg border border-blue-200", children: _jsxs("div", { className: "flex items-start space-x-2", children: [_jsx(Bell, { className: "w-5 h-5 text-blue-600 mt-0.5" }), _jsxs("div", { children: [_jsx("h5", { className: "text-sm font-medium text-blue-900 mb-1", children: "\u901A\u77E5\u306B\u3064\u3044\u3066" }), _jsxs("ul", { className: "text-xs text-blue-800 space-y-1", children: [_jsx("li", { children: "\u2022 \u30D7\u30C3\u30B7\u30E5\u901A\u77E5\u306B\u306F\u30D6\u30E9\u30A6\u30B6\u306E\u8A31\u53EF\u304C\u5FC5\u8981\u3067\u3059" }), _jsx("li", { children: "\u2022 \u55B6\u696D\u6642\u9593\u5916\u3084\u304A\u3084\u3059\u307F\u6642\u9593\u306F\u91CD\u8981\u306A\u901A\u77E5\u306E\u307F\u9001\u4FE1\u3055\u308C\u307E\u3059" }), _jsx("li", { children: "\u2022 \u30C6\u30B9\u30C8\u30DC\u30BF\u30F3\u3067\u5B9F\u969B\u306E\u901A\u77E5\u3092\u78BA\u8A8D\u3067\u304D\u307E\u3059" }), _jsx("li", { children: "\u2022 \u30E1\u30FC\u30EB\u901A\u77E5\u306F\u8A2D\u5B9A\u3057\u305F\u30A2\u30C9\u30EC\u30B9\u306B\u9001\u4FE1\u3055\u308C\u307E\u3059" })] })] })] }) }), _jsx(ProductionWarningModal, { isOpen: isWarningOpen, onClose: () => setIsWarningOpen(false), feature: currentFeature, type: "warning", showDetails: true })] }));
};
export default NotificationSettings;
