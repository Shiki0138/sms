/**
 * Analytics API Integration Service
 * 分析ダッシュボードとバックエンドAPIの統合
 */

interface APIResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
}

interface DashboardKPIs {
  revenue: {
    today: number
    yesterday: number
    thisMonth: number
    lastMonth: number
    trend: number
  }
  customers: {
    total: number
    newToday: number
    newThisMonth: number
    activeLastMonth: number
    churnRate: number
  }
  reservations: {
    todayCount: number
    upcomingCount: number
    completionRate: number
    noShowRate: number
  }
  satisfaction: {
    averageScore: number
    responseRate: number
    trend: number
  }
}

interface ChurnAnalysis {
  highRiskCustomers: Array<{
    customerId: string
    customerName: string
    lastVisit: Date
    churnProbability: number
    recommendedAction: string
  }>
  churnFactors: Array<{
    factor: string
    impact: number
    description: string
  }>
}

interface RevenueForecast {
  nextMonth: {
    predicted: number
    confidence: number
    factors: string[]
  }
  quarterlyTrend: Array<{
    month: string
    predicted: number
    historical: number
  }>
}

interface PredictiveInsights {
  customerBehavior: {
    segments: Array<{
      name: string
      size: number
      characteristics: string[]
      recommendedActions: string[]
    }>
    trends: Array<{
      metric: string
      trend: 'increasing' | 'decreasing' | 'stable'
      confidence: number
      prediction: string
    }>
  }
  revenuePrediction: {
    nextQuarter: number
    seasonalFactors: Array<{
      factor: string
      impact: number
    }>
    recommendations: string[]
  }
  operationalInsights: {
    staffOptimization: {
      recommendedSchedule: Array<{
        timeSlot: string
        recommendedStaff: number
        reason: string
      }>
      efficiency: number
    }
    inventoryPrediction: {
      items: Array<{
        name: string
        predictedUsage: number
        recommendedStock: number
        costOptimization: number
      }>
    }
  }
}

interface RealtimeMetrics {
  activeUsers: number
  todayBookings: number
  realTimeRevenue: number
  systemLoad: number
  responseTime: number
  errorRate: number
  timestamp: Date
}

class AnalyticsAPI {
  private baseURL: string
  private token: string | null

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1'
    this.token = localStorage.getItem('token')
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
          ...options.headers,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `API Error: ${response.status}`)
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      }
    } catch (error) {
      return {
        success: false,
        data: {} as T,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }

  /**
   * ダッシュボードKPIデータを取得
   */
  async getDashboardKPIs(tenantId: string): Promise<APIResponse<DashboardKPIs>> {
    return this.makeRequest<DashboardKPIs>(`/analytics/dashboard/${tenantId}`)
  }

  /**
   * チャーン分析データを取得
   */
  async getChurnAnalysis(tenantId: string): Promise<APIResponse<ChurnAnalysis>> {
    return this.makeRequest<ChurnAnalysis>(`/analytics/churn/${tenantId}`)
  }

  /**
   * 売上予測データを取得
   */
  async getRevenueForecast(tenantId: string): Promise<APIResponse<RevenueForecast>> {
    return this.makeRequest<RevenueForecast>(`/analytics/revenue-forecast/${tenantId}`)
  }

  /**
   * 予測インサイトデータを取得
   */
  async getPredictiveInsights(tenantId: string): Promise<APIResponse<PredictiveInsights>> {
    return this.makeRequest<PredictiveInsights>(`/analytics/predictive-insights/${tenantId}`)
  }

  /**
   * カスタム期間での分析データを取得
   */
  async getCustomAnalytics(
    tenantId: string,
    startDate: Date,
    endDate: Date,
    metrics: string[]
  ): Promise<APIResponse<any>> {
    const params = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      metrics: metrics.join(','),
    })

    return this.makeRequest<any>(`/analytics/custom/${tenantId}?${params}`)
  }

  /**
   * RFM分析データを取得
   */
  async getRFMAnalysis(tenantId: string): Promise<APIResponse<any>> {
    return this.makeRequest<any>(`/analytics/rfm/${tenantId}`)
  }

  /**
   * 顧客セグメント分析を取得
   */
  async getCustomerSegments(tenantId: string): Promise<APIResponse<any>> {
    return this.makeRequest<any>(`/analytics/customer-segments/${tenantId}`)
  }

  /**
   * スタッフパフォーマンス分析を取得
   */
  async getStaffPerformance(tenantId: string): Promise<APIResponse<any>> {
    return this.makeRequest<any>(`/analytics/staff-performance/${tenantId}`)
  }

  /**
   * 在庫最適化データを取得
   */
  async getInventoryOptimization(tenantId: string): Promise<APIResponse<any>> {
    return this.makeRequest<any>(`/analytics/inventory-optimization/${tenantId}`)
  }

  /**
   * 顧客満足度分析を取得
   */
  async getCustomerSatisfaction(tenantId: string): Promise<APIResponse<any>> {
    return this.makeRequest<any>(`/analytics/customer-satisfaction/${tenantId}`)
  }

  /**
   * マーケティング効果分析を取得
   */
  async getMarketingEffectiveness(tenantId: string): Promise<APIResponse<any>> {
    return this.makeRequest<any>(`/analytics/marketing-effectiveness/${tenantId}`)
  }

  /**
   * 競合他社比較データを取得
   */
  async getCompetitorAnalysis(tenantId: string): Promise<APIResponse<any>> {
    return this.makeRequest<any>(`/analytics/competitor-analysis/${tenantId}`)
  }

  /**
   * カスタムレポート生成
   */
  async generateCustomReport(
    tenantId: string,
    reportConfig: {
      type: 'pdf' | 'excel' | 'csv'
      metrics: string[]
      dateRange: { start: Date; end: Date }
      filters?: Record<string, any>
      template?: string
    }
  ): Promise<APIResponse<{ reportUrl: string; reportId: string }>> {
    return this.makeRequest<{ reportUrl: string; reportId: string }>(
      `/analytics/reports/${tenantId}/generate`,
      {
        method: 'POST',
        body: JSON.stringify(reportConfig),
      }
    )
  }

  /**
   * レポートの進捗状況を確認
   */
  async getReportStatus(reportId: string): Promise<APIResponse<{
    status: 'pending' | 'processing' | 'completed' | 'failed'
    progress: number
    estimatedCompletion?: Date
    downloadUrl?: string
  }>> {
    return this.makeRequest<any>(`/analytics/reports/${reportId}/status`)
  }

  /**
   * 分析データをエクスポート
   */
  async exportAnalyticsData(
    tenantId: string,
    exportConfig: {
      format: 'json' | 'csv' | 'excel'
      datasets: string[]
      includeCharts?: boolean
      dateRange?: { start: Date; end: Date }
    }
  ): Promise<APIResponse<{ downloadUrl: string; fileSize: number }>> {
    return this.makeRequest<{ downloadUrl: string; fileSize: number }>(
      `/analytics/export/${tenantId}`,
      {
        method: 'POST',
        body: JSON.stringify(exportConfig),
      }
    )
  }

  /**
   * 分析設定を保存
   */
  async saveAnalyticsSettings(
    tenantId: string,
    settings: {
      dashboardLayout: any
      defaultFilters: Record<string, any>
      alertThresholds: Record<string, number>
      automatedReports: Array<{
        name: string
        schedule: string
        recipients: string[]
        metrics: string[]
      }>
    }
  ): Promise<APIResponse<{ saved: boolean }>> {
    return this.makeRequest<{ saved: boolean }>(
      `/analytics/settings/${tenantId}`,
      {
        method: 'POST',
        body: JSON.stringify(settings),
      }
    )
  }

  /**
   * 分析設定を取得
   */
  async getAnalyticsSettings(tenantId: string): Promise<APIResponse<any>> {
    return this.makeRequest<any>(`/analytics/settings/${tenantId}`)
  }

  /**
   * アラート設定
   */
  async setAnalyticsAlerts(
    tenantId: string,
    alerts: Array<{
      metric: string
      condition: 'above' | 'below' | 'equals'
      threshold: number
      frequency: 'immediate' | 'daily' | 'weekly'
      recipients: string[]
      enabled: boolean
    }>
  ): Promise<APIResponse<{ alertsSet: number }>> {
    return this.makeRequest<{ alertsSet: number }>(
      `/analytics/alerts/${tenantId}`,
      {
        method: 'POST',
        body: JSON.stringify({ alerts }),
      }
    )
  }

  /**
   * データ品質レポートを取得
   */
  async getDataQualityReport(tenantId: string): Promise<APIResponse<{
    overallScore: number
    issues: Array<{
      type: string
      severity: 'low' | 'medium' | 'high'
      description: string
      affectedRecords: number
      recommendation: string
    }>
    suggestions: string[]
  }>> {
    return this.makeRequest<any>(`/analytics/data-quality/${tenantId}`)
  }

  /**
   * A/Bテスト結果を取得
   */
  async getABTestResults(tenantId: string): Promise<APIResponse<any>> {
    return this.makeRequest<any>(`/analytics/ab-tests/${tenantId}`)
  }

  /**
   * 機械学習モデルの予測を取得
   */
  async getMLPredictions(
    tenantId: string,
    modelType: 'churn' | 'revenue' | 'demand' | 'satisfaction'
  ): Promise<APIResponse<any>> {
    return this.makeRequest<any>(`/analytics/ml-predictions/${tenantId}/${modelType}`)
  }

  /**
   * ベンチマーク分析データを取得
   */
  async getBenchmarkAnalysis(
    tenantId: string,
    industry?: string
  ): Promise<APIResponse<any>> {
    const params = industry ? `?industry=${industry}` : ''
    return this.makeRequest<any>(`/analytics/benchmark/${tenantId}${params}`)
  }
}

// Singleton instance
export const analyticsAPI = new AnalyticsAPI()

// Hook for React components
export const useAnalyticsAPI = () => {
  return analyticsAPI
}

// Error handling helper
export const handleAnalyticsError = (error: string) => {
  console.error('Analytics API Error:', error)
  
  // Show user-friendly error messages
  const userFriendlyErrors: Record<string, string> = {
    'Network request failed': 'ネットワーク接続を確認してください',
    'Unauthorized': '認証が必要です。再ログインしてください',
    'Forbidden': 'このデータにアクセスする権限がありません',
    'Not Found': '要求されたデータが見つかりません',
    'Internal Server Error': 'サーバーエラーが発生しました。しばらく待ってから再試行してください',
  }

  return userFriendlyErrors[error] || '予期しないエラーが発生しました'
}

export type {
  DashboardKPIs,
  ChurnAnalysis,
  RevenueForecast,
  PredictiveInsights,
  RealtimeMetrics,
  APIResponse,
}