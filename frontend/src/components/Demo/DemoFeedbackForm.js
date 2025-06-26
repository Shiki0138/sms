import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * 🎭 デモモード専用フィードバックフォーム
 * ユーザーからの改善要望・エラー報告を収集
 */
import { useState } from 'react';
import { Send, MessageSquare, AlertTriangle, Lightbulb, Bug } from 'lucide-react';
import toast from 'react-hot-toast';
import { getEnvironmentConfig } from '../../utils/environment';
const pageOptions = [
    { value: 'dashboard', label: 'ダッシュボード' },
    { value: 'customers', label: '顧客管理' },
    { value: 'reservations', label: '予約管理' },
    { value: 'staff', label: 'スタッフ管理' },
    { value: 'analytics', label: '分析・レポート' },
    { value: 'messages', label: 'メッセージ管理' },
    { value: 'settings', label: '設定' },
    { value: 'billing', label: '料金・請求' },
    { value: 'integrations', label: '外部連携' },
    { value: 'other', label: 'その他' }
];
const categoryOptions = [
    { value: 'bug', label: 'バグ・エラー報告', icon: Bug, color: 'text-red-600' },
    { value: 'improvement', label: '改善提案', icon: Lightbulb, color: 'text-yellow-600' },
    { value: 'feature_request', label: '新機能要望', icon: MessageSquare, color: 'text-blue-600' },
    { value: 'ui_ux', label: 'UI/UX改善', icon: AlertTriangle, color: 'text-purple-600' },
    { value: 'other', label: 'その他', icon: MessageSquare, color: 'text-gray-600' }
];
export const DemoFeedbackForm = ({ isOpen, onClose, currentPage = '' }) => {
    const [formData, setFormData] = useState({
        title: '',
        category: 'improvement',
        page: currentPage || 'other',
        description: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const config = getEnvironmentConfig();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const feedbackData = {
                ...formData,
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString(),
                sessionId: sessionStorage.getItem('demo_session_id') || 'unknown'
            };
            // Googleスプレッドシートに送信
            const response = await fetch(`${config.apiBaseURL}/api/demo/feedback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(feedbackData)
            });
            if (response.ok) {
                toast.success('フィードバックを送信しました。ご協力ありがとうございます！', {
                    duration: 4000,
                    icon: '🙏'
                });
                // フォームをリセット
                setFormData({
                    title: '',
                    category: 'improvement',
                    page: currentPage || 'other',
                    description: ''
                });
                onClose();
            }
            else {
                throw new Error('送信に失敗しました');
            }
        }
        catch (error) {
            console.error('Feedback submission error:', error);
            toast.error('送信に失敗しました。しばらく経ってから再度お試しください。');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const selectedCategory = categoryOptions.find(cat => cat.value === formData.category);
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto", children: [_jsx("div", { className: "bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold flex items-center gap-2", children: "\uD83C\uDFAD \u30C7\u30E2\u30E2\u30FC\u30C9 \u30D5\u30A3\u30FC\u30C9\u30D0\u30C3\u30AF" }), _jsx("p", { className: "text-blue-100 mt-1", children: "\u3054\u5229\u7528\u3044\u305F\u3060\u304D\u3042\u308A\u304C\u3068\u3046\u3054\u3056\u3044\u307E\u3059\u3002\u6539\u5584\u70B9\u3084\u3054\u8981\u671B\u3092\u304A\u805E\u304B\u305B\u304F\u3060\u3055\u3044" })] }), _jsx("button", { onClick: onClose, className: "text-white hover:text-gray-200 text-xl font-bold", children: "\u00D7" })] }) }), _jsxs("form", { onSubmit: handleSubmit, className: "p-6 space-y-6", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: ["\u30BF\u30A4\u30C8\u30EB ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("input", { type: "text", required: true, value: formData.title, onChange: (e) => setFormData({ ...formData, title: e.target.value }), placeholder: "\u4F8B: \u4E88\u7D04\u753B\u9762\u3067\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F", className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: ["\u30AB\u30C6\u30B4\u30EA\u30FC ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: categoryOptions.map((category) => {
                                        const IconComponent = category.icon;
                                        return (_jsxs("label", { className: `flex items-center p-3 border rounded-lg cursor-pointer transition-all ${formData.category === category.value
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'}`, children: [_jsx("input", { type: "radio", name: "category", value: category.value, checked: formData.category === category.value, onChange: (e) => setFormData({ ...formData, category: e.target.value }), className: "sr-only" }), _jsx(IconComponent, { className: `w-5 h-5 ${category.color} mr-3` }), _jsx("span", { className: "text-sm font-medium", children: category.label })] }, category.value));
                                    }) })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: ["\u8A72\u5F53\u30DA\u30FC\u30B8 ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("select", { required: true, value: formData.page, onChange: (e) => setFormData({ ...formData, page: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent", children: pageOptions.map((page) => (_jsx("option", { value: page.value, children: page.label }, page.value))) })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: ["\u8A73\u7D30\u8AAC\u660E ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("textarea", { required: true, rows: 6, value: formData.description, onChange: (e) => setFormData({ ...formData, description: e.target.value }), placeholder: formData.category === 'bug'
                                        ? '例: 顧客情報を保存しようとすると「サーバーエラー」が表示されて保存できません。Chrome最新版で発生。'
                                        : formData.category === 'improvement'
                                            ? '例: 予約一覧画面で月表示だけでなく週表示も選択できるようになると便利です。'
                                            : '具体的な内容をご記入ください...', className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "\u3067\u304D\u308B\u3060\u3051\u5177\u4F53\u7684\u306B\u3054\u8A18\u5165\u3044\u305F\u3060\u3051\u308B\u3068\u3001\u3088\u308A\u826F\u3044\u6539\u5584\u306B\u3064\u306A\u304C\u308A\u307E\u3059" })] }), _jsxs("div", { className: "flex justify-end gap-3 pt-4 border-t", children: [_jsx("button", { type: "button", onClick: onClose, className: "px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors", children: "\u30AD\u30E3\u30F3\u30BB\u30EB" }), _jsx("button", { type: "submit", disabled: isSubmitting, className: "px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2", children: isSubmitting ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" }), "\u9001\u4FE1\u4E2D..."] })) : (_jsxs(_Fragment, { children: [_jsx(Send, { className: "w-4 h-4" }), "\u30D5\u30A3\u30FC\u30C9\u30D0\u30C3\u30AF\u3092\u9001\u4FE1"] })) })] })] }), _jsx("div", { className: "bg-gray-50 px-6 py-4 rounded-b-xl", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: "w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0", children: _jsx(MessageSquare, { className: "w-4 h-4 text-blue-600" }) }), _jsxs("div", { className: "text-sm text-gray-600", children: [_jsx("p", { className: "font-medium", children: "\u3054\u5229\u7528\u3042\u308A\u304C\u3068\u3046\u3054\u3056\u3044\u307E\u3059" }), _jsx("p", { children: "\u3044\u305F\u3060\u3044\u305F\u30D5\u30A3\u30FC\u30C9\u30D0\u30C3\u30AF\u306F\u958B\u767A\u30C1\u30FC\u30E0\u3067\u691C\u8A0E\u3057\u3001\u30B5\u30FC\u30D3\u30B9\u6539\u5584\u306B\u6D3B\u7528\u3055\u305B\u3066\u3044\u305F\u3060\u304D\u307E\u3059\u3002 \u30C7\u30E2\u671F\u9593\u7D42\u4E86\u5F8C\u3001\u30C7\u30FC\u30BF\u306F\u5B89\u5168\u306B\u524A\u9664\u3055\u308C\u307E\u3059\u3002" })] })] }) })] }) }));
};
export default DemoFeedbackForm;
