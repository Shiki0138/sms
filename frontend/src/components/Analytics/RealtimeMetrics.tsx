import React, { useState, useEffect, useRef } from 'react'
import { 
  Activity,
  Users,
  DollarSign,
  Calendar,
  Zap,
  Wifi,
  WifiOff,
  TrendingUp,
  Clock,
  Target,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface RealtimeMetricsProps {
  tenantId: string
  isEnabled?: boolean
}

interface MetricData {
  timestamp: Date
  value: number
  label: string
  change?: number
}

interface ConnectionStatus {
  status: 'connected' | 'disconnected' | 'connecting'
  lastUpdate: Date | null
  latency: number
}

const RealtimeMetrics: React.FC<RealtimeMetricsProps> = ({ 
  tenantId, 
  isEnabled = true 
}) => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    status: 'disconnected',
    lastUpdate: null,
    latency: 0
  })

  const [metrics, setMetrics] = useState({
    activeUsers: [] as MetricData[],
    todayBookings: [] as MetricData[],
    realTimeRevenue: [] as MetricData[],
    systemLoad: [] as MetricData[],
    responseTime: [] as MetricData[],
    errorRate: [] as MetricData[]
  })

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // WebSocket接続とリアルタイムデータ取得
  useEffect(() => {
    if (!isEnabled) return

    const connectWebSocket = () => {
      try {
        setConnectionStatus(prev => ({ ...prev, status: 'connecting' }))
        
        // WebSocket接続
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
        const wsUrl = `${protocol}//${window.location.host}/api/v1/metrics/realtime`
        
        wsRef.current = new WebSocket(wsUrl)

        wsRef.current.onopen = () => {
          console.log('✅ リアルタイム分析接続成功')
          setConnectionStatus({
            status: 'connected',
            lastUpdate: new Date(),
            latency: 0
          })

          // テナントIDを送信
          wsRef.current?.send(JSON.stringify({
            type: 'subscribe',
            tenantId: tenantId
          }))

          // Pingインターバル開始
          startPingInterval()
        }

        wsRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            handleRealtimeData(data)
            
            setConnectionStatus(prev => ({
              ...prev,
              lastUpdate: new Date(),
              latency: data.latency || prev.latency
            }))
          } catch (error) {
            console.error('WebSocketメッセージ解析エラー:', error)
          }
        }

        wsRef.current.onclose = () => {
          console.log('⚠️ リアルタイム分析接続切断')
          setConnectionStatus(prev => ({ ...prev, status: 'disconnected' }))
          
          // 自動再接続（5秒後）
          if (isEnabled) {
            reconnectTimeoutRef.current = setTimeout(connectWebSocket, 5000)
          }
        }

        wsRef.current.onerror = (error) => {
          console.error('WebSocketエラー:', error)
          setConnectionStatus(prev => ({ ...prev, status: 'disconnected' }))
        }

      } catch (error) {
        console.error('WebSocket接続エラー:', error)
        setConnectionStatus(prev => ({ ...prev, status: 'disconnected' }))
      }
    }

    connectWebSocket()

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current)
      }
    }
  }, [tenantId, isEnabled])

  const startPingInterval = () => {
    pingIntervalRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        const pingStart = Date.now()
        wsRef.current.send(JSON.stringify({
          type: 'ping',
          timestamp: pingStart
        }))
      }
    }, 30000) // 30秒間隔
  }

  const handleRealtimeData = (data: any) => {
    const timestamp = new Date()
    
    setMetrics(prev => {
      const newMetrics = { ...prev }
      
      // 各指標を更新（最大50データポイント保持）
      Object.keys(data.metrics || {}).forEach(key => {
        if (newMetrics[key as keyof typeof newMetrics]) {
          const currentData = newMetrics[key as keyof typeof newMetrics]
          const newValue = data.metrics[key]
          const previousValue = currentData[currentData.length - 1]?.value || 0
          const change = previousValue > 0 ? ((newValue - previousValue) / previousValue) * 100 : 0

          const newPoint: MetricData = {
            timestamp,
            value: newValue,
            label: getMetricLabel(key),
            change
          }

          newMetrics[key as keyof typeof newMetrics] = [
            ...currentData.slice(-49), // 最新49個を保持
            newPoint
          ]
        }
      })
      
      return newMetrics
    })
  }

  const getMetricLabel = (key: string): string => {
    const labels: Record<string, string> = {
      activeUsers: 'アクティブユーザー',
      todayBookings: '今日の予約',
      realTimeRevenue: 'リアルタイム売上',
      systemLoad: 'システム負荷',
      responseTime: '応答時間',
      errorRate: 'エラー率'
    }
    return labels[key] || key
  }

  const getStatusIcon = () => {
    switch (connectionStatus.status) {
      case 'connected':
        return <Wifi className="w-4 h-4 text-green-500" />
      case 'connecting':
        return <Activity className="w-4 h-4 text-yellow-500 animate-pulse" />
      default:
        return <WifiOff className="w-4 h-4 text-red-500" />
    }
  }

  const getStatusColor = () => {
    switch (connectionStatus.status) {
      case 'connected':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'connecting':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default:
        return 'text-red-600 bg-red-50 border-red-200'
    }
  }

  const getCurrentValue = (metricKey: keyof typeof metrics): number => {
    const data = metrics[metricKey]
    return data[data.length - 1]?.value || 0
  }

  const getCurrentChange = (metricKey: keyof typeof metrics): number => {
    const data = metrics[metricKey]
    return data[data.length - 1]?.change || 0
  }

  const formatValue = (value: number, type: string): string => {
    switch (type) {
      case 'currency':
        return `¥${value.toLocaleString()}`
      case 'percentage':
        return `${value.toFixed(1)}%`
      case 'milliseconds':
        return `${value.toFixed(0)}ms`
      default:
        return value.toString()
    }
  }

  const MiniChart: React.FC<{ data: MetricData[], color: string }> = ({ data, color }) => {
    if (data.length < 2) return <div className="h-8 bg-gray-100 rounded"></div>

    const maxValue = Math.max(...data.map(d => d.value))
    const minValue = Math.min(...data.map(d => d.value))
    const range = maxValue - minValue || 1

    return (
      <div className="h-8 flex items-end space-x-1">
        {data.slice(-10).map((point, index) => {
          const height = ((point.value - minValue) / range) * 100
          return (
            <div
              key={index}
              className={`flex-1 ${color} rounded-sm min-h-[2px]`}
              style={{ height: `${Math.max(2, height)}%` }}
              title={`${point.label}: ${point.value} (${point.timestamp.toLocaleTimeString()})`}
            />
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 接続ステータス */}
      <div className={`flex items-center justify-between p-3 rounded-lg border ${getStatusColor()}`}>
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className="text-sm font-medium">
            リアルタイム分析: {connectionStatus.status === 'connected' ? '接続中' : 
                            connectionStatus.status === 'connecting' ? '接続中...' : '切断'}
          </span>
        </div>
        <div className="text-xs">
          {connectionStatus.lastUpdate && (
            <span>最終更新: {connectionStatus.lastUpdate.toLocaleTimeString()}</span>
          )}
          {connectionStatus.latency > 0 && (
            <span className="ml-2">遅延: {connectionStatus.latency}ms</span>
          )}
        </div>
      </div>

      {/* メトリクスカード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* アクティブユーザー */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Users className="w-5 h-5 text-blue-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">アクティブユーザー</span>
            </div>
            {getCurrentChange('activeUsers') !== 0 && (
              <div className={`flex items-center text-xs ${
                getCurrentChange('activeUsers') > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                <TrendingUp className="w-3 h-3 mr-1" />
                {getCurrentChange('activeUsers').toFixed(1)}%
              </div>
            )}
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-2">
            {getCurrentValue('activeUsers')}
          </div>
          <MiniChart data={metrics.activeUsers} color="bg-blue-500" />
        </div>

        {/* 今日の予約 */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">今日の予約</span>
            </div>
            {getCurrentChange('todayBookings') !== 0 && (
              <div className={`flex items-center text-xs ${
                getCurrentChange('todayBookings') > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                <TrendingUp className="w-3 h-3 mr-1" />
                {getCurrentChange('todayBookings').toFixed(1)}%
              </div>
            )}
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-2">
            {getCurrentValue('todayBookings')}
          </div>
          <MiniChart data={metrics.todayBookings} color="bg-green-500" />
        </div>

        {/* リアルタイム売上 */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <DollarSign className="w-5 h-5 text-purple-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">リアルタイム売上</span>
            </div>
            {getCurrentChange('realTimeRevenue') !== 0 && (
              <div className={`flex items-center text-xs ${
                getCurrentChange('realTimeRevenue') > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                <TrendingUp className="w-3 h-3 mr-1" />
                {getCurrentChange('realTimeRevenue').toFixed(1)}%
              </div>
            )}
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-2">
            {formatValue(getCurrentValue('realTimeRevenue'), 'currency')}
          </div>
          <MiniChart data={metrics.realTimeRevenue} color="bg-purple-500" />
        </div>

        {/* システム負荷 */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Zap className="w-5 h-5 text-yellow-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">システム負荷</span>
            </div>
            {getCurrentValue('systemLoad') > 80 && (
              <AlertCircle className="w-4 h-4 text-red-500" />
            )}
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-2">
            {formatValue(getCurrentValue('systemLoad'), 'percentage')}
          </div>
          <MiniChart data={metrics.systemLoad} color={
            getCurrentValue('systemLoad') > 80 ? 'bg-red-500' : 
            getCurrentValue('systemLoad') > 60 ? 'bg-yellow-500' : 'bg-green-500'
          } />
        </div>

        {/* 応答時間 */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-indigo-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">応答時間</span>
            </div>
            {getCurrentValue('responseTime') > 1000 && (
              <AlertCircle className="w-4 h-4 text-red-500" />
            )}
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-2">
            {formatValue(getCurrentValue('responseTime'), 'milliseconds')}
          </div>
          <MiniChart data={metrics.responseTime} color={
            getCurrentValue('responseTime') > 1000 ? 'bg-red-500' : 
            getCurrentValue('responseTime') > 500 ? 'bg-yellow-500' : 'bg-green-500'
          } />
        </div>

        {/* エラー率 */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Target className="w-5 h-5 text-orange-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">エラー率</span>
            </div>
            {getCurrentValue('errorRate') > 1 && (
              <XCircle className="w-4 h-4 text-red-500" />
            )}
            {getCurrentValue('errorRate') === 0 && (
              <CheckCircle className="w-4 h-4 text-green-500" />
            )}
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-2">
            {formatValue(getCurrentValue('errorRate'), 'percentage')}
          </div>
          <MiniChart data={metrics.errorRate} color={
            getCurrentValue('errorRate') > 1 ? 'bg-red-500' : 'bg-green-500'
          } />
        </div>
      </div>

      {/* システムヘルス概要 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-blue-600" />
          システムヘルス概要
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${
              getCurrentValue('systemLoad') < 70 ? 'bg-green-500' : 
              getCurrentValue('systemLoad') < 85 ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span className="text-sm">
              システム負荷: {getCurrentValue('systemLoad') < 70 ? '正常' : 
                           getCurrentValue('systemLoad') < 85 ? '注意' : '危険'}
            </span>
          </div>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${
              getCurrentValue('responseTime') < 500 ? 'bg-green-500' : 
              getCurrentValue('responseTime') < 1000 ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span className="text-sm">
              応答速度: {getCurrentValue('responseTime') < 500 ? '高速' : 
                      getCurrentValue('responseTime') < 1000 ? '普通' : '低速'}
            </span>
          </div>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${
              getCurrentValue('errorRate') === 0 ? 'bg-green-500' : 
              getCurrentValue('errorRate') < 1 ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span className="text-sm">
              エラー状況: {getCurrentValue('errorRate') === 0 ? '問題なし' : 
                        getCurrentValue('errorRate') < 1 ? '軽微' : '要対応'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RealtimeMetrics