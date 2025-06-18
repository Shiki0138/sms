import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { CheckCircle, CreditCard, Calendar, MapPin, Download, Mail, Copy, Clock, AlertCircle, Printer, Share2 } from 'lucide-react';
const PaymentConfirmation = ({ paymentIntentId, customerId, reservationId, onContinue, onPrintReceipt }) => {
    const [paymentDetails, setPaymentDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [receiptSent, setReceiptSent] = useState(false);
    const [copied, setCopied] = useState(false);
    useEffect(() => {
        loadPaymentDetails();
    }, [paymentIntentId]);
    const loadPaymentDetails = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch(`/api/v1/payments/${paymentIntentId}/details`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) {
                throw new Error('決済情報の取得に失敗しました');
            }
            const data = await response.json();
            setPaymentDetails(data.payment);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : '決済情報の取得に失敗しました');
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleSendReceipt = async () => {
        try {
            const response = await fetch(`/api/v1/payments/${paymentIntentId}/send-receipt`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) {
                throw new Error('領収書の送信に失敗しました');
            }
            setReceiptSent(true);
            setTimeout(() => setReceiptSent(false), 3000);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : '領収書の送信に失敗しました');
        }
    };
    const handleCopyPaymentId = () => {
        navigator.clipboard.writeText(paymentDetails?.id || '');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    const handleDownloadReceipt = () => {
        if (paymentDetails?.receiptUrl) {
            window.open(paymentDetails.receiptUrl, '_blank');
        }
    };
    const getPaymentMethodIcon = (type) => {
        switch (type) {
            case 'card':
                return _jsx(CreditCard, { className: "w-6 h-6" });
            case 'konbini':
                return _jsx(MapPin, { className: "w-6 h-6" });
            case 'bank_transfer':
                return _jsx(Calendar, { className: "w-6 h-6" });
            default:
                return _jsx(CreditCard, { className: "w-6 h-6" });
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
                return '不明な決済方法';
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'succeeded':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'requires_payment_method':
                return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'processing':
                return 'text-blue-600 bg-blue-50 border-blue-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };
    const getStatusLabel = (status) => {
        switch (status) {
            case 'succeeded':
                return '決済完了';
            case 'requires_payment_method':
                return '支払い待ち';
            case 'processing':
                return '処理中';
            default:
                return status;
        }
    };
    if (isLoading) {
        return (_jsx("div", { className: "max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8", children: _jsxs("div", { className: "animate-pulse space-y-4", children: [_jsx("div", { className: "h-8 bg-gray-200 rounded w-3/4 mx-auto" }), _jsx("div", { className: "h-32 bg-gray-200 rounded" }), _jsx("div", { className: "h-4 bg-gray-200 rounded w-1/2" }), _jsx("div", { className: "h-4 bg-gray-200 rounded w-2/3" })] }) }));
    }
    if (error) {
        return (_jsx("div", { className: "max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8", children: _jsxs("div", { className: "text-center", children: [_jsx(AlertCircle, { className: "w-16 h-16 text-red-500 mx-auto mb-4" }), _jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-2", children: "\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F" }), _jsx("p", { className: "text-gray-600 mb-6", children: error }), _jsx("button", { onClick: loadPaymentDetails, className: "bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700", children: "\u518D\u8A66\u884C" })] }) }));
    }
    if (!paymentDetails) {
        return null;
    }
    return (_jsxs("div", { className: "max-w-2xl mx-auto bg-white rounded-lg shadow-lg", children: [_jsx("div", { className: "bg-gradient-to-r from-green-500 to-green-600 text-white p-8 rounded-t-lg", children: _jsxs("div", { className: "text-center", children: [_jsx(CheckCircle, { className: "w-16 h-16 mx-auto mb-4" }), _jsx("h1", { className: "text-3xl font-bold mb-2", children: "\u304A\u652F\u6255\u3044\u5B8C\u4E86" }), _jsx("p", { className: "text-green-100", children: paymentDetails.splitPayment?.isDeposit
                                ? '前払い金のお支払いが完了しました'
                                : 'お支払いが正常に完了しました' })] }) }), _jsxs("div", { className: "p-8 space-y-6", children: [_jsxs("div", { className: "bg-gray-50 rounded-lg p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "\u6C7A\u6E08\u8A73\u7D30" }), _jsx("div", { className: `px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(paymentDetails.status)}`, children: getStatusLabel(paymentDetails.status) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-500 mb-1", children: "\u304A\u652F\u6255\u3044\u91D1\u984D" }), _jsxs("div", { className: "text-2xl font-bold text-gray-900", children: ["\u00A5", paymentDetails.amount.toLocaleString()] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-500 mb-1", children: "\u6C7A\u6E08\u65B9\u6CD5" }), _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "text-gray-600 mr-2", children: getPaymentMethodIcon(paymentDetails.paymentMethod.type) }), _jsx("span", { className: "text-gray-900 font-medium", children: getPaymentMethodLabel(paymentDetails.paymentMethod.type, paymentDetails.paymentMethod.details) })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-500 mb-1", children: "\u6C7A\u6E08ID" }), _jsxs("div", { className: "flex items-center", children: [_jsx("span", { className: "text-sm text-gray-700 font-mono mr-2", children: paymentDetails.id.slice(-12) }), _jsx("button", { onClick: handleCopyPaymentId, className: "text-blue-600 hover:text-blue-700", title: "\u6C7A\u6E08ID\u3092\u30B3\u30D4\u30FC", children: _jsx(Copy, { className: "w-4 h-4" }) }), copied && (_jsx("span", { className: "text-green-600 text-xs ml-2", children: "\u30B3\u30D4\u30FC\u3057\u307E\u3057\u305F" }))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-500 mb-1", children: "\u6C7A\u6E08\u65E5\u6642" }), _jsx("div", { className: "text-gray-900", children: paymentDetails.created.toLocaleString('ja-JP') })] })] })] }), paymentDetails.splitPayment && (_jsxs("div", { className: "bg-blue-50 rounded-lg p-6 border border-blue-200", children: [_jsxs("h3", { className: "text-lg font-semibold text-blue-900 mb-4 flex items-center", children: [_jsx(Calendar, { className: "w-5 h-5 mr-2" }), "\u5206\u5272\u6255\u3044\u60C5\u5831"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-blue-700 mb-1", children: "\u4ECA\u56DE\u306E\u304A\u652F\u6255\u3044" }), _jsxs("div", { className: "text-xl font-bold text-blue-900", children: ["\u00A5", paymentDetails.splitPayment.depositAmount.toLocaleString()] }), _jsx("div", { className: "text-sm text-blue-600", children: "\uFF08\u524D\u6255\u3044\u91D1\uFF09" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-blue-700 mb-1", children: "\u6B8B\u308A\u306E\u304A\u652F\u6255\u3044" }), _jsxs("div", { className: "text-xl font-bold text-blue-900", children: ["\u00A5", paymentDetails.splitPayment.remainingAmount.toLocaleString()] }), _jsxs("div", { className: "text-sm text-blue-600", children: ["\u671F\u9650: ", paymentDetails.splitPayment.remainingDueDate.toLocaleDateString('ja-JP')] })] })] })] })), paymentDetails.serviceDetails && (_jsxs("div", { className: "bg-gray-50 rounded-lg p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "\u30B5\u30FC\u30D3\u30B9\u8A73\u7D30" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-500 mb-1", children: "\u30B5\u30FC\u30D3\u30B9\u540D" }), _jsx("div", { className: "text-gray-900", children: paymentDetails.serviceDetails.serviceName })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-500 mb-1", children: "\u62C5\u5F53\u30B9\u30BF\u30A4\u30EA\u30B9\u30C8" }), _jsx("div", { className: "text-gray-900", children: paymentDetails.serviceDetails.stylist })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-500 mb-1", children: "\u4E88\u7D04\u65E5\u6642" }), _jsx("div", { className: "text-gray-900", children: paymentDetails.serviceDetails.date.toLocaleString('ja-JP') })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-500 mb-1", children: "\u6240\u8981\u6642\u9593" }), _jsxs("div", { className: "text-gray-900", children: [paymentDetails.serviceDetails.duration, "\u5206"] })] })] })] })), _jsxs("div", { className: "bg-gray-50 rounded-lg p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "\u304A\u5BA2\u69D8\u60C5\u5831" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-500 mb-1", children: "\u304A\u540D\u524D" }), _jsx("div", { className: "text-gray-900", children: paymentDetails.customerInfo.name })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-500 mb-1", children: "\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9" }), _jsx("div", { className: "text-gray-900", children: paymentDetails.customerInfo.email })] }), paymentDetails.customerInfo.phone && (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-500 mb-1", children: "\u96FB\u8A71\u756A\u53F7" }), _jsx("div", { className: "text-gray-900", children: paymentDetails.customerInfo.phone })] }))] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("button", { onClick: handleSendReceipt, disabled: receiptSent, className: `flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-all ${receiptSent
                                            ? 'bg-green-100 text-green-700 border border-green-300'
                                            : 'bg-blue-600 text-white hover:bg-blue-700'}`, children: [_jsx(Mail, { className: "w-5 h-5 mr-2" }), receiptSent ? '領収書を送信済み' : '領収書をメール送信'] }), _jsxs("button", { onClick: handleDownloadReceipt, disabled: !paymentDetails.receiptUrl, className: "flex items-center justify-center px-4 py-3 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed", children: [_jsx(Download, { className: "w-5 h-5 mr-2" }), "\u9818\u53CE\u66F8\u3092\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9"] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [onPrintReceipt && (_jsxs("button", { onClick: onPrintReceipt, className: "flex items-center justify-center px-4 py-3 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200", children: [_jsx(Printer, { className: "w-5 h-5 mr-2" }), "\u9818\u53CE\u66F8\u3092\u5370\u5237"] })), _jsxs("button", { onClick: () => {
                                            if (navigator.share) {
                                                navigator.share({
                                                    title: '決済完了',
                                                    text: `決済が完了しました。金額: ¥${paymentDetails.amount.toLocaleString()}`,
                                                    url: window.location.href
                                                });
                                            }
                                        }, className: "flex items-center justify-center px-4 py-3 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200", children: [_jsx(Share2, { className: "w-5 h-5 mr-2" }), "\u6C7A\u6E08\u60C5\u5831\u3092\u5171\u6709"] })] }), onContinue && (_jsx("button", { onClick: onContinue, className: "w-full bg-green-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors", children: "\u7D9A\u884C" }))] }), _jsx("div", { className: "bg-yellow-50 rounded-lg p-4 border border-yellow-200", children: _jsxs("div", { className: "flex items-start", children: [_jsx(Clock, { className: "w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" }), _jsxs("div", { className: "text-sm text-yellow-800", children: [_jsx("div", { className: "font-medium mb-1", children: "\u91CD\u8981\u306A\u304A\u77E5\u3089\u305B" }), _jsxs("ul", { className: "space-y-1 text-xs", children: [_jsxs("li", { children: ["\u2022 \u9818\u53CE\u66F8\u756A\u53F7: ", paymentDetails.receiptNumber] }), _jsx("li", { children: "\u2022 \u3053\u306E\u6C7A\u6E08\u60C5\u5831\u306F\u91CD\u8981\u66F8\u985E\u3067\u3059\u3002\u5370\u5237\u307E\u305F\u306F\u30B9\u30AF\u30EA\u30FC\u30F3\u30B7\u30E7\u30C3\u30C8\u3067\u4FDD\u5B58\u3059\u308B\u3053\u3068\u3092\u304A\u52E7\u3081\u3057\u307E\u3059" }), paymentDetails.splitPayment && (_jsx("li", { children: "\u2022 \u6B8B\u308A\u306E\u304A\u652F\u6255\u3044\u306B\u3064\u3044\u3066\u306F\u3001\u5225\u9014\u3054\u6848\u5185\u3044\u305F\u3057\u307E\u3059" })), _jsx("li", { children: "\u2022 \u3054\u4E0D\u660E\u306A\u70B9\u304C\u3054\u3056\u3044\u307E\u3057\u305F\u3089\u3001\u304A\u6C17\u8EFD\u306B\u304A\u554F\u3044\u5408\u308F\u305B\u304F\u3060\u3055\u3044" })] })] })] }) })] })] }));
};
export default PaymentConfirmation;
