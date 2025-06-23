import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
// UIコンポーネントの代替実装
const Card = ({ children, className = '' }) => _jsx("div", { className: `bg-white rounded-lg shadow ${className}`, children: children });
const CardHeader = ({ children }) => _jsx("div", { className: "p-4 border-b", children: children });
const CardTitle = ({ children, className = '' }) => _jsx("h3", { className: `text-lg font-semibold ${className}`, children: children });
const CardContent = ({ children, className = '' }) => _jsx("div", { className: `p-4 ${className}`, children: children });
const Button = ({ children, onClick, disabled, type = 'button', variant = '', className = '' }) => _jsx("button", { type: type, onClick: onClick, disabled: disabled, className: `px-4 py-2 ${variant === 'outline' ? 'bg-white border text-gray-700' : 'bg-blue-600 text-white'} rounded hover:opacity-80 disabled:opacity-50 ${className}`, children: children });
const Input = ({ type, value, onChange, placeholder, min, step, required, className = '' }) => _jsx("input", { type: type, value: value, onChange: onChange, placeholder: placeholder, min: min, step: step, required: required, className: `px-3 py-2 border rounded w-full ${className}` });
const Textarea = ({ value, onChange, placeholder, rows, required, className = '' }) => _jsx("textarea", { value: value, onChange: onChange, placeholder: placeholder, rows: rows, required: required, className: `px-3 py-2 border rounded w-full ${className}` });
const Badge = ({ children, className = '', variant, onClick }) => _jsx("span", { onClick: onClick, className: `inline-block px-2 py-1 text-xs rounded cursor-pointer ${className}`, children: children });
const Alert = ({ children, className = '' }) => _jsx("div", { className: `p-4 rounded border ${className}`, children: children });
const AlertDescription = ({ children, className = '' }) => _jsx("p", { className: className, children: children });
const Select = ({ children, value, onValueChange }) => _jsx("div", { children: children });
const SelectTrigger = ({ children }) => _jsx("div", { className: "px-3 py-2 border rounded cursor-pointer", children: children });
const SelectContent = ({ children }) => _jsx("div", { className: "absolute bg-white border rounded shadow mt-1", children: children });
const SelectItem = ({ children, value }) => _jsx("div", { className: "px-3 py-2 hover:bg-gray-100 cursor-pointer", children: children });
const SelectValue = () => _jsx("span", { children: "\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044" });
import { UserPlus, Clock, MapPin, DollarSign, AlertTriangle, CheckCircle } from 'lucide-react';
const SupportRequestForm = ({ onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        requiredSkills: [],
        preferredTime: '',
        duration: '',
        hourlyRate: '',
        location: '',
        maxDistance: '10',
        urgencyLevel: 'MEDIUM'
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const skillOptions = [
        'カット', 'カラー', 'パーマ', 'ストレート', 'トリートメント',
        'セット', 'メイク', 'ネイル', 'エステ', 'マッサージ'
    ];
    const urgencyOptions = [
        { value: 'LOW', label: '低', color: 'bg-gray-100 text-gray-800' },
        { value: 'MEDIUM', label: '中', color: 'bg-blue-100 text-blue-800' },
        { value: 'HIGH', label: '高', color: 'bg-orange-100 text-orange-800' },
        { value: 'URGENT', label: '緊急', color: 'bg-red-100 text-red-800' }
    ];
    const handleSkillToggle = (skill) => {
        setFormData(prev => ({
            ...prev,
            requiredSkills: prev.requiredSkills.includes(skill)
                ? prev.requiredSkills.filter(s => s !== skill)
                : [...prev.requiredSkills, skill]
        }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        try {
            const response = await fetch('/api/v1/support-beautician/requests', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...formData,
                    duration: parseInt(formData.duration),
                    hourlyRate: parseFloat(formData.hourlyRate),
                    maxDistance: parseInt(formData.maxDistance),
                    preferredTime: new Date(formData.preferredTime).toISOString()
                })
            });
            if (response.ok) {
                const data = await response.json();
                setMessage({ type: 'success', text: '応援要請を作成しました！近隣の美容師に通知されます。' });
                if (onSubmit)
                    onSubmit(data);
                // フォームリセット
                setFormData({
                    title: '',
                    description: '',
                    requiredSkills: [],
                    preferredTime: '',
                    duration: '',
                    hourlyRate: '',
                    location: '',
                    maxDistance: '10',
                    urgencyLevel: 'MEDIUM'
                });
            }
            else {
                const error = await response.json();
                throw new Error(error.error || '応援要請の作成に失敗しました');
            }
        }
        catch (error) {
            setMessage({ type: 'error', text: error instanceof Error ? error.message : '不明なエラー' });
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs(Card, { className: "w-full max-w-2xl mx-auto", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(UserPlus, { className: "h-6 w-6 text-blue-600" }), _jsx("span", { children: "\u5FDC\u63F4\u7F8E\u5BB9\u5E2B\u3092\u52DF\u96C6" })] }) }), _jsxs(CardContent, { children: [message && (_jsxs(Alert, { className: `mb-4 ${message.type === 'error' ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}`, children: [message.type === 'error' ? (_jsx(AlertTriangle, { className: "h-4 w-4 text-red-600" })) : (_jsx(CheckCircle, { className: "h-4 w-4 text-green-600" })), _jsx(AlertDescription, { className: message.type === 'error' ? 'text-red-700' : 'text-green-700', children: message.text })] })), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "\u52DF\u96C6\u30BF\u30A4\u30C8\u30EB *" }), _jsx(Input, { type: "text", value: formData.title, onChange: (e) => setFormData({ ...formData, title: e.target.value }), placeholder: "\u4F8B: \u6025\u52DF\uFF01\u30AB\u30C3\u30C8\u3068\u30AB\u30E9\u30FC\u306E\u304A\u624B\u4F1D\u3044", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "\u8A73\u7D30\u8AAC\u660E *" }), _jsx(Textarea, { value: formData.description, onChange: (e) => setFormData({ ...formData, description: e.target.value }), placeholder: "\u5FDC\u63F4\u5185\u5BB9\u306E\u8A73\u7D30\u3001\u304A\u5E97\u306E\u96F0\u56F2\u6C17\u3001\u6CE8\u610F\u4E8B\u9805\u306A\u3069", rows: 4, required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "\u5FC5\u8981\u306A\u30B9\u30AD\u30EB" }), _jsx("div", { className: "flex flex-wrap gap-2", children: skillOptions.map((skill) => (_jsx(Badge, { variant: formData.requiredSkills.includes(skill) ? "default" : "", className: `cursor-pointer ${formData.requiredSkills.includes(skill)
                                                ? 'bg-blue-600 text-white'
                                                : 'hover:bg-blue-100'}`, onClick: () => handleSkillToggle(skill), children: skill }, skill))) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium mb-2", children: [_jsx(Clock, { className: "inline h-4 w-4 mr-1" }), "\u5E0C\u671B\u958B\u59CB\u65E5\u6642 *"] }), _jsx(Input, { type: "datetime-local", value: formData.preferredTime, onChange: (e) => setFormData({ ...formData, preferredTime: e.target.value }), required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "\u4E88\u60F3\u4F5C\u696D\u6642\u9593\uFF08\u5206\uFF09*" }), _jsx(Input, { type: "number", value: formData.duration, onChange: (e) => setFormData({ ...formData, duration: e.target.value }), placeholder: "120", min: "30", step: "30", required: true })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium mb-2", children: [_jsx(DollarSign, { className: "inline h-4 w-4 mr-1" }), "\u63D0\u6848\u6642\u7D66\uFF08\u5186\uFF09*"] }), _jsx(Input, { type: "number", value: formData.hourlyRate, onChange: (e) => setFormData({ ...formData, hourlyRate: e.target.value }), placeholder: "2000", min: "1000", step: "100", required: true })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium mb-2", children: [_jsx(MapPin, { className: "inline h-4 w-4 mr-1" }), "\u5E97\u8217\u6240\u5728\u5730 *"] }), _jsx(Input, { type: "text", value: formData.location, onChange: (e) => setFormData({ ...formData, location: e.target.value }), placeholder: "\u6771\u4EAC\u90FD\u6E0B\u8C37\u533A...", required: true })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "\u52DF\u96C6\u7BC4\u56F2\uFF08km\uFF09" }), _jsxs(Select, { value: formData.maxDistance, onValueChange: (value) => setFormData({ ...formData, maxDistance: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "5", children: "5km\u4EE5\u5185" }), _jsx(SelectItem, { value: "10", children: "10km\u4EE5\u5185" }), _jsx(SelectItem, { value: "15", children: "15km\u4EE5\u5185" }), _jsx(SelectItem, { value: "20", children: "20km\u4EE5\u5185" })] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "\u7DCA\u6025\u5EA6" }), _jsxs(Select, { value: formData.urgencyLevel, onValueChange: (value) => setFormData({ ...formData, urgencyLevel: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: urgencyOptions.map((option) => (_jsx(SelectItem, { value: option.value, children: _jsx(Badge, { className: option.color, children: option.label }) }, option.value))) })] })] })] }), _jsxs("div", { className: "flex space-x-3 pt-4", children: [_jsx(Button, { type: "submit", disabled: loading, className: "flex-1", children: loading ? '作成中...' : '応援要請を投稿' }), onCancel && (_jsx(Button, { type: "button", variant: "outline", onClick: onCancel, className: "", children: "\u30AD\u30E3\u30F3\u30BB\u30EB" }))] })] })] })] }));
};
export default SupportRequestForm;
