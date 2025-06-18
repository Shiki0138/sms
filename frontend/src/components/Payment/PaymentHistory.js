import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { CreditCard, Calendar, MapPin, Search, Filter, Download, ChevronDown, ChevronRight, DollarSign, Clock, CheckCircle, XCircle, AlertCircle, RotateCcw } from 'lucide-react';
const PaymentHistory = ({ customerId, showCustomerInfo = false, pageSize = 20 }) => {
    const [payments, setPayments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedPayment, setExpandedPayment] = useState(null);
    // フィルタリング・検索
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [methodFilter, setMethodFilter] = useState('all');
    const [dateRange, setDateRange] = useState({
        start: '',
        end: ''
    });
    // ページネーション
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    useEffect(() => {
        loadPaymentHistory();
    }, [customerId, currentPage, statusFilter, methodFilter, searchTerm, dateRange]);
    const loadPaymentHistory = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: pageSize.toString(),
                ...(customerId && { customerId }),
                ...(statusFilter !== 'all' && { status: statusFilter }),
                ...(methodFilter !== 'all' && { paymentMethod: methodFilter }),
                ...(searchTerm && { search: searchTerm }),
                ...(dateRange.start && { startDate: dateRange.start }),
                ...(dateRange.end && { endDate: dateRange.end })
            });
            const response = await fetch(`/api/v1/payments/history?${params}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) {
                throw new Error('決済履歴の取得に失敗しました');
            }
            const data = await response.json();
            if (currentPage === 1) {
                setPayments(data.payments);
            }
            else {
                setPayments(prev => [...prev, ...data.payments]);
            }
            setTotalCount(data.totalCount);
            setHasMore(data.hasMore);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : '決済履歴の取得に失敗しました');
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleRefund = async (paymentId, amount) => {
        try {
            const response = await fetch(`/api/v1/payments/${paymentId}/refund`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    amount: amount || undefined,
                    reason: 'customer_request'
                })
            });
            if (!response.ok) {
                throw new Error('返金処理に失敗しました');
            }
            // 履歴を再読み込み
            loadPaymentHistory();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : '返金処理に失敗しました');
        }
    };
    const handleDownloadReceipt = (receiptUrl) => {
        window.open(receiptUrl, '_blank');
    };
    const getStatusIcon = (status) => {
        switch (status) {
            case 'succeeded':
                return _jsx(CheckCircle, { className: "w-5 h-5 text-green-500" });
            case 'pending':
                return _jsx(Clock, { className: "w-5 h-5 text-yellow-500" });
            case 'failed':
                return _jsx(XCircle, { className: "w-5 h-5 text-red-500" });
            case 'refunded':
                return _jsx(RotateCcw, { className: "w-5 h-5 text-blue-500" });
            case 'canceled':
                return _jsx(XCircle, { className: "w-5 h-5 text-gray-500" });
            default:
                return _jsx(AlertCircle, { className: "w-5 h-5 text-gray-500" });
        }
    };
    const getStatusLabel = (status) => {
        switch (status) {
            case 'succeeded':
                return '成功';
            case 'pending':
                return '処理中';
            case 'failed':
                return '失敗';
            case 'refunded':
                return '返金済み';
            case 'canceled':
                return 'キャンセル';
            default:
                return status;
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'succeeded':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'pending':
                return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'failed':
                return 'text-red-600 bg-red-50 border-red-200';
            case 'refunded':
                return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'canceled':
                return 'text-gray-600 bg-gray-50 border-gray-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };
    const getPaymentMethodIcon = (type) => {
        switch (type) {
            case 'card':
                return _jsx(CreditCard, { className: "w-5 h-5" });
            case 'konbini':
                return _jsx(MapPin, { className: "w-5 h-5" });
            case 'bank_transfer':
                return _jsx(Calendar, { className: "w-5 h-5" });
            default:
                return _jsx(CreditCard, { className: "w-5 h-5" });
        }
    };
    const getPaymentMethodLabel = (type, details) => {
        switch (type) {
            case 'card':
                return `${details.brand?.toUpperCase()} •••• ${details.last4}`;
            case 'konbini':
                return 'コンビニ決済';
            case 'bank_transfer':
                return '銀行振込';
            default:
                return '不明';
        }
    };
    const filteredPayments = payments.filter(payment => {
        const matchesSearch = searchTerm === '' ||
            payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (payment.customerInfo?.name.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesSearch;
    });
    const resetFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setMethodFilter('all');
        setDateRange({ start: '', end: '' });
        setCurrentPage(1);
    };
    if (isLoading && currentPage === 1) {
        return (_jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "h-8 bg-gray-200 rounded w-1/4 animate-pulse" }), [1, 2, 3, 4, 5].map(i => (_jsx("div", { className: "bg-gray-200 rounded-lg h-20 animate-pulse" }, i)))] }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("h2", { className: "text-2xl font-bold text-gray-900 flex items-center", children: [_jsx(DollarSign, { className: "w-6 h-6 mr-2 text-blue-600" }), "\u6C7A\u6E08\u5C65\u6B74"] }), _jsxs("div", { className: "text-sm text-gray-500", children: ["\u5168", totalCount, "\u4EF6\u306E\u6C7A\u6E08\u8A18\u9332"] })] }), _jsxs("div", { className: "bg-white p-6 rounded-lg border border-gray-200", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u691C\u7D22" }), _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" }), _jsx("input", { type: "text", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), placeholder: "\u9818\u53CE\u66F8\u756A\u53F7\u3001\u8AAC\u660E\u3001\u9867\u5BA2\u540D...", className: "w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u30B9\u30C6\u30FC\u30BF\u30B9" }), _jsxs("select", { value: statusFilter, onChange: (e) => setStatusFilter(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500", children: [_jsx("option", { value: "all", children: "\u3059\u3079\u3066" }), _jsx("option", { value: "succeeded", children: "\u6210\u529F" }), _jsx("option", { value: "pending", children: "\u51E6\u7406\u4E2D" }), _jsx("option", { value: "failed", children: "\u5931\u6557" }), _jsx("option", { value: "refunded", children: "\u8FD4\u91D1\u6E08\u307F" }), _jsx("option", { value: "canceled", children: "\u30AD\u30E3\u30F3\u30BB\u30EB" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u6C7A\u6E08\u65B9\u6CD5" }), _jsxs("select", { value: methodFilter, onChange: (e) => setMethodFilter(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500", children: [_jsx("option", { value: "all", children: "\u3059\u3079\u3066" }), _jsx("option", { value: "card", children: "\u30AF\u30EC\u30B8\u30C3\u30C8\u30AB\u30FC\u30C9" }), _jsx("option", { value: "konbini", children: "\u30B3\u30F3\u30D3\u30CB\u6C7A\u6E08" }), _jsx("option", { value: "bank_transfer", children: "\u9280\u884C\u632F\u8FBC" })] })] }), _jsx("div", { className: "flex items-end", children: _jsxs("button", { onClick: resetFilters, className: "flex items-center px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200", children: [_jsx(Filter, { className: "w-4 h-4 mr-1" }), "\u30EA\u30BB\u30C3\u30C8"] }) })] }), _jsxs("div", { className: "mt-4 grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u958B\u59CB\u65E5" }), _jsx("input", { type: "date", value: dateRange.start, onChange: (e) => setDateRange(prev => ({ ...prev, start: e.target.value })), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u7D42\u4E86\u65E5" }), _jsx("input", { type: "date", value: dateRange.end, onChange: (e) => setDateRange(prev => ({ ...prev, end: e.target.value })), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" })] })] })] }), error && (_jsx("div", { className: "bg-red-50 border border-red-200 rounded-md p-4", children: _jsxs("div", { className: "flex items-center", children: [_jsx(AlertCircle, { className: "w-5 h-5 text-red-500 mr-2" }), _jsx("span", { className: "text-red-700", children: error })] }) })), _jsx("div", { className: "space-y-4", children: filteredPayments.length === 0 ? (_jsxs("div", { className: "text-center py-12 bg-gray-50 rounded-lg", children: [_jsx(DollarSign, { className: "w-12 h-12 text-gray-300 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "\u6C7A\u6E08\u5C65\u6B74\u304C\u3042\u308A\u307E\u305B\u3093" }), _jsx("p", { className: "text-gray-500", children: "\u6761\u4EF6\u306B\u4E00\u81F4\u3059\u308B\u6C7A\u6E08\u8A18\u9332\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3067\u3057\u305F\u3002" })] })) : (filteredPayments.map((payment) => (_jsxs("div", { className: "bg-white rounded-lg border border-gray-200 overflow-hidden", children: [_jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("div", { className: "text-gray-600", children: getPaymentMethodIcon(payment.paymentMethod.type) }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs("h3", { className: "text-lg font-semibold text-gray-900", children: ["\u00A5", payment.amount.toLocaleString()] }), _jsxs("div", { className: `px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(payment.status)}`, children: [getStatusIcon(payment.status), _jsx("span", { className: "ml-1", children: getStatusLabel(payment.status) })] })] }), _jsx("div", { className: "text-sm text-gray-600 mt-1", children: getPaymentMethodLabel(payment.paymentMethod.type, payment.paymentMethod.details) }), _jsxs("div", { className: "text-xs text-gray-500 mt-1", children: [payment.created.toLocaleString('ja-JP'), " \u2022 ", payment.receiptNumber] })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [payment.receiptUrl && (_jsx("button", { onClick: () => handleDownloadReceipt(payment.receiptUrl), className: "p-2 text-gray-400 hover:text-blue-600", title: "\u9818\u53CE\u66F8\u3092\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9", children: _jsx(Download, { className: "w-4 h-4" }) })), _jsx("button", { onClick: () => setExpandedPayment(expandedPayment === payment.id ? null : payment.id), className: "p-2 text-gray-400 hover:text-gray-600", children: expandedPayment === payment.id ? (_jsx(ChevronDown, { className: "w-4 h-4" })) : (_jsx(ChevronRight, { className: "w-4 h-4" })) })] })] }), _jsxs("div", { className: "mt-3", children: [_jsx("p", { className: "text-gray-700", children: payment.description }), showCustomerInfo && payment.customerInfo && (_jsxs("p", { className: "text-sm text-gray-500 mt-1", children: ["\u304A\u5BA2\u69D8: ", payment.customerInfo.name, " (", payment.customerInfo.email, ")"] }))] })] }), expandedPayment === payment.id && (_jsx("div", { className: "border-t border-gray-200 bg-gray-50 p-6", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [payment.splitPayment && (_jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-gray-900 mb-2", children: "\u5206\u5272\u6255\u3044\u60C5\u5831" }), _jsxs("div", { className: "space-y-1 text-sm text-gray-600", children: [_jsxs("div", { children: ["\u7A2E\u5225: ", payment.splitPayment.isDeposit ? '前払い金' : '残金'] }), _jsxs("div", { children: ["\u524D\u6255\u3044\u91D1: \u00A5", payment.splitPayment.depositAmount.toLocaleString()] }), _jsxs("div", { children: ["\u6B8B\u91D1: \u00A5", payment.splitPayment.remainingAmount.toLocaleString()] }), _jsxs("div", { children: ["\u7DCF\u984D: \u00A5", payment.splitPayment.totalAmount.toLocaleString()] })] })] })), payment.serviceInfo && (_jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-gray-900 mb-2", children: "\u30B5\u30FC\u30D3\u30B9\u60C5\u5831" }), _jsxs("div", { className: "space-y-1 text-sm text-gray-600", children: [_jsxs("div", { children: ["\u30B5\u30FC\u30D3\u30B9: ", payment.serviceInfo.serviceName] }), _jsxs("div", { children: ["\u62C5\u5F53: ", payment.serviceInfo.stylist] }), _jsxs("div", { children: ["\u4E88\u7D04\u65E5: ", payment.serviceInfo.date.toLocaleString('ja-JP')] })] })] })), payment.refundAmount && (_jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-gray-900 mb-2", children: "\u8FD4\u91D1\u60C5\u5831" }), _jsxs("div", { className: "text-sm text-gray-600", children: ["\u8FD4\u91D1\u984D: \u00A5", payment.refundAmount.toLocaleString()] })] })), payment.status === 'succeeded' && !payment.refundAmount && (_jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-gray-900 mb-2", children: "\u64CD\u4F5C" }), _jsxs("button", { onClick: () => {
                                                    if (confirm('この決済を返金しますか？')) {
                                                        handleRefund(payment.id);
                                                    }
                                                }, className: "text-sm text-red-600 hover:text-red-800", children: [_jsx(RotateCcw, { className: "w-4 h-4 inline mr-1" }), "\u8FD4\u91D1\u51E6\u7406"] })] }))] }) }))] }, payment.id)))) }), hasMore && (_jsx("div", { className: "text-center", children: _jsx("button", { onClick: () => setCurrentPage(prev => prev + 1), disabled: isLoading, className: "bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed", children: isLoading ? '読み込み中...' : 'さらに読み込む' }) }))] }));
};
export default PaymentHistory;
