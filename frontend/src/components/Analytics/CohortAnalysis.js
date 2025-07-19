import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { Users, TrendingUp, Calendar, BarChart3, Target, AlertCircle, Download, RefreshCw, Eye, Percent } from 'lucide-react';
import { format, parseISO, startOfMonth, differenceInMonths, addMonths } from 'date-fns';
import { ja } from 'date-fns/locale';
const CohortAnalysis = ({ customers, reservations }) => {
    const [selectedCohort, setSelectedCohort] = useState(null);
    const [viewMode, setViewMode] = useState('percentage');
    // コホート分析の計算
    const cohortAnalysis = useMemo(() => {
        const completedReservations = reservations.filter(r => r.status === 'COMPLETED');
        // 顧客の初回来店月でグループ化
        const customerCohorts = new Map();
        customers.forEach(customer => {
            const firstVisitMonth = format(startOfMonth(parseISO(customer.createdAt)), 'yyyy-MM');
            if (!customerCohorts.has(firstVisitMonth)) {
                customerCohorts.set(firstVisitMonth, []);
            }
            customerCohorts.get(firstVisitMonth).push(customer.id);
        });
        // 各コホートの継続率計算
        const cohortData = [];
        const currentDate = new Date();
        for (const [cohortMonth, customerIds] of customerCohorts.entries()) {
            const cohortStartDate = parseISO(cohortMonth + '-01');
            const monthsFromCohort = differenceInMonths(currentDate, cohortStartDate);
            // 最低6ヶ月のデータがあるコホートのみ分析対象
            if (monthsFromCohort < 1)
                continue;
            const retentionRates = [];
            const maxMonths = Math.min(monthsFromCohort + 1, 12); // 最大12ヶ月まで追跡
            for (let month = 0; month < maxMonths; month++) {
                const targetMonth = addMonths(cohortStartDate, month);
                const targetMonthStart = startOfMonth(targetMonth);
                const targetMonthEnd = addMonths(targetMonthStart, 1);
                // その月に来店した顧客数
                const activeCustomers = customerIds.filter(customerId => {
                    return completedReservations.some(reservation => {
                        const reservationDate = parseISO(reservation.startTime);
                        return reservation.customer?.id === customerId &&
                            reservationDate >= targetMonthStart &&
                            reservationDate < targetMonthEnd;
                    });
                }).length;
                const retentionRate = (activeCustomers / customerIds.length) * 100;
                retentionRates.push(retentionRate);
            }
            cohortData.push({
                cohortMonth,
                cohortSize: customerIds.length,
                retentionRates,
                customerIds
            });
        }
        return cohortData.sort((a, b) => b.cohortMonth.localeCompare(a.cohortMonth));
    }, [customers, reservations]);
    // 継続率の色分け
    const getRetentionColor = (rate) => {
        if (rate >= 80)
            return 'bg-green-500 text-white';
        if (rate >= 60)
            return 'bg-green-400 text-white';
        if (rate >= 40)
            return 'bg-yellow-400 text-black';
        if (rate >= 20)
            return 'bg-orange-400 text-white';
        if (rate > 0)
            return 'bg-red-400 text-white';
        return 'bg-gray-200 text-gray-400';
    };
    // 選択されたコホートの詳細情報
    const selectedCohortData = selectedCohort
        ? cohortAnalysis.find(c => c.cohortMonth === selectedCohort)
        : null;
    // 全体統計
    const avgCohortSize = cohortAnalysis.length > 0
        ? cohortAnalysis.reduce((sum, c) => sum + c.cohortSize, 0) / cohortAnalysis.length
        : 0;
    const avgRetention1Month = cohortAnalysis.length > 0
        ? cohortAnalysis.reduce((sum, c) => sum + (c.retentionRates[1] || 0), 0) / cohortAnalysis.length
        : 0;
    const avgRetention3Month = cohortAnalysis.length > 0
        ? cohortAnalysis.reduce((sum, c) => sum + (c.retentionRates[3] || 0), 0) / cohortAnalysis.length
        : 0;
    const avgRetention6Month = cohortAnalysis.length > 0
        ? cohortAnalysis.reduce((sum, c) => sum + (c.retentionRates[6] || 0), 0) / cohortAnalysis.length
        : 0;
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("h2", { className: "text-2xl font-bold text-gray-900 flex items-center", children: [_jsx(Users, { className: "w-8 h-8 mr-3 text-purple-600" }), "\u30B3\u30DB\u30FC\u30C8\u5206\u6790 (\u9867\u5BA2\u7D99\u7D9A\u7387\u5206\u6790)"] }), _jsx("p", { className: "text-gray-600 mt-1", children: "\u521D\u56DE\u6765\u5E97\u6708\u5225\u306E\u9867\u5BA2\u7D99\u7D9A\u7387\u3068\u30E9\u30A4\u30D5\u30B5\u30A4\u30AF\u30EB\u5206\u6790" })] }), _jsxs("div", { className: "flex space-x-2", children: [_jsxs("button", { onClick: () => setViewMode(viewMode === 'percentage' ? 'absolute' : 'percentage'), className: "btn btn-secondary btn-sm", children: [_jsx(Percent, { className: "w-4 h-4 mr-2" }), viewMode === 'percentage' ? '絶対数表示' : '割合表示'] }), _jsxs("button", { className: "btn btn-secondary btn-sm", children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2" }), "\u518D\u5206\u6790"] }), _jsxs("button", { className: "btn btn-primary btn-sm", children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "\u30EC\u30DD\u30FC\u30C8\u51FA\u529B"] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsx("div", { className: "bg-white p-6 rounded-lg border border-gray-200", children: _jsxs("div", { className: "flex items-center", children: [_jsx(Users, { className: "w-8 h-8 text-blue-600" }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "\u5E73\u5747\u30B3\u30DB\u30FC\u30C8\u30B5\u30A4\u30BA" }), _jsxs("p", { className: "text-2xl font-bold text-gray-900", children: [Math.round(avgCohortSize), "\u540D"] })] })] }) }), _jsx("div", { className: "bg-white p-6 rounded-lg border border-gray-200", children: _jsxs("div", { className: "flex items-center", children: [_jsx(Calendar, { className: "w-8 h-8 text-green-600" }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "1\u30F6\u6708\u7D99\u7D9A\u7387" }), _jsxs("p", { className: "text-2xl font-bold text-gray-900", children: [avgRetention1Month.toFixed(1), "%"] })] })] }) }), _jsx("div", { className: "bg-white p-6 rounded-lg border border-gray-200", children: _jsxs("div", { className: "flex items-center", children: [_jsx(TrendingUp, { className: "w-8 h-8 text-purple-600" }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "3\u30F6\u6708\u7D99\u7D9A\u7387" }), _jsxs("p", { className: "text-2xl font-bold text-gray-900", children: [avgRetention3Month.toFixed(1), "%"] })] })] }) }), _jsx("div", { className: "bg-white p-6 rounded-lg border border-gray-200", children: _jsxs("div", { className: "flex items-center", children: [_jsx(Target, { className: "w-8 h-8 text-orange-600" }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "6\u30F6\u6708\u7D99\u7D9A\u7387" }), _jsxs("p", { className: "text-2xl font-bold text-gray-900", children: [avgRetention6Month.toFixed(1), "%"] })] })] }) })] }), _jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [_jsx("h3", { className: "text-lg font-bold text-gray-900 mb-4", children: "\u30B3\u30DB\u30FC\u30C8\u7D99\u7D9A\u7387\u30C6\u30FC\u30D6\u30EB" }), cohortAnalysis.length > 0 ? (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-gray-200", children: [_jsx("th", { className: "text-left py-3 px-4 font-medium text-gray-900", children: "\u30B3\u30DB\u30FC\u30C8" }), _jsx("th", { className: "text-center py-3 px-4 font-medium text-gray-600", children: "\u30B5\u30A4\u30BA" }), Array.from({ length: 12 }, (_, i) => (_jsx("th", { className: "text-center py-3 px-2 font-medium text-gray-600 text-sm", children: i === 0 ? '当月' : `${i}ヶ月後` }, i)))] }) }), _jsx("tbody", { children: cohortAnalysis.map((cohort) => (_jsxs("tr", { className: `border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${selectedCohort === cohort.cohortMonth ? 'bg-blue-50' : ''}`, onClick: () => setSelectedCohort(selectedCohort === cohort.cohortMonth ? null : cohort.cohortMonth), children: [_jsx("td", { className: "py-3 px-4 font-medium text-gray-900", children: format(parseISO(cohort.cohortMonth + '-01'), 'yyyy年M月', { locale: ja }) }), _jsxs("td", { className: "text-center py-3 px-4 text-gray-600", children: [cohort.cohortSize, "\u540D"] }), Array.from({ length: 12 }, (_, i) => {
                                                const rate = cohort.retentionRates[i];
                                                const absoluteValue = rate !== undefined
                                                    ? Math.round((rate / 100) * cohort.cohortSize)
                                                    : undefined;
                                                return (_jsx("td", { className: "text-center py-3 px-2", children: rate !== undefined ? (_jsx("div", { className: `inline-block px-2 py-1 rounded text-xs font-medium ${getRetentionColor(rate)}`, children: viewMode === 'percentage'
                                                            ? `${rate.toFixed(1)}%`
                                                            : `${absoluteValue}名` })) : (_jsx("span", { className: "text-gray-300", children: "-" })) }, i));
                                            })] }, cohort.cohortMonth))) })] }) })) : (_jsx("div", { className: "text-center py-8 text-gray-500", children: "\u5206\u6790\u53EF\u80FD\u306A\u30B3\u30DB\u30FC\u30C8\u30C7\u30FC\u30BF\u304C\u3042\u308A\u307E\u305B\u3093" }))] }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-4", children: [_jsx("h4", { className: "font-medium text-gray-900 mb-3", children: "\u7D99\u7D9A\u7387\u306E\u8A55\u4FA1\u57FA\u6E96" }), _jsxs("div", { className: "flex flex-wrap gap-4", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "w-4 h-4 bg-green-500 rounded mr-2" }), _jsx("span", { className: "text-sm", children: "\u512A\u79C0 (80%\u4EE5\u4E0A)" })] }), _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "w-4 h-4 bg-green-400 rounded mr-2" }), _jsx("span", { className: "text-sm", children: "\u826F\u597D (60-79%)" })] }), _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "w-4 h-4 bg-yellow-400 rounded mr-2" }), _jsx("span", { className: "text-sm", children: "\u666E\u901A (40-59%)" })] }), _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "w-4 h-4 bg-orange-400 rounded mr-2" }), _jsx("span", { className: "text-sm", children: "\u6CE8\u610F (20-39%)" })] }), _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "w-4 h-4 bg-red-400 rounded mr-2" }), _jsx("span", { className: "text-sm", children: "\u8981\u6539\u5584 (1-19%)" })] })] })] }), selectedCohortData && (_jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("h3", { className: "text-lg font-bold text-gray-900 flex items-center", children: [_jsx(Eye, { className: "w-5 h-5 mr-2 text-blue-600" }), format(parseISO(selectedCohortData.cohortMonth + '-01'), 'yyyy年M月', { locale: ja }), " \u30B3\u30DB\u30FC\u30C8\u8A73\u7D30"] }), _jsx("button", { onClick: () => setSelectedCohort(null), className: "text-gray-400 hover:text-gray-600", children: "\u00D7" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-medium text-gray-900 mb-3", children: "\u57FA\u672C\u60C5\u5831" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "\u521D\u56DE\u6765\u5E97\u6708:" }), _jsx("span", { className: "font-medium", children: format(parseISO(selectedCohortData.cohortMonth + '-01'), 'yyyy年M月', { locale: ja }) })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "\u30B3\u30DB\u30FC\u30C8\u30B5\u30A4\u30BA:" }), _jsxs("span", { className: "font-medium", children: [selectedCohortData.cohortSize, "\u540D"] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "\u73FE\u5728\u306E\u7D99\u7D9A\u7387:" }), _jsxs("span", { className: "font-medium", children: [selectedCohortData.retentionRates[selectedCohortData.retentionRates.length - 1]?.toFixed(1) || 0, "%"] })] })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-gray-900 mb-3", children: "\u4E3B\u8981\u30DE\u30A4\u30EB\u30B9\u30C8\u30FC\u30F3" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "1\u30F6\u6708\u7D99\u7D9A\u7387:" }), _jsxs("span", { className: `font-medium ${(selectedCohortData.retentionRates[1] || 0) >= 60 ? 'text-green-600' : 'text-red-600'}`, children: [selectedCohortData.retentionRates[1]?.toFixed(1) || 0, "%"] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "3\u30F6\u6708\u7D99\u7D9A\u7387:" }), _jsxs("span", { className: `font-medium ${(selectedCohortData.retentionRates[3] || 0) >= 40 ? 'text-green-600' : 'text-red-600'}`, children: [selectedCohortData.retentionRates[3]?.toFixed(1) || 0, "%"] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "6\u30F6\u6708\u7D99\u7D9A\u7387:" }), _jsxs("span", { className: `font-medium ${(selectedCohortData.retentionRates[6] || 0) >= 25 ? 'text-green-600' : 'text-red-600'}`, children: [selectedCohortData.retentionRates[6]?.toFixed(1) || 0, "%"] })] })] })] })] })] })), _jsxs("div", { className: "bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-6", children: [_jsxs("h3", { className: "text-lg font-bold text-gray-900 mb-4 flex items-center", children: [_jsx(BarChart3, { className: "w-5 h-5 mr-2 text-purple-600" }), "\u30B3\u30DB\u30FC\u30C8\u5206\u6790\u30A4\u30F3\u30B5\u30A4\u30C8"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-white p-4 rounded-lg", children: [_jsxs("h4", { className: "font-medium text-gray-900 mb-3 flex items-center", children: [_jsx(AlertCircle, { className: "w-4 h-4 mr-2 text-orange-500" }), "\u8AB2\u984C\u306E\u7279\u5B9A"] }), _jsxs("ul", { className: "text-sm space-y-2", children: [avgRetention1Month < 50 && (_jsx("li", { className: "text-orange-600", children: "\u2022 1\u30F6\u6708\u7D99\u7D9A\u7387\u304C\u4F4E\u3044 - \u521D\u56DE\u4F53\u9A13\u306E\u6539\u5584\u304C\u5FC5\u8981" })), avgRetention3Month < 30 && (_jsx("li", { className: "text-red-600", children: "\u2022 3\u30F6\u6708\u7D99\u7D9A\u7387\u304C\u4F4E\u3044 - \u95A2\u4FC2\u69CB\u7BC9\u5F37\u5316\u304C\u5FC5\u8981" })), avgRetention6Month < 20 && (_jsx("li", { className: "text-red-600", children: "\u2022 6\u30F6\u6708\u7D99\u7D9A\u7387\u304C\u4F4E\u3044 - \u30ED\u30A4\u30E4\u30EA\u30C6\u30A3\u5411\u4E0A\u65BD\u7B56\u304C\u5FC5\u8981" })), cohortAnalysis.length > 2 && (_jsxs("li", { className: "text-blue-600", children: ["\u2022 \u6700\u65B0\u30B3\u30DB\u30FC\u30C8\u306E\u50BE\u5411: ", cohortAnalysis[0].retentionRates[1] > cohortAnalysis[1].retentionRates[1]
                                                        ? '改善傾向'
                                                        : '注意が必要'] }))] })] }), _jsxs("div", { className: "bg-white p-4 rounded-lg", children: [_jsxs("h4", { className: "font-medium text-gray-900 mb-3 flex items-center", children: [_jsx(Target, { className: "w-4 h-4 mr-2 text-green-500" }), "\u6539\u5584\u30A2\u30AF\u30B7\u30E7\u30F3"] }), _jsxs("ul", { className: "text-sm space-y-2", children: [_jsx("li", { className: "text-green-600", children: "\u2022 \u521D\u56DE\u6765\u5E97\u6642\u306E\u9867\u5BA2\u4F53\u9A13\u5411\u4E0A\u30D7\u30ED\u30B0\u30E9\u30E0" }), _jsx("li", { className: "text-green-600", children: "\u2022 2-3\u30F6\u6708\u76EE\u306E\u30D5\u30A9\u30ED\u30FC\u30A2\u30C3\u30D7\u5F37\u5316" }), _jsx("li", { className: "text-green-600", children: "\u2022 \u30ED\u30A4\u30E4\u30EA\u30C6\u30A3\u30D7\u30ED\u30B0\u30E9\u30E0\u306E\u5C0E\u5165" }), _jsx("li", { className: "text-green-600", children: "\u2022 \u5B9A\u671F\u30E1\u30F3\u30C6\u30CA\u30F3\u30B9\u63D0\u6848\u306E\u5236\u5EA6\u5316" })] })] })] })] })] }));
};
export default CohortAnalysis;
