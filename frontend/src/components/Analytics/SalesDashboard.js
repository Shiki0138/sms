import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { DollarSign, Calendar, Users, Target, Award, BarChart3, PieChart, Download, RefreshCw, Zap } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { format, parseISO, startOfMonth, endOfMonth, subMonths, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { ja } from 'date-fns/locale';
// Chart.js登録
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);
const SalesDashboard = ({ customers, reservations, serviceHistory }) => {
    const [selectedPeriod, setSelectedPeriod] = useState('month');
    const [selectedChart, setSelectedChart] = useState('revenue');
    // 売上データの処理
    const salesAnalysis = useMemo(() => {
        const completedReservations = reservations.filter(r => r.status === 'COMPLETED' && r.price);
        const currentDate = new Date();
        // 期間別データ生成
        const generatePeriodData = () => {
            const periods = [];
            switch (selectedPeriod) {
                case 'week':
                    for (let i = 11; i >= 0; i--) {
                        const date = addDays(currentDate, -i * 7);
                        periods.push({
                            date: startOfWeek(date, { weekStartsOn: 1 }),
                            label: format(date, 'M/d', { locale: ja })
                        });
                    }
                    break;
                case 'month':
                    for (let i = 11; i >= 0; i--) {
                        const date = subMonths(currentDate, i);
                        periods.push({
                            date: startOfMonth(date),
                            label: format(date, 'M月', { locale: ja })
                        });
                    }
                    break;
                case 'quarter':
                    for (let i = 7; i >= 0; i--) {
                        const date = subMonths(currentDate, i * 3);
                        const quarter = Math.floor(date.getMonth() / 3) + 1;
                        periods.push({
                            date: startOfMonth(date),
                            label: `${date.getFullYear()}Q${quarter}`
                        });
                    }
                    break;
                case 'year':
                    for (let i = 4; i >= 0; i--) {
                        const date = new Date(currentDate.getFullYear() - i, 0, 1);
                        periods.push({
                            date,
                            label: `${date.getFullYear()}年`
                        });
                    }
                    break;
            }
            return periods;
        };
        const periods = generatePeriodData();
        // 期間別売上計算
        const revenueByPeriod = periods.map(period => {
            const periodEnd = selectedPeriod === 'week'
                ? endOfWeek(period.date, { weekStartsOn: 1 })
                : selectedPeriod === 'month'
                    ? endOfMonth(period.date)
                    : addDays(period.date, selectedPeriod === 'quarter' ? 90 : 365);
            const periodRevenue = completedReservations
                .filter(r => {
                const reservationDate = parseISO(r.startTime);
                return reservationDate >= period.date && reservationDate <= periodEnd;
            })
                .reduce((sum, r) => sum + (r.price || 0), 0);
            return {
                period: period.label,
                revenue: periodRevenue,
                count: completedReservations.filter(r => {
                    const reservationDate = parseISO(r.startTime);
                    return reservationDate >= period.date && reservationDate <= periodEnd;
                }).length
            };
        });
        return {
            revenueByPeriod,
            periods
        };
    }, [reservations, selectedPeriod]);
    // サービス別分析
    const serviceAnalysis = useMemo(() => {
        const completedReservations = reservations.filter(r => r.status === 'COMPLETED' && r.price);
        const serviceMap = new Map();
        completedReservations.forEach(reservation => {
            const service = reservation.menuContent;
            const existing = serviceMap.get(service) || { count: 0, revenue: 0 };
            serviceMap.set(service, {
                count: existing.count + 1,
                revenue: existing.revenue + (reservation.price || 0)
            });
        });
        return Array.from(serviceMap.entries())
            .map(([service, data]) => ({
            service,
            count: data.count,
            revenue: data.revenue,
            avgPrice: data.revenue / data.count
        }))
            .sort((a, b) => b.revenue - a.revenue);
    }, [reservations]);
    // スタッフ別分析
    const staffAnalysis = useMemo(() => {
        const completedReservations = reservations.filter(r => r.status === 'COMPLETED' && r.price && r.staff);
        const staffMap = new Map();
        completedReservations.forEach(reservation => {
            if (!reservation.staff)
                return;
            const staffId = reservation.staff.id;
            const existing = staffMap.get(staffId) || {
                name: reservation.staff.name,
                count: 0,
                revenue: 0,
                customers: new Set()
            };
            existing.count += 1;
            existing.revenue += reservation.price || 0;
            if (reservation.customer?.id) {
                existing.customers.add(reservation.customer.id);
            }
            staffMap.set(staffId, existing);
        });
        return Array.from(staffMap.entries())
            .map(([staffId, data]) => ({
            staffId,
            name: data.name,
            count: data.count,
            revenue: data.revenue,
            avgPrice: data.revenue / data.count,
            customerCount: data.customers.size
        }))
            .sort((a, b) => b.revenue - a.revenue);
    }, [reservations]);
    // チャートデータ
    const chartData = useMemo(() => {
        switch (selectedChart) {
            case 'revenue':
                return {
                    labels: salesAnalysis.revenueByPeriod.map(d => d.period),
                    datasets: [
                        {
                            label: '売上',
                            data: salesAnalysis.revenueByPeriod.map(d => d.revenue),
                            borderColor: 'rgb(59, 130, 246)',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            fill: true,
                            tension: 0.4
                        },
                        {
                            label: '予約件数',
                            data: salesAnalysis.revenueByPeriod.map(d => d.count),
                            borderColor: 'rgb(16, 185, 129)',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            yAxisID: 'y1',
                            fill: false
                        }
                    ]
                };
            case 'services':
                return {
                    labels: serviceAnalysis.slice(0, 8).map(s => s.service),
                    datasets: [{
                            label: '売上',
                            data: serviceAnalysis.slice(0, 8).map(s => s.revenue),
                            backgroundColor: [
                                'rgba(59, 130, 246, 0.8)',
                                'rgba(16, 185, 129, 0.8)',
                                'rgba(245, 158, 11, 0.8)',
                                'rgba(239, 68, 68, 0.8)',
                                'rgba(139, 92, 246, 0.8)',
                                'rgba(236, 72, 153, 0.8)',
                                'rgba(14, 165, 233, 0.8)',
                                'rgba(34, 197, 94, 0.8)'
                            ],
                            borderWidth: 2,
                            borderColor: '#fff'
                        }]
                };
            case 'staff':
                return {
                    labels: staffAnalysis.map(s => s.name),
                    datasets: [{
                            label: '売上',
                            data: staffAnalysis.map(s => s.revenue),
                            backgroundColor: 'rgba(139, 92, 246, 0.8)',
                            borderColor: 'rgba(139, 92, 246, 1)',
                            borderWidth: 1
                        }]
                };
            default:
                return { labels: [], datasets: [] };
        }
    }, [salesAnalysis, serviceAnalysis, staffAnalysis, selectedChart]);
    // チャートオプション
    const chartOptions = useMemo(() => {
        const baseOptions = {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            if (selectedChart === 'revenue' && context.datasetIndex === 0) {
                                return `売上: ¥${context.raw.toLocaleString()}`;
                            }
                            if (selectedChart === 'revenue' && context.datasetIndex === 1) {
                                return `予約件数: ${context.raw}件`;
                            }
                            if (selectedChart === 'services' || selectedChart === 'staff') {
                                return `売上: ¥${context.raw.toLocaleString()}`;
                            }
                            return context.raw;
                        }
                    }
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    ticks: {
                        callback: (value) => `¥${value.toLocaleString()}`
                    }
                },
                ...(selectedChart === 'revenue' && {
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        grid: {
                            drawOnChartArea: false,
                        },
                        ticks: {
                            callback: (value) => `${value}件`
                        }
                    }
                })
            }
        };
        return baseOptions;
    }, [selectedChart]);
    // 統計計算
    const totalRevenue = salesAnalysis.revenueByPeriod.reduce((sum, d) => sum + d.revenue, 0);
    const totalReservations = salesAnalysis.revenueByPeriod.reduce((sum, d) => sum + d.count, 0);
    const avgRevenue = totalReservations > 0 ? totalRevenue / totalReservations : 0;
    const revenueGrowth = salesAnalysis.revenueByPeriod.length >= 2
        ? ((salesAnalysis.revenueByPeriod[salesAnalysis.revenueByPeriod.length - 1].revenue -
            salesAnalysis.revenueByPeriod[salesAnalysis.revenueByPeriod.length - 2].revenue) /
            salesAnalysis.revenueByPeriod[salesAnalysis.revenueByPeriod.length - 2].revenue) * 100
        : 0;
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("h2", { className: "text-2xl font-bold text-gray-900 flex items-center", children: [_jsx(BarChart3, { className: "w-8 h-8 mr-3 text-blue-600" }), "\u58F2\u4E0A\u5206\u6790\u30C0\u30C3\u30B7\u30E5\u30DC\u30FC\u30C9"] }), _jsx("p", { className: "text-gray-600 mt-1", children: "\u5305\u62EC\u7684\u306A\u58F2\u4E0A\u30C7\u30FC\u30BF\u5206\u6790\u3068\u696D\u7E3E\u30A4\u30F3\u30B5\u30A4\u30C8" })] }), _jsxs("div", { className: "flex space-x-2", children: [_jsxs("select", { value: selectedPeriod, onChange: (e) => setSelectedPeriod(e.target.value), className: "px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: "week", children: "\u9031\u5225" }), _jsx("option", { value: "month", children: "\u6708\u5225" }), _jsx("option", { value: "quarter", children: "\u56DB\u534A\u671F\u5225" }), _jsx("option", { value: "year", children: "\u5E74\u5225" })] }), _jsxs("button", { className: "btn btn-secondary btn-sm", children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2" }), "\u66F4\u65B0"] }), _jsxs("button", { className: "btn btn-primary btn-sm", children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "\u30EC\u30DD\u30FC\u30C8\u51FA\u529B"] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsx("div", { className: "bg-white p-6 rounded-lg border border-gray-200", children: _jsxs("div", { className: "flex items-center", children: [_jsx(DollarSign, { className: "w-8 h-8 text-green-600" }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "\u7DCF\u58F2\u4E0A" }), _jsxs("p", { className: "text-2xl font-bold text-gray-900", children: ["\u00A5", totalRevenue.toLocaleString()] }), _jsxs("p", { className: `text-sm ${revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`, children: [revenueGrowth >= 0 ? '+' : '', revenueGrowth.toFixed(1), "% \u524D\u671F\u6BD4"] })] })] }) }), _jsx("div", { className: "bg-white p-6 rounded-lg border border-gray-200", children: _jsxs("div", { className: "flex items-center", children: [_jsx(Calendar, { className: "w-8 h-8 text-blue-600" }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "\u7DCF\u4E88\u7D04\u6570" }), _jsxs("p", { className: "text-2xl font-bold text-gray-900", children: [totalReservations, "\u4EF6"] })] })] }) }), _jsx("div", { className: "bg-white p-6 rounded-lg border border-gray-200", children: _jsxs("div", { className: "flex items-center", children: [_jsx(Target, { className: "w-8 h-8 text-purple-600" }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "\u5E73\u5747\u5BA2\u5358\u4FA1" }), _jsxs("p", { className: "text-2xl font-bold text-gray-900", children: ["\u00A5", Math.round(avgRevenue).toLocaleString()] })] })] }) }), _jsx("div", { className: "bg-white p-6 rounded-lg border border-gray-200", children: _jsxs("div", { className: "flex items-center", children: [_jsx(Users, { className: "w-8 h-8 text-orange-600" }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "\u30A2\u30AF\u30C6\u30A3\u30D6\u9867\u5BA2" }), _jsxs("p", { className: "text-2xl font-bold text-gray-900", children: [customers.length, "\u540D"] })] })] }) })] }), _jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h3", { className: "text-lg font-bold text-gray-900", children: "\u5206\u6790\u30C1\u30E3\u30FC\u30C8" }), _jsxs("div", { className: "flex space-x-2", children: [_jsx("button", { onClick: () => setSelectedChart('revenue'), className: `px-3 py-2 rounded-md text-sm font-medium transition-colors ${selectedChart === 'revenue'
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`, children: "\u58F2\u4E0A\u63A8\u79FB" }), _jsx("button", { onClick: () => setSelectedChart('services'), className: `px-3 py-2 rounded-md text-sm font-medium transition-colors ${selectedChart === 'services'
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`, children: "\u30B5\u30FC\u30D3\u30B9\u5225" }), _jsx("button", { onClick: () => setSelectedChart('staff'), className: `px-3 py-2 rounded-md text-sm font-medium transition-colors ${selectedChart === 'staff'
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`, children: "\u30B9\u30BF\u30C3\u30D5\u5225" })] })] }), _jsxs("div", { className: "h-96", children: [selectedChart === 'revenue' && (_jsx(Line, { data: chartData, options: chartOptions })), selectedChart === 'services' && (_jsx(Doughnut, { data: chartData, options: {
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            position: 'right',
                                        },
                                        tooltip: {
                                            callbacks: {
                                                label: (context) => `${context.label}: ¥${context.raw.toLocaleString()}`
                                            }
                                        }
                                    }
                                } })), selectedChart === 'staff' && (_jsx(Bar, { data: chartData, options: chartOptions }))] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [_jsxs("h3", { className: "text-lg font-bold text-gray-900 mb-4 flex items-center", children: [_jsx(PieChart, { className: "w-5 h-5 mr-2 text-blue-600" }), "\u30B5\u30FC\u30D3\u30B9\u5225\u58F2\u4E0A\u30E9\u30F3\u30AD\u30F3\u30B0"] }), _jsx("div", { className: "space-y-3", children: serviceAnalysis.slice(0, 8).map((service, index) => (_jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-50 rounded", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: `w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${index === 0 ? 'bg-yellow-500' :
                                                        index === 1 ? 'bg-gray-400' :
                                                            index === 2 ? 'bg-orange-600' : 'bg-blue-500'}`, children: index + 1 }), _jsxs("div", { className: "ml-3", children: [_jsx("div", { className: "font-medium text-gray-900", children: service.service }), _jsxs("div", { className: "text-sm text-gray-500", children: [service.count, "\u4EF6 | \u5E73\u5747\u00A5", Math.round(service.avgPrice).toLocaleString()] })] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "font-bold text-gray-900", children: ["\u00A5", service.revenue.toLocaleString()] }), _jsxs("div", { className: "text-sm text-gray-500", children: [((service.revenue / totalRevenue) * 100).toFixed(1), "%"] })] })] }, service.service))) })] }), _jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [_jsxs("h3", { className: "text-lg font-bold text-gray-900 mb-4 flex items-center", children: [_jsx(Award, { className: "w-5 h-5 mr-2 text-purple-600" }), "\u30B9\u30BF\u30C3\u30D5\u5225\u30D1\u30D5\u30A9\u30FC\u30DE\u30F3\u30B9"] }), _jsx("div", { className: "space-y-3", children: staffAnalysis.map((staff, index) => (_jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-50 rounded", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: `w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${index === 0 ? 'bg-purple-500' : 'bg-gray-500'}`, children: staff.name.charAt(0) }), _jsxs("div", { className: "ml-3", children: [_jsx("div", { className: "font-medium text-gray-900", children: staff.name }), _jsxs("div", { className: "text-sm text-gray-500", children: [staff.count, "\u4EF6 | ", staff.customerCount, "\u540D\u306E\u9867\u5BA2"] })] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "font-bold text-gray-900", children: ["\u00A5", staff.revenue.toLocaleString()] }), _jsxs("div", { className: "text-sm text-gray-500", children: ["\u5E73\u5747\u00A5", Math.round(staff.avgPrice).toLocaleString()] })] })] }, staff.staffId))) })] })] }), _jsxs("div", { className: "bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6", children: [_jsxs("h3", { className: "text-lg font-bold text-gray-900 mb-4 flex items-center", children: [_jsx(Zap, { className: "w-5 h-5 mr-2 text-blue-600" }), "\u30D3\u30B8\u30CD\u30B9\u30A4\u30F3\u30B5\u30A4\u30C8 & \u6539\u5584\u63D0\u6848"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-white p-4 rounded-lg", children: [_jsx("h4", { className: "font-medium text-blue-700 mb-3", children: "\uD83D\uDCC8 \u6210\u9577\u6A5F\u4F1A" }), _jsxs("ul", { className: "text-sm space-y-2", children: [revenueGrowth > 10 && (_jsxs("li", { className: "text-green-600", children: ["\u2022 \u58F2\u4E0A\u304C\u597D\u8ABF\u306B\u6210\u9577\u4E2D\uFF08+", revenueGrowth.toFixed(1), "%\uFF09"] })), serviceAnalysis[0] && (_jsxs("li", { className: "text-blue-600", children: ["\u2022 \u4EBA\u6C17\u30B5\u30FC\u30D3\u30B9\u300C", serviceAnalysis[0].service, "\u300D\u306E\u66F4\u306A\u308B\u5F37\u5316"] })), avgRevenue < 8000 && (_jsxs("li", { className: "text-orange-600", children: ["\u2022 \u5BA2\u5358\u4FA1\u5411\u4E0A\u306E\u4F59\u5730\u3042\u308A\uFF08\u73FE\u5728\u00A5", Math.round(avgRevenue).toLocaleString(), "\uFF09"] })), _jsx("li", { className: "text-purple-600", children: "\u2022 \u65B0\u30B5\u30FC\u30D3\u30B9\u5C0E\u5165\u306B\u3088\u308B\u58F2\u4E0A\u62E1\u5927\u306E\u691C\u8A0E" })] })] }), _jsxs("div", { className: "bg-white p-4 rounded-lg", children: [_jsx("h4", { className: "font-medium text-green-700 mb-3", children: "\uD83C\uDFAF \u5177\u4F53\u7684\u30A2\u30AF\u30B7\u30E7\u30F3" }), _jsxs("ul", { className: "text-sm space-y-2", children: [_jsx("li", { className: "text-green-600", children: "\u2022 \u4EBA\u6C17\u30B5\u30FC\u30D3\u30B9\u306E\u30A2\u30C3\u30D7\u30BB\u30EB\u30FB\u30AF\u30ED\u30B9\u30BB\u30EB\u5F37\u5316" }), _jsx("li", { className: "text-green-600", children: "\u2022 \u4F4E\u30D1\u30D5\u30A9\u30FC\u30DE\u30F3\u30B9\u30B9\u30BF\u30C3\u30D5\u306E\u7814\u4FEE\u5B9F\u65BD" }), _jsx("li", { className: "text-green-600", children: "\u2022 \u5B63\u7BC0\u6027\u3092\u6D3B\u304B\u3057\u305F\u30D7\u30ED\u30E2\u30FC\u30B7\u30E7\u30F3\u4F01\u753B" }), _jsx("li", { className: "text-green-600", children: "\u2022 \u9AD8\u5358\u4FA1\u30E1\u30CB\u30E5\u30FC\u306E\u7A4D\u6975\u7684\u306A\u63D0\u6848" })] })] })] })] })] }));
};
export default SalesDashboard;
