import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { BarChart3, TrendingUp, Users, DollarSign, Calendar, Target, Award, AlertTriangle, Download, RefreshCw } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';
const RFMAnalysis = ({ customers, reservations }) => {
    const [selectedSegment, setSelectedSegment] = useState(null);
    const [analysisDate] = useState(new Date()); // 分析基準日
    // RFM分析の計算
    const rfmAnalysis = useMemo(() => {
        const completedReservations = reservations.filter(r => r.status === 'COMPLETED' && r.price);
        const customerMetrics = customers.map(customer => {
            const customerReservations = completedReservations.filter(r => r.customer?.id === customer.id);
            // Recency: 最終来店からの日数（少ないほど良い）
            const recency = customer.lastVisitDate
                ? differenceInDays(analysisDate, parseISO(customer.lastVisitDate))
                : 9999;
            // Frequency: 来店回数（多いほど良い）
            const frequency = customer.visitCount;
            // Monetary: 総支払額（多いほど良い）
            const monetary = customerReservations.reduce((sum, r) => sum + (r.price || 0), 0);
            return {
                customer,
                recency,
                frequency,
                monetary,
                avgSpend: frequency > 0 ? monetary / frequency : 0
            };
        });
        // RFMスコアの計算（1-5段階）
        const recencyQuintiles = calculateQuintiles(customerMetrics.map(c => c.recency), true); // 逆順
        const frequencyQuintiles = calculateQuintiles(customerMetrics.map(c => c.frequency));
        const monetaryQuintiles = calculateQuintiles(customerMetrics.map(c => c.monetary));
        const rfmCustomers = customerMetrics.map(({ customer, recency, frequency, monetary, avgSpend }) => {
            const rScore = getRFMScore(recency, recencyQuintiles, true);
            const fScore = getRFMScore(frequency, frequencyQuintiles);
            const mScore = getRFMScore(monetary, monetaryQuintiles);
            const rfmScore = `${rScore}${fScore}${mScore}`;
            const segment = getCustomerSegment(rScore, fScore, mScore);
            return {
                customer,
                recency,
                frequency,
                monetary,
                avgSpend,
                rScore,
                fScore,
                mScore,
                rfmScore,
                segment
            };
        });
        return rfmCustomers;
    }, [customers, reservations, analysisDate]);
    // 分位点計算
    const calculateQuintiles = (values, reverse = false) => {
        const sorted = [...values].sort((a, b) => reverse ? b - a : a - b);
        const length = sorted.length;
        return [
            sorted[Math.floor(length * 0.2)],
            sorted[Math.floor(length * 0.4)],
            sorted[Math.floor(length * 0.6)],
            sorted[Math.floor(length * 0.8)]
        ];
    };
    // RFMスコア計算
    const getRFMScore = (value, quintiles, reverse = false) => {
        if (reverse) {
            if (value <= quintiles[0])
                return 5;
            if (value <= quintiles[1])
                return 4;
            if (value <= quintiles[2])
                return 3;
            if (value <= quintiles[3])
                return 2;
            return 1;
        }
        else {
            if (value >= quintiles[3])
                return 5;
            if (value >= quintiles[2])
                return 4;
            if (value >= quintiles[1])
                return 3;
            if (value >= quintiles[0])
                return 2;
            return 1;
        }
    };
    // 顧客セグメント判定
    const getCustomerSegment = (r, f, m) => {
        const total = r + f + m;
        if (r >= 4 && f >= 4 && m >= 4)
            return 'Champions';
        if (r >= 3 && f >= 3 && m >= 4)
            return 'Loyal Customers';
        if (r >= 4 && f <= 2 && m >= 3)
            return 'Potential Loyalists';
        if (r >= 4 && f <= 2 && m <= 2)
            return 'New Customers';
        if (r <= 2 && f >= 3 && m >= 3)
            return 'At Risk';
        if (r <= 2 && f <= 2 && m >= 4)
            return "Can't Lose Them";
        if (r >= 3 && f <= 2 && m <= 2)
            return 'Promising';
        if (r <= 2 && f >= 3 && m <= 2)
            return 'Need Attention';
        if (r <= 2 && f <= 2 && m <= 2)
            return 'Lost Customers';
        return 'Others';
    };
    // セグメント統計
    const segmentStats = useMemo(() => {
        const segments = [
            {
                segment: 'Champions',
                description: 'ベストカスタマー',
                characteristics: ['最近来店', '高頻度', '高単価'],
                actions: ['VIP特典提供', '新サービス先行案内', '紹介プログラム参加'],
                color: 'bg-green-500',
                priority: 'high'
            },
            {
                segment: 'Loyal Customers',
                description: 'ロイヤルカスタマー',
                characteristics: ['定期来店', '安定支出'],
                actions: ['ポイント特典', '誕生日特典', '定期メンテナンス提案'],
                color: 'bg-blue-500',
                priority: 'high'
            },
            {
                segment: 'Potential Loyalists',
                description: '優良見込み客',
                characteristics: ['最近来店', '今後に期待'],
                actions: ['フォローアップ強化', '次回予約促進', 'アップセル提案'],
                color: 'bg-purple-500',
                priority: 'medium'
            },
            {
                segment: 'New Customers',
                description: '新規顧客',
                characteristics: ['初回来店', '関係構築段階'],
                actions: ['丁寧な接客', '次回予約割引', 'サービス説明強化'],
                color: 'bg-cyan-500',
                priority: 'medium'
            },
            {
                segment: 'At Risk',
                description: '離反危険客',
                characteristics: ['来店間隔増加', '要注意'],
                actions: ['特別オファー', 'パーソナライズ提案', '満足度調査'],
                color: 'bg-orange-500',
                priority: 'high'
            },
            {
                segment: "Can't Lose Them",
                description: '重要顧客',
                characteristics: ['高価値', '離反兆候'],
                actions: ['緊急フォロー', 'VIP待遇', '個別相談'],
                color: 'bg-red-500',
                priority: 'high'
            },
            {
                segment: 'Promising',
                description: '期待新人',
                characteristics: ['最近来店', '育成対象'],
                actions: ['関係構築', 'サービス体験促進', '継続来店促進'],
                color: 'bg-indigo-500',
                priority: 'medium'
            },
            {
                segment: 'Need Attention',
                description: '注意必要客',
                characteristics: ['以前は優良', '最近減少'],
                actions: ['状況確認', 'ニーズ再調査', '改善提案'],
                color: 'bg-yellow-500',
                priority: 'medium'
            },
            {
                segment: 'Lost Customers',
                description: '離反顧客',
                characteristics: ['長期未来店', '関係断絶'],
                actions: ['復帰キャンペーン', '特別割引', '理由調査'],
                color: 'bg-gray-500',
                priority: 'low'
            }
        ];
        return segments.map(segment => {
            const count = rfmAnalysis.filter(c => c.segment === segment.segment).length;
            const percentage = customers.length > 0 ? (count / customers.length) * 100 : 0;
            return {
                ...segment,
                count,
                percentage
            };
        }).filter(s => s.count > 0);
    }, [rfmAnalysis, customers.length]);
    // セグメント別統計
    const selectedSegmentCustomers = selectedSegment
        ? rfmAnalysis.filter(c => c.segment === selectedSegment)
        : [];
    const totalRevenue = rfmAnalysis.reduce((sum, c) => sum + c.monetary, 0);
    const avgRecency = rfmAnalysis.reduce((sum, c) => sum + c.recency, 0) / rfmAnalysis.length;
    const avgFrequency = rfmAnalysis.reduce((sum, c) => sum + c.frequency, 0) / rfmAnalysis.length;
    const avgMonetary = totalRevenue / rfmAnalysis.length;
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("h2", { className: "text-2xl font-bold text-gray-900 flex items-center", children: [_jsx(BarChart3, { className: "w-8 h-8 mr-3 text-blue-600" }), "RFM\u5206\u6790 (\u9867\u5BA2\u30BB\u30B0\u30E1\u30F3\u30C8\u5206\u6790)"] }), _jsx("p", { className: "text-gray-600 mt-1", children: "Recency (\u6700\u65B0\u6027) \u00D7 Frequency (\u983B\u5EA6) \u00D7 Monetary (\u91D1\u984D) \u306B\u3088\u308B\u9AD8\u5EA6\u306A\u9867\u5BA2\u5206\u6790" })] }), _jsxs("div", { className: "flex space-x-2", children: [_jsxs("button", { className: "btn btn-secondary btn-sm", children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2" }), "\u518D\u5206\u6790"] }), _jsxs("button", { className: "btn btn-primary btn-sm", children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "\u30EC\u30DD\u30FC\u30C8\u51FA\u529B"] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsx("div", { className: "bg-white p-6 rounded-lg border border-gray-200", children: _jsxs("div", { className: "flex items-center", children: [_jsx(Users, { className: "w-8 h-8 text-blue-600" }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "\u7DCF\u9867\u5BA2\u6570" }), _jsxs("p", { className: "text-2xl font-bold text-gray-900", children: [customers.length, "\u540D"] })] })] }) }), _jsx("div", { className: "bg-white p-6 rounded-lg border border-gray-200", children: _jsxs("div", { className: "flex items-center", children: [_jsx(Calendar, { className: "w-8 h-8 text-green-600" }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "\u5E73\u5747\u6765\u5E97\u9593\u9694" }), _jsxs("p", { className: "text-2xl font-bold text-gray-900", children: [Math.round(avgRecency), "\u65E5"] })] })] }) }), _jsx("div", { className: "bg-white p-6 rounded-lg border border-gray-200", children: _jsxs("div", { className: "flex items-center", children: [_jsx(TrendingUp, { className: "w-8 h-8 text-purple-600" }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "\u5E73\u5747\u6765\u5E97\u56DE\u6570" }), _jsxs("p", { className: "text-2xl font-bold text-gray-900", children: [avgFrequency.toFixed(1), "\u56DE"] })] })] }) }), _jsx("div", { className: "bg-white p-6 rounded-lg border border-gray-200", children: _jsxs("div", { className: "flex items-center", children: [_jsx(DollarSign, { className: "w-8 h-8 text-yellow-600" }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "\u5E73\u5747\u9867\u5BA2\u5358\u4FA1" }), _jsxs("p", { className: "text-2xl font-bold text-gray-900", children: ["\u00A5", Math.round(avgMonetary).toLocaleString()] })] })] }) })] }), _jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [_jsx("h3", { className: "text-lg font-bold text-gray-900 mb-4", children: "\u9867\u5BA2\u30BB\u30B0\u30E1\u30F3\u30C8\u5206\u6790" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: segmentStats.map((segment) => (_jsxs("button", { onClick: () => setSelectedSegment(selectedSegment === segment.segment ? null : segment.segment), className: `p-4 rounded-lg border-2 transition-all text-left ${selectedSegment === segment.segment
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300 bg-white'}`, children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: `w-4 h-4 rounded ${segment.color} mr-2` }), _jsx("h4", { className: "font-medium text-gray-900", children: segment.segment })] }), segment.priority === 'high' && (_jsx(AlertTriangle, { className: "w-4 h-4 text-red-500" }))] }), _jsx("p", { className: "text-sm text-gray-600 mb-2", children: segment.description }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("span", { className: "text-lg font-bold text-gray-900", children: [segment.count, "\u540D"] }), _jsxs("span", { className: "text-sm text-gray-500", children: [segment.percentage.toFixed(1), "%"] })] })] }, segment.segment))) })] }), selectedSegment && (_jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("h3", { className: "text-lg font-bold text-gray-900 flex items-center", children: [_jsx(Target, { className: "w-5 h-5 mr-2 text-blue-600" }), selectedSegment, " \u30BB\u30B0\u30E1\u30F3\u30C8\u8A73\u7D30"] }), _jsx("button", { onClick: () => setSelectedSegment(null), className: "text-gray-400 hover:text-gray-600", children: "\u00D7" })] }), (() => {
                        const segment = segmentStats.find(s => s.segment === selectedSegment);
                        if (!segment)
                            return null;
                        return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-medium text-gray-900 mb-2", children: "\u7279\u5FB4" }), _jsx("ul", { className: "text-sm text-gray-600 space-y-1", children: segment.characteristics.map((char, i) => (_jsxs("li", { children: ["\u2022 ", char] }, i))) })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-gray-900 mb-2", children: "\u63A8\u5968\u30A2\u30AF\u30B7\u30E7\u30F3" }), _jsx("ul", { className: "text-sm text-gray-600 space-y-1", children: segment.actions.map((action, i) => (_jsxs("li", { children: ["\u2022 ", action] }, i))) })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-gray-900 mb-2", children: "\u7D71\u8A08\u60C5\u5831" }), _jsxs("div", { className: "text-sm text-gray-600 space-y-1", children: [_jsxs("div", { children: ["\u9867\u5BA2\u6570: ", segment.count, "\u540D"] }), _jsxs("div", { children: ["\u69CB\u6210\u6BD4: ", segment.percentage.toFixed(1), "%"] }), _jsxs("div", { children: ["\u7DCF\u58F2\u4E0A\u8CA2\u732E: \u00A5", selectedSegmentCustomers.reduce((sum, c) => sum + c.monetary, 0).toLocaleString()] })] })] })] }), _jsxs("div", { className: "border-t pt-4", children: [_jsx("h4", { className: "font-medium text-gray-900 mb-3", children: "\u8A72\u5F53\u9867\u5BA2\u4E00\u89A7" }), _jsx("div", { className: "max-h-64 overflow-y-auto", children: _jsx("div", { className: "grid grid-cols-1 gap-2", children: selectedSegmentCustomers.map((rfmCustomer) => (_jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-50 rounded", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium", children: rfmCustomer.customer.name }), _jsxs("div", { className: "text-xs text-gray-500", children: ["RFM\u30B9\u30B3\u30A2: ", rfmCustomer.rfmScore, " | \u6700\u7D42\u6765\u5E97: ", rfmCustomer.recency, "\u65E5\u524D | \u6765\u5E97\u56DE\u6570: ", rfmCustomer.frequency, "\u56DE"] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "font-medium", children: ["\u00A5", rfmCustomer.monetary.toLocaleString()] }), _jsxs("div", { className: "text-xs text-gray-500", children: ["\u5358\u4FA1: \u00A5", Math.round(rfmCustomer.avgSpend).toLocaleString()] })] })] }, rfmCustomer.customer.id))) }) })] })] }));
                    })()] })), _jsxs("div", { className: "bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6", children: [_jsxs("h3", { className: "text-lg font-bold text-gray-900 mb-4 flex items-center", children: [_jsx(Award, { className: "w-5 h-5 mr-2 text-blue-600" }), "\u63A8\u5968\u30DE\u30FC\u30B1\u30C6\u30A3\u30F3\u30B0\u30A2\u30AF\u30B7\u30E7\u30F3"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "bg-white p-4 rounded-lg", children: [_jsx("h4", { className: "font-medium text-red-700 mb-2", children: "\uD83D\uDEA8 \u7DCA\u6025\u5BFE\u5FDC\u304C\u5FC5\u8981" }), _jsx("ul", { className: "text-sm space-y-1", children: segmentStats
                                            .filter(s => s.priority === 'high' && ['At Risk', "Can't Lose Them"].includes(s.segment))
                                            .map(s => (_jsxs("li", { children: ["\u2022 ", s.segment, ": ", s.count, "\u540D - \u7279\u5225\u30D5\u30A9\u30ED\u30FC\u30A2\u30C3\u30D7\u5B9F\u65BD"] }, s.segment))) })] }), _jsxs("div", { className: "bg-white p-4 rounded-lg", children: [_jsx("h4", { className: "font-medium text-green-700 mb-2", children: "\uD83D\uDC8E \u512A\u826F\u9867\u5BA2\u5F37\u5316\u65BD\u7B56" }), _jsx("ul", { className: "text-sm space-y-1", children: segmentStats
                                            .filter(s => ['Champions', 'Loyal Customers'].includes(s.segment))
                                            .map(s => (_jsxs("li", { children: ["\u2022 ", s.segment, ": ", s.count, "\u540D - VIP\u7279\u5178\u30FB\u7D39\u4ECB\u5236\u5EA6\u5F37\u5316"] }, s.segment))) })] })] })] })] }));
};
export default RFMAnalysis;
