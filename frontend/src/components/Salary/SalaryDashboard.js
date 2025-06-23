import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
// UIコンポーネントの代替実装
const Card = ({ children, className = '' }) => _jsx("div", { className: `bg-white rounded-lg shadow ${className}`, children: children });
const CardHeader = ({ children }) => _jsx("div", { className: "p-4 border-b", children: children });
const CardTitle = ({ children, className = '' }) => _jsx("h3", { className: `text-lg font-semibold ${className}`, children: children });
const CardContent = ({ children, className = '' }) => _jsx("div", { className: `p-4 ${className}`, children: children });
const Button = ({ children, onClick, disabled, type = 'button', className = '' }) => _jsx("button", { type: type, onClick: onClick, disabled: disabled, className: `px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 ${className}`, children: children });
const Input = ({ type, value, onChange, placeholder, min, step, required, className = '' }) => _jsx("input", { type: type, value: value, onChange: onChange, placeholder: placeholder, min: min, step: step, required: required, className: `px-3 py-2 border rounded ${className}` });
const Badge = ({ children, className = '', variant }) => _jsx("span", { className: `inline-block px-2 py-1 text-xs rounded ${className}`, children: children });
const Progress = ({ value, className = '' }) => _jsx("div", { className: `bg-gray-200 rounded ${className}`, children: _jsx("div", { className: "bg-blue-600 h-full rounded", style: { width: `${value}%` } }) });
const Alert = ({ children, className = '' }) => _jsx("div", { className: `p-4 rounded border ${className}`, children: children });
const AlertDescription = ({ children, className = '' }) => _jsx("p", { className: className, children: children });
import { DollarSign, Target, Calendar, Clock, Users, Star, AlertTriangle, CheckCircle } from 'lucide-react';
const SalaryDashboard = () => {
    const [salaryData, setSalaryData] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [goalInput, setGoalInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);
    useEffect(() => {
        fetchSalaryData();
    }, [selectedYear, selectedMonth]);
    const fetchSalaryData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/v1/salary/dashboard?year=${selectedYear}&month=${selectedMonth}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                const data = await response.json();
                setSalaryData(data.dashboard);
                if (data.dashboard.monthlyGoal) {
                    setGoalInput(data.dashboard.monthlyGoal.toString());
                }
            }
            else {
                const error = await response.json();
                if (error.code === 'FEATURE_DISABLED') {
                    setMessage({ type: 'error', text: '給料見える化システムが無効化されています。管理者にお問い合わせください。' });
                }
                else {
                    throw new Error(error.error || 'データの取得に失敗しました');
                }
            }
        }
        catch (error) {
            setMessage({ type: 'error', text: error instanceof Error ? error.message : '不明なエラー' });
        }
        finally {
            setLoading(false);
        }
    };
    const setMonthlyGoal = async () => {
        try {
            const response = await fetch(`/api/v1/salary/goal?year=${selectedYear}&month=${selectedMonth}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ monthlyGoal: parseFloat(goalInput) })
            });
            if (response.ok) {
                setMessage({ type: 'success', text: '目標を設定しました！' });
                await fetchSalaryData();
            }
            else {
                throw new Error('目標設定に失敗しました');
            }
        }
        catch (error) {
            setMessage({ type: 'error', text: error instanceof Error ? error.message : '不明なエラー' });
        }
    };
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('ja-JP', {
            style: 'currency',
            currency: 'JPY',
            minimumFractionDigits: 0
        }).format(amount);
    };
    const getMonthName = (month) => {
        return `${month}月`;
    };
    if (loading) {
        return (_jsxs("div", { className: "flex items-center justify-center p-8", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" }), _jsx("span", { className: "ml-2", children: "\u7D66\u4E0E\u30C7\u30FC\u30BF\u3092\u8AAD\u307F\u8FBC\u3093\u3067\u3044\u307E\u3059..." })] }));
    }
    if (!salaryData) {
        return (_jsx("div", { className: "p-8 text-center", children: _jsx("p", { className: "text-gray-600", children: "\u7D66\u4E0E\u30C7\u30FC\u30BF\u304C\u3042\u308A\u307E\u305B\u3093" }) }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(DollarSign, { className: "h-6 w-6 text-green-600" }), _jsx("h1", { className: "text-2xl font-bold", children: "\u7D66\u4E0E\u30C0\u30C3\u30B7\u30E5\u30DC\u30FC\u30C9" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("select", { value: selectedYear, onChange: (e) => setSelectedYear(Number(e.target.value)), className: "px-3 py-1 border rounded", children: [2024, 2025].map(year => (_jsxs("option", { value: year, children: [year, "\u5E74"] }, year))) }), _jsx("select", { value: selectedMonth, onChange: (e) => setSelectedMonth(Number(e.target.value)), className: "px-3 py-1 border rounded", children: Array.from({ length: 12 }, (_, i) => i + 1).map(month => (_jsx("option", { value: month, children: getMonthName(month) }, month))) })] })] }), message && (_jsxs(Alert, { className: message.type === 'error' ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50', children: [message.type === 'error' ? (_jsx(AlertTriangle, { className: "h-4 w-4 text-red-600" })) : (_jsx(CheckCircle, { className: "h-4 w-4 text-green-600" })), _jsx(AlertDescription, { className: message.type === 'error' ? 'text-red-700' : 'text-green-700', children: message.text })] })), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsx(Card, { children: _jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(DollarSign, { className: "h-5 w-5 text-green-600" }), _jsx("span", { className: "text-sm font-medium text-gray-600", children: "\u4ECA\u6708\u306E\u7DCF\u53CE\u5165" })] }), _jsxs("div", { className: "mt-2", children: [_jsx("span", { className: "text-2xl font-bold text-green-600", children: formatCurrency(salaryData.totalGross) }), _jsxs("div", { className: "text-xs text-gray-500 mt-1", children: ["\u624B\u53D6\u308A: ", formatCurrency(salaryData.totalNet)] })] })] }) }), _jsx(Card, { children: _jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Clock, { className: "h-5 w-5 text-blue-600" }), _jsx("span", { className: "text-sm font-medium text-gray-600", children: "\u52B4\u50CD\u6642\u9593" })] }), _jsxs("div", { className: "mt-2", children: [_jsxs("span", { className: "text-2xl font-bold text-blue-600", children: [salaryData.totalHours, "h"] }), _jsxs("div", { className: "text-xs text-gray-500 mt-1", children: ["\u5FDC\u63F4: ", salaryData.supportEarnings > 0 ? '含む' : 'なし'] })] })] }) }), _jsx(Card, { children: _jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Users, { className: "h-5 w-5 text-purple-600" }), _jsx("span", { className: "text-sm font-medium text-gray-600", children: "\u63A5\u5BA2\u6570" })] }), _jsxs("div", { className: "mt-2", children: [_jsxs("span", { className: "text-2xl font-bold text-purple-600", children: [salaryData.totalCustomers, "\u4EBA"] }), _jsxs("div", { className: "text-xs text-gray-500 mt-1", children: ["\u58F2\u4E0A: ", formatCurrency(salaryData.totalRevenue)] })] })] }) }), _jsx(Card, { children: _jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Star, { className: "h-5 w-5 text-yellow-600" }), _jsx("span", { className: "text-sm font-medium text-gray-600", children: "\u8A55\u4FA1" })] }), _jsxs("div", { className: "mt-2", children: [_jsx("span", { className: "text-2xl font-bold text-yellow-600", children: salaryData.customerRating.toFixed(1) }), _jsx("div", { className: "text-xs text-gray-500 mt-1", children: "5\u70B9\u6E80\u70B9" })] })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(Target, { className: "h-5 w-5" }), _jsx("span", { children: "\u6708\u9593\u76EE\u6A19" })] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Input, { type: "number", placeholder: "\u76EE\u6A19\u91D1\u984D\uFF08\u5186\uFF09", value: goalInput, onChange: (e) => setGoalInput(e.target.value), className: "flex-1" }), _jsx(Button, { onClick: setMonthlyGoal, children: "\u76EE\u6A19\u8A2D\u5B9A" })] }), salaryData.monthlyGoal && (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsxs("span", { children: ["\u76EE\u6A19: ", formatCurrency(salaryData.monthlyGoal)] }), _jsxs("span", { children: ["\u9054\u6210\u7387: ", salaryData.goalProgress.toFixed(1), "%"] })] }), _jsx(Progress, { value: salaryData.goalProgress, className: "h-2" }), salaryData.projection && (_jsxs("div", { className: "text-sm text-gray-600", children: [_jsxs("span", { children: ["\u6708\u672B\u4E88\u60F3: ", formatCurrency(salaryData.projection.projectedTotal)] }), salaryData.projection.isOnTrack !== null && (_jsx(Badge, { className: `ml-2 ${salaryData.projection.isOnTrack ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`, children: salaryData.projection.isOnTrack ? '目標達成見込み' : '要努力' }))] }))] }))] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "\u53CE\u5165\u5185\u8A33" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsxs("div", { className: "text-center p-3 bg-blue-50 rounded", children: [_jsx("div", { className: "text-sm text-gray-600", children: "\u57FA\u672C\u7D66" }), _jsx("div", { className: "text-lg font-semibold text-blue-600", children: formatCurrency(salaryData.baseSalary) })] }), _jsxs("div", { className: "text-center p-3 bg-green-50 rounded", children: [_jsx("div", { className: "text-sm text-gray-600", children: "\u6B69\u5408\u7D66" }), _jsx("div", { className: "text-lg font-semibold text-green-600", children: formatCurrency(salaryData.commission) })] }), _jsxs("div", { className: "text-center p-3 bg-purple-50 rounded", children: [_jsx("div", { className: "text-sm text-gray-600", children: "\u30DC\u30FC\u30CA\u30B9" }), _jsx("div", { className: "text-lg font-semibold text-purple-600", children: formatCurrency(salaryData.bonus) })] }), _jsxs("div", { className: "text-center p-3 bg-orange-50 rounded", children: [_jsx("div", { className: "text-sm text-gray-600", children: "\u5FDC\u63F4\u53CE\u5165" }), _jsx("div", { className: "text-lg font-semibold text-orange-600", children: formatCurrency(salaryData.supportEarnings) })] })] }) })] }), salaryData.dailyRecords.length > 0 && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(Calendar, { className: "h-5 w-5" }), _jsx("span", { children: "\u6700\u8FD1\u306E\u5B9F\u7E3E" })] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-2", children: salaryData.dailyRecords.slice(-7).map((record) => (_jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-50 rounded", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium", children: new Date(record.date).toLocaleDateString('ja-JP') }), _jsxs("div", { className: "text-sm text-gray-600", children: [record.hoursWorked, "h / ", record.customersServed, "\u4EBA", record.customerRating && (_jsxs("span", { className: "ml-2", children: ["\u2B50 ", record.customerRating] }))] })] }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: "font-semibold", children: formatCurrency(record.dailyEarnings) }), record.supportEarnings > 0 && (_jsxs("div", { className: "text-sm text-orange-600", children: ["\u5FDC\u63F4: ", formatCurrency(record.supportEarnings)] }))] })] }, record.id))) }) })] }))] }));
};
export default SalaryDashboard;
