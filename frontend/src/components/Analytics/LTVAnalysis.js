import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { DollarSign, TrendingUp, Users, Target, Crown, Award, AlertTriangle, Download, RefreshCw, Eye, Calculator } from 'lucide-react';
import { parseISO, differenceInDays } from 'date-fns';
const LTVAnalysis = ({ customers, reservations }) => {
    const [selectedTier, setSelectedTier] = useState(null);
    const [selectedMetric, setSelectedMetric] = useState('current');
    // LTV計算
    const ltvAnalysis = useMemo(() => {
        const completedReservations = reservations.filter(r => r.status === 'COMPLETED' && r.price);
        const currentDate = new Date();
        const customerLTVs = customers.map(customer => {
            const customerReservations = completedReservations.filter(r => r.customer?.id === customer.id);
            // 基本メトリクス計算
            const totalRevenue = customerReservations.reduce((sum, r) => sum + (r.price || 0), 0);
            const averageOrderValue = customerReservations.length > 0
                ? totalRevenue / customerReservations.length
                : 0;
            // 顧客ライフスパン（日数）
            const firstVisit = parseISO(customer.createdAt);
            const lastVisit = customer.lastVisitDate ? parseISO(customer.lastVisitDate) : firstVisit;
            const customerLifespanDays = Math.max(differenceInDays(lastVisit, firstVisit), 1);
            const customerLifespan = customerLifespanDays / 365.25; // 年単位
            // 購入頻度（年間）
            const purchaseFrequency = customerLifespan > 0
                ? customerReservations.length / customerLifespan
                : 0;
            // 現在のLTV
            const ltvValue = averageOrderValue * purchaseFrequency * customerLifespan;
            // 予測LTV（今後3年間）
            const daysSinceLastVisit = customer.lastVisitDate
                ? differenceInDays(currentDate, parseISO(customer.lastVisitDate))
                : 0;
            // チャーン確率計算（最終来店からの経過日数ベース）
            const churnProbability = Math.min(daysSinceLastVisit / 365, 0.9);
            const nextVisitProbability = Math.max(1 - churnProbability, 0.1);
            // 予測LTV（リスク考慮）
            const futureYears = 3;
            const decayFactor = Math.pow(nextVisitProbability, futureYears);
            const predictedLTV = ltvValue + (averageOrderValue * purchaseFrequency * futureYears * decayFactor);
            // LTVティア判定
            const ltvTier = getLTVTier(selectedMetric === 'current' ? ltvValue : predictedLTV);
            // リスクスコア（0-100、高いほど危険）
            const riskScore = Math.min((daysSinceLastVisit / 30) * 10 + // 最終来店からの経過月数
                (customerLifespan < 0.5 ? 30 : 0) + // 新規顧客リスク
                (purchaseFrequency < 2 ? 20 : 0) + // 低頻度リスク
                (averageOrderValue < 5000 ? 15 : 0), // 低単価リスク
            100);
            return {
                customer,
                totalRevenue,
                averageOrderValue,
                purchaseFrequency,
                customerLifespan,
                ltvValue,
                predictedLTV,
                ltvTier,
                riskScore,
                nextVisitProbability
            };
        });
        return customerLTVs.sort((a, b) => {
            const valueA = selectedMetric === 'current' ? a.ltvValue : a.predictedLTV;
            const valueB = selectedMetric === 'current' ? b.ltvValue : b.predictedLTV;
            return valueB - valueA;
        });
    }, [customers, reservations, selectedMetric]);
    // LTVティア判定
    const getLTVTier = (ltv) => {
        if (ltv >= 100000)
            return 'Platinum';
        if (ltv >= 50000)
            return 'Gold';
        if (ltv >= 25000)
            return 'Silver';
        if (ltv >= 10000)
            return 'Bronze';
        return 'Basic';
    };
    // ティア別統計
    const tierStats = useMemo(() => {
        const tiers = ['Platinum', 'Gold', 'Silver', 'Bronze', 'Basic'];
        return tiers.map(tier => {
            const tierCustomers = ltvAnalysis.filter(c => c.ltvTier === tier);
            const totalValue = tierCustomers.reduce((sum, c) => sum + (selectedMetric === 'current' ? c.ltvValue : c.predictedLTV), 0);
            const avgValue = tierCustomers.length > 0 ? totalValue / tierCustomers.length : 0;
            return {
                tier,
                count: tierCustomers.length,
                percentage: ltvAnalysis.length > 0 ? (tierCustomers.length / ltvAnalysis.length) * 100 : 0,
                totalValue,
                avgValue,
                color: getTierColor(tier)
            };
        }).filter(t => t.count > 0);
    }, [ltvAnalysis, selectedMetric]);
    // ティア色
    const getTierColor = (tier) => {
        const colors = {
            'Platinum': 'bg-purple-500',
            'Gold': 'bg-yellow-500',
            'Silver': 'bg-gray-400',
            'Bronze': 'bg-orange-600',
            'Basic': 'bg-blue-500'
        };
        return colors[tier] || 'bg-gray-500';
    };
    // ティアアイコン
    const getTierIcon = (tier) => {
        switch (tier) {
            case 'Platinum': return _jsx(Crown, { className: "w-5 h-5 text-purple-600" });
            case 'Gold': return _jsx(Award, { className: "w-5 h-5 text-yellow-600" });
            case 'Silver': return _jsx(Target, { className: "w-5 h-5 text-gray-600" });
            case 'Bronze': return _jsx(Users, { className: "w-5 h-5 text-orange-600" });
            default: return _jsx(Users, { className: "w-5 h-5 text-blue-600" });
        }
    };
    // 全体統計
    const totalLTV = ltvAnalysis.reduce((sum, c) => sum + (selectedMetric === 'current' ? c.ltvValue : c.predictedLTV), 0);
    const avgLTV = ltvAnalysis.length > 0 ? totalLTV / ltvAnalysis.length : 0;
    const avgOrderValue = ltvAnalysis.reduce((sum, c) => sum + c.averageOrderValue, 0) / ltvAnalysis.length;
    const avgFrequency = ltvAnalysis.reduce((sum, c) => sum + c.purchaseFrequency, 0) / ltvAnalysis.length;
    // 選択されたティアの顧客
    const selectedTierCustomers = selectedTier
        ? ltvAnalysis.filter(c => c.ltvTier === selectedTier)
        : [];
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("h2", { className: "text-2xl font-bold text-gray-900 flex items-center", children: [_jsx(DollarSign, { className: "w-8 h-8 mr-3 text-green-600" }), "LTV\u5206\u6790 (\u9867\u5BA2\u751F\u6DAF\u4FA1\u5024)"] }), _jsx("p", { className: "text-gray-600 mt-1", children: "Customer Lifetime Value \u306B\u3088\u308B\u9867\u5BA2\u4FA1\u5024\u3068\u30DD\u30C6\u30F3\u30B7\u30E3\u30EB\u5206\u6790" })] }), _jsxs("div", { className: "flex space-x-2", children: [_jsxs("select", { value: selectedMetric, onChange: (e) => setSelectedMetric(e.target.value), className: "px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: "current", children: "\u73FE\u5728LTV" }), _jsx("option", { value: "predicted", children: "\u4E88\u6E2CLTV" })] }), _jsxs("button", { className: "btn btn-secondary btn-sm", children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2" }), "\u518D\u8A08\u7B97"] }), _jsxs("button", { className: "btn btn-primary btn-sm", children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "\u30EC\u30DD\u30FC\u30C8\u51FA\u529B"] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsx("div", { className: "bg-white p-6 rounded-lg border border-gray-200", children: _jsxs("div", { className: "flex items-center", children: [_jsx(Calculator, { className: "w-8 h-8 text-green-600" }), _jsxs("div", { className: "ml-4", children: [_jsxs("p", { className: "text-sm font-medium text-gray-600", children: ["\u5E73\u5747", selectedMetric === 'current' ? '現在' : '予測', "LTV"] }), _jsxs("p", { className: "text-2xl font-bold text-gray-900", children: ["\u00A5", Math.round(avgLTV).toLocaleString()] })] })] }) }), _jsx("div", { className: "bg-white p-6 rounded-lg border border-gray-200", children: _jsxs("div", { className: "flex items-center", children: [_jsx(DollarSign, { className: "w-8 h-8 text-blue-600" }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "\u5E73\u5747\u6CE8\u6587\u5358\u4FA1" }), _jsxs("p", { className: "text-2xl font-bold text-gray-900", children: ["\u00A5", Math.round(avgOrderValue).toLocaleString()] })] })] }) }), _jsx("div", { className: "bg-white p-6 rounded-lg border border-gray-200", children: _jsxs("div", { className: "flex items-center", children: [_jsx(TrendingUp, { className: "w-8 h-8 text-purple-600" }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "\u5E73\u5747\u5E74\u9593\u6765\u5E97\u56DE\u6570" }), _jsxs("p", { className: "text-2xl font-bold text-gray-900", children: [avgFrequency.toFixed(1), "\u56DE"] })] })] }) }), _jsx("div", { className: "bg-white p-6 rounded-lg border border-gray-200", children: _jsxs("div", { className: "flex items-center", children: [_jsx(Users, { className: "w-8 h-8 text-orange-600" }), _jsxs("div", { className: "ml-4", children: [_jsxs("p", { className: "text-sm font-medium text-gray-600", children: ["\u7DCF", selectedMetric === 'current' ? '現在' : '予測', "LTV"] }), _jsxs("p", { className: "text-2xl font-bold text-gray-900", children: ["\u00A5", Math.round(totalLTV).toLocaleString()] })] })] }) })] }), _jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [_jsx("h3", { className: "text-lg font-bold text-gray-900 mb-4", children: "LTV\u30C6\u30A3\u30A2\u5225\u5206\u6790" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: tierStats.map((tier) => (_jsxs("button", { onClick: () => setSelectedTier(selectedTier === tier.tier ? null : tier.tier), className: `p-4 rounded-lg border-2 transition-all text-left ${selectedTier === tier.tier
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300 bg-white'}`, children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("div", { className: "flex items-center", children: [getTierIcon(tier.tier), _jsx("span", { className: "ml-2 font-medium text-gray-900", children: tier.tier })] }), tier.tier === 'Platinum' && (_jsx(Crown, { className: "w-4 h-4 text-purple-500" }))] }), _jsxs("div", { className: "space-y-1", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("span", { className: "text-lg font-bold text-gray-900", children: [tier.count, "\u540D"] }), _jsxs("span", { className: "text-sm text-gray-500", children: [tier.percentage.toFixed(1), "%"] })] }), _jsxs("div", { className: "text-sm text-gray-600", children: ["\u5E73\u5747LTV: \u00A5", Math.round(tier.avgValue).toLocaleString()] }), _jsxs("div", { className: "text-sm text-gray-600", children: ["\u7DCF\u4FA1\u5024: \u00A5", Math.round(tier.totalValue).toLocaleString()] })] })] }, tier.tier))) })] }), selectedTier && (_jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("h3", { className: "text-lg font-bold text-gray-900 flex items-center", children: [_jsx(Eye, { className: "w-5 h-5 mr-2 text-blue-600" }), selectedTier, " \u30C6\u30A3\u30A2\u8A73\u7D30"] }), _jsx("button", { onClick: () => setSelectedTier(null), className: "text-gray-400 hover:text-gray-600", children: "\u00D7" })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-medium text-gray-900 mb-2", children: "\u57FA\u672C\u7D71\u8A08" }), _jsxs("div", { className: "space-y-1 text-sm", children: [_jsxs("div", { children: ["\u9867\u5BA2\u6570: ", selectedTierCustomers.length, "\u540D"] }), _jsxs("div", { children: ["\u69CB\u6210\u6BD4: ", ((selectedTierCustomers.length / ltvAnalysis.length) * 100).toFixed(1), "%"] })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-gray-900 mb-2", children: "\u5E73\u5747\u30E1\u30C8\u30EA\u30AF\u30B9" }), _jsxs("div", { className: "space-y-1 text-sm", children: [_jsxs("div", { children: ["\u5E73\u5747LTV: \u00A5", Math.round(selectedTierCustomers.reduce((sum, c) => sum + (selectedMetric === 'current' ? c.ltvValue : c.predictedLTV), 0) / selectedTierCustomers.length).toLocaleString()] }), _jsxs("div", { children: ["\u5E73\u5747\u5358\u4FA1: \u00A5", Math.round(selectedTierCustomers.reduce((sum, c) => sum + c.averageOrderValue, 0) / selectedTierCustomers.length).toLocaleString()] })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-gray-900 mb-2", children: "\u30EA\u30B9\u30AF\u5206\u6790" }), _jsxs("div", { className: "space-y-1 text-sm", children: [_jsxs("div", { children: ["\u5E73\u5747\u30EA\u30B9\u30AF\u30B9\u30B3\u30A2: ", Math.round(selectedTierCustomers.reduce((sum, c) => sum + c.riskScore, 0) / selectedTierCustomers.length)] }), _jsxs("div", { children: ["\u9AD8\u30EA\u30B9\u30AF\u9867\u5BA2: ", selectedTierCustomers.filter(c => c.riskScore > 70).length, "\u540D"] })] })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-gray-900 mb-3", children: "\u9867\u5BA2\u8A73\u7D30" }), _jsx("div", { className: "max-h-64 overflow-y-auto", children: _jsxs("div", { className: "space-y-2", children: [selectedTierCustomers.slice(0, 10).map((ltvCustomer) => (_jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-50 rounded border", children: [_jsxs("div", { children: [_jsxs("div", { className: "font-medium flex items-center", children: [ltvCustomer.customer.name, ltvCustomer.riskScore > 70 && (_jsx(AlertTriangle, { className: "w-4 h-4 text-red-500 ml-2" }))] }), _jsxs("div", { className: "text-xs text-gray-500", children: ["\u5358\u4FA1: \u00A5", Math.round(ltvCustomer.averageOrderValue).toLocaleString(), " | \u983B\u5EA6: ", ltvCustomer.purchaseFrequency.toFixed(1), "\u56DE/\u5E74 | \u30EA\u30B9\u30AF: ", Math.round(ltvCustomer.riskScore)] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "font-medium", children: ["\u00A5", Math.round(selectedMetric === 'current' ? ltvCustomer.ltvValue : ltvCustomer.predictedLTV).toLocaleString()] }), _jsxs("div", { className: "text-xs text-gray-500", children: [selectedMetric === 'current' ? '現在' : '予測', "LTV"] })] })] }, ltvCustomer.customer.id))), selectedTierCustomers.length > 10 && (_jsxs("div", { className: "text-center text-sm text-gray-500 py-2", children: ["\u4ED6 ", selectedTierCustomers.length - 10, "\u540D"] }))] }) })] })] })] })), _jsxs("div", { className: "bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 p-6", children: [_jsxs("h3", { className: "text-lg font-bold text-gray-900 mb-4 flex items-center", children: [_jsx(Target, { className: "w-5 h-5 mr-2 text-green-600" }), "LTV\u5411\u4E0A\u30A2\u30AF\u30B7\u30E7\u30F3\u30D7\u30E9\u30F3"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "bg-white p-4 rounded-lg", children: [_jsxs("h4", { className: "font-medium text-purple-700 mb-2 flex items-center", children: [_jsx(Crown, { className: "w-4 h-4 mr-2" }), "\u9AD8\u4FA1\u5024\u9867\u5BA2\u80B2\u6210"] }), _jsxs("ul", { className: "text-sm space-y-1", children: [_jsx("li", { children: "\u2022 Platinum/Gold\u9867\u5BA2\u306EVIP\u7279\u5178\u5F37\u5316" }), _jsx("li", { children: "\u2022 \u30D1\u30FC\u30BD\u30CA\u30E9\u30A4\u30BA\u3055\u308C\u305F\u30B5\u30FC\u30D3\u30B9\u63D0\u6848" }), _jsx("li", { children: "\u2022 \u5C02\u5C5E\u30B9\u30BF\u30A4\u30EA\u30B9\u30C8\u5236\u5EA6\u306E\u5C0E\u5165" }), _jsx("li", { children: "\u2022 \u9650\u5B9A\u30A4\u30D9\u30F3\u30C8\u30FB\u5148\u884C\u4E88\u7D04\u6A29\u306E\u63D0\u4F9B" })] })] }), _jsxs("div", { className: "bg-white p-4 rounded-lg", children: [_jsxs("h4", { className: "font-medium text-orange-700 mb-2 flex items-center", children: [_jsx(AlertTriangle, { className: "w-4 h-4 mr-2" }), "\u30EA\u30B9\u30AF\u9867\u5BA2\u5BFE\u5FDC"] }), _jsxs("ul", { className: "text-sm space-y-1", children: [_jsx("li", { children: "\u2022 \u9AD8\u30EA\u30B9\u30AF\u30B9\u30B3\u30A2\u9867\u5BA2\u3078\u306E\u7DCA\u6025\u30D5\u30A9\u30ED\u30FC" }), _jsx("li", { children: "\u2022 \u6765\u5E97\u9593\u9694\u306E\u5EF6\u9577\u50BE\u5411\u9867\u5BA2\u3078\u306E\u7279\u5225\u30AA\u30D5\u30A1\u30FC" }), _jsx("li", { children: "\u2022 \u6E80\u8DB3\u5EA6\u8ABF\u67FB\u3068\u30D5\u30A3\u30FC\u30C9\u30D0\u30C3\u30AF\u53CE\u96C6" }), _jsx("li", { children: "\u2022 \u500B\u5225\u30AB\u30A6\u30F3\u30BB\u30EA\u30F3\u30B0\u306E\u5B9F\u65BD" })] })] }), _jsxs("div", { className: "bg-white p-4 rounded-lg", children: [_jsxs("h4", { className: "font-medium text-blue-700 mb-2 flex items-center", children: [_jsx(TrendingUp, { className: "w-4 h-4 mr-2" }), "\u4FA1\u5024\u5411\u4E0A\u65BD\u7B56"] }), _jsxs("ul", { className: "text-sm space-y-1", children: [_jsx("li", { children: "\u2022 \u5E73\u5747\u5358\u4FA1\u5411\u4E0A\u306E\u305F\u3081\u306E\u30A2\u30C3\u30D7\u30BB\u30EB\u5F37\u5316" }), _jsx("li", { children: "\u2022 \u6765\u5E97\u983B\u5EA6\u5411\u4E0A\u306E\u305F\u3081\u306E\u30E1\u30F3\u30C6\u30CA\u30F3\u30B9\u63D0\u6848" }), _jsx("li", { children: "\u2022 \u65B0\u30B5\u30FC\u30D3\u30B9\u30FB\u5546\u54C1\u306E\u7A4D\u6975\u7684\u306A\u63D0\u6848" }), _jsx("li", { children: "\u2022 \u30E9\u30A4\u30D5\u30B9\u30BF\u30A4\u30EB\u63D0\u6848\u578B\u306E\u63A5\u5BA2" })] })] })] })] })] }));
};
export default LTVAnalysis;
