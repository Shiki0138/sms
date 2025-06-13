import React, { useState, useEffect } from 'react';

interface KPIData {
  revenue: {
    today: number;
    yesterday: number;
    thisMonth: number;
    lastMonth: number;
    trend: number;
  };
  customers: {
    total: number;
    newToday: number;
    newThisMonth: number;
    activeLastMonth: number;
    churnRate: number;
  };
  reservations: {
    todayCount: number;
    upcomingCount: number;
    completionRate: number;
    noShowRate: number;
  };
  satisfaction: {
    averageScore: number;
    responseRate: number;
    trend: number;
  };
}

interface ChurnAnalysis {
  highRiskCustomers: Array<{
    customerId: string;
    customerName: string;
    lastVisit: Date;
    churnProbability: number;
    recommendedAction: string;
  }>;
  churnFactors: Array<{
    factor: string;
    impact: number;
    description: string;
  }>;
}

interface RevenueForecast {
  nextMonth: {
    predicted: number;
    confidence: number;
    factors: string[];
  };
  quarterlyTrend: Array<{
    month: string;
    predicted: number;
    historical: number;
  }>;
}

const AnalyticsDashboard: React.FC = () => {
  const [kpis, setKpis] = useState<KPIData | null>(null);
  const [churnAnalysis, setChurnAnalysis] = useState<ChurnAnalysis | null>(null);
  const [forecast, setForecast] = useState<RevenueForecast | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  const API_BASE = 'http://localhost:4002/api/v1';

  useEffect(() => {
    loadDashboardData();
    setupRealtimeConnection();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [kpisRes, churnRes, forecastRes] = await Promise.all([
        fetch(`${API_BASE}/analytics/dashboard/kpis`, {
          headers: { 'x-tenant-id': 'default-tenant' }
        }),
        fetch(`${API_BASE}/analytics/churn-analysis`, {
          headers: { 'x-tenant-id': 'default-tenant' }
        }),
        fetch(`${API_BASE}/analytics/forecast/revenue`, {
          headers: { 'x-tenant-id': 'default-tenant' }
        })
      ]);

      if (kpisRes.ok) {
        const kpisData = await kpisRes.json();
        setKpis(kpisData.data);
      }

      if (churnRes.ok) {
        const churnData = await churnRes.json();
        setChurnAnalysis(churnData.data);
      }

      if (forecastRes.ok) {
        const forecastData = await forecastRes.json();
        setForecast(forecastData.data);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeConnection = () => {
    try {
      const eventSource = new EventSource(`${API_BASE}/analytics/realtime/metrics`);
      
      eventSource.onopen = () => {
        setRealtimeConnected(true);
        console.log('Real-time analytics connection established');
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'kpis' || data.type === 'kpis_update') {
            setKpis(data.data);
          }
        } catch (err) {
          console.error('Real-time data parsing error:', err);
        }
      };

      eventSource.onerror = () => {
        setRealtimeConnected(false);
        console.log('Real-time connection lost, reconnecting...');
      };

      return () => eventSource.close();
    } catch (err) {
      console.error('Real-time connection setup error:', err);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-800">エラー: {error}</div>
        <button 
          onClick={loadDashboardData}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          再試行
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">リアルタイム分析ダッシュボード</h1>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${realtimeConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-600">
            {realtimeConnected ? 'リアルタイム接続中' : '接続切断'}
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      {kpis && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Revenue KPI */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">売上</h3>
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {formatCurrency(kpis.revenue.today)}
            </div>
            <div className="text-sm text-gray-600">今日の売上</div>
            <div className={`text-sm mt-2 ${kpis.revenue.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {kpis.revenue.trend >= 0 ? '↗' : '↘'} {formatPercentage(Math.abs(kpis.revenue.trend))}
            </div>
          </div>

          {/* Customers KPI */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">顧客</h3>
            <div className="text-2xl font-bold text-green-600 mb-1">
              {kpis.customers.total.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">総顧客数</div>
            <div className="text-sm mt-2 text-blue-600">
              新規: {kpis.customers.newToday}人 (今日)
            </div>
          </div>

          {/* Reservations KPI */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">予約</h3>
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {kpis.reservations.todayCount}
            </div>
            <div className="text-sm text-gray-600">今日の予約</div>
            <div className="text-sm mt-2 text-gray-600">
              完了率: {formatPercentage(kpis.reservations.completionRate)}
            </div>
          </div>

          {/* Satisfaction KPI */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">満足度</h3>
            <div className="text-2xl font-bold text-yellow-600 mb-1">
              {kpis.satisfaction.averageScore.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">平均スコア (5点満点)</div>
            <div className="text-sm mt-2 text-gray-600">
              回答率: {formatPercentage(kpis.satisfaction.responseRate)}
            </div>
          </div>
        </div>
      )}

      {/* Analytics Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Churn Analysis */}
        {churnAnalysis && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">顧客離脱分析</h3>
            
            <div className="mb-4">
              <h4 className="text-lg font-medium text-red-600 mb-2">高リスク顧客</h4>
              {churnAnalysis.highRiskCustomers.slice(0, 5).map((customer, index) => (
                <div key={customer.customerId} className="flex justify-between items-center py-2 border-b">
                  <div>
                    <div className="font-medium">{customer.customerName}</div>
                    <div className="text-sm text-gray-600">
                      最終来店: {new Date(customer.lastVisit).toLocaleDateString('ja-JP')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-red-600 font-semibold">
                      {formatPercentage(customer.churnProbability * 100)}
                    </div>
                    <div className="text-xs text-gray-500">離脱確率</div>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <h4 className="text-lg font-medium text-gray-700 mb-2">離脱要因</h4>
              {churnAnalysis.churnFactors.map((factor, index) => (
                <div key={index} className="flex justify-between items-center py-1">
                  <span className="text-sm">{factor.factor}</span>
                  <span className="text-sm font-medium">{formatPercentage(factor.impact * 100)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Revenue Forecast */}
        {forecast && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">売上予測</h3>
            
            <div className="mb-4">
              <h4 className="text-lg font-medium text-blue-600 mb-2">来月予測</h4>
              <div className="text-2xl font-bold text-blue-800 mb-2">
                {formatCurrency(forecast.nextMonth.predicted)}
              </div>
              <div className="text-sm text-gray-600 mb-2">
                信頼度: {formatPercentage(forecast.nextMonth.confidence * 100)}
              </div>
              <div className="text-sm text-gray-700">
                <div className="font-medium mb-1">予測要因:</div>
                <ul className="list-disc list-inside">
                  {forecast.nextMonth.factors.map((factor, index) => (
                    <li key={index}>{factor}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-medium text-gray-700 mb-2">四半期トレンド</h4>
              {forecast.quarterlyTrend.map((trend, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm">{trend.month}</span>
                  <div className="text-right">
                    <div className="text-sm font-medium">{formatCurrency(trend.predicted)}</div>
                    <div className="text-xs text-gray-500">予測値</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button 
          onClick={loadDashboardData}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          データを更新
        </button>
        <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          レポート生成
        </button>
        <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          最適化提案
        </button>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;