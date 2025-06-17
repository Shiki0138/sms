import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Lock, User, Smartphone, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
export default function Login({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [showOTP, setShowOTP] = useState(false);
    const [loading, setLoading] = useState(false);
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // デモモード：固定認証情報
            if (email === 'admin@salon.com' && password === 'admin123') {
                // 2FAが有効な場合
                if (!showOTP) {
                    setShowOTP(true);
                    toast.success('認証コードを入力してください');
                    setLoading(false);
                    return;
                }
                // OTP検証（デモ用：123456で固定）
                if (otpCode === '123456') {
                    const demoToken = 'demo-jwt-token';
                    const demoStaff = {
                        id: '1',
                        name: '管理者',
                        email: 'admin@salon.com',
                        role: 'ADMIN',
                        tenantId: '1'
                    };
                    localStorage.setItem('token', demoToken);
                    localStorage.setItem('staff', JSON.stringify(demoStaff));
                    toast.success('ログインに成功しました');
                    onLogin(demoToken, demoStaff);
                }
                else {
                    toast.error('認証コードが正しくありません');
                }
            }
            else {
                toast.error('メールアドレスまたはパスワードが正しくありません');
            }
        }
        catch (error) {
            toast.error('ログインに失敗しました');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4", children: _jsx("div", { className: "max-w-md w-full", children: _jsxs("div", { className: "bg-white rounded-2xl shadow-xl p-8", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("div", { className: "inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full mb-4", children: _jsx(Shield, { className: "w-8 h-8" }) }), _jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "\u7F8E\u5BB9\u5BA4\u7D71\u5408\u7BA1\u7406\u30B7\u30B9\u30C6\u30E0" }), _jsx("p", { className: "text-sm text-gray-600 mt-2", children: "\u30BB\u30AD\u30E5\u30A2\u30ED\u30B0\u30A4\u30F3" })] }), _jsxs("form", { onSubmit: handleLogin, className: "space-y-6", children: [!showOTP ? (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9" }), _jsxs("div", { className: "relative", children: [_jsx(User, { className: "absolute left-3 top-3 w-5 h-5 text-gray-400" }), _jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), className: "w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500", placeholder: "admin@salon.com", required: true })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "\u30D1\u30B9\u30EF\u30FC\u30C9" }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "absolute left-3 top-3 w-5 h-5 text-gray-400" }), _jsx("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), className: "w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", required: true })] })] })] })) : (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "2\u8981\u7D20\u8A8D\u8A3C\u30B3\u30FC\u30C9" }), _jsxs("div", { className: "relative", children: [_jsx(Smartphone, { className: "absolute left-3 top-3 w-5 h-5 text-gray-400" }), _jsx("input", { type: "text", value: otpCode, onChange: (e) => setOtpCode(e.target.value), className: "w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500", placeholder: "6\u6841\u306E\u8A8D\u8A3C\u30B3\u30FC\u30C9", maxLength: 6, required: true })] }), _jsx("p", { className: "text-xs text-gray-500 mt-2", children: "\u30C7\u30E2\u7528\u30B3\u30FC\u30C9: 123456" })] })), _jsx("button", { type: "submit", disabled: loading, className: "w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed", children: loading ? '認証中...' : showOTP ? '認証コードを確認' : 'ログイン' })] }), _jsxs("div", { className: "mt-6 p-4 bg-gray-50 rounded-lg", children: [_jsx("p", { className: "text-xs text-gray-600 font-medium mb-2", children: "\u30C7\u30E2\u8A8D\u8A3C\u60C5\u5831:" }), _jsxs("div", { className: "space-y-1 text-xs text-gray-500", children: [_jsx("p", { children: "\u30E1\u30FC\u30EB: admin@salon.com" }), _jsx("p", { children: "\u30D1\u30B9\u30EF\u30FC\u30C9: admin123" }), _jsx("p", { children: "2FA\u30B3\u30FC\u30C9: 123456" })] })] })] }) }) }));
}
