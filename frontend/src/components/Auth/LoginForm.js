import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Eye, EyeOff, LogIn, User, Lock, AlertCircle, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { TEST_LOGIN_CREDENTIALS } from '../../types/auth';
const LoginForm = ({ onLoginSuccess }) => {
    const { login, isLoading } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const [showCredentials, setShowCredentials] = useState(false);
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error)
            setError(null);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (!formData.username || !formData.password) {
            setError('ユーザー名とパスワードを入力してください');
            return;
        }
        const success = await login(formData);
        if (success) {
            onLoginSuccess?.();
        }
        else {
            setError('ログインに失敗しました。ユーザー名またはパスワードが正しくありません。');
        }
    };
    const handleQuickLogin = (role) => {
        const credentials = TEST_LOGIN_CREDENTIALS[role];
        setFormData(credentials);
    };
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4", children: _jsxs("div", { className: "max-w-md w-full space-y-8", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4", children: _jsx(Shield, { className: "h-8 w-8 text-white" }) }), _jsx("h2", { className: "text-3xl font-bold text-gray-900", children: "\u7F8E\u5BB9\u5BA4\u7BA1\u7406\u30B7\u30B9\u30C6\u30E0" }), _jsx("p", { className: "mt-2 text-sm text-gray-600", children: "\u30B7\u30B9\u30C6\u30E0\u306B\u30ED\u30B0\u30A4\u30F3\u3057\u3066\u304F\u3060\u3055\u3044" })] }), _jsxs("div", { className: "bg-white rounded-xl shadow-lg p-8", children: [_jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "username", className: "block text-sm font-medium text-gray-700 mb-2", children: "\u30E6\u30FC\u30B6\u30FC\u540D" }), _jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: _jsx(User, { className: "h-5 w-5 text-gray-400" }) }), _jsx("input", { id: "username", name: "username", type: "text", value: formData.username, onChange: handleInputChange, className: "block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm", placeholder: "\u30E6\u30FC\u30B6\u30FC\u540D\u3092\u5165\u529B", disabled: isLoading, "data-testid": "login-username-input" })] })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "password", className: "block text-sm font-medium text-gray-700 mb-2", children: "\u30D1\u30B9\u30EF\u30FC\u30C9" }), _jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: _jsx(Lock, { className: "h-5 w-5 text-gray-400" }) }), _jsx("input", { id: "password", name: "password", type: showPassword ? 'text' : 'password', value: formData.password, onChange: handleInputChange, className: "block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm", placeholder: "\u30D1\u30B9\u30EF\u30FC\u30C9\u3092\u5165\u529B", disabled: isLoading, "data-testid": "login-password-input" }), _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute inset-y-0 right-0 pr-3 flex items-center", disabled: isLoading, "data-testid": "login-password-toggle", children: showPassword ? (_jsx(EyeOff, { className: "h-5 w-5 text-gray-400 hover:text-gray-600" })) : (_jsx(Eye, { className: "h-5 w-5 text-gray-400 hover:text-gray-600" })) })] })] }), error && (_jsxs("div", { className: "flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg", "data-testid": "login-error-message", children: [_jsx(AlertCircle, { className: "h-5 w-5" }), _jsx("span", { className: "text-sm", children: error })] })), _jsx("button", { type: "submit", disabled: isLoading, className: "w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors", "data-testid": "login-submit-button", children: isLoading ? (_jsx("div", { className: "animate-spin rounded-full h-5 w-5 border-b-2 border-white" })) : (_jsxs(_Fragment, { children: [_jsx(LogIn, { className: "h-5 w-5 mr-2" }), "\u30ED\u30B0\u30A4\u30F3"] })) })] }), _jsxs("div", { className: "mt-6 pt-6 border-t border-gray-200", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("span", { className: "text-sm font-medium text-gray-700", children: "\u30C7\u30E2\u30A2\u30AB\u30A6\u30F3\u30C8" }), _jsx("button", { type: "button", onClick: () => setShowCredentials(!showCredentials), className: "text-xs text-blue-600 hover:text-blue-700", children: showCredentials ? '非表示' : '表示' })] }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsx("button", { type: "button", onClick: () => handleQuickLogin('demo'), className: "px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors", disabled: isLoading, "data-testid": "login-demo-button", children: "\u30C7\u30E2\u30E6\u30FC\u30B6\u30FC" }), _jsx("button", { type: "button", onClick: () => handleQuickLogin('admin'), className: "px-3 py-2 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors", disabled: isLoading, "data-testid": "login-admin-button", children: "\u7BA1\u7406\u8005" }), _jsx("button", { type: "button", onClick: () => handleQuickLogin('staff1'), className: "px-3 py-2 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors", disabled: isLoading, children: "\u7530\u4E2D \u7F8E\u54B2" }), _jsx("button", { type: "button", onClick: () => handleQuickLogin('staff2'), className: "px-3 py-2 text-xs bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors", disabled: isLoading, children: "\u4F50\u85E4 \u5343\u590F" })] }), showCredentials && (_jsx("div", { className: "mt-4 text-xs text-gray-600 space-y-2", children: _jsxs("div", { className: "bg-gray-50 p-3 rounded-lg", children: [_jsx("p", { className: "font-medium mb-2", children: "\u30ED\u30B0\u30A4\u30F3\u60C5\u5831:" }), _jsxs("div", { className: "space-y-1", children: [_jsx("div", { children: "\u30C7\u30E2: salon_demo_001 / Demo2024Salon!" }), _jsx("div", { children: "\u7BA1\u7406\u8005: admin_system / AdminSalon2024!System" }), _jsx("div", { children: "\u30B9\u30BF\u30C3\u30D51: tanaka_misaki / Staff2024Tanaka!" }), _jsx("div", { children: "\u30B9\u30BF\u30C3\u30D52: sato_chinatsu / Staff2024Sato!" })] })] }) }))] })] }), _jsxs("div", { className: "text-center text-xs text-gray-500", children: [_jsx("p", { children: "\u3053\u306E\u30B7\u30B9\u30C6\u30E0\u306F\u8A8D\u8A3C\u304C\u5FC5\u8981\u3067\u3059" }), _jsx("p", { className: "mt-1", children: "\u9069\u5207\u306A\u6A29\u9650\u3092\u6301\u3064\u30A2\u30AB\u30A6\u30F3\u30C8\u3067\u30ED\u30B0\u30A4\u30F3\u3057\u3066\u304F\u3060\u3055\u3044" })] })] }) }));
};
export default LoginForm;
