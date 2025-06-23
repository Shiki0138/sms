import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Users, UserPlus, Trash2, Download, CheckCircle, AlertCircle, RefreshCw, Crown, Building, Mail, Lock, Copy, Eye, EyeOff } from 'lucide-react';
const ManagerAccountCreator = () => {
    const [managers, setManagers] = useState([]);
    const [managerList, setManagerList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showPasswords, setShowPasswords] = useState(false);
    const [showCleanupConfirm, setShowCleanupConfirm] = useState(false);
    const [cleanupPassword, setCleanupPassword] = useState('');
    // 20人の経営者管理者作成
    const create20Managers = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/v1/test/prepare-managers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const result = await response.json();
            if (result.success) {
                setManagers(result.data.managers);
                alert(`20人の経営者管理者アカウントを作成しました！\n\n作成数: ${result.data.totalCount}件\n\n※ パスワードは初回表示のみです。必要に応じて保存してください。`);
                await loadManagerList();
            }
            else {
                alert(`エラー: ${result.message}`);
            }
        }
        catch (error) {
            console.error('管理者作成エラー:', error);
            alert('管理者アカウントの作成に失敗しました');
        }
        setLoading(false);
    };
    // 管理者一覧取得
    const loadManagerList = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/v1/test/managers');
            const result = await response.json();
            if (result.success) {
                setManagerList(result.data.managers);
            }
        }
        catch (error) {
            console.error('管理者一覧取得エラー:', error);
        }
        setLoading(false);
    };
    // 全デモアカウント削除
    const cleanupAllDemoAccounts = async () => {
        if (cleanupPassword !== 'DELETE_ALL_DEMO_ACCOUNTS_CONFIRM') {
            alert('削除確認パスワードが正しくありません');
            return;
        }
        setLoading(true);
        try {
            const response = await fetch('/api/v1/test/cleanup-demo', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    confirmPassword: cleanupPassword
                })
            });
            const result = await response.json();
            if (result.success) {
                alert(`デモアカウントを完全に削除しました\n\n削除件数: ${result.deletedCount}件`);
                setManagers([]);
                setManagerList([]);
                setShowCleanupConfirm(false);
                setCleanupPassword('');
            }
            else {
                alert(`エラー: ${result.message}`);
            }
        }
        catch (error) {
            console.error('デモアカウント削除エラー:', error);
            alert('デモアカウントの削除に失敗しました');
        }
        setLoading(false);
    };
    // クリップボードにコピー
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            alert('クリップボードにコピーしました');
        });
    };
    // CSV出力
    const exportToCSV = () => {
        if (managers.length === 0) {
            alert('エクスポートするデータがありません');
            return;
        }
        const csvContent = [
            ['テナント名', 'メールアドレス', 'パスワード', 'ログインURL'],
            ...managers.map(m => [m.tenantName, m.email, m.password || '', m.loginUrl])
        ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `管理者アカウント_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };
    useEffect(() => {
        loadManagerList();
    }, []);
    return (_jsxs("div", { className: "max-w-6xl mx-auto p-6 space-y-6", children: [_jsxs("div", { className: "bg-purple-50 border border-purple-200 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Crown, { className: "w-5 h-5 text-purple-600" }), _jsx("h1", { className: "text-xl font-bold text-purple-800", children: "20\u4EBA\u7D4C\u55B6\u8005\u7BA1\u7406\u8005\u30A2\u30AB\u30A6\u30F3\u30C8\u6E96\u5099" })] }), _jsx("p", { className: "text-purple-700 mt-2", children: "\u30C7\u30E2\u30FB\u30C6\u30B9\u30C8\u7528\u306B20\u4EBA\u5206\u306E\u7D4C\u55B6\u8005\u7BA1\u7406\u8005\u30A2\u30AB\u30A6\u30F3\u30C8\u3092\u4E00\u62EC\u4F5C\u6210\u30FB\u7BA1\u7406\u3057\u307E\u3059\u3002" })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(UserPlus, { className: "w-6 h-6 text-green-600" }), _jsx("h2", { className: "text-lg font-semibold", children: "\u7BA1\u7406\u8005\u30A2\u30AB\u30A6\u30F3\u30C8\u4E00\u62EC\u4F5C\u6210" })] }), _jsxs("div", { className: "flex space-x-2", children: [_jsxs("button", { onClick: create20Managers, disabled: loading, className: "bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2", children: [_jsx(UserPlus, { className: "w-4 h-4" }), _jsx("span", { children: "20\u4EBA\u4F5C\u6210" })] }), _jsxs("button", { onClick: loadManagerList, disabled: loading, className: "bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 disabled:opacity-50 flex items-center space-x-2", children: [_jsx(RefreshCw, { className: "w-4 h-4" }), _jsx("span", { children: "\u66F4\u65B0" })] })] })] }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-4", children: [_jsx("h3", { className: "font-medium text-gray-900 mb-2", children: "\u4F5C\u6210\u3055\u308C\u308B\u5185\u5BB9" }), _jsxs("ul", { className: "text-sm text-gray-600 space-y-1", children: [_jsx("li", { children: "\u2022 20\u500B\u306E\u7F8E\u5BB9\u5BA4\u30C6\u30CA\u30F3\u30C8\uFF08\u7530\u4E2D\u30B5\u30ED\u30F3\u3001\u4F50\u85E4\u7F8E\u5BB9\u5BA4\u3001\u306A\u3069\uFF09" }), _jsx("li", { children: "\u2022 \u5404\u30C6\u30CA\u30F3\u30C8\u306B\u7BA1\u7406\u8005\u30A2\u30AB\u30A6\u30F3\u30C81\u3064\u305A\u3064" }), _jsx("li", { children: "\u2022 \u30ED\u30B0\u30A4\u30F3\u7528\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9: manager1@test-salon.com \uFF5E manager20@test-salon.com" }), _jsx("li", { children: "\u2022 \u5F37\u529B\u306A\u30D1\u30B9\u30EF\u30FC\u30C9\u81EA\u52D5\u751F\u6210" }), _jsx("li", { children: "\u2022 \u30D7\u30EC\u30DF\u30A2\u30E0\u30D7\u30E9\u30F3\u8A2D\u5B9A\u6E08\u307F" })] })] })] }), managers.length > 0 && (_jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(CheckCircle, { className: "w-6 h-6 text-green-600" }), _jsxs("h2", { className: "text-lg font-semibold", children: ["\u4F5C\u6210\u5B8C\u4E86\u30A2\u30AB\u30A6\u30F3\u30C8 (", managers.length, "\u4EF6)"] })] }), _jsxs("div", { className: "flex space-x-2", children: [_jsxs("button", { onClick: () => setShowPasswords(!showPasswords), className: "bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 flex items-center space-x-1", children: [showPasswords ? _jsx(EyeOff, { className: "w-4 h-4" }) : _jsx(Eye, { className: "w-4 h-4" }), _jsx("span", { children: showPasswords ? 'パスワード非表示' : 'パスワード表示' })] }), _jsxs("button", { onClick: exportToCSV, className: "bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 flex items-center space-x-1", children: [_jsx(Download, { className: "w-4 h-4" }), _jsx("span", { children: "CSV\u51FA\u529B" })] })] })] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-3 text-left font-medium text-gray-900", children: "\u30C6\u30CA\u30F3\u30C8\u540D" }), _jsx("th", { className: "px-4 py-3 text-left font-medium text-gray-900", children: "\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9" }), _jsx("th", { className: "px-4 py-3 text-left font-medium text-gray-900", children: "\u30D1\u30B9\u30EF\u30FC\u30C9" }), _jsx("th", { className: "px-4 py-3 text-left font-medium text-gray-900", children: "\u30A2\u30AF\u30B7\u30E7\u30F3" })] }) }), _jsx("tbody", { className: "divide-y divide-gray-200", children: managers.map((manager, index) => (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsx("td", { className: "px-4 py-3", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Building, { className: "w-4 h-4 text-gray-400" }), _jsx("span", { className: "font-medium", children: manager.tenantName })] }) }), _jsx("td", { className: "px-4 py-3", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Mail, { className: "w-4 h-4 text-gray-400" }), _jsx("span", { className: "font-mono text-sm", children: manager.email }), _jsx("button", { onClick: () => copyToClipboard(manager.email), className: "text-blue-600 hover:text-blue-700", children: _jsx(Copy, { className: "w-3 h-3" }) })] }) }), _jsx("td", { className: "px-4 py-3", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Lock, { className: "w-4 h-4 text-gray-400" }), _jsx("span", { className: "font-mono text-sm", children: showPasswords ? manager.password : '••••••••••' }), showPasswords && manager.password && (_jsx("button", { onClick: () => copyToClipboard(manager.password), className: "text-blue-600 hover:text-blue-700", children: _jsx(Copy, { className: "w-3 h-3" }) }))] }) }), _jsx("td", { className: "px-4 py-3", children: _jsxs("button", { onClick: () => window.open(manager.loginUrl, '_blank'), className: "text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1", children: [_jsx("span", { children: "\u30ED\u30B0\u30A4\u30F3" }), _jsx(Crown, { className: "w-3 h-3" })] }) })] }, index))) })] }) })] })), managerList.length > 0 && (_jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-4", children: [_jsx(Users, { className: "w-6 h-6 text-blue-600" }), _jsxs("h2", { className: "text-lg font-semibold", children: ["\u65E2\u5B58\u7BA1\u7406\u8005\u4E00\u89A7 (", managerList.length, "\u4EF6)"] })] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-3 text-left font-medium text-gray-900", children: "\u30C6\u30CA\u30F3\u30C8" }), _jsx("th", { className: "px-4 py-3 text-left font-medium text-gray-900", children: "\u7BA1\u7406\u8005" }), _jsx("th", { className: "px-4 py-3 text-left font-medium text-gray-900", children: "\u6700\u7D42\u30ED\u30B0\u30A4\u30F3" }), _jsx("th", { className: "px-4 py-3 text-left font-medium text-gray-900", children: "\u4F5C\u6210\u65E5" })] }) }), _jsx("tbody", { className: "divide-y divide-gray-200", children: managerList.map((manager) => (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsx("td", { className: "px-4 py-3", children: _jsxs("div", { children: [_jsx("div", { className: "font-medium", children: manager.tenant.name }), _jsx("div", { className: "text-xs text-gray-500", children: manager.tenant.address })] }) }), _jsx("td", { className: "px-4 py-3", children: _jsxs("div", { children: [_jsx("div", { className: "font-medium", children: manager.name }), _jsx("div", { className: "text-xs text-gray-500", children: manager.email })] }) }), _jsx("td", { className: "px-4 py-3", children: _jsx("span", { className: "text-sm text-gray-600", children: manager.lastLoginAt
                                                        ? new Date(manager.lastLoginAt).toLocaleString()
                                                        : '未ログイン' }) }), _jsx("td", { className: "px-4 py-3", children: _jsx("span", { className: "text-sm text-gray-600", children: new Date(manager.createdAt).toLocaleDateString() }) })] }, manager.id))) })] }) })] })), managerList.length > 0 && (_jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-4", children: [_jsx(Trash2, { className: "w-6 h-6 text-red-600" }), _jsx("h2", { className: "text-lg font-semibold", children: "\u5168\u30C7\u30E2\u30A2\u30AB\u30A6\u30F3\u30C8\u524A\u9664" })] }), !showCleanupConfirm ? (_jsxs("button", { onClick: () => setShowCleanupConfirm(true), className: "bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center space-x-2", children: [_jsx(Trash2, { className: "w-4 h-4" }), _jsx("span", { children: "\u524A\u9664\u30E2\u30FC\u30C9\u958B\u59CB" })] })) : (_jsx("div", { className: "space-y-4", children: _jsxs("div", { className: "bg-red-50 border border-red-200 rounded p-4", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-2", children: [_jsx(AlertCircle, { className: "w-5 h-5 text-red-600" }), _jsx("span", { className: "font-semibold text-red-800", children: "\u5371\u967A: \u5168\u30C7\u30E2\u30A2\u30AB\u30A6\u30F3\u30C8\u524A\u9664" })] }), _jsx("p", { className: "text-red-700 mb-4", children: "\u3053\u306E\u64CD\u4F5C\u306B\u3088\u308A\u3001\u5168\u3066\u306E\u30C7\u30E2\u30C6\u30CA\u30F3\u30C8\u3001\u7BA1\u7406\u8005\u30A2\u30AB\u30A6\u30F3\u30C8\u3001\u95A2\u9023\u30C7\u30FC\u30BF\u304C\u5B8C\u5168\u306B\u524A\u9664\u3055\u308C\u307E\u3059\u3002" }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block text-sm font-medium text-red-700 mb-1", children: "\u524A\u9664\u78BA\u8A8D\u30D1\u30B9\u30EF\u30FC\u30C9: DELETE_ALL_DEMO_ACCOUNTS_CONFIRM" }), _jsx("input", { type: "text", value: cleanupPassword, onChange: (e) => setCleanupPassword(e.target.value), className: "w-full px-3 py-2 border border-red-300 rounded-md", placeholder: "\u4E0A\u8A18\u306E\u30D1\u30B9\u30EF\u30FC\u30C9\u3092\u6B63\u78BA\u306B\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044" })] }), _jsxs("div", { className: "flex space-x-2", children: [_jsxs("button", { onClick: cleanupAllDemoAccounts, disabled: loading || cleanupPassword !== 'DELETE_ALL_DEMO_ACCOUNTS_CONFIRM', className: "bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2", children: [_jsx(Trash2, { className: "w-4 h-4" }), _jsx("span", { children: "\u5B8C\u5168\u524A\u9664\u5B9F\u884C" })] }), _jsx("button", { onClick: () => {
                                                setShowCleanupConfirm(false);
                                                setCleanupPassword('');
                                            }, className: "bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700", children: "\u30AD\u30E3\u30F3\u30BB\u30EB" })] })] }) }))] })), loading && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white rounded-lg p-6 flex items-center space-x-3", children: [_jsx(RefreshCw, { className: "w-6 h-6 animate-spin text-blue-600" }), _jsx("span", { children: "\u51E6\u7406\u4E2D..." })] }) }))] }));
};
export default ManagerAccountCreator;
