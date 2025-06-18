import React, { useState, useEffect } from 'react'
import {
  Users,
  MessageSquare,
  Bug,
  Lightbulb,
  TrendingUp,
  Activity,
  Calendar,
  Star,
  CheckCircle,
  AlertCircle,
  Clock,
  BarChart3
} from 'lucide-react'
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Bar, Line, Doughnut } from 'react-chartjs-2'

interface BetaTestStats {
  totalTesters: number
  activeTesters: number
  totalFeedback: number
  bugReports: number
  featureRequests: number
  averageRating: number
  completionRate: number
  dailyActiveUsers: Array<{ date: string; count: number }>
  feedbackByType: Array<{ type: string; count: number }>
  satisfactionScores: Array<{ date: string; score: number }>
}

interface FeedbackItem {
  id: string
  type: 'bug' | 'feature' | 'general'
  title: string
  description: string
  status: 'open' | 'in-progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  createdAt: string
  userName: string
  userEmail: string
  rating?: number
}

const BetaTestDashboard: React.FC = () => {
  const [stats, setStats] = useState<BetaTestStats | null>(null)
  const [recentFeedback, setRecentFeedback] = useState<FeedbackItem[]>([])
  const [selectedTimeframe, setSelectedTimeframe] = useState('week')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchBetaTestData()
  }, [selectedTimeframe])

  const fetchBetaTestData = async () => {
    try {
      setIsLoading(true)
      
      // Fetch beta test statistics
      const statsResponse = await fetch(`/api/v1/beta-test/stats?timeframe=${selectedTimeframe}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const statsData = await statsResponse.json()
      setStats(statsData)
      
      // Fetch recent feedback
      const feedbackResponse = await fetch('/api/v1/beta-test/feedback/recent', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const feedbackData = await feedbackResponse.json()
      setRecentFeedback(feedbackData)
    } catch (error) {
      console.error('Failed to fetch beta test data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      open: 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800'
    }
    
    const labels = {
      open: '未対応',
      'in-progress': '対応中',
      resolved: '解決済み',
      closed: 'クローズ'
    }
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const styles = {
      critical: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    }
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[priority as keyof typeof styles]}`}>
        {priority === 'critical' ? '致命的' : priority === 'high' ? '高' : priority === 'medium' ? '中' : '低'}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">ベータテストダッシュボード</h1>
        <p className="text-blue-100">
          クローズドベータテストの進捗状況とフィードバックを管理
        </p>
      </div>

      {/* Time Filter */}
      <div className="flex space-x-2">
        {['week', 'month', 'all'].map((timeframe) => (
          <button
            key={timeframe}
            onClick={() => setSelectedTimeframe(timeframe)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedTimeframe === timeframe
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {timeframe === 'week' ? '今週' : timeframe === 'month' ? '今月' : '全期間'}
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold">{stats?.totalTesters || 0}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">総テスター数</h3>
          <div className="mt-2 flex items-center text-sm">
            <span className="text-green-600 font-medium">
              {stats?.activeTesters || 0} 名アクティブ
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <MessageSquare className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold">{stats?.totalFeedback || 0}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">総フィードバック数</h3>
          <div className="mt-2 flex items-center space-x-3 text-sm">
            <span className="flex items-center">
              <Bug className="w-4 h-4 text-red-500 mr-1" />
              {stats?.bugReports || 0}
            </span>
            <span className="flex items-center">
              <Lightbulb className="w-4 h-4 text-yellow-500 mr-1" />
              {stats?.featureRequests || 0}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <Star className="w-8 h-8 text-yellow-500" />
            <span className="text-2xl font-bold">{stats?.averageRating?.toFixed(1) || '0.0'}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">平均評価</h3>
          <div className="mt-2">
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(stats?.averageRating || 0)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold">{stats?.completionRate || 0}%</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">テスト完了率</h3>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: `${stats?.completionRate || 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Active Users */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">日次アクティブユーザー</h3>
          <Line
            data={{
              labels: stats?.dailyActiveUsers?.map(d => format(new Date(d.date), 'M/d')) || [],
              datasets: [{
                label: 'アクティブユーザー',
                data: stats?.dailyActiveUsers?.map(d => d.count) || [],
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4
              }]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false }
              },
              scales: {
                y: { beginAtZero: true }
              }
            }}
          />
        </div>

        {/* Feedback Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">フィードバック分布</h3>
          <Doughnut
            data={{
              labels: ['バグ報告', '機能要望', 'ご意見'],
              datasets: [{
                data: [
                  stats?.bugReports || 0,
                  stats?.featureRequests || 0,
                  (stats?.totalFeedback || 0) - (stats?.bugReports || 0) - (stats?.featureRequests || 0)
                ],
                backgroundColor: [
                  'rgba(239, 68, 68, 0.8)',
                  'rgba(245, 158, 11, 0.8)',
                  'rgba(59, 130, 246, 0.8)'
                ]
              }]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'bottom' }
              }
            }}
          />
        </div>
      </div>

      {/* Recent Feedback */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">最新のフィードバック</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  タイプ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  タイトル
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  投稿者
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  優先度
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  投稿日時
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentFeedback.map((feedback) => (
                <tr key={feedback.id} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {feedback.type === 'bug' && (
                      <Bug className="w-5 h-5 text-red-500" />
                    )}
                    {feedback.type === 'feature' && (
                      <Lightbulb className="w-5 h-5 text-yellow-500" />
                    )}
                    {feedback.type === 'general' && (
                      <MessageSquare className="w-5 h-5 text-blue-500" />
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {feedback.title}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {feedback.description}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{feedback.userName}</div>
                    <div className="text-xs text-gray-500">{feedback.userEmail}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {feedback.type === 'bug' && getPriorityBadge(feedback.priority)}
                    {feedback.rating && (
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="ml-1 text-sm">{feedback.rating}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(feedback.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(feedback.createdAt), 'M/d HH:mm', { locale: ja })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default BetaTestDashboard