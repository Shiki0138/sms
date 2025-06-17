import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Send, Lightbulb, CheckCircle, AlertCircle, Star, Bug, Zap, Plus, Loader } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
const FeatureRequestForm = ({ onNewRequest }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'feature',
        priority: 'medium',
        userInfo: {
            name: '',
            email: '',
            role: 'staff'
        }
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState('idle');
    const [submittedRequests, setSubmittedRequests] = useState([]);
    const categoryOptions = [
        { value: 'bug', label: 'バグ報告', icon: Bug, color: 'text-red-600' },
        { value: 'feature', label: '新機能', icon: Plus, color: 'text-blue-600' },
        { value: 'improvement', label: '機能改善', icon: Zap, color: 'text-yellow-600' },
        { value: 'other', label: 'その他', icon: Star, color: 'text-purple-600' }
    ];
    const priorityOptions = [
        { value: 'low', label: '低', color: 'text-green-600' },
        { value: 'medium', label: '中', color: 'text-yellow-600' },
        { value: 'high', label: '高', color: 'text-red-600' }
    ];
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus('idle');
        try {
            // シミュレート: 実際はAPIに送信
            await new Promise(resolve => setTimeout(resolve, 1500));
            const newRequest = {
                id: `req_${Date.now()}`,
                title: formData.title,
                description: formData.description,
                category: formData.category,
                priority: formData.priority,
                userInfo: formData.userInfo,
                submittedAt: new Date().toISOString(),
                status: 'submitted'
            };
            setSubmittedRequests(prev => [newRequest, ...prev]);
            setSubmitStatus('success');
            // Notify parent component about new request
            if (onNewRequest) {
                onNewRequest(newRequest);
            }
            // フォームリセット
            setFormData({
                title: '',
                description: '',
                category: 'feature',
                priority: 'medium',
                userInfo: {
                    name: '',
                    email: '',
                    role: 'staff'
                }
            });
            // 成功メッセージを3秒後にクリア
            setTimeout(() => setSubmitStatus('idle'), 3000);
        }
        catch (error) {
            console.error('Feature request submission error:', error);
            setSubmitStatus('error');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const getCategoryIcon = (category) => {
        const option = categoryOptions.find(opt => opt.value === category);
        const Icon = option?.icon || Star;
        return _jsx(Icon, { className: `w-5 h-5 ${option?.color || 'text-gray-600'}` });
    };
    const getStatusBadge = (status) => {
        const statusConfig = {
            submitted: { label: '送信済み', color: 'bg-blue-100 text-blue-800' },
            under_review: { label: '確認中', color: 'bg-yellow-100 text-yellow-800' },
            in_progress: { label: '開発中', color: 'bg-purple-100 text-purple-800' },
            completed: { label: '完了', color: 'bg-green-100 text-green-800' },
            rejected: { label: '却下', color: 'bg-red-100 text-red-800' }
        };
        const config = statusConfig[status];
        return (_jsx("span", { className: `px-2 py-1 rounded-full text-xs font-medium ${config.color}`, children: config.label }));
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [_jsxs("h2", { className: "text-2xl font-bold text-gray-900 flex items-center mb-4", children: [_jsx(Lightbulb, { className: "w-8 h-8 mr-3 text-yellow-600" }), "\u6A5F\u80FD\u6539\u5584\u8981\u671B"] }), _jsx("p", { className: "text-gray-600", children: "\u30B7\u30B9\u30C6\u30E0\u306E\u6539\u5584\u70B9\u3084\u65B0\u6A5F\u80FD\u306E\u3054\u8981\u671B\u3092\u304A\u805E\u304B\u305B\u304F\u3060\u3055\u3044\u3002 \u304A\u5BC4\u305B\u3044\u305F\u3060\u3044\u305F\u3054\u610F\u898B\u306F\u958B\u767A\u30C1\u30FC\u30E0\u304C\u78BA\u8A8D\u3057\u3001\u30B7\u30B9\u30C6\u30E0\u306E\u5411\u4E0A\u306B\u6D3B\u7528\u3055\u305B\u3066\u3044\u305F\u3060\u304D\u307E\u3059\u3002" })] }), _jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [_jsx("h3", { className: "text-lg font-bold text-gray-900 mb-6", children: "\u65B0\u3057\u3044\u8981\u671B\u3092\u9001\u4FE1" }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: ["\u304A\u540D\u524D ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("input", { type: "text", value: formData.userInfo.name, onChange: (e) => setFormData(prev => ({
                                                    ...prev,
                                                    userInfo: { ...prev.userInfo, name: e.target.value }
                                                })), placeholder: "\u5C71\u7530 \u592A\u90CE", className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", required: true })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: ["\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9 ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("input", { type: "email", value: formData.userInfo.email, onChange: (e) => setFormData(prev => ({
                                                    ...prev,
                                                    userInfo: { ...prev.userInfo, email: e.target.value }
                                                })), placeholder: "example@example.com", className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", required: true })] })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: ["\u8981\u671B\u30BF\u30A4\u30C8\u30EB ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("input", { type: "text", value: formData.title, onChange: (e) => setFormData(prev => ({ ...prev, title: e.target.value })), placeholder: "\u30AB\u30EC\u30F3\u30C0\u30FC\u8868\u793A\u306E\u6539\u5584\u306B\u3064\u3044\u3066", className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", required: true })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: ["\u30AB\u30C6\u30B4\u30EA\u30FC ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("div", { className: "grid grid-cols-2 gap-2", children: categoryOptions.map((option) => {
                                                    const Icon = option.icon;
                                                    return (_jsxs("button", { type: "button", onClick: () => setFormData(prev => ({ ...prev, category: option.value })), className: `p-3 border rounded-lg text-left transition-colors ${formData.category === option.value
                                                            ? 'border-blue-500 bg-blue-50'
                                                            : 'border-gray-300 hover:border-gray-400'}`, children: [_jsx(Icon, { className: `w-4 h-4 mb-1 ${option.color}` }), _jsx("div", { className: "text-sm font-medium", children: option.label })] }, option.value));
                                                }) })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: ["\u512A\u5148\u5EA6 ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("select", { value: formData.priority, onChange: (e) => setFormData(prev => ({ ...prev, priority: e.target.value })), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", required: true, children: priorityOptions.map((option) => (_jsx("option", { value: option.value, children: option.label }, option.value))) })] })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: ["\u8A73\u7D30\u8AAC\u660E ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("textarea", { value: formData.description, onChange: (e) => setFormData(prev => ({ ...prev, description: e.target.value })), placeholder: "\u5177\u4F53\u7684\u306A\u6539\u5584\u70B9\u3084\u8981\u671B\u5185\u5BB9\u3092\u304A\u66F8\u304D\u304F\u3060\u3055\u3044\u3002\u73FE\u5728\u306E\u554F\u984C\u70B9\u3001\u671F\u5F85\u3059\u308B\u52D5\u4F5C\u3001\u4F7F\u7528\u74B0\u5883\u306A\u3069\u306E\u8A73\u7D30\u304C\u3042\u308B\u3068\u958B\u767A\u306E\u53C2\u8003\u306B\u306A\u308A\u307E\u3059\u3002", rows: 6, className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none", required: true })] }), _jsx("div", { className: "flex justify-end", children: _jsx("button", { type: "submit", disabled: isSubmitting, className: "flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed", children: isSubmitting ? (_jsxs(_Fragment, { children: [_jsx(Loader, { className: "w-4 h-4 mr-2 animate-spin" }), "\u9001\u4FE1\u4E2D..."] })) : (_jsxs(_Fragment, { children: [_jsx(Send, { className: "w-4 h-4 mr-2" }), "\u8981\u671B\u3092\u9001\u4FE1"] })) }) })] }), submitStatus === 'success' && (_jsxs("div", { className: "mt-6 p-4 bg-green-50 border border-green-200 rounded-lg", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(CheckCircle, { className: "w-5 h-5 text-green-600 mr-2" }), _jsx("span", { className: "font-medium text-green-800", children: "\u8981\u671B\u3092\u9001\u4FE1\u3057\u307E\u3057\u305F" })] }), _jsx("p", { className: "text-sm text-green-700 mt-1", children: "\u3054\u610F\u898B\u3042\u308A\u304C\u3068\u3046\u3054\u3056\u3044\u307E\u3059\u3002\u958B\u767A\u30C1\u30FC\u30E0\u3067\u78BA\u8A8D\u5F8C\u3001\u5FC5\u8981\u306B\u5FDC\u3058\u3066\u3054\u9023\u7D61\u3044\u305F\u3057\u307E\u3059\u3002" })] })), submitStatus === 'error' && (_jsxs("div", { className: "mt-6 p-4 bg-red-50 border border-red-200 rounded-lg", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(AlertCircle, { className: "w-5 h-5 text-red-600 mr-2" }), _jsx("span", { className: "font-medium text-red-800", children: "\u9001\u4FE1\u306B\u5931\u6557\u3057\u307E\u3057\u305F" })] }), _jsx("p", { className: "text-sm text-red-700 mt-1", children: "\u6642\u9593\u3092\u304A\u3044\u3066\u518D\u5EA6\u304A\u8A66\u3057\u304F\u3060\u3055\u3044\u3002" })] }))] }), submittedRequests.length > 0 && (_jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [_jsx("h3", { className: "text-lg font-bold text-gray-900 mb-4", children: "\u9001\u4FE1\u6E08\u307F\u306E\u8981\u671B" }), _jsx("div", { className: "space-y-4", children: submittedRequests.map((request) => (_jsxs("div", { className: "border border-gray-200 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-start justify-between mb-3", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [getCategoryIcon(request.category), _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-gray-900", children: request.title }), _jsxs("div", { className: "flex items-center space-x-2 mt-1", children: [_jsx("span", { className: "text-xs text-gray-500", children: format(new Date(request.submittedAt), 'yyyy/MM/dd HH:mm', { locale: ja }) }), _jsxs("span", { className: `text-xs font-medium ${request.priority === 'high' ? 'text-red-600' :
                                                                        request.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'}`, children: ["\u512A\u5148\u5EA6: ", priorityOptions.find(p => p.value === request.priority)?.label] })] })] })] }), getStatusBadge(request.status)] }), _jsx("p", { className: "text-sm text-gray-700 line-clamp-3", children: request.description })] }, request.id))) })] })), _jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-6", children: [_jsx("h3", { className: "text-lg font-bold text-blue-900 mb-4", children: "\u52B9\u679C\u7684\u306A\u8981\u671B\u306E\u66F8\u304D\u65B9" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-medium mb-2", children: "\uD83D\uDCDD \u5177\u4F53\u7684\u306B\u66F8\u304F" }), _jsxs("ul", { className: "space-y-1 text-blue-700", children: [_jsx("li", { children: "\u2022 \u73FE\u5728\u306E\u554F\u984C\u70B9\u3092\u660E\u78BA\u306B" }), _jsx("li", { children: "\u2022 \u671F\u5F85\u3059\u308B\u52D5\u4F5C\u3092\u8A73\u3057\u304F" }), _jsx("li", { children: "\u2022 \u4F7F\u7528\u3057\u3066\u3044\u308B\u6A5F\u80FD\u540D\u3092\u8A18\u8F09" })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium mb-2", children: "\uD83C\uDFAF \u80CC\u666F\u60C5\u5831\u3092\u542B\u3081\u308B" }), _jsxs("ul", { className: "space-y-1 text-blue-700", children: [_jsx("li", { children: "\u2022 \u306A\u305C\u305D\u306E\u6A5F\u80FD\u304C\u5FC5\u8981\u304B" }), _jsx("li", { children: "\u2022 \u73FE\u5728\u306E\u56DE\u907F\u65B9\u6CD5" }), _jsx("li", { children: "\u2022 \u696D\u52D9\u3078\u306E\u5F71\u97FF\u5EA6" })] })] })] })] })] }));
};
export default FeatureRequestForm;
