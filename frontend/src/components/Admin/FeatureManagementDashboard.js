import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
const CATEGORY_COLORS = {
    core: '#4caf50',
    enhancement: '#2196f3',
    experimental: '#ff9800',
    beta: '#9c27b0'
};
const CATEGORY_LABELS = {
    core: 'コア機能',
    enhancement: '機能拡張',
    experimental: '実験的',
    beta: 'ベータ版'
};
const PLAN_COLORS = {
    light: '#90caf9',
    standard: '#ff9800',
    premium_ai: '#9c27b0'
};
const PLAN_LABELS = {
    light: 'ライトプラン',
    standard: 'スタンダードプラン',
    premium_ai: 'AIプレミアムプラン'
};
export const FeatureManagementDashboard = () => {
    const [featureFlags, setFeatureFlags] = useState([]);
    const [tenants, setTenants] = useState([]);
    const [selectedTenant, setSelectedTenant] = useState('');
    const [loading, setLoading] = useState(true);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedFeature, setSelectedFeature] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    useEffect(() => {
        loadFeatureFlags();
        loadTenants();
    }, []);
    const loadFeatureFlags = async () => {
        try {
            const response = await fetch('/api/v1/features/admin/all', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setFeatureFlags(data.featureFlags);
            }
            else {
                setError('フィーチャーフラグの読み込みに失敗しました');
            }
        }
        catch (err) {
            setError('ネットワークエラーが発生しました');
        }
        finally {
            setLoading(false);
        }
    };
    const loadTenants = async () => {
        try {
            const response = await fetch('/api/v1/tenants', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setTenants(data.tenants || []);
            }
        }
        catch (err) {
            console.error('Failed to load tenants:', err);
        }
    };
    const updateFeatureFlag = async (featureId, updates) => {
        try {
            const response = await fetch(`/api/v1/features/admin/${featureId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(updates)
            });
            if (response.ok) {
                loadFeatureFlags();
                setSuccess('機能設定を更新しました');
                setTimeout(() => setSuccess(''), 3000);
            }
            else {
                setError('更新に失敗しました');
            }
        }
        catch (err) {
            setError('ネットワークエラーが発生しました');
        }
    };
    const toggleFeature = async (feature) => {
        await updateFeatureFlag(feature.id, { isEnabled: !feature.isEnabled });
    };
    const updateRolloutPercentage = async (feature, percentage) => {
        await updateFeatureFlag(feature.id, { rolloutPercentage: percentage });
    };
    const setupInitialFeatures = async () => {
        try {
            const response = await fetch('/api/v1/features/admin/setup', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                loadFeatureFlags();
                setSuccess('初期フィーチャーフラグをセットアップしました');
            }
        }
        catch (err) {
            setError('セットアップに失敗しました');
        }
    };
    if (loading) {
        return (_jsx("div", { className: "container mx-auto p-8", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "inline-block animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500" }), _jsx("p", { className: "mt-4 text-gray-600", children: "\u8AAD\u307F\u8FBC\u307F\u4E2D..." })] }) }));
    }
    return (_jsxs("div", { className: "container mx-auto p-8", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900 mb-4", children: "\u6A5F\u80FD\u7BA1\u7406\u30C0\u30C3\u30B7\u30E5\u30DC\u30FC\u30C9" }), error && (_jsxs("div", { className: "bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4", children: [_jsx("span", { className: "block sm:inline", children: error }), _jsx("button", { className: "float-right", onClick: () => setError(''), children: "\u00D7" })] })), success && (_jsxs("div", { className: "bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4", children: [_jsx("span", { className: "block sm:inline", children: success }), _jsx("button", { className: "float-right", onClick: () => setSuccess(''), children: "\u00D7" })] })), _jsxs("div", { className: "flex gap-4 mb-6", children: [_jsx("button", { onClick: setupInitialFeatures, className: "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded", children: "\u521D\u671F\u6A5F\u80FD\u3092\u30BB\u30C3\u30C8\u30A2\u30C3\u30D7" }), _jsxs("select", { value: selectedTenant, onChange: (e) => setSelectedTenant(e.target.value), className: "border border-gray-300 rounded px-3 py-2", children: [_jsx("option", { value: "", children: "\u5168\u30C6\u30CA\u30F3\u30C8" }), tenants.map((tenant) => (_jsxs("option", { value: tenant.id, children: [tenant.name, " (", tenant.plan, ")"] }, tenant.id)))] })] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: featureFlags.map((feature) => (_jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 truncate", children: feature.name }), _jsx("span", { className: "px-2 py-1 text-xs font-medium rounded-full text-white", style: { backgroundColor: CATEGORY_COLORS[feature.category] }, children: CATEGORY_LABELS[feature.category] })] }), _jsx("p", { className: "text-gray-600 text-sm mb-4", children: feature.description || 'No description' }), _jsx("div", { className: "mb-4", children: _jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: feature.isEnabled, onChange: () => toggleFeature(feature), className: "mr-2" }), _jsx("span", { className: "text-sm", children: feature.isEnabled ? "有効" : "無効" })] }) }), feature.isEnabled && (_jsxs("div", { className: "mb-4", children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: ["\u30ED\u30FC\u30EB\u30A2\u30A6\u30C8\u7387: ", feature.rolloutPercentage, "%"] }), _jsx("input", { type: "range", min: "0", max: "100", step: "10", value: feature.rolloutPercentage, onChange: (e) => updateRolloutPercentage(feature, parseInt(e.target.value)), className: "w-full" }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2 mt-2", children: _jsx("div", { className: "bg-blue-600 h-2 rounded-full", style: { width: `${feature.rolloutPercentage}%` } }) })] })), _jsxs("div", { className: "flex gap-2 mb-4", children: [feature.enabledPlans.length > 0 && (_jsxs("span", { className: "px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded", title: `対象プラン: ${feature.enabledPlans.join(', ')}`, children: [feature.enabledPlans.length, "\u30D7\u30E9\u30F3"] })), feature.enabledTenants.length > 0 && (_jsxs("span", { className: "px-2 py-1 bg-green-100 text-green-800 text-xs rounded", title: `対象テナント: ${feature.enabledTenants.length}件`, children: [feature.enabledTenants.length, "\u5E97\u8217"] })), feature.releaseDate && (_jsx("span", { className: "px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded", title: `リリース予定: ${new Date(feature.releaseDate).toLocaleDateString()}`, children: "\u4E88\u7D04\u6E08\u307F" }))] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => {
                                        setSelectedFeature(feature);
                                        setEditDialogOpen(true);
                                    }, className: "bg-gray-500 hover:bg-gray-700 text-white text-xs font-bold py-1 px-3 rounded", children: "\u8A2D\u5B9A" }), _jsx("button", { onClick: () => console.log('Feature details:', feature), className: "bg-gray-300 hover:bg-gray-400 text-gray-800 text-xs font-bold py-1 px-3 rounded", children: "\u8A73\u7D30" })] })] }, feature.id))) }), editDialogOpen && selectedFeature && (_jsx("div", { className: "fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full", children: _jsx("div", { className: "relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white", children: _jsxs("div", { className: "mt-3 text-center", children: [_jsxs("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: ["\u6A5F\u80FD\u8A2D\u5B9A: ", selectedFeature.name] }), _jsxs("div", { className: "mt-2 px-7 py-3", children: [_jsx("div", { className: "mb-4", children: _jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: selectedFeature.isEnabled, onChange: (e) => setSelectedFeature({
                                                        ...selectedFeature,
                                                        isEnabled: e.target.checked
                                                    }), className: "mr-2" }), _jsx("span", { className: "text-sm", children: "\u6A5F\u80FD\u3092\u6709\u52B9\u306B\u3059\u308B" })] }) }), _jsxs("div", { className: "mb-4", children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: ["\u30ED\u30FC\u30EB\u30A2\u30A6\u30C8\u7387: ", selectedFeature.rolloutPercentage, "%"] }), _jsx("input", { type: "range", min: "0", max: "100", step: "5", value: selectedFeature.rolloutPercentage, onChange: (e) => setSelectedFeature({
                                                    ...selectedFeature,
                                                    rolloutPercentage: parseInt(e.target.value)
                                                }), className: "w-full" })] }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "\u30EA\u30EA\u30FC\u30B9\u4E88\u5B9A\u65E5" }), _jsx("input", { type: "date", value: selectedFeature.releaseDate?.split('T')[0] || '', onChange: (e) => setSelectedFeature({
                                                    ...selectedFeature,
                                                    releaseDate: e.target.value
                                                }), className: "w-full border border-gray-300 rounded px-3 py-2" })] })] }), _jsxs("div", { className: "items-center px-4 py-3", children: [_jsx("button", { onClick: () => setEditDialogOpen(false), className: "px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-24 mr-2", children: "\u30AD\u30E3\u30F3\u30BB\u30EB" }), _jsx("button", { onClick: async () => {
                                            if (selectedFeature) {
                                                await updateFeatureFlag(selectedFeature.id, selectedFeature);
                                                setEditDialogOpen(false);
                                            }
                                        }, className: "px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-24", children: "\u4FDD\u5B58" })] })] }) }) }))] }));
};
