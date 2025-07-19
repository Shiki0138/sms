import React, { useState } from 'react'
import { useSubscription } from '../../contexts/SubscriptionContext'
import { PLAN_NAMES, PLAN_PRICING, SubscriptionPlan } from '../../types/subscription'
import { Check, Crown, Zap, Shield, AlertTriangle, CreditCard, Calendar } from 'lucide-react'

const SubscriptionManagement: React.FC = () => {
  const { subscriptionInfo, currentPlan, limits, features, upgradePlan } = useSubscription()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(currentPlan)
  const [isUpgrading, setIsUpgrading] = useState(false)

  const getPlanIcon = (plan: SubscriptionPlan) => {
    switch (plan) {
      case 'light':
        return <Shield className="w-6 h-6 text-green-500" />
      case 'standard':
        return <Zap className="w-6 h-6 text-orange-500" />
      case 'premium_ai':
        return <Crown className="w-6 h-6 text-purple-500" />
    }
  }

  const getUsageColor = (current: number, max: number) => {
    if (max === -1) return 'text-green-600'
    const percentage = (current / max) * 100
    if (percentage >= 90) return 'text-red-600'
    if (percentage >= 70) return 'text-yellow-600'
    return 'text-green-600'
  }

  const handleUpgrade = async () => {
    if (selectedPlan === currentPlan) return
    
    setIsUpgrading(true)
    try {
      const success = await upgradePlan(selectedPlan)
      if (success) {
        setShowUpgradeModal(false)
        // 成功通知
      }
    } catch (error) {
      console.error('アップグレードに失敗:', error)
    } finally {
      setIsUpgrading(false)
    }
  }

  if (!subscriptionInfo) {
    return <div>読み込み中...</div>
  }

  return (
    <div className="space-y-6">
      {/* 現在のプラン情報 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            {getPlanIcon(currentPlan)}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {PLAN_NAMES[currentPlan]}
              </h2>
              <p className="text-gray-600">
                現在のご契約プラン
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              ¥{PLAN_PRICING[currentPlan].monthly.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">/ 月</div>
          </div>
        </div>

        {/* 利用状況 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">スタッフ</span>
              <span className={`text-sm font-bold ${getUsageColor(subscriptionInfo.currentUsage.staffCount, limits.maxStaff)}`}>
                {subscriptionInfo.currentUsage.staffCount}
                {limits.maxStaff === -1 ? ' / 無制限' : ` / ${limits.maxStaff}`}
              </span>
            </div>
            {limits.maxStaff !== -1 && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    (subscriptionInfo.currentUsage.staffCount / limits.maxStaff) >= 0.9 ? 'bg-red-500' :
                    (subscriptionInfo.currentUsage.staffCount / limits.maxStaff) >= 0.7 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(100, (subscriptionInfo.currentUsage.staffCount / limits.maxStaff) * 100)}%` }}
                />
              </div>
            )}
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">顧客</span>
              <span className={`text-sm font-bold ${getUsageColor(subscriptionInfo.currentUsage.customerCount, limits.maxCustomers)}`}>
                {subscriptionInfo.currentUsage.customerCount}
                {limits.maxCustomers === -1 ? ' / 無制限' : ` / ${limits.maxCustomers}`}
              </span>
            </div>
            {limits.maxCustomers !== -1 && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    (subscriptionInfo.currentUsage.customerCount / limits.maxCustomers) >= 0.9 ? 'bg-red-500' :
                    (subscriptionInfo.currentUsage.customerCount / limits.maxCustomers) >= 0.7 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(100, (subscriptionInfo.currentUsage.customerCount / limits.maxCustomers) * 100)}%` }}
                />
              </div>
            )}
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">AI返信</span>
              <span className={`text-sm font-bold ${getUsageColor(subscriptionInfo.currentUsage.aiRepliesThisMonth, limits.maxAIRepliesPerMonth)}`}>
                {subscriptionInfo.currentUsage.aiRepliesThisMonth}
                {limits.maxAIRepliesPerMonth === -1 ? ' / 無制限' : ` / ${limits.maxAIRepliesPerMonth}`}
              </span>
            </div>
            {limits.maxAIRepliesPerMonth !== -1 && limits.maxAIRepliesPerMonth > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    (subscriptionInfo.currentUsage.aiRepliesThisMonth / limits.maxAIRepliesPerMonth) >= 0.9 ? 'bg-red-500' :
                    (subscriptionInfo.currentUsage.aiRepliesThisMonth / limits.maxAIRepliesPerMonth) >= 0.7 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(100, (subscriptionInfo.currentUsage.aiRepliesThisMonth / limits.maxAIRepliesPerMonth) * 100)}%` }}
                />
              </div>
            )}
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">エクスポート</span>
              <span className={`text-sm font-bold ${getUsageColor(subscriptionInfo.currentUsage.dataExportsThisMonth, limits.maxDataExport)}`}>
                {subscriptionInfo.currentUsage.dataExportsThisMonth}
                {limits.maxDataExport === -1 ? ' / 無制限' : ` / ${limits.maxDataExport}`}
              </span>
            </div>
            {limits.maxDataExport !== -1 && limits.maxDataExport > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    (subscriptionInfo.currentUsage.dataExportsThisMonth / limits.maxDataExport) >= 0.9 ? 'bg-red-500' :
                    (subscriptionInfo.currentUsage.dataExportsThisMonth / limits.maxDataExport) >= 0.7 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(100, (subscriptionInfo.currentUsage.dataExportsThisMonth / limits.maxDataExport) * 100)}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* 請求情報 */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                次回請求日: {new Date(subscriptionInfo.nextBillingDate).toLocaleDateString('ja-JP')}
              </span>
            </div>
            
            <div className="flex space-x-2">
              {/* デモ用：クイックプラン切り替え */}
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                {(['light', 'standard', 'premium_ai'] as SubscriptionPlan[]).map((plan) => (
                  <button
                    key={plan}
                    onClick={() => upgradePlan(plan)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      currentPlan === plan 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {plan === 'light' ? 'ライト' : plan === 'standard' ? 'スタンダード' : 'AI'}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                詳細変更
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 機能一覧 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">利用可能な機能</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(features).map(([feature, enabled]) => (
            <div key={feature} className="flex items-center space-x-2">
              {enabled ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-gray-400" />
              )}
              <span className={`text-sm ${enabled ? 'text-gray-900' : 'text-gray-500'}`}>
                {getFeatureName(feature)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* アップグレードモーダル */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-96 overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">プラン変更</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {(['light', 'standard', 'premium_ai'] as SubscriptionPlan[]).map((plan) => (
                <div 
                  key={plan}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedPlan === plan 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedPlan(plan)}
                >
                  <div className="flex items-center space-x-2 mb-3">
                    {getPlanIcon(plan)}
                    <h3 className="font-semibold text-gray-900">{PLAN_NAMES[plan]}</h3>
                  </div>
                  
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    ¥{PLAN_PRICING[plan].monthly.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 mb-4">/ 月</div>
                  
                  <div className="text-xs text-gray-600">
                    初期費用: ¥{PLAN_PRICING[plan].setup.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleUpgrade}
                disabled={isUpgrading || selectedPlan === currentPlan}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpgrading ? '変更中...' : 'プランを変更'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const getFeatureName = (feature: string): string => {
  const featureNames: Record<string, string> = {
    reservationManagement: '予約管理',
    customerManagement: '顧客管理',
    messageManagement: 'メッセージ管理',
    calendarView: 'カレンダー表示',
    basicReporting: '基本レポート',
    aiReplyGeneration: 'AI返信生成',
    aiAnalytics: 'AI分析',
    customerAnalytics: '顧客分析',
    revenueAnalytics: '売上分析',
    performanceAnalytics: 'パフォーマンス分析',
    advancedReporting: '高度なレポート',
    lineIntegration: 'LINE連携',
    instagramIntegration: 'Instagram連携',
    csvExport: 'CSVエクスポート',
    pdfExport: 'PDFエクスポート',
    userManagement: 'ユーザー管理',
    systemSettings: 'システム設定',
    backupSettings: 'バックアップ設定',
    notificationSettings: '通知設定',
    customReports: 'カスタムレポート',
    apiAccess: 'API アクセス'
  }
  
  return featureNames[feature] || feature
}

export default SubscriptionManagement