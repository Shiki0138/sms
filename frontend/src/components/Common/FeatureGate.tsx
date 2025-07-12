import React from 'react'
import { useSubscription } from '../../contexts/SubscriptionContext'
import { PlanFeatures } from '../../types/subscription'
// Individual imports for better tree shaking and deployment compatibility
import Lock from 'lucide-react/dist/esm/icons/lock'
import Crown from 'lucide-react/dist/esm/icons/crown'
import Zap from 'lucide-react/dist/esm/icons/zap'

interface FeatureGateProps {
  feature: keyof PlanFeatures
  children: React.ReactNode
  fallback?: React.ReactNode
  showUpgradePrompt?: boolean
  onUpgrade?: () => void
}

const FeatureGate: React.FC<FeatureGateProps> = ({
  feature,
  children,
  fallback,
  showUpgradePrompt = true,
  onUpgrade
}) => {
  const { hasFeature, currentPlan } = useSubscription()

  if (hasFeature(feature)) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  if (!showUpgradePrompt) {
    return null
  }

  const getUpgradeMessage = () => {
    switch (feature) {
      case 'aiReplyGeneration':
        return 'AI返信機能をご利用いただくには、スタンダードプラン以上へのアップグレードが必要です。'
      case 'customerAnalytics':
        return '顧客分析機能をご利用いただくには、スタンダードプラン以上へのアップグレードが必要です。'
      case 'lineIntegration':
        return 'LINE連携機能をご利用いただくには、スタンダードプラン以上へのアップグレードが必要です。'
      case 'instagramIntegration':
        return 'Instagram連携機能をご利用いただくには、スタンダードプラン以上へのアップグレードが必要です。'
      case 'csvExport':
        return 'CSVエクスポート機能をご利用いただくには、スタンダードプラン以上へのアップグレードが必要です。'
      case 'pdfExport':
        return 'PDFエクスポート機能をご利用いただくには、スタンダードプラン以上へのアップグレードが必要です。'
      case 'aiAnalytics':
        return '高度AI分析機能をご利用いただくには、AIプレミアムプランへのアップグレードが必要です。'
      case 'advancedReporting':
        return '高度なレポート機能をご利用いただくには、AIプレミアムプランへのアップグレードが必要です。'
      case 'userManagement':
        return 'ユーザー管理機能をご利用いただくには、スタンダードプラン以上へのアップグレードが必要です。'
      case 'systemSettings':
        return 'システム設定機能をご利用いただくには、スタンダードプラン以上へのアップグレードが必要です。'
      case 'customReports':
        return 'カスタムレポート機能をご利用いただくには、AIプレミアムプランへのアップグレードが必要です。'
      case 'apiAccess':
        return 'API アクセス機能をご利用いただくには、AIプレミアムプランへのアップグレードが必要です。'
      default:
        return 'この機能をご利用いただくには、プランのアップグレードが必要です。'
    }
  }

  const getRecommendedPlan = () => {
    switch (feature) {
      case 'aiReplyGeneration':
      case 'customerAnalytics':
      case 'lineIntegration':
      case 'instagramIntegration':
      case 'csvExport':
      case 'pdfExport':
      case 'userManagement':
      case 'systemSettings':
        return 'standard'
      case 'aiAnalytics':
      case 'advancedReporting':
      case 'customReports':
      case 'apiAccess':
        return 'premium_ai'
      default:
        return 'standard'
    }
  }

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'standard':
        return <Zap className="w-5 h-5 text-orange-500" />
      case 'premium_ai':
        return <Crown className="w-5 h-5 text-purple-500" />
      default:
        return <Lock className="w-5 h-5 text-gray-500" />
    }
  }

  const getPlanName = (plan: string) => {
    switch (plan) {
      case 'standard':
        return 'スタンダードプラン'
      case 'premium_ai':
        return 'AIプレミアムプラン'
      default:
        return 'アップグレード'
    }
  }

  const recommendedPlan = getRecommendedPlan()

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
      <div className="flex justify-center mb-4">
        {getPlanIcon(recommendedPlan)}
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        機能制限
      </h3>
      
      <p className="text-gray-600 mb-4 text-sm">
        {getUpgradeMessage()}
      </p>
      
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-center space-x-2 mb-2">
          {getPlanIcon(recommendedPlan)}
          <span className="font-semibold text-gray-900">
            {getPlanName(recommendedPlan)}
          </span>
        </div>
        
        <div className="text-sm text-gray-600">
          {recommendedPlan === 'standard' && (
            <div>
              <div className="font-medium">月額 ¥28,000</div>
              <div className="text-xs text-gray-500 mt-1">
                AI機能・分析・マーケティング・外部連携
              </div>
            </div>
          )}
          
          {recommendedPlan === 'premium_ai' && (
            <div>
              <div className="font-medium">月額 ¥55,000</div>
              <div className="text-xs text-gray-500 mt-1">
                全機能・無制限AI・高度分析・24時間サポート
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <button 
          onClick={onUpgrade}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          プランをアップグレード
        </button>
        
        <button 
          onClick={onUpgrade}
          className="w-full text-blue-600 hover:text-blue-700 text-sm"
        >
          詳細を確認する
        </button>
      </div>
    </div>
  )
}

export default FeatureGate