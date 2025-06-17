import React, { useState, Suspense, lazy } from 'react'
import { 
  BarChart3, 
  Users, 
  DollarSign, 
  TrendingUp,
  Lightbulb,
  Download,
  Settings,
  RefreshCw,
  Eye,
  Target,
  Calendar
} from 'lucide-react'

// 遅延読み込みで各分析コンポーネントをインポート
const RFMAnalysis = lazy(() => import('./RFMAnalysis'))
const CohortAnalysis = lazy(() => import('./CohortAnalysis'))
const LTVAnalysis = lazy(() => import('./LTVAnalysis'))
const SalesDashboard = lazy(() => import('./SalesDashboard'))
const MarketingAISuggestions = lazy(() => import('./MarketingAISuggestions'))
const ReportExporter = lazy(() => import('./ReportExporter'))

interface Customer {
  id: string
  customerNumber: string
  name: string
  visitCount: number
  lastVisitDate?: string
  createdAt: string
}

interface Reservation {
  id: string
  startTime: string
  endTime?: string
  menuContent: string
  customerName: string
  customer?: {
    id: string
    name: string
    phone?: string
  }
  staff?: {
    id: string
    name: string
  }
  source: 'HOTPEPPER' | 'GOOGLE_CALENDAR' | 'PHONE' | 'WALK_IN' | 'MANUAL'
  status: 'TENTATIVE' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  notes?: string
  price?: number
}

interface AnalyticsHubProps {
  customers: Customer[]
  reservations: Reservation[]
}

type AnalyticsView = 'overview' | 'rfm' | 'cohort' | 'ltv' | 'sales' | 'marketing'

const AnalyticsHub: React.FC<AnalyticsHubProps> = ({ customers, reservations }) => {
  const [activeView, setActiveView] = useState<AnalyticsView>('overview')
  const [isReportExporterOpen, setIsReportExporterOpen] = useState(false)

  // 分析メニュー定義
  const analyticsMenus = [
    {
      id: 'overview',
      title: '分析概要',
      description: '全体的な分析結果の概要',
      icon: BarChart3,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      id: 'rfm',
      title: 'RFM分析',
      description: '顧客セグメント分析',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      id: 'cohort',
      title: 'コホート分析',
      description: '顧客継続率分析',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      id: 'ltv',
      title: 'LTV分析',
      description: '顧客生涯価値分析',
      icon: DollarSign,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    {
      id: 'sales',
      title: '売上分析',
      description: '売上・パフォーマンス分析',
      icon: BarChart3,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200'
    },
    {
      id: 'marketing',
      title: 'AI提案',
      description: 'マーケティング施策提案',
      icon: Lightbulb,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    }
  ]

  // 基本統計の計算
  const basicStats = React.useMemo(() => {
    const completedReservations = reservations.filter(r => r.status === 'COMPLETED' && r.price)
    const totalRevenue = completedReservations.reduce((sum, r) => sum + (r.price || 0), 0)
    const avgOrderValue = completedReservations.length > 0 ? totalRevenue / completedReservations.length : 0
    
    const currentDate = new Date()
    const activeCustomers = customers.filter(c => {
      if (!c.lastVisitDate) return false
      const daysSince = Math.floor((currentDate.getTime() - new Date(c.lastVisitDate).getTime()) / (1000 * 60 * 60 * 24))
      return daysSince <= 90
    }).length

    return {
      totalCustomers: customers.length,
      activeCustomers,
      totalReservations: completedReservations.length,
      totalRevenue,
      avgOrderValue,
      customerRetentionRate: customers.length > 0 ? (activeCustomers / customers.length) * 100 : 0
    }
  }, [customers, reservations])

  // ローディングコンポーネント
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      <span className="ml-3 text-gray-600">分析データを読み込み中...</span>
    </div>
  )

  // 概要ビューの描画
  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">総顧客数</p>
              <p className="text-2xl font-bold text-gray-900">{basicStats.totalCustomers}名</p>
              <p className="text-sm text-green-600">
                アクティブ: {basicStats.activeCustomers}名 ({basicStats.customerRetentionRate.toFixed(1)}%)
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <BarChart3 className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">総売上</p>
              <p className="text-2xl font-bold text-gray-900">¥{basicStats.totalRevenue.toLocaleString()}</p>
              <p className="text-sm text-blue-600">
                {basicStats.totalReservations}件の予約
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">平均客単価</p>
              <p className="text-2xl font-bold text-gray-900">¥{Math.round(basicStats.avgOrderValue).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2 text-blue-600" />
          分析機能一覧
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analyticsMenus.filter(menu => menu.id !== 'overview').map((menu) => {
            const Icon = menu.icon
            return (
              <button
                key={menu.id}
                onClick={() => setActiveView(menu.id as AnalyticsView)}
                className={`p-4 rounded-lg border-2 transition-all text-left hover:shadow-md ${menu.bgColor} ${menu.borderColor}`}
              >
                <div className="flex items-center mb-2">
                  <Icon className={`w-6 h-6 mr-3 ${menu.color}`} />
                  <h4 className="font-medium text-gray-900">{menu.title}</h4>
                </div>
                <p className="text-sm text-gray-600">{menu.description}</p>
              </button>
            )
          })}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">クイックインサイト</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-green-700 mb-2">🎯 強み</h4>
            <ul className="text-sm space-y-1 text-gray-700">
              <li>• 顧客継続率: {basicStats.customerRetentionRate.toFixed(1)}%</li>
              <li>• 平均客単価: ¥{Math.round(basicStats.avgOrderValue).toLocaleString()}</li>
              <li>• 安定した予約件数</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-orange-700 mb-2">📈 改善機会</h4>
            <ul className="text-sm space-y-1 text-gray-700">
              <li>• 新規顧客の継続率向上</li>
              <li>• 高単価メニューの提案強化</li>
              <li>• デジタルマーケティング活用</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <BarChart3 className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">分析ダッシュボード</h1>
                <p className="text-sm text-gray-600">高度な顧客・売上分析</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsReportExporterOpen(true)}
                className="btn btn-primary btn-sm"
              >
                <Download className="w-4 h-4 mr-2" />
                レポート出力
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ナビゲーション */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto py-3">
            {analyticsMenus.map((menu) => {
              const Icon = menu.icon
              return (
                <button
                  key={menu.id}
                  onClick={() => setActiveView(menu.id as AnalyticsView)}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                    activeView === menu.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {menu.title}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<LoadingSpinner />}>
          {activeView === 'overview' && renderOverview()}
          {activeView === 'rfm' && <RFMAnalysis customers={customers} reservations={reservations} />}
          {activeView === 'cohort' && <CohortAnalysis customers={customers} reservations={reservations} />}
          {activeView === 'ltv' && <LTVAnalysis customers={customers} reservations={reservations} />}
          {activeView === 'sales' && <SalesDashboard customers={customers} reservations={reservations} serviceHistory={[]} />}
          {activeView === 'marketing' && <MarketingAISuggestions customers={customers} reservations={reservations} />}
        </Suspense>
      </div>

      {/* レポート出力モーダル */}
      <Suspense fallback={null}>
        <ReportExporter
          customers={customers}
          reservations={reservations}
          isOpen={isReportExporterOpen}
          onClose={() => setIsReportExporterOpen(false)}
        />
      </Suspense>
    </div>
  )
}

export default AnalyticsHub