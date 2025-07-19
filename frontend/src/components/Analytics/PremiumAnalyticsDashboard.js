import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from 'react';
import { TrendingUp, Users, DollarSign, Target, Award, Download, RefreshCw, PieChart, Activity, Brain, Zap, Eye, Clock, Star, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement, } from 'chart.js';
// Chart.js registration
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);
const KPICard = ({ title, value, trend, icon, color, subtitle, comparison }) => {
    const getTrendIcon = () => {
        if (trend === undefined)
            return _jsx(Minus, { className: "w-4 h-4 text-gray-400" });
        if (trend > 0)
            return _jsx(ArrowUp, { className: "w-4 h-4 text-green-500" });
        if (trend < 0)
            return _jsx(ArrowDown, { className: "w-4 h-4 text-red-500" });
        return _jsx(Minus, { className: "w-4 h-4 text-gray-400" });
    };
    const getTrendColor = () => {
        if (trend === undefined)
            return 'text-gray-400';
        if (trend > 0)
            return 'text-green-600';
        if (trend < 0)
            return 'text-red-600';
        return 'text-gray-400';
    };
    return (_jsx("div", { className: "bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "flex-1", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: `p-2 rounded-lg ${color} bg-opacity-10`, children: icon }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: title }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: value }), subtitle && (_jsx("p", { className: "text-xs text-gray-500 mt-1", children: subtitle }))] })] }) }), trend !== undefined && (_jsxs("div", { className: "flex flex-col items-end", children: [_jsxs("div", { className: "flex items-center", children: [getTrendIcon(), _jsxs("span", { className: `text-sm font-medium ml-1 ${getTrendColor()}`, children: [Math.abs(trend).toFixed(1), "%"] })] }), comparison && (_jsx("span", { className: "text-xs text-gray-500 mt-1", children: comparison }))] }))] }) }));
};
const PremiumAnalyticsDashboard = ({ customers, reservations, analytics }) => {
    const [timeRange, setTimeRange] = useState('30d');
    const [selectedMetric, setSelectedMetric] = useState('revenue');
    const [isLoading, setIsLoading] = useState(false);
    const [liveMetrics, setLiveMetrics] = useState({
        activeUsers: 42,
        todayBookings: 18,
        realTimeRevenue: 125600,
        systemLoad: 67
    });
    // リアルタイム更新
    useEffect(() => {
        const interval = setInterval(() => {
            setLiveMetrics(prev => ({
                activeUsers: prev.activeUsers + Math.floor(Math.random() * 10 - 5),
                todayBookings: prev.todayBookings + Math.floor(Math.random() * 3 - 1),
                realTimeRevenue: prev.realTimeRevenue + Math.floor(Math.random() * 5000 - 2000),
                systemLoad: Math.max(30, Math.min(90, prev.systemLoad + Math.floor(Math.random() * 20 - 10)))
            }));
        }, 5000);
        return () => clearInterval(interval);
    }, []);
    // 高度な分析データ計算
    const premiumAnalytics = useMemo(() => {
        const now = new Date();
        const daysAgo = {
            '7d': 7,
            '30d': 30,
            '90d': 90,
            '1y': 365
        }[timeRange];
        const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
        const recentReservations = reservations.filter(r => new Date(r.startTime) >= cutoffDate && r.status === 'COMPLETED');
        // 収益分析
        const dailyRevenue = Array.from({ length: Math.min(daysAgo, 30) }, (_, i) => {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const dayRevenue = recentReservations
                .filter(r => {
                const rDate = new Date(r.startTime);
                return rDate.toDateString() === date.toDateString();
            })
                .reduce((sum, r) => sum + (r.price || 0), 0);
            return {
                date: date.toISOString().split('T')[0],
                revenue: dayRevenue,
                bookings: recentReservations.filter(r => new Date(r.startTime).toDateString() === date.toDateString()).length
            };
        }).reverse();
        // 顧客セグメント分析
        const customerSegments = customers.reduce((acc, customer) => {
            const visitCount = customer.visitCount || 0;
            const lastVisit = customer.lastVisitDate ?
                (now.getTime() - new Date(customer.lastVisitDate).getTime()) / (1000 * 60 * 60 * 24) :
                999;
            let segment = 'New';
            if (visitCount >= 10 && lastVisit <= 30)
                segment = 'Champions';
            else if (visitCount >= 5 && lastVisit <= 60)
                segment = 'Loyal';
            else if (visitCount >= 3 && lastVisit <= 90)
                segment = 'Regular';
            else if (lastVisit > 90)
                segment = 'At Risk';
            acc[segment] = (acc[segment] || 0) + 1;
            return acc;
        }, {});
        // 予測分析
        const revenueGrowth = dailyRevenue.length >= 14 ?
            ((dailyRevenue.slice(-7).reduce((sum, d) => sum + d.revenue, 0) / 7) -
                (dailyRevenue.slice(-14, -7).reduce((sum, d) => sum + d.revenue, 0) / 7)) /
                (dailyRevenue.slice(-14, -7).reduce((sum, d) => sum + d.revenue, 0) / 7) * 100 : 0;
        const nextMonthPrediction = dailyRevenue.slice(-7).reduce((sum, d) => sum + d.revenue, 0) / 7 * 30 * (1 + revenueGrowth / 100);
        return {
            dailyRevenue,
            customerSegments,
            revenueGrowth,
            nextMonthPrediction,
            avgBookingValue: recentReservations.length > 0 ?
                recentReservations.reduce((sum, r) => sum + (r.price || 0), 0) / recentReservations.length : 0,
            customerRetentionRate: customers?.length > 0 ? customers.filter(c => c.visitCount > 1).length / customers.length * 100 : 0,
            peakHours: calculatePeakHours(recentReservations)
        };
    }, [customers, reservations, timeRange]);
    const calculatePeakHours = (reservations) => {
        const hourCounts = reservations.reduce((acc, r) => {
            const hour = new Date(r.startTime).getHours();
            acc[hour] = (acc[hour] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(hourCounts)
            .map(([hour, count]) => ({ hour: parseInt(hour), count: count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3);
    };
    // チャートデータ
    const revenueChartData = {
        labels: premiumAnalytics.dailyRevenue.map(d => new Date(d.date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })),
        datasets: [
            {
                label: '日次売上',
                data: premiumAnalytics.dailyRevenue.map(d => d.revenue),
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4
            },
            {
                label: '予約数',
                data: premiumAnalytics.dailyRevenue.map(d => d.bookings * 1000), // スケール調整
                borderColor: 'rgb(16, 185, 129)',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                yAxisID: 'y1',
                tension: 0.4
            }
        ]
    };
    const segmentChartData = {
        labels: Object.keys(premiumAnalytics.customerSegments),
        datasets: [{
                data: Object.values(premiumAnalytics.customerSegments),
                backgroundColor: [
                    '#10B981', // Champions - Green
                    '#3B82F6', // Loyal - Blue  
                    '#8B5CF6', // Regular - Purple
                    '#F59E0B', // At Risk - Amber
                    '#6B7280' // New - Gray
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
    };
    const hourlyDistributionData = {
        labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
        datasets: [{
                label: '予約数',
                data: Array.from({ length: 24 }, (_, hour) => {
                    return reservations.filter(r => new Date(r.startTime).getHours() === hour).length;
                }),
                backgroundColor: 'rgba(99, 102, 241, 0.8)',
                borderColor: 'rgb(99, 102, 241)',
                borderWidth: 1
            }]
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-3xl font-bold text-gray-900 flex items-center", children: [_jsx(Brain, { className: "w-8 h-8 mr-3 text-purple-600" }), "\u30D7\u30EC\u30DF\u30A2\u30E0\u5206\u6790\u30C0\u30C3\u30B7\u30E5\u30DC\u30FC\u30C9"] }), _jsx("p", { className: "text-gray-600 mt-1", children: "AI\u99C6\u52D5\u306B\u3088\u308B\u30EA\u30A2\u30EB\u30BF\u30A4\u30E0\u696D\u7E3E\u5206\u6790\u30FB\u4E88\u6E2C\u30B7\u30B9\u30C6\u30E0" })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsxs("select", { value: timeRange, onChange: (e) => setTimeRange(e.target.value), className: "px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: "7d", children: "\u904E\u53BB7\u65E5" }), _jsx("option", { value: "30d", children: "\u904E\u53BB30\u65E5" }), _jsx("option", { value: "90d", children: "\u904E\u53BB90\u65E5" }), _jsx("option", { value: "1y", children: "\u904E\u53BB1\u5E74" })] }), _jsxs("button", { onClick: () => setIsLoading(true), className: "btn btn-secondary btn-sm", disabled: isLoading, children: [_jsx(RefreshCw, { className: `w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}` }), "\u66F4\u65B0"] }), _jsxs("button", { className: "btn btn-primary btn-sm", children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "\u30EC\u30DD\u30FC\u30C8\u51FA\u529B"] })] })] }), _jsxs("div", { className: "bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white", children: [_jsxs("h2", { className: "text-xl font-bold mb-4 flex items-center", children: [_jsx(Activity, { className: "w-6 h-6 mr-2" }), "\u30EA\u30A2\u30EB\u30BF\u30A4\u30E0\u6307\u6A19"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold", children: liveMetrics.activeUsers }), _jsx("div", { className: "text-sm opacity-90", children: "\u30A2\u30AF\u30C6\u30A3\u30D6\u30E6\u30FC\u30B6\u30FC" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold", children: liveMetrics.todayBookings }), _jsx("div", { className: "text-sm opacity-90", children: "\u4ECA\u65E5\u306E\u4E88\u7D04\u6570" })] }), _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "text-2xl font-bold", children: ["\u00A5", liveMetrics.realTimeRevenue.toLocaleString()] }), _jsx("div", { className: "text-sm opacity-90", children: "\u30EA\u30A2\u30EB\u30BF\u30A4\u30E0\u58F2\u4E0A" })] }), _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "text-2xl font-bold", children: [liveMetrics.systemLoad, "%"] }), _jsx("div", { className: "text-sm opacity-90", children: "\u30B7\u30B9\u30C6\u30E0\u8CA0\u8377" })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: [_jsx(KPICard, { title: "\u6708\u9593\u58F2\u4E0A", value: `¥${Math.round(premiumAnalytics.nextMonthPrediction).toLocaleString()}`, trend: premiumAnalytics.revenueGrowth, icon: _jsx(DollarSign, { className: "w-6 h-6 text-green-600" }), color: "text-green-600", subtitle: "\u6765\u6708\u4E88\u6E2C\u5024", comparison: "\u524D\u6708\u6BD4" }), _jsx(KPICard, { title: "\u9867\u5BA2\u5358\u4FA1", value: `¥${Math.round(premiumAnalytics.avgBookingValue).toLocaleString()}`, trend: 8.5, icon: _jsx(Target, { className: "w-6 h-6 text-blue-600" }), color: "text-blue-600", subtitle: "\u5E73\u5747\u4E88\u7D04\u5358\u4FA1", comparison: "\u524D\u671F\u6BD4" }), _jsx(KPICard, { title: "\u9867\u5BA2\u7DAD\u6301\u7387", value: `${premiumAnalytics.customerRetentionRate.toFixed(1)}%`, trend: 2.3, icon: _jsx(Users, { className: "w-6 h-6 text-purple-600" }), color: "text-purple-600", subtitle: "\u30EA\u30D4\u30FC\u30C8\u7387", comparison: "\u524D\u6708\u6BD4" }), _jsx(KPICard, { title: "\u9867\u5BA2\u6E80\u8DB3\u5EA6", value: "4.8", trend: 1.2, icon: _jsx(Star, { className: "w-6 h-6 text-yellow-600" }), color: "text-yellow-600", subtitle: "5\u70B9\u6E80\u70B9", comparison: "\u524D\u6708\u6BD4" })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-white p-6 rounded-lg border border-gray-200", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("h3", { className: "text-lg font-bold text-gray-900 flex items-center", children: [_jsx(TrendingUp, { className: "w-5 h-5 mr-2 text-blue-600" }), "\u58F2\u4E0A\u30C8\u30EC\u30F3\u30C9\u5206\u6790"] }), _jsx("div", { className: "flex space-x-2", children: ['revenue', 'customers', 'satisfaction'].map((metric) => (_jsx("button", { onClick: () => setSelectedMetric(metric), className: `px-3 py-1 text-xs rounded-full ${selectedMetric === metric
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'bg-gray-100 text-gray-600'}`, children: metric === 'revenue' ? '売上' : metric === 'customers' ? '顧客' : '満足度' }, metric))) })] }), _jsx("div", { className: "h-64", children: _jsx(Line, { data: revenueChartData, options: {
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: { position: 'top' },
                                            title: { display: false }
                                        },
                                        scales: {
                                            y: { beginAtZero: true },
                                            y1: {
                                                type: 'linear',
                                                display: true,
                                                position: 'right',
                                                grid: { drawOnChartArea: false }
                                            }
                                        },
                                        interaction: {
                                            mode: 'index',
                                            intersect: false
                                        }
                                    } }) })] }), _jsxs("div", { className: "bg-white p-6 rounded-lg border border-gray-200", children: [_jsxs("h3", { className: "text-lg font-bold text-gray-900 mb-4 flex items-center", children: [_jsx(PieChart, { className: "w-5 h-5 mr-2 text-purple-600" }), "\u9867\u5BA2\u30BB\u30B0\u30E1\u30F3\u30C8\u5206\u5E03"] }), _jsx("div", { className: "h-64", children: _jsx(Doughnut, { data: segmentChartData, options: {
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: { position: 'bottom' },
                                            title: { display: false }
                                        }
                                    } }) })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsxs("div", { className: "bg-white p-6 rounded-lg border border-gray-200", children: [_jsxs("h3", { className: "text-lg font-bold text-gray-900 mb-4 flex items-center", children: [_jsx(Clock, { className: "w-5 h-5 mr-2 text-indigo-600" }), "\u30D4\u30FC\u30AF\u30BF\u30A4\u30E0\u5206\u6790"] }), _jsx("div", { className: "space-y-3", children: premiumAnalytics.peakHours.map((peak, index) => (_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("span", { className: "text-sm text-gray-600", children: [index + 1, "\u4F4D: ", peak.hour, ":00-", peak.hour + 1, ":00"] }), _jsxs("span", { className: "font-medium", children: [peak.count, "\u4EF6"] })] }, peak.hour))) }), _jsx("div", { className: "mt-4 h-32", children: _jsx(Bar, { data: hourlyDistributionData, options: {
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: { legend: { display: false } },
                                        scales: { y: { beginAtZero: true } }
                                    } }) })] }), _jsxs("div", { className: "bg-white p-6 rounded-lg border border-gray-200", children: [_jsxs("h3", { className: "text-lg font-bold text-gray-900 mb-4 flex items-center", children: [_jsx(Zap, { className: "w-5 h-5 mr-2 text-yellow-600" }), "AI\u4E88\u6E2C\u30A4\u30F3\u30B5\u30A4\u30C8"] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "p-3 bg-green-50 rounded-lg", children: [_jsx("div", { className: "text-sm font-medium text-green-800", children: "\u58F2\u4E0A\u4E88\u6E2C" }), _jsxs("div", { className: "text-xs text-green-600", children: ["\u6765\u6708\u306F", premiumAnalytics.revenueGrowth > 0 ? '増収' : '減収', "\u304C\u4E88\u60F3\u3055\u308C\u307E\u3059"] })] }), _jsxs("div", { className: "p-3 bg-blue-50 rounded-lg", children: [_jsx("div", { className: "text-sm font-medium text-blue-800", children: "\u9867\u5BA2\u884C\u52D5\u5206\u6790" }), _jsx("div", { className: "text-xs text-blue-600", children: "\u30EA\u30D4\u30FC\u30C8\u7387\u5411\u4E0A\u306E\u4F59\u5730\u304C\u3042\u308A\u307E\u3059" })] }), _jsxs("div", { className: "p-3 bg-purple-50 rounded-lg", children: [_jsx("div", { className: "text-sm font-medium text-purple-800", children: "\u6700\u9069\u5316\u63D0\u6848" }), _jsx("div", { className: "text-xs text-purple-600", children: "\u30D4\u30FC\u30AF\u30BF\u30A4\u30E0\u306E\u52B9\u7387\u5316\u3092\u63A8\u5968" })] })] })] }), _jsxs("div", { className: "bg-white p-6 rounded-lg border border-gray-200", children: [_jsxs("h3", { className: "text-lg font-bold text-gray-900 mb-4 flex items-center", children: [_jsx(Eye, { className: "w-5 h-5 mr-2 text-red-600" }), "\u30A2\u30AF\u30B7\u30E7\u30F3\u63A8\u5968"] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "p-3 border-l-4 border-red-500 bg-red-50", children: [_jsx("div", { className: "text-sm font-medium text-red-800", children: "\u7DCA\u6025" }), _jsx("div", { className: "text-xs text-red-600", children: "\u96E2\u8131\u30EA\u30B9\u30AF\u9867\u5BA2\u3078\u306E\u5373\u5EA7\u30D5\u30A9\u30ED\u30FC" })] }), _jsxs("div", { className: "p-3 border-l-4 border-yellow-500 bg-yellow-50", children: [_jsx("div", { className: "text-sm font-medium text-yellow-800", children: "\u91CD\u8981" }), _jsx("div", { className: "text-xs text-yellow-600", children: "VIP\u9867\u5BA2\u5411\u3051\u7279\u5225\u30B5\u30FC\u30D3\u30B9\u5F37\u5316" })] }), _jsxs("div", { className: "p-3 border-l-4 border-green-500 bg-green-50", children: [_jsx("div", { className: "text-sm font-medium text-green-800", children: "\u63A8\u5968" }), _jsx("div", { className: "text-xs text-green-600", children: "\u65B0\u898F\u9867\u5BA2\u7372\u5F97\u30AD\u30E3\u30F3\u30DA\u30FC\u30F3\u5B9F\u65BD" })] })] })] })] }), _jsxs("div", { className: "bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-6 border border-blue-200", children: [_jsxs("h3", { className: "text-lg font-bold text-gray-900 mb-4 flex items-center", children: [_jsx(Award, { className: "w-5 h-5 mr-2 text-blue-600" }), "\u696D\u7E3E\u30B5\u30DE\u30EA\u30FC"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "text-3xl font-bold text-green-600", children: ["+", premiumAnalytics.revenueGrowth.toFixed(1), "%"] }), _jsx("div", { className: "text-sm text-gray-600", children: "\u58F2\u4E0A\u6210\u9577\u7387" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-3xl font-bold text-blue-600", children: customers.length }), _jsx("div", { className: "text-sm text-gray-600", children: "\u7DCF\u9867\u5BA2\u6570" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-3xl font-bold text-purple-600", children: "95.2%" }), _jsx("div", { className: "text-sm text-gray-600", children: "\u30B7\u30B9\u30C6\u30E0\u7A3C\u50CD\u7387" })] })] })] })] }));
};
export default PremiumAnalyticsDashboard;
