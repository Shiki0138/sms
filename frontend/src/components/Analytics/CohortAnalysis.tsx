import React, { useState, useMemo } from 'react'
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  BarChart3,
  Target,
  AlertCircle,
  Download,
  RefreshCw,
  Eye,
  Percent
} from 'lucide-react'
import { format, parseISO, startOfMonth, differenceInMonths, addMonths } from 'date-fns'
import { ja } from 'date-fns/locale'

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
  status: 'COMPLETED' | 'TENTATIVE' | 'CONFIRMED' | 'CANCELLED' | 'NO_SHOW'
  price?: number
}

interface CohortData {
  cohortMonth: string
  cohortSize: number
  retentionRates: number[]
  customerIds: string[]
}

interface CohortAnalysisProps {
  customers: Customer[]
  reservations: Reservation[]
}

const CohortAnalysis: React.FC<CohortAnalysisProps> = ({ customers, reservations }) => {
  const [selectedCohort, setSelectedCohort] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'percentage' | 'absolute'>('percentage')

  // コホート分析の計算
  const cohortAnalysis = useMemo(() => {
    const completedReservations = reservations.filter(r => r.status === 'COMPLETED')
    
    // 顧客の初回来店月でグループ化
    const customerCohorts = new Map<string, string[]>()
    
    customers.forEach(customer => {
      const firstVisitMonth = format(startOfMonth(parseISO(customer.createdAt)), 'yyyy-MM')
      if (!customerCohorts.has(firstVisitMonth)) {
        customerCohorts.set(firstVisitMonth, [])
      }
      customerCohorts.get(firstVisitMonth)!.push(customer.id)
    })

    // 各コホートの継続率計算
    const cohortData: CohortData[] = []
    const currentDate = new Date()
    
    for (const [cohortMonth, customerIds] of customerCohorts.entries()) {
      const cohortStartDate = parseISO(cohortMonth + '-01')
      const monthsFromCohort = differenceInMonths(currentDate, cohortStartDate)
      
      // 最低6ヶ月のデータがあるコホートのみ分析対象
      if (monthsFromCohort < 1) continue
      
      const retentionRates: number[] = []
      const maxMonths = Math.min(monthsFromCohort + 1, 12) // 最大12ヶ月まで追跡
      
      for (let month = 0; month < maxMonths; month++) {
        const targetMonth = addMonths(cohortStartDate, month)
        const targetMonthStart = startOfMonth(targetMonth)
        const targetMonthEnd = addMonths(targetMonthStart, 1)
        
        // その月に来店した顧客数
        const activeCustomers = customerIds.filter(customerId => {
          return completedReservations.some(reservation => {
            const reservationDate = parseISO(reservation.startTime)
            return reservation.customer?.id === customerId &&
                   reservationDate >= targetMonthStart &&
                   reservationDate < targetMonthEnd
          })
        }).length
        
        const retentionRate = (activeCustomers / customerIds.length) * 100
        retentionRates.push(retentionRate)
      }
      
      cohortData.push({
        cohortMonth,
        cohortSize: customerIds.length,
        retentionRates,
        customerIds
      })
    }
    
    return cohortData.sort((a, b) => b.cohortMonth.localeCompare(a.cohortMonth))
  }, [customers, reservations])

  // 継続率の色分け
  const getRetentionColor = (rate: number): string => {
    if (rate >= 80) return 'bg-green-500 text-white'
    if (rate >= 60) return 'bg-green-400 text-white'
    if (rate >= 40) return 'bg-yellow-400 text-black'
    if (rate >= 20) return 'bg-orange-400 text-white'
    if (rate > 0) return 'bg-red-400 text-white'
    return 'bg-gray-200 text-gray-400'
  }

  // 選択されたコホートの詳細情報
  const selectedCohortData = selectedCohort 
    ? cohortAnalysis.find(c => c.cohortMonth === selectedCohort)
    : null

  // 全体統計
  const avgCohortSize = cohortAnalysis.length > 0 
    ? cohortAnalysis.reduce((sum, c) => sum + c.cohortSize, 0) / cohortAnalysis.length 
    : 0

  const avgRetention1Month = cohortAnalysis.length > 0
    ? cohortAnalysis.reduce((sum, c) => sum + (c.retentionRates[1] || 0), 0) / cohortAnalysis.length
    : 0

  const avgRetention3Month = cohortAnalysis.length > 0
    ? cohortAnalysis.reduce((sum, c) => sum + (c.retentionRates[3] || 0), 0) / cohortAnalysis.length
    : 0

  const avgRetention6Month = cohortAnalysis.length > 0
    ? cohortAnalysis.reduce((sum, c) => sum + (c.retentionRates[6] || 0), 0) / cohortAnalysis.length
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Users className="w-8 h-8 mr-3 text-purple-600" />
            コホート分析 (顧客継続率分析)
          </h2>
          <p className="text-gray-600 mt-1">
            初回来店月別の顧客継続率とライフサイクル分析
          </p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => setViewMode(viewMode === 'percentage' ? 'absolute' : 'percentage')}
            className="btn btn-secondary btn-sm"
          >
            <Percent className="w-4 h-4 mr-2" />
            {viewMode === 'percentage' ? '絶対数表示' : '割合表示'}
          </button>
          <button className="btn btn-secondary btn-sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            再分析
          </button>
          <button className="btn btn-primary btn-sm">
            <Download className="w-4 h-4 mr-2" />
            レポート出力
          </button>
        </div>
      </div>

      {/* 全体統計 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">平均コホートサイズ</p>
              <p className="text-2xl font-bold text-gray-900">{Math.round(avgCohortSize)}名</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">1ヶ月継続率</p>
              <p className="text-2xl font-bold text-gray-900">{avgRetention1Month.toFixed(1)}%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">3ヶ月継続率</p>
              <p className="text-2xl font-bold text-gray-900">{avgRetention3Month.toFixed(1)}%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Target className="w-8 h-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">6ヶ月継続率</p>
              <p className="text-2xl font-bold text-gray-900">{avgRetention6Month.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* コホートテーブル */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">コホート継続率テーブル</h3>
        
        {cohortAnalysis.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">コホート</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">サイズ</th>
                  {Array.from({ length: 12 }, (_, i) => (
                    <th key={i} className="text-center py-3 px-2 font-medium text-gray-600 text-sm">
                      {i === 0 ? '当月' : `${i}ヶ月後`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cohortAnalysis.map((cohort) => (
                  <tr 
                    key={cohort.cohortMonth}
                    className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                      selectedCohort === cohort.cohortMonth ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedCohort(
                      selectedCohort === cohort.cohortMonth ? null : cohort.cohortMonth
                    )}
                  >
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {format(parseISO(cohort.cohortMonth + '-01'), 'yyyy年M月', { locale: ja })}
                    </td>
                    <td className="text-center py-3 px-4 text-gray-600">
                      {cohort.cohortSize}名
                    </td>
                    {Array.from({ length: 12 }, (_, i) => {
                      const rate = cohort.retentionRates[i]
                      const absoluteValue = rate !== undefined 
                        ? Math.round((rate / 100) * cohort.cohortSize)
                        : undefined
                      
                      return (
                        <td key={i} className="text-center py-3 px-2">
                          {rate !== undefined ? (
                            <div 
                              className={`inline-block px-2 py-1 rounded text-xs font-medium ${getRetentionColor(rate)}`}
                            >
                              {viewMode === 'percentage' 
                                ? `${rate.toFixed(1)}%`
                                : `${absoluteValue}名`
                              }
                            </div>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            分析可能なコホートデータがありません
          </div>
        )}
      </div>

      {/* 色分けの説明 */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">継続率の評価基準</h4>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
            <span className="text-sm">優秀 (80%以上)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-400 rounded mr-2"></div>
            <span className="text-sm">良好 (60-79%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-400 rounded mr-2"></div>
            <span className="text-sm">普通 (40-59%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-orange-400 rounded mr-2"></div>
            <span className="text-sm">注意 (20-39%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-400 rounded mr-2"></div>
            <span className="text-sm">要改善 (1-19%)</span>
          </div>
        </div>
      </div>

      {/* 選択されたコホートの詳細 */}
      {selectedCohortData && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <Eye className="w-5 h-5 mr-2 text-blue-600" />
              {format(parseISO(selectedCohortData.cohortMonth + '-01'), 'yyyy年M月', { locale: ja })} コホート詳細
            </h3>
            <button 
              onClick={() => setSelectedCohort(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">基本情報</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">初回来店月:</span>
                  <span className="font-medium">
                    {format(parseISO(selectedCohortData.cohortMonth + '-01'), 'yyyy年M月', { locale: ja })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">コホートサイズ:</span>
                  <span className="font-medium">{selectedCohortData.cohortSize}名</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">現在の継続率:</span>
                  <span className="font-medium">
                    {selectedCohortData.retentionRates[selectedCohortData.retentionRates.length - 1]?.toFixed(1) || 0}%
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">主要マイルストーン</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">1ヶ月継続率:</span>
                  <span className={`font-medium ${
                    (selectedCohortData.retentionRates[1] || 0) >= 60 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {selectedCohortData.retentionRates[1]?.toFixed(1) || 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">3ヶ月継続率:</span>
                  <span className={`font-medium ${
                    (selectedCohortData.retentionRates[3] || 0) >= 40 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {selectedCohortData.retentionRates[3]?.toFixed(1) || 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">6ヶ月継続率:</span>
                  <span className={`font-medium ${
                    (selectedCohortData.retentionRates[6] || 0) >= 25 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {selectedCohortData.retentionRates[6]?.toFixed(1) || 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* インサイトとアクションプラン */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
          コホート分析インサイト
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 text-orange-500" />
              課題の特定
            </h4>
            <ul className="text-sm space-y-2">
              {avgRetention1Month < 50 && (
                <li className="text-orange-600">• 1ヶ月継続率が低い - 初回体験の改善が必要</li>
              )}
              {avgRetention3Month < 30 && (
                <li className="text-red-600">• 3ヶ月継続率が低い - 関係構築強化が必要</li>
              )}
              {avgRetention6Month < 20 && (
                <li className="text-red-600">• 6ヶ月継続率が低い - ロイヤリティ向上施策が必要</li>
              )}
              {cohortAnalysis.length > 2 && (
                <li className="text-blue-600">
                  • 最新コホートの傾向: {
                    cohortAnalysis[0].retentionRates[1] > cohortAnalysis[1].retentionRates[1]
                      ? '改善傾向'
                      : '注意が必要'
                  }
                </li>
              )}
            </ul>
          </div>
          
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
              <Target className="w-4 h-4 mr-2 text-green-500" />
              改善アクション
            </h4>
            <ul className="text-sm space-y-2">
              <li className="text-green-600">• 初回来店時の顧客体験向上プログラム</li>
              <li className="text-green-600">• 2-3ヶ月目のフォローアップ強化</li>
              <li className="text-green-600">• ロイヤリティプログラムの導入</li>
              <li className="text-green-600">• 定期メンテナンス提案の制度化</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CohortAnalysis