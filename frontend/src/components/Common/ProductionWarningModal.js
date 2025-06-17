import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AlertTriangle, Lock, Info, X, ExternalLink } from 'lucide-react';
const ProductionWarningModal = ({ isOpen, onClose, feature, title, message, type = 'warning', showDetails = true }) => {
    if (!isOpen)
        return null;
    const getIcon = () => {
        switch (type) {
            case 'error':
                return _jsx(Lock, { className: "w-12 h-12 text-red-500" });
            case 'info':
                return _jsx(Info, { className: "w-12 h-12 text-blue-500" });
            default:
                return _jsx(AlertTriangle, { className: "w-12 h-12 text-yellow-500" });
        }
    };
    const getColors = () => {
        switch (type) {
            case 'error':
                return {
                    bg: 'bg-red-50',
                    border: 'border-red-200',
                    text: 'text-red-800',
                    button: 'bg-red-600 hover:bg-red-700'
                };
            case 'info':
                return {
                    bg: 'bg-blue-50',
                    border: 'border-blue-200',
                    text: 'text-blue-800',
                    button: 'bg-blue-600 hover:bg-blue-700'
                };
            default:
                return {
                    bg: 'bg-yellow-50',
                    border: 'border-yellow-200',
                    text: 'text-yellow-800',
                    button: 'bg-yellow-600 hover:bg-yellow-700'
                };
        }
    };
    const colors = getColors();
    const featureMessages = {
        line: {
            title: 'LINE メッセージ送信制限',
            message: 'LINE メッセージ送信機能は本番環境でのみ利用可能です。',
            details: '開発環境では顧客への誤送信を防ぐため、この機能は無効化されています。本番リリース後にご利用いただけます。'
        },
        instagram: {
            title: 'Instagram DM送信制限',
            message: 'Instagram DM送信機能は本番環境でのみ利用可能です。',
            details: '開発環境では顧客への誤送信を防ぐため、この機能は無効化されています。本番リリース後にご利用いただけます。'
        },
        sms: {
            title: 'SMS送信制限',
            message: 'SMS送信機能は本番環境でのみ利用可能です。',
            details: '開発環境では顧客への誤送信を防ぐため、この機能は無効化されています。SMS送信には料金が発生するため、本番環境でのみ有効化されます。'
        },
        email: {
            title: 'メール一斉配信制限',
            message: 'メール一斉配信機能は本番環境でのみ利用可能です。',
            details: '開発環境では顧客への誤送信を防ぐため、この機能は無効化されています。本番リリース後にご利用いただけます。'
        },
        payment: {
            title: '決済機能制限',
            message: '決済処理は本番環境でのみ利用可能です。',
            details: '開発環境では実際の決済処理は行われません。テスト用の決済データのみ表示されます。'
        },
        analytics_export: {
            title: 'データエクスポート制限',
            message: 'データエクスポート機能は本番環境でのみ利用可能です。',
            details: '開発環境では実際の顧客データの外部出力は制限されています。本番環境でのみ利用可能です。'
        },
        pdf_reports: {
            title: 'PDFレポート生成制限',
            message: 'PDFレポート生成は本番環境でのみ利用可能です。',
            details: '開発環境では実際のレポート生成は制限されています。本番環境でのみ利用可能です。'
        }
    };
    const featureInfo = featureMessages[feature] || {
        title: title || '機能制限',
        message: message || 'この機能は本番環境でのみ利用可能です。',
        details: '開発環境では一部の機能が制限されています。本番リリース後にご利用いただけます。'
    };
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4", children: _jsx("div", { className: "bg-white rounded-xl max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200", children: _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [getIcon(), _jsx("h2", { className: "text-lg font-bold text-gray-900", children: featureInfo.title })] }), _jsx("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-600 p-1", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsx("div", { className: `${colors.bg} ${colors.border} border rounded-lg p-4 mb-6`, children: _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx(AlertTriangle, { className: `w-5 h-5 ${colors.text} mt-0.5 flex-shrink-0` }), _jsxs("div", { children: [_jsx("p", { className: `${colors.text} font-medium mb-2`, children: featureInfo.message }), showDetails && (_jsx("p", { className: `${colors.text} text-sm opacity-90`, children: featureInfo.details }))] })] }) }), _jsx("div", { className: "bg-gray-50 rounded-lg p-3 mb-6", children: _jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsx("span", { className: "text-gray-600", children: "\u73FE\u5728\u306E\u74B0\u5883:" }), _jsx("span", { className: "font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded", children: "\u958B\u767A\u74B0\u5883" })] }) }), _jsxs("div", { className: "flex space-x-3", children: [_jsx("button", { onClick: onClose, className: "flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium", children: "\u7406\u89E3\u3057\u307E\u3057\u305F" }), showDetails && (_jsxs("button", { onClick: () => {
                                    window.open('/docs/environment-restrictions', '_blank');
                                }, className: "flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium", children: [_jsx(ExternalLink, { className: "w-4 h-4" }), _jsx("span", { children: "\u8A73\u7D30\u78BA\u8A8D" })] }))] }), _jsx("div", { className: "mt-4 pt-4 border-t border-gray-200", children: _jsx("p", { className: "text-xs text-gray-500 text-center", children: "\u672C\u756A\u74B0\u5883\u3067\u306F\u5168\u3066\u306E\u6A5F\u80FD\u304C\u5229\u7528\u53EF\u80FD\u306B\u306A\u308A\u307E\u3059" }) })] }) }) }));
};
export default ProductionWarningModal;
