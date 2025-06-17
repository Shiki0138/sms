import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, Suspense, lazy } from 'react';
import { BarChart3, Users, DollarSign, TrendingUp, Lightbulb, Download, Target } from 'lucide-react';
// 遅延読み込みで各分析コンポーネントをインポート
const RFMAnalysis = lazy(() => import('./RFMAnalysis'));
const CohortAnalysis = lazy(() => import('./CohortAnalysis'));
const LTVAnalysis = lazy(() => import('./LTVAnalysis'));
const SalesDashboard = lazy(() => import('./SalesDashboard'));
const MarketingAISuggestions = lazy(() => import('./MarketingAISuggestions'));
const ReportExporter = lazy(() => import('./ReportExporter'));
const AnalyticsHub = ({ customers, reservations }) => {
    const [activeView, setActiveView] = useState('overview');
    const [isReportExporterOpen, setIsReportExporterOpen] = useState(false);
    // 分析メニュー定義
    const analyticsMenus = [
        {
            id: 'overview',
            title: '分析概要',
            description: '全体的な分析結果の概要',
            icon: BarChart3,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200'
        },
        {
            id: 'rfm',
            title: 'RFM分析',
            description: '顧客セグメント分析',
            icon: Users,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            borderColor: 'border-purple-200'
        },
        {
            id: 'cohort',
            title: 'コホート分析',
            description: '顧客継続率分析',
            icon: TrendingUp,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200'
        },
        {
            id: 'ltv',
            title: 'LTV分析',
            description: '顧客生涯価値分析',
            icon: DollarSign,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50',
            borderColor: 'border-yellow-200'
        },
        {
            id: 'sales',
            title: '売上分析',
            description: '売上・パフォーマンス分析',
            icon: BarChart3,
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50',
            borderColor: 'border-indigo-200'
        },
        {
            id: 'marketing',
            title: 'AI提案',
            description: 'マーケティング施策提案',
            icon: Lightbulb,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
            borderColor: 'border-orange-200'
        }
    ];
    // 基本統計の計算
    const basicStats = React.useMemo(() => {
        const completedReservations = reservations.filter(r => r.status === 'COMPLETED' && r.price);
        const totalRevenue = completedReservations.reduce((sum, r) => sum + (r.price || 0), 0);
        const avgOrderValue = completedReservations.length > 0 ? totalRevenue / completedReservations.length : 0;
        const currentDate = new Date();
        const activeCustomers = customers.filter(c => {
            if (!c.lastVisitDate)
                return false;
            const daysSince = Math.floor((currentDate.getTime() - new Date(c.lastVisitDate).getTime()) / (1000 * 60 * 60 * 24));
            return daysSince <= 90;
        }).length;
        return {
            totalCustomers: customers.length,
            activeCustomers,
            totalReservations: completedReservations.length,
            totalRevenue,
            avgOrderValue,
            customerRetentionRate: customers.length > 0 ? (activeCustomers / customers.length) * 100 : 0
        };
    }, [customers, reservations]);
    // ローディングコンポーネント
    const LoadingSpinner = () => (_jsxs("div", { className: "flex items-center justify-center py-12", children: [_jsx("div", { className: "animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" }), _jsx("span", { className: "ml-3 text-gray-600", children: "\u5206\u6790\u30C7\u30FC\u30BF\u3092\u8AAD\u307F\u8FBC\u307F\u4E2D..." })] }));
    // 概要ビューの描画
    const renderOverview = () => (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsx("div", { className: "bg-white p-6 rounded-lg border border-gray-200", children: _jsxs("div", { className: "flex items-center", children: [_jsx(Users, { className: "w-8 h-8 text-blue-600" }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "\u7DCF\u9867\u5BA2\u6570" }), _jsxs("p", { className: "text-2xl font-bold text-gray-900", children: [basicStats.totalCustomers, "\u540D"] }), _jsxs("p", { className: "text-sm text-green-600", children: ["\u30A2\u30AF\u30C6\u30A3\u30D6: ", basicStats.activeCustomers, "\u540D (", basicStats.customerRetentionRate.toFixed(1), "%)"] })] })] }) }), _jsx("div", { className: "bg-white p-6 rounded-lg border border-gray-200", children: _jsxs("div", { className: "flex items-center", children: [_jsx(BarChart3, { className: "w-8 h-8 text-green-600" }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "\u7DCF\u58F2\u4E0A" }), _jsxs("p", { className: "text-2xl font-bold text-gray-900", children: ["\u00A5", basicStats.totalRevenue.toLocaleString()] }), _jsxs("p", { className: "text-sm text-blue-600", children: [basicStats.totalReservations, "\u4EF6\u306E\u4E88\u7D04"] })] })] }) }), _jsx("div", { className: "bg-white p-6 rounded-lg border border-gray-200", children: _jsxs("div", { className: "flex items-center", children: [_jsx(DollarSign, { className: "w-8 h-8 text-purple-600" }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "\u5E73\u5747\u5BA2\u5358\u4FA1" }), _jsxs("p", { className: "text-2xl font-bold text-gray-900", children: ["\u00A5", Math.round(basicStats.avgOrderValue).toLocaleString()] })] })] }) })] }), _jsxs("div", { className: "bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6", children: [_jsxs("h3", { className: "text-lg font-bold text-gray-900 mb-4 flex items-center", children: [_jsx(Target, { className: "w-5 h-5 mr-2 text-blue-600" }), "\u5206\u6790\u6A5F\u80FD\u4E00\u89A7"] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: analyticsMenus.filter(menu => menu.id !== 'overview').map((menu) => {
                            const Icon = menu.icon;
                            return (_jsxs("button", { onClick: () => setActiveView(menu.id), className: `p-4 rounded-lg border-2 transition-all text-left hover:shadow-md ${menu.bgColor} ${menu.borderColor}`, children: [_jsxs("div", { className: "flex items-center mb-2", children: [_jsx(Icon, { className: `w-6 h-6 mr-3 ${menu.color}` }), _jsx("h4", { className: "font-medium text-gray-900", children: menu.title })] }), _jsx("p", { className: "text-sm text-gray-600", children: menu.description })] }, menu.id));
                        }) })] }), _jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [_jsx("h3", { className: "text-lg font-bold text-gray-900 mb-4", children: "\u30AF\u30A4\u30C3\u30AF\u30A4\u30F3\u30B5\u30A4\u30C8" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-medium text-green-700 mb-2", children: "\uD83C\uDFAF \u5F37\u307F" }), _jsxs("ul", { className: "text-sm space-y-1 text-gray-700", children: [_jsxs("li", { children: ["\u2022 \u9867\u5BA2\u7D99\u7D9A\u7387: ", basicStats.customerRetentionRate.toFixed(1), "%"] }), _jsxs("li", { children: ["\u2022 \u5E73\u5747\u5BA2\u5358\u4FA1: \u00A5", Math.round(basicStats.avgOrderValue).toLocaleString()] }), _jsx("li", { children: "\u2022 \u5B89\u5B9A\u3057\u305F\u4E88\u7D04\u4EF6\u6570" })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-orange-700 mb-2", children: "\uD83D\uDCC8 \u6539\u5584\u6A5F\u4F1A" }), _jsxs("ul", { className: "text-sm space-y-1 text-gray-700", children: [_jsx("li", { children: "\u2022 \u65B0\u898F\u9867\u5BA2\u306E\u7D99\u7D9A\u7387\u5411\u4E0A" }), _jsx("li", { children: "\u2022 \u9AD8\u5358\u4FA1\u30E1\u30CB\u30E5\u30FC\u306E\u63D0\u6848\u5F37\u5316" }), _jsx("li", { children: "\u2022 \u30C7\u30B8\u30BF\u30EB\u30DE\u30FC\u30B1\u30C6\u30A3\u30F3\u30B0\u6D3B\u7528" })] })] })] })] })] }));
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx("div", { className: "bg-white border-b border-gray-200", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: _jsxs("div", { className: "flex items-center justify-between h-16", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(BarChart3, { className: "w-8 h-8 text-blue-600 mr-3" }), _jsxs("div", { children: [_jsx("h1", { className: "text-xl font-bold text-gray-900", children: "\u5206\u6790\u30C0\u30C3\u30B7\u30E5\u30DC\u30FC\u30C9" }), _jsx("p", { className: "text-sm text-gray-600", children: "\u9AD8\u5EA6\u306A\u9867\u5BA2\u30FB\u58F2\u4E0A\u5206\u6790" })] })] }), _jsx("div", { className: "flex items-center space-x-3", children: _jsxs("button", { onClick: () => setIsReportExporterOpen(true), className: "btn btn-primary btn-sm", children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "\u30EC\u30DD\u30FC\u30C8\u51FA\u529B"] }) })] }) }) }), _jsx("div", { className: "bg-white border-b border-gray-200", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: _jsx("div", { className: "flex space-x-8 overflow-x-auto py-3", children: analyticsMenus.map((menu) => {
                            const Icon = menu.icon;
                            return (_jsxs("button", { onClick: () => setActiveView(menu.id), className: `flex items-center px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${activeView === menu.id
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`, children: [_jsx(Icon, { className: "w-4 h-4 mr-2" }), menu.title] }, menu.id));
                        }) }) }) }), _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: _jsxs(Suspense, { fallback: _jsx(LoadingSpinner, {}), children: [activeView === 'overview' && renderOverview(), activeView === 'rfm' && _jsx(RFMAnalysis, { customers: customers, reservations: reservations }), activeView === 'cohort' && _jsx(CohortAnalysis, { customers: customers, reservations: reservations }), activeView === 'ltv' && _jsx(LTVAnalysis, { customers: customers, reservations: reservations }), activeView === 'sales' && _jsx(SalesDashboard, { customers: customers, reservations: reservations, serviceHistory: [] }), activeView === 'marketing' && _jsx(MarketingAISuggestions, { customers: customers, reservations: reservations })] }) }), _jsx(Suspense, { fallback: null, children: _jsx(ReportExporter, { customers: customers, reservations: reservations, isOpen: isReportExporterOpen, onClose: () => setIsReportExporterOpen(false) }) })] }));
};
export default AnalyticsHub;
