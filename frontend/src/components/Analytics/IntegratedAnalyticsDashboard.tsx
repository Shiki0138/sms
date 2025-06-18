import React, { useState, useEffect, useCallback } from 'react'
import {
  Activity,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  Star,
  AlertTriangle,
  RefreshCw,
  Download,
  Settings,
  Bell,
  Eye,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  Zap,
  Clock,
  CheckCircle
} from 'lucide-react'
import { analyticsAPI, handleAnalyticsError, DashboardKPIs, ChurnAnalysis, RevenueForecast, PredictiveInsights } from './AnalyticsAPI'
import PremiumAnalyticsDashboard from './PremiumAnalyticsDashboard'
import RealtimeMetrics from './RealtimeMetrics'

interface IntegratedAnalyticsDashboardProps {
  tenantId: string
  customers: any[]
  reservations: any[]
  showRealtimeMetrics?: boolean
}

interface AnalyticsState {
  kpis: DashboardKPIs | null
  churnAnalysis: ChurnAnalysis | null
  revenueForecast: RevenueForecast | null
  predictiveInsights: PredictiveInsights | null
  customAnalytics: any
  isLoading: {
    kpis: boolean
    churn: boolean
    forecast: boolean
    insights: boolean
    custom: boolean
  }
  errors: {
    kpis: string | null
    churn: string | null
    forecast: string | null
    insights: string | null
    custom: string | null
  }
  lastUpdate: Date | null
}

const IntegratedAnalyticsDashboard: React.FC<IntegratedAnalyticsDashboardProps> = ({
  tenantId,
  customers,
  reservations,
  showRealtimeMetrics = true
}) => {
  const [state, setState] = useState<AnalyticsState>({
    kpis: null,
    churnAnalysis: null,
    revenueForecast: null,
    predictiveInsights: null,
    customAnalytics: null,
    isLoading: {
      kpis: true,
      churn: true,
      forecast: true,
      insights: true,
      custom: false
    },
    errors: {
      kpis: null,
      churn: null,
      forecast: null,
      insights: null,
      custom: null
    },
    lastUpdate: null
  })

  const [refreshInterval, setRefreshInterval] = useState<number>(300000) // 5分
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([
    'revenue', 'customers', 'churn', 'forecast'
  ])

  // データ読み込み関数
  const loadAnalyticsData = useCallback(async (forceRefresh = false) => {
    const currentTime = new Date()
    
    // 最後の更新から5分以内の場合はスキップ（forceRefreshでない限り）
    if (!forceRefresh && state.lastUpdate && 
        (currentTime.getTime() - state.lastUpdate.getTime()) < 300000) {
      return
    }

    setState(prev => ({
      ...prev,
      isLoading: {
        kpis: true,
        churn: true,
        forecast: true,
        insights: true,
        custom: false
      },
      errors: {
        kpis: null,
        churn: null,
        forecast: null,
        insights: null,
        custom: null
      }
    }))

    // 並列でデータを取得
    const promises = [
      analyticsAPI.getDashboardKPIs(tenantId),
      analyticsAPI.getChurnAnalysis(tenantId),
      analyticsAPI.getRevenueForecast(tenantId),
      analyticsAPI.getPredictiveInsights(tenantId)
    ]

    try {
      const [kpisResult, churnResult, forecastResult, insightsResult] = await Promise.allSettled(promises)

      setState(prev => ({
        ...prev,
        kpis: kpisResult.status === 'fulfilled' && kpisResult.value.success 
          ? kpisResult.value.data as DashboardKPIs
          : prev.kpis,
        churnAnalysis: churnResult.status === 'fulfilled' && churnResult.value.success 
          ? churnResult.value.data as ChurnAnalysis
          : prev.churnAnalysis,
        revenueForecast: forecastResult.status === 'fulfilled' && forecastResult.value.success 
          ? forecastResult.value.data as RevenueForecast
          : prev.revenueForecast,
        predictiveInsights: insightsResult.status === 'fulfilled' && insightsResult.value.success 
          ? insightsResult.value.data as PredictiveInsights
          : prev.predictiveInsights,
        isLoading: {
          kpis: false,
          churn: false,
          forecast: false,
          insights: false,
          custom: false
        },
        errors: {
          kpis: kpisResult.status === 'rejected' || (kpisResult.status === 'fulfilled' && !kpisResult.value.success)
            ? handleAnalyticsError(kpisResult.status === 'rejected' ? kpisResult.reason : kpisResult.value.error || '')
            : null,
          churn: churnResult.status === 'rejected' || (churnResult.status === 'fulfilled' && !churnResult.value.success)
            ? handleAnalyticsError(churnResult.status === 'rejected' ? churnResult.reason : churnResult.value.error || '')
            : null,
          forecast: forecastResult.status === 'rejected' || (forecastResult.status === 'fulfilled' && !forecastResult.value.success)
            ? handleAnalyticsError(forecastResult.status === 'rejected' ? forecastResult.reason : forecastResult.value.error || '')
            : null,
          insights: insightsResult.status === 'rejected' || (insightsResult.status === 'fulfilled' && !insightsResult.value.success)
            ? handleAnalyticsError(insightsResult.status === 'rejected' ? insightsResult.reason : insightsResult.value.error || '')
            : null,
          custom: null
        },
        lastUpdate: currentTime
      }))
    } catch (error) {
      console.error('Analytics data loading failed:', error)
    }
  }, [tenantId, state.lastUpdate])

  // 初期データ読み込み
  useEffect(() => {
    loadAnalyticsData(true)
  }, [tenantId])

  // 自動更新
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      loadAnalyticsData()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, loadAnalyticsData])

  // カスタムレポート生成
  const generateCustomReport = async (reportType: 'pdf' | 'excel' | 'csv') => {
    try {
      const result = await analyticsAPI.generateCustomReport(tenantId, {
        type: reportType,
        metrics: selectedMetrics,
        dateRange: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30日前
          end: new Date()
        }
      })

      if (result.success) {
        // レポート生成成功の通知
        alert(`${reportType.toUpperCase()}レポートの生成を開始しました。完了後にダウンロードリンクをお送りします。`)
      } else {
        throw new Error(result.error || 'レポート生成に失敗しました')
      }
    } catch (error) {
      alert(handleAnalyticsError(error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  // エラー表示コンポーネント
  const ErrorDisplay: React.FC<{ error: string; onRetry: () => void }> = ({ error, onRetry }) => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center">
        <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
        <span className="text-red-700 text-sm">{error}</span>
      </div>
      <button
        onClick={onRetry}
        className="text-red-600 hover:text-red-800 text-sm font-medium"
      >
        再試行
      </button>
    </div>
  )

  // KPIカード表示
  const KPICard: React.FC<{
    title: string
    value: string | number
    trend?: number
    icon: React.ReactNode
    color: string
    isLoading: boolean
  }> = ({ title, value, trend, icon, color, isLoading }) => (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          {isLoading ? (
            <div className="h-8 bg-gray-200 rounded animate-pulse mt-2"></div>
          ) : (
            <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
      {trend !== undefined && !isLoading && (
        <div className="mt-4 flex items-center">
          {trend > 0 ? (
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
          )}
          <span className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {Math.abs(trend).toFixed(1)}%
          </span>
          <span className="text-sm text-gray-500 ml-1">前月比</span>
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* ヘッダー・コントロール */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <BarChart3 className="w-8 h-8 mr-3 text-blue-600" />
            統合分析ダッシュボード
          </h1>
          <p className="text-gray-600 mt-1">
            史上最高クオリティの分析システム - リアルタイム監視・予測分析・AI洞察
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* 最終更新時刻 */}
          {state.lastUpdate && (
            <div className="text-sm text-gray-500 flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              最終更新: {state.lastUpdate.toLocaleTimeString('ja-JP')}
            </div>
          )}

          {/* 自動更新トグル */}
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">自動更新</span>
          </label>

          {/* 手動更新ボタン */}
          <button
            onClick={() => loadAnalyticsData(true)}
            disabled={Object.values(state.isLoading).some(loading => loading)}
            className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${Object.values(state.isLoading).some(loading => loading) ? 'animate-spin' : ''}`} />
            更新
          </button>

          {/* レポート生成 */}
          <div className="relative group">
            <button className="flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">
              <Download className="w-4 h-4 mr-1" />
              レポート
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              <div className="py-1">
                <button
                  onClick={() => generateCustomReport('pdf')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  PDFレポート
                </button>
                <button
                  onClick={() => generateCustomReport('excel')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Excelレポート
                </button>
                <button
                  onClick={() => generateCustomReport('csv')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  CSVエクスポート
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* リアルタイムメトリクス */}
      {showRealtimeMetrics && (
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-yellow-500" />
            リアルタイム監視システム
          </h2>
          <RealtimeMetrics tenantId={tenantId} />
        </div>
      )}

      {/* メインKPIカード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="今日の売上"
          value={state.kpis ? `¥${state.kpis.revenue.today.toLocaleString()}` : '---'}
          trend={state.kpis?.revenue.trend}
          icon={<DollarSign className="w-6 h-6 text-white" />}
          color="bg-green-500"
          isLoading={state.isLoading.kpis}
        />
        
        <KPICard
          title="総顧客数"
          value={state.kpis?.customers.total || '---'}
          trend={((state.kpis?.customers.newThisMonth || 0) / (state.kpis?.customers.total || 1)) * 100}
          icon={<Users className="w-6 h-6 text-white" />}
          color="bg-blue-500"
          isLoading={state.isLoading.kpis}
        />
        
        <KPICard
          title="今日の予約"
          value={state.kpis?.reservations.todayCount || '---'}
          icon={<Calendar className="w-6 h-6 text-white" />}
          color="bg-purple-500"
          isLoading={state.isLoading.kpis}
        />
        
        <KPICard
          title="顧客満足度"
          value={state.kpis ? `${state.kpis.satisfaction.averageScore.toFixed(1)}` : '---'}
          trend={state.kpis?.satisfaction.trend}
          icon={<Star className="w-6 h-6 text-white" />}
          color="bg-yellow-500"
          isLoading={state.isLoading.kpis}
        />
      </div>

      {/* エラー表示 */}
      {Object.entries(state.errors).map(([key, error]) => error && (
        <ErrorDisplay
          key={key}
          error={error}
          onRetry={() => loadAnalyticsData(true)}
        />
      ))}

      {/* プレミアム分析ダッシュボード */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2 text-blue-600" />
          AI駆動プレミアム分析システム
        </h2>
        <PremiumAnalyticsDashboard
          customers={customers}
          reservations={reservations}
          analytics={{
            kpis: state.kpis,
            churnAnalysis: state.churnAnalysis,
            revenueForecast: state.revenueForecast,
            predictiveInsights: state.predictiveInsights
          }}
        />
      </div>

      {/* チャーン分析セクション */}
      {state.churnAnalysis && (
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
            チャーン分析・顧客リスク管理
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 高リスク顧客 */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">高リスク顧客 (TOP 5)</h3>
              <div className="space-y-3">
                {state.churnAnalysis.highRiskCustomers.slice(0, 5).map((customer, index) => (
                  <div key={customer.customerId} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                    <div>
                      <div className="font-medium text-gray-900">{customer.customerName}</div>
                      <div className="text-sm text-gray-600">
                        最終来店: {new Date(customer.lastVisit).toLocaleDateString('ja-JP')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-red-600">
                        {(customer.churnProbability * 100).toFixed(0)}%
                      </div>
                      <div className="text-xs text-gray-500">離脱リスク</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* チャーン要因 */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">主要チャーン要因</h3>
              <div className="space-y-3">
                {state.churnAnalysis.churnFactors.map((factor, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{factor.factor}</div>
                      <div className="text-sm text-gray-600">{factor.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        {(factor.impact * 100).toFixed(0)}%
                      </div>
                      <div className="text-xs text-gray-500">影響度</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 売上予測セクション */}
      {state.revenueForecast && (
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
            売上予測・将来展望
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 来月予測 */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
              <h3 className="text-lg font-medium text-green-900 mb-3">来月売上予測</h3>
              <div className="text-3xl font-bold text-green-900 mb-2">
                ¥{state.revenueForecast.nextMonth.predicted.toLocaleString()}
              </div>
              <div className="text-sm text-green-700 mb-3">
                信頼度: {(state.revenueForecast.nextMonth.confidence * 100).toFixed(0)}%
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-green-800">主要要因:</div>
                {state.revenueForecast.nextMonth.factors.map((factor, index) => (
                  <div key={index} className="text-sm text-green-700">• {factor}</div>
                ))}
              </div>
            </div>

            {/* 四半期トレンド */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">四半期予測トレンド</h3>
              <div className="space-y-3">
                {state.revenueForecast.quarterlyTrend.map((month, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium text-gray-900">{month.month}</div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        ¥{month.predicted.toLocaleString()}
                      </div>
                      {month.historical > 0 && (
                        <div className="text-sm text-gray-600">
                          前年: ¥{month.historical.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* システムステータス */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            <span className="text-sm font-medium text-gray-700">
              統合分析システム稼働中
            </span>
          </div>
          <div className="text-xs text-gray-500">
            次回自動更新: {autoRefresh ? '5分後' : '手動のみ'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default IntegratedAnalyticsDashboard