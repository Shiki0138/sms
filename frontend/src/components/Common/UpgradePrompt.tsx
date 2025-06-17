import React from 'react'
import { useSubscription } from '../../contexts/SubscriptionContext'
import { 
  Sparkles, 
  TrendingUp, 
  Users, 
  ArrowRight, 
  X,
  Clock,
  BarChart3
} from 'lucide-react'
import { PLAN_NAMES, PLAN_PRICING } from '../../types/subscription'

interface UpgradePromptProps {
  trigger: 'feature_locked' | 'usage_limit' | 'periodic_reminder'
  feature?: string
  onClose?: () => void
  onUpgrade?: () => void
  className?: string
}

const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  trigger,
  feature,
  onClose,
  onUpgrade,
  className = ''
}) => {
  const { currentPlan, subscriptionInfo } = useSubscription()

  const getPromptContent = () => {
    switch (trigger) {
      case 'feature_locked':
        return {
          title: '機能を利用するにはアップグレードが必要です',
          description: `${feature}機能は${currentPlan === 'light' ? 'スタンダードプラン' : 'AIプレミアムプラン'}以上でご利用いただけます。`,
          icon: <Sparkles className="w-8 h-8 text-blue-600" />,
          color: 'bg-blue-50 border-blue-200'
        }
      
      case 'usage_limit':
        return {
          title: '使用量の上限に達しました',
          description: '継続してご利用いただくために、プランのアップグレードをご検討ください。',
          icon: <TrendingUp className="w-8 h-8 text-orange-600" />,
          color: 'bg-orange-50 border-orange-200'
        }
      
      case 'periodic_reminder':
        return {
          title: 'ビジネスをさらに成長させませんか？',
          description: 'より高度な機能で売上向上と業務効率化を実現できます。',
          icon: <BarChart3 className="w-8 h-8 text-purple-600" />,
          color: 'bg-purple-50 border-purple-200'
        }
      
      default:
        return {
          title: 'プランをアップグレード',
          description: 'より多くの機能をご利用いただけます。',
          icon: <Sparkles className="w-8 h-8 text-blue-600" />,
          color: 'bg-blue-50 border-blue-200'
        }
    }
  }

  const getRecommendedPlan = () => {
    return currentPlan === 'light' ? 'standard' : 'premium_ai'
  }

  const getBenefits = () => {
    const recommendedPlan = getRecommendedPlan()
    
    if (recommendedPlan === 'standard') {
      return [
        { icon: <Users className="w-4 h-4" />, text: 'スタッフ10名・顧客2,000名まで' },
        { icon: <Sparkles className="w-4 h-4" />, text: 'AI返信機能（月200回）' },
        { icon: <BarChart3 className="w-4 h-4" />, text: '高度な分析・レポート機能' },
        { icon: <Clock className="w-4 h-4" />, text: '業務時間40時間/月削減' }
      ]
    } else {
      return [
        { icon: <Users className="w-4 h-4" />, text: '無制限のスタッフ・顧客登録' },
        { icon: <Sparkles className="w-4 h-4" />, text: '無制限AI機能・高度分析' },
        { icon: <BarChart3 className="w-4 h-4" />, text: 'リアルタイムダッシュボード' },
        { icon: <Clock className="w-4 h-4" />, text: '業務時間100時間/月以上削減' }
      ]
    }
  }

  const content = getPromptContent()
  const recommendedPlan = getRecommendedPlan()
  const benefits = getBenefits()

  return (
    <div className={`rounded-lg border-2 ${content.color} p-6 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {content.icon}
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">
              {content.title}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {content.description}
            </p>
          </div>
        </div>
        
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 推奨プラン */}
      <div className="bg-white rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="font-medium text-gray-900">
              推奨: {PLAN_NAMES[recommendedPlan]}
            </h4>
            <p className="text-sm text-gray-600">
              {recommendedPlan === 'standard' ? '成長ビジネスに最適' : 'エンタープライズ向け最高機能'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              ¥{PLAN_PRICING[recommendedPlan].monthly.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">/ 月</div>
          </div>
        </div>

        {/* 主要な利益 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm text-gray-700">
              <span className="text-green-600">{benefit.icon}</span>
              <span>{benefit.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ROI表示 */}
      <div className="bg-green-50 rounded-lg p-3 mb-4">
        <p className="text-sm text-green-800">
          <strong>投資対効果:</strong> 
          {recommendedPlan === 'standard' 
            ? ' 月額費用の5倍以上の価値を提供（効率化により月15万円相当の価値創出）'
            : ' 月額費用の10倍以上の価値を提供（効率化により月50万円以上の価値創出）'
          }
        </p>
      </div>

      {/* アクションボタン */}
      <div className="flex space-x-3">
        <button
          onClick={onUpgrade}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
        >
          <span>今すぐアップグレード</span>
          <ArrowRight className="w-4 h-4" />
        </button>
        
        {trigger !== 'usage_limit' && (
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            後で
          </button>
        )}
      </div>
    </div>
  )
}

export default UpgradePrompt