import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Save, Cloud, CloudOff, Clock, AlertCircle } from 'lucide-react';
const AutoSaveIndicator = ({ isAutoSaving, lastSaved, hasUnsavedChanges, error, className = '' }) => {
    const getIcon = () => {
        if (error)
            return _jsx(AlertCircle, { className: "h-4 w-4 text-red-500" });
        if (isAutoSaving)
            return _jsx(Cloud, { className: "h-4 w-4 text-blue-500 animate-pulse" });
        if (hasUnsavedChanges)
            return _jsx(Clock, { className: "h-4 w-4 text-yellow-500" });
        if (lastSaved)
            return _jsx(Save, { className: "h-4 w-4 text-green-500" });
        return _jsx(CloudOff, { className: "h-4 w-4 text-gray-400" });
    };
    const getText = () => {
        if (error)
            return 'エラー';
        if (isAutoSaving)
            return '保存中...';
        if (hasUnsavedChanges)
            return '未保存';
        if (lastSaved) {
            const now = new Date();
            const diff = Math.floor((now.getTime() - lastSaved.getTime()) / 1000);
            if (diff < 60)
                return `${diff}秒前に保存`;
            if (diff < 3600)
                return `${Math.floor(diff / 60)}分前に保存`;
            return `${Math.floor(diff / 3600)}時間前に保存`;
        }
        return '未保存';
    };
    const getTextColor = () => {
        if (error)
            return 'text-red-600';
        if (isAutoSaving)
            return 'text-blue-600';
        if (hasUnsavedChanges)
            return 'text-yellow-600';
        if (lastSaved)
            return 'text-green-600';
        return 'text-gray-500';
    };
    const getBgColor = () => {
        if (error)
            return 'bg-red-50 border-red-200';
        if (isAutoSaving)
            return 'bg-blue-50 border-blue-200';
        if (hasUnsavedChanges)
            return 'bg-yellow-50 border-yellow-200';
        if (lastSaved)
            return 'bg-green-50 border-green-200';
        return 'bg-gray-50 border-gray-200';
    };
    return (_jsxs("div", { className: `inline-flex items-center space-x-2 px-3 py-1 rounded-full border text-xs font-medium ${getBgColor()} ${getTextColor()} ${className}`, children: [getIcon(), _jsx("span", { children: getText() }), error && (_jsx("div", { className: "ml-1", children: _jsxs("div", { className: "group relative", children: [_jsx(AlertCircle, { className: "h-3 w-3 cursor-help" }), _jsx("div", { className: "absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-red-600 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap", children: error })] }) }))] }));
};
export default AutoSaveIndicator;
