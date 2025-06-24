import React, { useState } from 'react'
import { useSubscription } from '../../contexts/SubscriptionContext'
import { PLAN_NAMES, PLAN_PRICING, SubscriptionPlan, PLAN_CONFIGS } from '../../types/subscription'
import PaymentForm from '../Payment/PaymentForm'
import FeatureComparison from './FeatureComparison'
import { 
  Shield, 
  Zap, 
  Crown, 
  Check, 
  X, 
  TrendingUp,
  Users,
  Brain,
  BarChart3,
  MessageSquare,
  Download,
  Sparkles,
  Clock,
  CreditCard,
  ArrowRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

const UpgradePlan: React.FC = () => {
  const { currentPlan, upgradePlan, subscriptionInfo } = useSubscription()
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [showDetailedComparison, setShowDetailedComparison] = useState(false)

  const plans: SubscriptionPlan[] = ['light', 'standard', 'premium_ai']

  const getPlanIcon = (plan: SubscriptionPlan) => {
    switch (plan) {
      case 'light':
        return <Shield className="w-8 h-8" />
      case 'standard':
        return <Zap className="w-8 h-8" />
      case 'premium_ai':
        return <Crown className="w-8 h-8" />
    }
  }

  const getPlanColor = (plan: SubscriptionPlan) => {
    switch (plan) {
      case 'light':
        return 'text-green-600 bg-green-100'
      case 'standard':
        return 'text-orange-600 bg-orange-100'
      case 'premium_ai':
        return 'text-purple-600 bg-purple-100'
    }
  }

  const getFeatureIcon = (feature: string) => {
    const icons: Record<string, React.ReactNode> = {
      staff: <Users className="w-4 h-4" />,
      customers: <Users className="w-4 h-4" />,
      ai: <Brain className="w-4 h-4" />,
      analytics: <BarChart3 className="w-4 h-4" />,
      messaging: <MessageSquare className="w-4 h-4" />,
      export: <Download className="w-4 h-4" />,
      realtime: <Clock className="w-4 h-4" />,
      premium: <Sparkles className="w-4 h-4" />
    }
    return icons[feature] || null
  }

  const planFeatures = {
    light: [
      { icon: 'staff', text: 'スタッフ3名まで', included: true },
      { icon: 'customers', text: '顧客500名まで', included: true },
      { icon: 'messaging', text: '基本メッセージ管理', included: true },
      { icon: 'export', text: 'CSVエクスポート（月3回）', included: true },
      { icon: 'ai', text: 'AI機能', included: false },
      { icon: 'analytics', text: '高度な分析', included: false },
      { icon: 'realtime', text: 'リアルタイムダッシュボード', included: false }
    ],
    standard: [
      { icon: 'staff', text: 'スタッフ10名まで', included: true },
      { icon: 'customers', text: '顧客2,000名まで', included: true },
      { icon: 'ai', text: 'AI返信機能（月200回）', included: true },
      { icon: 'analytics', text: '顧客分析・売上分析', included: true },
      { icon: 'messaging', text: 'LINE/Instagram連携', included: true },
      { icon: 'export', text: '無制限エクスポート', included: true },
      { icon: 'realtime', text: 'リアルタイムダッシュボード', included: false }
    ],
    premium_ai: [
      { icon: 'staff', text: '無制限スタッフ', included: true },
      { icon: 'customers', text: '無制限顧客', included: true },
      { icon: 'ai', text: '無制限AI機能', included: true },
      { icon: 'analytics', text: '高度AI分析・予測', included: true },
      { icon: 'messaging', text: '全チャネル統合', included: true },
      { icon: 'export', text: '無制限エクスポート', included: true },
      { icon: 'realtime', text: 'リアルタイムダッシュボード', included: true },
      { icon: 'premium', text: '優先サポート・API アクセス', included: true }
    ]
  }

  const handleUpgrade = async () => {
    if (!selectedPlan || selectedPlan === currentPlan) return

    setIsProcessing(true)
    try {
      // 実際の実装では、ここで決済処理を行う
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const success = await upgradePlan(selectedPlan)
      if (success) {
        // 成功通知
        alert(`${PLAN_NAMES[selectedPlan]}へのアップグレードが完了しました！`)
        setSelectedPlan(null)
        setShowPaymentForm(false)
      }
    } catch (error) {
      console.error('アップグレードエラー:', error)
      alert('アップグレードに失敗しました。もう一度お試しください。')
    } finally {
      setIsProcessing(false)
    }
  }

  const calculateSavings = (plan: SubscriptionPlan) => {
    if (plan === 'standard' && currentPlan === 'light') {
      return {
        aiCost: 200 * 500, // AI返信200回分の価値
        analyticsCost: 50000, // 分析ツールの価値
        total: 150000
      }
    }
    if (plan === 'premium_ai') {
      return {
        aiCost: -1, // 無制限
        analyticsCost: 200000, // 高度分析の価値
        total: 500000
      }
    }
    return null
  }

  const handlePaymentSuccess = () => {
    setShowPaymentForm(false)
    setSelectedPlan(null)
    // アップグレード成功の通知
    alert(`${PLAN_NAMES[selectedPlan!]}へのアップグレードが完了しました！`)
  }

  const handlePaymentCancel = () => {
    setShowPaymentForm(false)
  }

  // 決済フォーム表示時
  if (showPaymentForm && selectedPlan) {
    return (
      <PaymentForm
        selectedPlan={selectedPlan}
        onSuccess={handlePaymentSuccess}
        onCancel={handlePaymentCancel}
      />
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* ヘッダー */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          プランをアップグレード
        </h1>
        <p className="text-gray-600">
          ビジネスの成長に合わせて、より高度な機能をご利用いただけます
        </p>
      </div>

      {/* 現在のプラン */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${getPlanColor(currentPlan)}`}>
              {getPlanIcon(currentPlan)}
            </div>
            <div>
              <p className="text-sm text-blue-700">現在のプラン</p>
              <p className="font-semibold text-blue-900">{PLAN_NAMES[currentPlan]}</p>
            </div>
          </div>
          <div className="text-right">
            {PLAN_PRICING[currentPlan].originalPrice && (
              <p className="text-sm text-blue-600 line-through">
                ¥{PLAN_PRICING[currentPlan].originalPrice.toLocaleString()}
              </p>
            )}
            <p className="text-2xl font-bold text-blue-900">
              ¥{PLAN_PRICING[currentPlan].monthly.toLocaleString()}
            </p>
            <p className="text-sm text-blue-700">/ 月</p>
          </div>
        </div>
      </div>

      {/* プラン比較 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {plans.map((plan) => {
          const isCurrentPlan = plan === currentPlan
          const isDowngrade = plans.indexOf(plan) < plans.indexOf(currentPlan)
          const isSelected = plan === selectedPlan

          return (
            <div
              key={plan}
              className={`relative bg-white rounded-lg border-2 transition-all ${
                isSelected 
                  ? 'border-blue-500 shadow-xl' 
                  : isCurrentPlan
                  ? 'border-gray-300'
                  : 'border-gray-200 hover:border-gray-300'
              } ${isDowngrade ? 'opacity-50' : ''}`}
            >
              {/* 人気バッジ */}
              {plan === 'standard' && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    人気No.1
                  </span>
                </div>
              )}

              <div className="p-6">
                {/* プランヘッダー */}
                <div className="text-center mb-6">
                  <div className={`inline-flex p-3 rounded-lg mb-3 ${getPlanColor(plan)}`}>
                    {getPlanIcon(plan)}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {PLAN_NAMES[plan]}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {plan === 'light' && '基本機能で始める'}
                    {plan === 'standard' && '成長ビジネスに最適'}
                    {plan === 'premium_ai' && 'エンタープライズ向け'}
                  </p>
                </div>

                {/* 価格 */}
                <div className="text-center mb-6">
                  {/* 元の価格（見え消し） */}
                  {PLAN_PRICING[plan].originalPrice && (
                    <div className="text-lg text-gray-500 line-through mb-1">
                      ¥{PLAN_PRICING[plan].originalPrice.toLocaleString()}
                    </div>
                  )}
                  {/* 現在の価格 */}
                  <div className="text-3xl font-bold text-red-600">
                    ¥{PLAN_PRICING[plan].monthly.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">/ 月</div>
                  {/* 割引率表示 */}
                  {PLAN_PRICING[plan].originalPrice && (
                    <div className="mt-1 inline-flex items-center bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
                      {Math.round((1 - PLAN_PRICING[plan].monthly / PLAN_PRICING[plan].originalPrice) * 100)}% OFF
                    </div>
                  )}
                  {!isCurrentPlan && !isDowngrade && (
                    <div className="mt-2 text-sm text-green-600 font-medium">
                      初期費用: ¥{PLAN_PRICING[plan].setup.toLocaleString()}
                    </div>
                  )}
                </div>

                {/* 機能リスト */}
                <div className="space-y-3 mb-6">
                  {planFeatures[plan].map((feature, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className={`mt-0.5 ${
                        feature.included ? 'text-green-500' : 'text-gray-400'
                      }`}>
                        {feature.included ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex items-center space-x-1 flex-1">
                        <span className="text-gray-400">
                          {getFeatureIcon(feature.icon)}
                        </span>
                        <span className={`text-sm ${
                          feature.included ? 'text-gray-700' : 'text-gray-400'
                        }`}>
                          {feature.text}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* アクションボタン */}
                {isCurrentPlan ? (
                  <button
                    disabled
                    className="w-full py-2 px-4 bg-gray-100 text-gray-500 rounded-lg font-medium cursor-not-allowed"
                  >
                    現在のプラン
                  </button>
                ) : isDowngrade ? (
                  <button
                    disabled
                    className="w-full py-2 px-4 bg-gray-100 text-gray-500 rounded-lg font-medium cursor-not-allowed"
                  >
                    ダウングレード不可
                  </button>
                ) : (
                  <button
                    onClick={() => setSelectedPlan(plan)}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {isSelected ? '選択中' : 'このプランを選択'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* 詳細比較表の表示/非表示ボタン */}
      <div className="mb-8">
        <button
          onClick={() => setShowDetailedComparison(!showDetailedComparison)}
          className="w-full bg-white rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
        >
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            <span className="font-medium text-gray-900">
              全機能の詳細比較を見る
            </span>
            <span className="text-sm text-gray-500">
              （各プランで利用可能な機能を確認）
            </span>
          </div>
          {showDetailedComparison ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
      </div>

      {/* 詳細機能比較表 */}
      {showDetailedComparison && (
        <div className="mb-8">
          <FeatureComparison currentPlan={currentPlan} />
        </div>
      )}

      {/* アップグレードの理由 */}
      {selectedPlan && selectedPlan !== currentPlan && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {PLAN_NAMES[selectedPlan]}にアップグレードする理由
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <TrendingUp className="w-6 h-6 text-blue-600 mb-2" />
              <h4 className="font-medium text-gray-900 mb-1">売上向上</h4>
              <p className="text-sm text-gray-600">
                {selectedPlan === 'standard' && 'AI機能で顧客対応を効率化し、売上20%向上'}
                {selectedPlan === 'premium_ai' && '高度分析で売上を最大50%向上'}
              </p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <Clock className="w-6 h-6 text-green-600 mb-2" />
              <h4 className="font-medium text-gray-900 mb-1">時間削減</h4>
              <p className="text-sm text-gray-600">
                {selectedPlan === 'standard' && '業務時間を月40時間削減'}
                {selectedPlan === 'premium_ai' && '業務時間を月100時間以上削減'}
              </p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <Sparkles className="w-6 h-6 text-purple-600 mb-2" />
              <h4 className="font-medium text-gray-900 mb-1">顧客満足度</h4>
              <p className="text-sm text-gray-600">
                {selectedPlan === 'standard' && '顧客満足度15%向上'}
                {selectedPlan === 'premium_ai' && '顧客満足度30%以上向上'}
              </p>
            </div>
          </div>

          {/* ROI計算 */}
          {calculateSavings(selectedPlan) && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">期待されるROI</h4>
              <p className="text-sm text-gray-600 mb-2">
                {selectedPlan === 'standard' && 
                  '月額費用の5倍以上の価値を提供。AI機能と分析機能により、売上向上と業務効率化を実現。'
                }
                {selectedPlan === 'premium_ai' && 
                  '月額費用の10倍以上の価値を提供。無制限のAI機能と高度な分析により、ビジネスを大きく成長させます。'
                }
              </p>
              <div className="text-2xl font-bold text-green-600">
                {calculateSavings(selectedPlan)!.total === -1 
                  ? '無限の価値' 
                  : `月間 ¥${calculateSavings(selectedPlan)!.total.toLocaleString()} 相当の価値`
                }
              </div>
            </div>
          )}
        </div>
      )}

      {/* アップグレードボタン */}
      {selectedPlan && selectedPlan !== currentPlan && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                アップグレードの確認
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {PLAN_NAMES[currentPlan]} → {PLAN_NAMES[selectedPlan]}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">月額料金の差額</p>
              <p className="text-2xl font-bold text-gray-900">
                +¥{(PLAN_PRICING[selectedPlan].monthly - PLAN_PRICING[currentPlan].monthly).toLocaleString()}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowPaymentForm(true)}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <CreditCard className="w-5 h-5" />
            <span>決済情報を入力してアップグレード</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  )
}

export default UpgradePlan