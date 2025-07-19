import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Eye, EyeOff, User, Lock, Shield, Store, ArrowRight, Copy, CheckCircle } from 'lucide-react';
import { adminTestAccounts, loginTestInstructions } from '../../data/adminAccounts';
const TestLoginForm = ({ onLogin, className = '' }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState('');
    const [showAccountList, setShowAccountList] = useState(false);
    const [copiedAccount, setCopiedAccount] = useState('');
    const handleLogin = (e) => {
        e.preventDefault();
        const account = adminTestAccounts.find(acc => acc.username === username);
        if (account && password === loginTestInstructions.commonPassword) {
            alert(`ログイン成功！\n${account.name}様（${account.salonInfo.name}）としてログインします。`);
            if (onLogin) {
                onLogin(account);
            }
        }
        else {
            alert('ユーザー名またはパスワードが正しくありません。\nパスワード: test123456');
        }
    };
    const handleAccountSelect = (accountUsername) => {
        setUsername(accountUsername);
        setSelectedAccount(accountUsername);
        setShowAccountList(false);
    };
    const copyAccountInfo = (accountUsername) => {
        navigator.clipboard.writeText(accountUsername);
        setCopiedAccount(accountUsername);
        setTimeout(() => setCopiedAccount(''), 2000);
    };
    const selectedAccountInfo = adminTestAccounts.find(acc => acc.username === username);
    return (_jsxs("div", { className: `max-w-md mx-auto bg-white rounded-lg shadow-lg border border-gray-200 ${className}`, children: [_jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "text-center mb-6", children: [_jsx("div", { className: "w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4", children: _jsx(Shield, { className: "w-8 h-8 text-blue-600" }) }), _jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-2", children: "\u30C6\u30B9\u30C8\u7528\u30ED\u30B0\u30A4\u30F3" }), _jsx("p", { className: "text-gray-600 text-sm", children: "\u7D4C\u55B6\u8005\u69D8\u5411\u3051\u30C7\u30E2\u30A2\u30AB\u30A6\u30F3\u30C8\uFF0820\u500B\uFF09" })] }), _jsx("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6", children: _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx(Shield, { className: "w-5 h-5 text-blue-600 mt-0.5" }), _jsxs("div", { className: "text-sm text-blue-800", children: [_jsx("p", { className: "font-medium mb-1", children: "\u30C6\u30B9\u30C8\u30E2\u30FC\u30C9\u74B0\u5883" }), _jsx("p", { children: "\u5B9F\u969B\u306E\u5916\u90E8\u9001\u4FE1\u306F\u884C\u308F\u308C\u307E\u305B\u3093\u3002\u5B89\u5168\u306B\u304A\u8A66\u3057\u3044\u305F\u3060\u3051\u307E\u3059\u3002" })] })] }) }), _jsxs("form", { onSubmit: handleLogin, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "\u30E6\u30FC\u30B6\u30FC\u540D" }), _jsxs("div", { className: "relative", children: [_jsx("input", { type: "text", value: username, onChange: (e) => setUsername(e.target.value), className: "w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500", placeholder: "owner001", required: true }), _jsx(User, { className: "w-5 h-5 text-gray-400 absolute left-3 top-3.5" })] }), _jsxs("button", { type: "button", onClick: () => setShowAccountList(!showAccountList), className: "mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center", children: [_jsx(Store, { className: "w-4 h-4 mr-1" }), "\u30C6\u30B9\u30C8\u30A2\u30AB\u30A6\u30F3\u30C8\u4E00\u89A7\u304B\u3089\u9078\u629E"] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "\u30D1\u30B9\u30EF\u30FC\u30C9" }), _jsxs("div", { className: "relative", children: [_jsx("input", { type: showPassword ? 'text' : 'password', value: password, onChange: (e) => setPassword(e.target.value), className: "w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500", placeholder: "test123456", required: true }), _jsx(Lock, { className: "w-5 h-5 text-gray-400 absolute left-3 top-3.5" }), _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute right-3 top-3.5 text-gray-400 hover:text-gray-600", children: showPassword ? _jsx(EyeOff, { className: "w-5 h-5" }) : _jsx(Eye, { className: "w-5 h-5" }) })] }), _jsx("p", { className: "mt-1 text-xs text-gray-500", children: "\u5168\u30A2\u30AB\u30A6\u30F3\u30C8\u5171\u901A: test123456" })] }), selectedAccountInfo && (_jsxs("div", { className: "bg-green-50 border border-green-200 rounded-lg p-3", children: [_jsx("h4", { className: "text-sm font-medium text-green-900 mb-1", children: "\u9078\u629E\u3055\u308C\u305F\u30A2\u30AB\u30A6\u30F3\u30C8" }), _jsxs("div", { className: "text-sm text-green-800", children: [_jsxs("p", { children: ["\u7D4C\u55B6\u8005: ", selectedAccountInfo.name] }), _jsxs("p", { children: ["\u5E97\u8217: ", selectedAccountInfo.salonInfo.name] }), _jsxs("p", { children: ["\u30BF\u30A4\u30D7: ", selectedAccountInfo.salonInfo.type] })] })] })), _jsxs("button", { type: "submit", className: "w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center", children: [_jsx("span", { children: "\u30ED\u30B0\u30A4\u30F3" }), _jsx(ArrowRight, { className: "w-5 h-5 ml-2" })] })] }), _jsx("div", { className: "mt-4 text-center", children: _jsx("button", { onClick: () => {
                                setPassword('test123456');
                                navigator.clipboard.writeText('test123456');
                                alert('パスワードを自動入力しました');
                            }, className: "text-sm text-gray-500 hover:text-gray-700", children: "\u30D1\u30B9\u30EF\u30FC\u30C9\u3092\u81EA\u52D5\u5165\u529B" }) })] }), showAccountList && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4", children: _jsx("div", { className: "bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto", children: _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsx("h3", { className: "text-xl font-bold text-gray-900", children: "\u30C6\u30B9\u30C8\u7528\u7BA1\u7406\u8005\u30A2\u30AB\u30A6\u30F3\u30C8\uFF0820\u500B\uFF09" }), _jsx("button", { onClick: () => setShowAccountList(false), className: "text-gray-400 hover:text-gray-600", children: "\u00D7" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: adminTestAccounts.map((account) => (_jsxs("div", { className: `border rounded-lg p-4 cursor-pointer transition-colors ${selectedAccount === account.username
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'}`, onClick: () => handleAccountSelect(account.username), children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("div", { className: "font-medium text-gray-900", children: account.username }), _jsx("button", { onClick: (e) => {
                                                        e.stopPropagation();
                                                        copyAccountInfo(account.username);
                                                    }, className: "text-blue-600 hover:text-blue-800 p-1", children: copiedAccount === account.username ? (_jsx(CheckCircle, { className: "w-4 h-4" })) : (_jsx(Copy, { className: "w-4 h-4" })) })] }), _jsxs("div", { className: "text-sm text-gray-600 space-y-1", children: [_jsxs("p", { children: [_jsx("strong", { children: "\u7D4C\u55B6\u8005:" }), " ", account.name] }), _jsxs("p", { children: [_jsx("strong", { children: "\u5E97\u8217:" }), " ", account.salonInfo.name] }), _jsxs("p", { children: [_jsx("strong", { children: "\u30BF\u30A4\u30D7:" }), " ", account.salonInfo.type] }), _jsxs("p", { children: [_jsx("strong", { children: "\u6240\u5728\u5730:" }), " ", account.salonInfo.location] })] })] }, account.id))) }), _jsxs("div", { className: "mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4", children: [_jsx("h4", { className: "font-medium text-yellow-900 mb-2", children: "\u4F7F\u7528\u65B9\u6CD5" }), _jsxs("ol", { className: "text-sm text-yellow-800 list-decimal list-inside space-y-1", children: [_jsx("li", { children: "\u4E0A\u8A18\u306E\u30A2\u30AB\u30A6\u30F3\u30C8\u304B\u30891\u3064\u3092\u9078\u629E" }), _jsx("li", { children: "\u30D1\u30B9\u30EF\u30FC\u30C9\u300Ctest123456\u300D\u3067\u30ED\u30B0\u30A4\u30F3" }), _jsx("li", { children: "\u30ED\u30B0\u30A2\u30A6\u30C8\u5F8C\u3001\u5225\u306E\u30A2\u30AB\u30A6\u30F3\u30C8\u3082\u8A66\u7528\u53EF\u80FD" }), _jsx("li", { children: "\u3059\u3079\u3066\u30C6\u30B9\u30C8\u30E2\u30FC\u30C9\u3067\u5B89\u5168\u306B\u52D5\u4F5C" })] })] })] }) }) }))] }));
};
export default TestLoginForm;
