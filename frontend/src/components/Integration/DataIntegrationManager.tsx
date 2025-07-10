import React, { useState, useMemo } from 'react'
import { 
  Database, 
  Merge, 
  Users, 
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  Filter,
  BarChart3
} from 'lucide-react'
import { format, parseISO, differenceInDays } from 'date-fns'
import { ja } from 'date-fns/locale'

interface HotPepperData {
  id: string
  reservationDate: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  serviceType: string
  serviceDetails: string
  price: number
  staffName: string
  status: 'completed' | 'cancelled' | 'no_show'
  referralSource: 'hotpepper' | 'repeat' | 'walk_in'
  memo?: string
}

interface ExistingCustomer {
  id: string
  customerNumber: string
  name: string
  phone?: string
  email?: string
  visitCount: number
  lastVisitDate?: string
  createdAt: string
}

interface ExistingReservation {
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

interface DataIntegrationManagerProps {
  hotpepperData: HotPepperData[]
  existingCustomers: ExistingCustomer[]
  existingReservations: ExistingReservation[]
  onDataMerge: (mergedData: {
    customers: ExistingCustomer[]
    reservations: ExistingReservation[]
    integrationStats: IntegrationStats
  }) => void
}

interface IntegrationStats {
  totalHotpepperRecords: number
  newCustomers: number
  existingCustomersUpdated: number
  newReservations: number
  duplicateReservations: number
  conversionRate: number
  dateRange: { start: string; end: string } | null
  revenueBySource: {
    hotpepper: number
    existing: number
    total: number
  }
}

interface CustomerMatch {
  hotpepperRecord: HotPepperData
  existingCustomer: ExistingCustomer | null
  matchConfidence: number
  matchMethod: 'exact_phone' | 'exact_name' | 'fuzzy_name' | 'new'
}

const DataIntegrationManager: React.FC<DataIntegrationManagerProps> = ({
  hotpepperData,
  existingCustomers,
  existingReservations,
  onDataMerge
}) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [integrationStatus, setIntegrationStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle')
  const [integrationStats, setIntegrationStats] = useState<IntegrationStats | null>(null)
  const [customerMatches, setCustomerMatches] = useState<CustomerMatch[]>([])
  const [selectedDateRange, setSelectedDateRange] = useState({
    start: format(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  })

  // 顧客マッチング処理
  const performCustomerMatching = useMemo(() => {
    const matches: CustomerMatch[] = []
    
    hotpepperData.forEach(record => {
      let bestMatch: ExistingCustomer | null = null
      let matchConfidence = 0
      let matchMethod: CustomerMatch['matchMethod'] = 'new'

      // 1. 電話番号での完全一致
      if (record.customerPhone) {
        const phoneMatch = existingCustomers.find(c => 
          c.phone && c.phone.replace(/[-\s]/g, '') === record.customerPhone.replace(/[-\s]/g, '')
        )
        if (phoneMatch) {
          bestMatch = phoneMatch
          matchConfidence = 100
          matchMethod = 'exact_phone'
        }
      }

      // 2. 名前での完全一致（電話番号一致がない場合）
      if (!bestMatch && record.customerName) {
        const nameMatch = existingCustomers.find(c => 
          c.name === record.customerName
        )
        if (nameMatch) {
          bestMatch = nameMatch
          matchConfidence = 85
          matchMethod = 'exact_name'
        }
      }

      // 3. 名前での曖昧一致（漢字・ひらがな・カタカナの違いを考慮）
      if (!bestMatch && record.customerName) {
        const fuzzyMatch = existingCustomers.find(c => {
          const similarity = calculateNameSimilarity(c.name, record.customerName)
          return similarity > 0.8
        })
        if (fuzzyMatch) {
          bestMatch = fuzzyMatch
          matchConfidence = 70
          matchMethod = 'fuzzy_name'
        }
      }

      matches.push({
        hotpepperRecord: record,
        existingCustomer: bestMatch,
        matchConfidence,
        matchMethod
      })
    })

    return matches
  }, [hotpepperData, existingCustomers])

  // 名前の類似度計算
  const calculateNameSimilarity = (name1: string, name2: string): number => {
    // シンプルなレーベンシュタイン距離ベースの類似度
    const maxLength = Math.max(name1.length, name2.length)
    if (maxLength === 0) return 1
    
    const distance = levenshteinDistance(name1, name2)
    return 1 - distance / maxLength
  }

  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = []
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }
    return matrix[str2.length][str1.length]
  }

  // データ統合処理
  const performDataIntegration = async () => {
    setIsProcessing(true)
    setIntegrationStatus('processing')

    try {
      const matches = performCustomerMatching
      setCustomerMatches(matches)

      // フィルタリング（日付範囲）
      const filteredHotpepperData = hotpepperData.filter(record => {
        if (!record.reservationDate) return false
        const recordDate = record.reservationDate.split(' ')[0] // 日付部分のみ取得
        return recordDate >= selectedDateRange.start && recordDate <= selectedDateRange.end
      })

      // 統計計算
      const newCustomers: ExistingCustomer[] = []
      const updatedCustomers: ExistingCustomer[] = [...existingCustomers]
      const newReservations: ExistingReservation[] = []
      
      let hotpepperRevenue = 0
      const existingRevenue = existingReservations.reduce((sum, r) => sum + (r.price || 0), 0)
      
      matches.forEach(match => {
        if (filteredHotpepperData.includes(match.hotpepperRecord)) {
          hotpepperRevenue += match.hotpepperRecord.price

          // 新規顧客の作成
          if (match.matchMethod === 'new') {
            const newCustomer: ExistingCustomer = {
              id: `hp_${match.hotpepperRecord.id}`,
              customerNumber: `HP${Date.now()}${Math.random().toString(36).substr(2, 4)}`,
              name: match.hotpepperRecord.customerName,
              phone: match.hotpepperRecord.customerPhone,
              email: match.hotpepperRecord.customerEmail,
              visitCount: 1,
              lastVisitDate: match.hotpepperRecord.reservationDate,
              createdAt: match.hotpepperRecord.reservationDate
            }
            newCustomers.push(newCustomer)
          } else if (match.existingCustomer) {
            // 既存顧客の更新
            const customerIndex = updatedCustomers.findIndex(c => c.id === match.existingCustomer!.id)
            if (customerIndex >= 0) {
              updatedCustomers[customerIndex] = {
                ...updatedCustomers[customerIndex],
                visitCount: updatedCustomers[customerIndex].visitCount + 1,
                lastVisitDate: match.hotpepperRecord.reservationDate
              }
            }
          }

          // 新規予約の作成
          const newReservation: ExistingReservation = {
            id: `hp_res_${match.hotpepperRecord.id}`,
            startTime: match.hotpepperRecord.reservationDate,
            customerName: match.hotpepperRecord.customerName,
            customer: match.existingCustomer ? {
              id: match.existingCustomer.id,
              name: match.existingCustomer.name
            } : {
              id: `hp_${match.hotpepperRecord.id}`,
              name: match.hotpepperRecord.customerName
            },
            status: match.hotpepperRecord.status.toUpperCase() as any,
            price: match.hotpepperRecord.price
          }
          newReservations.push(newReservation)
        }
      })

      // 重複予約のチェック
      const duplicateCount = newReservations.filter(newRes => 
        existingReservations.some(existingRes => 
          existingRes.customerName === newRes.customerName &&
          Math.abs(new Date(existingRes.startTime).getTime() - new Date(newRes.startTime).getTime()) < 60 * 60 * 1000 // 1時間以内
        )
      ).length

      // 統計の計算
      const stats: IntegrationStats = {
        totalHotpepperRecords: filteredHotpepperData.length,
        newCustomers: newCustomers.length,
        existingCustomersUpdated: matches.filter(m => m.existingCustomer && filteredHotpepperData.includes(m.hotpepperRecord)).length,
        newReservations: newReservations.length,
        duplicateReservations: duplicateCount,
        conversionRate: filteredHotpepperData.length > 0 ? 
          (filteredHotpepperData.filter(d => d.status === 'completed').length / filteredHotpepperData.length) * 100 : 0,
        dateRange: filteredHotpepperData.length > 0 ? {
          start: Math.min(...filteredHotpepperData.map(d => new Date(d.reservationDate).getTime())).toString(),
          end: Math.max(...filteredHotpepperData.map(d => new Date(d.reservationDate).getTime())).toString()
        } : null,
        revenueBySource: {
          hotpepper: hotpepperRevenue,
          existing: existingRevenue,
          total: hotpepperRevenue + existingRevenue
        }
      }

      setIntegrationStats(stats)
      setIntegrationStatus('completed')

      // 統合データを親コンポーネントに返す
      onDataMerge({
        customers: [...updatedCustomers, ...newCustomers],
        reservations: [...existingReservations, ...newReservations],
        integrationStats: stats
      })

    } catch (error) {
      console.error('Integration error:', error)
      setIntegrationStatus('error')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center mb-4">
          <Merge className="w-6 h-6 mr-2 text-blue-600" />
          データ統合管理
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center p-3 bg-orange-50 rounded-lg">
            <Database className="w-8 h-8 text-orange-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">ホットペッパーデータ</p>
              <p className="text-lg font-bold text-gray-900">{hotpepperData.length}件</p>
            </div>
          </div>
          
          <div className="flex items-center p-3 bg-blue-50 rounded-lg">
            <Users className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">既存顧客</p>
              <p className="text-lg font-bold text-gray-900">{existingCustomers.length}名</p>
            </div>
          </div>
          
          <div className="flex items-center p-3 bg-green-50 rounded-lg">
            <Calendar className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">既存予約</p>
              <p className="text-lg font-bold text-gray-900">{existingReservations.length}件</p>
            </div>
          </div>
        </div>
      </div>

      {/* 統合設定 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <Filter className="w-5 h-5 mr-2 text-blue-600" />
          統合設定
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">開始日</label>
            <input
              type="date"
              value={selectedDateRange.start}
              onChange={(e) => setSelectedDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">終了日</label>
            <input
              type="date"
              value={selectedDateRange.end}
              onChange={(e) => setSelectedDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          onClick={performDataIntegration}
          disabled={isProcessing || hotpepperData.length === 0}
          className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              統合処理中...
            </>
          ) : (
            <>
              <Merge className="w-4 h-4 mr-2" />
              データ統合を実行
            </>
          )}
        </button>
      </div>

      {/* 統合結果 */}
      {integrationStatus === 'completed' && integrationStats && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              統合完了
            </h3>
            <span className="text-sm text-gray-500">
              {format(new Date(), 'yyyy/MM/dd HH:mm', { locale: ja })}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Database className="w-6 h-6 text-blue-600 mr-2" />
                <div>
                  <p className="text-sm text-gray-600">処理データ数</p>
                  <p className="text-xl font-bold text-gray-900">{integrationStats.totalHotpepperRecords}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Users className="w-6 h-6 text-green-600 mr-2" />
                <div>
                  <p className="text-sm text-gray-600">新規顧客</p>
                  <p className="text-xl font-bold text-gray-900">{integrationStats.newCustomers}</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center">
                <TrendingUp className="w-6 h-6 text-purple-600 mr-2" />
                <div>
                  <p className="text-sm text-gray-600">完了率</p>
                  <p className="text-xl font-bold text-gray-900">{integrationStats.conversionRate.toFixed(1)}%</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center">
                <BarChart3 className="w-6 h-6 text-yellow-600 mr-2" />
                <div>
                  <p className="text-sm text-gray-600">売上貢献</p>
                  <p className="text-xl font-bold text-gray-900">¥{integrationStats.revenueBySource.hotpepper.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">統合サマリー</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">顧客統合結果</h5>
                  <ul className="space-y-1 text-gray-600">
                    <li>• 新規顧客: {integrationStats.newCustomers}名</li>
                    <li>• 既存顧客更新: {integrationStats.existingCustomersUpdated}名</li>
                    <li>• 重複予約検出: {integrationStats.duplicateReservations}件</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">売上分析</h5>
                  <ul className="space-y-1 text-gray-600">
                    <li>• ホットペッパー: ¥{integrationStats.revenueBySource.hotpepper.toLocaleString()}</li>
                    <li>• 既存システム: ¥{integrationStats.revenueBySource.existing.toLocaleString()}</li>
                    <li>• 総売上: ¥{integrationStats.revenueBySource.total.toLocaleString()}</li>
                  </ul>
                </div>
              </div>
            </div>

            {integrationStats.duplicateReservations > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                  <span className="font-medium text-yellow-800">
                    {integrationStats.duplicateReservations}件の重複予約が検出されました
                  </span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  手動で確認・調整が必要な場合があります。
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {integrationStatus === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            <span className="font-medium text-red-800">データ統合エラー</span>
          </div>
          <p className="text-sm text-red-700 mt-1">
            データ形式を確認してください。サポートにお問い合わせいただくことも可能です。
          </p>
        </div>
      )}

      {/* 顧客マッチング詳細 */}
      {customerMatches.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">顧客マッチング結果</h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">ホットペッパー顧客</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">マッチング結果</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">信頼度</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">マッチング方法</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {customerMatches.slice(0, 10).map((match, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm">
                      <div>
                        <div className="font-medium text-gray-900">{match.hotpepperRecord.customerName}</div>
                        <div className="text-gray-500">{match.hotpepperRecord.customerPhone}</div>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {match.existingCustomer ? (
                        <div>
                          <div className="font-medium text-gray-900">{match.existingCustomer.name}</div>
                          <div className="text-gray-500">{match.existingCustomer.customerNumber}</div>
                        </div>
                      ) : (
                        <span className="text-blue-600 font-medium">新規顧客</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        match.matchConfidence >= 90 ? 'bg-green-100 text-green-800' :
                        match.matchConfidence >= 70 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {match.matchConfidence}%
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {match.matchMethod === 'exact_phone' && '電話番号一致'}
                      {match.matchMethod === 'exact_name' && '名前一致'}
                      {match.matchMethod === 'fuzzy_name' && '名前類似'}
                      {match.matchMethod === 'new' && '新規'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default DataIntegrationManager