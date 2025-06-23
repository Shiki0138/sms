import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  TrendingUp, TrendingDown, Target, Users, DollarSign, 
  Clock, AlertTriangle, CheckCircle, Brain, BarChart3,
  Trophy, Activity, ArrowUp, ArrowDown
} from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardOverview {
  today: {
    revenue: number;
    newCustomers: number;
    avgServiceTime: number;
  };
  month: {
    revenue: number;
    revenueGrowth: number;
    daysElapsed: number;
    avgDailyRevenue: number;
  };
  customer: {
    retentionRate: number;
    totalNewCustomers: number;
  };
  goals: Array<{
    id: string;
    name: string;
    progress: number;
    daysRemaining: number;
  }>;
  insights: Array<{
    id: string;
    type: string;
    title: string;
    importance: string;
  }>;
}

const StrategyDashboard: React.FC = () => {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30');

  useEffect(() => {
    fetchDashboardData();
    fetchMetricsData();
  }, [selectedPeriod]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/v1/business-strategy/dashboard/overview', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOverview(data.overview);
      } else {
        const error = await response.json();
        if (error.code === 'FEATURE_DISABLED') {
          setMessage({ 
            type: 'error', 
            text: 'プレミアム経営戦略ダッシュボードはプレミアムプランでのみ利用可能です' 
          });
        } else {
          throw new Error(error.error || 'データの取得に失敗しました');
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : '不明なエラー' });
    } finally {
      setLoading(false);
    }
  };

  const fetchMetricsData = async () => {
    try {
      const response = await fetch(`/api/v1/business-strategy/metrics/detailed?period=${selectedPeriod}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTimeSeriesData(data.timeSeriesData);
      }
    } catch (error) {
      console.error('Metrics fetch error:', error);
    }
  };

  const generateInsights = async () => {
    try {
      const response = await fetch('/api/v1/business-strategy/insights/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMessage({ type: 'success', text: data.message });
        await fetchDashboardData(); // 新しいインサイトを再読み込み
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'AIインサイト生成に失敗しました' });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'CRITICAL': return 'bg-red-100 text-red-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'TREND': return <TrendingUp className="h-4 w-4" />;
      case 'ANOMALY': return <AlertTriangle className="h-4 w-4" />;
      case 'PREDICTION': return <Brain className="h-4 w-4" />;
      case 'RECOMMENDATION': return <Target className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">経営データを分析中...</span>
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">データがありません</p>
      </div>
    );
  }

  // チャートデータの準備
  const revenueChartData = timeSeriesData ? {
    labels: timeSeriesData.dates.map((d: string) => new Date(d).toLocaleDateString('ja-JP')),
    datasets: [{
      label: '日次売上',
      data: timeSeriesData.revenue,
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4
    }]
  } : null;

  const customerChartData = timeSeriesData ? {
    labels: timeSeriesData.dates.map((d: string) => new Date(d).toLocaleDateString('ja-JP')),
    datasets: [{
      label: '新規顧客',
      data: timeSeriesData.newCustomers,
      backgroundColor: 'rgba(147, 51, 234, 0.6)'
    }]
  } : null;

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-2">
            <Trophy className="h-8 w-8 text-yellow-600" />
            <span>プレミアム経営戦略ダッシュボード</span>
          </h1>
          <p className="text-gray-600 mt-1">AI分析による経営インサイトと戦略的アクションプラン</p>
        </div>
        <Button onClick={generateInsights} className="bg-gradient-to-r from-purple-600 to-blue-600">
          <Brain className="h-4 w-4 mr-2" />
          AIインサイト生成
        </Button>
      </div>

      {message && (
        <Alert className={message.type === 'error' ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}>
          {message.type === 'error' ? (
            <AlertTriangle className="h-4 w-4 text-red-600" />
          ) : (
            <CheckCircle className="h-4 w-4 text-green-600" />
          )}
          <AlertDescription className={message.type === 'error' ? 'text-red-700' : 'text-green-700'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* KPIカード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-t-4 border-t-green-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">本日の売上</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(overview.today.revenue)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-blue-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">月間売上</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(overview.month.revenue)}
                </p>
                <div className="flex items-center mt-1">
                  {overview.month.revenueGrowth > 0 ? (
                    <ArrowUp className="h-4 w-4 text-green-600 mr-1" />
                  ) : (
                    <ArrowDown className="h-4 w-4 text-red-600 mr-1" />
                  )}
                  <span className={`text-sm ${overview.month.revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(overview.month.revenueGrowth).toFixed(1)}%
                  </span>
                </div>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-purple-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">顧客保持率</p>
                <p className="text-2xl font-bold text-purple-600">
                  {overview.customer.retentionRate}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  新規: {overview.customer.totalNewCustomers}名
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-orange-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">平均施術時間</p>
                <p className="text-2xl font-bold text-orange-600">
                  {overview.today.avgServiceTime.toFixed(0)}分
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  効率性指標
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* グラフセクション */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 売上トレンド */}
        {revenueChartData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>売上トレンド</span>
                <select 
                  value={selectedPeriod} 
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="text-sm px-2 py-1 border rounded"
                >
                  <option value="7">過去7日</option>
                  <option value="30">過去30日</option>
                  <option value="90">過去90日</option>
                </select>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Line 
                data={revenueChartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: function(value) {
                          return '¥' + value.toLocaleString();
                        }
                      }
                    }
                  }
                }}
              />
            </CardContent>
          </Card>
        )}

        {/* 新規顧客獲得 */}
        {customerChartData && (
          <Card>
            <CardHeader>
              <CardTitle>新規顧客獲得</CardTitle>
            </CardHeader>
            <CardContent>
              <Bar 
                data={customerChartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1
                      }
                    }
                  }
                }}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* 経営目標 */}
      {overview.goals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>経営目標</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {overview.goals.map((goal) => (
                <div key={goal.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{goal.name}</p>
                      <p className="text-sm text-gray-600">
                        残り{goal.daysRemaining}日
                      </p>
                    </div>
                    <span className="text-lg font-semibold">
                      {goal.progress.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={goal.progress} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AIインサイト */}
      {overview.insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-purple-600" />
              <span>AIビジネスインサイト</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {overview.insights.map((insight) => (
                <div key={insight.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="mt-1">{getInsightIcon(insight.type)}</div>
                  <div className="flex-1">
                    <p className="font-medium">{insight.title}</p>
                    <Badge className={`mt-1 ${getImportanceColor(insight.importance)}`}>
                      {insight.importance}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StrategyDashboard;