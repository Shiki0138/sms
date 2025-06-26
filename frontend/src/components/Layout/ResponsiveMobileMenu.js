import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * 📱 レスポンシブモバイルメニュー
 * スマートフォン・タブレット対応のナビゲーション
 */
import { useState, useEffect } from 'react';
import { Menu, X, Calendar, Users, BarChart3, Settings, MessageSquare, Home, Scissors, Clock, Shield } from 'lucide-react';
import { getEnvironmentConfig } from '../../utils/environment';
import DemoBanner from '../Demo/DemoBanner';
const menuItems = [
    {
        id: 'dashboard',
        label: 'ダッシュボード',
        icon: Home,
        color: 'text-blue-600',
        description: 'ホーム画面'
    },
    {
        id: 'calendar',
        label: '予約管理',
        icon: Calendar,
        color: 'text-green-600',
        description: 'カレンダー・予約'
    },
    {
        id: 'customers',
        label: '顧客管理',
        icon: Users,
        color: 'text-purple-600',
        description: '顧客情報・履歴'
    },
    {
        id: 'messages',
        label: 'メッセージ',
        icon: MessageSquare,
        color: 'text-orange-600',
        description: 'LINE・Instagram'
    },
    {
        id: 'analytics',
        label: '分析・レポート',
        icon: BarChart3,
        color: 'text-indigo-600',
        description: '売上・分析'
    },
    {
        id: 'settings',
        label: '設定',
        icon: Settings,
        color: 'text-gray-600',
        description: 'システム設定'
    }
];
const quickActions = [
    {
        id: 'new-reservation',
        label: '新規予約',
        icon: Clock,
        color: 'text-green-600',
        mobileOnly: true
    },
    {
        id: 'new-customer',
        label: '新規顧客',
        icon: Users,
        color: 'text-blue-600',
        mobileOnly: true
    },
    {
        id: 'quick-message',
        label: 'メッセージ',
        icon: MessageSquare,
        color: 'text-purple-600',
        mobileOnly: true
    }
];
export const ResponsiveMobileMenu = ({ currentView, setCurrentView, currentPage }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const config = getEnvironmentConfig();
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);
    const getCurrentMenuItem = () => {
        return menuItems.find(item => item.id === currentView) || menuItems[0];
    };
    const handleMenuItemClick = (itemId) => {
        setCurrentView(itemId);
        setIsMenuOpen(false);
    };
    const currentItem = getCurrentMenuItem();
    return (_jsxs(_Fragment, { children: [config.isDemoMode && _jsx(DemoBanner, { currentPage: currentPage }), _jsx("div", { className: "md:hidden bg-white shadow-sm border-b sticky top-0 z-40", children: _jsxs("div", { className: "flex items-center justify-between px-4 py-3", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("button", { onClick: () => setIsMenuOpen(true), className: "p-2 rounded-lg hover:bg-gray-100 transition-colors", children: _jsx(Menu, { className: "w-6 h-6 text-gray-600" }) }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: `w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center`, children: _jsx(currentItem.icon, { className: `w-5 h-5 ${currentItem.color}` }) }), _jsxs("div", { children: [_jsx("h1", { className: "font-semibold text-gray-900 text-sm", children: currentItem.label }), currentItem.description && (_jsx("p", { className: "text-xs text-gray-500", children: currentItem.description }))] })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [config.isDemoMode && (_jsx("div", { className: "bg-purple-100 text-purple-700 px-2 py-1 rounded-md text-xs font-medium", children: "\uD83C\uDFAD \u30C7\u30E2" })), _jsx("div", { className: "w-2 h-2 bg-green-400 rounded-full" })] })] }) }), _jsx("div", { className: "hidden md:block lg:hidden bg-white shadow-sm border-b sticky top-0 z-40", children: _jsxs("div", { className: "max-w-full mx-auto px-6 py-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "flex items-center gap-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center", children: _jsx(Scissors, { className: "w-6 h-6 text-white" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-xl font-bold text-gray-900", children: "SMS" }), _jsx("p", { className: "text-sm text-gray-500", children: "\u7F8E\u5BB9\u5BA4\u7BA1\u7406\u30B7\u30B9\u30C6\u30E0" })] })] }) }), config.isDemoMode && (_jsx("div", { className: "bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium", children: "\uD83C\uDFAD \u30C7\u30E2\u30E2\u30FC\u30C9" }))] }), _jsx("div", { className: "flex gap-1 mt-4 overflow-x-auto scrollbar-hide", children: menuItems.map((item) => {
                                const isActive = currentView === item.id;
                                const IconComponent = item.icon;
                                return (_jsxs("button", { onClick: () => handleMenuItemClick(item.id), className: `flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${isActive
                                        ? 'bg-blue-50 text-blue-600 border border-blue-200'
                                        : 'text-gray-600 hover:bg-gray-50'}`, children: [_jsx(IconComponent, { className: "w-4 h-4" }), _jsx("span", { className: "text-sm font-medium", children: item.label })] }, item.id));
                            }) })] }) }), isMenuOpen && (_jsxs("div", { className: "fixed inset-0 z-50 md:hidden", children: [_jsx("div", { className: "absolute inset-0 bg-black bg-opacity-50", onClick: () => setIsMenuOpen(false) }), _jsx("div", { className: "absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-xl", children: _jsxs("div", { className: "flex flex-col h-full", children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center", children: _jsx(Scissors, { className: "w-6 h-6 text-white" }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-lg font-bold text-gray-900", children: "SMS" }), _jsx("p", { className: "text-sm text-gray-500", children: "\u7F8E\u5BB9\u5BA4\u7BA1\u7406\u30B7\u30B9\u30C6\u30E0" })] })] }), _jsx("button", { onClick: () => setIsMenuOpen(false), className: "p-2 rounded-lg hover:bg-gray-100 transition-colors", children: _jsx(X, { className: "w-6 h-6 text-gray-500" }) })] }), _jsxs("div", { className: "p-4 border-b bg-gray-50", children: [_jsx("h3", { className: "text-sm font-medium text-gray-700 mb-3", children: "\u30AF\u30A4\u30C3\u30AF\u30A2\u30AF\u30B7\u30E7\u30F3" }), _jsx("div", { className: "grid grid-cols-3 gap-2", children: quickActions.map((action) => {
                                                const IconComponent = action.icon;
                                                return (_jsxs("button", { onClick: () => handleMenuItemClick(action.id), className: "flex flex-col items-center gap-1 p-3 rounded-lg bg-white border hover:bg-gray-50 transition-colors", children: [_jsx(IconComponent, { className: `w-5 h-5 ${action.color}` }), _jsx("span", { className: "text-xs font-medium text-gray-600", children: action.label })] }, action.id));
                                            }) })] }), _jsxs("div", { className: "flex-1 p-4", children: [_jsx("h3", { className: "text-sm font-medium text-gray-700 mb-3", children: "\u30E1\u30A4\u30F3\u30E1\u30CB\u30E5\u30FC" }), _jsx("div", { className: "space-y-1", children: menuItems.map((item) => {
                                                const isActive = currentView === item.id;
                                                const IconComponent = item.icon;
                                                return (_jsxs("button", { onClick: () => handleMenuItemClick(item.id), className: `w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${isActive
                                                        ? 'bg-blue-50 text-blue-600 border border-blue-200'
                                                        : 'text-gray-700 hover:bg-gray-50'}`, children: [_jsx(IconComponent, { className: `w-5 h-5 ${isActive ? 'text-blue-600' : item.color}` }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "font-medium", children: item.label }), item.description && (_jsx("div", { className: "text-sm text-gray-500", children: item.description }))] })] }, item.id));
                                            }) })] }), _jsxs("div", { className: "p-4 border-t bg-gray-50", children: [config.isDemoMode && (_jsxs("div", { className: "bg-gradient-to-r from-purple-100 to-blue-100 p-3 rounded-lg mb-3", children: [_jsxs("div", { className: "flex items-center gap-2 text-purple-700", children: [_jsx(Shield, { className: "w-4 h-4" }), _jsx("span", { className: "text-sm font-medium", children: "\u30C7\u30E2\u30E2\u30FC\u30C9" })] }), _jsx("p", { className: "text-xs text-purple-600 mt-1", children: "\u5236\u9650\u6A5F\u80FD\u3042\u308A\u30FB\u5B9F\u30C7\u30FC\u30BF\u767B\u9332\u53EF\u80FD" })] })), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-xs text-gray-500", children: "SMS v1.0.0" }), _jsx("p", { className: "text-xs text-gray-400", children: "\u7F8E\u5BB9\u5BA4\u7D71\u5408\u7BA1\u7406\u30B7\u30B9\u30C6\u30E0" })] })] })] }) })] })), _jsx("div", { className: "md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-30", children: _jsx("div", { className: "grid grid-cols-4 gap-1 p-2", children: menuItems.slice(0, 4).map((item) => {
                        const isActive = currentView === item.id;
                        const IconComponent = item.icon;
                        return (_jsxs("button", { onClick: () => handleMenuItemClick(item.id), className: `flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${isActive
                                ? 'text-blue-600 bg-blue-50'
                                : 'text-gray-600 hover:bg-gray-50'}`, children: [_jsx(IconComponent, { className: "w-5 h-5" }), _jsx("span", { className: "text-xs font-medium", children: item.label })] }, item.id));
                    }) }) })] }));
};
export default ResponsiveMobileMenu;
