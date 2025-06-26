import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useSubscription } from '../../contexts/SubscriptionContext'
import { PlanLimits } from '../../types/subscription'
import { AlertTriangle, TrendingUp, Users, MessageSquare, Download } from 'lucide-react'

interface LimitWarningProps {
  limitType: keyof PlanLimits
  currentValue: number
  warningThreshold?: number // 警告を表示する閾値（デフォルト80%）
  className?: string
}

const LimitWarning: React.FC<LimitWarningProps> = ({
  limitType,
  currentValue,
  warningThreshold = 0.8,
  className = ''
}) => {
  const { limits, getRemainingLimit, isWithinLimit } = useSubscription()
  const navigate = useNavigate()

  const limit = limits[limitType]
  const remaining = getRemainingLimit(limitType, currentValue)
  const withinLimit = isWithinLimit(limitType, currentValue)

  // 無制限の場合は何も表示しない
  if (typeof limit === 'number' && limit === -1) {
    return null
  }

  // 制限内で警告閾値に達していない場合は何も表示しない
  if (withinLimit && remaining !== null && remaining > (limit as number) * (1 - warningThreshold)) {
    return null
  }

  const getIcon = () => {
    switch (limitType) {
      case 'maxStaff':
        return <Users className="w-4 h-4" />
      case 'maxCustomers':
        return <TrendingUp className="w-4 h-4" />
      case 'maxAIRepliesPerMonth':
        return <MessageSquare className="w-4 h-4" />
      case 'maxDataExport':
        return <Download className="w-4 h-4" />
      default:
        return <AlertTriangle className="w-4 h-4" />
    }
  }

  const getTitle = () => {
    switch (limitType) {
      case 'maxStaff':
        return 'スタッフ登録数'
      case 'maxCustomers':
        return '顧客登録数'
      case 'maxAIRepliesPerMonth':
        return 'AI返信使用数'
      case 'maxDataExport':
        return 'データエクスポート回数'
      default:
        return '利用制限'
    }
  }

  const getMessage = () => {
    if (!withinLimit) {
      switch (limitType) {
        case 'maxStaff':
          return `スタッフ登録数が上限（${limit}名）に達しています。新しいスタッフを追加するにはプランのアップグレードが必要です。`
        case 'maxCustomers':
          return `顧客登録数が上限（${limit}件）に達しています。新しい顧客を追加するにはプランのアップグレードが必要です。`
        case 'maxAIRepliesPerMonth':
          return `AI返信の月間利用回数が上限（${limit}回）に達しています。追加利用するにはプランのアップグレードが必要です。`
        case 'maxDataExport':
          return `データエクスポートの月間利用回数が上限（${limit}回）に達しています。追加利用するにはプランのアップグレードが必要です。`
        default:
          return '利用上限に達しています。プランのアップグレードをご検討ください。'
      }
    }

    // 警告段階
    const usagePercentage = Math.round(((currentValue / (limit as number)) * 100))
    return `利用量が${usagePercentage}%に達しています。残り${remaining}回です。`
  }

  const getColor = () => {
    if (!withinLimit) {
      return {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-800',
        icon: 'text-red-500'
      }
    }

    return {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: 'text-yellow-500'
    }
  }

  const colors = getColor()

  return (
    <div className={`${colors.bg} ${colors.border} border rounded-lg p-3 ${className}`}>
      <div className="flex items-start space-x-3">
        <div className={`${colors.icon} mt-0.5`}>
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className={`font-medium ${colors.text} text-sm`}>
            {getTitle()}
          </div>
          
          <div className={`${colors.text} text-xs mt-1`}>
            {getMessage()}
          </div>
          
          {/* 使用量バー */}
          <div className="mt-2">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>{currentValue}</span>
              <span>{limit === -1 ? '無制限' : limit}</span>
            </div>
            
            {limit !== -1 && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    !withinLimit ? 'bg-red-500' : 'bg-yellow-500'
                  }`}
                  style={{ 
                    width: `${Math.min(100, (currentValue / (limit as number)) * 100)}%` 
                  }}
                />
              </div>
            )}
          </div>
          
          {!withinLimit && (
            <div className="mt-3">
              <button 
                onClick={() => navigate('/settings/upgrade')}
                className="text-xs bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors"
              >
                プランをアップグレード
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LimitWarning