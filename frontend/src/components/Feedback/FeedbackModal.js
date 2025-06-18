import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef } from 'react';
import { X, Bug, Lightbulb, MessageSquare, Camera, Send, Star, CheckCircle, AlertCircle, Info } from 'lucide-react';
import html2canvas from 'html2canvas';
const FeedbackModal = ({ isOpen, onClose, userId, userEmail, userName, defaultType = 'general' }) => {
    const [feedbackType, setFeedbackType] = useState(defaultType);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [severity, setSeverity] = useState('medium');
    const [category, setCategory] = useState('');
    const [rating, setRating] = useState(0);
    const [screenshot, setScreenshot] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const fileInputRef = useRef(null);
    const categories = {
        bug: ['UI表示', 'データ処理', 'パフォーマンス', '認証・権限', 'その他'],
        feature: ['予約管理', '顧客管理', 'メッセージ', '分析', '決済', 'その他'],
        general: ['使いやすさ', 'デザイン', 'パフォーマンス', 'ドキュメント', 'その他']
    };
    const handleScreenshot = async () => {
        try {
            onClose(); // モーダルを一時的に閉じる
            setTimeout(async () => {
                const canvas = await html2canvas(document.body, {
                    ignoreElements: (element) => {
                        return element.classList.contains('feedback-modal');
                    }
                });
                const dataUrl = canvas.toDataURL('image/png');
                setScreenshot(dataUrl);
                // モーダルを再度開く
                setTimeout(() => {
                    // Re-open modal logic
                }, 100);
            }, 100);
        }
        catch (error) {
            console.error('Screenshot failed:', error);
        }
    };
    const handleFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setScreenshot(e.target?.result);
            };
            reader.readAsDataURL(file);
        }
    };
    const handleSubmit = async () => {
        if (!title || !description) {
            setSubmitError('タイトルと詳細は必須です');
            return;
        }
        setIsSubmitting(true);
        setSubmitError(null);
        const feedbackData = {
            type: feedbackType,
            title,
            description,
            severity: feedbackType === 'bug' ? severity : undefined,
            category,
            screenshot: screenshot || undefined,
            rating: feedbackType === 'general' ? rating : undefined,
            userAgent: navigator.userAgent,
            url: window.location.href,
            timestamp: new Date().toISOString()
        };
        try {
            const response = await fetch('/api/v1/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    ...feedbackData,
                    userId,
                    userEmail,
                    userName
                })
            });
            if (!response.ok) {
                throw new Error('フィードバックの送信に失敗しました');
            }
            setSubmitSuccess(true);
            setTimeout(() => {
                onClose();
                // Reset form
                setTitle('');
                setDescription('');
                setCategory('');
                setRating(0);
                setScreenshot(null);
                setSubmitSuccess(false);
            }, 2000);
        }
        catch (error) {
            setSubmitError(error instanceof Error ? error.message : 'エラーが発生しました');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 feedback-modal", children: _jsxs("div", { className: "bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden", children: [_jsxs("div", { className: "p-6 border-b border-gray-200", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h2", { className: "text-xl font-bold text-gray-900", children: "\u30D5\u30A3\u30FC\u30C9\u30D0\u30C3\u30AF" }), _jsx("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-600", children: _jsx(X, { className: "w-6 h-6" }) })] }), _jsxs("div", { className: "mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800", children: [_jsx(Star, { className: "w-3 h-3 mr-1" }), "\u30D9\u30FC\u30BF\u30C6\u30B9\u30BF\u30FC"] })] }), _jsxs("div", { className: "p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "\u30D5\u30A3\u30FC\u30C9\u30D0\u30C3\u30AF\u306E\u7A2E\u985E" }), _jsxs("div", { className: "grid grid-cols-3 gap-3", children: [_jsxs("button", { onClick: () => setFeedbackType('bug'), className: `p-3 rounded-lg border-2 transition-all ${feedbackType === 'bug'
                                                ? 'border-red-500 bg-red-50'
                                                : 'border-gray-200 hover:border-gray-300'}`, children: [_jsx(Bug, { className: "w-6 h-6 mx-auto mb-1 text-red-500" }), _jsx("span", { className: "text-sm font-medium", children: "\u30D0\u30B0\u5831\u544A" })] }), _jsxs("button", { onClick: () => setFeedbackType('feature'), className: `p-3 rounded-lg border-2 transition-all ${feedbackType === 'feature'
                                                ? 'border-yellow-500 bg-yellow-50'
                                                : 'border-gray-200 hover:border-gray-300'}`, children: [_jsx(Lightbulb, { className: "w-6 h-6 mx-auto mb-1 text-yellow-500" }), _jsx("span", { className: "text-sm font-medium", children: "\u6A5F\u80FD\u8981\u671B" })] }), _jsxs("button", { onClick: () => setFeedbackType('general'), className: `p-3 rounded-lg border-2 transition-all ${feedbackType === 'general'
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'}`, children: [_jsx(MessageSquare, { className: "w-6 h-6 mx-auto mb-1 text-blue-500" }), _jsx("span", { className: "text-sm font-medium", children: "\u3054\u610F\u898B" })] })] })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: ["\u30BF\u30A4\u30C8\u30EB ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("input", { type: "text", value: title, onChange: (e) => setTitle(e.target.value), placeholder: feedbackType === 'bug'
                                        ? '例: 予約画面でエラーが発生する'
                                        : feedbackType === 'feature'
                                            ? '例: 予約の一括キャンセル機能が欲しい'
                                            : '例: ダッシュボードの使い勝手について', className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "\u30AB\u30C6\u30B4\u30EA\u30FC" }), _jsxs("select", { value: category, onChange: (e) => setCategory(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: "", children: "\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044" }), categories[feedbackType].map((cat) => (_jsx("option", { value: cat, children: cat }, cat)))] })] }), feedbackType === 'bug' && (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "\u91CD\u8981\u5EA6" }), _jsx("div", { className: "flex space-x-3", children: ['low', 'medium', 'high', 'critical'].map((level) => (_jsx("button", { onClick: () => setSeverity(level), className: `px-4 py-2 rounded-md text-sm font-medium transition-all ${severity === level
                                            ? level === 'critical'
                                                ? 'bg-red-600 text-white'
                                                : level === 'high'
                                                    ? 'bg-orange-600 text-white'
                                                    : level === 'medium'
                                                        ? 'bg-yellow-600 text-white'
                                                        : 'bg-green-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`, children: level === 'critical' ? '致命的' : level === 'high' ? '高' : level === 'medium' ? '中' : '低' }, level))) })] })), feedbackType === 'general' && (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "\u7DCF\u5408\u8A55\u4FA1" }), _jsx("div", { className: "flex space-x-2", children: [1, 2, 3, 4, 5].map((star) => (_jsx("button", { onClick: () => setRating(star), className: "p-1 hover:scale-110 transition-transform", children: _jsx(Star, { className: `w-8 h-8 ${star <= rating
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-gray-300'}` }) }, star))) })] })), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: ["\u8A73\u7D30 ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("textarea", { value: description, onChange: (e) => setDescription(e.target.value), rows: 5, placeholder: feedbackType === 'bug'
                                        ? '再現手順や発生条件など、できるだけ詳しくお書きください'
                                        : feedbackType === 'feature'
                                            ? 'どのような機能が必要か、なぜ必要かをお書きください'
                                            : 'ご意見・ご感想をお聞かせください', className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "\u30B9\u30AF\u30EA\u30FC\u30F3\u30B7\u30E7\u30C3\u30C8" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex space-x-3", children: [_jsxs("button", { onClick: handleScreenshot, className: "flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium", children: [_jsx(Camera, { className: "w-4 h-4 mr-2" }), "\u753B\u9762\u3092\u30AD\u30E3\u30D7\u30C1\u30E3"] }), _jsxs("label", { className: "flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium cursor-pointer", children: [_jsx("input", { ref: fileInputRef, type: "file", accept: "image/*", onChange: handleFileUpload, className: "hidden" }), "\u753B\u50CF\u3092\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9"] })] }), screenshot && (_jsxs("div", { className: "relative", children: [_jsx("img", { src: screenshot, alt: "Screenshot", className: "w-full max-h-64 object-contain border border-gray-200 rounded-md" }), _jsx("button", { onClick: () => setScreenshot(null), className: "absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600", children: _jsx(X, { className: "w-4 h-4" }) })] }))] })] }), submitError && (_jsxs("div", { className: "bg-red-50 border border-red-200 rounded-md p-3 flex items-center", children: [_jsx(AlertCircle, { className: "w-5 h-5 text-red-500 mr-2" }), _jsx("span", { className: "text-sm text-red-700", children: submitError })] })), submitSuccess && (_jsxs("div", { className: "bg-green-50 border border-green-200 rounded-md p-3 flex items-center", children: [_jsx(CheckCircle, { className: "w-5 h-5 text-green-500 mr-2" }), _jsx("span", { className: "text-sm text-green-700", children: "\u30D5\u30A3\u30FC\u30C9\u30D0\u30C3\u30AF\u3092\u9001\u4FE1\u3057\u307E\u3057\u305F\u3002\u3042\u308A\u304C\u3068\u3046\u3054\u3056\u3044\u307E\u3059\uFF01" })] }))] }), _jsx("div", { className: "p-6 border-t border-gray-200 bg-gray-50", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center text-sm text-gray-600", children: [_jsx(Info, { className: "w-4 h-4 mr-1" }), _jsx("span", { children: "\u30D5\u30A3\u30FC\u30C9\u30D0\u30C3\u30AF\u306F\u54C1\u8CEA\u5411\u4E0A\u306E\u305F\u3081\u306B\u6D3B\u7528\u3055\u305B\u3066\u3044\u305F\u3060\u304D\u307E\u3059" })] }), _jsxs("div", { className: "flex space-x-3", children: [_jsx("button", { onClick: onClose, className: "px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50", children: "\u30AD\u30E3\u30F3\u30BB\u30EB" }), _jsx("button", { onClick: handleSubmit, disabled: isSubmitting || !title || !description, className: "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center", children: isSubmitting ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" }), "\u9001\u4FE1\u4E2D..."] })) : (_jsxs(_Fragment, { children: [_jsx(Send, { className: "w-4 h-4 mr-2" }), "\u9001\u4FE1"] })) })] })] }) })] }) }));
};
export default FeedbackModal;
