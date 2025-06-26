import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * 🎭 デモモード表示バナー
 * デモモードであることを明示し、制限事項を表示
 */
import { useState, useEffect } from 'react';
import { AlertTriangle, MessageSquare, Clock, Shield } from 'lucide-react';
import { getEnvironmentConfig } from '../../utils/environment';
import DemoFeedbackForm from './DemoFeedbackForm';
export const DemoBanner = ({ currentPage }) => {
    const [showFeedback, setShowFeedback] = useState(false);
    const [daysRemaining, setDaysRemaining] = useState(7);
    const config = getEnvironmentConfig();
    useEffect(() => {
        // デモ開始日を取得（ローカルストレージから）
        const demoStartDate = localStorage.getItem('demo_start_date');
        if (demoStartDate) {
            const startDate = new Date(demoStartDate);
            const currentDate = new Date();
            const diffTime = (config.demoExpiryDays || 30) * 24 * 60 * 60 * 1000 - (currentDate.getTime() - startDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            setDaysRemaining(Math.max(0, diffDays));
        }
        else {
            // 初回アクセス時は開始日を設定
            localStorage.setItem('demo_start_date', new Date().toISOString());
            setDaysRemaining(config.demoExpiryDays || 30);
        }
    }, [config.demoExpiryDays]);
    if (!config.isDemoMode)
        return null;
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 py-3", children: [_jsxs("div", { className: "flex items-center justify-between flex-wrap gap-4", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center", children: "\uD83C\uDFAD" }), _jsxs("div", { children: [_jsx("span", { className: "font-bold text-lg", children: "\u30C7\u30E2\u30E2\u30FC\u30C9" }), _jsx("span", { className: "ml-2 text-purple-200", children: "SMS\u4F53\u9A13\u7248" })] })] }), _jsxs("div", { className: "flex items-center gap-2 bg-white bg-opacity-20 px-3 py-1 rounded-full", children: [_jsx(Clock, { className: "w-4 h-4" }), _jsxs("span", { className: "text-sm font-medium", children: ["\u6B8B\u308A ", daysRemaining, " \u65E5\u9593"] })] }), _jsxs("div", { className: "hidden lg:flex items-center gap-2 bg-yellow-500 bg-opacity-20 px-3 py-1 rounded-full", children: [_jsx(Shield, { className: "w-4 h-4" }), _jsx("span", { className: "text-sm", children: "LINE\u30FB\u6C7A\u6E08\u6A5F\u80FD\u306F\u5236\u9650\u4E2D" })] })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("button", { onClick: () => setShowFeedback(true), className: "flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-all text-sm font-medium", children: [_jsx(MessageSquare, { className: "w-4 h-4" }), "\u30D5\u30A3\u30FC\u30C9\u30D0\u30C3\u30AF"] }), _jsxs("div", { className: "flex items-center gap-2 text-sm", children: [_jsx(AlertTriangle, { className: "w-4 h-4" }), _jsx("span", { className: "hidden sm:inline", children: "\u5B9F\u969B\u306E\u30C7\u30FC\u30BF\u767B\u9332\u306F\u53EF\u80FD\u3067\u3059" })] })] })] }), _jsx("div", { className: "lg:hidden mt-3 pt-3 border-t border-white border-opacity-20", children: _jsxs("div", { className: "flex flex-wrap gap-4 text-sm", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Shield, { className: "w-4 h-4" }), _jsx("span", { children: "LINE\u30FB\u6C7A\u6E08\u6A5F\u80FD\u306F\u5236\u9650\u4E2D" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(AlertTriangle, { className: "w-4 h-4" }), _jsx("span", { children: "\u5B9F\u969B\u306E\u30C7\u30FC\u30BF\u767B\u9332\u306F\u53EF\u80FD" })] })] }) }), _jsx("div", { className: "mt-3 p-3 bg-white bg-opacity-10 rounded-lg", children: _jsxs("details", { className: "group", children: [_jsxs("summary", { className: "cursor-pointer text-sm font-medium flex items-center gap-2", children: [_jsx("span", { children: "\uD83D\uDD12 \u30C7\u30E2\u30E2\u30FC\u30C9\u306E\u5236\u9650\u4E8B\u9805" }), _jsx("span", { className: "group-open:rotate-180 transition-transform", children: "\u25BC" })] }), _jsxs("div", { className: "mt-2 text-xs space-y-1 text-purple-100", children: [_jsx("p", { children: "\u2022 LINE\u30FBInstagram\u30FBSMS\u30FB\u30E1\u30FC\u30EB\u9001\u4FE1\u6A5F\u80FD\u306F\u7121\u52B9\u5316\u3055\u308C\u3066\u3044\u307E\u3059" }), _jsx("p", { children: "\u2022 AI\u5206\u6790\u6A5F\u80FD\u306F\u5236\u9650\u3055\u308C\u3066\u3044\u307E\u3059\uFF08\u57FA\u672C\u5206\u6790\u306E\u307F\u5229\u7528\u53EF\u80FD\uFF09" }), _jsx("p", { children: "\u2022 \u6C7A\u6E08\u30FB\u8AB2\u91D1\u6A5F\u80FD\u306F\u7121\u52B9\u5316\u3055\u308C\u3066\u3044\u307E\u3059" }), _jsx("p", { children: "\u2022 \u30D7\u30C3\u30B7\u30E5\u901A\u77E5\u306F\u5236\u9650\u3055\u308C\u3066\u3044\u307E\u3059" }), _jsx("p", { children: "\u2022 CSV\u30A4\u30F3\u30DD\u30FC\u30C8\u30FB\u30A8\u30AF\u30B9\u30DD\u30FC\u30C8\u6A5F\u80FD\u306F\u5229\u7528\u53EF\u80FD\u3067\u3059" }), _jsxs("p", { children: ["\u2022 \u767B\u9332\u30C7\u30FC\u30BF\u306F", config.demoExpiryDays || 30, "\u65E5\u5F8C\u306B\u81EA\u52D5\u524A\u9664\u3055\u308C\u307E\u3059"] })] })] }) })] }) }), _jsx(DemoFeedbackForm, { isOpen: showFeedback, onClose: () => setShowFeedback(false), currentPage: currentPage })] }));
};
export default DemoBanner;
