import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Database, Download, Upload, Clock, Save, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
const DataBackupSettings = () => {
    const [backupConfig, setBackupConfig] = useState({
        enabled: true,
        frequency: 'daily',
        time: '03:00',
        retentionDays: 30,
        includeTables: ['customers', 'reservations', 'services', 'messages', 'staff'],
        compressionEnabled: true
    });
    const [backupHistory, setBackupHistory] = useState([
        {
            id: 'backup_001',
            createdAt: '2024-06-14T03:00:00',
            size: '2.4 MB',
            status: 'success',
            type: 'auto',
            location: 'cloud://backup/salon_2024-06-14.sql.gz'
        },
        {
            id: 'backup_002',
            createdAt: '2024-06-13T03:00:00',
            size: '2.3 MB',
            status: 'success',
            type: 'auto',
            location: 'cloud://backup/salon_2024-06-13.sql.gz'
        },
        {
            id: 'backup_003',
            createdAt: '2024-06-12T03:00:00',
            size: '2.3 MB',
            status: 'success',
            type: 'auto',
            location: 'cloud://backup/salon_2024-06-12.sql.gz'
        },
        {
            id: 'backup_004',
            createdAt: '2024-06-11T15:30:00',
            size: '2.3 MB',
            status: 'success',
            type: 'manual',
            location: 'local://backup/manual_backup_2024-06-11.sql.gz'
        },
        {
            id: 'backup_005',
            createdAt: '2024-06-11T03:00:00',
            size: '2.2 MB',
            status: 'success',
            type: 'auto',
            location: 'cloud://backup/salon_2024-06-11.sql.gz'
        }
    ]);
    const [isSaving, setIsSaving] = useState(false);
    const [isBackingUp, setIsBackingUp] = useState(false);
    const [lastBackupCheck, setLastBackupCheck] = useState(null);
    const availableTables = [
        { id: 'customers', name: '顧客データ', description: '顧客情報、連絡先、履歴' },
        { id: 'reservations', name: '予約データ', description: '予約情報、スケジュール' },
        { id: 'services', name: '施術履歴', description: '過去の施術記録、料金' },
        { id: 'messages', name: 'メッセージ', description: 'LINE/Instagram連携メッセージ' },
        { id: 'staff', name: 'スタッフ情報', description: 'スタッフデータ、権限設定' },
        { id: 'settings', name: '設定データ', description: 'システム設定、API設定' }
    ];
    useEffect(() => {
        loadBackupSettings();
    }, []);
    const loadBackupSettings = async () => {
        try {
            console.log('バックアップ設定を読み込みました');
            setLastBackupCheck(new Date().toISOString());
        }
        catch (error) {
            console.error('Failed to load backup settings:', error);
        }
    };
    const saveSettings = async () => {
        setIsSaving(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log('バックアップ設定を保存:', backupConfig);
            alert('バックアップ設定を保存しました');
        }
        catch (error) {
            console.error('Save error:', error);
            alert('保存に失敗しました');
        }
        finally {
            setIsSaving(false);
        }
    };
    const performManualBackup = async () => {
        setIsBackingUp(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 3000));
            const newBackup = {
                id: `backup_${Date.now()}`,
                createdAt: new Date().toISOString(),
                size: '2.4 MB',
                status: 'success',
                type: 'manual',
                location: `local://backup/manual_backup_${new Date().toISOString().split('T')[0]}.sql.gz`
            };
            setBackupHistory(prev => [newBackup, ...prev]);
            alert('手動バックアップが完了しました');
        }
        catch (error) {
            console.error('Backup error:', error);
            alert('バックアップに失敗しました');
        }
        finally {
            setIsBackingUp(false);
        }
    };
    const downloadBackup = async (backup) => {
        try {
            alert(`バックアップファイル ${backup.id} のダウンロードを開始します`);
        }
        catch (error) {
            alert('ダウンロードに失敗しました');
        }
    };
    const restoreFromBackup = async (backup) => {
        if (!confirm(`${backup.createdAt}のバックアップからデータを復元しますか？\n現在のデータは上書きされます。`)) {
            return;
        }
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            alert('データ復元が完了しました');
        }
        catch (error) {
            alert('復元に失敗しました');
        }
    };
    const updateTableSelection = (tableId, checked) => {
        setBackupConfig(prev => ({
            ...prev,
            includeTables: checked
                ? [...prev.includeTables, tableId]
                : prev.includeTables.filter(id => id !== tableId)
        }));
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'success': return 'text-green-600 bg-green-50';
            case 'failed': return 'text-red-600 bg-red-50';
            case 'running': return 'text-blue-600 bg-blue-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };
    const getStatusIcon = (status) => {
        switch (status) {
            case 'success': return _jsx(CheckCircle, { className: "w-4 h-4" });
            case 'failed': return _jsx(AlertCircle, { className: "w-4 h-4" });
            case 'running': return _jsx(RefreshCw, { className: "w-4 h-4 animate-spin" });
            default: return _jsx(Clock, { className: "w-4 h-4" });
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium text-gray-900", children: "\u30C7\u30FC\u30BF\u30D0\u30C3\u30AF\u30A2\u30C3\u30D7" }), _jsx("p", { className: "text-sm text-gray-600", children: "\u5B9A\u671F\u7684\u306A\u30C7\u30FC\u30BF\u30D0\u30C3\u30AF\u30A2\u30C3\u30D7\u3092\u8A2D\u5B9A\u3057\u307E\u3059" })] }), _jsxs("button", { onClick: saveSettings, disabled: isSaving, className: "flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors", children: [isSaving ? (_jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white" })) : (_jsx(Save, { className: "w-4 h-4" })), _jsx("span", { children: "\u8A2D\u5B9A\u3092\u4FDD\u5B58" })] })] }), _jsxs("div", { className: "bg-white p-6 rounded-lg border border-gray-200", children: [_jsx("h4", { className: "text-md font-medium text-gray-900 mb-4", children: "\u81EA\u52D5\u30D0\u30C3\u30AF\u30A2\u30C3\u30D7\u8A2D\u5B9A" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("input", { type: "checkbox", id: "backup-enabled", checked: backupConfig.enabled, onChange: (e) => setBackupConfig(prev => ({ ...prev, enabled: e.target.checked })), className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500" }), _jsx("label", { htmlFor: "backup-enabled", className: "text-sm font-medium text-gray-700", children: "\u81EA\u52D5\u30D0\u30C3\u30AF\u30A2\u30C3\u30D7\u3092\u6709\u52B9\u306B\u3059\u308B" })] }), backupConfig.enabled && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 pl-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "\u30D0\u30C3\u30AF\u30A2\u30C3\u30D7\u983B\u5EA6" }), _jsxs("select", { value: backupConfig.frequency, onChange: (e) => setBackupConfig(prev => ({
                                                    ...prev,
                                                    frequency: e.target.value
                                                })), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: "daily", children: "\u6BCE\u65E5" }), _jsx("option", { value: "weekly", children: "\u6BCE\u9031" }), _jsx("option", { value: "monthly", children: "\u6BCE\u6708" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "\u5B9F\u884C\u6642\u523B" }), _jsx("input", { type: "time", value: backupConfig.time, onChange: (e) => setBackupConfig(prev => ({ ...prev, time: e.target.value })), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "\u4FDD\u5B58\u671F\u9593\uFF08\u65E5\uFF09" }), _jsx("input", { type: "number", min: "7", max: "365", value: backupConfig.retentionDays, onChange: (e) => setBackupConfig(prev => ({
                                                    ...prev,
                                                    retentionDays: parseInt(e.target.value)
                                                })), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" })] })] }))] })] }), _jsxs("div", { className: "bg-white p-6 rounded-lg border border-gray-200", children: [_jsx("h4", { className: "text-md font-medium text-gray-900 mb-4", children: "\u30D0\u30C3\u30AF\u30A2\u30C3\u30D7\u5BFE\u8C61\u30C7\u30FC\u30BF" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: availableTables.map((table) => (_jsxs("label", { className: "flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: backupConfig.includeTables.includes(table.id), onChange: (e) => updateTableSelection(table.id, e.target.checked), className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1" }), _jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium text-gray-900", children: table.name }), _jsx("div", { className: "text-xs text-gray-500", children: table.description })] })] }, table.id))) }), _jsx("div", { className: "mt-4 pt-4 border-t border-gray-200", children: _jsxs("label", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", checked: backupConfig.compressionEnabled, onChange: (e) => setBackupConfig(prev => ({ ...prev, compressionEnabled: e.target.checked })), className: "rounded border-gray-300 text-blue-600 focus:ring-blue-500" }), _jsx("span", { className: "text-sm text-gray-700", children: "\u30C7\u30FC\u30BF\u5727\u7E2E\u3092\u6709\u52B9\u306B\u3059\u308B\uFF08\u63A8\u5968\uFF09" })] }) })] }), _jsxs("div", { className: "bg-white p-6 rounded-lg border border-gray-200", children: [_jsx("h4", { className: "text-md font-medium text-gray-900 mb-4", children: "\u624B\u52D5\u30D0\u30C3\u30AF\u30A2\u30C3\u30D7" }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "\u5373\u5EA7\u306B\u30C7\u30FC\u30BF\u30D9\u30FC\u30B9\u5168\u4F53\u306E\u30D0\u30C3\u30AF\u30A2\u30C3\u30D7\u3092\u4F5C\u6210\u3057\u307E\u3059" }), lastBackupCheck && (_jsxs("p", { className: "text-xs text-gray-500 mt-1", children: ["\u6700\u7D42\u78BA\u8A8D: ", new Date(lastBackupCheck).toLocaleString('ja-JP')] }))] }), _jsxs("button", { onClick: performManualBackup, disabled: isBackingUp, className: "flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors", children: [isBackingUp ? (_jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white" })) : (_jsx(Database, { className: "w-4 h-4" })), _jsx("span", { children: isBackingUp ? 'バックアップ中...' : '今すぐバックアップ' })] })] })] }), _jsxs("div", { className: "bg-white p-6 rounded-lg border border-gray-200", children: [_jsx("h4", { className: "text-md font-medium text-gray-900 mb-4", children: "\u30D0\u30C3\u30AF\u30A2\u30C3\u30D7\u5C65\u6B74" }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "\u4F5C\u6210\u65E5\u6642" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "\u30B5\u30A4\u30BA" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "\u7A2E\u5225" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "\u30B9\u30C6\u30FC\u30BF\u30B9" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "\u64CD\u4F5C" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: backupHistory.map((backup) => (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900", children: new Date(backup.createdAt).toLocaleString('ja-JP') }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: backup.size }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("span", { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${backup.type === 'auto' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`, children: backup.type === 'auto' ? '自動' : '手動' }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsxs("div", { className: `inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(backup.status)}`, children: [getStatusIcon(backup.status), _jsx("span", { children: backup.status === 'success' ? '成功' : backup.status === 'failed' ? '失敗' : '実行中' })] }) }), _jsxs("td", { className: "px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2", children: [_jsx("button", { onClick: () => downloadBackup(backup), disabled: backup.status !== 'success', className: "text-blue-600 hover:text-blue-900 disabled:text-gray-400 disabled:cursor-not-allowed", children: _jsx(Download, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => restoreFromBackup(backup), disabled: backup.status !== 'success', className: "text-green-600 hover:text-green-900 disabled:text-gray-400 disabled:cursor-not-allowed", children: _jsx(Upload, { className: "w-4 h-4" }) })] })] }, backup.id))) })] }) })] }), _jsx("div", { className: "bg-yellow-50 p-4 rounded-lg border border-yellow-200", children: _jsxs("div", { className: "flex items-start space-x-2", children: [_jsx(AlertCircle, { className: "w-5 h-5 text-yellow-600 mt-0.5" }), _jsxs("div", { children: [_jsx("h5", { className: "text-sm font-medium text-yellow-900 mb-1", children: "\u91CD\u8981\u306A\u6CE8\u610F\u4E8B\u9805" }), _jsxs("ul", { className: "text-xs text-yellow-800 space-y-1", children: [_jsx("li", { children: "\u2022 \u30D0\u30C3\u30AF\u30A2\u30C3\u30D7\u30D5\u30A1\u30A4\u30EB\u306F\u6A5F\u5BC6\u60C5\u5831\u3092\u542B\u3080\u305F\u3081\u3001\u9069\u5207\u306B\u7BA1\u7406\u3057\u3066\u304F\u3060\u3055\u3044" }), _jsx("li", { children: "\u2022 \u5FA9\u5143\u64CD\u4F5C\u306F\u73FE\u5728\u306E\u30C7\u30FC\u30BF\u3092\u5B8C\u5168\u306B\u4E0A\u66F8\u304D\u3057\u307E\u3059" }), _jsx("li", { children: "\u2022 \u5B9A\u671F\u30D0\u30C3\u30AF\u30A2\u30C3\u30D7\u306F\u8A2D\u5B9A\u3057\u305F\u6642\u523B\u306B\u81EA\u52D5\u5B9F\u884C\u3055\u308C\u307E\u3059" }), _jsx("li", { children: "\u2022 \u4FDD\u5B58\u671F\u9593\u3092\u904E\u304E\u305F\u30D0\u30C3\u30AF\u30A2\u30C3\u30D7\u306F\u81EA\u52D5\u524A\u9664\u3055\u308C\u307E\u3059" }), _jsx("li", { children: "\u2022 \u5927\u5BB9\u91CF\u30C7\u30FC\u30BF\u306E\u5834\u5408\u3001\u30D0\u30C3\u30AF\u30A2\u30C3\u30D7\u306B\u6642\u9593\u304C\u304B\u304B\u308B\u5834\u5408\u304C\u3042\u308A\u307E\u3059" })] })] })] }) })] }));
};
export default DataBackupSettings;
