import React, { useState, useMemo } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar,
  Target,
  Award,
  AlertTriangle,
  Download,
  RefreshCw
} from 'lucide-react'
import { format, differenceInDays, parseISO } from 'date-fns'
import { ja } from 'date-fns/locale'

interface Customer {
  id: string
  customerNumber: string
  name: string
  phone?: string
  email?: string
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

interface RFMSegment {
  segment: string
  description: string
  characteristics: string[]
  actions: string[]
  color: string
  priority: 'high' | 'medium' | 'low'
  count: number
  percentage: number
}

interface RFMAnalysisProps {
  customers: Customer[]
  reservations: Reservation[]
}

const RFMAnalysis: React.FC<RFMAnalysisProps> = ({ customers, reservations }) => {
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null)
  const [analysisDate] = useState(new Date()) // 分析基準日

  // RFM分析の計算
  const rfmAnalysis = useMemo(() => {
    const completedReservations = reservations.filter(r => r.status === 'COMPLETED' && r.price)
    
    const customerMetrics = customers.map(customer => {
      const customerReservations = completedReservations.filter(r => 
        r.customer?.id === customer.id
      )

      // Recency: 最終来店からの日数（少ないほど良い）
      const recency = customer.lastVisitDate 
        ? differenceInDays(analysisDate, parseISO(customer.lastVisitDate))
        : 9999

      // Frequency: 来店回数（多いほど良い）
      const frequency = customer.visitCount

      // Monetary: 総支払額（多いほど良い）
      const monetary = customerReservations.reduce((sum, r) => sum + (r.price || 0), 0)

      return {
        customer,
        recency,
        frequency,
        monetary,
        avgSpend: frequency > 0 ? monetary / frequency : 0
      }
    })

    // RFMスコアの計算（1-5段階）
    const recencyQuintiles = calculateQuintiles(customerMetrics.map(c => c.recency), true) // 逆順
    const frequencyQuintiles = calculateQuintiles(customerMetrics.map(c => c.frequency))
    const monetaryQuintiles = calculateQuintiles(customerMetrics.map(c => c.monetary))

    const rfmCustomers = customerMetrics.map(({ customer, recency, frequency, monetary, avgSpend }) => {
      const rScore = getRFMScore(recency, recencyQuintiles, true)
      const fScore = getRFMScore(frequency, frequencyQuintiles)
      const mScore = getRFMScore(monetary, monetaryQuintiles)
      
      const rfmScore = `${rScore}${fScore}${mScore}`
      const segment = getCustomerSegment(rScore, fScore, mScore)

      return {
        customer,
        recency,
        frequency,
        monetary,
        avgSpend,
        rScore,
        fScore,
        mScore,
        rfmScore,
        segment
      }
    })

    return rfmCustomers
  }, [customers, reservations, analysisDate])

  // 分位点計算
  const calculateQuintiles = (values: number[], reverse = false) => {
    const sorted = [...values].sort((a, b) => reverse ? b - a : a - b)
    const length = sorted.length
    return [
      sorted[Math.floor(length * 0.2)],
      sorted[Math.floor(length * 0.4)],
      sorted[Math.floor(length * 0.6)],
      sorted[Math.floor(length * 0.8)]
    ]
  }

  // RFMスコア計算
  const getRFMScore = (value: number, quintiles: number[], reverse = false) => {
    if (reverse) {
      if (value <= quintiles[0]) return 5
      if (value <= quintiles[1]) return 4
      if (value <= quintiles[2]) return 3
      if (value <= quintiles[3]) return 2
      return 1
    } else {
      if (value >= quintiles[3]) return 5
      if (value >= quintiles[2]) return 4
      if (value >= quintiles[1]) return 3
      if (value >= quintiles[0]) return 2
      return 1
    }
  }

  // 顧客セグメント判定
  const getCustomerSegment = (r: number, f: number, m: number): string => {
    const total = r + f + m
    
    if (r >= 4 && f >= 4 && m >= 4) return 'Champions'
    if (r >= 3 && f >= 3 && m >= 4) return 'Loyal Customers'
    if (r >= 4 && f <= 2 && m >= 3) return 'Potential Loyalists'
    if (r >= 4 && f <= 2 && m <= 2) return 'New Customers'
    if (r <= 2 && f >= 3 && m >= 3) return 'At Risk'
    if (r <= 2 && f <= 2 && m >= 4) return "Can't Lose Them"
    if (r >= 3 && f <= 2 && m <= 2) return 'Promising'
    if (r <= 2 && f >= 3 && m <= 2) return 'Need Attention'
    if (r <= 2 && f <= 2 && m <= 2) return 'Lost Customers'
    return 'Others'
  }

  // セグメント統計
  const segmentStats: RFMSegment[] = useMemo(() => {
    const segments = [
      {
        segment: 'Champions',
        description: 'ベストカスタマー',
        characteristics: ['最近来店', '高頻度', '高単価'],
        actions: ['VIP特典提供', '新サービス先行案内', '紹介プログラム参加'],
        color: 'bg-green-500',
        priority: 'high' as const
      },
      {
        segment: 'Loyal Customers',
        description: 'ロイヤルカスタマー',
        characteristics: ['定期来店', '安定支出'],
        actions: ['ポイント特典', '誕生日特典', '定期メンテナンス提案'],
        color: 'bg-blue-500',
        priority: 'high' as const
      },
      {
        segment: 'Potential Loyalists',
        description: '優良見込み客',
        characteristics: ['最近来店', '今後に期待'],
        actions: ['フォローアップ強化', '次回予約促進', 'アップセル提案'],
        color: 'bg-purple-500',
        priority: 'medium' as const
      },
      {
        segment: 'New Customers',
        description: '新規顧客',
        characteristics: ['初回来店', '関係構築段階'],
        actions: ['丁寧な接客', '次回予約割引', 'サービス説明強化'],
        color: 'bg-cyan-500',
        priority: 'medium' as const
      },
      {
        segment: 'At Risk',
        description: '離反危険客',
        characteristics: ['来店間隔増加', '要注意'],
        actions: ['特別オファー', 'パーソナライズ提案', '満足度調査'],
        color: 'bg-orange-500',
        priority: 'high' as const
      },
      {
        segment: "Can't Lose Them",
        description: '重要顧客',
        characteristics: ['高価値', '離反兆候'],
        actions: ['緊急フォロー', 'VIP待遇', '個別相談'],
        color: 'bg-red-500',
        priority: 'high' as const
      },
      {
        segment: 'Promising',
        description: '期待新人',
        characteristics: ['最近来店', '育成対象'],
        actions: ['関係構築', 'サービス体験促進', '継続来店促進'],
        color: 'bg-indigo-500',
        priority: 'medium' as const
      },
      {
        segment: 'Need Attention',
        description: '注意必要客',
        characteristics: ['以前は優良', '最近減少'],
        actions: ['状況確認', 'ニーズ再調査', '改善提案'],
        color: 'bg-yellow-500',
        priority: 'medium' as const
      },
      {
        segment: 'Lost Customers',
        description: '離反顧客',
        characteristics: ['長期未来店', '関係断絶'],
        actions: ['復帰キャンペーン', '特別割引', '理由調査'],
        color: 'bg-gray-500',
        priority: 'low' as const
      }
    ]

    return segments.map(segment => {
      const count = rfmAnalysis.filter(c => c.segment === segment.segment).length
      const percentage = customers.length > 0 ? (count / customers.length) * 100 : 0
      
      return {
        ...segment,
        count,
        percentage
      }
    }).filter(s => s.count > 0)
  }, [rfmAnalysis, customers.length])

  // セグメント別統計
  const selectedSegmentCustomers = selectedSegment 
    ? rfmAnalysis.filter(c => c.segment === selectedSegment)
    : []

  const totalRevenue = rfmAnalysis.reduce((sum, c) => sum + c.monetary, 0)
  const avgRecency = rfmAnalysis.reduce((sum, c) => sum + c.recency, 0) / rfmAnalysis.length
  const avgFrequency = rfmAnalysis.reduce((sum, c) => sum + c.frequency, 0) / rfmAnalysis.length
  const avgMonetary = totalRevenue / rfmAnalysis.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <BarChart3 className="w-8 h-8 mr-3 text-blue-600" />
            RFM分析 (顧客セグメント分析)
          </h2>
          <p className="text-gray-600 mt-1">
            Recency (最新性) × Frequency (頻度) × Monetary (金額) による高度な顧客分析
          </p>
        </div>
        <div className="flex space-x-2">
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
              <p className="text-sm font-medium text-gray-600">総顧客数</p>
              <p className="text-2xl font-bold text-gray-900">{customers.length}名</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">平均来店間隔</p>
              <p className="text-2xl font-bold text-gray-900">{Math.round(avgRecency)}日</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">平均来店回数</p>
              <p className="text-2xl font-bold text-gray-900">{avgFrequency.toFixed(1)}回</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">平均顧客単価</p>
              <p className="text-2xl font-bold text-gray-900">¥{Math.round(avgMonetary).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* セグメント分析 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">顧客セグメント分析</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {segmentStats.map((segment) => (
            <button
              key={segment.segment}
              onClick={() => setSelectedSegment(
                selectedSegment === segment.segment ? null : segment.segment
              )}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                selectedSegment === segment.segment
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded ${segment.color} mr-2`}></div>
                  <h4 className="font-medium text-gray-900">{segment.segment}</h4>
                </div>
                {segment.priority === 'high' && (
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                )}
              </div>
              <p className="text-sm text-gray-600 mb-2">{segment.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">{segment.count}名</span>
                <span className="text-sm text-gray-500">{segment.percentage.toFixed(1)}%</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 選択セグメント詳細 */}
      {selectedSegment && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <Target className="w-5 h-5 mr-2 text-blue-600" />
              {selectedSegment} セグメント詳細
            </h3>
            <button 
              onClick={() => setSelectedSegment(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          
          {(() => {
            const segment = segmentStats.find(s => s.segment === selectedSegment)
            if (!segment) return null
            
            return (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">特徴</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {segment.characteristics.map((char, i) => (
                        <li key={i}>• {char}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">推奨アクション</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {segment.actions.map((action, i) => (
                        <li key={i}>• {action}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">統計情報</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>顧客数: {segment.count}名</div>
                      <div>構成比: {segment.percentage.toFixed(1)}%</div>
                      <div>総売上貢献: ¥{selectedSegmentCustomers.reduce((sum, c) => sum + c.monetary, 0).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
                
                {/* 顧客リスト */}
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">該当顧客一覧</h4>
                  <div className="max-h-64 overflow-y-auto">
                    <div className="grid grid-cols-1 gap-2">
                      {selectedSegmentCustomers.map((rfmCustomer) => (
                        <div 
                          key={rfmCustomer.customer.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded"
                        >
                          <div>
                            <div className="font-medium">{rfmCustomer.customer.name}</div>
                            <div className="text-xs text-gray-500">
                              RFMスコア: {rfmCustomer.rfmScore} | 
                              最終来店: {rfmCustomer.recency}日前 | 
                              来店回数: {rfmCustomer.frequency}回
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">¥{rfmCustomer.monetary.toLocaleString()}</div>
                            <div className="text-xs text-gray-500">
                              単価: ¥{Math.round(rfmCustomer.avgSpend).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
      )}

      {/* アクションプラン */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <Award className="w-5 h-5 mr-2 text-blue-600" />
          推奨マーケティングアクション
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-red-700 mb-2">🚨 緊急対応が必要</h4>
            <ul className="text-sm space-y-1">
              {segmentStats
                .filter(s => s.priority === 'high' && ['At Risk', "Can't Lose Them"].includes(s.segment))
                .map(s => (
                  <li key={s.segment}>
                    • {s.segment}: {s.count}名 - 特別フォローアップ実施
                  </li>
                ))}
            </ul>
          </div>
          
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-green-700 mb-2">💎 優良顧客強化施策</h4>
            <ul className="text-sm space-y-1">
              {segmentStats
                .filter(s => ['Champions', 'Loyal Customers'].includes(s.segment))
                .map(s => (
                  <li key={s.segment}>
                    • {s.segment}: {s.count}名 - VIP特典・紹介制度強化
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RFMAnalysis