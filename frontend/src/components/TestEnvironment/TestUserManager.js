import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Users, UserPlus, Trash2, Shield, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
const TestUserManager = () => {
    const [testData, setTestData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [adminCredentials, setAdminCredentials] = useState({
        email: 'admin@test.salon.com',
        password: 'TestAdmin2025!',
        tenantName: 'テスト美容室システム'
    });
    const [testTenantId, setTestTenantId] = useState('');
    const [cleanupPassword, setCleanupPassword] = useState('');
    const [showCleanupConfirm, setShowCleanupConfirm] = useState(false);
    // テスト管理者作成
    const createTestAdmin = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/test/admin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(adminCredentials)
            });
            const result = await response.json();
            if (result.success) {
                setTestTenantId(result.data.tenantId);
                alert(`テスト管理者アカウントを作成しました！\n\nテナントID: ${result.data.tenantId}\nメール: ${result.data.email}\n\nこの情報を保存してください。`);
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
    // テストユーザー20名作成
    const createTestUsers = async () => {
        if (!testTenantId) {
            alert('先にテスト管理者を作成してください');
            return;
        }
        setLoading(true);
        try {
            const response = await fetch('/api/test/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tenantId: testTenantId,
                    count: 20
                })
            });
            const result = await response.json();
            if (result.success) {
                alert(`テストユーザーを作成しました！\n\nスタッフ: ${result.data.staffCount}名\n顧客: ${result.data.customerCount}名\n予約: ${result.data.reservationCount}件`);
                await loadTestUsers();
            }
            else {
                alert(`エラー: ${result.message}`);
            }
        }
        catch (error) {
            console.error('テストユーザー作成エラー:', error);
            alert('テストユーザーの作成に失敗しました');
        }
        setLoading(false);
    };
    // テストユーザー一覧取得
    const loadTestUsers = async () => {
        if (!testTenantId)
            return;
        setLoading(true);
        try {
            const response = await fetch(`/api/test/users/${testTenantId}`);
            const result = await response.json();
            if (result.success) {
                setTestData(result.data);
            }
        }
        catch (error) {
            console.error('テストユーザー取得エラー:', error);
        }
        setLoading(false);
    };
    // テストデータ一括削除
    const cleanupTestData = async () => {
        if (cleanupPassword !== 'DELETE_ALL_TEST_DATA_CONFIRM') {
            alert('削除確認パスワードが正しくありません');
            return;
        }
        setLoading(true);
        try {
            const response = await fetch('/api/test/cleanup', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tenantId: testTenantId,
                    confirmPassword: cleanupPassword
                })
            });
            const result = await response.json();
            if (result.success) {
                alert('テストデータを完全に削除しました');
                setTestData(null);
                setTestTenantId('');
                setShowCleanupConfirm(false);
                setCleanupPassword('');
            }
            else {
                alert(`エラー: ${result.message}`);
            }
        }
        catch (error) {
            console.error('データ削除エラー:', error);
            alert('データ削除に失敗しました');
        }
        setLoading(false);
    };
    useEffect(() => {
        if (testTenantId) {
            loadTestUsers();
        }
    }, [testTenantId]);
    return (_jsxs("div", { className: "max-w-6xl mx-auto p-6 space-y-6", children: [_jsxs("div", { className: "bg-yellow-50 border border-yellow-200 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(AlertCircle, { className: "w-5 h-5 text-yellow-600" }), _jsx("h1", { className: "text-xl font-bold text-yellow-800", children: "\u30C6\u30B9\u30C8\u74B0\u5883\u7BA1\u7406" })] }), _jsx("p", { className: "text-yellow-700 mt-2", children: "\u5B89\u5168\u306A\u30C6\u30B9\u30C8\u74B0\u5883\u3067\u30E6\u30FC\u30B6\u30FC20\u540D\u306E\u6E96\u5099\u3068API\u8A2D\u5B9A\u3092\u884C\u3044\u307E\u3059\u3002\u5916\u90E8\u9001\u4FE1\u306F\u5B8C\u5168\u306B\u7121\u52B9\u5316\u3055\u308C\u3066\u3044\u307E\u3059\u3002" })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-4", children: [_jsx(Shield, { className: "w-6 h-6 text-blue-600" }), _jsx("h2", { className: "text-lg font-semibold", children: "1. \u30C6\u30B9\u30C8\u7BA1\u7406\u8005\u30A2\u30AB\u30A6\u30F3\u30C8\u4F5C\u6210" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9" }), _jsx("input", { type: "email", value: adminCredentials.email, onChange: (e) => setAdminCredentials({ ...adminCredentials, email: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-md" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u30D1\u30B9\u30EF\u30FC\u30C9" }), _jsx("input", { type: "password", value: adminCredentials.password, onChange: (e) => setAdminCredentials({ ...adminCredentials, password: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-md" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u30C6\u30CA\u30F3\u30C8\u540D" }), _jsx("input", { type: "text", value: adminCredentials.tenantName, onChange: (e) => setAdminCredentials({ ...adminCredentials, tenantName: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-md" })] })] }), _jsxs("button", { onClick: createTestAdmin, disabled: loading, className: "bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2", children: [_jsx(Shield, { className: "w-4 h-4" }), _jsx("span", { children: "\u7BA1\u7406\u8005\u4F5C\u6210" })] }), testTenantId && (_jsx("div", { className: "mt-4 p-3 bg-green-50 border border-green-200 rounded", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(CheckCircle, { className: "w-4 h-4 text-green-600" }), _jsxs("span", { className: "text-green-800 font-medium", children: ["\u30C6\u30CA\u30F3\u30C8ID: ", testTenantId] })] }) }))] }), testTenantId && (_jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Users, { className: "w-6 h-6 text-green-600" }), _jsx("h2", { className: "text-lg font-semibold", children: "2. \u30C6\u30B9\u30C8\u30E6\u30FC\u30B6\u30FC20\u540D\u4F5C\u6210" })] }), _jsxs("div", { className: "flex space-x-2", children: [_jsxs("button", { onClick: createTestUsers, disabled: loading, className: "bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2", children: [_jsx(UserPlus, { className: "w-4 h-4" }), _jsx("span", { children: "\u30E6\u30FC\u30B6\u30FC\u4F5C\u6210" })] }), _jsxs("button", { onClick: loadTestUsers, disabled: loading, className: "bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 disabled:opacity-50 flex items-center space-x-2", children: [_jsx(RefreshCw, { className: "w-4 h-4" }), _jsx("span", { children: "\u66F4\u65B0" })] })] })] }), testData && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-3 gap-4", children: [_jsxs("div", { className: "bg-blue-50 p-4 rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold text-blue-600", children: testData.summary.staffCount }), _jsx("div", { className: "text-blue-800", children: "\u30B9\u30BF\u30C3\u30D5" })] }), _jsxs("div", { className: "bg-green-50 p-4 rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold text-green-600", children: testData.summary.customerCount }), _jsx("div", { className: "text-green-800", children: "\u9867\u5BA2" })] }), _jsxs("div", { className: "bg-purple-50 p-4 rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold text-purple-600", children: testData.summary.reservationCount }), _jsx("div", { className: "text-purple-800", children: "\u4E88\u7D04" })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-2", children: "\u30C6\u30B9\u30C8\u30B9\u30BF\u30C3\u30D5\u4E00\u89A7" }), _jsx("div", { className: "bg-gray-50 rounded p-4 max-h-40 overflow-y-auto", children: testData.staff.map((staff) => (_jsxs("div", { className: "flex justify-between items-center py-1 text-sm", children: [_jsxs("span", { children: [staff.name, " (", staff.email, ")"] }), _jsx("span", { className: `px-2 py-1 rounded text-xs ${staff.role === 'ADMIN' ? 'bg-red-100 text-red-800' : staff.role === 'MANAGER' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`, children: staff.role })] }, staff.id))) })] })] }))] })), testData && (_jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-4", children: [_jsx(Trash2, { className: "w-6 h-6 text-red-600" }), _jsx("h2", { className: "text-lg font-semibold", children: "3. \u30C6\u30B9\u30C8\u30C7\u30FC\u30BF\u5B8C\u5168\u524A\u9664" })] }), !showCleanupConfirm ? (_jsxs("button", { onClick: () => setShowCleanupConfirm(true), className: "bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center space-x-2", children: [_jsx(Trash2, { className: "w-4 h-4" }), _jsx("span", { children: "\u524A\u9664\u30E2\u30FC\u30C9\u958B\u59CB" })] })) : (_jsx("div", { className: "space-y-4", children: _jsxs("div", { className: "bg-red-50 border border-red-200 rounded p-4", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-2", children: [_jsx(AlertCircle, { className: "w-5 h-5 text-red-600" }), _jsx("span", { className: "font-semibold text-red-800", children: "\u5371\u967A: \u5168\u30C7\u30FC\u30BF\u524A\u9664" })] }), _jsx("p", { className: "text-red-700 mb-4", children: "\u3053\u306E\u64CD\u4F5C\u306B\u3088\u308A\u3001\u30C6\u30CA\u30F3\u30C8\u3001\u5168\u30E6\u30FC\u30B6\u30FC\u3001\u5168\u4E88\u7D04\u30C7\u30FC\u30BF\u304C\u5B8C\u5168\u306B\u524A\u9664\u3055\u308C\u307E\u3059\u3002" }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block text-sm font-medium text-red-700 mb-1", children: "\u524A\u9664\u78BA\u8A8D\u30D1\u30B9\u30EF\u30FC\u30C9: DELETE_ALL_TEST_DATA_CONFIRM" }), _jsx("input", { type: "text", value: cleanupPassword, onChange: (e) => setCleanupPassword(e.target.value), className: "w-full px-3 py-2 border border-red-300 rounded-md", placeholder: "\u4E0A\u8A18\u306E\u30D1\u30B9\u30EF\u30FC\u30C9\u3092\u6B63\u78BA\u306B\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044" })] }), _jsxs("div", { className: "flex space-x-2", children: [_jsxs("button", { onClick: cleanupTestData, disabled: loading || cleanupPassword !== 'DELETE_ALL_TEST_DATA_CONFIRM', className: "bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2", children: [_jsx(Trash2, { className: "w-4 h-4" }), _jsx("span", { children: "\u5B8C\u5168\u524A\u9664\u5B9F\u884C" })] }), _jsx("button", { onClick: () => {
                                                setShowCleanupConfirm(false);
                                                setCleanupPassword('');
                                            }, className: "bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700", children: "\u30AD\u30E3\u30F3\u30BB\u30EB" })] })] }) }))] })), loading && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white rounded-lg p-6 flex items-center space-x-3", children: [_jsx(RefreshCw, { className: "w-6 h-6 animate-spin text-blue-600" }), _jsx("span", { children: "\u51E6\u7406\u4E2D..." })] }) }))] }));
};
export default TestUserManager;
