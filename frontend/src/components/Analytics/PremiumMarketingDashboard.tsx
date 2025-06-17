import React, { useState, useEffect } from 'react'
import { 
  Crown, 
  TrendingUp, 
  Target, 
  Users, 
  DollarSign, 
  Calendar,
  MessageSquare,
  BarChart3,
  PieChart,
  Lock,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Star,
  Zap
} from 'lucide-react'
import { Bar, Line, Doughnut } from 'react-chartjs-2'

interface PremiumUser {
  id: string
  planType: 'basic' | 'premium' | 'enterprise'
  subscriptionStart: string
  subscriptionEnd: string
  features: string[]
}

interface BusinessAnalysis {
  revenueGrowth: number
  customerRetention: number
  averageOrderValue: number
  marketingROI: number
  recommendations: MarketingRecommendation[]
  competitorAnalysis: CompetitorData[]
  customerLifetimeValue: number
  churnRisk: ChurnRiskData[]
}

interface MarketingRecommendation {
  id: string
  type: 'pricing' | 'service' | 'promotion' | 'retention' | 'acquisition'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  expectedImpact: string
  implementationCost: string
  timeframe: string
  roi: number
}

interface CompetitorData {
  name: string
  priceRange: string
  strengths: string[]
  weaknesses: string[]
  marketShare: number
}

interface ChurnRiskData {
  customerId: string
  customerName: string
  riskScore: number
  lastVisit: string
  recommendedAction: string
}

const PremiumMarketingDashboard: React.FC = () => {
  const [userPlan, setUserPlan] = useState<PremiumUser | null>(null)
  const [businessAnalysis, setBusinessAnalysis] = useState<BusinessAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTimeframe, setSelectedTimeframe] = useState('6months')

  useEffect(() => {
    checkUserSubscription()
    if (userPlan?.planType === 'premium' || userPlan?.planType === 'enterprise') {
      loadBusinessAnalysis()
    }
  }, [userPlan, selectedTimeframe])

  const checkUserSubscription = async () => {
    try {
      // デモ用：実際はAPIで認証されたユーザーの課金状況を確認
      const demoUser: PremiumUser = {
        id: 'user123',
        planType: 'premium', // 'basic' | 'premium' | 'enterprise'
        subscriptionStart: '2024-01-01',
        subscriptionEnd: '2025-01-01',
        features: [
          'advanced_analytics',
          'marketing_recommendations',
          'competitor_analysis',
          'churn_prediction',
          'roi_optimization'
        ]
      }
      setUserPlan(demoUser)
    } catch (error) {
      console.error('Subscription check error:', error)
    }
  }

  const loadBusinessAnalysis = async () => {
    setIsLoading(true)
    try {
      // 実際の顧客データと施術履歴を基に高度な分析を実行
      const customers = (window as any).dummyCustomers || []
      const serviceHistory = (window as any).serviceHistory || []
      
      const analysis = await generateAdvancedBusinessAnalysis(customers, serviceHistory)
      setBusinessAnalysis(analysis)
    } catch (error) {
      console.error('Business analysis error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateAdvancedBusinessAnalysis = async (customers: any[], serviceHistory: any[]): Promise<BusinessAnalysis> => {
    // AI風の高度な分析を模擬
    const totalRevenue = serviceHistory.reduce((sum, service) => sum + service.price, 0)
    const previousRevenue = totalRevenue * 0.85 // 仮の前期比較
    const revenueGrowth = ((totalRevenue - previousRevenue) / previousRevenue) * 100

    // 顧客リテンション分析
    const activeCustomers = customers.filter(c => {
      if (!c.lastVisitDate) return false
      const lastVisit = new Date(c.lastVisitDate)
      const threeMonthsAgo = new Date()
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
      return lastVisit > threeMonthsAgo
    })
    const customerRetention = (activeCustomers.length / customers.length) * 100

    // CLV計算
    const averageOrderValue = totalRevenue / serviceHistory.length
    const averageFrequency = customers.reduce((sum, c) => sum + c.visitCount, 0) / customers.length
    const customerLifetimeValue = averageOrderValue * averageFrequency * 2.5 // 平均ライフサイクル

    // チャーンリスク分析
    const churnRisk = customers
      .filter(c => c.lastVisitDate)
      .map(customer => {
        const daysSinceLastVisit = Math.floor(
          (new Date().getTime() - new Date(customer.lastVisitDate!).getTime()) / (1000 * 60 * 60 * 24)
        )
        const riskScore = Math.min(100, (daysSinceLastVisit / 90) * 100)
        
        return {
          customerId: customer.id,
          customerName: customer.name,
          riskScore: Math.round(riskScore),
          lastVisit: customer.lastVisitDate!,
          recommendedAction: riskScore > 70 ? 'ウィンバックキャンペーン' : 
                           riskScore > 40 ? 'リテンション施策' : '継続フォロー'
        }
      })
      .filter(risk => risk.riskScore > 40)
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 10)

    // マーケティング推奨施策
    const recommendations: MarketingRecommendation[] = [
      {
        id: 'rec1',
        type: 'retention',
        priority: 'high',
        title: 'VIP顧客向けロイヤルティプログラム',
        description: '来店回数15回以上の顧客に特別割引と優先予約権を提供',
        expectedImpact: '顧客単価15%向上、リテンション率12%改善',
        implementationCost: '月額5万円',
        timeframe: '2週間',
        roi: 340
      },
      {
        id: 'rec2',
        type: 'acquisition',
        priority: 'high',
        title: '既存顧客紹介キャンペーン',
        description: '紹介者・被紹介者双方に3,000円割引クーポンを提供',
        expectedImpact: '新規獲得30%増加、紹介率25%向上',
        implementationCost: '月額8万円',
        timeframe: '1週間',
        roi: 280
      },
      {
        id: 'rec3',
        type: 'pricing',
        priority: 'medium',
        title: 'ダイナミックプライシング導入',
        description: '平日・時間帯別の動的価格設定で稼働率を最適化',
        expectedImpact: '売上20%向上、稼働率15%改善',
        implementationCost: '初期15万円',
        timeframe: '1ヶ月',
        roi: 220
      },
      {
        id: 'rec4',
        type: 'service',
        priority: 'medium',
        title: 'サブスクリプション型メンバーシップ',
        description: '月額定額でサービス利用し放題プランを導入',
        expectedImpact: '予約安定化、月間売上予測精度90%向上',
        implementationCost: '月額3万円',
        timeframe: '3週間',
        roi: 190
      },
      {
        id: 'rec5',
        type: 'promotion',
        priority: 'low',
        title: 'SNSインフルエンサー連携',
        description: 'ローカルインフルエンサーとのコラボレーション企画',
        expectedImpact: 'ブランド認知度40%向上、新規流入25%増',
        implementationCost: '月額12万円',
        timeframe: '2ヶ月',
        roi: 150
      }
    ]

    // 競合分析（デモデータ）
    const competitorAnalysis: CompetitorData[] = [
      {
        name: 'A美容室',
        priceRange: '6,000円〜15,000円',
        strengths: ['立地が良い', 'SNS発信力', '最新設備'],
        weaknesses: ['価格が高い', '予約が取りにくい'],
        marketShare: 25
      },
      {
        name: 'Bサロン',
        priceRange: '4,000円〜12,000円',
        strengths: ['価格競争力', '営業時間が長い'],
        weaknesses: ['技術レベルにばらつき', 'リピート率低い'],
        marketShare: 20
      },
      {
        name: 'C美容院',
        priceRange: '5,000円〜18,000円',
        strengths: ['技術力が高い', '個室対応'],
        weaknesses: ['マーケティング弱い', '客層が限定的'],
        marketShare: 15
      }
    ]

    return {
      revenueGrowth: Math.round(revenueGrowth),
      customerRetention: Math.round(customerRetention),
      averageOrderValue: Math.round(averageOrderValue),
      marketingROI: 265,
      recommendations,
      competitorAnalysis,
      customerLifetimeValue: Math.round(customerLifetimeValue),
      churnRisk
    }
  }

  const upgradeToPremium = () => {
    alert('プレミアムプランにアップグレードしました！（デモ）')
    setUserPlan(prev => prev ? { ...prev, planType: 'premium' } : null)
  }

  if (!userPlan || userPlan.planType === 'basic') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <Crown className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              プレミアム経営戦略ダッシュボード
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              AI powered マーケティング施策で売上を最大化
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* 機能紹介 */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Zap className="w-8 h-8 text-yellow-500 mr-3" />
                プレミアム限定機能
              </h2>
              <div className="space-y-4">
                {[
                  { icon: Target, title: 'AI経営戦略提案', desc: '売上最大化のための具体的施策を提案' },
                  { icon: TrendingUp, title: '高度な競合分析', desc: '市場動向と競合他社の詳細分析' },
                  { icon: Users, title: 'チャーン予測', desc: '離脱リスク顧客の特定と対策提案' },
                  { icon: BarChart3, title: 'ROI最適化', desc: 'マーケティング投資効果の最大化' },
                  { icon: Lightbulb, title: '個別コンサルティング', desc: '経営状況に応じたカスタム戦略' }
                ].map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <feature.icon className="w-6 h-6 text-blue-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                      <p className="text-gray-600 text-sm">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 料金プラン */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl shadow-lg p-8 text-white">
              <h2 className="text-2xl font-bold mb-6">プレミアムプラン</h2>
              <div className="text-center mb-8">
                <div className="text-5xl font-bold mb-2">¥29,800</div>
                <div className="text-blue-200">月額（税抜）</div>
              </div>
              
              <div className="space-y-3 mb-8">
                {[
                  'AI経営戦略コンサルティング',
                  '高度な顧客分析・競合分析',
                  'ROI最適化レポート',
                  'チャーン予測・離脱防止施策',
                  '24時間チャットサポート',
                  'カスタムレポート作成'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-300" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={upgradeToPremium}
                className="w-full bg-white text-blue-600 font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors"
              >
                今すぐアップグレード
              </button>
            </div>
          </div>

          {/* 実績・導入事例 */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              導入実績
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { metric: '売上向上', value: '平均35%', desc: '導入後6ヶ月での売上増加率' },
                { metric: '顧客満足度', value: '95%', desc: 'プレミアムユーザーの満足度' },
                { metric: 'ROI改善', value: '280%', desc: 'マーケティング投資効果の向上' }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{stat.value}</div>
                  <div className="font-semibold text-gray-900 mb-1">{stat.metric}</div>
                  <div className="text-sm text-gray-600">{stat.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2 flex items-center">
              <Crown className="w-8 h-8 mr-3 text-yellow-300" />
              プレミアム経営戦略ダッシュボード
            </h1>
            <p className="text-purple-100">
              AI powered マーケティング施策で売上を最大化しましょう
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold">プレミアムプラン</div>
            <div className="text-purple-200 text-sm">
              {userPlan.subscriptionEnd}まで有効
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">経営データを分析中...</p>
        </div>
      ) : businessAnalysis && (
        <>
          {/* KPI概要 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                title: '売上成長率',
                value: `${businessAnalysis.revenueGrowth}%`,
                icon: TrendingUp,
                color: businessAnalysis.revenueGrowth > 0 ? 'text-green-600' : 'text-red-600',
                bgColor: businessAnalysis.revenueGrowth > 0 ? 'bg-green-50' : 'bg-red-50'
              },
              {
                title: '顧客リテンション率',
                value: `${businessAnalysis.customerRetention}%`,
                icon: Users,
                color: 'text-blue-600',
                bgColor: 'bg-blue-50'
              },
              {
                title: '顧客生涯価値',
                value: `¥${businessAnalysis.customerLifetimeValue.toLocaleString()}`,
                icon: DollarSign,
                color: 'text-purple-600',
                bgColor: 'bg-purple-50'
              },
              {
                title: 'マーケティングROI',
                value: `${businessAnalysis.marketingROI}%`,
                icon: Target,
                color: 'text-orange-600',
                bgColor: 'bg-orange-50'
              }
            ].map((kpi, index) => (
              <div key={index} className={`${kpi.bgColor} rounded-xl p-6`}>
                <div className="flex items-center justify-between mb-3">
                  <kpi.icon className={`w-8 h-8 ${kpi.color}`} />
                </div>
                <div className={`text-2xl font-bold ${kpi.color} mb-1`}>
                  {kpi.value}
                </div>
                <div className="text-gray-600 text-sm">{kpi.title}</div>
              </div>
            ))}
          </div>

          {/* AIマーケティング提案 */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Zap className="w-6 h-6 text-blue-500 mr-2" />
              AIマーケティング提案
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">新規顧客獲得</h4>
                <p className="text-sm text-blue-800">
                  SNSキャンペーンで新規顧客を25%増加させる施策を提案します。
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-900 mb-2">リピート率向上</h4>
                <p className="text-sm text-green-800">
                  離脱リスク顧客へのフォローアップメッセージで再来店を促進。
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-medium text-purple-900 mb-2">単価アップ</h4>
                <p className="text-sm text-purple-800">
                  VIP顧客向け特別メニューで平均単価を15%向上させる提案。
                </p>
              </div>
            </div>
          </div>

          {/* AI推奨施策 */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Lightbulb className="w-6 h-6 text-yellow-500 mr-2" />
              AI推奨マーケティング施策
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {businessAnalysis.recommendations.slice(0, 4).map((rec) => (
                <div key={rec.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-block w-3 h-3 rounded-full ${
                        rec.priority === 'high' ? 'bg-red-500' :
                        rec.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></span>
                      <span className="text-xs font-medium text-gray-500 uppercase">
                        {rec.type}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">ROI {rec.roi}%</div>
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{rec.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{rec.description}</p>
                  <div className="space-y-1 text-xs text-gray-500">
                    <div><strong>予想効果:</strong> {rec.expectedImpact}</div>
                    <div><strong>コスト:</strong> {rec.implementationCost}</div>
                    <div><strong>期間:</strong> {rec.timeframe}</div>
                  </div>
                  <button className="w-full mt-3 bg-blue-600 text-white py-2 px-4 rounded text-sm hover:bg-blue-700 transition-colors">
                    施策を実行
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* チャーンリスク顧客 */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <AlertTriangle className="w-6 h-6 text-red-500 mr-2" />
              離脱リスク顧客（要注意）
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">顧客名</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">リスクスコア</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">最終来店</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">推奨アクション</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {businessAnalysis.churnRisk.slice(0, 5).map((risk) => (
                    <tr key={risk.customerId}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{risk.customerName}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-2 ${
                            risk.riskScore > 70 ? 'bg-red-500' :
                            risk.riskScore > 40 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}></div>
                          {risk.riskScore}%
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{risk.lastVisit}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {risk.recommendedAction}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 競合分析 */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <BarChart3 className="w-6 h-6 text-purple-500 mr-2" />
              競合分析レポート
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {businessAnalysis.competitorAnalysis.map((competitor, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{competitor.name}</h3>
                  <div className="text-sm text-gray-600 mb-3">
                    価格帯: {competitor.priceRange}
                  </div>
                  <div className="mb-3">
                    <div className="text-xs font-medium text-green-700 mb-1">強み</div>
                    {competitor.strengths.map((strength, i) => (
                      <div key={i} className="text-xs text-gray-600">• {strength}</div>
                    ))}
                  </div>
                  <div className="mb-3">
                    <div className="text-xs font-medium text-red-700 mb-1">弱み</div>
                    {competitor.weaknesses.map((weakness, i) => (
                      <div key={i} className="text-xs text-gray-600">• {weakness}</div>
                    ))}
                  </div>
                  <div className="text-xs">
                    市場シェア: <span className="font-semibold">{competitor.marketShare}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default PremiumMarketingDashboard