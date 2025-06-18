import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Users, MessageSquare, Bug, Lightbulb, Star, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Line, Doughnut } from 'react-chartjs-2';
const BetaTestDashboard = () => {
    const [stats, setStats] = useState(null);
    const [recentFeedback, setRecentFeedback] = useState([]);
    const [selectedTimeframe, setSelectedTimeframe] = useState('week');
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        fetchBetaTestData();
    }, [selectedTimeframe]);
    const fetchBetaTestData = async () => {
        try {
            setIsLoading(true);
            // Fetch beta test statistics
            const statsResponse = await fetch(`/api/v1/beta-test/stats?timeframe=${selectedTimeframe}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const statsData = await statsResponse.json();
            setStats(statsData);
            // Fetch recent feedback
            const feedbackResponse = await fetch('/api/v1/beta-test/feedback/recent', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const feedbackData = await feedbackResponse.json();
            setRecentFeedback(feedbackData);
        }
        catch (error) {
            console.error('Failed to fetch beta test data:', error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const getStatusBadge = (status) => {
        const styles = {
            open: 'bg-blue-100 text-blue-800',
            'in-progress': 'bg-yellow-100 text-yellow-800',
            resolved: 'bg-green-100 text-green-800',
            closed: 'bg-gray-100 text-gray-800'
        };
        const labels = {
            open: '未対応',
            'in-progress': '対応中',
            resolved: '解決済み',
            closed: 'クローズ'
        };
        return (_jsx("span", { className: `px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`, children: labels[status] }));
    };
    const getPriorityBadge = (priority) => {
        const styles = {
            critical: 'bg-red-100 text-red-800',
            high: 'bg-orange-100 text-orange-800',
            medium: 'bg-yellow-100 text-yellow-800',
            low: 'bg-green-100 text-green-800'
        };
        return (_jsx("span", { className: `px-2 py-1 text-xs font-medium rounded-full ${styles[priority]}`, children: priority === 'critical' ? '致命的' : priority === 'high' ? '高' : priority === 'medium' ? '中' : '低' }));
    };
    if (isLoading) {
        return (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" }) }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white", children: [_jsx("h1", { className: "text-2xl font-bold mb-2", children: "\u30D9\u30FC\u30BF\u30C6\u30B9\u30C8\u30C0\u30C3\u30B7\u30E5\u30DC\u30FC\u30C9" }), _jsx("p", { className: "text-blue-100", children: "\u30AF\u30ED\u30FC\u30BA\u30C9\u30D9\u30FC\u30BF\u30C6\u30B9\u30C8\u306E\u9032\u6357\u72B6\u6CC1\u3068\u30D5\u30A3\u30FC\u30C9\u30D0\u30C3\u30AF\u3092\u7BA1\u7406" })] }), _jsx("div", { className: "flex space-x-2", children: ['week', 'month', 'all'].map((timeframe) => (_jsx("button", { onClick: () => setSelectedTimeframe(timeframe), className: `px-4 py-2 rounded-md text-sm font-medium transition-colors ${selectedTimeframe === timeframe
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`, children: timeframe === 'week' ? '今週' : timeframe === 'month' ? '今月' : '全期間' }, timeframe))) }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx(Users, { className: "w-8 h-8 text-blue-600" }), _jsx("span", { className: "text-2xl font-bold", children: stats?.totalTesters || 0 })] }), _jsx("h3", { className: "text-sm font-medium text-gray-600", children: "\u7DCF\u30C6\u30B9\u30BF\u30FC\u6570" }), _jsx("div", { className: "mt-2 flex items-center text-sm", children: _jsxs("span", { className: "text-green-600 font-medium", children: [stats?.activeTesters || 0, " \u540D\u30A2\u30AF\u30C6\u30A3\u30D6"] }) })] }), _jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx(MessageSquare, { className: "w-8 h-8 text-purple-600" }), _jsx("span", { className: "text-2xl font-bold", children: stats?.totalFeedback || 0 })] }), _jsx("h3", { className: "text-sm font-medium text-gray-600", children: "\u7DCF\u30D5\u30A3\u30FC\u30C9\u30D0\u30C3\u30AF\u6570" }), _jsxs("div", { className: "mt-2 flex items-center space-x-3 text-sm", children: [_jsxs("span", { className: "flex items-center", children: [_jsx(Bug, { className: "w-4 h-4 text-red-500 mr-1" }), stats?.bugReports || 0] }), _jsxs("span", { className: "flex items-center", children: [_jsx(Lightbulb, { className: "w-4 h-4 text-yellow-500 mr-1" }), stats?.featureRequests || 0] })] })] }), _jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx(Star, { className: "w-8 h-8 text-yellow-500" }), _jsx("span", { className: "text-2xl font-bold", children: stats?.averageRating?.toFixed(1) || '0.0' })] }), _jsx("h3", { className: "text-sm font-medium text-gray-600", children: "\u5E73\u5747\u8A55\u4FA1" }), _jsx("div", { className: "mt-2", children: _jsx("div", { className: "flex space-x-1", children: [1, 2, 3, 4, 5].map((star) => (_jsx(Star, { className: `w-4 h-4 ${star <= Math.round(stats?.averageRating || 0)
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-gray-300'}` }, star))) }) })] }), _jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx(CheckCircle, { className: "w-8 h-8 text-green-600" }), _jsxs("span", { className: "text-2xl font-bold", children: [stats?.completionRate || 0, "%"] })] }), _jsx("h3", { className: "text-sm font-medium text-gray-600", children: "\u30C6\u30B9\u30C8\u5B8C\u4E86\u7387" }), _jsx("div", { className: "mt-2", children: _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "bg-green-600 h-2 rounded-full", style: { width: `${stats?.completionRate || 0}%` } }) }) })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "\u65E5\u6B21\u30A2\u30AF\u30C6\u30A3\u30D6\u30E6\u30FC\u30B6\u30FC" }), _jsx(Line, { data: {
                                    labels: stats?.dailyActiveUsers?.map(d => format(new Date(d.date), 'M/d')) || [],
                                    datasets: [{
                                            label: 'アクティブユーザー',
                                            data: stats?.dailyActiveUsers?.map(d => d.count) || [],
                                            borderColor: 'rgb(59, 130, 246)',
                                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                            tension: 0.4
                                        }]
                                }, options: {
                                    responsive: true,
                                    plugins: {
                                        legend: { display: false }
                                    },
                                    scales: {
                                        y: { beginAtZero: true }
                                    }
                                } })] }), _jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "\u30D5\u30A3\u30FC\u30C9\u30D0\u30C3\u30AF\u5206\u5E03" }), _jsx(Doughnut, { data: {
                                    labels: ['バグ報告', '機能要望', 'ご意見'],
                                    datasets: [{
                                            data: [
                                                stats?.bugReports || 0,
                                                stats?.featureRequests || 0,
                                                (stats?.totalFeedback || 0) - (stats?.bugReports || 0) - (stats?.featureRequests || 0)
                                            ],
                                            backgroundColor: [
                                                'rgba(239, 68, 68, 0.8)',
                                                'rgba(245, 158, 11, 0.8)',
                                                'rgba(59, 130, 246, 0.8)'
                                            ]
                                        }]
                                }, options: {
                                    responsive: true,
                                    plugins: {
                                        legend: { position: 'bottom' }
                                    }
                                } })] })] }), _jsxs("div", { className: "bg-white rounded-lg border border-gray-200", children: [_jsx("div", { className: "p-6 border-b border-gray-200", children: _jsx("h3", { className: "text-lg font-medium text-gray-900", children: "\u6700\u65B0\u306E\u30D5\u30A3\u30FC\u30C9\u30D0\u30C3\u30AF" }) }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "\u30BF\u30A4\u30D7" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "\u30BF\u30A4\u30C8\u30EB" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "\u6295\u7A3F\u8005" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "\u512A\u5148\u5EA6" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "\u30B9\u30C6\u30FC\u30BF\u30B9" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "\u6295\u7A3F\u65E5\u6642" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: recentFeedback.map((feedback) => (_jsxs("tr", { className: "hover:bg-gray-50 cursor-pointer", children: [_jsxs("td", { className: "px-6 py-4 whitespace-nowrap", children: [feedback.type === 'bug' && (_jsx(Bug, { className: "w-5 h-5 text-red-500" })), feedback.type === 'feature' && (_jsx(Lightbulb, { className: "w-5 h-5 text-yellow-500" })), feedback.type === 'general' && (_jsx(MessageSquare, { className: "w-5 h-5 text-blue-500" }))] }), _jsx("td", { className: "px-6 py-4", children: _jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium text-gray-900", children: feedback.title }), _jsx("div", { className: "text-sm text-gray-500 truncate max-w-xs", children: feedback.description })] }) }), _jsxs("td", { className: "px-6 py-4 whitespace-nowrap", children: [_jsx("div", { className: "text-sm text-gray-900", children: feedback.userName }), _jsx("div", { className: "text-xs text-gray-500", children: feedback.userEmail })] }), _jsxs("td", { className: "px-6 py-4 whitespace-nowrap", children: [feedback.type === 'bug' && getPriorityBadge(feedback.priority), feedback.rating && (_jsxs("div", { className: "flex items-center", children: [_jsx(Star, { className: "w-4 h-4 text-yellow-400 fill-current" }), _jsx("span", { className: "ml-1 text-sm", children: feedback.rating })] }))] }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: getStatusBadge(feedback.status) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: format(new Date(feedback.createdAt), 'M/d HH:mm', { locale: ja }) })] }, feedback.id))) })] }) })] })] }));
};
export default BetaTestDashboard;
