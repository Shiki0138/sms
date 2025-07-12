import React from 'react'
import { useSubscription } from '../../contexts/SubscriptionContext'
// Individual imports for better tree shaking and deployment compatibility
import Shield from 'lucide-react/dist/esm/icons/shield'
import Zap from 'lucide-react/dist/esm/icons/zap'
import Crown from 'lucide-react/dist/esm/icons/crown'
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right'
import { PLAN_NAMES } from '../../types/subscription'

interface PlanBadgeProps {
  showUpgradeButton?: boolean
  variant?: 'compact' | 'full'
  onUpgradeClick?: () => void
}

const PlanBadge: React.FC<PlanBadgeProps> = ({ 
  showUpgradeButton = true, 
  variant = 'compact',
  onUpgradeClick 
}) => {
  const { currentPlan, subscriptionInfo } = useSubscription()

  const getPlanIcon = () => {
    const icons = {
      light: Shield,
      standard: Zap,
      premium_ai: Crown
    }
    
    const IconComponent = icons[currentPlan] || Shield
    
    if (!IconComponent) {
      console.error(`Icon component is undefined for plan: ${currentPlan}`)
      return <Shield className="w-4 h-4" />
    }
    
    return <IconComponent className="w-4 h-4" />
  }

  const getPlanColor = () => {
    switch (currentPlan) {
      case 'light':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'standard':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'premium_ai':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-green-100 text-green-800 border-green-200'
    }
  }

  const getUpgradeText = () => {
    switch (currentPlan) {
      case 'light':
        return 'AI機能・分析機能を利用する'
      case 'standard':
        return '無制限機能を利用する'
      default:
        return null
    }
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center space-x-2">
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg border ${getPlanColor()}`}>
          {getPlanIcon()}
          <span className="text-xs font-medium">{PLAN_NAMES[currentPlan]}</span>
        </div>
        
        {showUpgradeButton && currentPlan !== 'premium_ai' && (
          <button
            onClick={onUpgradeClick}
            className="flex items-center space-x-1 px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <span>アップグレード</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-lg ${getPlanColor()}`}>
            {getPlanIcon()}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">
              {PLAN_NAMES[currentPlan]}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {currentPlan === 'light' && 'スタッフ3名、顧客500名まで'}
              {currentPlan === 'standard' && 'スタッフ10名、顧客2,000名、AI機能付き'}
              {currentPlan === 'premium_ai' && '無制限利用、全機能アクセス可能'}
            </p>
          </div>
        </div>
        
        {showUpgradeButton && currentPlan !== 'premium_ai' && (
          <button
            onClick={onUpgradeClick}
            className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            アップグレード
          </button>
        )}
      </div>
      
      {currentPlan !== 'premium_ai' && getUpgradeText() && (
        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>💡 ヒント:</strong> {getUpgradeText()}
          </p>
        </div>
      )}
    </div>
  )
}

export default PlanBadge