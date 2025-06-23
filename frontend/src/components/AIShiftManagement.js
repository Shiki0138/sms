import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Bot, Users, TrendingUp, Clock, Star, Sparkles, BarChart3, Brain, RefreshCw, Zap, CheckCircle, Download, Eye } from 'lucide-react';
const AIShiftManagement = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [predictions, setPredictions] = useState([]);
    const [optimizedShifts, setOptimizedShifts] = useState([]);
    const [staffMembers] = useState([
        {
            id: '1',
            name: '田中美咲',
            skills: ['カット', 'カラー', 'パーマ'],
            rating: 4.8,
            hourlyRate: 2500,
            availability: {}
        },
        {
            id: '2',
            name: '佐藤健太',
            skills: ['カット', 'スタイリング'],
            rating: 4.6,
            hourlyRate: 2200,
            availability: {}
        },
        {
            id: '3',
            name: '鈴木花子',
            skills: ['カラー', 'トリートメント', 'ヘッドスパ'],
            rating: 4.9,
            hourlyRate: 2800,
            availability: {}
        }
    ]);
    const generatePredictions = async () => {
        setIsLoading(true);
        setTimeout(() => {
            const mockPredictions = [];
            for (let hour = 9; hour < 20; hour++) {
                const baseCustomers = Math.random() * 8 + 2;
                const weekendBonus = new Date(selectedDate).getDay() === 0 || new Date(selectedDate).getDay() === 6 ? 1.3 : 1;
                const peakHourBonus = (hour >= 14 && hour <= 18) ? 1.5 : 1;
                mockPredictions.push({
                    date: selectedDate,
                    hour,
                    expectedCustomers: Math.round(baseCustomers * weekendBonus * peakHourBonus),
                    confidence: Math.random() * 20 + 80,
                    recommendedStaff: Math.ceil((baseCustomers * weekendBonus * peakHourBonus) / 3)
                });
            }
            setPredictions(mockPredictions);
            setIsLoading(false);
        }, 2000);
    };
    const optimizeShifts = async () => {
        setIsLoading(true);
        setTimeout(() => {
            const mockShifts = [
                {
                    staffId: '1',
                    staffName: '田中美咲',
                    date: selectedDate,
                    startTime: '09:00',
                    endTime: '18:00',
                    expectedRevenue: 48000,
                    customerCount: 12,
                    efficiency: 94
                },
                {
                    staffId: '2',
                    staffName: '佐藤健太',
                    date: selectedDate,
                    startTime: '10:00',
                    endTime: '19:00',
                    expectedRevenue: 38000,
                    customerCount: 10,
                    efficiency: 87
                },
                {
                    staffId: '3',
                    staffName: '鈴木花子',
                    date: selectedDate,
                    startTime: '13:00',
                    endTime: '20:00',
                    expectedRevenue: 42000,
                    customerCount: 8,
                    efficiency: 91
                }
            ];
            setOptimizedShifts(mockShifts);
            setIsLoading(false);
        }, 3000);
    };
    useEffect(() => {
        generatePredictions();
    }, [selectedDate]);
    const totalRevenue = optimizedShifts.reduce((sum, shift) => sum + shift.expectedRevenue, 0);
    const totalCustomers = optimizedShifts.reduce((sum, shift) => sum + shift.customerCount, 0);
    const avgEfficiency = optimizedShifts.length > 0
        ? optimizedShifts.reduce((sum, shift) => sum + shift.efficiency, 0) / optimizedShifts.length
        : 0;
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white", children: [_jsxs("div", { className: "flex items-center space-x-3 mb-4", children: [_jsx("div", { className: "p-3 bg-white/20 rounded-lg", children: _jsx(Bot, { className: "w-8 h-8" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold", children: "AI\u30B7\u30D5\u30C8\u6700\u9069\u5316\u30B7\u30B9\u30C6\u30E0" }), _jsx("p", { className: "text-purple-100", children: "\u9769\u65B0\u7684\u306A\u4E88\u6E2C\u6280\u8853\u3067\u58F2\u4E0A\u3092\u6700\u5927\u5316" })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "bg-white/10 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(TrendingUp, { className: "w-5 h-5" }), _jsx("span", { className: "font-medium", children: "\u4E88\u60F3\u58F2\u4E0A\u5411\u4E0A" })] }), _jsx("p", { className: "text-2xl font-bold mt-1", children: "+18%" })] }), _jsxs("div", { className: "bg-white/10 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Clock, { className: "w-5 h-5" }), _jsx("span", { className: "font-medium", children: "\u52B9\u7387\u6700\u9069\u5316" })] }), _jsx("p", { className: "text-2xl font-bold mt-1", children: "92%" })] }), _jsxs("div", { className: "bg-white/10 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Users, { className: "w-5 h-5" }), _jsx("span", { className: "font-medium", children: "\u9867\u5BA2\u6E80\u8DB3\u5EA6" })] }), _jsx("p", { className: "text-2xl font-bold mt-1", children: "4.9\u2605" })] })] })] }), _jsxs("div", { className: "bg-white rounded-lg shadow border", children: [_jsx("div", { className: "flex border-b", children: [
                            { id: 'overview', label: '概要', icon: Eye },
                            { id: 'predictions', label: 'AI予測', icon: Brain },
                            { id: 'optimization', label: 'シフト最適化', icon: Zap },
                            { id: 'analytics', label: '分析レポート', icon: BarChart3 }
                        ].map((tab) => (_jsxs("button", { onClick: () => setActiveTab(tab.id), className: `flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${activeTab === tab.id
                                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'}`, children: [_jsx(tab.icon, { className: "w-5 h-5" }), _jsx("span", { children: tab.label })] }, tab.id))) }), _jsxs("div", { className: "p-6", children: [activeTab === 'overview' && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsx("div", { className: "bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-blue-600 font-medium", children: "\u4ECA\u65E5\u306E\u4E88\u60F3\u58F2\u4E0A" }), _jsxs("p", { className: "text-2xl font-bold text-blue-800", children: ["\u00A5", totalRevenue.toLocaleString()] })] }), _jsx(TrendingUp, { className: "w-8 h-8 text-blue-600" })] }) }), _jsx("div", { className: "bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-green-600 font-medium", children: "\u4E88\u60F3\u6765\u5BA2\u6570" }), _jsxs("p", { className: "text-2xl font-bold text-green-800", children: [totalCustomers, "\u540D"] })] }), _jsx(Users, { className: "w-8 h-8 text-green-600" })] }) }), _jsx("div", { className: "bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-purple-600 font-medium", children: "\u5E73\u5747\u52B9\u7387" }), _jsxs("p", { className: "text-2xl font-bold text-purple-800", children: [avgEfficiency.toFixed(1), "%"] })] }), _jsx(Zap, { className: "w-8 h-8 text-purple-600" })] }) }), _jsx("div", { className: "bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-yellow-600 font-medium", children: "\u7A3C\u50CD\u30B9\u30BF\u30C3\u30D5" }), _jsxs("p", { className: "text-2xl font-bold text-yellow-800", children: [optimizedShifts.length, "\u540D"] })] }), _jsx(Star, { className: "w-8 h-8 text-yellow-600" })] }) })] }), _jsxs("div", { className: "bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200", children: [_jsxs("h3", { className: "text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2", children: [_jsx(Sparkles, { className: "w-5 h-5 text-purple-600" }), _jsx("span", { children: "AI\u6700\u9069\u5316\u306E\u52B9\u679C" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-3xl font-bold text-purple-600", children: "18%" }), _jsx("div", { className: "text-sm text-gray-600", children: "\u58F2\u4E0A\u5411\u4E0A" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-3xl font-bold text-blue-600", children: "25%" }), _jsx("div", { className: "text-sm text-gray-600", children: "\u4EBA\u4EF6\u8CBB\u524A\u6E1B" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-3xl font-bold text-green-600", children: "40%" }), _jsx("div", { className: "text-sm text-gray-600", children: "\u6E80\u8DB3\u5EA6\u5411\u4E0A" })] })] })] })] })), activeTab === 'predictions' && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "text-lg font-bold text-gray-900", children: "\u6765\u5BA2\u6570\u4E88\u6E2C" }), _jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("input", { type: "date", value: selectedDate, onChange: (e) => setSelectedDate(e.target.value), className: "border border-gray-300 rounded-lg px-3 py-2" }), _jsxs("button", { onClick: generatePredictions, disabled: isLoading, className: "bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2", children: [isLoading ? _jsx(RefreshCw, { className: "w-4 h-4 animate-spin" }) : _jsx(Brain, { className: "w-4 h-4" }), _jsx("span", { children: "AI\u4E88\u6E2C\u5B9F\u884C" })] })] })] }), _jsxs("div", { className: "bg-white border rounded-lg overflow-hidden", children: [_jsx("div", { className: "px-6 py-4 bg-gray-50 border-b", children: _jsx("h4", { className: "font-medium text-gray-900", children: "\u6642\u9593\u5225\u4E88\u6E2C\u30C7\u30FC\u30BF" }) }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "\u6642\u9593" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "\u4E88\u60F3\u6765\u5BA2\u6570" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "\u4FE1\u983C\u5EA6" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "\u63A8\u5968\u30B9\u30BF\u30C3\u30D5\u6570" })] }) }), _jsx("tbody", { className: "divide-y divide-gray-200", children: predictions.map((pred) => (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsxs("td", { className: "px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900", children: [pred.hour, ":00 - ", pred.hour + 1, ":00"] }), _jsxs("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900", children: [pred.expectedCustomers, "\u540D"] }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "w-16 bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "bg-green-600 h-2 rounded-full", style: { width: `${pred.confidence}%` } }) }), _jsxs("span", { children: [pred.confidence.toFixed(1), "%"] })] }) }), _jsxs("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900", children: [pred.recommendedStaff, "\u540D"] })] }, pred.hour))) })] }) })] })] })), activeTab === 'optimization' && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "text-lg font-bold text-gray-900", children: "\u6700\u9069\u5316\u30B7\u30D5\u30C8\u63D0\u6848" }), _jsxs("button", { onClick: optimizeShifts, disabled: isLoading, className: "bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors flex items-center space-x-2", children: [isLoading ? _jsx(RefreshCw, { className: "w-4 h-4 animate-spin" }) : _jsx(Zap, { className: "w-4 h-4" }), _jsx("span", { children: "\u6700\u9069\u5316\u5B9F\u884C" })] })] }), optimizedShifts.length > 0 && (_jsx("div", { className: "space-y-4", children: optimizedShifts.map((shift) => (_jsxs("div", { className: "bg-white border rounded-lg p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold", children: shift.staffName.charAt(0) }), _jsxs("div", { children: [_jsx("h4", { className: "font-bold text-lg text-gray-900", children: shift.staffName }), _jsxs("p", { className: "text-sm text-gray-600", children: [shift.startTime, " - ", shift.endTime] })] })] }), _jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("div", { className: "text-right", children: [_jsxs("p", { className: "text-lg font-bold text-green-600", children: ["\u00A5", shift.expectedRevenue.toLocaleString()] }), _jsx("p", { className: "text-sm text-gray-500", children: "\u4E88\u60F3\u58F2\u4E0A" })] }), _jsxs("div", { className: "text-right", children: [_jsxs("p", { className: "text-lg font-bold text-blue-600", children: [shift.customerCount, "\u540D"] }), _jsx("p", { className: "text-sm text-gray-500", children: "\u4E88\u60F3\u6765\u5BA2" })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "flex items-center space-x-1", children: [_jsxs("span", { className: "text-lg font-bold text-purple-600", children: [shift.efficiency, "%"] }), _jsx(CheckCircle, { className: "w-5 h-5 text-green-500" })] }), _jsx("p", { className: "text-sm text-gray-500", children: "\u52B9\u7387" })] })] })] }), _jsx("div", { className: "bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "\u6700\u9069\u914D\u7F6E\u7406\u7531\uFF1A" }), _jsx("span", { className: "font-medium text-gray-900", children: "\u30D4\u30FC\u30AF\u6642\u9593\u5BFE\u5FDC" })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "\u30B9\u30AD\u30EB\u30DE\u30C3\u30C1\uFF1A" }), _jsx("span", { className: "font-medium text-gray-900", children: "97%" })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "\u9867\u5BA2\u8A55\u4FA1\uFF1A" }), _jsxs("span", { className: "font-medium text-gray-900", children: [staffMembers.find(s => s.id === shift.staffId)?.rating, "\u2605"] })] })] }) })] }, shift.staffId))) }))] })), activeTab === 'analytics' && (_jsxs("div", { className: "space-y-6", children: [_jsx("h3", { className: "text-lg font-bold text-gray-900", children: "AI\u30B7\u30D5\u30C8\u6700\u9069\u5316\u30EC\u30DD\u30FC\u30C8" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-white border rounded-lg p-6", children: [_jsx("h4", { className: "font-bold text-gray-900 mb-4", children: "\u9031\u9593\u30D1\u30D5\u30A9\u30FC\u30DE\u30F3\u30B9" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-gray-600", children: "\u58F2\u4E0A\u5411\u4E0A\u7387" }), _jsx("span", { className: "font-bold text-green-600", children: "+18.2%" })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-gray-600", children: "\u4EBA\u4EF6\u8CBB\u52B9\u7387" }), _jsx("span", { className: "font-bold text-blue-600", children: "+24.7%" })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-gray-600", children: "\u9867\u5BA2\u6E80\u8DB3\u5EA6" }), _jsx("span", { className: "font-bold text-purple-600", children: "4.9\u2605" })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-gray-600", children: "\u4E88\u7D04\u53D6\u308A\u3053\u307C\u3057" }), _jsx("span", { className: "font-bold text-red-600", children: "-32%" })] })] })] }), _jsxs("div", { className: "bg-white border rounded-lg p-6", children: [_jsx("h4", { className: "font-bold text-gray-900 mb-4", children: "ROI\u5206\u6790" }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-4xl font-bold text-green-600 mb-2", children: "312%" }), _jsx("p", { className: "text-gray-600 mb-4", children: "\u6295\u8CC7\u53CE\u76CA\u7387" }), _jsx("div", { className: "bg-green-50 rounded-lg p-4", children: _jsxs("p", { className: "text-sm text-green-700", children: ["AI\u30B7\u30D5\u30C8\u6700\u9069\u5316\u306B\u3088\u308A\u3001", _jsx("br", {}), "\u6708\u9593\u7D04", _jsx("span", { className: "font-bold", children: "\u00A5480,000" }), "\u306E", _jsx("br", {}), "\u8FFD\u52A0\u5229\u76CA\u3092\u5275\u51FA"] }) })] })] })] }), _jsxs("div", { className: "bg-white border rounded-lg p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h4", { className: "font-bold text-gray-900", children: "\u8A73\u7D30\u30EC\u30DD\u30FC\u30C8" }), _jsxs("button", { className: "bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2", children: [_jsx(Download, { className: "w-4 h-4" }), _jsx("span", { children: "\u30A8\u30AF\u30B9\u30DD\u30FC\u30C8" })] })] }), _jsx("div", { className: "bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6", children: _jsxs("div", { className: "text-center", children: [_jsx(Brain, { className: "w-16 h-16 text-purple-600 mx-auto mb-4" }), _jsx("h5", { className: "text-xl font-bold text-gray-900 mb-2", children: "\u9769\u65B0\u7684\u306AAI\u6280\u8853\u3067\u7D4C\u55B6\u3092\u5909\u9769" }), _jsx("p", { className: "text-gray-600 max-w-2xl mx-auto", children: "\u904E\u53BB3\u5E74\u9593\u306E\u30C7\u30FC\u30BF\u3001\u5929\u5019\u30D1\u30BF\u30FC\u30F3\u3001\u9867\u5BA2\u884C\u52D5\u5206\u6790\u3092\u57FA\u306B\u3001 \u6700\u9069\u306A\u30B9\u30BF\u30C3\u30D5\u914D\u7F6E\u3068\u58F2\u4E0A\u6700\u5927\u5316\u3092\u5B9F\u73FE\u3057\u307E\u3059\u3002" })] }) })] })] }))] })] })] }));
};
export default AIShiftManagement;
