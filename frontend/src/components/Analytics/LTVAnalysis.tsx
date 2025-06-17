import React, { useState, useMemo } from 'react'
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Calendar,
  Target,
  Crown,
  Award,
  AlertTriangle,
  Download,
  RefreshCw,
  Eye,
  Calculator
} from 'lucide-react'
import { format, parseISO, differenceInDays, differenceInMonths } from 'date-fns'
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

interface LTVMetrics {
  customer: Customer
  totalRevenue: number
  averageOrderValue: number
  purchaseFrequency: number
  customerLifespan: number
  ltvValue: number
  predictedLTV: number
  ltvTier: 'Platinum' | 'Gold' | 'Silver' | 'Bronze' | 'Basic'
  riskScore: number
  nextVisitProbability: number
}

interface LTVAnalysisProps {
  customers: Customer[]
  reservations: Reservation[]
}

const LTVAnalysis: React.FC<LTVAnalysisProps> = ({ customers, reservations }) => {
  const [selectedTier, setSelectedTier] = useState<string | null>(null)
  const [selectedMetric, setSelectedMetric] = useState<'current' | 'predicted'>('current')

  // LTV計算
  const ltvAnalysis = useMemo(() => {
    const completedReservations = reservations.filter(r => r.status === 'COMPLETED' && r.price)
    const currentDate = new Date()
    
    const customerLTVs: LTVMetrics[] = customers.map(customer => {
      const customerReservations = completedReservations.filter(r => 
        r.customer?.id === customer.id
      )

      // 基本メトリクス計算
      const totalRevenue = customerReservations.reduce((sum, r) => sum + (r.price || 0), 0)
      const averageOrderValue = customerReservations.length > 0 
        ? totalRevenue / customerReservations.length 
        : 0
      
      // 顧客ライフスパン（日数）
      const firstVisit = parseISO(customer.createdAt)
      const lastVisit = customer.lastVisitDate ? parseISO(customer.lastVisitDate) : firstVisit
      const customerLifespanDays = Math.max(differenceInDays(lastVisit, firstVisit), 1)
      const customerLifespan = customerLifespanDays / 365.25 // 年単位

      // 購入頻度（年間）
      const purchaseFrequency = customerLifespan > 0 
        ? customerReservations.length / customerLifespan 
        : 0

      // 現在のLTV
      const ltvValue = averageOrderValue * purchaseFrequency * customerLifespan

      // 予測LTV（今後3年間）
      const daysSinceLastVisit = customer.lastVisitDate 
        ? differenceInDays(currentDate, parseISO(customer.lastVisitDate))
        : 0
      
      // チャーン確率計算（最終来店からの経過日数ベース）
      const churnProbability = Math.min(daysSinceLastVisit / 365, 0.9)
      const nextVisitProbability = Math.max(1 - churnProbability, 0.1)
      
      // 予測LTV（リスク考慮）
      const futureYears = 3
      const decayFactor = Math.pow(nextVisitProbability, futureYears)
      const predictedLTV = ltvValue + (averageOrderValue * purchaseFrequency * futureYears * decayFactor)

      // LTVティア判定
      const ltvTier = getLTVTier(selectedMetric === 'current' ? ltvValue : predictedLTV)

      // リスクスコア（0-100、高いほど危険）
      const riskScore = Math.min(
        (daysSinceLastVisit / 30) * 10 + // 最終来店からの経過月数
        (customerLifespan < 0.5 ? 30 : 0) + // 新規顧客リスク
        (purchaseFrequency < 2 ? 20 : 0) + // 低頻度リスク
        (averageOrderValue < 5000 ? 15 : 0), // 低単価リスク
        100
      )

      return {
        customer,
        totalRevenue,
        averageOrderValue,
        purchaseFrequency,
        customerLifespan,
        ltvValue,
        predictedLTV,
        ltvTier,
        riskScore,
        nextVisitProbability
      }
    })

    return customerLTVs.sort((a, b) => {
      const valueA = selectedMetric === 'current' ? a.ltvValue : a.predictedLTV
      const valueB = selectedMetric === 'current' ? b.ltvValue : b.predictedLTV
      return valueB - valueA
    })
  }, [customers, reservations, selectedMetric])

  // LTVティア判定
  const getLTVTier = (ltv: number): 'Platinum' | 'Gold' | 'Silver' | 'Bronze' | 'Basic' => {
    if (ltv >= 100000) return 'Platinum'
    if (ltv >= 50000) return 'Gold'
    if (ltv >= 25000) return 'Silver'
    if (ltv >= 10000) return 'Bronze'
    return 'Basic'
  }

  // ティア別統計
  const tierStats = useMemo(() => {
    const tiers = ['Platinum', 'Gold', 'Silver', 'Bronze', 'Basic'] as const
    
    return tiers.map(tier => {
      const tierCustomers = ltvAnalysis.filter(c => c.ltvTier === tier)
      const totalValue = tierCustomers.reduce((sum, c) => 
        sum + (selectedMetric === 'current' ? c.ltvValue : c.predictedLTV), 0
      )
      const avgValue = tierCustomers.length > 0 ? totalValue / tierCustomers.length : 0
      
      return {
        tier,
        count: tierCustomers.length,
        percentage: ltvAnalysis.length > 0 ? (tierCustomers.length / ltvAnalysis.length) * 100 : 0,
        totalValue,
        avgValue,
        color: getTierColor(tier)
      }
    }).filter(t => t.count > 0)
  }, [ltvAnalysis, selectedMetric])

  // ティア色
  const getTierColor = (tier: string): string => {
    const colors = {
      'Platinum': 'bg-purple-500',
      'Gold': 'bg-yellow-500',
      'Silver': 'bg-gray-400',
      'Bronze': 'bg-orange-600',
      'Basic': 'bg-blue-500'
    }
    return colors[tier as keyof typeof colors] || 'bg-gray-500'
  }

  // ティアアイコン
  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'Platinum': return <Crown className="w-5 h-5 text-purple-600" />
      case 'Gold': return <Award className="w-5 h-5 text-yellow-600" />
      case 'Silver': return <Target className="w-5 h-5 text-gray-600" />
      case 'Bronze': return <Users className="w-5 h-5 text-orange-600" />
      default: return <Users className="w-5 h-5 text-blue-600" />
    }
  }

  // 全体統計
  const totalLTV = ltvAnalysis.reduce((sum, c) => 
    sum + (selectedMetric === 'current' ? c.ltvValue : c.predictedLTV), 0
  )
  const avgLTV = ltvAnalysis.length > 0 ? totalLTV / ltvAnalysis.length : 0
  const avgOrderValue = ltvAnalysis.reduce((sum, c) => sum + c.averageOrderValue, 0) / ltvAnalysis.length
  const avgFrequency = ltvAnalysis.reduce((sum, c) => sum + c.purchaseFrequency, 0) / ltvAnalysis.length

  // 選択されたティアの顧客
  const selectedTierCustomers = selectedTier 
    ? ltvAnalysis.filter(c => c.ltvTier === selectedTier)
    : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <DollarSign className="w-8 h-8 mr-3 text-green-600" />
            LTV分析 (顧客生涯価値)
          </h2>
          <p className="text-gray-600 mt-1">
            Customer Lifetime Value による顧客価値とポテンシャル分析
          </p>
        </div>
        <div className="flex space-x-2">
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value as 'current' | 'predicted')}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="current">現在LTV</option>
            <option value="predicted">予測LTV</option>
          </select>
          <button className="btn btn-secondary btn-sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            再計算
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
            <Calculator className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                平均{selectedMetric === 'current' ? '現在' : '予測'}LTV
              </p>
              <p className="text-2xl font-bold text-gray-900">¥{Math.round(avgLTV).toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">平均注文単価</p>
              <p className="text-2xl font-bold text-gray-900">¥{Math.round(avgOrderValue).toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">平均年間来店回数</p>
              <p className="text-2xl font-bold text-gray-900">{avgFrequency.toFixed(1)}回</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                総{selectedMetric === 'current' ? '現在' : '予測'}LTV
              </p>
              <p className="text-2xl font-bold text-gray-900">¥{Math.round(totalLTV).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* LTVティア分析 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">LTVティア別分析</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tierStats.map((tier) => (
            <button
              key={tier.tier}
              onClick={() => setSelectedTier(
                selectedTier === tier.tier ? null : tier.tier
              )}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                selectedTier === tier.tier
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  {getTierIcon(tier.tier)}
                  <span className="ml-2 font-medium text-gray-900">{tier.tier}</span>
                </div>
                {tier.tier === 'Platinum' && (
                  <Crown className="w-4 h-4 text-purple-500" />
                )}
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">{tier.count}名</span>
                  <span className="text-sm text-gray-500">{tier.percentage.toFixed(1)}%</span>
                </div>
                <div className="text-sm text-gray-600">
                  平均LTV: ¥{Math.round(tier.avgValue).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">
                  総価値: ¥{Math.round(tier.totalValue).toLocaleString()}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 選択ティア詳細 */}
      {selectedTier && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <Eye className="w-5 h-5 mr-2 text-blue-600" />
              {selectedTier} ティア詳細
            </h3>
            <button 
              onClick={() => setSelectedTier(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-4">
            {/* ティア統計 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">基本統計</h4>
                <div className="space-y-1 text-sm">
                  <div>顧客数: {selectedTierCustomers.length}名</div>
                  <div>構成比: {((selectedTierCustomers.length / ltvAnalysis.length) * 100).toFixed(1)}%</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">平均メトリクス</h4>
                <div className="space-y-1 text-sm">
                  <div>平均LTV: ¥{Math.round(selectedTierCustomers.reduce((sum, c) => sum + (selectedMetric === 'current' ? c.ltvValue : c.predictedLTV), 0) / selectedTierCustomers.length).toLocaleString()}</div>
                  <div>平均単価: ¥{Math.round(selectedTierCustomers.reduce((sum, c) => sum + c.averageOrderValue, 0) / selectedTierCustomers.length).toLocaleString()}</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">リスク分析</h4>
                <div className="space-y-1 text-sm">
                  <div>平均リスクスコア: {Math.round(selectedTierCustomers.reduce((sum, c) => sum + c.riskScore, 0) / selectedTierCustomers.length)}</div>
                  <div>高リスク顧客: {selectedTierCustomers.filter(c => c.riskScore > 70).length}名</div>
                </div>
              </div>
            </div>
            
            {/* 顧客リスト */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">顧客詳細</h4>
              <div className="max-h-64 overflow-y-auto">
                <div className="space-y-2">
                  {selectedTierCustomers.slice(0, 10).map((ltvCustomer) => (
                    <div 
                      key={ltvCustomer.customer.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded border"
                    >
                      <div>
                        <div className="font-medium flex items-center">
                          {ltvCustomer.customer.name}
                          {ltvCustomer.riskScore > 70 && (
                            <AlertTriangle className="w-4 h-4 text-red-500 ml-2" />
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          単価: ¥{Math.round(ltvCustomer.averageOrderValue).toLocaleString()} | 
                          頻度: {ltvCustomer.purchaseFrequency.toFixed(1)}回/年 | 
                          リスク: {Math.round(ltvCustomer.riskScore)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          ¥{Math.round(selectedMetric === 'current' ? ltvCustomer.ltvValue : ltvCustomer.predictedLTV).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {selectedMetric === 'current' ? '現在' : '予測'}LTV
                        </div>
                      </div>
                    </div>
                  ))}
                  {selectedTierCustomers.length > 10 && (
                    <div className="text-center text-sm text-gray-500 py-2">
                      他 {selectedTierCustomers.length - 10}名
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* アクションプラン */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2 text-green-600" />
          LTV向上アクションプラン
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-purple-700 mb-2 flex items-center">
              <Crown className="w-4 h-4 mr-2" />
              高価値顧客育成
            </h4>
            <ul className="text-sm space-y-1">
              <li>• Platinum/Gold顧客のVIP特典強化</li>
              <li>• パーソナライズされたサービス提案</li>
              <li>• 専属スタイリスト制度の導入</li>
              <li>• 限定イベント・先行予約権の提供</li>
            </ul>
          </div>
          
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-orange-700 mb-2 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2" />
              リスク顧客対応
            </h4>
            <ul className="text-sm space-y-1">
              <li>• 高リスクスコア顧客への緊急フォロー</li>
              <li>• 来店間隔の延長傾向顧客への特別オファー</li>
              <li>• 満足度調査とフィードバック収集</li>
              <li>• 個別カウンセリングの実施</li>
            </ul>
          </div>
          
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-blue-700 mb-2 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              価値向上施策
            </h4>
            <ul className="text-sm space-y-1">
              <li>• 平均単価向上のためのアップセル強化</li>
              <li>• 来店頻度向上のためのメンテナンス提案</li>
              <li>• 新サービス・商品の積極的な提案</li>
              <li>• ライフスタイル提案型の接客</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LTVAnalysis