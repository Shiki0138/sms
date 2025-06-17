import React, { useState, useMemo } from 'react'
import { 
  Lightbulb, 
  TrendingUp, 
  Users, 
  Target,
  Calendar,
  DollarSign,
  Star,
  MessageCircle,
  Gift,
  Clock,
  Zap,
  RefreshCw,
  Download,
  Eye,
  ArrowRight,
  CheckCircle
} from 'lucide-react'
import { format, addDays, addWeeks, addMonths } from 'date-fns'
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

interface AIProposal {
  id: string
  type: 'retention' | 'acquisition' | 'upsell' | 'seasonal' | 'loyalty' | 'recovery'
  title: string
  description: string
  targetSegment: string
  targetCount: number
  estimatedRevenue: number
  campaignPeriod: string
  urgency: 'high' | 'medium' | 'low'
  confidence: number
  tactics: string[]
  kpis: string[]
  timeline: {
    phase: string
    duration: string
    actions: string[]
  }[]
  budget: {
    category: string
    amount: number
  }[]
  expectedROI: number
}

interface MarketingAISuggestionsProps {
  customers: Customer[]
  reservations: Reservation[]
}

const MarketingAISuggestions: React.FC<MarketingAISuggestionsProps> = ({ 
  customers, 
  reservations 
}) => {
  const [selectedProposal, setSelectedProposal] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // AI提案の生成
  const aiProposals = useMemo(() => {
    const completedReservations = reservations.filter(r => r.status === 'COMPLETED' && r.price)
    const currentDate = new Date()
    
    // 顧客分析
    const recentCustomers = customers.filter(c => {
      if (!c.lastVisitDate) return false
      const daysSince = Math.floor((currentDate.getTime() - new Date(c.lastVisitDate).getTime()) / (1000 * 60 * 60 * 24))
      return daysSince <= 30
    })
    
    const atRiskCustomers = customers.filter(c => {
      if (!c.lastVisitDate) return false
      const daysSince = Math.floor((currentDate.getTime() - new Date(c.lastVisitDate).getTime()) / (1000 * 60 * 60 * 24))
      return daysSince >= 60 && daysSince <= 180
    })
    
    const lostCustomers = customers.filter(c => {
      if (!c.lastVisitDate) return false
      const daysSince = Math.floor((currentDate.getTime() - new Date(c.lastVisitDate).getTime()) / (1000 * 60 * 60 * 24))
      return daysSince > 180
    })
    
    const highValueCustomers = customers.filter(c => c.visitCount >= 5)
    const newCustomers = customers.filter(c => c.visitCount <= 2)
    
    // 売上分析
    const totalRevenue = completedReservations.reduce((sum, r) => sum + (r.price || 0), 0)
    const avgOrderValue = completedReservations.length > 0 ? totalRevenue / completedReservations.length : 0
    
    const proposals: AIProposal[] = []
    
    // 1. 離反防止キャンペーン
    if (atRiskCustomers.length > 0) {
      proposals.push({
        id: 'retention-at-risk',
        type: 'retention',
        title: '離反防止緊急キャンペーン',
        description: '来店間隔が延びている顧客への特別オファーで関係を再構築',
        targetSegment: '60-180日未来店の顧客',
        targetCount: atRiskCustomers.length,
        estimatedRevenue: atRiskCustomers.length * avgOrderValue * 0.4,
        campaignPeriod: '2週間',
        urgency: 'high',
        confidence: 85,
        tactics: [
          'パーソナライズされた復帰オファー（30%OFF）',
          '担当スタイリストからの個別メッセージ',
          '新サービス無料体験チケット',
          'LINEでの限定クーポン配信'
        ],
        kpis: [
          '復帰率: 25%以上',
          '平均客単価: ¥8,000以上',
          'キャンペーン後継続率: 60%以上'
        ],
        timeline: [
          {
            phase: '準備フェーズ',
            duration: '3日',
            actions: ['顧客リスト作成', 'メッセージ個別化', 'オファー設計']
          },
          {
            phase: '実行フェーズ',
            duration: '2週間',
            actions: ['メッセージ配信', 'フォローアップ', '予約受付']
          },
          {
            phase: '分析フェーズ',
            duration: '1週間',
            actions: ['効果測定', '成功要因分析', '改善点抽出']
          }
        ],
        budget: [
          { category: '割引原資', amount: Math.round(atRiskCustomers.length * avgOrderValue * 0.3 * 0.25) },
          { category: '販促物制作', amount: 50000 },
          { category: 'システム利用料', amount: 20000 }
        ],
        expectedROI: 150
      })
    }
    
    // 2. 新規顧客定着キャンペーン
    if (newCustomers.length > 0) {
      proposals.push({
        id: 'acquisition-new-customer',
        type: 'acquisition',
        title: '新規顧客定着プログラム',
        description: '初回来店後のフォローアップで継続来店を促進',
        targetSegment: '来店回数1-2回の新規顧客',
        targetCount: newCustomers.length,
        estimatedRevenue: newCustomers.length * avgOrderValue * 1.5,
        campaignPeriod: '1ヶ月',
        urgency: 'medium',
        confidence: 78,
        tactics: [
          '2回目来店20%OFFクーポン',
          '美容相談LINE Bot導入',
          'ビューティーカレンダー配布',
          '3ヶ月プランの提案'
        ],
        kpis: [
          '2回目来店率: 70%以上',
          '3ヶ月継続率: 50%以上',
          '紹介率: 15%以上'
        ],
        timeline: [
          {
            phase: 'システム準備',
            duration: '1週間',
            actions: ['LINE Bot設定', 'クーポンシステム準備', '相談体制構築']
          },
          {
            phase: 'プログラム実行',
            duration: '1ヶ月',
            actions: ['自動フォローアップ', 'パーソナル相談', '継続提案']
          }
        ],
        budget: [
          { category: 'システム開発', amount: 150000 },
          { category: '割引原資', amount: Math.round(newCustomers.length * avgOrderValue * 0.2 * 0.7) },
          { category: 'ノベルティ', amount: 80000 }
        ],
        expectedROI: 220
      })
    }
    
    // 3. VIP顧客アップセルキャンペーン
    if (highValueCustomers.length > 0) {
      proposals.push({
        id: 'upsell-vip',
        type: 'upsell',
        title: 'VIP顧客プレミアムサービス',
        description: '優良顧客向けの高単価メニューとVIP体験の提供',
        targetSegment: '来店回数5回以上の優良顧客',
        targetCount: highValueCustomers.length,
        estimatedRevenue: highValueCustomers.length * avgOrderValue * 1.8,
        campaignPeriod: '3ヶ月',
        urgency: 'medium',
        confidence: 82,
        tactics: [
          'プレミアムトリートメント先行案内',
          '専属スタイリスト制度',
          'VIP専用予約枠の提供',
          '限定イベント招待'
        ],
        kpis: [
          '高単価メニュー利用率: 40%以上',
          '平均客単価向上: 30%以上',
          'VIP満足度: 95%以上'
        ],
        timeline: [
          {
            phase: 'VIPプログラム設計',
            duration: '2週間',
            actions: ['メニュー開発', 'スタッフトレーニング', 'システム整備']
          },
          {
            phase: 'プログラム展開',
            duration: '3ヶ月',
            actions: ['VIP体験提供', '継続的フォロー', '効果測定']
          }
        ],
        budget: [
          { category: 'メニュー開発', amount: 200000 },
          { category: 'スタッフ研修', amount: 100000 },
          { category: 'VIP特典', amount: 150000 }
        ],
        expectedROI: 280
      })
    }
    
    // 4. 季節性キャンペーン
    const currentMonth = currentDate.getMonth()
    let seasonalCampaign: AIProposal | null = null
    
    if (currentMonth >= 2 && currentMonth <= 4) { // 春
      seasonalCampaign = {
        id: 'seasonal-spring',
        type: 'seasonal',
        title: '春の新生活応援キャンペーン',
        description: '新年度の始まりに合わせたイメージチェンジ提案',
        targetSegment: '全顧客',
        targetCount: customers.length,
        estimatedRevenue: customers.length * avgOrderValue * 0.6,
        campaignPeriod: '6週間',
        urgency: 'medium',
        confidence: 75,
        tactics: [
          'カラーチェンジ15%OFF',
          'ビジネスヘアスタイル提案',
          '新生活応援ヘアケアセット',
          'SNS投稿キャンペーン'
        ],
        kpis: [
          'キャンペーン参加率: 35%以上',
          '新規メニュー利用率: 25%以上',
          'SNS投稿数: 100件以上'
        ],
        timeline: [
          {
            phase: 'キャンペーン準備',
            duration: '2週間',
            actions: ['メニュー準備', '販促物制作', 'SNS設定']
          },
          {
            phase: 'キャンペーン実行',
            duration: '6週間',
            actions: ['オファー提供', 'SNS運用', '効果測定']
          }
        ],
        budget: [
          { category: '販促制作', amount: 120000 },
          { category: '割引原資', amount: Math.round(customers.length * avgOrderValue * 0.15 * 0.35) },
          { category: 'SNS広告', amount: 80000 }
        ],
        expectedROI: 180
      }
    }
    
    if (seasonalCampaign) proposals.push(seasonalCampaign)
    
    // 5. 復帰キャンペーン
    if (lostCustomers.length > 0) {
      proposals.push({
        id: 'recovery-lost',
        type: 'recovery',
        title: '復帰ウェルカムキャンペーン',
        description: '長期未来店顧客への特別復帰オファー',
        targetSegment: '6ヶ月以上未来店の顧客',
        targetCount: lostCustomers.length,
        estimatedRevenue: lostCustomers.length * avgOrderValue * 0.2,
        campaignPeriod: '1ヶ月',
        urgency: 'low',
        confidence: 45,
        tactics: [
          '復帰特別価格（50%OFF）',
          '理由調査アンケート実施',
          '改善されたサービス体験',
          '復帰記念ギフト'
        ],
        kpis: [
          '復帰率: 15%以上',
          'アンケート回答率: 30%以上',
          '復帰後継続率: 40%以上'
        ],
        timeline: [
          {
            phase: 'アプローチ設計',
            duration: '1週間',
            actions: ['復帰オファー設計', 'アンケート作成', 'ギフト準備']
          },
          {
            phase: 'キャンペーン実行',
            duration: '1ヶ月',
            actions: ['オファー配信', 'アンケート実施', '復帰対応']
          }
        ],
        budget: [
          { category: '割引原資', amount: Math.round(lostCustomers.length * avgOrderValue * 0.5 * 0.15) },
          { category: '復帰ギフト', amount: 60000 },
          { category: 'アンケート運用', amount: 30000 }
        ],
        expectedROI: 120
      })
    }
    
    return proposals.sort((a, b) => {
      const urgencyOrder = { high: 3, medium: 2, low: 1 }
      if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
        return urgencyOrder[b.urgency] - urgencyOrder[a.urgency]
      }
      return b.confidence - a.confidence
    })
  }, [customers, reservations])

  // フィルタリング
  const filteredProposals = useMemo(() => {
    if (selectedCategory === 'all') return aiProposals
    return aiProposals.filter(p => p.type === selectedCategory)
  }, [aiProposals, selectedCategory])

  // 選択された提案
  const selectedProposalData = selectedProposal 
    ? aiProposals.find(p => p.id === selectedProposal)
    : null

  // 総予想売上
  const totalEstimatedRevenue = aiProposals.reduce((sum, p) => sum + p.estimatedRevenue, 0)
  const totalTargetCustomers = aiProposals.reduce((sum, p) => sum + p.targetCount, 0)
  const avgConfidence = aiProposals.reduce((sum, p) => sum + p.confidence, 0) / aiProposals.length

  // カテゴリー情報
  const categories = [
    { key: 'all', label: 'すべて', icon: Target },
    { key: 'retention', label: '顧客維持', icon: Users },
    { key: 'acquisition', label: '新規獲得', icon: TrendingUp },
    { key: 'upsell', label: 'アップセル', icon: DollarSign },
    { key: 'seasonal', label: '季節性', icon: Calendar },
    { key: 'recovery', label: '復帰促進', icon: MessageCircle }
  ]

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'retention': return <Users className="w-5 h-5" />
      case 'acquisition': return <TrendingUp className="w-5 h-5" />
      case 'upsell': return <DollarSign className="w-5 h-5" />
      case 'seasonal': return <Calendar className="w-5 h-5" />
      case 'loyalty': return <Star className="w-5 h-5" />
      case 'recovery': return <MessageCircle className="w-5 h-5" />
      default: return <Target className="w-5 h-5" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Lightbulb className="w-8 h-8 mr-3 text-yellow-600" />
            AI マーケティング施策提案
          </h2>
          <p className="text-gray-600 mt-1">
            データ分析に基づく最適なマーケティング戦略とキャンペーン提案
          </p>
        </div>
        <div className="flex space-x-2">
          <button className="btn btn-secondary btn-sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            AI再分析
          </button>
          <button className="btn btn-primary btn-sm">
            <Download className="w-4 h-4 mr-2" />
            提案書出力
          </button>
        </div>
      </div>

      {/* 全体統計 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Lightbulb className="w-8 h-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">AI提案数</p>
              <p className="text-2xl font-bold text-gray-900">{aiProposals.length}件</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">予想売上効果</p>
              <p className="text-2xl font-bold text-gray-900">¥{Math.round(totalEstimatedRevenue).toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">対象顧客総数</p>
              <p className="text-2xl font-bold text-gray-900">{totalTargetCustomers}名</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Star className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">平均成功確度</p>
              <p className="text-2xl font-bold text-gray-900">{Math.round(avgConfidence)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* カテゴリー選択 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">施策カテゴリー</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const Icon = category.icon
            const count = category.key === 'all' 
              ? aiProposals.length 
              : aiProposals.filter(p => p.type === category.key).length
            
            return (
              <button
                key={category.key}
                onClick={() => setSelectedCategory(category.key)}
                className={`flex items-center px-4 py-2 rounded-md border transition-colors ${
                  selectedCategory === category.key
                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {category.label}
                {count > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full text-xs">
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* AI提案一覧 */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900">
          マーケティング施策提案 ({filteredProposals.length}件)
        </h3>
        
        {filteredProposals.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredProposals.map((proposal) => (
              <button
                key={proposal.id}
                onClick={() => setSelectedProposal(
                  selectedProposal === proposal.id ? null : proposal.id
                )}
                className={`p-6 text-left border-2 rounded-lg transition-all hover:shadow-md ${
                  selectedProposal === proposal.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <div className="mr-3 text-blue-600">
                      {getTypeIcon(proposal.type)}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{proposal.title}</h4>
                      <p className="text-sm text-gray-600">{proposal.targetSegment}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(proposal.urgency)}`}>
                      {proposal.urgency === 'high' ? '緊急' : proposal.urgency === 'medium' ? '通常' : '低'}
                    </span>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        成功確度: {proposal.confidence}%
                      </div>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-700 mb-4">{proposal.description}</p>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">対象:</span>
                    <div className="font-medium">{proposal.targetCount}名</div>
                  </div>
                  <div>
                    <span className="text-gray-600">予想売上:</span>
                    <div className="font-medium">¥{Math.round(proposal.estimatedRevenue).toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">期間:</span>
                    <div className="font-medium">{proposal.campaignPeriod}</div>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center text-green-600">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span className="text-sm font-medium">ROI {proposal.expectedROI}%</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            選択したカテゴリーに該当する提案がありません
          </div>
        )}
      </div>

      {/* 選択された提案の詳細 */}
      {selectedProposalData && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <Eye className="w-6 h-6 mr-2 text-blue-600" />
              {selectedProposalData.title} - 詳細プラン
            </h3>
            <button 
              onClick={() => setSelectedProposal(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-6">
            {/* 基本情報 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">キャンペーン概要</h4>
                  <p className="text-gray-700">{selectedProposalData.description}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">実施戦術</h4>
                  <ul className="space-y-1">
                    {selectedProposalData.tactics.map((tactic, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        {tactic}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">KPI目標</h4>
                  <ul className="space-y-1">
                    {selectedProposalData.kpis.map((kpi, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start">
                        <Target className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                        {kpi}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">予算内訳</h4>
                  <div className="space-y-2">
                    {selectedProposalData.budget.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">{item.category}:</span>
                        <span className="font-medium">¥{item.amount.toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 flex justify-between font-medium">
                      <span>合計:</span>
                      <span>¥{selectedProposalData.budget.reduce((sum, b) => sum + b.amount, 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* タイムライン */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">実施タイムライン</h4>
              <div className="space-y-4">
                {selectedProposalData.timeline.map((phase, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h5 className="font-medium text-gray-900">{phase.phase}</h5>
                        <span className="ml-2 text-sm text-gray-500">({phase.duration})</span>
                      </div>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {phase.actions.map((action, actionIndex) => (
                          <li key={actionIndex} className="flex items-center">
                            <Clock className="w-3 h-3 text-gray-400 mr-2" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* アクションボタン */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button className="btn btn-secondary">
                <Download className="w-4 h-4 mr-2" />
                提案書PDF出力
              </button>
              <button className="btn btn-primary">
                <Zap className="w-4 h-4 mr-2" />
                キャンペーン実行準備
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 実行優先度レコメンド */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <Zap className="w-5 h-5 mr-2 text-yellow-600" />
          AI推奨実行プライオリティ
        </h3>
        
        <div className="space-y-3">
          {aiProposals.slice(0, 3).map((proposal, index) => (
            <div key={proposal.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold ${ 
                  index === 0 ? 'bg-red-500' : index === 1 ? 'bg-orange-500' : 'bg-yellow-500'
                }`}>
                  {index + 1}
                </div>
                <div className="ml-3">
                  <div className="font-medium text-gray-900">{proposal.title}</div>
                  <div className="text-sm text-gray-600">
                    {proposal.targetCount}名対象 | 成功確度{proposal.confidence}% | ROI {proposal.expectedROI}%
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900">¥{Math.round(proposal.estimatedRevenue).toLocaleString()}</div>
                <div className="text-xs text-gray-500">{proposal.campaignPeriod}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MarketingAISuggestions