import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { TrendingUp, Target, Users, DollarSign, Clock, AlertTriangle, CheckCircle, Brain, BarChart3, Trophy, Activity, ArrowUp, ArrowDown } from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);
const StrategyDashboard = () => {
    const [overview, setOverview] = useState(null);
    const [timeSeriesData, setTimeSeriesData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);
    const [selectedPeriod, setSelectedPeriod] = useState('30');
    useEffect(() => {
        fetchDashboardData();
        fetchMetricsData();
    }, [selectedPeriod]);
    const fetchDashboardData = async () => {
        try {
            const response = await fetch('/api/v1/business-strategy/dashboard/overview', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                const data = await response.json();
                setOverview(data.overview);
            }
            else {
                const error = await response.json();
                if (error.code === 'FEATURE_DISABLED') {
                    setMessage({
                        type: 'error',
                        text: 'プレミアム経営戦略ダッシュボードはプレミアムプランでのみ利用可能です'
                    });
                }
                else {
                    throw new Error(error.error || 'データの取得に失敗しました');
                }
            }
        }
        catch (error) {
            setMessage({ type: 'error', text: error instanceof Error ? error.message : '不明なエラー' });
        }
        finally {
            setLoading(false);
        }
    };
    const fetchMetricsData = async () => {
        try {
            const response = await fetch(`/api/v1/business-strategy/metrics/detailed?period=${selectedPeriod}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                const data = await response.json();
                setTimeSeriesData(data.timeSeriesData);
            }
        }
        catch (error) {
            console.error('Metrics fetch error:', error);
        }
    };
    const generateInsights = async () => {
        try {
            const response = await fetch('/api/v1/business-strategy/insights/generate', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                const data = await response.json();
                setMessage({ type: 'success', text: data.message });
                await fetchDashboardData(); // 新しいインサイトを再読み込み
            }
        }
        catch (error) {
            setMessage({ type: 'error', text: 'AIインサイト生成に失敗しました' });
        }
    };
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('ja-JP', {
            style: 'currency',
            currency: 'JPY',
            minimumFractionDigits: 0
        }).format(amount);
    };
    const getImportanceColor = (importance) => {
        switch (importance) {
            case 'CRITICAL': return 'bg-red-100 text-red-800';
            case 'HIGH': return 'bg-orange-100 text-orange-800';
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
            case 'LOW': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    const getInsightIcon = (type) => {
        switch (type) {
            case 'TREND': return _jsx(TrendingUp, { className: "h-4 w-4" });
            case 'ANOMALY': return _jsx(AlertTriangle, { className: "h-4 w-4" });
            case 'PREDICTION': return _jsx(Brain, { className: "h-4 w-4" });
            case 'RECOMMENDATION': return _jsx(Target, { className: "h-4 w-4" });
            default: return _jsx(Activity, { className: "h-4 w-4" });
        }
    };
    if (loading) {
        return (_jsxs("div", { className: "flex items-center justify-center p-8", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" }), _jsx("span", { className: "ml-2", children: "\u7D4C\u55B6\u30C7\u30FC\u30BF\u3092\u5206\u6790\u4E2D..." })] }));
    }
    if (!overview) {
        return (_jsx("div", { className: "p-8 text-center", children: _jsx("p", { className: "text-gray-600", children: "\u30C7\u30FC\u30BF\u304C\u3042\u308A\u307E\u305B\u3093" }) }));
    }
    // チャートデータの準備
    const revenueChartData = timeSeriesData ? {
        labels: timeSeriesData.dates.map((d) => new Date(d).toLocaleDateString('ja-JP')),
        datasets: [{
                label: '日次売上',
                data: timeSeriesData.revenue,
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4
            }]
    } : null;
    const customerChartData = timeSeriesData ? {
        labels: timeSeriesData.dates.map((d) => new Date(d).toLocaleDateString('ja-JP')),
        datasets: [{
                label: '新規顧客',
                data: timeSeriesData.newCustomers,
                backgroundColor: 'rgba(147, 51, 234, 0.6)'
            }]
    } : null;
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-3xl font-bold flex items-center space-x-2", children: [_jsx(Trophy, { className: "h-8 w-8 text-yellow-600" }), _jsx("span", { children: "\u30D7\u30EC\u30DF\u30A2\u30E0\u7D4C\u55B6\u6226\u7565\u30C0\u30C3\u30B7\u30E5\u30DC\u30FC\u30C9" })] }), _jsx("p", { className: "text-gray-600 mt-1", children: "AI\u5206\u6790\u306B\u3088\u308B\u7D4C\u55B6\u30A4\u30F3\u30B5\u30A4\u30C8\u3068\u6226\u7565\u7684\u30A2\u30AF\u30B7\u30E7\u30F3\u30D7\u30E9\u30F3" })] }), _jsxs(Button, { onClick: generateInsights, className: "bg-gradient-to-r from-purple-600 to-blue-600", children: [_jsx(Brain, { className: "h-4 w-4 mr-2" }), "AI\u30A4\u30F3\u30B5\u30A4\u30C8\u751F\u6210"] })] }), message && (_jsxs(Alert, { className: message.type === 'error' ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50', children: [message.type === 'error' ? (_jsx(AlertTriangle, { className: "h-4 w-4 text-red-600" })) : (_jsx(CheckCircle, { className: "h-4 w-4 text-green-600" })), _jsx(AlertDescription, { className: message.type === 'error' ? 'text-red-700' : 'text-green-700', children: message.text })] })), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsx(Card, { className: "border-t-4 border-t-green-600", children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "\u672C\u65E5\u306E\u58F2\u4E0A" }), _jsx("p", { className: "text-2xl font-bold text-green-600", children: formatCurrency(overview.today.revenue) })] }), _jsx(DollarSign, { className: "h-8 w-8 text-green-200" })] }) }) }), _jsx(Card, { className: "border-t-4 border-t-blue-600", children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "\u6708\u9593\u58F2\u4E0A" }), _jsx("p", { className: "text-2xl font-bold text-blue-600", children: formatCurrency(overview.month.revenue) }), _jsxs("div", { className: "flex items-center mt-1", children: [overview.month.revenueGrowth > 0 ? (_jsx(ArrowUp, { className: "h-4 w-4 text-green-600 mr-1" })) : (_jsx(ArrowDown, { className: "h-4 w-4 text-red-600 mr-1" })), _jsxs("span", { className: `text-sm ${overview.month.revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'}`, children: [Math.abs(overview.month.revenueGrowth).toFixed(1), "%"] })] })] }), _jsx(BarChart3, { className: "h-8 w-8 text-blue-200" })] }) }) }), _jsx(Card, { className: "border-t-4 border-t-purple-600", children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "\u9867\u5BA2\u4FDD\u6301\u7387" }), _jsxs("p", { className: "text-2xl font-bold text-purple-600", children: [overview.customer.retentionRate, "%"] }), _jsxs("p", { className: "text-xs text-gray-500 mt-1", children: ["\u65B0\u898F: ", overview.customer.totalNewCustomers, "\u540D"] })] }), _jsx(Users, { className: "h-8 w-8 text-purple-200" })] }) }) }), _jsx(Card, { className: "border-t-4 border-t-orange-600", children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "\u5E73\u5747\u65BD\u8853\u6642\u9593" }), _jsxs("p", { className: "text-2xl font-bold text-orange-600", children: [overview.today.avgServiceTime.toFixed(0), "\u5206"] }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "\u52B9\u7387\u6027\u6307\u6A19" })] }), _jsx(Clock, { className: "h-8 w-8 text-orange-200" })] }) }) })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [revenueChartData && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center justify-between", children: [_jsx("span", { children: "\u58F2\u4E0A\u30C8\u30EC\u30F3\u30C9" }), _jsxs("select", { value: selectedPeriod, onChange: (e) => setSelectedPeriod(e.target.value), className: "text-sm px-2 py-1 border rounded", children: [_jsx("option", { value: "7", children: "\u904E\u53BB7\u65E5" }), _jsx("option", { value: "30", children: "\u904E\u53BB30\u65E5" }), _jsx("option", { value: "90", children: "\u904E\u53BB90\u65E5" })] })] }) }), _jsx(CardContent, { children: _jsx(Line, { data: revenueChartData, options: {
                                        responsive: true,
                                        plugins: {
                                            legend: { display: false }
                                        },
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                ticks: {
                                                    callback: function (value) {
                                                        return '¥' + value.toLocaleString();
                                                    }
                                                }
                                            }
                                        }
                                    } }) })] })), customerChartData && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "\u65B0\u898F\u9867\u5BA2\u7372\u5F97" }) }), _jsx(CardContent, { children: _jsx(Bar, { data: customerChartData, options: {
                                        responsive: true,
                                        plugins: {
                                            legend: { display: false }
                                        },
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                ticks: {
                                                    stepSize: 1
                                                }
                                            }
                                        }
                                    } }) })] }))] }), overview.goals.length > 0 && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(Target, { className: "h-5 w-5" }), _jsx("span", { children: "\u7D4C\u55B6\u76EE\u6A19" })] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: overview.goals.map((goal) => (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium", children: goal.name }), _jsxs("p", { className: "text-sm text-gray-600", children: ["\u6B8B\u308A", goal.daysRemaining, "\u65E5"] })] }), _jsxs("span", { className: "text-lg font-semibold", children: [goal.progress.toFixed(1), "%"] })] }), _jsx(Progress, { value: goal.progress, className: "h-2" })] }, goal.id))) }) })] })), overview.insights.length > 0 && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(Brain, { className: "h-5 w-5 text-purple-600" }), _jsx("span", { children: "AI\u30D3\u30B8\u30CD\u30B9\u30A4\u30F3\u30B5\u30A4\u30C8" })] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3", children: overview.insights.map((insight) => (_jsxs("div", { className: "flex items-start space-x-3 p-3 bg-gray-50 rounded-lg", children: [_jsx("div", { className: "mt-1", children: getInsightIcon(insight.type) }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "font-medium", children: insight.title }), _jsx(Badge, { className: `mt-1 ${getImportanceColor(insight.importance)}`, children: insight.importance })] })] }, insight.id))) }) })] }))] }));
};
export default StrategyDashboard;
