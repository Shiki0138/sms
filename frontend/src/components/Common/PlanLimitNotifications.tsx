import React from 'react'
import { useSubscription } from '../../contexts/SubscriptionContext'
import LimitWarning from './LimitWarning'

interface PlanLimitNotificationsProps {
  onUpgradeClick?: () => void
}

const PlanLimitNotifications: React.FC<PlanLimitNotificationsProps> = ({ onUpgradeClick }) => {
  const { subscriptionInfo } = useSubscription()

  if (!subscriptionInfo) return null

  const { currentUsage } = subscriptionInfo

  return (
    <div className="space-y-3">
      {/* 顧客数制限警告 */}
      <LimitWarning 
        limitType="maxCustomers"
        currentValue={currentUsage.customerCount}
        warningThreshold={0.8}
        onUpgradeClick={onUpgradeClick}
      />
      
      {/* スタッフ数制限警告 */}
      <LimitWarning 
        limitType="maxStaff"
        currentValue={currentUsage.staffCount}
        warningThreshold={0.8}
        onUpgradeClick={onUpgradeClick}
      />
      
      {/* AI返信数制限警告 */}
      <LimitWarning 
        limitType="maxAIRepliesPerMonth"
        currentValue={currentUsage.aiRepliesThisMonth}
        warningThreshold={0.8}
        onUpgradeClick={onUpgradeClick}
      />
      
      {/* エクスポート数制限警告 */}
      <LimitWarning 
        limitType="maxDataExport"
        currentValue={currentUsage.dataExportsThisMonth}
        warningThreshold={0.8}
        onUpgradeClick={onUpgradeClick}
      />
    </div>
  )
}

export default PlanLimitNotifications