import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Clock, Users, Zap } from 'lucide-react';
const PremiumCounter = ({ initialSlots = 7, initialHours = 72 }) => {
    const [remainingSlots, setRemainingSlots] = useState(initialSlots);
    const [timeLeft, setTimeLeft] = useState(initialHours * 3600); // 秒単位
    // カウントダウンタイマー
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
        }, 1000);
        return () => clearInterval(timer);
    }, []);
    // ランダムに枠数を減らす演出
    useEffect(() => {
        const slotTimer = setInterval(() => {
            if (remainingSlots > 1 && Math.random() < 0.1) { // 10%の確率で枠が減る
                setRemainingSlots(prev => prev - 1);
            }
        }, 30000); // 30秒ごとに判定
        return () => clearInterval(slotTimer);
    }, [remainingSlots]);
    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    const getUrgencyColor = () => {
        if (remainingSlots <= 3)
            return 'from-red-500 to-red-700';
        if (remainingSlots <= 5)
            return 'from-orange-500 to-red-500';
        return 'from-yellow-500 to-orange-500';
    };
    const getUrgencyText = () => {
        if (remainingSlots <= 3)
            return '🚨 緊急 🚨';
        if (remainingSlots <= 5)
            return '⚡ 急いで ⚡';
        return '🔥 人気 🔥';
    };
    return (_jsxs("div", { className: "bg-black bg-opacity-50 backdrop-blur-sm border border-yellow-400 rounded-2xl p-6 text-center", children: [_jsxs("div", { className: `inline-flex items-center bg-gradient-to-r ${getUrgencyColor()} text-white font-bold px-6 py-2 rounded-full text-lg mb-4 animate-pulse`, children: [getUrgencyText(), " \u9650\u5B9A20\u540D\u69D8 \u7279\u5225\u5148\u884C\u4F53\u9A13"] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6", children: [_jsxs("div", { className: "bg-gradient-to-br from-red-600 to-red-700 rounded-xl p-4 text-white relative overflow-hidden", children: [_jsx("div", { className: "absolute inset-0 bg-white bg-opacity-10 animate-pulse" }), _jsxs("div", { className: "relative z-10", children: [_jsx(Users, { className: "w-8 h-8 mx-auto mb-2" }), _jsx("div", { className: "text-3xl font-bold mb-1", children: remainingSlots }), _jsx("div", { className: "text-sm opacity-90", children: "\u6B8B\u308A\u67A0" })] })] }), _jsxs("div", { className: "bg-gradient-to-br from-orange-600 to-red-600 rounded-xl p-4 text-white relative overflow-hidden", children: [_jsx("div", { className: "absolute inset-0 bg-white bg-opacity-10 animate-pulse" }), _jsxs("div", { className: "relative z-10", children: [_jsx(Clock, { className: "w-8 h-8 mx-auto mb-2" }), _jsx("div", { className: "text-2xl font-bold mb-1 font-mono", children: formatTime(timeLeft) }), _jsx("div", { className: "text-sm opacity-90", children: "\u6B8B\u308A\u6642\u9593" })] })] })] }), _jsx("div", { className: "bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-3 text-white mb-4", children: _jsxs("div", { className: "flex items-center justify-center", children: [_jsx(Zap, { className: "w-5 h-5 mr-2 animate-pulse" }), _jsxs("span", { className: "text-sm", children: ["\u73FE\u5728 ", _jsx("span", { className: "font-bold text-lg", children: 20 - remainingSlots }), " \u540D\u304C\u7533\u8FBC\u6E08\u307F"] })] }) }), _jsx("div", { className: "text-yellow-300 text-sm font-medium", children: timeLeft <= 3600 ? (_jsx("span", { className: "animate-pulse", children: "\u26A0\uFE0F \u6B8B\u308A1\u6642\u9593\u3092\u5207\u308A\u307E\u3057\u305F\uFF01" })) : timeLeft <= 7200 ? (_jsx("span", { children: "\u23F0 \u6B8B\u308A2\u6642\u9593\u4EE5\u5185\u306B\u53D7\u4ED8\u7D42\u4E86\u4E88\u5B9A" })) : (_jsx("span", { children: "\u3053\u306E\u30AA\u30D5\u30A1\u30FC\u306F\u9650\u5B9A\u671F\u9593\u306E\u307F\u3067\u3059" })) }), _jsx("div", { className: "mt-4 bg-gray-700 rounded-full h-3 overflow-hidden", children: _jsx("div", { className: "bg-gradient-to-r from-red-500 to-yellow-500 h-full transition-all duration-1000 ease-out", style: { width: `${((20 - remainingSlots) / 20) * 100}%` } }) }), _jsxs("div", { className: "text-gray-300 text-xs mt-2", children: ["\u57CB\u307E\u308A\u5177\u5408: ", Math.round(((20 - remainingSlots) / 20) * 100), "%"] })] }));
};
export default PremiumCounter;
