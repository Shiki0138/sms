import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { Activity, Users, DollarSign, Calendar, Zap, Wifi, WifiOff, TrendingUp, Clock, Target, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
const RealtimeMetrics = ({ tenantId, isEnabled = true }) => {
    const [connectionStatus, setConnectionStatus] = useState({
        status: 'disconnected',
        lastUpdate: null,
        latency: 0
    });
    const [metrics, setMetrics] = useState({
        activeUsers: [],
        todayBookings: [],
        realTimeRevenue: [],
        systemLoad: [],
        responseTime: [],
        errorRate: []
    });
    const wsRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const pingIntervalRef = useRef(null);
    // WebSocket接続とリアルタイムデータ取得
    useEffect(() => {
        if (!isEnabled)
            return;
        const connectWebSocket = () => {
            try {
                setConnectionStatus(prev => ({ ...prev, status: 'connecting' }));
                // WebSocket接続
                const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
                const wsUrl = `${protocol}//${window.location.host}/api/v1/metrics/realtime`;
                wsRef.current = new WebSocket(wsUrl);
                wsRef.current.onopen = () => {
                    console.log('✅ リアルタイム分析接続成功');
                    setConnectionStatus({
                        status: 'connected',
                        lastUpdate: new Date(),
                        latency: 0
                    });
                    // テナントIDを送信
                    wsRef.current?.send(JSON.stringify({
                        type: 'subscribe',
                        tenantId: tenantId
                    }));
                    // Pingインターバル開始
                    startPingInterval();
                };
                wsRef.current.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        handleRealtimeData(data);
                        setConnectionStatus(prev => ({
                            ...prev,
                            lastUpdate: new Date(),
                            latency: data.latency || prev.latency
                        }));
                    }
                    catch (error) {
                        console.error('WebSocketメッセージ解析エラー:', error);
                    }
                };
                wsRef.current.onclose = () => {
                    console.log('⚠️ リアルタイム分析接続切断');
                    setConnectionStatus(prev => ({ ...prev, status: 'disconnected' }));
                    // 自動再接続（5秒後）
                    if (isEnabled) {
                        reconnectTimeoutRef.current = setTimeout(connectWebSocket, 5000);
                    }
                };
                wsRef.current.onerror = (error) => {
                    console.error('WebSocketエラー:', error);
                    setConnectionStatus(prev => ({ ...prev, status: 'disconnected' }));
                };
            }
            catch (error) {
                console.error('WebSocket接続エラー:', error);
                setConnectionStatus(prev => ({ ...prev, status: 'disconnected' }));
            }
        };
        connectWebSocket();
        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (pingIntervalRef.current) {
                clearInterval(pingIntervalRef.current);
            }
        };
    }, [tenantId, isEnabled]);
    const startPingInterval = () => {
        pingIntervalRef.current = setInterval(() => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
                const pingStart = Date.now();
                wsRef.current.send(JSON.stringify({
                    type: 'ping',
                    timestamp: pingStart
                }));
            }
        }, 30000); // 30秒間隔
    };
    const handleRealtimeData = (data) => {
        const timestamp = new Date();
        setMetrics(prev => {
            const newMetrics = { ...prev };
            // 各指標を更新（最大50データポイント保持）
            Object.keys(data.metrics || {}).forEach(key => {
                if (newMetrics[key]) {
                    const currentData = newMetrics[key];
                    const newValue = data.metrics[key];
                    const previousValue = currentData[currentData.length - 1]?.value || 0;
                    const change = previousValue > 0 ? ((newValue - previousValue) / previousValue) * 100 : 0;
                    const newPoint = {
                        timestamp,
                        value: newValue,
                        label: getMetricLabel(key),
                        change
                    };
                    newMetrics[key] = [
                        ...currentData.slice(-49), // 最新49個を保持
                        newPoint
                    ];
                }
            });
            return newMetrics;
        });
    };
    const getMetricLabel = (key) => {
        const labels = {
            activeUsers: 'アクティブユーザー',
            todayBookings: '今日の予約',
            realTimeRevenue: 'リアルタイム売上',
            systemLoad: 'システム負荷',
            responseTime: '応答時間',
            errorRate: 'エラー率'
        };
        return labels[key] || key;
    };
    const getStatusIcon = () => {
        switch (connectionStatus.status) {
            case 'connected':
                return _jsx(Wifi, { className: "w-4 h-4 text-green-500" });
            case 'connecting':
                return _jsx(Activity, { className: "w-4 h-4 text-yellow-500 animate-pulse" });
            default:
                return _jsx(WifiOff, { className: "w-4 h-4 text-red-500" });
        }
    };
    const getStatusColor = () => {
        switch (connectionStatus.status) {
            case 'connected':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'connecting':
                return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            default:
                return 'text-red-600 bg-red-50 border-red-200';
        }
    };
    const getCurrentValue = (metricKey) => {
        const data = metrics[metricKey];
        return data[data.length - 1]?.value || 0;
    };
    const getCurrentChange = (metricKey) => {
        const data = metrics[metricKey];
        return data[data.length - 1]?.change || 0;
    };
    const formatValue = (value, type) => {
        switch (type) {
            case 'currency':
                return `¥${value.toLocaleString()}`;
            case 'percentage':
                return `${value.toFixed(1)}%`;
            case 'milliseconds':
                return `${value.toFixed(0)}ms`;
            default:
                return value.toString();
        }
    };
    const MiniChart = ({ data, color }) => {
        if (data.length < 2)
            return _jsx("div", { className: "h-8 bg-gray-100 rounded" });
        const maxValue = Math.max(...data.map(d => d.value));
        const minValue = Math.min(...data.map(d => d.value));
        const range = maxValue - minValue || 1;
        return (_jsx("div", { className: "h-8 flex items-end space-x-1", children: data.slice(-10).map((point, index) => {
                const height = ((point.value - minValue) / range) * 100;
                return (_jsx("div", { className: `flex-1 ${color} rounded-sm min-h-[2px]`, style: { height: `${Math.max(2, height)}%` }, title: `${point.label}: ${point.value} (${point.timestamp.toLocaleTimeString()})` }, index));
            }) }));
    };
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: `flex items-center justify-between p-3 rounded-lg border ${getStatusColor()}`, children: [_jsxs("div", { className: "flex items-center space-x-2", children: [getStatusIcon(), _jsxs("span", { className: "text-sm font-medium", children: ["\u30EA\u30A2\u30EB\u30BF\u30A4\u30E0\u5206\u6790: ", connectionStatus.status === 'connected' ? '接続中' :
                                        connectionStatus.status === 'connecting' ? '接続中...' : '切断'] })] }), _jsxs("div", { className: "text-xs", children: [connectionStatus.lastUpdate && (_jsxs("span", { children: ["\u6700\u7D42\u66F4\u65B0: ", connectionStatus.lastUpdate.toLocaleTimeString()] })), connectionStatus.latency > 0 && (_jsxs("span", { className: "ml-2", children: ["\u9045\u5EF6: ", connectionStatus.latency, "ms"] }))] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: [_jsxs("div", { className: "bg-white p-4 rounded-lg border border-gray-200", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(Users, { className: "w-5 h-5 text-blue-500 mr-2" }), _jsx("span", { className: "text-sm font-medium text-gray-700", children: "\u30A2\u30AF\u30C6\u30A3\u30D6\u30E6\u30FC\u30B6\u30FC" })] }), getCurrentChange('activeUsers') !== 0 && (_jsxs("div", { className: `flex items-center text-xs ${getCurrentChange('activeUsers') > 0 ? 'text-green-600' : 'text-red-600'}`, children: [_jsx(TrendingUp, { className: "w-3 h-3 mr-1" }), getCurrentChange('activeUsers').toFixed(1), "%"] }))] }), _jsx("div", { className: "text-2xl font-bold text-gray-900 mb-2", children: getCurrentValue('activeUsers') }), _jsx(MiniChart, { data: metrics.activeUsers, color: "bg-blue-500" })] }), _jsxs("div", { className: "bg-white p-4 rounded-lg border border-gray-200", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(Calendar, { className: "w-5 h-5 text-green-500 mr-2" }), _jsx("span", { className: "text-sm font-medium text-gray-700", children: "\u4ECA\u65E5\u306E\u4E88\u7D04" })] }), getCurrentChange('todayBookings') !== 0 && (_jsxs("div", { className: `flex items-center text-xs ${getCurrentChange('todayBookings') > 0 ? 'text-green-600' : 'text-red-600'}`, children: [_jsx(TrendingUp, { className: "w-3 h-3 mr-1" }), getCurrentChange('todayBookings').toFixed(1), "%"] }))] }), _jsx("div", { className: "text-2xl font-bold text-gray-900 mb-2", children: getCurrentValue('todayBookings') }), _jsx(MiniChart, { data: metrics.todayBookings, color: "bg-green-500" })] }), _jsxs("div", { className: "bg-white p-4 rounded-lg border border-gray-200", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(DollarSign, { className: "w-5 h-5 text-purple-500 mr-2" }), _jsx("span", { className: "text-sm font-medium text-gray-700", children: "\u30EA\u30A2\u30EB\u30BF\u30A4\u30E0\u58F2\u4E0A" })] }), getCurrentChange('realTimeRevenue') !== 0 && (_jsxs("div", { className: `flex items-center text-xs ${getCurrentChange('realTimeRevenue') > 0 ? 'text-green-600' : 'text-red-600'}`, children: [_jsx(TrendingUp, { className: "w-3 h-3 mr-1" }), getCurrentChange('realTimeRevenue').toFixed(1), "%"] }))] }), _jsx("div", { className: "text-2xl font-bold text-gray-900 mb-2", children: formatValue(getCurrentValue('realTimeRevenue'), 'currency') }), _jsx(MiniChart, { data: metrics.realTimeRevenue, color: "bg-purple-500" })] }), _jsxs("div", { className: "bg-white p-4 rounded-lg border border-gray-200", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(Zap, { className: "w-5 h-5 text-yellow-500 mr-2" }), _jsx("span", { className: "text-sm font-medium text-gray-700", children: "\u30B7\u30B9\u30C6\u30E0\u8CA0\u8377" })] }), getCurrentValue('systemLoad') > 80 && (_jsx(AlertCircle, { className: "w-4 h-4 text-red-500" }))] }), _jsx("div", { className: "text-2xl font-bold text-gray-900 mb-2", children: formatValue(getCurrentValue('systemLoad'), 'percentage') }), _jsx(MiniChart, { data: metrics.systemLoad, color: getCurrentValue('systemLoad') > 80 ? 'bg-red-500' :
                                    getCurrentValue('systemLoad') > 60 ? 'bg-yellow-500' : 'bg-green-500' })] }), _jsxs("div", { className: "bg-white p-4 rounded-lg border border-gray-200", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(Clock, { className: "w-5 h-5 text-indigo-500 mr-2" }), _jsx("span", { className: "text-sm font-medium text-gray-700", children: "\u5FDC\u7B54\u6642\u9593" })] }), getCurrentValue('responseTime') > 1000 && (_jsx(AlertCircle, { className: "w-4 h-4 text-red-500" }))] }), _jsx("div", { className: "text-2xl font-bold text-gray-900 mb-2", children: formatValue(getCurrentValue('responseTime'), 'milliseconds') }), _jsx(MiniChart, { data: metrics.responseTime, color: getCurrentValue('responseTime') > 1000 ? 'bg-red-500' :
                                    getCurrentValue('responseTime') > 500 ? 'bg-yellow-500' : 'bg-green-500' })] }), _jsxs("div", { className: "bg-white p-4 rounded-lg border border-gray-200", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(Target, { className: "w-5 h-5 text-orange-500 mr-2" }), _jsx("span", { className: "text-sm font-medium text-gray-700", children: "\u30A8\u30E9\u30FC\u7387" })] }), getCurrentValue('errorRate') > 1 && (_jsx(XCircle, { className: "w-4 h-4 text-red-500" })), getCurrentValue('errorRate') === 0 && (_jsx(CheckCircle, { className: "w-4 h-4 text-green-500" }))] }), _jsx("div", { className: "text-2xl font-bold text-gray-900 mb-2", children: formatValue(getCurrentValue('errorRate'), 'percentage') }), _jsx(MiniChart, { data: metrics.errorRate, color: getCurrentValue('errorRate') > 1 ? 'bg-red-500' : 'bg-green-500' })] })] }), _jsxs("div", { className: "bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200", children: [_jsxs("h3", { className: "text-lg font-semibold text-gray-800 mb-3 flex items-center", children: [_jsx(Activity, { className: "w-5 h-5 mr-2 text-blue-600" }), "\u30B7\u30B9\u30C6\u30E0\u30D8\u30EB\u30B9\u6982\u8981"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: `w-3 h-3 rounded-full mr-2 ${getCurrentValue('systemLoad') < 70 ? 'bg-green-500' :
                                            getCurrentValue('systemLoad') < 85 ? 'bg-yellow-500' : 'bg-red-500'}` }), _jsxs("span", { className: "text-sm", children: ["\u30B7\u30B9\u30C6\u30E0\u8CA0\u8377: ", getCurrentValue('systemLoad') < 70 ? '正常' :
                                                getCurrentValue('systemLoad') < 85 ? '注意' : '危険'] })] }), _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: `w-3 h-3 rounded-full mr-2 ${getCurrentValue('responseTime') < 500 ? 'bg-green-500' :
                                            getCurrentValue('responseTime') < 1000 ? 'bg-yellow-500' : 'bg-red-500'}` }), _jsxs("span", { className: "text-sm", children: ["\u5FDC\u7B54\u901F\u5EA6: ", getCurrentValue('responseTime') < 500 ? '高速' :
                                                getCurrentValue('responseTime') < 1000 ? '普通' : '低速'] })] }), _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: `w-3 h-3 rounded-full mr-2 ${getCurrentValue('errorRate') === 0 ? 'bg-green-500' :
                                            getCurrentValue('errorRate') < 1 ? 'bg-yellow-500' : 'bg-red-500'}` }), _jsxs("span", { className: "text-sm", children: ["\u30A8\u30E9\u30FC\u72B6\u6CC1: ", getCurrentValue('errorRate') === 0 ? '問題なし' :
                                                getCurrentValue('errorRate') < 1 ? '軽微' : '要対応'] })] })] })] })] }));
};
export default RealtimeMetrics;
