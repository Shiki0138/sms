import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { Database, Merge, Users, Calendar, TrendingUp, AlertTriangle, CheckCircle, RefreshCw, Filter, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
const DataIntegrationManager = ({ hotpepperData, existingCustomers, existingReservations, onDataMerge }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [integrationStatus, setIntegrationStatus] = useState('idle');
    const [integrationStats, setIntegrationStats] = useState(null);
    const [customerMatches, setCustomerMatches] = useState([]);
    const [selectedDateRange, setSelectedDateRange] = useState({
        start: format(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        end: format(new Date(), 'yyyy-MM-dd')
    });
    // 顧客マッチング処理
    const performCustomerMatching = useMemo(() => {
        const matches = [];
        hotpepperData.forEach(record => {
            let bestMatch = null;
            let matchConfidence = 0;
            let matchMethod = 'new';
            // 1. 電話番号での完全一致
            if (record.customerPhone) {
                const phoneMatch = existingCustomers.find(c => c.phone && c.phone.replace(/[-\s]/g, '') === record.customerPhone.replace(/[-\s]/g, ''));
                if (phoneMatch) {
                    bestMatch = phoneMatch;
                    matchConfidence = 100;
                    matchMethod = 'exact_phone';
                }
            }
            // 2. 名前での完全一致（電話番号一致がない場合）
            if (!bestMatch && record.customerName) {
                const nameMatch = existingCustomers.find(c => c.name === record.customerName);
                if (nameMatch) {
                    bestMatch = nameMatch;
                    matchConfidence = 85;
                    matchMethod = 'exact_name';
                }
            }
            // 3. 名前での曖昧一致（漢字・ひらがな・カタカナの違いを考慮）
            if (!bestMatch && record.customerName) {
                const fuzzyMatch = existingCustomers.find(c => {
                    const similarity = calculateNameSimilarity(c.name, record.customerName);
                    return similarity > 0.8;
                });
                if (fuzzyMatch) {
                    bestMatch = fuzzyMatch;
                    matchConfidence = 70;
                    matchMethod = 'fuzzy_name';
                }
            }
            matches.push({
                hotpepperRecord: record,
                existingCustomer: bestMatch,
                matchConfidence,
                matchMethod
            });
        });
        return matches;
    }, [hotpepperData, existingCustomers]);
    // 名前の類似度計算
    const calculateNameSimilarity = (name1, name2) => {
        // シンプルなレーベンシュタイン距離ベースの類似度
        const maxLength = Math.max(name1.length, name2.length);
        if (maxLength === 0)
            return 1;
        const distance = levenshteinDistance(name1, name2);
        return 1 - distance / maxLength;
    };
    const levenshteinDistance = (str1, str2) => {
        const matrix = [];
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                }
                else {
                    matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
                }
            }
        }
        return matrix[str2.length][str1.length];
    };
    // データ統合処理
    const performDataIntegration = async () => {
        setIsProcessing(true);
        setIntegrationStatus('processing');
        try {
            const matches = performCustomerMatching;
            setCustomerMatches(matches);
            // フィルタリング（日付範囲）
            const filteredHotpepperData = hotpepperData.filter(record => {
                if (!record.reservationDate)
                    return false;
                const recordDate = record.reservationDate.split(' ')[0]; // 日付部分のみ取得
                return recordDate >= selectedDateRange.start && recordDate <= selectedDateRange.end;
            });
            // 統計計算
            const newCustomers = [];
            const updatedCustomers = [...existingCustomers];
            const newReservations = [];
            let hotpepperRevenue = 0;
            const existingRevenue = existingReservations.reduce((sum, r) => sum + (r.price || 0), 0);
            matches.forEach(match => {
                if (filteredHotpepperData.includes(match.hotpepperRecord)) {
                    hotpepperRevenue += match.hotpepperRecord.price;
                    // 新規顧客の作成
                    if (match.matchMethod === 'new') {
                        const newCustomer = {
                            id: `hp_${match.hotpepperRecord.id}`,
                            customerNumber: `HP${Date.now()}${Math.random().toString(36).substr(2, 4)}`,
                            name: match.hotpepperRecord.customerName,
                            phone: match.hotpepperRecord.customerPhone,
                            email: match.hotpepperRecord.customerEmail,
                            visitCount: 1,
                            lastVisitDate: match.hotpepperRecord.reservationDate,
                            createdAt: match.hotpepperRecord.reservationDate
                        };
                        newCustomers.push(newCustomer);
                    }
                    else if (match.existingCustomer) {
                        // 既存顧客の更新
                        const customerIndex = updatedCustomers.findIndex(c => c.id === match.existingCustomer.id);
                        if (customerIndex >= 0) {
                            updatedCustomers[customerIndex] = {
                                ...updatedCustomers[customerIndex],
                                visitCount: updatedCustomers[customerIndex].visitCount + 1,
                                lastVisitDate: match.hotpepperRecord.reservationDate
                            };
                        }
                    }
                    // 新規予約の作成
                    const newReservation = {
                        id: `hp_res_${match.hotpepperRecord.id}`,
                        startTime: match.hotpepperRecord.reservationDate,
                        customerName: match.hotpepperRecord.customerName,
                        customer: match.existingCustomer ? {
                            id: match.existingCustomer.id,
                            name: match.existingCustomer.name
                        } : {
                            id: `hp_${match.hotpepperRecord.id}`,
                            name: match.hotpepperRecord.customerName
                        },
                        status: match.hotpepperRecord.status.toUpperCase(),
                        price: match.hotpepperRecord.price
                    };
                    newReservations.push(newReservation);
                }
            });
            // 重複予約のチェック
            const duplicateCount = newReservations.filter(newRes => existingReservations.some(existingRes => existingRes.customerName === newRes.customerName &&
                Math.abs(new Date(existingRes.startTime).getTime() - new Date(newRes.startTime).getTime()) < 60 * 60 * 1000 // 1時間以内
            )).length;
            // 統計の計算
            const stats = {
                totalHotpepperRecords: filteredHotpepperData.length,
                newCustomers: newCustomers.length,
                existingCustomersUpdated: matches.filter(m => m.existingCustomer && filteredHotpepperData.includes(m.hotpepperRecord)).length,
                newReservations: newReservations.length,
                duplicateReservations: duplicateCount,
                conversionRate: filteredHotpepperData.length > 0 ?
                    (filteredHotpepperData.filter(d => d.status === 'completed').length / filteredHotpepperData.length) * 100 : 0,
                dateRange: filteredHotpepperData.length > 0 ? {
                    start: Math.min(...filteredHotpepperData.map(d => new Date(d.reservationDate).getTime())).toString(),
                    end: Math.max(...filteredHotpepperData.map(d => new Date(d.reservationDate).getTime())).toString()
                } : null,
                revenueBySource: {
                    hotpepper: hotpepperRevenue,
                    existing: existingRevenue,
                    total: hotpepperRevenue + existingRevenue
                }
            };
            setIntegrationStats(stats);
            setIntegrationStatus('completed');
            // 統合データを親コンポーネントに返す
            onDataMerge({
                customers: [...updatedCustomers, ...newCustomers],
                reservations: [...existingReservations, ...newReservations],
                integrationStats: stats
            });
        }
        catch (error) {
            console.error('Integration error:', error);
            setIntegrationStatus('error');
        }
        finally {
            setIsProcessing(false);
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [_jsxs("h2", { className: "text-xl font-bold text-gray-900 flex items-center mb-4", children: [_jsx(Merge, { className: "w-6 h-6 mr-2 text-blue-600" }), "\u30C7\u30FC\u30BF\u7D71\u5408\u7BA1\u7406"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "flex items-center p-3 bg-orange-50 rounded-lg", children: [_jsx(Database, { className: "w-8 h-8 text-orange-600 mr-3" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "\u30DB\u30C3\u30C8\u30DA\u30C3\u30D1\u30FC\u30C7\u30FC\u30BF" }), _jsxs("p", { className: "text-lg font-bold text-gray-900", children: [hotpepperData.length, "\u4EF6"] })] })] }), _jsxs("div", { className: "flex items-center p-3 bg-blue-50 rounded-lg", children: [_jsx(Users, { className: "w-8 h-8 text-blue-600 mr-3" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "\u65E2\u5B58\u9867\u5BA2" }), _jsxs("p", { className: "text-lg font-bold text-gray-900", children: [existingCustomers.length, "\u540D"] })] })] }), _jsxs("div", { className: "flex items-center p-3 bg-green-50 rounded-lg", children: [_jsx(Calendar, { className: "w-8 h-8 text-green-600 mr-3" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "\u65E2\u5B58\u4E88\u7D04" }), _jsxs("p", { className: "text-lg font-bold text-gray-900", children: [existingReservations.length, "\u4EF6"] })] })] })] })] }), _jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [_jsxs("h3", { className: "text-lg font-bold text-gray-900 mb-4 flex items-center", children: [_jsx(Filter, { className: "w-5 h-5 mr-2 text-blue-600" }), "\u7D71\u5408\u8A2D\u5B9A"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u958B\u59CB\u65E5" }), _jsx("input", { type: "date", value: selectedDateRange.start, onChange: (e) => setSelectedDateRange(prev => ({ ...prev, start: e.target.value })), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u7D42\u4E86\u65E5" }), _jsx("input", { type: "date", value: selectedDateRange.end, onChange: (e) => setSelectedDateRange(prev => ({ ...prev, end: e.target.value })), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" })] })] }), _jsx("button", { onClick: performDataIntegration, disabled: isProcessing || hotpepperData.length === 0, className: "btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed", children: isProcessing ? (_jsxs(_Fragment, { children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2 animate-spin" }), "\u7D71\u5408\u51E6\u7406\u4E2D..."] })) : (_jsxs(_Fragment, { children: [_jsx(Merge, { className: "w-4 h-4 mr-2" }), "\u30C7\u30FC\u30BF\u7D71\u5408\u3092\u5B9F\u884C"] })) })] }), integrationStatus === 'completed' && integrationStats && (_jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("h3", { className: "text-lg font-bold text-gray-900 flex items-center", children: [_jsx(CheckCircle, { className: "w-5 h-5 mr-2 text-green-600" }), "\u7D71\u5408\u5B8C\u4E86"] }), _jsx("span", { className: "text-sm text-gray-500", children: format(new Date(), 'yyyy/MM/dd HH:mm', { locale: ja }) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6", children: [_jsx("div", { className: "bg-blue-50 p-4 rounded-lg", children: _jsxs("div", { className: "flex items-center", children: [_jsx(Database, { className: "w-6 h-6 text-blue-600 mr-2" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "\u51E6\u7406\u30C7\u30FC\u30BF\u6570" }), _jsx("p", { className: "text-xl font-bold text-gray-900", children: integrationStats.totalHotpepperRecords })] })] }) }), _jsx("div", { className: "bg-green-50 p-4 rounded-lg", children: _jsxs("div", { className: "flex items-center", children: [_jsx(Users, { className: "w-6 h-6 text-green-600 mr-2" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "\u65B0\u898F\u9867\u5BA2" }), _jsx("p", { className: "text-xl font-bold text-gray-900", children: integrationStats.newCustomers })] })] }) }), _jsx("div", { className: "bg-purple-50 p-4 rounded-lg", children: _jsxs("div", { className: "flex items-center", children: [_jsx(TrendingUp, { className: "w-6 h-6 text-purple-600 mr-2" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "\u5B8C\u4E86\u7387" }), _jsxs("p", { className: "text-xl font-bold text-gray-900", children: [integrationStats.conversionRate.toFixed(1), "%"] })] })] }) }), _jsx("div", { className: "bg-yellow-50 p-4 rounded-lg", children: _jsxs("div", { className: "flex items-center", children: [_jsx(BarChart3, { className: "w-6 h-6 text-yellow-600 mr-2" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "\u58F2\u4E0A\u8CA2\u732E" }), _jsxs("p", { className: "text-xl font-bold text-gray-900", children: ["\u00A5", integrationStats.revenueBySource.hotpepper.toLocaleString()] })] })] }) })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "bg-gray-50 p-4 rounded-lg", children: [_jsx("h4", { className: "font-medium text-gray-900 mb-3", children: "\u7D71\u5408\u30B5\u30DE\u30EA\u30FC" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("h5", { className: "font-medium text-gray-700 mb-2", children: "\u9867\u5BA2\u7D71\u5408\u7D50\u679C" }), _jsxs("ul", { className: "space-y-1 text-gray-600", children: [_jsxs("li", { children: ["\u2022 \u65B0\u898F\u9867\u5BA2: ", integrationStats.newCustomers, "\u540D"] }), _jsxs("li", { children: ["\u2022 \u65E2\u5B58\u9867\u5BA2\u66F4\u65B0: ", integrationStats.existingCustomersUpdated, "\u540D"] }), _jsxs("li", { children: ["\u2022 \u91CD\u8907\u4E88\u7D04\u691C\u51FA: ", integrationStats.duplicateReservations, "\u4EF6"] })] })] }), _jsxs("div", { children: [_jsx("h5", { className: "font-medium text-gray-700 mb-2", children: "\u58F2\u4E0A\u5206\u6790" }), _jsxs("ul", { className: "space-y-1 text-gray-600", children: [_jsxs("li", { children: ["\u2022 \u30DB\u30C3\u30C8\u30DA\u30C3\u30D1\u30FC: \u00A5", integrationStats.revenueBySource.hotpepper.toLocaleString()] }), _jsxs("li", { children: ["\u2022 \u65E2\u5B58\u30B7\u30B9\u30C6\u30E0: \u00A5", integrationStats.revenueBySource.existing.toLocaleString()] }), _jsxs("li", { children: ["\u2022 \u7DCF\u58F2\u4E0A: \u00A5", integrationStats.revenueBySource.total.toLocaleString()] })] })] })] })] }), integrationStats.duplicateReservations > 0 && (_jsxs("div", { className: "bg-yellow-50 border border-yellow-200 p-4 rounded-lg", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(AlertTriangle, { className: "w-5 h-5 text-yellow-600 mr-2" }), _jsxs("span", { className: "font-medium text-yellow-800", children: [integrationStats.duplicateReservations, "\u4EF6\u306E\u91CD\u8907\u4E88\u7D04\u304C\u691C\u51FA\u3055\u308C\u307E\u3057\u305F"] })] }), _jsx("p", { className: "text-sm text-yellow-700 mt-1", children: "\u624B\u52D5\u3067\u78BA\u8A8D\u30FB\u8ABF\u6574\u304C\u5FC5\u8981\u306A\u5834\u5408\u304C\u3042\u308A\u307E\u3059\u3002" })] }))] })] })), integrationStatus === 'error' && (_jsxs("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(AlertTriangle, { className: "w-5 h-5 text-red-600 mr-2" }), _jsx("span", { className: "font-medium text-red-800", children: "\u30C7\u30FC\u30BF\u7D71\u5408\u30A8\u30E9\u30FC" })] }), _jsx("p", { className: "text-sm text-red-700 mt-1", children: "\u30C7\u30FC\u30BF\u5F62\u5F0F\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002\u30B5\u30DD\u30FC\u30C8\u306B\u304A\u554F\u3044\u5408\u308F\u305B\u3044\u305F\u3060\u304F\u3053\u3068\u3082\u53EF\u80FD\u3067\u3059\u3002" })] })), customerMatches.length > 0 && (_jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [_jsx("h3", { className: "text-lg font-bold text-gray-900 mb-4", children: "\u9867\u5BA2\u30DE\u30C3\u30C1\u30F3\u30B0\u7D50\u679C" }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-2 text-left text-xs font-medium text-gray-500", children: "\u30DB\u30C3\u30C8\u30DA\u30C3\u30D1\u30FC\u9867\u5BA2" }), _jsx("th", { className: "px-4 py-2 text-left text-xs font-medium text-gray-500", children: "\u30DE\u30C3\u30C1\u30F3\u30B0\u7D50\u679C" }), _jsx("th", { className: "px-4 py-2 text-left text-xs font-medium text-gray-500", children: "\u4FE1\u983C\u5EA6" }), _jsx("th", { className: "px-4 py-2 text-left text-xs font-medium text-gray-500", children: "\u30DE\u30C3\u30C1\u30F3\u30B0\u65B9\u6CD5" })] }) }), _jsx("tbody", { className: "divide-y divide-gray-200", children: customerMatches.slice(0, 10).map((match, index) => (_jsxs("tr", { children: [_jsx("td", { className: "px-4 py-2 text-sm", children: _jsxs("div", { children: [_jsx("div", { className: "font-medium text-gray-900", children: match.hotpepperRecord.customerName }), _jsx("div", { className: "text-gray-500", children: match.hotpepperRecord.customerPhone })] }) }), _jsx("td", { className: "px-4 py-2 text-sm", children: match.existingCustomer ? (_jsxs("div", { children: [_jsx("div", { className: "font-medium text-gray-900", children: match.existingCustomer.name }), _jsx("div", { className: "text-gray-500", children: match.existingCustomer.customerNumber })] })) : (_jsx("span", { className: "text-blue-600 font-medium", children: "\u65B0\u898F\u9867\u5BA2" })) }), _jsx("td", { className: "px-4 py-2 text-sm", children: _jsxs("span", { className: `px-2 py-1 rounded-full text-xs font-medium ${match.matchConfidence >= 90 ? 'bg-green-100 text-green-800' :
                                                        match.matchConfidence >= 70 ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'}`, children: [match.matchConfidence, "%"] }) }), _jsxs("td", { className: "px-4 py-2 text-sm text-gray-600", children: [match.matchMethod === 'exact_phone' && '電話番号一致', match.matchMethod === 'exact_name' && '名前一致', match.matchMethod === 'fuzzy_name' && '名前類似', match.matchMethod === 'new' && '新規'] })] }, index))) })] }) })] }))] }));
};
export default DataIntegrationManager;
