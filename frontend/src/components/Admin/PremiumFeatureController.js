import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Crown, Zap, Settings, AlertTriangle, TrendingUp } from 'lucide-react';
export const PremiumFeatureController = () => {
    const [premiumFeatures, setPremiumFeatures] = useState([]);
    const [rolloutStats, setRolloutStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedFeature, setSelectedFeature] = useState('');
    const fetchPremiumFeatures = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/v1/features/admin/all', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                const premiumOnly = data.featureFlags.filter((f) => f.dependencies?.includes('standard_plan') || f.dependencies?.includes('premium_ai_plan'));
                setPremiumFeatures(premiumOnly);
            }
        }
        catch (error) {
            console.error('Failed to fetch premium features:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const updateRolloutPercentage = async (featureKey, percentage) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/v1/features/admin/rollout/${featureKey}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ percentage })
            });
            if (response.ok) {
                await fetchPremiumFeatures();
            }
        }
        catch (error) {
            console.error('Failed to update rollout percentage:', error);
        }
    };
    const setupProductionFlags = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/v1/features/admin/setup-production', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                alert('本番環境フィーチャーフラグの初期設定が完了しました');
                await fetchPremiumFeatures();
            }
        }
        catch (error) {
            console.error('Failed to setup production flags:', error);
            alert('設定に失敗しました');
        }
    };
    const emergencyDisable = async (featureKey) => {
        if (!confirm(`機能 "${featureKey}" を緊急無効化しますか？`))
            return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/v1/features/admin/emergency-disable/${featureKey}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                alert('機能を緊急無効化しました');
                await fetchPremiumFeatures();
            }
        }
        catch (error) {
            console.error('Failed to emergency disable feature:', error);
        }
    };
    useEffect(() => {
        fetchPremiumFeatures();
    }, []);
    const getPlanIcon = (plan) => {
        switch (plan) {
            case 'standard':
                return _jsx(Zap, { className: "w-4 h-4 text-orange-500" });
            case 'premium_ai':
                return _jsx(Crown, { className: "w-4 h-4 text-purple-500" });
            default:
                return _jsx(Settings, { className: "w-4 h-4 text-gray-500" });
        }
    };
    const getRolloutStatusColor = (percentage) => {
        if (percentage === 0)
            return 'bg-gray-200';
        if (percentage < 25)
            return 'bg-yellow-200';
        if (percentage < 75)
            return 'bg-blue-200';
        return 'bg-green-200';
    };
    if (loading) {
        return (_jsx("div", { className: "flex justify-center items-center p-8", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" }) }));
    }
    return (_jsxs("div", { className: "max-w-6xl mx-auto p-6", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900 mb-2", children: "\u30D7\u30EC\u30DF\u30A2\u30E0\u6A5F\u80FD\u7BA1\u7406\u30C0\u30C3\u30B7\u30E5\u30DC\u30FC\u30C9" }), _jsx("p", { className: "text-gray-600", children: "\u30B9\u30BF\u30F3\u30C0\u30FC\u30C9\u30FB\u30D7\u30EC\u30DF\u30A2\u30E0\u30D7\u30E9\u30F3\u9650\u5B9A\u6A5F\u80FD\u306E\u6BB5\u968E\u7684\u30EA\u30EA\u30FC\u30B9\u7BA1\u7406" })] }), _jsxs("div", { className: "bg-white rounded-lg shadow-sm border p-6 mb-6", children: [_jsx("h2", { className: "text-lg font-semibold mb-4", children: "\u30AF\u30A4\u30C3\u30AF\u30A2\u30AF\u30B7\u30E7\u30F3" }), _jsx("div", { className: "flex flex-wrap gap-3", children: _jsx("button", { onClick: setupProductionFlags, className: "bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors", children: "\u672C\u756A\u74B0\u5883\u521D\u671F\u8A2D\u5B9A\u5B9F\u884C" }) })] }), _jsx("div", { className: "grid gap-6", children: premiumFeatures.map((feature) => (_jsxs("div", { className: "bg-white rounded-lg shadow-sm border p-6", children: [_jsxs("div", { className: "flex justify-between items-start mb-4", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [getPlanIcon(feature.plan), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: feature.name }), _jsx("p", { className: "text-sm text-gray-600", children: feature.description })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: `px-2 py-1 rounded-full text-xs font-medium ${feature.isEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`, children: feature.isEnabled ? '有効' : '無効' }), _jsx("button", { onClick: () => emergencyDisable(feature.key), className: "text-red-600 hover:text-red-700 p-1", title: "\u7DCA\u6025\u7121\u52B9\u5316", children: _jsx(AlertTriangle, { className: "w-4 h-4" }) })] })] }), _jsxs("div", { className: "mb-4", children: [_jsxs("div", { className: "flex justify-between items-center mb-2", children: [_jsxs("span", { className: "text-sm font-medium text-gray-700", children: ["\u30ED\u30FC\u30EB\u30A2\u30A6\u30C8\u7387: ", feature.rolloutPercentage, "%"] }), _jsx(TrendingUp, { className: "w-4 h-4 text-gray-400" })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "flex-1", children: _jsx("div", { className: `h-2 rounded-full ${getRolloutStatusColor(feature.rolloutPercentage)}`, children: _jsx("div", { className: "h-2 bg-blue-600 rounded-full transition-all duration-300", style: { width: `${feature.rolloutPercentage}%` } }) }) }), _jsx("div", { className: "flex space-x-1", children: [0, 25, 50, 75, 100].map((percentage) => (_jsxs("button", { onClick: () => updateRolloutPercentage(feature.key, percentage), className: `px-2 py-1 text-xs rounded ${feature.rolloutPercentage === percentage
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`, children: [percentage, "%"] }, percentage))) })] })] }), feature.dependencies && feature.dependencies.length > 0 && (_jsxs("div", { className: "text-xs text-gray-500", children: ["\u4F9D\u5B58: ", feature.dependencies.join(', ')] }))] }, feature.key))) }), premiumFeatures.length === 0 && (_jsx("div", { className: "text-center py-8", children: _jsx("p", { className: "text-gray-500", children: "\u30D7\u30EC\u30DF\u30A2\u30E0\u6A5F\u80FD\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093" }) }))] }));
};
export default PremiumFeatureController;
