import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { User, LogOut, Settings, Shield, Clock, Phone, Mail, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
const UserProfile = () => {
    const { user, logout, hasPermission } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    if (!user)
        return null;
    const getRoleColor = (role) => {
        switch (role) {
            case 'admin':
                return 'bg-red-100 text-red-800';
            case 'staff':
                return 'bg-blue-100 text-blue-800';
            case 'demo':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };
    const getRoleLabel = (role) => {
        switch (role) {
            case 'admin':
                return '管理者';
            case 'staff':
                return 'スタッフ';
            case 'demo':
                return 'デモユーザー';
            default:
                return role;
        }
    };
    return (_jsxs("div", { className: "relative", children: [_jsxs("button", { onClick: () => setIsOpen(!isOpen), className: "flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-gray-100 transition-colors", children: [_jsx("div", { className: "flex-shrink-0", children: user.profile.avatar ? (_jsx("img", { src: user.profile.avatar, alt: user.profile.name, className: "h-8 w-8 rounded-full" })) : (_jsx("div", { className: "h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center", children: _jsx(User, { className: "h-4 w-4 text-white" }) })) }), _jsxs("div", { className: "flex-1 text-left min-w-0", children: [_jsx("p", { className: "text-sm font-medium text-gray-900 truncate", children: user.profile.name }), _jsx("p", { className: "text-xs text-gray-500 truncate", children: getRoleLabel(user.role) })] }), _jsx(ChevronDown, { className: `h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}` })] }), isOpen && (_jsxs("div", { className: "absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50", children: [_jsx("div", { className: "px-4 py-3 border-b border-gray-100", children: _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "flex-shrink-0", children: user.profile.avatar ? (_jsx("img", { src: user.profile.avatar, alt: user.profile.name, className: "h-10 w-10 rounded-full" })) : (_jsx("div", { className: "h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center", children: _jsx(User, { className: "h-5 w-5 text-white" }) })) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-medium text-gray-900", children: user.profile.name }), _jsxs("p", { className: "text-xs text-gray-500", children: ["@", user.username] }), _jsx("div", { className: "mt-1", children: _jsxs("span", { className: `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`, children: [_jsx(Shield, { className: "h-3 w-3 mr-1" }), getRoleLabel(user.role)] }) })] })] }) }), _jsxs("div", { className: "px-4 py-3 space-y-2 border-b border-gray-100", children: [user.email && (_jsxs("div", { className: "flex items-center space-x-2 text-xs text-gray-600", children: [_jsx(Mail, { className: "h-3 w-3" }), _jsx("span", { children: user.email })] })), user.profile.phone && (_jsxs("div", { className: "flex items-center space-x-2 text-xs text-gray-600", children: [_jsx(Phone, { className: "h-3 w-3" }), _jsx("span", { children: user.profile.phone })] })), user.profile.position && (_jsxs("div", { className: "flex items-center space-x-2 text-xs text-gray-600", children: [_jsx(User, { className: "h-3 w-3" }), _jsx("span", { children: user.profile.position })] })), user.lastLoginAt && (_jsxs("div", { className: "flex items-center space-x-2 text-xs text-gray-600", children: [_jsx(Clock, { className: "h-3 w-3" }), _jsxs("span", { children: ["\u6700\u7D42\u30ED\u30B0\u30A4\u30F3: ", format(new Date(user.lastLoginAt), 'M月d日 HH:mm', { locale: ja })] })] }))] }), _jsxs("div", { className: "px-4 py-3 border-b border-gray-100", children: [_jsx("p", { className: "text-xs font-medium text-gray-700 mb-2", children: "\u6A29\u9650" }), _jsx("div", { className: "space-y-1", children: user.permissions.map((permission, index) => (_jsxs("div", { className: "text-xs text-gray-600", children: [_jsx("span", { className: "font-medium", children: permission.resource }), _jsx("span", { className: "text-gray-400 mx-1", children: ":" }), _jsx("span", { children: permission.actions.join(', ') })] }, index))) })] }), _jsxs("div", { className: "py-1", children: [hasPermission('settings', 'read') && (_jsxs("button", { onClick: () => {
                                    setIsOpen(false);
                                    // 設定画面への遷移処理をここに追加
                                }, className: "w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2", children: [_jsx(Settings, { className: "h-4 w-4" }), _jsx("span", { children: "\u8A2D\u5B9A" })] })), _jsxs("button", { onClick: () => {
                                    setIsOpen(false);
                                    logout();
                                }, className: "w-full px-4 py-2 text-left text-sm text-red-700 hover:bg-red-50 flex items-center space-x-2", children: [_jsx(LogOut, { className: "h-4 w-4" }), _jsx("span", { children: "\u30ED\u30B0\u30A2\u30A6\u30C8" })] })] })] }))] }));
};
export default UserProfile;
