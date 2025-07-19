import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useAuth } from '../../contexts/AuthContext';
import LoginForm from './LoginForm';
import { Shield, AlertCircle } from 'lucide-react';
const ProtectedRoute = ({ children, requireAuth = true, requiredResource, requiredAction, fallback }) => {
    const { isAuthenticated, isLoading, hasPermission, user } = useAuth();
    // ローディング中
    if (isLoading) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-50", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" }), _jsx("p", { className: "text-gray-600", children: "\u30B7\u30B9\u30C6\u30E0\u3092\u521D\u671F\u5316\u4E2D..." })] }) }));
    }
    // 認証が必要だが未認証の場合
    if (requireAuth && !isAuthenticated) {
        return _jsx(LoginForm, {});
    }
    // 特定の権限が必要な場合
    if (requiredResource && requiredAction && !hasPermission(requiredResource, requiredAction)) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-50", children: _jsx("div", { className: "max-w-md w-full mx-auto", children: _jsxs("div", { className: "bg-white rounded-lg shadow-lg p-8 text-center", children: [_jsx("div", { className: "mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4", children: _jsx(Shield, { className: "h-8 w-8 text-red-600" }) }), _jsx("h2", { className: "text-xl font-bold text-gray-900 mb-2", children: "\u30A2\u30AF\u30BB\u30B9\u6A29\u9650\u304C\u3042\u308A\u307E\u305B\u3093" }), _jsxs("div", { className: "flex items-center justify-center space-x-2 text-red-600 mb-4", children: [_jsx(AlertCircle, { className: "h-5 w-5" }), _jsx("span", { className: "text-sm", children: "\u3053\u306E\u6A5F\u80FD\u306B\u30A2\u30AF\u30BB\u30B9\u3059\u308B\u6A29\u9650\u304C\u3042\u308A\u307E\u305B\u3093" })] }), _jsxs("div", { className: "text-sm text-gray-600 space-y-2", children: [_jsxs("p", { children: ["\u73FE\u5728\u306E\u30E6\u30FC\u30B6\u30FC: ", _jsx("span", { className: "font-medium", children: user?.profile.name })] }), _jsxs("p", { children: ["\u30ED\u30FC\u30EB: ", _jsx("span", { className: "font-medium", children: user?.role })] }), _jsxs("p", { children: ["\u5FC5\u8981\u306A\u6A29\u9650: ", _jsxs("span", { className: "font-medium", children: [requiredResource, ":", requiredAction] })] })] }), fallback && (_jsx("div", { className: "mt-6", children: fallback }))] }) }) }));
    }
    // 権限チェックを通過した場合、子コンポーネントを表示
    return _jsx(_Fragment, { children: children });
};
export default ProtectedRoute;
