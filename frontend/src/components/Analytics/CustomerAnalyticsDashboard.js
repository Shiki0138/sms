import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Users, TrendingUp, DollarSign, UserCheck, AlertTriangle, Download } from 'lucide-react';
import FeatureGate from '../Common/FeatureGate';
// Chart.js設定
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);
const CustomerAnalyticsDashboardCore = () => {
    const [analyticsData, setAnalyticsData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('3months');
    useEffect(() => {
        fetchAnalyticsData();
    }, [timeRange]);
    const fetchAnalyticsData = async () => {
        setIsLoading(true);
        try {
            // 実際の顧客データと施術履歴データを使用した分析
            const customers = window.dummyCustomers || [];
            const serviceHistory = window.serviceHistory || [];
            const realAnalyticsData = generateRealAnalyticsData(customers, serviceHistory);
            setAnalyticsData(realAnalyticsData);
        }
        catch (error) {
            console.error('Analytics calculation error:', error);
            // フォールバック
            setAnalyticsData(generateDemoData());
        }
        finally {
            setIsLoading(false);
        }
    };
    const generateRealAnalyticsData = (customers, serviceHistory) => {
        // 顧客セグメント分析
        const vipCustomers = customers.filter(c => c.visitCount >= 15);
        const regularCustomers = customers.filter(c => c.visitCount >= 5 && c.visitCount < 15);
        const newCustomers = customers.filter(c => c.visitCount < 5);
        const segments = [
            {
                name: 'VIP顧客',
                count: vipCustomers.length,
                percentage: Math.round((vipCustomers.length / customers.length) * 100),
                color: '#8B5CF6'
            },
            {
                name: '常連顧客',
                count: regularCustomers.length,
                percentage: Math.round((regularCustomers.length / customers.length) * 100),
                color: '#3B82F6'
            },
            {
                name: '新規顧客',
                count: newCustomers.length,
                percentage: Math.round((newCustomers.length / customers.length) * 100),
                color: '#10B981'
            }
        ];
        // 月別売上分析（直近6ヶ月）
        const monthlyData = generateMonthlyData(serviceHistory);
        // サービス人気度分析
        const servicePopularity = analyzeServicePopularity(serviceHistory);
        // 来店頻度分析
        const visitFrequency = analyzeVisitFrequency(customers);
        // 総売上計算
        const totalRevenue = serviceHistory.reduce((sum, service) => sum + service.price, 0);
        const averageOrderValue = Math.round(totalRevenue / serviceHistory.length);
        return {
            segments,
            totalCustomers: customers.length,
            monthlyRevenue: monthlyData.revenue[monthlyData.revenue.length - 1] || 0,
            averageOrderValue,
            visitFrequency,
            servicePopularity,
            monthlyTrends: monthlyData
        };
    };
    const generateMonthlyData = (serviceHistory) => {
        const months = [];
        const revenue = [];
        const customerCounts = [];
        // 直近6ヶ月のデータを生成
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthStr = date.toISOString().slice(0, 7); // YYYY-MM format
            months.push(date.toLocaleDateString('ja-JP', { month: 'long' }));
            // その月のサービス履歴をフィルタ
            const monthServices = serviceHistory.filter(service => service.date.startsWith(monthStr));
            const monthRevenue = monthServices.reduce((sum, service) => sum + service.price, 0);
            const uniqueCustomers = new Set(monthServices.map(service => service.customerId)).size;
            revenue.push(monthRevenue);
            customerCounts.push(uniqueCustomers);
        }
        return {
            labels: months,
            revenue,
            customers: customerCounts
        };
    };
    const analyzeServicePopularity = (serviceHistory) => {
        const serviceCounts = new Map();
        serviceHistory.forEach(service => {
            const serviceType = service.serviceType;
            serviceCounts.set(serviceType, (serviceCounts.get(serviceType) || 0) + 1);
        });
        const sortedServices = Array.from(serviceCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        return {
            labels: sortedServices.map(([service]) => service),
            data: sortedServices.map(([, count]) => count)
        };
    };
    const analyzeVisitFrequency = (customers) => {
        const frequencyRanges = [
            { label: '1-2回', min: 1, max: 2 },
            { label: '3-5回', min: 3, max: 5 },
            { label: '6-10回', min: 6, max: 10 },
            { label: '11-15回', min: 11, max: 15 },
            { label: '16回以上', min: 16, max: Infinity }
        ];
        const counts = frequencyRanges.map(range => customers.filter(customer => customer.visitCount >= range.min && customer.visitCount <= range.max).length);
        return {
            labels: frequencyRanges.map(range => range.label),
            data: counts
        };
    };
    const generateDemoData = () => {
        // 実際のダミーデータから統計を計算
        const customers = window.dummyCustomers || [];
        const services = window.serviceHistory || [];
        const vipCustomers = customers.filter((c) => c.visitCount >= 15);
        const regularCustomers = customers.filter((c) => c.visitCount >= 5 && c.visitCount < 15);
        const newCustomers = customers.filter((c) => c.visitCount < 5);
        const totalRevenue = services.reduce((sum, s) => sum + s.price, 0);
        const averagePrice = Math.round(totalRevenue / services.length);
        return {
            segments: [
                { name: 'VIP顧客', count: vipCustomers.length, percentage: Math.round(vipCustomers.length / customers.length * 100), color: '#8B5CF6' },
                { name: '常連客', count: regularCustomers.length, percentage: Math.round(regularCustomers.length / customers.length * 100), color: '#06B6D4' },
                { name: '新規客', count: newCustomers.length, percentage: Math.round(newCustomers.length / customers.length * 100), color: '#10B981' },
                { name: '離脱リスク', count: Math.max(1, Math.floor(customers.length * 0.1)), percentage: 10, color: '#F59E0B' }
            ],
            totalCustomers: customers.length,
            monthlyRevenue: Math.round(totalRevenue * 0.3), // 月間売上推定
            averageOrderValue: averagePrice,
            visitFrequency: {
                labels: ['月1回', '月2-3回', '月4-5回', '月6回以上'],
                data: [
                    customers.filter((c) => c.visitCount >= 1 && c.visitCount <= 3).length,
                    customers.filter((c) => c.visitCount >= 4 && c.visitCount <= 8).length,
                    customers.filter((c) => c.visitCount >= 9 && c.visitCount <= 12).length,
                    customers.filter((c) => c.visitCount >= 13).length
                ]
            },
            servicePopularity: {
                labels: ['カット', 'カラー', 'パーマ', 'トリートメント', 'ヘッドスパ'],
                data: [
                    services.filter((s) => s.serviceType.includes('カット')).length,
                    services.filter((s) => s.serviceType.includes('カラー')).length,
                    services.filter((s) => s.serviceType.includes('パーマ')).length,
                    services.filter((s) => s.serviceType.includes('トリートメント')).length,
                    services.filter((s) => s.serviceType.includes('ヘッドスパ')).length
                ]
            },
            monthlyTrends: {
                labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
                revenue: [2200000, 2350000, 2500000, 2750000, 2650000, 2850000],
                customers: [280, 285, 295, 310, 305, 320]
            }
        };
    };
    if (isLoading) {
        return (_jsx("div", { className: "flex items-center justify-center py-12", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" }), _jsx("p", { className: "text-gray-600", children: "\u5206\u6790\u30C7\u30FC\u30BF\u3092\u8AAD\u307F\u8FBC\u307F\u4E2D..." })] }) }));
    }
    if (!analyticsData) {
        return (_jsxs("div", { className: "text-center py-12", children: [_jsx(AlertTriangle, { className: "w-12 h-12 mx-auto text-red-500 mb-4" }), _jsx("p", { className: "text-gray-600", children: "\u5206\u6790\u30C7\u30FC\u30BF\u306E\u8AAD\u307F\u8FBC\u307F\u306B\u5931\u6557\u3057\u307E\u3057\u305F" })] }));
    }
    // グラフ設定
    const segmentChartData = {
        labels: analyticsData.segments.map(s => s.name),
        datasets: [
            {
                data: analyticsData.segments.map(s => s.count),
                backgroundColor: analyticsData.segments.map(s => s.color),
                borderWidth: 0
            }
        ]
    };
    const visitFrequencyData = {
        labels: analyticsData.visitFrequency.labels,
        datasets: [
            {
                label: '顧客数',
                data: analyticsData.visitFrequency.data,
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1
            }
        ]
    };
    const servicePopularityData = {
        labels: analyticsData.servicePopularity.labels,
        datasets: [
            {
                label: '利用回数',
                data: analyticsData.servicePopularity.data,
                backgroundColor: 'rgba(16, 185, 129, 0.8)',
                borderColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 1
            }
        ]
    };
    const monthlyTrendsData = {
        labels: analyticsData.monthlyTrends.labels,
        datasets: [
            {
                label: '売上 (万円)',
                data: analyticsData.monthlyTrends.revenue.map(r => r / 10000),
                borderColor: 'rgba(139, 92, 246, 1)',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                yAxisID: 'y'
            },
            {
                label: '顧客数',
                data: analyticsData.monthlyTrends.customers,
                borderColor: 'rgba(6, 182, 212, 1)',
                backgroundColor: 'rgba(6, 182, 212, 0.1)',
                yAxisID: 'y1'
            }
        ]
    };
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            }
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "\u9867\u5BA2\u5206\u6790\u30C0\u30C3\u30B7\u30E5\u30DC\u30FC\u30C9" }), _jsx("p", { className: "text-gray-600", children: "\u30D3\u30B8\u30CD\u30B9\u6210\u9577\u306E\u305F\u3081\u306E\u6D1E\u5BDF\u3068\u30C8\u30EC\u30F3\u30C9" })] }), _jsxs("div", { className: "flex items-center space-x-3 mt-4 sm:mt-0", children: [_jsxs("select", { value: timeRange, onChange: (e) => setTimeRange(e.target.value), className: "px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: "1month", children: "\u904E\u53BB1\u30F6\u6708" }), _jsx("option", { value: "3months", children: "\u904E\u53BB3\u30F6\u6708" }), _jsx("option", { value: "6months", children: "\u904E\u53BB6\u30F6\u6708" }), _jsx("option", { value: "1year", children: "\u904E\u53BB1\u5E74" })] }), _jsxs("button", { className: "flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors", children: [_jsx(Download, { className: "w-4 h-4" }), _jsx("span", { children: "\u30A8\u30AF\u30B9\u30DD\u30FC\u30C8" })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: [_jsx("div", { className: "bg-white p-6 rounded-lg border border-gray-200", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "\u7DCF\u9867\u5BA2\u6570" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: analyticsData.totalCustomers.toLocaleString() })] }), _jsx("div", { className: "w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center", children: _jsx(Users, { className: "w-6 h-6 text-blue-600" }) })] }) }), _jsx("div", { className: "bg-white p-6 rounded-lg border border-gray-200", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "\u6708\u9593\u58F2\u4E0A" }), _jsxs("p", { className: "text-2xl font-bold text-gray-900", children: ["\u00A5", analyticsData.monthlyRevenue.toLocaleString()] })] }), _jsx("div", { className: "w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center", children: _jsx(DollarSign, { className: "w-6 h-6 text-green-600" }) })] }) }), _jsx("div", { className: "bg-white p-6 rounded-lg border border-gray-200", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "\u5E73\u5747\u5358\u4FA1" }), _jsxs("p", { className: "text-2xl font-bold text-gray-900", children: ["\u00A5", analyticsData.averageOrderValue.toLocaleString()] })] }), _jsx("div", { className: "w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center", children: _jsx(TrendingUp, { className: "w-6 h-6 text-purple-600" }) })] }) }), _jsx("div", { className: "bg-white p-6 rounded-lg border border-gray-200", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "\u30EA\u30D4\u30FC\u30C8\u7387" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: "85%" })] }), _jsx("div", { className: "w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center", children: _jsx(UserCheck, { className: "w-6 h-6 text-orange-600" }) })] }) })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-white p-6 rounded-lg border border-gray-200", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "\u9867\u5BA2\u30BB\u30B0\u30E1\u30F3\u30C8" }), _jsx("div", { className: "h-64", children: _jsx(Doughnut, { data: segmentChartData, options: chartOptions }) }), _jsx("div", { className: "mt-4 space-y-2", children: analyticsData.segments.map((segment, index) => (_jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "w-3 h-3 rounded-full", style: { backgroundColor: segment.color } }), _jsx("span", { children: segment.name })] }), _jsxs("span", { className: "font-medium", children: [segment.count, "\u4EBA (", segment.percentage, "%)"] })] }, index))) })] }), _jsxs("div", { className: "bg-white p-6 rounded-lg border border-gray-200", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "\u6765\u5E97\u983B\u5EA6\u5206\u6790" }), _jsx("div", { className: "h-64", children: _jsx(Bar, { data: visitFrequencyData, options: chartOptions }) })] }), _jsxs("div", { className: "bg-white p-6 rounded-lg border border-gray-200", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "\u4EBA\u6C17\u30B5\u30FC\u30D3\u30B9\u30E9\u30F3\u30AD\u30F3\u30B0" }), _jsx("div", { className: "h-64", children: _jsx(Bar, { data: servicePopularityData, options: chartOptions }) })] }), _jsxs("div", { className: "bg-white p-6 rounded-lg border border-gray-200", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "\u6708\u5225\u30C8\u30EC\u30F3\u30C9" }), _jsx("div", { className: "h-64", children: _jsx(Line, { data: monthlyTrendsData, options: {
                                        ...chartOptions,
                                        scales: {
                                            y: {
                                                type: 'linear',
                                                display: true,
                                                position: 'left',
                                            },
                                            y1: {
                                                type: 'linear',
                                                display: true,
                                                position: 'right',
                                                grid: {
                                                    drawOnChartArea: false,
                                                },
                                            },
                                        }
                                    } }) })] })] })] }));
};
// プラン制限を適用したCustomerAnalyticsDashboard
const CustomerAnalyticsDashboard = () => {
    return (_jsx(FeatureGate, { feature: "customerAnalytics", children: _jsx(CustomerAnalyticsDashboardCore, {}) }));
};
export default CustomerAnalyticsDashboard;
