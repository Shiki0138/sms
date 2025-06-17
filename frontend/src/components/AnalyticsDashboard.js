import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
const AnalyticsDashboard = () => {
    const [kpis, setKpis] = useState(null);
    const [churnAnalysis, setChurnAnalysis] = useState(null);
    const [forecast, setForecast] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [realtimeConnected, setRealtimeConnected] = useState(false);
    const API_BASE = 'http://localhost:4002/api/v1';
    useEffect(() => {
        loadDashboardData();
        setupRealtimeConnection();
    }, []);
    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const [kpisRes, churnRes, forecastRes] = await Promise.all([
                fetch(`${API_BASE}/analytics/dashboard/kpis`, {
                    headers: { 'x-tenant-id': 'default-tenant' }
                }),
                fetch(`${API_BASE}/analytics/churn-analysis`, {
                    headers: { 'x-tenant-id': 'default-tenant' }
                }),
                fetch(`${API_BASE}/analytics/forecast/revenue`, {
                    headers: { 'x-tenant-id': 'default-tenant' }
                })
            ]);
            if (kpisRes.ok) {
                const kpisData = await kpisRes.json();
                setKpis(kpisData.data);
            }
            if (churnRes.ok) {
                const churnData = await churnRes.json();
                setChurnAnalysis(churnData.data);
            }
            if (forecastRes.ok) {
                const forecastData = await forecastRes.json();
                setForecast(forecastData.data);
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
        }
        finally {
            setLoading(false);
        }
    };
    const setupRealtimeConnection = () => {
        try {
            const eventSource = new EventSource(`${API_BASE}/analytics/realtime/metrics`);
            eventSource.onopen = () => {
                setRealtimeConnected(true);
                console.log('Real-time analytics connection established');
            };
            eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'kpis' || data.type === 'kpis_update') {
                        setKpis(data.data);
                    }
                }
                catch (err) {
                    console.error('Real-time data parsing error:', err);
                }
            };
            eventSource.onerror = () => {
                setRealtimeConnected(false);
                console.log('Real-time connection lost, reconnecting...');
            };
            return () => eventSource.close();
        }
        catch (err) {
            console.error('Real-time connection setup error:', err);
        }
    };
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('ja-JP', {
            style: 'currency',
            currency: 'JPY'
        }).format(amount);
    };
    const formatPercentage = (value) => {
        return `${value.toFixed(1)}%`;
    };
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" }) }));
    }
    if (error) {
        return (_jsxs("div", { className: "bg-red-50 border border-red-200 rounded-md p-4", children: [_jsxs("div", { className: "text-red-800", children: ["\u30A8\u30E9\u30FC: ", error] }), _jsx("button", { onClick: loadDashboardData, className: "mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700", children: "\u518D\u8A66\u884C" })] }));
    }
    return (_jsxs("div", { className: "p-6 space-y-6", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "\u30EA\u30A2\u30EB\u30BF\u30A4\u30E0\u5206\u6790\u30C0\u30C3\u30B7\u30E5\u30DC\u30FC\u30C9" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: `w-3 h-3 rounded-full ${realtimeConnected ? 'bg-green-500' : 'bg-red-500'}` }), _jsx("span", { className: "text-sm text-gray-600", children: realtimeConnected ? 'リアルタイム接続中' : '接続切断' })] })] }), kpis && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: [_jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-800 mb-2", children: "\u58F2\u4E0A" }), _jsx("div", { className: "text-2xl font-bold text-blue-600 mb-1", children: formatCurrency(kpis.revenue.today) }), _jsx("div", { className: "text-sm text-gray-600", children: "\u4ECA\u65E5\u306E\u58F2\u4E0A" }), _jsxs("div", { className: `text-sm mt-2 ${kpis.revenue.trend >= 0 ? 'text-green-600' : 'text-red-600'}`, children: [kpis.revenue.trend >= 0 ? '↗' : '↘', " ", formatPercentage(Math.abs(kpis.revenue.trend))] })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-800 mb-2", children: "\u9867\u5BA2" }), _jsx("div", { className: "text-2xl font-bold text-green-600 mb-1", children: kpis.customers.total.toLocaleString() }), _jsx("div", { className: "text-sm text-gray-600", children: "\u7DCF\u9867\u5BA2\u6570" }), _jsxs("div", { className: "text-sm mt-2 text-blue-600", children: ["\u65B0\u898F: ", kpis.customers.newToday, "\u4EBA (\u4ECA\u65E5)"] })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-800 mb-2", children: "\u4E88\u7D04" }), _jsx("div", { className: "text-2xl font-bold text-purple-600 mb-1", children: kpis.reservations.todayCount }), _jsx("div", { className: "text-sm text-gray-600", children: "\u4ECA\u65E5\u306E\u4E88\u7D04" }), _jsxs("div", { className: "text-sm mt-2 text-gray-600", children: ["\u5B8C\u4E86\u7387: ", formatPercentage(kpis.reservations.completionRate)] })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-800 mb-2", children: "\u6E80\u8DB3\u5EA6" }), _jsx("div", { className: "text-2xl font-bold text-yellow-600 mb-1", children: kpis.satisfaction.averageScore.toFixed(1) }), _jsx("div", { className: "text-sm text-gray-600", children: "\u5E73\u5747\u30B9\u30B3\u30A2 (5\u70B9\u6E80\u70B9)" }), _jsxs("div", { className: "text-sm mt-2 text-gray-600", children: ["\u56DE\u7B54\u7387: ", formatPercentage(kpis.satisfaction.responseRate)] })] })] })), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [churnAnalysis && (_jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("h3", { className: "text-xl font-semibold text-gray-800 mb-4", children: "\u9867\u5BA2\u96E2\u8131\u5206\u6790" }), _jsxs("div", { className: "mb-4", children: [_jsx("h4", { className: "text-lg font-medium text-red-600 mb-2", children: "\u9AD8\u30EA\u30B9\u30AF\u9867\u5BA2" }), churnAnalysis.highRiskCustomers.slice(0, 5).map((customer, index) => (_jsxs("div", { className: "flex justify-between items-center py-2 border-b", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium", children: customer.customerName }), _jsxs("div", { className: "text-sm text-gray-600", children: ["\u6700\u7D42\u6765\u5E97: ", new Date(customer.lastVisit).toLocaleDateString('ja-JP')] })] }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: "text-red-600 font-semibold", children: formatPercentage(customer.churnProbability * 100) }), _jsx("div", { className: "text-xs text-gray-500", children: "\u96E2\u8131\u78BA\u7387" })] })] }, customer.customerId)))] }), _jsxs("div", { children: [_jsx("h4", { className: "text-lg font-medium text-gray-700 mb-2", children: "\u96E2\u8131\u8981\u56E0" }), churnAnalysis.churnFactors.map((factor, index) => (_jsxs("div", { className: "flex justify-between items-center py-1", children: [_jsx("span", { className: "text-sm", children: factor.factor }), _jsx("span", { className: "text-sm font-medium", children: formatPercentage(factor.impact * 100) })] }, index)))] })] })), forecast && (_jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("h3", { className: "text-xl font-semibold text-gray-800 mb-4", children: "\u58F2\u4E0A\u4E88\u6E2C" }), _jsxs("div", { className: "mb-4", children: [_jsx("h4", { className: "text-lg font-medium text-blue-600 mb-2", children: "\u6765\u6708\u4E88\u6E2C" }), _jsx("div", { className: "text-2xl font-bold text-blue-800 mb-2", children: formatCurrency(forecast.nextMonth.predicted) }), _jsxs("div", { className: "text-sm text-gray-600 mb-2", children: ["\u4FE1\u983C\u5EA6: ", formatPercentage(forecast.nextMonth.confidence * 100)] }), _jsxs("div", { className: "text-sm text-gray-700", children: [_jsx("div", { className: "font-medium mb-1", children: "\u4E88\u6E2C\u8981\u56E0:" }), _jsx("ul", { className: "list-disc list-inside", children: forecast.nextMonth.factors.map((factor, index) => (_jsx("li", { children: factor }, index))) })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-lg font-medium text-gray-700 mb-2", children: "\u56DB\u534A\u671F\u30C8\u30EC\u30F3\u30C9" }), forecast.quarterlyTrend.map((trend, index) => (_jsxs("div", { className: "flex justify-between items-center py-2 border-b", children: [_jsx("span", { className: "text-sm", children: trend.month }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: "text-sm font-medium", children: formatCurrency(trend.predicted) }), _jsx("div", { className: "text-xs text-gray-500", children: "\u4E88\u6E2C\u5024" })] })] }, index)))] })] }))] }), _jsxs("div", { className: "flex space-x-4", children: [_jsx("button", { onClick: loadDashboardData, className: "px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors", children: "\u30C7\u30FC\u30BF\u3092\u66F4\u65B0" }), _jsx("button", { className: "px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors", children: "\u30EC\u30DD\u30FC\u30C8\u751F\u6210" }), _jsx("button", { className: "px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors", children: "\u6700\u9069\u5316\u63D0\u6848" })] })] }));
};
export default AnalyticsDashboard;
