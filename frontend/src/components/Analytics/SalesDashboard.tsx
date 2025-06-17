import React, { useState, useMemo } from 'react'
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Users,
  Target,
  Award,
  BarChart3,
  PieChart,
  Download,
  RefreshCw,
  Eye,
  Filter,
  Zap
} from 'lucide-react'
import { 
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { format, parseISO, startOfMonth, endOfMonth, subMonths, addDays, startOfWeek, endOfWeek } from 'date-fns'
import { ja } from 'date-fns/locale'

// Chart.js登録
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

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
  customerName: string
  customer?: {
    id: string
    name: string
  }
  staff?: {
    id: string
    name: string
  }
  menuContent: string
  status: 'COMPLETED' | 'TENTATIVE' | 'CONFIRMED' | 'CANCELLED' | 'NO_SHOW'
  price?: number
}

interface ServiceHistory {
  id: string
  customerId: string
  customerName: string
  staffId: string
  staffName: string
  serviceType: string
  serviceDetails: string
  price: number
  date: string
  duration: number
  satisfactionRating?: number
}

interface SalesDashboardProps {
  customers: Customer[]
  reservations: Reservation[]
  serviceHistory: ServiceHistory[]
}

type Period = 'week' | 'month' | 'quarter' | 'year'

const SalesDashboard: React.FC<SalesDashboardProps> = ({ 
  customers, 
  reservations, 
  serviceHistory 
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('month')
  const [selectedChart, setSelectedChart] = useState<'revenue' | 'services' | 'staff'>('revenue')

  // 売上データの処理
  const salesAnalysis = useMemo(() => {
    const completedReservations = reservations.filter(r => r.status === 'COMPLETED' && r.price)
    const currentDate = new Date()
    
    // 期間別データ生成
    const generatePeriodData = () => {
      const periods: { date: Date; label: string }[] = []
      
      switch (selectedPeriod) {
        case 'week':
          for (let i = 11; i >= 0; i--) {
            const date = addDays(currentDate, -i * 7)
            periods.push({
              date: startOfWeek(date, { weekStartsOn: 1 }),
              label: format(date, 'M/d', { locale: ja })
            })
          }
          break
        case 'month':
          for (let i = 11; i >= 0; i--) {
            const date = subMonths(currentDate, i)
            periods.push({
              date: startOfMonth(date),
              label: format(date, 'M月', { locale: ja })
            })
          }
          break
        case 'quarter':
          for (let i = 7; i >= 0; i--) {
            const date = subMonths(currentDate, i * 3)
            const quarter = Math.floor(date.getMonth() / 3) + 1
            periods.push({
              date: startOfMonth(date),
              label: `${date.getFullYear()}Q${quarter}`
            })
          }
          break
        case 'year':
          for (let i = 4; i >= 0; i--) {
            const date = new Date(currentDate.getFullYear() - i, 0, 1)
            periods.push({
              date,
              label: `${date.getFullYear()}年`
            })
          }
          break
      }
      
      return periods
    }

    const periods = generatePeriodData()
    
    // 期間別売上計算
    const revenueByPeriod = periods.map(period => {
      const periodEnd = selectedPeriod === 'week' 
        ? endOfWeek(period.date, { weekStartsOn: 1 })
        : selectedPeriod === 'month' 
          ? endOfMonth(period.date)
          : addDays(period.date, 
              selectedPeriod === 'quarter' ? 90 : 365
            )
      
      const periodRevenue = completedReservations
        .filter(r => {
          const reservationDate = parseISO(r.startTime)
          return reservationDate >= period.date && reservationDate <= periodEnd
        })
        .reduce((sum, r) => sum + (r.price || 0), 0)
      
      return {
        period: period.label,
        revenue: periodRevenue,
        count: completedReservations.filter(r => {
          const reservationDate = parseISO(r.startTime)
          return reservationDate >= period.date && reservationDate <= periodEnd
        }).length
      }
    })

    return {
      revenueByPeriod,
      periods
    }
  }, [reservations, selectedPeriod])

  // サービス別分析
  const serviceAnalysis = useMemo(() => {
    const completedReservations = reservations.filter(r => r.status === 'COMPLETED' && r.price)
    
    const serviceMap = new Map<string, { count: number; revenue: number }>()
    
    completedReservations.forEach(reservation => {
      const service = reservation.menuContent
      const existing = serviceMap.get(service) || { count: 0, revenue: 0 }
      serviceMap.set(service, {
        count: existing.count + 1,
        revenue: existing.revenue + (reservation.price || 0)
      })
    })
    
    return Array.from(serviceMap.entries())
      .map(([service, data]) => ({
        service,
        count: data.count,
        revenue: data.revenue,
        avgPrice: data.revenue / data.count
      }))
      .sort((a, b) => b.revenue - a.revenue)
  }, [reservations])

  // スタッフ別分析
  const staffAnalysis = useMemo(() => {
    const completedReservations = reservations.filter(r => r.status === 'COMPLETED' && r.price && r.staff)
    
    const staffMap = new Map<string, { 
      name: string
      count: number
      revenue: number
      customers: Set<string>
    }>()
    
    completedReservations.forEach(reservation => {
      if (!reservation.staff) return
      
      const staffId = reservation.staff.id
      const existing = staffMap.get(staffId) || { 
        name: reservation.staff.name,
        count: 0, 
        revenue: 0,
        customers: new Set()
      }
      
      existing.count += 1
      existing.revenue += reservation.price || 0
      if (reservation.customer?.id) {
        existing.customers.add(reservation.customer.id)
      }
      
      staffMap.set(staffId, existing)
    })
    
    return Array.from(staffMap.entries())
      .map(([staffId, data]) => ({
        staffId,
        name: data.name,
        count: data.count,
        revenue: data.revenue,
        avgPrice: data.revenue / data.count,
        customerCount: data.customers.size
      }))
      .sort((a, b) => b.revenue - a.revenue)
  }, [reservations])

  // チャートデータ
  const chartData = useMemo(() => {
    switch (selectedChart) {
      case 'revenue':
        return {
          labels: salesAnalysis.revenueByPeriod.map(d => d.period),
          datasets: [
            {
              label: '売上',
              data: salesAnalysis.revenueByPeriod.map(d => d.revenue),
              borderColor: 'rgb(59, 130, 246)',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              fill: true,
              tension: 0.4
            },
            {
              label: '予約件数',
              data: salesAnalysis.revenueByPeriod.map(d => d.count),
              borderColor: 'rgb(16, 185, 129)',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              yAxisID: 'y1',
              fill: false
            }
          ]
        }
      
      case 'services':
        return {
          labels: serviceAnalysis.slice(0, 8).map(s => s.service),
          datasets: [{
            label: '売上',
            data: serviceAnalysis.slice(0, 8).map(s => s.revenue),
            backgroundColor: [
              'rgba(59, 130, 246, 0.8)',
              'rgba(16, 185, 129, 0.8)',
              'rgba(245, 158, 11, 0.8)',
              'rgba(239, 68, 68, 0.8)',
              'rgba(139, 92, 246, 0.8)',
              'rgba(236, 72, 153, 0.8)',
              'rgba(14, 165, 233, 0.8)',
              'rgba(34, 197, 94, 0.8)'
            ],
            borderWidth: 2,
            borderColor: '#fff'
          }]
        }
      
      case 'staff':
        return {
          labels: staffAnalysis.map(s => s.name),
          datasets: [{
            label: '売上',
            data: staffAnalysis.map(s => s.revenue),
            backgroundColor: 'rgba(139, 92, 246, 0.8)',
            borderColor: 'rgba(139, 92, 246, 1)',
            borderWidth: 1
          }]
        }
      
      default:
        return { labels: [], datasets: [] }
    }
  }, [salesAnalysis, serviceAnalysis, staffAnalysis, selectedChart])

  // チャートオプション
  const chartOptions = useMemo(() => {
    const baseOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              if (selectedChart === 'revenue' && context.datasetIndex === 0) {
                return `売上: ¥${context.raw.toLocaleString()}`
              }
              if (selectedChart === 'revenue' && context.datasetIndex === 1) {
                return `予約件数: ${context.raw}件`
              }
              if (selectedChart === 'services' || selectedChart === 'staff') {
                return `売上: ¥${context.raw.toLocaleString()}`
              }
              return context.raw
            }
          }
        }
      },
      scales: {
        y: {
          type: 'linear' as const,
          display: true,
          position: 'left' as const,
          ticks: {
            callback: (value: any) => `¥${value.toLocaleString()}`
          }
        },
        ...(selectedChart === 'revenue' && {
          y1: {
            type: 'linear' as const,
            display: true,
            position: 'right' as const,
            grid: {
              drawOnChartArea: false,
            },
            ticks: {
              callback: (value: any) => `${value}件`
            }
          }
        })
      }
    }
    
    return baseOptions
  }, [selectedChart])

  // 統計計算
  const totalRevenue = salesAnalysis.revenueByPeriod.reduce((sum, d) => sum + d.revenue, 0)
  const totalReservations = salesAnalysis.revenueByPeriod.reduce((sum, d) => sum + d.count, 0)
  const avgRevenue = totalReservations > 0 ? totalRevenue / totalReservations : 0
  const revenueGrowth = salesAnalysis.revenueByPeriod.length >= 2 
    ? ((salesAnalysis.revenueByPeriod[salesAnalysis.revenueByPeriod.length - 1].revenue - 
        salesAnalysis.revenueByPeriod[salesAnalysis.revenueByPeriod.length - 2].revenue) / 
       salesAnalysis.revenueByPeriod[salesAnalysis.revenueByPeriod.length - 2].revenue) * 100
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <BarChart3 className="w-8 h-8 mr-3 text-blue-600" />
            売上分析ダッシュボード
          </h2>
          <p className="text-gray-600 mt-1">
            包括的な売上データ分析と業績インサイト
          </p>
        </div>
        <div className="flex space-x-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as Period)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">週別</option>
            <option value="month">月別</option>
            <option value="quarter">四半期別</option>
            <option value="year">年別</option>
          </select>
          <button className="btn btn-secondary btn-sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            更新
          </button>
          <button className="btn btn-primary btn-sm">
            <Download className="w-4 h-4 mr-2" />
            レポート出力
          </button>
        </div>
      </div>

      {/* KPI サマリー */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">総売上</p>
              <p className="text-2xl font-bold text-gray-900">¥{totalRevenue.toLocaleString()}</p>
              <p className={`text-sm ${revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {revenueGrowth >= 0 ? '+' : ''}{revenueGrowth.toFixed(1)}% 前期比
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">総予約数</p>
              <p className="text-2xl font-bold text-gray-900">{totalReservations}件</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Target className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">平均客単価</p>
              <p className="text-2xl font-bold text-gray-900">¥{Math.round(avgRevenue).toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">アクティブ顧客</p>
              <p className="text-2xl font-bold text-gray-900">{customers.length}名</p>
            </div>
          </div>
        </div>
      </div>

      {/* チャート選択 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">分析チャート</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedChart('revenue')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedChart === 'revenue'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              売上推移
            </button>
            <button
              onClick={() => setSelectedChart('services')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedChart === 'services'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              サービス別
            </button>
            <button
              onClick={() => setSelectedChart('staff')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedChart === 'staff'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              スタッフ別
            </button>
          </div>
        </div>
        
        <div className="h-96">
          {selectedChart === 'revenue' && (
            <Line data={chartData} options={chartOptions} />
          )}
          {selectedChart === 'services' && (
            <Doughnut data={chartData} options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'right' as const,
                },
                tooltip: {
                  callbacks: {
                    label: (context: any) => `${context.label}: ¥${context.raw.toLocaleString()}`
                  }
                }
              }
            }} />
          )}
          {selectedChart === 'staff' && (
            <Bar data={chartData} options={chartOptions} />
          )}
        </div>
      </div>

      {/* 詳細分析テーブル */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* サービス別ランキング */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <PieChart className="w-5 h-5 mr-2 text-blue-600" />
            サービス別売上ランキング
          </h3>
          <div className="space-y-3">
            {serviceAnalysis.slice(0, 8).map((service, index) => (
              <div key={service.service} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                    index === 0 ? 'bg-yellow-500' : 
                    index === 1 ? 'bg-gray-400' : 
                    index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="ml-3">
                    <div className="font-medium text-gray-900">{service.service}</div>
                    <div className="text-sm text-gray-500">
                      {service.count}件 | 平均¥{Math.round(service.avgPrice).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">¥{service.revenue.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">
                    {((service.revenue / totalRevenue) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* スタッフ別パフォーマンス */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Award className="w-5 h-5 mr-2 text-purple-600" />
            スタッフ別パフォーマンス
          </h3>
          <div className="space-y-3">
            {staffAnalysis.map((staff, index) => (
              <div key={staff.staffId} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    index === 0 ? 'bg-purple-500' : 'bg-gray-500'
                  }`}>
                    {staff.name.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <div className="font-medium text-gray-900">{staff.name}</div>
                    <div className="text-sm text-gray-500">
                      {staff.count}件 | {staff.customerCount}名の顧客
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">¥{staff.revenue.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">
                    平均¥{Math.round(staff.avgPrice).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ビジネスインサイト */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <Zap className="w-5 h-5 mr-2 text-blue-600" />
          ビジネスインサイト & 改善提案
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-blue-700 mb-3">📈 成長機会</h4>
            <ul className="text-sm space-y-2">
              {revenueGrowth > 10 && (
                <li className="text-green-600">• 売上が好調に成長中（+{revenueGrowth.toFixed(1)}%）</li>
              )}
              {serviceAnalysis[0] && (
                <li className="text-blue-600">
                  • 人気サービス「{serviceAnalysis[0].service}」の更なる強化
                </li>
              )}
              {avgRevenue < 8000 && (
                <li className="text-orange-600">• 客単価向上の余地あり（現在¥{Math.round(avgRevenue).toLocaleString()}）</li>
              )}
              <li className="text-purple-600">• 新サービス導入による売上拡大の検討</li>
            </ul>
          </div>
          
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-green-700 mb-3">🎯 具体的アクション</h4>
            <ul className="text-sm space-y-2">
              <li className="text-green-600">• 人気サービスのアップセル・クロスセル強化</li>
              <li className="text-green-600">• 低パフォーマンススタッフの研修実施</li>
              <li className="text-green-600">• 季節性を活かしたプロモーション企画</li>
              <li className="text-green-600">• 高単価メニューの積極的な提案</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SalesDashboard